// ============================================================
//  KURULUM SQL ÜRETİCİ
//  panel/veri/*.json -> tek dosya: sql/kurulum.sql
//  (şema + tüm veriler + bcrypt admin parolası)
//
//  DB'ye bağlanmaz; sadece yerel dosyaları okur.
//  Çalıştırma:  node scripts/sql-uret.mjs
//  Sonra phpMyAdmin > hesapyon_Tavaci > Import ile yükle.
// ============================================================

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import { ayarlariDuzlestir, HERO_ALANLAR } from "../lib/anasayfa.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const KOK = join(__dirname, "..");
const VERI = join(KOK, "panel", "veri");

const oku = (ad, vars) => {
  try { return JSON.parse(readFileSync(join(VERI, `${ad}.json`), "utf8")); }
  catch { return vars; }
};

// MySQL string/sayı literal kaçışı
const q = (v) => {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "NULL";
  const s = String(v)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");
  return `'${s}'`;
};

// Bir tablo için toplu INSERT üret
function insert(tablo, kolonlar, satirlar) {
  if (!satirlar.length) return `-- ${tablo}: veri yok\n`;
  const degerler = satirlar
    .map((s) => "  (" + kolonlar.map((k) => q(s[k])).join(", ") + ")")
    .join(",\n");
  return `INSERT INTO ${tablo} (${kolonlar.join(", ")}) VALUES\n${degerler};\n`;
}

async function uret() {
  const parcalar = [];
  parcalar.push("-- Tavacı Mehmet — kurulum (şema + veri). Hedef: hesapyon_Tavaci");
  parcalar.push("SET NAMES utf8mb4;");
  parcalar.push("SET FOREIGN_KEY_CHECKS=0;\n");

  // Temiz kurulum için mevcut tabloları düşür
  const tumTablolar = [
    "urunler", "kategoriler", "subeler", "ayarlar", "tema", "metinler",
    "hero_slaytlar", "anasayfa_ayar", "hakkimizda_rakamlar", "hakkimizda_degerler", "yoneticiler",
  ];
  parcalar.push(tumTablolar.map((t) => `DROP TABLE IF EXISTS ${t};`).join("\n") + "\n");

  // Şema (sema.sql aynen)
  parcalar.push("-- ŞEMA");
  parcalar.push(readFileSync(join(KOK, "sql", "sema.sql"), "utf8")
    .replace(/^[\s\S]*?SET NAMES utf8mb4;\s*/, "") // baştaki yorum + SET NAMES tekrarını at
    .trim() + "\n");

  parcalar.push("-- VERİLER");

  // KATEGORİLER
  const kategoriler = oku("kategoriler", []);
  parcalar.push(insert("kategoriler", ["id", "ad", "ad_en", "ikon", "sira"],
    kategoriler.map((k) => ({ id: k.id, ad: k.ad || "", ad_en: k.adEn || "", ikon: k.ikon || "", sira: Number(k.sira) || 0 }))));

  // ÜRÜNLER
  const urunler = oku("urunler", []);
  parcalar.push(insert("urunler", ["id", "ad", "ad_en", "aciklama", "aciklama_en", "fiyat", "kategori_id", "sira", "gorsel"],
    urunler.map((u) => ({ id: u.id, ad: u.ad || "", ad_en: u.adEn || "", aciklama: u.aciklama || "", aciklama_en: u.aciklamaEn || "", fiyat: u.fiyat || "", kategori_id: u.kategoriId || null, sira: Number(u.sira) || 0, gorsel: u.gorsel || "" }))));

  // ŞUBELER
  const subeler = oku("subeler", []);
  parcalar.push(insert("subeler", ["id", "sehir", "semt", "adres", "telefon", "saat"],
    subeler.map((s) => ({ id: s.id, sehir: s.sehir || "", semt: s.semt || "", adres: s.adres || "", telefon: s.telefon || "", saat: s.saat || "" }))));

  // AYARLAR
  const ayarlar = oku("ayarlar", {});
  parcalar.push(insert("ayarlar", ["anahtar", "deger"],
    Object.entries(ayarlar).map(([anahtar, deger]) => ({ anahtar, deger: String(deger ?? "") }))));

  // TEMA
  const tema = oku("tema", {});
  parcalar.push(insert("tema", ["anahtar", "deger"],
    Object.entries(tema).map(([anahtar, deger]) => ({ anahtar, deger: String(deger ?? "") }))));

  // METİNLER
  const metinler = oku("metinler", { tr: {}, en: {} });
  const metinSatir = [];
  for (const dil of Object.keys(metinler))
    for (const [anahtar, deger] of Object.entries(metinler[dil] || {}))
      metinSatir.push({ anahtar, dil, deger: String(deger ?? "") });
  parcalar.push(insert("metinler", ["anahtar", "dil", "deger"], metinSatir));

  // ANASAYFA -> hero_slaytlar + anasayfa_ayar
  const anasayfa = oku("anasayfa", {});
  const hero = Array.isArray(anasayfa.heroSlaytlar) ? anasayfa.heroSlaytlar : [];
  const heroKol = ["id", ...HERO_ALANLAR.map(([, kol]) => kol), "sira"];
  const heroSatir = hero.map((h, i) => {
    const o = { id: h.id || `h${i + 1}`, sira: i * 10 };
    for (const [js, kol] of HERO_ALANLAR) o[kol] = h[js] ?? "";
    return o;
  });
  parcalar.push(insert("hero_slaytlar", heroKol, heroSatir));

  const ayarCiftleri = ayarlariDuzlestir(anasayfa);
  parcalar.push(insert("anasayfa_ayar", ["anahtar", "deger"], ayarCiftleri));

  // HAKKIMIZDA
  const hakkimizda = oku("hakkimizda", { rakamlar: [], degerler: [] });
  parcalar.push(insert("hakkimizda_rakamlar", ["id", "sayi", "etiket", "etiket_en", "sira"],
    (hakkimizda.rakamlar || []).map((r, i) => ({ id: r.id || `r${i + 1}`, sayi: r.sayi || "", etiket: r.etiket || "", etiket_en: r.etiketEn || "", sira: i * 10 }))));
  parcalar.push(insert("hakkimizda_degerler", ["id", "emoji", "baslik", "baslik_en", "metin", "metin_en", "sira"],
    (hakkimizda.degerler || []).map((d, i) => ({ id: d.id || `d${i + 1}`, emoji: d.emoji || "", baslik: d.baslik || "", baslik_en: d.baslikEn || "", metin: d.metin || "", metin_en: d.metinEn || "", sira: i * 10 }))));

  // YÖNETİCİ (bcrypt)
  const sifre = process.env.ADMIN_SIFRE || "123456";
  const hash = await bcrypt.hash(sifre, 10);
  parcalar.push(insert("yoneticiler", ["kullanici", "sifre_hash"], [{ kullanici: "admin", sifre_hash: hash }]));

  parcalar.push("\nSET FOREIGN_KEY_CHECKS=1;");

  const cikti = parcalar.join("\n");
  writeFileSync(join(KOK, "sql", "kurulum.sql"), cikti, "utf8");

  console.log("✓ sql/kurulum.sql üretildi.");
  console.log(`  kategoriler: ${kategoriler.length}, urunler: ${urunler.length}, subeler: ${subeler.length}`);
  console.log(`  metinler: ${metinSatir.length}, hero: ${heroSatir.length}, anasayfa_ayar: ${ayarCiftleri.length}`);
  console.log(`  admin parolası (bcrypt): "${sifre}"`);
}

uret().catch((e) => { console.error("Hata:", e); process.exit(1); });
