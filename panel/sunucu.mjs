// ============================================================
//  TAVACI MEHMET - YÖNETİM PANELİ SUNUCUSU
//  Tamamen bağımsız: veri panel/veri/*.json içinde (sende),
//  fotoğraflar public/yuklenenler/ içinde. Dış servis yok.
//
//  Çalıştırma:  npm run panel   (kök klasörden)
//  Giriş:       http://localhost:5174  (şifre: panel/.env)
// ============================================================

import express from "express";
import session from "express-session";
import multer from "multer";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, copyFileSync, rmSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { exec } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const KOK = join(__dirname, ".."); // proje kökü
const VERI = join(__dirname, "veri"); // JSON klasörü
const YUKLEME = join(KOK, "public", "yuklenenler"); // fotoğraf klasörü

const YEDEK = join(__dirname, "yedekler"); // otomatik yedekler

mkdirSync(VERI, { recursive: true });
mkdirSync(YUKLEME, { recursive: true });
mkdirSync(YEDEK, { recursive: true });

// --- OTOMATİK YEDEK: kayıttan önce tüm veriyi anlık görüntüle ---
let sonYedek = 0;
function yedekAl() {
  const simdi = Date.now();
  if (simdi - sonYedek < 30000) return; // en fazla 30 sn'de bir yedek
  sonYedek = simdi;
  const klasor = join(YEDEK, String(simdi));
  mkdirSync(klasor, { recursive: true });
  for (const dosya of readdirSync(VERI)) {
    if (dosya.endsWith(".json")) copyFileSync(join(VERI, dosya), join(klasor, dosya));
  }
  // Yalnızca son 30 yedeği tut (disk şişmesin)
  const hepsi = readdirSync(YEDEK).filter((d) => /^\d+$/.test(d)).sort((a, b) => Number(b) - Number(a));
  for (const eski of hepsi.slice(30)) rmSync(join(YEDEK, eski), { recursive: true, force: true });
}

const SIFRE = process.env.ADMIN_SIFRE || "tavaci123";
const PORT = process.env.PANEL_PORT || 5174;

// --- JSON oku/yaz yardımcıları ---
// Nesne döndüren dosyalar (geri kalanı dizi)
const NESNE = ["ayarlar", "metinler", "tema", "anasayfa", "hakkimizda"];
const oku = (ad) => {
  try { return JSON.parse(readFileSync(join(VERI, `${ad}.json`), "utf8")); }
  catch { return NESNE.includes(ad) ? {} : []; }
};
const yaz = (ad, veri) => {
  yedekAl(); // değişiklikten önce yedek al (geri alınabilsin)
  writeFileSync(join(VERI, `${ad}.json`), JSON.stringify(veri, null, 2) + "\n", "utf8");
};

// Basit benzersiz id
const yeniId = (onek) => `${onek}${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;

const app = express();
app.use(express.json({ limit: "5mb" }));
app.use(
  session({
    secret: "tavaci-panel-" + (process.env.OTURUM_ANAHTARI || "gizli-anahtar"),
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8 }, // 8 saat
  })
);

// Yüklenen fotoğrafları panelde önizleyebilmek için
app.use("/yuklenenler", express.static(YUKLEME));
// Admin arayüzü (genel klasör)
app.use(express.static(join(__dirname, "genel")));

// --- Giriş kontrolü ---
function girisGerek(req, res, next) {
  if (req.session?.girisli) return next();
  return res.status(401).json({ hata: "Giriş gerekli" });
}

app.post("/giris", (req, res) => {
  if (req.body?.sifre === SIFRE) {
    req.session.girisli = true;
    return res.json({ ok: true });
  }
  res.status(401).json({ hata: "Şifre yanlış" });
});

app.post("/cikis", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get("/durum", (req, res) => res.json({ girisli: !!req.session?.girisli }));

// --- Tüm veriyi getir (arayüz için) ---
app.get("/api/veri", girisGerek, (req, res) => {
  res.json({
    kategoriler: oku("kategoriler"),
    urunler: oku("urunler"),
    subeler: oku("subeler"),
    ayarlar: oku("ayarlar"),
    metinler: oku("metinler"), // sayfa yazıları (tr/en)
    tema: oku("tema"), // renkler
    anasayfa: oku("anasayfa"), // hero slaytları, bölüm görünürlüğü
    hakkimizda: oku("hakkimizda"), // istatistikler + değerler
  });
});

// --- KATEGORİ kaydet (yeni veya güncelle) ---
app.post("/api/kategori", girisGerek, (req, res) => {
  const liste = oku("kategoriler");
  let k = req.body;
  if (!k.id) { k.id = yeniId("k"); liste.push(k); }
  else { const i = liste.findIndex((x) => x.id === k.id); if (i >= 0) liste[i] = k; else liste.push(k); }
  yaz("kategoriler", liste);
  res.json({ ok: true, id: k.id });
});

app.delete("/api/kategori/:id", girisGerek, (req, res) => {
  yaz("kategoriler", oku("kategoriler").filter((x) => x.id !== req.params.id));
  // O kategorinin ürünlerini de sil
  yaz("urunler", oku("urunler").filter((u) => u.kategoriId !== req.params.id));
  res.json({ ok: true });
});

// --- ÜRÜN kaydet ---
app.post("/api/urun", girisGerek, (req, res) => {
  const liste = oku("urunler");
  let u = req.body;
  if (!u.id) { u.id = yeniId("u"); liste.push(u); }
  else { const i = liste.findIndex((x) => x.id === u.id); if (i >= 0) liste[i] = u; else liste.push(u); }
  yaz("urunler", liste);
  res.json({ ok: true, id: u.id });
});

app.delete("/api/urun/:id", girisGerek, (req, res) => {
  yaz("urunler", oku("urunler").filter((x) => x.id !== req.params.id));
  res.json({ ok: true });
});

// --- ŞUBE kaydet ---
app.post("/api/sube", girisGerek, (req, res) => {
  const liste = oku("subeler");
  let s = req.body;
  if (!s.id) { s.id = yeniId("s"); liste.push(s); }
  else { const i = liste.findIndex((x) => x.id === s.id); if (i >= 0) liste[i] = s; else liste.push(s); }
  yaz("subeler", liste);
  res.json({ ok: true, id: s.id });
});

app.delete("/api/sube/:id", girisGerek, (req, res) => {
  yaz("subeler", oku("subeler").filter((x) => x.id !== req.params.id));
  res.json({ ok: true });
});

// --- AYARLAR kaydet ---
app.post("/api/ayarlar", girisGerek, (req, res) => {
  yaz("ayarlar", req.body || {});
  res.json({ ok: true });
});

// --- SAYFA YAZILARI kaydet ---
app.post("/api/metinler", girisGerek, (req, res) => {
  yaz("metinler", req.body || { tr: {}, en: {} });
  res.json({ ok: true });
});

// --- TEMA (renkler) kaydet ---
app.post("/api/tema", girisGerek, (req, res) => {
  yaz("tema", req.body || {});
  res.json({ ok: true });
});

// --- ANASAYFA kaydet (hero slaytları, görünürlük, panel görselleri) ---
app.post("/api/anasayfa", girisGerek, (req, res) => {
  yaz("anasayfa", req.body || {});
  res.json({ ok: true });
});

// --- HAKKIMIZDA kaydet (istatistikler + değerler) ---
app.post("/api/hakkimizda", girisGerek, (req, res) => {
  yaz("hakkimizda", req.body || {});
  res.json({ ok: true });
});

// --- FOTOĞRAF yükle ---
const depo = multer.diskStorage({
  destination: YUKLEME,
  filename: (req, file, cb) => cb(null, yeniId("img") + extname(file.originalname).toLowerCase()),
});
const yukle = multer({ storage: depo, limits: { fileSize: 8 * 1024 * 1024 } });

app.post("/api/gorsel", girisGerek, yukle.single("dosya"), (req, res) => {
  if (!req.file) return res.status(400).json({ hata: "Dosya yok" });
  res.json({ yol: `/yuklenenler/${req.file.filename}` });
});

// --- LOGO yükle (public/logo.png üzerine yazar) ---
const logoDepo = multer.diskStorage({
  destination: join(KOK, "public"),
  filename: (req, file, cb) => cb(null, "logo.png"),
});
const logoYukle = multer({ storage: logoDepo, limits: { fileSize: 8 * 1024 * 1024 } });

app.post("/api/logo", girisGerek, logoYukle.single("dosya"), (req, res) => {
  if (!req.file) return res.status(400).json({ hata: "Dosya yok" });
  res.json({ ok: true, yol: `/logo.png?${Date.now()}` });
});

// --- OTOMATİK ÇEVİRİ (TR -> EN) ---
// Tarayıcıdan doğrudan çağrılınca CORS engeli olur; sunucu üzerinden geçiyoruz.
app.post("/api/cevir", girisGerek, async (req, res) => {
  const metin = (req.body?.metin || "").trim();
  if (!metin) return res.json({ en: "" });
  try {
    const url =
      "https://translate.googleapis.com/translate_a/single?client=gtx&sl=tr&tl=en&dt=t&q=" +
      encodeURIComponent(metin);
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const j = await r.json();
    const en = (j[0] || []).map((s) => s[0]).join("");
    res.json({ en });
  } catch (e) {
    res.status(500).json({ hata: e.message });
  }
});

// --- KULLANILMAYAN GÖRSELLERİ TEMİZLE ---
app.post("/api/gorsel-temizle", girisGerek, (req, res) => {
  // Tüm veri dosyalarındaki /yuklenenler/ referanslarını topla
  const referanslar = new Set();
  for (const dosya of readdirSync(VERI)) {
    if (!dosya.endsWith(".json")) continue;
    const icerik = readFileSync(join(VERI, dosya), "utf8");
    for (const r of icerik.match(/\/yuklenenler\/[A-Za-z0-9._-]+/g) || []) {
      referanslar.add(r.replace("/yuklenenler/", ""));
    }
  }
  // Hiçbir yerde kullanılmayan yüklenmiş görselleri sil
  let silinen = 0;
  for (const dosya of readdirSync(YUKLEME)) {
    if (!referanslar.has(dosya)) { rmSync(join(YUKLEME, dosya), { force: true }); silinen++; }
  }
  res.json({ ok: true, silinen });
});

// --- YEDEK LİSTESİ ---
app.get("/api/yedekler", girisGerek, (req, res) => {
  const liste = readdirSync(YEDEK)
    .filter((d) => /^\d+$/.test(d))
    .sort((a, b) => Number(b) - Number(a))
    .slice(0, 30)
    .map((d) => ({ ad: d, zaman: Number(d) }));
  res.json(liste);
});

// --- GERİ AL (bir yedeği geri yükle) ---
app.post("/api/geri-al", girisGerek, (req, res) => {
  const ad = String(req.body?.ad || "").replace(/[^0-9]/g, "");
  const klasor = join(YEDEK, ad);
  if (!ad || !existsSync(klasor)) return res.status(404).json({ hata: "Yedek bulunamadı" });
  // Geri almadan önce mevcut hâli de yedekle (yanlışlıkla geri alınırsa kurtarılsın)
  sonYedek = 0;
  yedekAl();
  for (const dosya of readdirSync(klasor)) {
    if (dosya.endsWith(".json")) copyFileSync(join(klasor, dosya), join(VERI, dosya));
  }
  res.json({ ok: true });
});

// --- SİTEYİ YAYINLA (yeniden derle) ---
app.post("/api/yayinla", girisGerek, (req, res) => {
  const komut = process.platform === "win32" ? "npm.cmd run build" : "npm run build";
  exec(komut, { cwd: KOK, windowsHide: true }, (err, stdout, stderr) => {
    if (err) return res.status(500).json({ ok: false, hata: stderr || err.message });
    res.json({ ok: true });
  });
});

app.listen(PORT, () => {
  console.log(`\n  Yönetim paneli hazır:  http://localhost:${PORT}`);
  console.log(`  Şifre: ${SIFRE}  (panel/.env içinden değiştir)\n`);
});
