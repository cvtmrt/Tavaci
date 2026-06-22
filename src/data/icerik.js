// ============================================================
//  İÇERİK KATMANI
//  Sayfalar veriyi BURADAN ister. Veri tamamen SENDE:
//  panel/veri/*.json dosyalarından okunur (kendi panelin yazar).
//  Dosya yoksa eski yerel veriye düşer (site yine çalışır).
//
//  Dönen menü yapısı:
//    { kategori, kategoriEn, ikon, slug, urunler:[
//        { ad, adEn, aciklama, aciklamaEn, fiyat, gorsel, slug, katSlug } ] }
// ============================================================

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { slug, kategoriListesi } from "./menuYardimci.js";
import { subeler as subelerYerel } from "./subeler.js";

const VERI = join(process.cwd(), "panel", "veri");

// Bir JSON dosyasını oku (yoksa null döndür)
function jsonOku(ad) {
  try {
    return JSON.parse(readFileSync(join(VERI, ad), "utf8"));
  } catch {
    return null;
  }
}

// MENÜ — panel JSON'larından kur, yoksa yerel yedeğe düş
// (Veri yerel/hızlı olduğu için önbellek yok; her düzenleme anında yansır.)
export async function menuGetir() {
  const kategoriler = jsonOku("kategoriler.json");
  const urunler = jsonOku("urunler.json");

  if (kategoriler && urunler) {
    const sirali = [...kategoriler].sort((a, b) => (a.sira || 0) - (b.sira || 0));
    return sirali.map((kat) => {
      const kSlug = slug(kat.ad);
      const gorulen = {};
      const katUrunleri = urunler
        .filter((u) => u.kategoriId === kat.id)
        .sort((a, b) => (a.sira || 0) - (b.sira || 0))
        .map((u, i) => {
          let s = slug(u.ad) || "urun";
          if (gorulen[s]) s = `${s}-${i + 1}`;
          gorulen[s] = true;
          return {
            ad: u.ad,
            adEn: u.adEn || "",
            aciklama: u.aciklama || "",
            aciklamaEn: u.aciklamaEn || "",
            fiyat: u.fiyat || "",
            gorsel: u.gorsel || "",
            slug: s,
            katSlug: kSlug,
          };
        });
      return { kategori: kat.ad, kategoriEn: kat.adEn || "", ikon: kat.ikon || "🍽️", slug: kSlug, urunler: katUrunleri };
    });
  }

  return kategoriListesi(); // yerel yedek
}

// Kategori kapak görseli (ilk görselli ürün)
export function kapak(kat) {
  const u = kat.urunler.find((x) => x.gorsel);
  return u ? u.gorsel : "";
}

// ŞUBELER
export async function subeleriGetir() {
  const veri = jsonOku("subeler.json");
  if (veri && veri.length) return veri;
  return subelerYerel;
}

// ANASAYFA (hero slaytları, bölüm görünürlüğü, panel görselleri/linkleri,
//           hikaye ve CTA yapısal alanları)
export async function anasayfaGetir() {
  const varsayilan = {
    bolumler: { hero: true, kesfet: true, hikaye: true, instagram: true, cta: true },
    heroSlaytlar: [],
    panelGorseller: { 1: "", 2: "", 3: "", 4: "" },
    panelLinkler: { 1: "/menu", 2: "/subeler", 3: "/hakkimizda", 4: "/iletisim" },
    hikaye: { emoji: "👨‍🍳", link: "/hakkimizda" },
    cta: { link: "/iletisim" },
    animasyon: {
      heroEfekt: "fade", // "fade" (yumuşak) | "slide" (kayma)
      heroSure: 4.5, // otomatik geçiş süresi (saniye)
      heroOtomatik: true, // otomatik dönsün mü
      scrollAcik: true, // kaydırınca beliren animasyonlar
      scrollSure: 700, // animasyon hızı (ms)
    },
  };
  const veri = jsonOku("anasayfa.json");
  if (!veri) return varsayilan;
  return {
    bolumler: { ...varsayilan.bolumler, ...(veri.bolumler || {}) },
    heroSlaytlar: Array.isArray(veri.heroSlaytlar) ? veri.heroSlaytlar : [],
    panelGorseller: { ...varsayilan.panelGorseller, ...(veri.panelGorseller || {}) },
    panelLinkler: { ...varsayilan.panelLinkler, ...(veri.panelLinkler || {}) },
    hikaye: { ...varsayilan.hikaye, ...(veri.hikaye || {}) },
    cta: { ...varsayilan.cta, ...(veri.cta || {}) },
    animasyon: { ...varsayilan.animasyon, ...(veri.animasyon || {}) },
  };
}

// HAKKIMIZDA (istatistikler + değerler) — panelden düzenlenir
export async function hakkimizdaGetir() {
  const varsayilan = {
    rakamlar: [
      { sayi: "1998", etiket: "Kuruluş yılı", etiketEn: "Founded" },
      { sayi: "4", etiket: "Şube", etiketEn: "Branches" },
      { sayi: "120+", etiket: "Çalışan", etiketEn: "Employees" },
      { sayi: "1M+", etiket: "Mutlu misafir", etiketEn: "Happy guests" },
    ],
    degerler: [
      { emoji: "🔥", baslik: "Gerçek Köz", baslikEn: "Real Charcoal", metin: "Hiçbir tavamız közsüz pişmez. Lezzetin sırrı ateşte.", metinEn: "None of our pans cook without charcoal. The secret of flavor is in the fire." },
      { emoji: "🌿", baslik: "Taze Malzeme", baslikEn: "Fresh Ingredients", metin: "Her sabah günlük tedarik, dondurulmuş ürün yok.", metinEn: "Daily supply every morning, no frozen products." },
      { emoji: "❤️", baslik: "Ev Sıcaklığı", baslikEn: "Home Warmth", metin: "Misafirimizi aile gibi ağırlarız.", metinEn: "We welcome our guests like family." },
    ],
  };
  const veri = jsonOku("hakkimizda.json");
  if (!veri) return varsayilan;
  return {
    rakamlar: Array.isArray(veri.rakamlar) && veri.rakamlar.length ? veri.rakamlar : varsayilan.rakamlar,
    degerler: Array.isArray(veri.degerler) && veri.degerler.length ? veri.degerler : varsayilan.degerler,
  };
}

// TEMA (renkler) — panelden, yoksa varsayılan marka renkleri
export async function temaGetir() {
  const varsayilan = {
    marka: "#c1272d",
    markaKoyu: "#9e1d22",
    altin: "#e6a02c",
    koyu: "#1f1b16",
    krem: "#fbf6ee",
  };
  const veri = jsonOku("tema.json");
  return veri ? { ...varsayilan, ...veri } : varsayilan;
}

// SİTE AYARLARI (önbelleksiz; düzenleme anında yansır)
export async function ayarlarGetir() {
  const varsayilan = {
    telefon: "0850 000 00 00",
    eposta: "bilgi@tavacimehmet.com",
    instagram: "https://www.instagram.com/tavacimehmetefendiii/",
    siparisLinki: "",
    whatsapp: "", // sadece rakam, ülke koduyla: 905xxxxxxxxx
  };
  const veri = jsonOku("ayarlar.json");
  return veri ? { ...varsayilan, ...veri } : varsayilan;
}
