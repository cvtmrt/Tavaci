// ============================================================
//  TAVACI MEHMET - YÖNETİM PANELİ + SİTE SUNUCUSU
//  Veri MariaDB'de (hesapyon_db). Fotoğraflar public/yuklenenler/.
//
//  Tek Node uygulaması:
//    /            -> Astro SSR site (dist/server derlemesi)
//    /panel       -> yönetim arayüzü (genel/)
//    /api/*       -> panel API'leri (DB CRUD)
//
//  Çalıştırma:  npm run build  (bir kez)  +  npm run panel
//  Giriş:       http://localhost:5174/panel  (parola: yoneticiler tablosu)
// ============================================================

import express from "express";
import session from "express-session";
import multer from "multer";
import bcrypt from "bcryptjs";
import {
  readFileSync, writeFileSync, mkdirSync, existsSync,
  readdirSync, rmSync,
} from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { sorgu, islem, tek } from "../lib/db.mjs";
import { ayarlariDuzlestir, anasayfaTopla, HERO_ALANLAR } from "../lib/anasayfa.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const KOK = join(__dirname, "..");
// Kalıcı veri dizini (yüklenen foto/logo/yedek burada durur). Öncelik:
//   1) VERI_DIZIN          — elle ayarlanırsa (ör. /data)
//   2) RAILWAY_VOLUME_MOUNT_PATH — Railway, Volume bağlıysa otomatik verir
//   3) .veri-kalici        — yerel geliştirme (repo içi)
// Böylece Volume bağlıyken VERI_DIZIN unutulsa bile fotoğraflar Volume'e
// yazılır ve redeploy'larda KAYBOLMAZ.
const VERI = process.env.VERI_DIZIN || process.env.RAILWAY_VOLUME_MOUNT_PATH || join(KOK, ".veri-kalici");
const YUKLEME = join(VERI, "yuklenenler"); // yüklenen fotoğraflar
const YEDEK = join(VERI, "yedekler");      // DB anlık görüntüleri
const LOGO = join(VERI, "logo.png");       // panelden yüklenen logo
const PUBLIC = join(KOK, "public");
const DIST_CLIENT = join(KOK, "dist", "client");

mkdirSync(YUKLEME, { recursive: true });
mkdirSync(YEDEK, { recursive: true });
// Hangi dizine yazıldığını logda göster (Volume doğrulaması için)
console.log("Veri dizini (yüklenenler/yedekler):", VERI);

const PORT = process.env.PORT || process.env.PANEL_PORT || 5174;

// Basit benzersiz id
const yeniId = (onek) => `${onek}${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;

// ============================================================
//  YEDEK / GERİ AL — DB anlık görüntüsünü JSON olarak sakla
//  (mysqldump gerektirmez; kendi içinde taşınabilir)
// ============================================================
// Geri yükleme sırası FK için önemli (kategoriler -> urunler)
const YEDEK_TABLOLAR = [
  "kategoriler", "urunler", "subeler", "ayarlar", "tema", "metinler",
  "hero_slaytlar", "anasayfa_ayar", "hakkimizda_rakamlar", "hakkimizda_degerler",
];

let sonYedek = 0;
async function yedekAl(zorla = false) {
  const simdi = Date.now();
  if (!zorla && simdi - sonYedek < 30000) return; // en fazla 30 sn'de bir
  sonYedek = simdi;
  const anlik = {};
  for (const t of YEDEK_TABLOLAR) anlik[t] = await sorgu(`SELECT * FROM ${t}`);
  writeFileSync(join(YEDEK, `${simdi}.json`), JSON.stringify(anlik), "utf8");
  // Yalnızca son 30 yedeği tut
  const hepsi = readdirSync(YEDEK)
    .filter((d) => /^\d+\.json$/.test(d))
    .sort((a, b) => Number(b.split(".")[0]) - Number(a.split(".")[0]));
  for (const eski of hepsi.slice(30)) rmSync(join(YEDEK, eski), { force: true });
}

// ============================================================
//  EXPRESS
// ============================================================
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

// --- Giriş kontrolü ---
function girisGerek(req, res, next) {
  if (req.session?.girisli) return next();
  return res.status(401).json({ hata: "Giriş gerekli" });
}

app.post("/giris", async (req, res) => {
  try {
    const sifre = req.body?.sifre || "";
    const y = await tek("SELECT sifre_hash FROM yoneticiler WHERE kullanici='admin'");
    if (y && (await bcrypt.compare(sifre, y.sifre_hash))) {
      req.session.girisli = true;
      return res.json({ ok: true });
    }
  } catch (e) {
    return res.status(500).json({ hata: e.message });
  }
  res.status(401).json({ hata: "Şifre yanlış" });
});

app.post("/cikis", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get("/durum", (req, res) => res.json({ girisli: !!req.session?.girisli }));

// ============================================================
//  OKUMA YARDIMCILARI (DB -> panel arayüzünün beklediği şekil)
// ============================================================
async function anahtarDegerOku(tablo) {
  const satirlar = await sorgu(`SELECT anahtar, deger FROM ${tablo}`);
  return Object.fromEntries(satirlar.map((r) => [r.anahtar, r.deger]));
}

async function metinleriOku() {
  const cikti = { tr: {}, en: {} };
  for (const r of await sorgu("SELECT anahtar, dil, deger FROM metinler")) {
    if (!cikti[r.dil]) cikti[r.dil] = {};
    cikti[r.dil][r.anahtar] = r.deger ?? "";
  }
  return cikti;
}

async function anasayfaOku() {
  const ayarMap = await anahtarDegerOku("anasayfa_ayar");
  const heroSatirlar = await sorgu("SELECT * FROM hero_slaytlar ORDER BY sira ASC");
  return anasayfaTopla(ayarMap, heroSatirlar);
}

async function hakkimizdaOku() {
  const rakamlar = await sorgu("SELECT id, sayi, etiket, etiket_en, sira FROM hakkimizda_rakamlar ORDER BY sira ASC");
  const degerler = await sorgu("SELECT id, emoji, baslik, baslik_en, metin, metin_en, sira FROM hakkimizda_degerler ORDER BY sira ASC");
  return {
    rakamlar: rakamlar.map((r) => ({ id: r.id, sayi: r.sayi, etiket: r.etiket, etiketEn: r.etiket_en, sira: r.sira })),
    degerler: degerler.map((d) => ({ id: d.id, emoji: d.emoji, baslik: d.baslik, baslikEn: d.baslik_en, metin: d.metin, metinEn: d.metin_en, sira: d.sira })),
  };
}

// --- Tüm veriyi getir (arayüz için) ---
app.get("/api/veri", girisGerek, async (req, res) => {
  try {
    const kategoriler = (await sorgu("SELECT id, ad, ad_en, ikon, sira FROM kategoriler ORDER BY sira ASC"))
      .map((k) => ({ id: k.id, ad: k.ad, adEn: k.ad_en, ikon: k.ikon, sira: k.sira }));
    const urunler = (await sorgu("SELECT id, ad, ad_en, aciklama, aciklama_en, fiyat, kategori_id, sira, gorsel FROM urunler ORDER BY sira ASC"))
      .map((u) => ({ id: u.id, ad: u.ad, adEn: u.ad_en, aciklama: u.aciklama, aciklamaEn: u.aciklama_en, fiyat: u.fiyat, kategoriId: u.kategori_id, sira: u.sira, gorsel: u.gorsel }));
    const subeler = await sorgu("SELECT id, sehir, semt, adres, telefon, saat FROM subeler ORDER BY id ASC");
    res.json({
      kategoriler,
      urunler,
      subeler,
      ayarlar: await anahtarDegerOku("ayarlar"),
      metinler: await metinleriOku(),
      tema: await anahtarDegerOku("tema"),
      anasayfa: await anasayfaOku(),
      hakkimizda: await hakkimizdaOku(),
    });
  } catch (e) {
    res.status(500).json({ hata: e.message });
  }
});

// --- KATEGORİ kaydet (yeni veya güncelle) ---
app.post("/api/kategori", girisGerek, async (req, res) => {
  try {
    await yedekAl();
    const k = req.body || {};
    if (!k.id) k.id = yeniId("k");
    await sorgu(
      `INSERT INTO kategoriler (id, ad, ad_en, ikon, sira) VALUES (?,?,?,?,?)
       ON CONFLICT (id) DO UPDATE SET ad=EXCLUDED.ad, ad_en=EXCLUDED.ad_en, ikon=EXCLUDED.ikon, sira=EXCLUDED.sira`,
      [k.id, k.ad || "", k.adEn || "", k.ikon || "", Number(k.sira) || 0]
    );
    res.json({ ok: true, id: k.id });
  } catch (e) { res.status(500).json({ hata: e.message }); }
});

app.delete("/api/kategori/:id", girisGerek, async (req, res) => {
  try {
    await yedekAl();
    // urunler FK CASCADE ile birlikte silinir
    await sorgu("DELETE FROM kategoriler WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ hata: e.message }); }
});

// --- ÜRÜN kaydet ---
app.post("/api/urun", girisGerek, async (req, res) => {
  try {
    await yedekAl();
    const u = req.body || {};
    if (!u.id) u.id = yeniId("u");
    await sorgu(
      `INSERT INTO urunler (id, ad, ad_en, aciklama, aciklama_en, fiyat, kategori_id, sira, gorsel)
       VALUES (?,?,?,?,?,?,?,?,?)
       ON CONFLICT (id) DO UPDATE SET ad=EXCLUDED.ad, ad_en=EXCLUDED.ad_en, aciklama=EXCLUDED.aciklama,
         aciklama_en=EXCLUDED.aciklama_en, fiyat=EXCLUDED.fiyat, kategori_id=EXCLUDED.kategori_id,
         sira=EXCLUDED.sira, gorsel=EXCLUDED.gorsel`,
      [u.id, u.ad || "", u.adEn || "", u.aciklama || "", u.aciklamaEn || "",
       u.fiyat || "", u.kategoriId || null, Number(u.sira) || 0, u.gorsel || ""]
    );
    res.json({ ok: true, id: u.id });
  } catch (e) { res.status(500).json({ hata: e.message }); }
});

app.delete("/api/urun/:id", girisGerek, async (req, res) => {
  try {
    await yedekAl();
    await sorgu("DELETE FROM urunler WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ hata: e.message }); }
});

// --- ŞUBE kaydet ---
app.post("/api/sube", girisGerek, async (req, res) => {
  try {
    await yedekAl();
    const s = req.body || {};
    if (!s.id) s.id = yeniId("s");
    await sorgu(
      `INSERT INTO subeler (id, sehir, semt, adres, telefon, saat) VALUES (?,?,?,?,?,?)
       ON CONFLICT (id) DO UPDATE SET sehir=EXCLUDED.sehir, semt=EXCLUDED.semt, adres=EXCLUDED.adres,
         telefon=EXCLUDED.telefon, saat=EXCLUDED.saat`,
      [s.id, s.sehir || "", s.semt || "", s.adres || "", s.telefon || "", s.saat || ""]
    );
    res.json({ ok: true, id: s.id });
  } catch (e) { res.status(500).json({ hata: e.message }); }
});

app.delete("/api/sube/:id", girisGerek, async (req, res) => {
  try {
    await yedekAl();
    await sorgu("DELETE FROM subeler WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ hata: e.message }); }
});

// --- AYARLAR kaydet (anahtar-değer upsert) ---
app.post("/api/ayarlar", girisGerek, async (req, res) => {
  try {
    await yedekAl();
    const a = req.body || {};
    await islem(async (b) => {
      for (const [anahtar, deger] of Object.entries(a)) {
        await b.execute(
          `INSERT INTO ayarlar (anahtar, deger) VALUES (?,?) ON CONFLICT (anahtar) DO UPDATE SET deger=EXCLUDED.deger`,
          [anahtar, String(deger ?? "")]
        );
      }
    });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ hata: e.message }); }
});

// --- TEMA (renkler) kaydet ---
app.post("/api/tema", girisGerek, async (req, res) => {
  try {
    await yedekAl();
    const t = req.body || {};
    await islem(async (b) => {
      for (const [anahtar, deger] of Object.entries(t)) {
        await b.execute(
          `INSERT INTO tema (anahtar, deger) VALUES (?,?) ON CONFLICT (anahtar) DO UPDATE SET deger=EXCLUDED.deger`,
          [anahtar, String(deger ?? "")]
        );
      }
    });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ hata: e.message }); }
});

// --- SAYFA YAZILARI kaydet (tüm metinler değiştirilir) ---
app.post("/api/metinler", girisGerek, async (req, res) => {
  try {
    await yedekAl();
    const m = req.body || { tr: {}, en: {} };
    await islem(async (b) => {
      await b.execute("DELETE FROM metinler");
      for (const dil of Object.keys(m)) {
        for (const [anahtar, deger] of Object.entries(m[dil] || {})) {
          await b.execute(
            `INSERT INTO metinler (anahtar, dil, deger) VALUES (?,?,?)`,
            [anahtar, dil, String(deger ?? "")]
          );
        }
      }
    });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ hata: e.message }); }
});

// --- ANASAYFA kaydet (hero_slaytlar + anasayfa_ayar tamamen yenilenir) ---
app.post("/api/anasayfa", girisGerek, async (req, res) => {
  try {
    await yedekAl();
    const veri = req.body || {};
    const hero = Array.isArray(veri.heroSlaytlar) ? veri.heroSlaytlar : [];
    const ayarCiftleri = ayarlariDuzlestir(veri);
    const kolonlar = ["id", ...HERO_ALANLAR.map(([, kol]) => kol), "sira"];
    const yerTutucu = kolonlar.map(() => "?").join(", ");
    await islem(async (b) => {
      await b.execute("DELETE FROM hero_slaytlar");
      for (let i = 0; i < hero.length; i++) {
        const h = hero[i];
        const degerler = [h.id || yeniId("h"), ...HERO_ALANLAR.map(([js]) => h[js] ?? ""), i * 10];
        await b.execute(`INSERT INTO hero_slaytlar (${kolonlar.join(", ")}) VALUES (${yerTutucu})`, degerler);
      }
      await b.execute("DELETE FROM anasayfa_ayar");
      for (const { anahtar, deger } of ayarCiftleri) {
        await b.execute(`INSERT INTO anasayfa_ayar (anahtar, deger) VALUES (?,?)`, [anahtar, deger]);
      }
    });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ hata: e.message }); }
});

// --- HAKKIMIZDA kaydet (rakamlar + degerler tamamen yenilenir) ---
app.post("/api/hakkimizda", girisGerek, async (req, res) => {
  try {
    await yedekAl();
    const veri = req.body || {};
    const rakamlar = Array.isArray(veri.rakamlar) ? veri.rakamlar : [];
    const degerler = Array.isArray(veri.degerler) ? veri.degerler : [];
    await islem(async (b) => {
      await b.execute("DELETE FROM hakkimizda_rakamlar");
      for (let i = 0; i < rakamlar.length; i++) {
        const r = rakamlar[i];
        await b.execute(
          `INSERT INTO hakkimizda_rakamlar (id, sayi, etiket, etiket_en, sira) VALUES (?,?,?,?,?)`,
          [r.id || yeniId("r"), r.sayi || "", r.etiket || "", r.etiketEn || "", i * 10]
        );
      }
      await b.execute("DELETE FROM hakkimizda_degerler");
      for (let i = 0; i < degerler.length; i++) {
        const d = degerler[i];
        await b.execute(
          `INSERT INTO hakkimizda_degerler (id, emoji, baslik, baslik_en, metin, metin_en, sira) VALUES (?,?,?,?,?,?,?)`,
          [d.id || yeniId("d"), d.emoji || "", d.baslik || "", d.baslikEn || "", d.metin || "", d.metinEn || "", i * 10]
        );
      }
    });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ hata: e.message }); }
});

// ============================================================
//  FOTOĞRAF / LOGO YÜKLEME (dosya sistemi — değişmedi)
// ============================================================
const depo = multer.diskStorage({
  destination: YUKLEME,
  filename: (req, file, cb) => cb(null, yeniId("img") + extname(file.originalname).toLowerCase()),
});
const yukle = multer({ storage: depo, limits: { fileSize: 8 * 1024 * 1024 } });

app.post("/api/gorsel", girisGerek, yukle.single("dosya"), (req, res) => {
  if (!req.file) return res.status(400).json({ hata: "Dosya yok" });
  res.json({ yol: `/yuklenenler/${req.file.filename}` });
});

const logoDepo = multer.diskStorage({
  destination: VERI,
  filename: (req, file, cb) => cb(null, "logo.png"),
});
const logoYukle = multer({ storage: logoDepo, limits: { fileSize: 8 * 1024 * 1024 } });

app.post("/api/logo", girisGerek, logoYukle.single("dosya"), (req, res) => {
  if (!req.file) return res.status(400).json({ hata: "Dosya yok" });
  res.json({ ok: true, yol: `/logo.png?${Date.now()}` });
});

// ============================================================
//  OTOMATİK ÇEVİRİ (TR -> EN) — değişmedi
// ============================================================
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

// ============================================================
//  YEDEK LİSTESİ / GERİ AL
// ============================================================
app.get("/api/yedekler", girisGerek, (req, res) => {
  const liste = readdirSync(YEDEK)
    .filter((d) => /^\d+\.json$/.test(d))
    .map((d) => Number(d.split(".")[0]))
    .sort((a, b) => b - a)
    .slice(0, 30)
    .map((z) => ({ ad: String(z), zaman: z }));
  res.json(liste);
});

app.post("/api/geri-al", girisGerek, async (req, res) => {
  try {
    const ad = String(req.body?.ad || "").replace(/[^0-9]/g, "");
    const yol = join(YEDEK, `${ad}.json`);
    if (!ad || !existsSync(yol)) return res.status(404).json({ hata: "Yedek bulunamadı" });
    // Geri almadan önce mevcut hâli de yedekle
    await yedekAl(true);
    const anlik = JSON.parse(readFileSync(yol, "utf8"));
    await islem(async (b) => {
      // Önce tüm tabloları temizle (çocuk -> ebeveyn sırası; tek FK: urunler -> kategoriler)
      for (const t of [...YEDEK_TABLOLAR].reverse()) await b.query(`DELETE FROM ${t}`);
      // Sonra ebeveyn -> çocuk sırasında geri yükle (kategoriler, urunler, ...)
      for (const t of YEDEK_TABLOLAR) {
        for (const satir of anlik[t] || []) {
          const kolonlar = Object.keys(satir);
          if (!kolonlar.length) continue;
          const yt = kolonlar.map(() => "?").join(", ");
          await b.execute(
            `INSERT INTO ${t} (${kolonlar.join(", ")}) VALUES (${yt})`,
            kolonlar.map((k) => satir[k])
          );
        }
      }
    });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ hata: e.message }); }
});

// ============================================================
//  STATİK DOSYALAR + PANEL + ASTRO SSR
//  Sıra önemli: önce çalışma-zamanı dosyaları & panel, en son site.
// ============================================================
// Yüklenen fotoğraflar (çalışma zamanında değişir)
app.use("/yuklenenler", express.static(YUKLEME));
// Panelden yüklenen logo Volume'de durur; yoksa public/dist'teki varsayılana düş
app.get("/logo.png", (req, res, next) =>
  existsSync(LOGO) ? res.sendFile(LOGO) : next());
// public/ (logo.png, favicon) — çalışma zamanı sürümü dist'i ezsin
app.use(express.static(PUBLIC));
// Yönetim arayüzü
app.use("/panel", express.static(join(__dirname, "genel")));
// Astro istemci varlıkları (_astro/*) — derlemeden
app.use(express.static(DIST_CLIENT));

// Astro SSR handler'ı (derleme varsa) en sona bağla
let ssrBagli = false;
try {
  const giris = join(KOK, "dist", "server", "entry.mjs");
  if (existsSync(giris)) {
    const mod = await import(pathToFileURL(giris).href);
    if (mod.handler) { app.use(mod.handler); ssrBagli = true; }
  }
} catch (e) {
  console.warn("Astro SSR derlemesi yüklenemedi:", e.message);
}

app.listen(PORT, () => {
  console.log(`\n  Sunucu hazır:`);
  console.log(`  • Panel:  http://localhost:${PORT}/panel`);
  console.log(`  • Site :  http://localhost:${PORT}/  ${ssrBagli ? "" : "(SSR yok — 'npm run build' çalıştırın)"}\n`);
});
