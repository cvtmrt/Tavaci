// ============================================================
//  MENÜ YARDIMCILARI
//  Kategori ve ürünler için benzersiz "slug" (URL parçası) üretir.
//  Hem menü sayfaları hem de detay sayfaları bunu kullanır ki
//  bağlantılar her yerde aynı olsun.
// ============================================================

import { menu } from "./menu.js";

// Türkçe karakterleri sadeleştirip URL-güvenli slug üret
export function slug(metin) {
  return (metin || "")
    .toLocaleLowerCase("tr")
    .replace(/[çÇ]/g, "c").replace(/[ğĞ]/g, "g").replace(/[ıİ]/g, "i")
    .replace(/[öÖ]/g, "o").replace(/[şŞ]/g, "s").replace(/[üÜ]/g, "u")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// Kategorileri ve ürünleri benzersiz slug'larla döndür.
// Aynı kategoride aynı ada sahip ürün olursa sonuna sıra eklenir.
export function kategoriListesi() {
  return menu.map((kat) => {
    const kSlug = slug(kat.kategori);
    const gorulen = {};
    const urunler = kat.urunler.map((u, i) => {
      let s = slug(u.ad) || "urun";
      if (gorulen[s]) s = `${s}-${i + 1}`; // çakışmayı önle
      gorulen[s] = true;
      return { ...u, slug: s, katSlug: kSlug };
    });
    return { ...kat, slug: kSlug, urunler };
  });
}

// Kategori kapak görseli: ilk görselli ürünün fotoğrafı
export function kapak(kat) {
  const u = kat.urunler.find((x) => x.gorsel);
  return u ? u.gorsel : "";
}
