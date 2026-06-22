// ============================================================
//  YÖNETİM PANELİ - ARAYÜZ MANTIĞI
//  Sunucudaki /api uçlarıyla konuşur. Tüm veri panel/veri/*.json'da.
// ============================================================

let D = { kategoriler: [], urunler: [], subeler: [], ayarlar: {}, metinler: { tr: {}, en: {} }, tema: {}, anasayfa: {} };
let aktifSekme = "anasayfa";
let AS = null; // Anasayfa çalışma kopyası (düzenleme sırasında)

// Sayfa yazıları: panelde gösterilecek gruplar ve dostça etiketler
// NOT: Anasayfa yazıları (hero, keşfet panelleri, hikaye, CTA) artık
// "🏠 Anasayfa" sekmesinde düzenlenir; burada diğer sayfalar var.
const METIN_GRUPLARI = [
  { id: "menu", baslik: "📖 Menü Sayfası", not: "Ürünler ve kategoriler 🍗 Ürünler / 📂 Kategoriler sekmelerinde.", alanlar: [
    { a: "menu.title", e: "Başlık" },
    { a: "menu.sub", e: "Alt yazı" },
    { a: "menu.intro", e: "Giriş yazısı" },
  ]},
  { id: "subeler", baslik: "📍 Şubeler Sayfası", not: "Şube listesi 📍 Şubeler sekmesinde.", alanlar: [
    { a: "branches.title", e: "Başlık" },
    { a: "branches.sub", e: "Alt yazı" },
  ]},
  { id: "hakkimizda", baslik: "👨‍🍳 Hakkımızda", alanlar: [
    { a: "about.title", e: "Başlık" },
    { a: "about.intro", e: "Giriş metni", cok: true },
    { a: "about.values", e: "Değerler bölüm başlığı" },
  ]},
  { id: "iletisim", baslik: "✉️ İletişim Sayfası", not: "Telefon / e-posta ⚙️ Ayarlar sekmesinde.", alanlar: [
    { a: "contact.title", e: "Başlık" },
    { a: "contact.sub", e: "Alt yazı" },
  ]},
  { id: "footer", baslik: "🔻 Footer", alanlar: [
    { a: "footer.tagline", e: "Tanıtım yazısı", cok: true },
  ]},
];
let urunFiltre = ""; // kategori id'sine göre filtre

// Metni HTML-güvenli yap
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const $ = (id) => document.getElementById(id);

// --- Giriş / oturum ---
async function girisYap() {
  const sifre = $("sifre").value;
  const r = await fetch("/giris", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sifre }) });
  if (r.ok) { $("giris").classList.add("gizli"); $("panel").classList.remove("gizli"); await yukle(); }
  else { $("girisHata").textContent = "Şifre yanlış"; }
}
async function cikis() { await fetch("/cikis", { method: "POST" }); location.reload(); }

async function durumKontrol() {
  const r = await fetch("/durum");
  const j = await r.json();
  if (j.girisli) { $("giris").classList.add("gizli"); $("panel").classList.remove("gizli"); await yukle(); }
}

// --- Veriyi çek ---
async function yukle() {
  const r = await fetch("/api/veri");
  if (r.status === 401) { location.reload(); return; }
  D = await r.json();
  AS = null; HK = null; // çalışma kopyalarını tazele
  ciz();
  onizlemeYenile(); // varsa önizlemeyi de tazele
}

// --- Mesaj çubuğu ---
let mesajZaman;
function mesajGoster(tip, metin) {
  const m = $("mesaj");
  m.className = "bilgi-cubuk " + tip;
  m.textContent = metin;
  clearTimeout(mesajZaman);
  mesajZaman = setTimeout(() => m.classList.add("gizli"), 4000);
}

// --- "Kaydediliyor… / Kaydedildi ✓" göstergesi (üst barda) ---
let _kdZaman;
function kayitDurum(tip) {
  const el = $("kayitDurum"); if (!el) return;
  clearTimeout(_kdZaman);
  if (tip === "kaydediliyor") { el.textContent = "Kaydediliyor…"; el.style.color = "rgba(255,255,255,.85)"; }
  else { el.textContent = "Kaydedildi ✓"; el.style.color = "#c6f6cf"; _kdZaman = setTimeout(() => { el.textContent = ""; }, 2500); }
}

// --- Geri Al penceresi ---
function gecenSure(ts) {
  const dk = Math.round((Date.now() - ts) / 60000);
  if (dk < 1) return "az önce";
  if (dk < 60) return dk + " dk önce";
  return Math.round(dk / 60) + " saat önce";
}
async function geriAlAc() {
  const liste = await (await fetch("/api/yedekler")).json();
  const el = $("geriAlListe");
  if (!liste.length) el.innerHTML = "<p style='color:#888'>Henüz yedek yok. Bir düzenleme yapınca otomatik oluşur.</p>";
  else el.innerHTML = liste.map((y, i) => `
    <div class="satir" style="padding:8px 12px">
      <div class="bilgi"><b>${i === 0 ? "En son hâl" : gecenSure(y.zaman)}</b><small>${new Date(y.zaman).toLocaleString("tr-TR")}</small></div>
      <button class="btn" style="padding:6px 12px;border-radius:8px;font-size:13px" onclick="geriAlYap('${y.ad}')">Bu hâle dön</button>
    </div>`).join("");
  $("geriAlModal").classList.remove("gizli");
}
function geriAlKapat() { $("geriAlModal").classList.add("gizli"); }
async function geriAlYap(ad) {
  if (!confirm("Site bu yedekteki hâline dönecek. Emin misin?")) return;
  await fetch("/api/geri-al", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ad }) });
  geriAlKapat(); mesajGoster("ok", "Geri alındı ✓"); await yukle();
}

// --- Sekme seçimi ---
function sekmeSec(ad) {
  if (aktifSekme === "anasayfa" || aktifSekme === "metinler") htTopla(); // çıkarken yazıları sakla
  aktifSekme = ad;
  document.querySelectorAll(".sekme").forEach((b) => b.classList.toggle("aktif", b.dataset.sekme === ad));
  ciz();
  onizlemeSayfaAyarla(); // önizlemeyi bu sekmeye uygun sayfaya getir
  onizlemeYenile();
}

function ciz() {
  if (aktifSekme === "anasayfa") anasayfaCiz();
  else if (aktifSekme === "urunler") urunlerCiz();
  else if (aktifSekme === "kategoriler") kategorilerCiz();
  else if (aktifSekme === "subeler") subelerCiz();
  else if (aktifSekme === "metinler") metinlerCiz();
  else if (aktifSekme === "tasarim") tasarimCiz();
  else if (aktifSekme === "ayarlar") ayarlarCiz();
}

const katAd = (id) => D.kategoriler.find((k) => k.id === id)?.ad || "—";

// ================= ÜRÜNLER =================
let urunArama = ""; // ürün adı araması
function urunlerCiz() {
  const secenekler = D.kategoriler.map((k) => `<option value="${k.id}" ${urunFiltre === k.id ? "selected" : ""}>${esc(k.ad)}</option>`).join("");
  $("icerik").innerHTML = `
    <div class="baslik-satir">
      <h2>Ürünler</h2>
      <button class="btn" onclick="urunForm()">+ Yeni Ürün</button>
    </div>
    <div style="display:flex;gap:10px;margin-bottom:12px;flex-wrap:wrap">
      <input id="urunArama" placeholder="🔍 Ürün ara…" value="${esc(urunArama)}" oninput="urunArama=this.value; urunListeCiz()" style="max-width:260px" />
      <select style="max-width:240px" onchange="urunFiltre=this.value; urunListeCiz()">
        <option value="">Tüm kategoriler</option>${secenekler}
      </select>
    </div>
    <div id="urunListe"></div>`;
  urunListeCiz();
}
// Sadece liste kısmını çiz (arama kutusu odağını kaybetmesin)
function urunListeCiz() {
  const q = urunArama.trim().toLocaleLowerCase("tr");
  const liste = D.urunler.filter((u) =>
    (!urunFiltre || u.kategoriId === urunFiltre) &&
    (!q || (u.ad || "").toLocaleLowerCase("tr").includes(q) || (u.adEn || "").toLowerCase().includes(q))
  );
  const el = $("urunListe"); if (!el) return;
  el.innerHTML = `<p style="color:#888;margin:0 0 8px">${liste.length} ürün</p>` +
    (liste.map(urunSatir).join("") || "<p style='color:#888'>Eşleşen ürün yok.</p>");
}
function urunSatir(u) {
  return `<div class="satir">
    <img src="${esc(u.gorsel || "")}" onerror="this.style.visibility='hidden'" />
    <div class="bilgi"><b>${esc(u.ad)}</b><small>${esc(katAd(u.kategoriId))} · ${esc(u.fiyat || "")}</small></div>
    <div class="islem">
      <button class="btn-ikincil" style="padding:6px 12px;border-radius:8px;font-size:13px" onclick="urunForm('${u.id}')">Düzenle</button>
      <button class="btn-sil" onclick="sil('urun','${u.id}')">Sil</button>
    </div></div>`;
}
function urunForm(id) {
  const u = D.urunler.find((x) => x.id === id) || { kategoriId: urunFiltre || D.kategoriler[0]?.id };
  const secenekler = D.kategoriler.map((k) => `<option value="${k.id}">${esc(k.ad)}</option>`).join("");
  $("icerik").innerHTML = `
    <div class="kart">
      <h2>${id ? "Ürünü Düzenle" : "Yeni Ürün"}</h2>
      <div class="ikili">
        <div><label>Ürün Adı (TR)</label><input id="f_ad" onblur="ceviriDoldur('f_ad','f_adEn')" /></div>
        <div><label>Ürün Adı (EN)</label><input id="f_adEn" /></div>
      </div>
      <div class="ikili">
        <div><label>Açıklama (TR)</label><textarea id="f_aciklama" rows="3" onblur="ceviriDoldur('f_aciklama','f_aciklamaEn')"></textarea></div>
        <div><label>Açıklama (EN)</label><textarea id="f_aciklamaEn" rows="3"></textarea></div>
      </div>
      <div class="ikili">
        <div><label>Fiyat</label><input id="f_fiyat" placeholder="₺185" /></div>
        <div><label>Kategori</label><select id="f_kategoriId">${secenekler}</select></div>
      </div>
      <label>Sıra (küçük sayı önce)</label><input id="f_sira" type="number" style="max-width:160px" />
      <label>Fotoğraf</label>
      <input type="file" accept="image/*" onchange="gorselYukle(this)" />
      <img id="onizle" class="onizleme" />
      <input type="hidden" id="f_gorsel" />
      <div class="form-alt">
        <button class="btn" onclick="urunKaydet('${id || ""}')">Kaydet</button>
        <button class="btn btn-ikincil" onclick="urunlerCiz()">Vazgeç</button>
      </div>
    </div>`;
  // Değerleri JS ile doldur (kaçış sorunu olmasın)
  $("f_ad").value = u.ad || ""; $("f_adEn").value = u.adEn || "";
  $("f_aciklama").value = u.aciklama || ""; $("f_aciklamaEn").value = u.aciklamaEn || "";
  $("f_fiyat").value = u.fiyat || ""; $("f_kategoriId").value = u.kategoriId || "";
  $("f_sira").value = u.sira ?? 100; $("f_gorsel").value = u.gorsel || "";
  if (u.gorsel) $("onizle").src = u.gorsel; else $("onizle").style.visibility = "hidden";
}
async function urunKaydet(id) {
  const u = {
    id: id || undefined,
    ad: $("f_ad").value.trim(), adEn: $("f_adEn").value.trim(),
    aciklama: $("f_aciklama").value.trim(), aciklamaEn: $("f_aciklamaEn").value.trim(),
    fiyat: $("f_fiyat").value.trim(), kategoriId: $("f_kategoriId").value,
    sira: Number($("f_sira").value) || 100, gorsel: $("f_gorsel").value,
  };
  if (!u.ad) return mesajGoster("hata", "Ürün adı boş olamaz");
  await fetch("/api/urun", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(u) });
  mesajGoster("ok", "Ürün kaydedildi"); await yukle(); urunlerCiz();
}

// --- Fotoğraf yükleme ---
async function gorselYukle(input) {
  const dosya = input.files[0]; if (!dosya) return;
  const fd = new FormData(); fd.append("dosya", dosya);
  mesajGoster("ok", "Fotoğraf yükleniyor…");
  const r = await fetch("/api/gorsel", { method: "POST", body: fd });
  const j = await r.json();
  if (j.yol) { $("f_gorsel").value = j.yol; const o = $("onizle"); o.src = j.yol; o.style.visibility = "visible"; mesajGoster("ok", "Fotoğraf yüklendi"); }
  else mesajGoster("hata", "Fotoğraf yüklenemedi");
}

// ================= KATEGORİLER =================
function kategorilerCiz() {
  const liste = [...D.kategoriler].sort((a, b) => (a.sira || 0) - (b.sira || 0));
  $("icerik").innerHTML = `
    <div class="baslik-satir"><h2>Kategoriler (${liste.length})</h2><button class="btn" onclick="kategoriForm()">+ Yeni Kategori</button></div>
    <div>${liste.map((k) => `<div class="satir">
      <div style="font-size:24px;width:40px;text-align:center">${esc(k.ikon || "🍽️")}</div>
      <div class="bilgi"><b>${esc(k.ad)}</b><small>${esc(k.adEn || "")} · sıra: ${k.sira ?? ""}</small></div>
      <div class="islem">
        <button class="btn-ikincil" style="padding:6px 12px;border-radius:8px;font-size:13px" onclick="kategoriForm('${k.id}')">Düzenle</button>
        <button class="btn-sil" onclick="kategoriSil('${k.id}')">Sil</button>
      </div></div>`).join("")}</div>`;
}
// Kategori silme: altındaki ürünler de silineceği için sayıyla uyar
async function kategoriSil(id) {
  const kat = D.kategoriler.find((k) => k.id === id);
  const urunSayi = D.urunler.filter((u) => u.kategoriId === id).length;
  const ad = kat ? kat.ad : "Kategori";
  const uyari = urunSayi > 0
    ? `"${ad}" kategorisini ve içindeki ${urunSayi} ürünü SİLMEK üzeresin. Bu geri alınamaz (ama panelden Geri Al ile dönebilirsin). Devam edilsin mi?`
    : `"${ad}" kategorisi silinecek. Devam edilsin mi?`;
  if (!confirm(uyari)) return;
  await fetch(`/api/kategori/${id}`, { method: "DELETE" });
  mesajGoster("ok", "Kategori silindi"); await yukle(); kategorilerCiz();
}
function kategoriForm(id) {
  const k = D.kategoriler.find((x) => x.id === id) || {};
  $("icerik").innerHTML = `
    <div class="kart">
      <h2>${id ? "Kategoriyi Düzenle" : "Yeni Kategori"}</h2>
      <div class="ikili">
        <div><label>Ad (TR)</label><input id="f_ad" onblur="ceviriDoldur('f_ad','f_adEn')" /></div>
        <div><label>Ad (EN)</label><input id="f_adEn" /></div>
      </div>
      <div class="ikili">
        <div><label>İkon (emoji)</label><input id="f_ikon" placeholder="🍗" /></div>
        <div><label>Sıra</label><input id="f_sira" type="number" /></div>
      </div>
      <div class="form-alt">
        <button class="btn" onclick="kategoriKaydet('${id || ""}')">Kaydet</button>
        <button class="btn btn-ikincil" onclick="kategorilerCiz()">Vazgeç</button>
      </div>
    </div>`;
  $("f_ad").value = k.ad || ""; $("f_adEn").value = k.adEn || ""; $("f_ikon").value = k.ikon || ""; $("f_sira").value = k.sira ?? 100;
}
async function kategoriKaydet(id) {
  const k = { id: id || undefined, ad: $("f_ad").value.trim(), adEn: $("f_adEn").value.trim(), ikon: $("f_ikon").value.trim(), sira: Number($("f_sira").value) || 100 };
  if (!k.ad) return mesajGoster("hata", "Kategori adı boş olamaz");
  await fetch("/api/kategori", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(k) });
  mesajGoster("ok", "Kategori kaydedildi"); await yukle(); kategorilerCiz();
}

// ================= ŞUBELER =================
function subelerCiz() {
  $("icerik").innerHTML = `
    <div class="baslik-satir"><h2>Şubeler (${D.subeler.length})</h2><button class="btn" onclick="subeForm()">+ Yeni Şube</button></div>
    <div>${D.subeler.map((s) => `<div class="satir">
      <div style="font-size:24px;width:40px;text-align:center">📍</div>
      <div class="bilgi"><b>${esc(s.sehir)} ${esc(s.semt || "")}</b><small>${esc(s.adres || "")}</small></div>
      <div class="islem">
        <button class="btn-ikincil" style="padding:6px 12px;border-radius:8px;font-size:13px" onclick="subeForm('${s.id}')">Düzenle</button>
        <button class="btn-sil" onclick="sil('sube','${s.id}')">Sil</button>
      </div></div>`).join("")}</div>`;
}
function subeForm(id) {
  const s = D.subeler.find((x) => x.id === id) || {};
  $("icerik").innerHTML = `
    <div class="kart">
      <h2>${id ? "Şubeyi Düzenle" : "Yeni Şube"}</h2>
      <div class="ikili">
        <div><label>Şehir</label><input id="f_sehir" /></div>
        <div><label>Semt</label><input id="f_semt" /></div>
      </div>
      <label>Adres</label><textarea id="f_adres" rows="2"></textarea>
      <div class="ikili">
        <div><label>Telefon</label><input id="f_telefon" /></div>
        <div><label>Çalışma Saatleri</label><input id="f_saat" placeholder="11:00 - 23:00" /></div>
      </div>
      <div class="form-alt">
        <button class="btn" onclick="subeKaydet('${id || ""}')">Kaydet</button>
        <button class="btn btn-ikincil" onclick="subelerCiz()">Vazgeç</button>
      </div>
    </div>`;
  $("f_sehir").value = s.sehir || ""; $("f_semt").value = s.semt || ""; $("f_adres").value = s.adres || "";
  $("f_telefon").value = s.telefon || ""; $("f_saat").value = s.saat || "";
}
async function subeKaydet(id) {
  const s = { id: id || undefined, sehir: $("f_sehir").value.trim(), semt: $("f_semt").value.trim(), adres: $("f_adres").value.trim(), telefon: $("f_telefon").value.trim(), saat: $("f_saat").value.trim() };
  if (!s.sehir) return mesajGoster("hata", "Şehir boş olamaz");
  await fetch("/api/sube", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s) });
  mesajGoster("ok", "Şube kaydedildi"); await yukle(); subelerCiz();
}

// ================= AYARLAR =================
function ayarlarCiz() {
  const a = D.ayarlar || {};
  $("icerik").innerHTML = `
    <div class="kart" style="max-width:560px">
      <h2>Site Ayarları</h2>
      <label>Telefon (üst bar)</label><input id="a_telefon" />
      <label>E-posta</label><input id="a_eposta" />
      <label>Instagram Adresi</label><input id="a_instagram" />
      <label>Online Sipariş Linki — Yemeksepeti/Getir (boşsa İletişim'e gider)</label><input id="a_siparisLinki" placeholder="https://www.yemeksepeti.com/..." />
      <label>WhatsApp numarası (ülke koduyla, sadece rakam)</label><input id="a_whatsapp" placeholder="905xxxxxxxxx" />
      <p style="color:#888;font-size:13px;margin-top:4px">WhatsApp numarası girilince sitede yüzen WhatsApp butonu ve form WhatsApp'a gider.</p>
      <div class="form-alt"><button class="btn" onclick="ayarlarKaydet()">Kaydet</button></div>
    </div>

    <div class="kart" style="max-width:560px;margin-top:16px">
      <h2 style="font-size:17px">🧹 Bakım</h2>
      <p style="color:#888;margin-top:-6px">Sildiğin/değiştirdiğin görseller diskte kalır. Bunları temizleyip yer açabilirsin.</p>
      <button class="btn btn-ikincil" onclick="gorselTemizle()">Kullanılmayan görselleri temizle</button>
    </div>`;
  $("a_telefon").value = a.telefon || ""; $("a_eposta").value = a.eposta || "";
  $("a_instagram").value = a.instagram || ""; $("a_siparisLinki").value = a.siparisLinki || "";
  $("a_whatsapp").value = a.whatsapp || "";
}
async function gorselTemizle() {
  if (!confirm("Kullanılmayan (hiçbir yerde görünmeyen) görseller silinecek. Devam edilsin mi?")) return;
  const j = await (await fetch("/api/gorsel-temizle", { method: "POST" })).json();
  mesajGoster("ok", `${j.silinen || 0} kullanılmayan görsel temizlendi.`);
}
async function ayarlarKaydet() {
  const a = { telefon: $("a_telefon").value.trim(), eposta: $("a_eposta").value.trim(), instagram: $("a_instagram").value.trim(), siparisLinki: $("a_siparisLinki").value.trim(), whatsapp: $("a_whatsapp").value.replace(/[^0-9]/g, "") };
  await fetch("/api/ayarlar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(a) });
  mesajGoster("ok", "Ayarlar kaydedildi"); await yukle();
}

// ================= ANASAYFA TASARIMI =================
const RENKLER = [
  { v: "from-marka to-marka-koyu", e: "Kırmızı" },
  { v: "from-altin to-marka", e: "Sarı → Kırmızı" },
  { v: "from-koyu to-marka-koyu", e: "Koyu" },
  { v: "from-marka-koyu to-koyu", e: "Bordo → Koyu" },
];

function asHazirla() {
  const k = D.anasayfa && Object.keys(D.anasayfa).length ? D.anasayfa : {};
  AS = JSON.parse(JSON.stringify(k));
  AS.bolumler = Object.assign({ hero: true, kesfet: true, hikaye: true, instagram: true, cta: true }, AS.bolumler || {});
  AS.heroSlaytlar = Array.isArray(AS.heroSlaytlar) ? AS.heroSlaytlar : [];
  AS.panelGorseller = AS.panelGorseller || { 1: "", 2: "", 3: "", 4: "" };
  AS.panelLinkler = Object.assign({ 1: "/menu", 2: "/subeler", 3: "/hakkimizda", 4: "/iletisim" }, AS.panelLinkler || {});
  AS.hikaye = Object.assign({ emoji: "👨‍🍳", link: "/hakkimizda" }, AS.hikaye || {});
  AS.cta = Object.assign({ link: "/iletisim" }, AS.cta || {});
  AS.animasyon = Object.assign({ heroEfekt: "fade", heroSure: 4.5, heroOtomatik: true, scrollAcik: true, scrollSure: 700 }, AS.animasyon || {});
}

// Açık akordeon bölümleri (re-render'da durumu koru)
let acikBolumler = new Set(["gorunurluk"]);
let HK = null; // Hakkımızda çalışma kopyası

// Akordeon bölüm sarmalayıcısı (başlığa tıkla -> aç/kapat) - tüm sekmeler kullanır
const bolum = (id, baslik, icerik) => `
  <details class="bolum" data-bid="${id}" ${acikBolumler.has(id) ? "open" : ""}>
    <summary>${baslik}</summary>
    <div class="bolum-govde">${icerik}</div>
  </details>`;
const sec = (deger, mevcut) => (deger === mevcut ? "selected" : "");

// Anasayfa sekmesindeki metin alanları (metinler.json'a yazılır)
const hid = (dil, key) => `ht_${dil}_${key.replace(/\./g, "_")}`;
const ANASAYFA_METIN = [
  "discover.title", "discover.sub",
  "panel.1.tag", "panel.1.title", "panel.1.desc", "panel.1.btn",
  "panel.2.tag", "panel.2.title", "panel.2.desc", "panel.2.btn",
  "panel.3.tag", "panel.3.title", "panel.3.desc", "panel.3.btn",
  "panel.4.tag", "panel.4.title", "panel.4.desc", "panel.4.btn",
  "home.story.title", "home.story.text", "home.story.more",
  "home.ig.title",
  "home.cta.title", "home.cta.sub", "home.cta.btn",
];

// TR/EN metin alanı çifti (metinler.json'dan okur)
function htAlan(key, etiket, cok) {
  const tr = (D.metinler?.tr?.[key]) || "", en = (D.metinler?.en?.[key]) || "";
  const g = (id, val, ph, blur) => cok
    ? `<textarea id="${id}" rows="2" placeholder="${ph}" ${blur || ""}>${esc(val)}</textarea>`
    : `<input id="${id}" value="${esc(val)}" placeholder="${ph}" ${blur || ""} />`;
  return `<label>${etiket}</label><div class="ikili">
    <div>${g(hid("tr", key), tr, "Türkçe", `onblur="htCevir('${key}')"`)}</div>
    <div>${g(hid("en", key), en, "English", "")}</div>
  </div>`;
}
// Ekrandaki TÜM metin alanlarını (ht_tr_*/ht_en_*) D.metinler'e topla.
// (Hem Anasayfa hem Sayfalar sekmesi için çalışır; re-render'da kayıp olmaz.)
function htTopla() {
  if (!D.metinler) D.metinler = { tr: {}, en: {} };
  document.querySelectorAll('[id^="ht_tr_"]').forEach((el) => {
    D.metinler.tr[el.id.slice(6).replace(/_/g, ".")] = el.value;
  });
  document.querySelectorAll('[id^="ht_en_"]').forEach((el) => {
    D.metinler.en[el.id.slice(6).replace(/_/g, ".")] = el.value;
  });
}
// Metin alanı otomatik çeviri (TR -> EN, EN boşsa)
async function htCevir(key) {
  const t = $(hid("tr", key)), e = $(hid("en", key));
  if (!t || !e || !t.value.trim() || e.value.trim()) return;
  const en = await cevir(t.value.trim());
  if (en) e.value = en;
}

function anasayfaCiz() {
  if (!AS) asHazirla();
  htTopla(); // ekrandaki metin düzenlemelerini koru (re-render öncesi)

  // Bölüm görünürlük anahtarları
  const gor = (id, etiket) => `
    <label style="display:flex;align-items:center;gap:8px;font-weight:500;margin:4px 0">
      <input type="checkbox" id="asb_${id}" ${AS.bolumler[id] ? "checked" : ""} onchange="AS.bolumler['${id}']=this.checked" style="width:auto" />
      ${etiket}
    </label>`;

  // Tek bir hero slaytı kartı
  const slaytKart = (s, i) => `
    <div class="kart" style="margin-bottom:12px;border-left:4px solid var(--altin)">
      <div class="baslik-satir" style="margin-bottom:8px">
        <b>🎞️ Slayt ${i + 1}</b>
        <div style="display:flex;gap:4px">
          <button class="btn-ikincil" style="padding:4px 9px;border-radius:8px" onclick="asSlaytTasi(${i},-1)">↑</button>
          <button class="btn-ikincil" style="padding:4px 9px;border-radius:8px" onclick="asSlaytTasi(${i},1)">↓</button>
          <button class="btn-sil" onclick="asSlaytSil(${i})">Sil</button>
        </div>
      </div>
      <div class="ikili">
        <div><label>Üst etiket (TR)</label><input value="${esc(s.ustBaslik)}" oninput="AS.heroSlaytlar[${i}].ustBaslik=this.value" onblur="asCevir(${i},'ustBaslik','ustBaslikEn')" /></div>
        <div><label>Üst etiket (EN)</label><input id="sl_${i}_ustBaslikEn" value="${esc(s.ustBaslikEn || "")}" oninput="AS.heroSlaytlar[${i}].ustBaslikEn=this.value" /></div>
      </div>
      <div class="ikili">
        <div><label>Başlık (TR)</label><input value="${esc(s.baslik)}" oninput="AS.heroSlaytlar[${i}].baslik=this.value" onblur="asCevir(${i},'baslik','baslikEn')" /></div>
        <div><label>Başlık (EN)</label><input id="sl_${i}_baslikEn" value="${esc(s.baslikEn || "")}" oninput="AS.heroSlaytlar[${i}].baslikEn=this.value" /></div>
      </div>
      <div class="ikili">
        <div><label>Alt yazı (TR)</label><textarea rows="2" oninput="AS.heroSlaytlar[${i}].altYazi=this.value" onblur="asCevir(${i},'altYazi','altYaziEn')">${esc(s.altYazi)}</textarea></div>
        <div><label>Alt yazı (EN)</label><textarea id="sl_${i}_altYaziEn" rows="2" oninput="AS.heroSlaytlar[${i}].altYaziEn=this.value">${esc(s.altYaziEn || "")}</textarea></div>
      </div>
      <div class="ikili">
        <div><label>Buton yazısı (TR)</label><input value="${esc(s.buton)}" oninput="AS.heroSlaytlar[${i}].buton=this.value" onblur="asCevir(${i},'buton','butonEn')" /></div>
        <div><label>Buton yazısı (EN)</label><input id="sl_${i}_butonEn" value="${esc(s.butonEn || "")}" oninput="AS.heroSlaytlar[${i}].butonEn=this.value" /></div>
      </div>
      <div class="ikili">
        <div><label>Buton linki</label><input value="${esc(s.link || "/menu")}" oninput="AS.heroSlaytlar[${i}].link=this.value" placeholder="/menu" /></div>
        <div><label>Arka plan rengi (görsel yoksa)</label>
          <select oninput="AS.heroSlaytlar[${i}].renk=this.value">
            ${RENKLER.map((r) => `<option value="${r.v}" ${s.renk === r.v ? "selected" : ""}>${r.e}</option>`).join("")}
          </select>
        </div>
      </div>
      <label>Arka plan görseli (opsiyonel — yüklenirse rengin yerine geçer)</label>
      <div style="display:flex;align-items:center;gap:12px">
        <input type="file" accept="image/*" onchange="asSlaytGorsel(${i},this)" />
        ${s.gorsel ? `<img src="${esc(s.gorsel)}" class="onizleme" style="margin:0" /><button class="btn-sil" onclick="asSlaytGorselSil(${i})">Görseli Kaldır</button>` : `<small style="color:#999">Görsel yok (emoji <input value="${esc(s.emoji || "🍗")}" oninput="AS.heroSlaytlar[${i}].emoji=this.value" style="width:60px;display:inline-block;padding:4px" /> gösterilir)</small>`}
      </div>
    </div>`;

  // Keşfet paneli (yazı TR/EN + link + görsel) — 1..4
  const kesfetPanel = (n) => {
    const g = AS.panelGorseller[n] || "";
    const link = AS.panelLinkler[n] || "";
    return `<div class="kart" style="margin-bottom:12px;border-left:4px solid var(--altin)">
      <b>🧭 Panel ${n}</b>
      ${htAlan(`panel.${n}.tag`, "Üst etiket")}
      ${htAlan(`panel.${n}.title`, "Başlık")}
      ${htAlan(`panel.${n}.desc`, "Açıklama", true)}
      ${htAlan(`panel.${n}.btn`, "Buton yazısı")}
      <label>Buton linki</label><input value="${esc(link)}" oninput="AS.panelLinkler[${n}]=this.value" placeholder="/menu" />
      <label>Arka plan görseli (boşsa renkli degrade)</label>
      <div style="display:flex;align-items:center;gap:10px">
        <input type="file" accept="image/*" onchange="asPanelGorsel(${n},this)" />
        ${g ? `<img src="${esc(g)}" class="onizleme" style="margin:0;width:64px;height:64px" /><button class="btn-sil" onclick="asPanelGorselSil(${n})">Kaldır</button>` : `<small style="color:#999">Görsel yok</small>`}
      </div>
    </div>`;
  };

  $("icerik").innerHTML = `
    <div class="baslik-satir">
      <h2>🏠 Anasayfa</h2>
      <button class="btn" onclick="anasayfaKaydet()">Kaydet</button>
    </div>
    <p style="color:#888;margin:-6px 0 14px">Bölüm başlığına tıklayarak aç/kapat. Düzenledikçe önizleme güncellenir.</p>

    ${bolum("gorunurluk", "👁️ Bölüm Görünürlüğü", `
      <p style="color:#888;margin-top:0">İşareti kaldırdığın bölüm anasayfada gizlenir.</p>
      ${gor("hero", "🎞️ Hero Slider")}
      ${gor("kesfet", "🧭 Keşfetmeye Başla panelleri")}
      ${gor("hikaye", "👨‍🍳 Hikayemiz bölümü")}
      ${gor("instagram", "📷 Instagram bölümü")}
      ${gor("cta", "📣 Sipariş çağrısı (CTA)")}
    `)}

    ${bolum("hero", `🎞️ Hero Slaytları (${AS.heroSlaytlar.length})`, `
      <div style="text-align:right;margin-bottom:10px"><button class="btn btn-ikincil" onclick="asSlaytEkle()">+ Slayt Ekle</button></div>
      ${AS.heroSlaytlar.map(slaytKart).join("") || "<p style='color:#888'>Slayt yok. '+ Slayt Ekle' ile başla.</p>"}
    `)}

    ${bolum("kesfet", "🧭 Keşfetmeye Başla", `
      ${htAlan("discover.title", "Bölüm başlığı")}
      ${htAlan("discover.sub", "Bölüm alt yazısı")}
      <div style="height:10px"></div>
      ${kesfetPanel(1)}${kesfetPanel(2)}${kesfetPanel(3)}${kesfetPanel(4)}
    `)}

    ${bolum("hikaye", "👨‍🍳 Hikayemiz", `
      ${htAlan("home.story.title", "Başlık")}
      ${htAlan("home.story.text", "Metin", true)}
      ${htAlan("home.story.more", "'Daha fazla' linki yazısı")}
      <div class="ikili">
        <div><label>Emoji / simge</label><input value="${esc(AS.hikaye.emoji || "")}" oninput="AS.hikaye.emoji=this.value" style="max-width:120px" /></div>
        <div><label>Buton linki</label><input value="${esc(AS.hikaye.link || "")}" oninput="AS.hikaye.link=this.value" placeholder="/hakkimizda" /></div>
      </div>
    `)}

    ${bolum("instagram", "📷 Instagram", `
      ${htAlan("home.ig.title", "Başlık")}
      <p style="color:#888;margin-top:4px">Instagram adresini "⚙️ Ayarlar" sekmesinden değiştirebilirsin.</p>
    `)}

    ${bolum("cta", "📣 Sipariş Çağrısı (CTA)", `
      ${htAlan("home.cta.title", "Başlık")}
      ${htAlan("home.cta.sub", "Alt yazı")}
      ${htAlan("home.cta.btn", "Buton yazısı")}
      <label>Buton linki</label><input value="${esc(AS.cta.link || "")}" oninput="AS.cta.link=this.value" placeholder="/iletisim" />
    `)}

    ${bolum("animasyon", "✨ Animasyonlar", `
      <b style="font-size:13px">Hero Slider</b>
      <label>Geçiş efekti</label>
      <select oninput="AS.animasyon.heroEfekt=this.value">
        <option value="fade" ${sec("fade", AS.animasyon.heroEfekt)}>Yumuşak geçiş (fade)</option>
        <option value="slide" ${sec("slide", AS.animasyon.heroEfekt)}>Kayma (slide)</option>
      </select>
      <div class="ikili">
        <div><label>Otomatik geçiş süresi (saniye)</label><input type="number" step="0.5" min="1" value="${AS.animasyon.heroSure}" oninput="AS.animasyon.heroSure=parseFloat(this.value)||4.5" /></div>
        <div style="display:flex;align-items:flex-end"><label style="display:flex;align-items:center;gap:8px;margin:0 0 9px"><input type="checkbox" ${AS.animasyon.heroOtomatik ? "checked" : ""} onchange="AS.animasyon.heroOtomatik=this.checked" style="width:auto" /> Otomatik dönsün</label></div>
      </div>
      <hr style="border:none;border-top:1px solid #eee;margin:14px 0" />
      <b style="font-size:13px">Sayfa (kaydırma) Animasyonları</b>
      <label style="display:flex;align-items:center;gap:8px;margin-top:8px"><input type="checkbox" ${AS.animasyon.scrollAcik ? "checked" : ""} onchange="AS.animasyon.scrollAcik=this.checked" style="width:auto" /> Kaydırınca beliren animasyonlar açık</label>
      <label>Animasyon hızı (ms)</label>
      <input type="number" step="100" min="100" value="${AS.animasyon.scrollSure}" oninput="AS.animasyon.scrollSure=parseInt(this.value)||700" style="max-width:140px" />
    `)}

    <div class="form-alt"><button class="btn" onclick="anasayfaKaydet()">Kaydet</button></div>`;
}

// Anasayfa değişikliğini sessizce kaydet + önizlemeyi tazele
// (Buton işlemleri 'input' olayı üretmediği için elle çağırıyoruz.)
async function asKaydetOnizle() {
  await anasayfaKaydetSessiz();
  onizlemeYenile();
}

// Slayt işlemleri
async function asSlaytEkle() {
  AS.heroSlaytlar.push({ id: "h" + Date.now(), ustBaslik: "", ustBaslikEn: "", baslik: "Yeni Slayt", baslikEn: "", altYazi: "", altYaziEn: "", buton: "Keşfet", butonEn: "", link: "/menu", renk: "from-marka to-marka-koyu", emoji: "🍗", gorsel: "" });
  anasayfaCiz(); await asKaydetOnizle();
}
async function asSlaytSil(i) { if (!confirm("Bu slaytı sil?")) return; AS.heroSlaytlar.splice(i, 1); anasayfaCiz(); await asKaydetOnizle(); }
async function asSlaytTasi(i, yon) {
  const a = AS.heroSlaytlar, j = i + yon;
  if (j < 0 || j >= a.length) return;
  [a[i], a[j]] = [a[j], a[i]];
  anasayfaCiz(); await asKaydetOnizle();
}
async function asSlaytGorsel(i, input) {
  const f = input.files[0]; if (!f) return;
  const fd = new FormData(); fd.append("dosya", f);
  mesajGoster("ok", "Görsel yükleniyor…");
  const r = await fetch("/api/gorsel", { method: "POST", body: fd }); const j = await r.json();
  if (j.yol) { AS.heroSlaytlar[i].gorsel = j.yol; anasayfaCiz(); await asKaydetOnizle(); mesajGoster("ok", "Görsel eklendi"); }
  else mesajGoster("hata", "Yüklenemedi");
}
async function asSlaytGorselSil(i) { AS.heroSlaytlar[i].gorsel = ""; anasayfaCiz(); await asKaydetOnizle(); mesajGoster("ok", "Görsel kaldırıldı"); }

// Panel görselleri
async function asPanelGorsel(n, input) {
  const f = input.files[0]; if (!f) return;
  const fd = new FormData(); fd.append("dosya", f);
  mesajGoster("ok", "Görsel yükleniyor…");
  const r = await fetch("/api/gorsel", { method: "POST", body: fd }); const j = await r.json();
  if (j.yol) { AS.panelGorseller[n] = j.yol; anasayfaCiz(); await asKaydetOnizle(); mesajGoster("ok", "Görsel eklendi"); }
  else mesajGoster("hata", "Yüklenemedi");
}
async function asPanelGorselSil(n) { AS.panelGorseller[n] = ""; anasayfaCiz(); await asKaydetOnizle(); }

// Slayt alanı otomatik çeviri (TR -> EN, EN boşsa)
async function asCevir(i, trAlan, enAlan) {
  const s = AS.heroSlaytlar[i];
  if (!s[trAlan] || s[enAlan]) return;
  const en = await cevir(s[trAlan]);
  if (en) { s[enAlan] = en; const el = $(`sl_${i}_${enAlan}`); if (el) el.value = en; }
}

async function anasayfaKaydet() {
  await anasayfaKaydetSessiz(); // hem yapı (anasayfa.json) hem yazılar (metinler.json)
  mesajGoster("ok", "Anasayfa kaydedildi · 'Siteyi Yayınla' ile yayına al"); await yukle();
  aktifSekme = "anasayfa"; sekmeSec("anasayfa");
}

// ================= SAYFA YAZILARI =================
const mid = (dil, a) => `m_${dil}_${a.replace(/\./g, "_")}`; // güvenli element id

// Hakkımızda çalışma kopyasını hazırla
function hkHazirla() {
  const v = D.hakkimizda && (D.hakkimizda.rakamlar || D.hakkimizda.degerler) ? D.hakkimizda : { rakamlar: [], degerler: [] };
  HK = JSON.parse(JSON.stringify(v));
  HK.rakamlar = Array.isArray(HK.rakamlar) ? HK.rakamlar : [];
  HK.degerler = Array.isArray(HK.degerler) ? HK.degerler : [];
}

// Hakkımızda yapısal düzenleyici (istatistikler + değerler)
function hakkimizdaYapisal() {
  const rakamKart = (r, i) => `
    <div class="kart" style="padding:10px;margin-bottom:8px">
      <div class="baslik-satir" style="margin-bottom:6px"><b>📊 İstatistik ${i + 1}</b>
        <button class="btn-sil" onclick="hkRakamSil(${i})">Sil</button></div>
      <div class="ikili">
        <div><label>Sayı</label><input value="${esc(r.sayi || "")}" oninput="HK.rakamlar[${i}].sayi=this.value" placeholder="1998" /></div>
        <div></div>
      </div>
      <div class="ikili">
        <div><label>Etiket (TR)</label><input id="hkr_tr_${i}" value="${esc(r.etiket || "")}" oninput="HK.rakamlar[${i}].etiket=this.value" onblur="hkRakamCevir(${i})" /></div>
        <div><label>Etiket (EN)</label><input id="hkr_en_${i}" value="${esc(r.etiketEn || "")}" oninput="HK.rakamlar[${i}].etiketEn=this.value" /></div>
      </div>
    </div>`;
  const degerKart = (d, i) => `
    <div class="kart" style="padding:10px;margin-bottom:8px">
      <div class="baslik-satir" style="margin-bottom:6px"><b>💎 Değer ${i + 1}</b>
        <button class="btn-sil" onclick="hkDegerSil(${i})">Sil</button></div>
      <label>Emoji / simge</label><input value="${esc(d.emoji || "")}" oninput="HK.degerler[${i}].emoji=this.value" style="max-width:90px" />
      <div class="ikili">
        <div><label>Başlık (TR)</label><input value="${esc(d.baslik || "")}" oninput="HK.degerler[${i}].baslik=this.value" onblur="hkDegerCevir(${i},'baslik','baslikEn','hkd_en_${i}')" /></div>
        <div><label>Başlık (EN)</label><input id="hkd_en_${i}" value="${esc(d.baslikEn || "")}" oninput="HK.degerler[${i}].baslikEn=this.value" /></div>
      </div>
      <div class="ikili">
        <div><label>Metin (TR)</label><textarea rows="2" oninput="HK.degerler[${i}].metin=this.value" onblur="hkDegerCevir(${i},'metin','metinEn','hkdm_en_${i}')">${esc(d.metin || "")}</textarea></div>
        <div><label>Metin (EN)</label><textarea id="hkdm_en_${i}" rows="2" oninput="HK.degerler[${i}].metinEn=this.value">${esc(d.metinEn || "")}</textarea></div>
      </div>
    </div>`;
  return `
    <hr style="border:none;border-top:1px solid #eee;margin:14px 0" />
    <div class="baslik-satir" style="margin-bottom:6px"><b>📊 İstatistikler (rakamlar)</b>
      <button class="btn btn-ikincil" style="padding:5px 12px;border-radius:8px;font-size:13px" onclick="hkRakamEkle()">+ Ekle</button></div>
    ${HK.rakamlar.map(rakamKart).join("")}
    <div class="baslik-satir" style="margin:12px 0 6px"><b>💎 Değerler</b>
      <button class="btn btn-ikincil" style="padding:5px 12px;border-radius:8px;font-size:13px" onclick="hkDegerEkle()">+ Ekle</button></div>
    ${HK.degerler.map(degerKart).join("")}`;
}

function metinlerCiz() {
  htTopla(); // mevcut metin düzenlemelerini koru (re-render öncesi)
  if (!HK) hkHazirla();

  const grupHtml = METIN_GRUPLARI.map((g) => {
    let icerik = (g.not ? `<p style="color:#888;margin-top:0">${g.not}</p>` : "")
      + g.alanlar.map((al) => htAlan(al.a, al.e, al.cok)).join("");
    if (g.id === "hakkimizda") icerik += hakkimizdaYapisal();
    return bolum(g.id, g.baslik, icerik);
  }).join("");

  $("icerik").innerHTML = `
    <div class="baslik-satir">
      <h2>📄 Sayfalar</h2>
      <div style="display:flex;gap:8px">
        <button class="btn btn-ikincil" onclick="bosIngilizceDoldur()">🌐 Boş İngilizceleri Doldur</button>
        <button class="btn" onclick="metinlerKaydet()">Kaydet</button>
      </div>
    </div>
    <p style="color:#888;margin:-6px 0 14px">Her sayfanın yazılarını başlığına tıklayıp düzenle. TR yazınca EN otomatik dolar.</p>
    ${grupHtml}
    <div class="form-alt"><button class="btn" onclick="metinlerKaydet()">Kaydet</button></div>`;
}

// Hakkımızda istatistik/değer işlemleri
async function hkOnizle() { await metinlerKaydetSessiz(); onizlemeYenile(); }
function hkRakamEkle() { HK.rakamlar.push({ sayi: "", etiket: "", etiketEn: "" }); metinlerCiz(); hkOnizle(); }
function hkRakamSil(i) { HK.rakamlar.splice(i, 1); metinlerCiz(); hkOnizle(); }
function hkDegerEkle() { HK.degerler.push({ emoji: "⭐", baslik: "", baslikEn: "", metin: "", metinEn: "" }); metinlerCiz(); hkOnizle(); }
function hkDegerSil(i) { HK.degerler.splice(i, 1); metinlerCiz(); hkOnizle(); }
async function hkRakamCevir(i) {
  const r = HK.rakamlar[i]; if (!r.etiket || r.etiketEn) return;
  const en = await cevir(r.etiket); if (en) { r.etiketEn = en; const el = $(`hkr_en_${i}`); if (el) el.value = en; }
}
async function hkDegerCevir(i, tr, en, enId) {
  const d = HK.degerler[i]; if (!d[tr] || d[en]) return;
  const ceviri = await cevir(d[tr]); if (ceviri) { d[en] = ceviri; const el = $(enId); if (el) el.value = ceviri; }
}

async function metinlerKaydet() {
  await metinlerKaydetSessiz();
  mesajGoster("ok", "Sayfalar kaydedildi · 'Siteyi Yayınla' ile yayına al");
  await yukle(); aktifSekme = "metinler"; sekmeSec("metinler");
}

// --- Otomatik çeviri (sunucu üzerinden TR -> EN) ---
async function cevir(metin) {
  try {
    const r = await fetch("/api/cevir", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ metin }) });
    const j = await r.json();
    return j.en || "";
  } catch { return ""; }
}

// İki giriş kutusu arası: TR id'sinden EN id'sine (EN boşsa) çevir
async function ceviriDoldur(trId, enId) {
  const t = $(trId), e = $(enId);
  if (!t || !e) return;
  const tr = t.value.trim();
  if (!tr || e.value.trim()) return; // boş TR veya dolu EN ise dokunma
  e.placeholder = "Çevriliyor…";
  const en = await cevir(tr);
  if (en) e.value = en;
  e.placeholder = "";
}

// Bir alanın TR'sini, EN boşsa çevirip doldur (kutudan çıkınca tetiklenir)
async function cevirAlan(a) {
  const trEl = $(mid("tr", a)), enEl = $(mid("en", a));
  if (!trEl || !enEl) return;
  const tr = trEl.value.trim();
  if (!tr || enEl.value.trim()) return; // boş TR veya dolu EN ise dokunma
  enEl.placeholder = "Çevriliyor…";
  const en = await cevir(tr);
  if (en) enEl.value = en;
  enEl.placeholder = "English";
}

// Tüm boş İngilizce alanları TR'den doldur
async function bosIngilizceDoldur() {
  let n = 0;
  mesajGoster("ok", "İngilizce alanlar çevriliyor, lütfen bekle…");
  // Ekrandaki tüm TR alanlarını gez (ht_tr_*); karşılığı boşsa çevir
  const trler = document.querySelectorAll('[id^="ht_tr_"]');
  for (const t of trler) {
    const e = document.getElementById(t.id.replace("ht_tr_", "ht_en_"));
    if (e && t.value.trim() && !e.value.trim()) {
      const en = await cevir(t.value.trim());
      if (en) { e.value = en; n++; }
    }
  }
  mesajGoster("ok", `${n} alan çevrildi. Kaydetmeyi unutma.`);
}

// ================= TASARIM (renkler + logo) =================
function tasarimCiz() {
  const t = D.tema || {};
  const renk = (id, etiket, varsayilan) => `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
      <input type="color" id="${id}" value="${esc(t[id] || varsayilan)}" style="width:52px;height:42px;padding:2px;cursor:pointer" />
      <div style="flex:1">
        <label style="margin:0">${etiket}</label>
        <input type="text" id="${id}_hex" value="${esc(t[id] || varsayilan)}" style="max-width:140px" oninput="document.getElementById('${id}').value=this.value" />
      </div>
    </div>`;

  $("icerik").innerHTML = `
    <div class="kart" style="max-width:560px;margin-bottom:14px">
      <h2>🎨 Renkler</h2>
      <p style="color:#888;margin-top:-6px">Marka renklerini değiştir; tüm siteye uygulanır.</p>
      ${renk("marka", "Ana marka rengi (kırmızı)", "#c1272d")}
      ${renk("markaKoyu", "Koyu marka (hover/telefon)", "#9e1d22")}
      ${renk("altin", "Altın/sarı vurgu", "#e6a02c")}
      ${renk("koyu", "Koyu metin/footer", "#1f1b16")}
      ${renk("krem", "Krem arka plan", "#fbf6ee")}
      <div class="form-alt"><button class="btn" onclick="temaKaydet()">Renkleri Kaydet</button></div>
    </div>

    <div class="kart" style="max-width:560px">
      <h2>🖼️ Logo</h2>
      <p style="color:#888;margin-top:-6px">Header'daki logoyu değiştir (PNG önerilir, şeffaf arka plan ideal).</p>
      <img id="logoOnizle" src="/logo.png?${Date.now()}" style="height:64px;background:#eee;border-radius:10px;padding:6px" onerror="this.style.visibility='hidden'" />
      <div style="margin-top:10px"><input type="file" accept="image/*" onchange="logoYukle(this)" /></div>
    </div>`;

  // color input -> hex kutusunu senkronla
  for (const id of ["marka", "markaKoyu", "altin", "koyu", "krem"]) {
    const c = $(id); if (c) c.oninput = () => { const h = $(id + "_hex"); if (h) h.value = c.value; };
  }
}

async function temaKaydet() {
  const t = {};
  for (const id of ["marka", "markaKoyu", "altin", "koyu", "krem"]) t[id] = $(id).value;
  await fetch("/api/tema", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(t) });
  mesajGoster("ok", "Renkler kaydedildi · 'Siteyi Yayınla' ile yayına al"); await yukle();
}

async function logoYukle(input) {
  const dosya = input.files[0]; if (!dosya) return;
  const fd = new FormData(); fd.append("dosya", dosya);
  mesajGoster("ok", "Logo yükleniyor…");
  const r = await fetch("/api/logo", { method: "POST", body: fd });
  const j = await r.json();
  if (j.ok) { $("logoOnizle").src = j.yol; $("logoOnizle").style.visibility = "visible"; mesajGoster("ok", "Logo güncellendi · 'Siteyi Yayınla' ile yayına al"); }
  else mesajGoster("hata", "Logo yüklenemedi");
}

// ================= ORTAK =================
async function sil(tur, id) {
  if (!confirm("Silmek istediğine emin misin?")) return;
  await fetch(`/api/${tur}/${id}`, { method: "DELETE" });
  mesajGoster("ok", "Silindi"); await yukle(); ciz();
}

async function yayinla() {
  const btn = $("yayinlaBtn");
  btn.disabled = true; btn.textContent = "⏳ Yayınlanıyor…";
  mesajGoster("ok", "Site yeniden derleniyor, lütfen bekle (1-2 dk)…");
  try {
    const r = await fetch("/api/yayinla", { method: "POST" });
    const j = await r.json();
    if (j.ok) mesajGoster("ok", "✅ Site güncellendi!");
    else mesajGoster("hata", "Yayınlama hatası: " + (j.hata || "").slice(0, 120));
  } catch { mesajGoster("hata", "Yayınlama sırasında hata oluştu"); }
  btn.disabled = false; btn.textContent = "🚀 Siteyi Yayınla";
}

// ================= CANLI ÖNİZLEME =================
const SITE_URL = ""; // site panelle aynı sunucuda (SSR) — aynı origin
let onizlemeAcik = false;

function onizlemeToggle() {
  onizlemeAcik = !onizlemeAcik;
  $("onizlemeBolum").classList.toggle("gizli", !onizlemeAcik);
  $("onizlemeBtn").classList.toggle("acik", onizlemeAcik);
  if (onizlemeAcik) { onizlemeSayfaAyarla(); onizlemeYenile(); }
}
function onizlemeYenile() {
  if (!onizlemeAcik) return;
  const p = $("onizlemeSayfa")?.value || "/";
  $("onizlemeFrame").src = SITE_URL + p + "?_=" + Date.now();
}
// Aktif sekmeye göre önizleme sayfasını seç
function onizlemeSayfaAyarla() {
  const sel = $("onizlemeSayfa"); if (!sel) return;
  const harita = { anasayfa: "/", urunler: "/menu", kategoriler: "/menu", subeler: "/subeler", metinler: "/", tasarim: "/", ayarlar: "/" };
  if (harita[aktifSekme] != null) sel.value = harita[aktifSekme];
}

// --- Sessiz kaydediciler (re-render etmeden POST; otomatik kayıt için) ---
async function anasayfaKaydetSessiz() {
  if (!AS) return;
  kayitDurum("kaydediliyor");
  htTopla(); // anasayfadaki metin alanlarını D.metinler'e topla
  D.anasayfa = JSON.parse(JSON.stringify(AS));
  await fetch("/api/anasayfa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(AS) });
  // Anasayfa yazıları metinler.json'a da yazılır (diğer sayfa yazıları korunur)
  if (D.metinler) await fetch("/api/metinler", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(D.metinler) });
  kayitDurum("kaydedildi");
}
async function temaKaydetSessiz() {
  const t = {};
  for (const id of ["marka", "markaKoyu", "altin", "koyu", "krem"]) { const el = $(id); if (el) t[id] = el.value; }
  if (!Object.keys(t).length) return;
  kayitDurum("kaydediliyor");
  D.tema = t;
  await fetch("/api/tema", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(t) });
  kayitDurum("kaydedildi");
}
async function metinlerKaydetSessiz() {
  kayitDurum("kaydediliyor");
  htTopla(); // ekrandaki tüm metin alanlarını D.metinler'e topla (diğer sayfalar korunur)
  if (D.metinler) await fetch("/api/metinler", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(D.metinler) });
  // Hakkımızda istatistik/değerleri de kaydet
  if (HK) {
    D.hakkimizda = JSON.parse(JSON.stringify(HK));
    await fetch("/api/hakkimizda", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(HK) });
  }
  kayitDurum("kaydedildi");
}

// --- Düzenledikçe otomatik kaydet + önizlemeyi tazele (tasarım sekmeleri) ---
let _otoZaman;
function otomatikKaydet() {
  if (!["anasayfa", "tasarim", "metinler"].includes(aktifSekme)) return;
  clearTimeout(_otoZaman);
  _otoZaman = setTimeout(async () => {
    if (aktifSekme === "anasayfa") await anasayfaKaydetSessiz();
    else if (aktifSekme === "tasarim") await temaKaydetSessiz();
    else if (aktifSekme === "metinler") await metinlerKaydetSessiz();
    onizlemeYenile();
  }, 700);
}
document.addEventListener("input", otomatikKaydet);
document.addEventListener("change", otomatikKaydet);

// Akordeon aç/kapa durumunu hatırla (re-render'da korunsun)
document.addEventListener("toggle", (e) => {
  const d = e.target;
  if (d && d.matches && d.matches("details.bolum")) {
    if (d.open) acikBolumler.add(d.dataset.bid); else acikBolumler.delete(d.dataset.bid);
  }
}, true);

durumKontrol();
