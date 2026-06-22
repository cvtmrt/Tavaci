// ============================================================
//  VERİTABANI BAĞLANTI KATMANI (PostgreSQL)
//  Railway PostgreSQL — node-postgres (pg) connection pool.
//
//  Bağlantı önceliği:
//    1) DATABASE_URL  (Railway: ${{Postgres.DATABASE_URL}})
//    2) PG* / DB_* ortam değişkenleri
//
//  Çağrı yerleri MySQL'den taşındığı için "?" placeholder'ları
//  burada otomatik "$1,$2,..." (pg) biçimine çevrilir; böylece
//  sorgu/tek/islem arayüzü ve mevcut SQL'ler aynen kullanılır.
// ============================================================

import pg from "pg";
const { Pool } = pg;

// "?" -> "$1, $2, ..." (pg numaralı placeholder kullanır)
function ceviri(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

function baglantiAyari() {
  const url = process.env.DATABASE_URL;
  // Railway iç ağı (*.railway.internal) SSL gerektirmez; public proxy / DB_SSL=1 ise aç.
  const sslGerek = process.env.DB_SSL === "1" || (url ? /sslmode=require/.test(url) : false);
  const ssl = sslGerek ? { rejectUnauthorized: false } : false;
  if (url) return { connectionString: url, ssl, max: 5 };
  return {
    host: process.env.PGHOST || process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.PGPORT || process.env.DB_PORT || 5432),
    user: process.env.PGUSER || process.env.DB_USER,
    password: process.env.PGPASSWORD || process.env.DB_PASS,
    database: process.env.PGDATABASE || process.env.DB_NAME,
    ssl,
    max: 5,
  };
}

// Tek bir paylaşılan havuz (panel + site aynı süreçte)
let havuzNesnesi;
export function havuz() {
  if (!havuzNesnesi) havuzNesnesi = new Pool(baglantiAyari());
  return havuzNesnesi;
}

// Sorgu yardımcısı: satır dizisi döndürür
export async function sorgu(sql, parametreler = []) {
  const { rows } = await havuz().query(ceviri(sql), parametreler);
  return rows;
}

// Tek satır (yoksa null)
export async function tek(sql, parametreler = []) {
  const satirlar = await sorgu(sql, parametreler);
  return satirlar[0] || null;
}

// Transaction içinde bir iş yürüt. Callback'e MySQL uyumlu bir sarmal verilir:
//   b.execute(sql, params) / b.query(sql, params) — ikisi de "?" -> "$n" çevirir.
export async function islem(fn) {
  const istemci = await havuz().connect();
  const sarmal = {
    execute: (sql, p = []) => istemci.query(ceviri(sql), p),
    query: (sql, p = []) => istemci.query(ceviri(sql), p),
  };
  try {
    await istemci.query("BEGIN");
    const sonuc = await fn(sarmal);
    await istemci.query("COMMIT");
    return sonuc;
  } catch (e) {
    await istemci.query("ROLLBACK");
    throw e;
  } finally {
    istemci.release();
  }
}
