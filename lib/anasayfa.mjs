// ============================================================
//  ANASAYFA DÜZLEŞTİRME YARDIMCILARI
//  anasayfa verisi iç içe bir nesne; "hero_slaytlar" tablosu +
//  "anasayfa_ayar" anahtar-değer tablosu olarak saklanır.
//  Burada nesne <-> tablo dönüşümü tek yerde tutulur.
//  (migration, panel sunucusu ve site içerik katmanı paylaşır)
// ============================================================

// Hero slayt alanları (JSON camelCase -> DB snake_case)
export const HERO_ALANLAR = [
  ["ustBaslik", "ust_baslik"],
  ["ustBaslikEn", "ust_baslik_en"],
  ["baslik", "baslik"],
  ["baslikEn", "baslik_en"],
  ["altYazi", "alt_yazi"],
  ["altYaziEn", "alt_yazi_en"],
  ["buton", "buton"],
  ["butonEn", "buton_en"],
  ["link", "link"],
  ["gorsel", "gorsel"],
  ["renk", "renk"],
  ["emoji", "emoji"],
];

// Varsayılan anasayfa yapısı (site fallback'i ile aynı)
export const ANASAYFA_VARSAYILAN = {
  bolumler: { hero: true, kesfet: true, hikaye: true, instagram: true, cta: true },
  heroSlaytlar: [],
  panelGorseller: { 1: "", 2: "", 3: "", 4: "" },
  panelLinkler: { 1: "/menu", 2: "/subeler", 3: "/hakkimizda", 4: "/iletisim" },
  hikaye: { emoji: "👨‍🍳", link: "/hakkimizda" },
  cta: { link: "/iletisim" },
  animasyon: {
    heroEfekt: "fade",
    heroSure: 4.5,
    heroOtomatik: true,
    scrollAcik: true,
    scrollSure: 700,
  },
};

// İç içe nesneyi "anasayfa_ayar" anahtar-değer çiftlerine düzleştir.
// heroSlaytlar hariç (o ayrı tabloya gider).
// Döndürür: [{ anahtar, deger }] — deger JSON string (tip korunur).
export function ayarlariDuzlestir(veri) {
  const ciftler = [];
  const ekle = (onek, nesne) => {
    for (const [k, v] of Object.entries(nesne || {})) {
      ciftler.push({ anahtar: `${onek}.${k}`, deger: JSON.stringify(v) });
    }
  };
  ekle("bolumler", veri.bolumler);
  ekle("panelGorseller", veri.panelGorseller);
  ekle("panelLinkler", veri.panelLinkler);
  ekle("hikaye", veri.hikaye);
  ekle("cta", veri.cta);
  ekle("animasyon", veri.animasyon);
  return ciftler;
}

// "anasayfa_ayar" anahtar-değer haritası + hero satırlarından
// iç içe anasayfa nesnesini (varsayılanlarla birleştirerek) yeniden kur.
// ayarMap: { "bolumler.hero": '<json>' , ... }
// heroSatirlar: DB satırları (snake_case)
export function anasayfaTopla(ayarMap, heroSatirlar) {
  const grup = (onek) => {
    const cikti = {};
    const ek = `${onek}.`;
    for (const [anahtar, ham] of Object.entries(ayarMap)) {
      if (!anahtar.startsWith(ek)) continue;
      const alt = anahtar.slice(ek.length);
      try { cikti[alt] = JSON.parse(ham); } catch { cikti[alt] = ham; }
    }
    return cikti;
  };

  const v = ANASAYFA_VARSAYILAN;
  const heroSlaytlar = (heroSatirlar || []).map((r) => {
    const o = { id: r.id };
    for (const [js, kol] of HERO_ALANLAR) o[js] = r[kol] ?? "";
    return o;
  });

  return {
    bolumler: { ...v.bolumler, ...grup("bolumler") },
    heroSlaytlar,
    panelGorseller: { ...v.panelGorseller, ...grup("panelGorseller") },
    panelLinkler: { ...v.panelLinkler, ...grup("panelLinkler") },
    hikaye: { ...v.hikaye, ...grup("hikaye") },
    cta: { ...v.cta, ...grup("cta") },
    animasyon: { ...v.animasyon, ...grup("animasyon") },
  };
}
