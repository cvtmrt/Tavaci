// ============================================================
//  İÇERİK KATMANI
//  Sayfalar veriyi BURADAN ister. Veri MariaDB'den (hesapyon_db)
//  her istekte (SSR) okunur — panelden yapılan değişiklik anında
//  sitede görünür.
//
//  DB erişilemezse / boşsa yerel yedeğe düşülür (site çökmesin):
//    menu.js, subeler.js ve buradaki inline varsayılanlar.
//
//  Dönen menü yapısı:
//    { kategori, kategoriEn, ikon, slug, urunler:[
//        { ad, adEn, aciklama, aciklamaEn, fiyat, gorsel, slug, katSlug } ] }
// ============================================================

import { slug, kategoriListesi } from "./menuYardimci.js";
import { subeler as subelerYerel } from "./subeler.js";
import { sorgu } from "../../lib/db.mjs";
import { anasayfaTopla, ANASAYFA_VARSAYILAN } from "../../lib/anasayfa.mjs";

// MENÜ — DB'den kur, yoksa yerel yedeğe düş
export async function menuGetir() {
  try {
    const kategoriler = await sorgu("SELECT id, ad, ad_en, ikon, sira FROM kategoriler ORDER BY sira ASC");
    const urunler = await sorgu(
      "SELECT id, ad, ad_en, aciklama, aciklama_en, fiyat, kategori_id, sira, gorsel, alerjenler, icindekiler, kalori, protein, karbonhidrat, yag FROM urunler ORDER BY sira ASC"
    );
    if (kategoriler.length) {
      return kategoriler.map((kat) => {
        const kSlug = slug(kat.ad);
        const gorulen = {};
        const katUrunleri = urunler
          .filter((u) => u.kategori_id === kat.id)
          .map((u, i) => {
            let s = slug(u.ad) || "urun";
            if (gorulen[s]) s = `${s}-${i + 1}`;
            gorulen[s] = true;
            return {
              ad: u.ad,
              adEn: u.ad_en || "",
              aciklama: u.aciklama || "",
              aciklamaEn: u.aciklama_en || "",
              fiyat: u.fiyat || "",
              gorsel: u.gorsel || "",
              alerjenler: u.alerjenler || "",
              icindekiler: u.icindekiler || "",
              kalori: u.kalori || "",
              protein: u.protein || "",
              karbonhidrat: u.karbonhidrat || "",
              yag: u.yag || "",
              slug: s,
              katSlug: kSlug,
            };
          });
        return { kategori: kat.ad, kategoriEn: kat.ad_en || "", ikon: kat.ikon || "🍽️", slug: kSlug, urunler: katUrunleri };
      });
    }
  } catch (e) {
    console.error("menuGetir DB hatası, yerel yedeğe düşülüyor:", e.message);
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
  try {
    const veri = await sorgu("SELECT id, sehir, semt, adres, telefon, saat FROM subeler ORDER BY id ASC");
    if (veri.length) return veri;
  } catch (e) {
    console.error("subeleriGetir DB hatası:", e.message);
  }
  return subelerYerel;
}

// ANASAYFA (hero slaytları, bölüm görünürlüğü, panel görselleri/linkleri, hikaye, cta, animasyon)
export async function anasayfaGetir() {
  try {
    const ayarSatirlar = await sorgu("SELECT anahtar, deger FROM anasayfa_ayar");
    const heroSatirlar = await sorgu("SELECT * FROM hero_slaytlar ORDER BY sira ASC");
    const ayarMap = Object.fromEntries(ayarSatirlar.map((r) => [r.anahtar, r.deger]));
    if (ayarSatirlar.length || heroSatirlar.length) {
      return anasayfaTopla(ayarMap, heroSatirlar);
    }
  } catch (e) {
    console.error("anasayfaGetir DB hatası:", e.message);
  }
  return ANASAYFA_VARSAYILAN;
}

// HAKKIMIZDA (istatistikler + değerler)
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
  try {
    const rakamlar = await sorgu("SELECT sayi, etiket, etiket_en FROM hakkimizda_rakamlar ORDER BY sira ASC");
    const degerler = await sorgu("SELECT emoji, baslik, baslik_en, metin, metin_en FROM hakkimizda_degerler ORDER BY sira ASC");
    return {
      rakamlar: rakamlar.length
        ? rakamlar.map((r) => ({ sayi: r.sayi, etiket: r.etiket, etiketEn: r.etiket_en || "" }))
        : varsayilan.rakamlar,
      degerler: degerler.length
        ? degerler.map((d) => ({ emoji: d.emoji, baslik: d.baslik, baslikEn: d.baslik_en || "", metin: d.metin || "", metinEn: d.metin_en || "" }))
        : varsayilan.degerler,
    };
  } catch (e) {
    console.error("hakkimizdaGetir DB hatası:", e.message);
    return varsayilan;
  }
}

// TEMA (renkler)
export async function temaGetir() {
  const varsayilan = {
    marka: "#c1272d",
    markaKoyu: "#9e1d22",
    altin: "#e6a02c",
    koyu: "#1f1b16",
    krem: "#fbf6ee",
  };
  try {
    const satirlar = await sorgu("SELECT anahtar, deger FROM tema");
    if (satirlar.length) {
      const veri = Object.fromEntries(satirlar.map((r) => [r.anahtar, r.deger]));
      return { ...varsayilan, ...veri };
    }
  } catch (e) {
    console.error("temaGetir DB hatası:", e.message);
  }
  return varsayilan;
}

// SAYFA METİNLERİ (i18n override: tr/en) — panelden düzenlenir.
// DilSecici'nin varsayılan sözlüğünün ÜZERİNE yazılır.
export async function metinlerGetir() {
  const cikti = { tr: {}, en: {} };
  try {
    const satirlar = await sorgu("SELECT anahtar, dil, deger FROM metinler");
    for (const r of satirlar) {
      if (!cikti[r.dil]) cikti[r.dil] = {};
      cikti[r.dil][r.anahtar] = r.deger ?? "";
    }
  } catch (e) {
    console.error("metinlerGetir DB hatası:", e.message);
  }
  return cikti;
}

// SİTE AYARLARI
export async function ayarlarGetir() {
  const varsayilan = {
    telefon: "0850 000 00 00",
    eposta: "bilgi@tavacimehmet.com",
    instagram: "https://www.instagram.com/tavacimehmetefendiii/",
    siparisLinki: "",
    whatsapp: "", // sadece rakam, ülke koduyla: 905xxxxxxxxx
  };
  try {
    const satirlar = await sorgu("SELECT anahtar, deger FROM ayarlar");
    if (satirlar.length) {
      const veri = Object.fromEntries(satirlar.map((r) => [r.anahtar, r.deger]));
      return { ...varsayilan, ...veri };
    }
  } catch (e) {
    console.error("ayarlarGetir DB hatası:", e.message);
  }
  return varsayilan;
}
