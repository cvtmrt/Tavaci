// ============================================================
//  VERİTABANI BAĞLANTI + TEK TABLO TESTİ (PostgreSQL)
//  - Bağlantıyı dener (DATABASE_URL veya panel/.env içindeki PG*/DB_*)
//  - "kategoriler" tablosunu oluşturur
//  - Türkçe + emoji içeren bir satır yazar, geri okur
//  - Karakterler bozulmadıysa charset doğru demektir (Postgres UTF-8)
//
//  Çalıştırma:
//    node --env-file=panel/.env scripts/db-test.mjs
// ============================================================

import { havuz, sorgu } from "../lib/db.mjs";

const TEST_SATIR = { id: "test-emoji", ad: "Tavada Köfte ışığı 🍗🔥", ad_en: "Test", ikon: "🍽️", sira: 999 };

async function calistir() {
  console.log("Bağlantı:");
  console.log("  url  :", process.env.DATABASE_URL ? "(DATABASE_URL kullanılıyor)" : "(PG*/DB_* değişkenleri)");
  console.log("  host :", process.env.PGHOST || process.env.DB_HOST || "127.0.0.1");
  console.log("  db   :", process.env.PGDATABASE || process.env.DB_NAME || "(varsayılan)");
  console.log("");

  // 1) Bağlantı + sürüm
  const v = await sorgu("SELECT version() AS surum");
  console.log("✓ Bağlandı:", v[0].surum.split(",")[0]);

  // 2) Tek tablo oluştur
  await sorgu(`CREATE TABLE IF NOT EXISTS kategoriler (
    id    VARCHAR(64)  PRIMARY KEY,
    ad    VARCHAR(255) NOT NULL DEFAULT '',
    ad_en VARCHAR(255) NOT NULL DEFAULT '',
    ikon  VARCHAR(32)  NOT NULL DEFAULT '',
    sira  INTEGER      NOT NULL DEFAULT 0
  )`);
  console.log("✓ 'kategoriler' tablosu hazır.");

  // 3) Türkçe + emoji satır yaz
  await sorgu(
    `INSERT INTO kategoriler (id, ad, ad_en, ikon, sira) VALUES (?,?,?,?,?)
     ON CONFLICT (id) DO UPDATE SET ad=EXCLUDED.ad, ikon=EXCLUDED.ikon`,
    [TEST_SATIR.id, TEST_SATIR.ad, TEST_SATIR.ad_en, TEST_SATIR.ikon, TEST_SATIR.sira]
  );

  // 4) Geri oku ve karşılaştır
  const geri = await sorgu("SELECT ad, ikon FROM kategoriler WHERE id=?", [TEST_SATIR.id]);
  const okunan = geri[0];
  console.log("  Yazılan :", TEST_SATIR.ad, TEST_SATIR.ikon);
  console.log("  Okunan  :", okunan.ad, okunan.ikon);
  const charsetTamam = okunan.ad === TEST_SATIR.ad && okunan.ikon === TEST_SATIR.ikon;
  console.log(charsetTamam ? "✓ Charset DOĞRU (Türkçe + emoji bozulmadı)." : "✗ Charset SORUNLU!");

  // 5) Test satırını temizle
  await sorgu("DELETE FROM kategoriler WHERE id=?", [TEST_SATIR.id]);
  console.log("✓ Test satırı silindi.");

  await havuz().end();
  console.log("\nSONUÇ: Bağlantı ve tablo testi BAŞARILI.");
}

calistir().catch(async (e) => {
  console.error("\n✗ TEST BAŞARISIZ:", e.code || "", e.message);
  if (e.code === "ECONNREFUSED") console.error("  → DB sunucusu bu adreste dinlemiyor (host/port yanlış ya da uzaktan erişim kapalı).");
  if (e.code === "28P01") console.error("  → Kullanıcı adı/şifre yanlış.");
  if (e.code === "ENOTFOUND") console.error("  → Host bulunamadı (DATABASE_URL/PGHOST yanlış).");
  if (e.code === "3D000") console.error("  → Veritabanı adı yanlış.");
  try { await havuz().end(); } catch {}
  process.exit(1);
});
