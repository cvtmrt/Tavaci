// ============================================================
//  MANUEL ZORLA AKTARIM: panel/veri/*.json -> PostgreSQL
//
//  db-kur.mjs güvenlik için yalnızca BOŞ veritabanını tohumlar.
//  Bu script ise koşulsuz çalışır: şemayı kurar, içeriği JSON'dan
//  upsert eder (mevcut veriyi EZER) ve admin'i ADMIN_SIFRE'den yazar.
//
//  Çalıştırma (proje kökünden):
//    node --env-file=panel/.env scripts/aktar.mjs
// ============================================================

import { semaKur, tohumla, adminKur } from "./db-kur.mjs";
import { havuz } from "../lib/db.mjs";

semaKur()
  .then(tohumla)
  .then(adminKur)
  .then(async () => { console.log("\n✓ Zorla aktarım tamamlandı."); await havuz().end(); })
  .catch(async (e) => {
    console.error("\n✗ Aktarım hatası:", e.message);
    try { await havuz().end(); } catch {}
    process.exit(1);
  });
