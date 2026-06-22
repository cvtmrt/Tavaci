// ============================================================
//  VERİTABANI KURULUMU (PostgreSQL) — Railway preDeployCommand
//
//  Her deploy'da çalışır (railway.json deploy.preDeployCommand):
//    1. Eksik tabloları sql/sema.pg.sql ile oluşturur (idempotent).
//    2. Veritabanı tamamen boşsa panel/veri içeriğini bir kez aktarır
//       ve admin hesabını oluşturur (ADMIN_SIFRE -> bcrypt).
//    3. Sonraki deploy'larda canlı veriye DOKUNMAZ.
//
//  Manuel zorla yeniden aktarım (mevcut veriyi JSON ile ezer):
//    node --env-file=panel/.env scripts/aktar.mjs
// ============================================================

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import bcrypt from "bcryptjs";
import { sorgu, islem, havuz } from "../lib/db.mjs";
import { ayarlariDuzlestir, HERO_ALANLAR } from "../lib/anasayfa.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const KOK = join(__dirname, "..");
const SEMA = join(KOK, "sql", "sema.pg.sql");
const VERI = join(KOK, "panel", "veri");

function oku(ad, varsayilan) {
  try { return JSON.parse(readFileSync(join(VERI, `${ad}.json`), "utf8")); }
  catch { return varsayilan; }
}

// --- Şema (çok ifadeli SQL'i tek seferde, idempotent) ---
export async function semaKur() {
  await sorgu(readFileSync(SEMA, "utf8"));
  console.log("✓ Veritabanı şeması hazır.");
}

// --- Admin hesabı (ADMIN_SIFRE -> bcrypt) ---
export async function adminKur() {
  const sifre = process.env.ADMIN_SIFRE || "tavaci123";
  const hash = await bcrypt.hash(sifre, 10);
  await sorgu(
    `INSERT INTO yoneticiler (kullanici, sifre_hash) VALUES ('admin', ?)
     ON CONFLICT (kullanici) DO UPDATE SET sifre_hash = EXCLUDED.sifre_hash`,
    [hash]
  );
  console.log("✓ admin hesabı ayarlandı (ADMIN_SIFRE).");
}

// --- İçerik tohumlama (panel/veri/*.json -> DB, upsert) ---
export async function tohumla() {
  await islem(async (b) => {
    const kategoriler = oku("kategoriler", []);
    for (const k of kategoriler) {
      await b.execute(
        `INSERT INTO kategoriler (id, ad, ad_en, ikon, sira) VALUES (?,?,?,?,?)
         ON CONFLICT (id) DO UPDATE SET ad=EXCLUDED.ad, ad_en=EXCLUDED.ad_en, ikon=EXCLUDED.ikon, sira=EXCLUDED.sira`,
        [k.id, k.ad || "", k.adEn || "", k.ikon || "", Number(k.sira) || 0]
      );
    }

    const urunler = oku("urunler", []);
    for (const u of urunler) {
      await b.execute(
        `INSERT INTO urunler (id, ad, ad_en, aciklama, aciklama_en, fiyat, kategori_id, sira, gorsel)
         VALUES (?,?,?,?,?,?,?,?,?)
         ON CONFLICT (id) DO UPDATE SET ad=EXCLUDED.ad, ad_en=EXCLUDED.ad_en, aciklama=EXCLUDED.aciklama,
           aciklama_en=EXCLUDED.aciklama_en, fiyat=EXCLUDED.fiyat, kategori_id=EXCLUDED.kategori_id,
           sira=EXCLUDED.sira, gorsel=EXCLUDED.gorsel`,
        [u.id, u.ad || "", u.adEn || "", u.aciklama || "", u.aciklamaEn || "",
         u.fiyat || "", u.kategoriId || null, Number(u.sira) || 0, u.gorsel || ""]
      );
    }

    const subeler = oku("subeler", []);
    for (const s of subeler) {
      await b.execute(
        `INSERT INTO subeler (id, sehir, semt, adres, telefon, saat) VALUES (?,?,?,?,?,?)
         ON CONFLICT (id) DO UPDATE SET sehir=EXCLUDED.sehir, semt=EXCLUDED.semt, adres=EXCLUDED.adres,
           telefon=EXCLUDED.telefon, saat=EXCLUDED.saat`,
        [s.id, s.sehir || "", s.semt || "", s.adres || "", s.telefon || "", s.saat || ""]
      );
    }

    const ayarlar = oku("ayarlar", {});
    for (const [anahtar, deger] of Object.entries(ayarlar)) {
      await b.execute(
        `INSERT INTO ayarlar (anahtar, deger) VALUES (?,?)
         ON CONFLICT (anahtar) DO UPDATE SET deger=EXCLUDED.deger`,
        [anahtar, String(deger ?? "")]
      );
    }

    const tema = oku("tema", {});
    for (const [anahtar, deger] of Object.entries(tema)) {
      await b.execute(
        `INSERT INTO tema (anahtar, deger) VALUES (?,?)
         ON CONFLICT (anahtar) DO UPDATE SET deger=EXCLUDED.deger`,
        [anahtar, String(deger ?? "")]
      );
    }

    const metinler = oku("metinler", { tr: {}, en: {} });
    for (const dil of Object.keys(metinler)) {
      for (const [anahtar, deger] of Object.entries(metinler[dil] || {})) {
        await b.execute(
          `INSERT INTO metinler (anahtar, dil, deger) VALUES (?,?,?)
           ON CONFLICT (anahtar, dil) DO UPDATE SET deger=EXCLUDED.deger`,
          [anahtar, dil, String(deger ?? "")]
        );
      }
    }

    const anasayfa = oku("anasayfa", {});
    const hero = Array.isArray(anasayfa.heroSlaytlar) ? anasayfa.heroSlaytlar : [];
    const kolonlar = ["id", ...HERO_ALANLAR.map(([, kol]) => kol), "sira"];
    const guncelle = kolonlar.slice(1).map((k) => `${k}=EXCLUDED.${k}`).join(", ");
    for (let i = 0; i < hero.length; i++) {
      const h = hero[i];
      const degerler = [h.id || `h${i + 1}`, ...HERO_ALANLAR.map(([js]) => h[js] ?? ""), Number(h.sira) || (i + 1) * 10];
      await b.execute(
        `INSERT INTO hero_slaytlar (${kolonlar.join(", ")}) VALUES (${kolonlar.map(() => "?").join(", ")})
         ON CONFLICT (id) DO UPDATE SET ${guncelle}`,
        degerler
      );
    }
    for (const { anahtar, deger } of ayarlariDuzlestir(anasayfa)) {
      await b.execute(
        `INSERT INTO anasayfa_ayar (anahtar, deger) VALUES (?,?)
         ON CONFLICT (anahtar) DO UPDATE SET deger=EXCLUDED.deger`,
        [anahtar, deger]
      );
    }

    const hakkimizda = oku("hakkimizda", { rakamlar: [], degerler: [] });
    const rakamlar = hakkimizda.rakamlar || [];
    for (let i = 0; i < rakamlar.length; i++) {
      const r = rakamlar[i];
      await b.execute(
        `INSERT INTO hakkimizda_rakamlar (id, sayi, etiket, etiket_en, sira) VALUES (?,?,?,?,?)
         ON CONFLICT (id) DO UPDATE SET sayi=EXCLUDED.sayi, etiket=EXCLUDED.etiket, etiket_en=EXCLUDED.etiket_en, sira=EXCLUDED.sira`,
        [r.id || `r${i + 1}`, r.sayi || "", r.etiket || "", r.etiketEn || "", Number(r.sira) || (i + 1) * 10]
      );
    }
    const degerler = hakkimizda.degerler || [];
    for (let i = 0; i < degerler.length; i++) {
      const d = degerler[i];
      await b.execute(
        `INSERT INTO hakkimizda_degerler (id, emoji, baslik, baslik_en, metin, metin_en, sira) VALUES (?,?,?,?,?,?,?)
         ON CONFLICT (id) DO UPDATE SET emoji=EXCLUDED.emoji, baslik=EXCLUDED.baslik, baslik_en=EXCLUDED.baslik_en,
           metin=EXCLUDED.metin, metin_en=EXCLUDED.metin_en, sira=EXCLUDED.sira`,
        [d.id || `d${i + 1}`, d.emoji || "", d.baslik || "", d.baslikEn || "", d.metin || "", d.metinEn || "", Number(d.sira) || (i + 1) * 10]
      );
    }

    console.log(`✓ Başlangıç verisi aktarıldı (${kategoriler.length} kategori, ${urunler.length} ürün, ${subeler.length} şube, ${hero.length} hero).`);
  });
}

// --- preDeploy ana akışı: güvenli, idempotent ---
async function main() {
  if (!process.env.ADMIN_SIFRE) throw new Error("ADMIN_SIFRE ortam değişkeni zorunlu");
  if (!process.env.DATABASE_URL && !process.env.PGHOST && !process.env.DB_HOST) {
    throw new Error("DATABASE_URL (veya PG*/DB_* bağlantı bilgileri) zorunlu");
  }

  await semaKur();

  const [durum] = await sorgu(`
    SELECT
      (SELECT COUNT(*) FROM yoneticiler) AS yonetici_sayisi,
      (SELECT COUNT(*) FROM kategoriler) AS kategori_sayisi
  `);

  if (Number(durum.yonetici_sayisi) > 0) {
    console.log("✓ Mevcut veritabanı bulundu; başlangıç verisi değiştirilmedi.");
    return;
  }
  if (Number(durum.kategori_sayisi) > 0) {
    throw new Error("Veritabanında içerik var fakat yönetici hesabı yok. Güvenlik için otomatik aktarım durduruldu.");
  }

  console.log("İlk kurulum algılandı; başlangıç verisi aktarılıyor...");
  await tohumla();
  await adminKur();
}

// Doğrudan çalıştırıldıysa yürüt (import edilince çalışmaz)
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
    .then(async () => { console.log("\n✓ Veritabanı kurulumu tamam."); await havuz().end(); })
    .catch(async (e) => {
      console.error("\n✗ db-kur hatası:", e.message);
      try { await havuz().end(); } catch {}
      process.exit(1);
    });
}
