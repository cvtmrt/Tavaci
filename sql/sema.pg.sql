-- ============================================================
--  TAVACI MEHMET - VERİTABANI ŞEMASI (PostgreSQL / Railway)
--
--  Postgres UTF-8 varsayılan olduğundan Türkçe karakter + emoji
--  (🍗 🔥) ekstra ayar gerektirmez. Şema idempotenttir
--  (CREATE TABLE IF NOT EXISTS) — scripts/db-kur.mjs her deploy'da
--  çalıştırır.
-- ============================================================

-- --- KATEGORİLER ---
CREATE TABLE IF NOT EXISTS kategoriler (
  id     VARCHAR(64)  PRIMARY KEY,
  ad     VARCHAR(255) NOT NULL DEFAULT '',
  ad_en  VARCHAR(255) NOT NULL DEFAULT '',
  ikon   VARCHAR(32)  NOT NULL DEFAULT '',
  sira   INTEGER      NOT NULL DEFAULT 0
);

-- --- ÜRÜNLER ---
CREATE TABLE IF NOT EXISTS urunler (
  id           VARCHAR(64)   PRIMARY KEY,
  ad           VARCHAR(255)  NOT NULL DEFAULT '',
  ad_en        VARCHAR(255)  NOT NULL DEFAULT '',
  aciklama     TEXT,
  aciklama_en  TEXT,
  fiyat        VARCHAR(64)   NOT NULL DEFAULT '',
  kategori_id  VARCHAR(64)   REFERENCES kategoriler (id) ON DELETE CASCADE ON UPDATE CASCADE,
  sira         INTEGER       NOT NULL DEFAULT 0,
  gorsel       VARCHAR(1024) NOT NULL DEFAULT '',
  alerjenler   TEXT,                            -- virgülle ayrık (ör. "Gluten, Süt")
  icindekiler  TEXT,                            -- "İçinde Neler Var?" metni
  kalori       VARCHAR(64)   NOT NULL DEFAULT '',
  protein      VARCHAR(64)   NOT NULL DEFAULT '',
  karbonhidrat VARCHAR(64)   NOT NULL DEFAULT '',
  yag          VARCHAR(64)   NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_urun_kategori ON urunler (kategori_id);

-- Mevcut (eski) veritabanları için: kolonlar yoksa eklenir (veri korunur).
ALTER TABLE urunler ADD COLUMN IF NOT EXISTS alerjenler   TEXT;
ALTER TABLE urunler ADD COLUMN IF NOT EXISTS icindekiler  TEXT;
ALTER TABLE urunler ADD COLUMN IF NOT EXISTS kalori       VARCHAR(64) NOT NULL DEFAULT '';
ALTER TABLE urunler ADD COLUMN IF NOT EXISTS protein      VARCHAR(64) NOT NULL DEFAULT '';
ALTER TABLE urunler ADD COLUMN IF NOT EXISTS karbonhidrat VARCHAR(64) NOT NULL DEFAULT '';
ALTER TABLE urunler ADD COLUMN IF NOT EXISTS yag          VARCHAR(64) NOT NULL DEFAULT '';

-- --- ŞUBELER ---
CREATE TABLE IF NOT EXISTS subeler (
  id       VARCHAR(64)  PRIMARY KEY,
  sehir    VARCHAR(128) NOT NULL DEFAULT '',
  semt     VARCHAR(128) NOT NULL DEFAULT '',
  adres    VARCHAR(512) NOT NULL DEFAULT '',
  telefon  VARCHAR(64)  NOT NULL DEFAULT '',
  saat     VARCHAR(128) NOT NULL DEFAULT ''
);

-- --- AYARLAR (anahtar-değer) ---
CREATE TABLE IF NOT EXISTS ayarlar (
  anahtar  VARCHAR(128) PRIMARY KEY,
  deger    TEXT
);

-- --- TEMA (anahtar-değer: renkler) ---
CREATE TABLE IF NOT EXISTS tema (
  anahtar  VARCHAR(128) PRIMARY KEY,
  deger    VARCHAR(64)
);

-- --- METİNLER (i18n: anahtar + dil) ---
CREATE TABLE IF NOT EXISTS metinler (
  anahtar  VARCHAR(191) NOT NULL,
  dil      VARCHAR(8)   NOT NULL,
  deger    TEXT,
  PRIMARY KEY (anahtar, dil)
);

-- --- ANASAYFA HERO SLAYTLARI ---
CREATE TABLE IF NOT EXISTS hero_slaytlar (
  id            VARCHAR(64)   PRIMARY KEY,
  ust_baslik    VARCHAR(255)  NOT NULL DEFAULT '',
  ust_baslik_en VARCHAR(255)  NOT NULL DEFAULT '',
  baslik        VARCHAR(255)  NOT NULL DEFAULT '',
  baslik_en     VARCHAR(255)  NOT NULL DEFAULT '',
  alt_yazi      TEXT,
  alt_yazi_en   TEXT,
  buton         VARCHAR(128)  NOT NULL DEFAULT '',
  buton_en      VARCHAR(128)  NOT NULL DEFAULT '',
  link          VARCHAR(512)  NOT NULL DEFAULT '',
  gorsel        VARCHAR(1024) NOT NULL DEFAULT '',
  renk          VARCHAR(128)  NOT NULL DEFAULT '',
  emoji         VARCHAR(32)   NOT NULL DEFAULT '',
  sira          INTEGER       NOT NULL DEFAULT 0
);

-- --- ANASAYFA AYARLARI (anahtar-değer: bolumler/panel/hikaye/cta/animasyon) ---
CREATE TABLE IF NOT EXISTS anasayfa_ayar (
  anahtar  VARCHAR(191) PRIMARY KEY,
  deger    TEXT
);

-- --- HAKKIMIZDA: RAKAMLAR ---
CREATE TABLE IF NOT EXISTS hakkimizda_rakamlar (
  id         VARCHAR(64)  PRIMARY KEY,
  sayi       VARCHAR(64)  NOT NULL DEFAULT '',
  etiket     VARCHAR(255) NOT NULL DEFAULT '',
  etiket_en  VARCHAR(255) NOT NULL DEFAULT '',
  sira       INTEGER      NOT NULL DEFAULT 0
);

-- --- HAKKIMIZDA: DEĞERLER ---
CREATE TABLE IF NOT EXISTS hakkimizda_degerler (
  id         VARCHAR(64)  PRIMARY KEY,
  emoji      VARCHAR(32)  NOT NULL DEFAULT '',
  baslik     VARCHAR(255) NOT NULL DEFAULT '',
  baslik_en  VARCHAR(255) NOT NULL DEFAULT '',
  metin      TEXT,
  metin_en   TEXT,
  sira       INTEGER      NOT NULL DEFAULT 0
);

-- --- YÖNETİCİLER (panel girişi, bcrypt) ---
CREATE TABLE IF NOT EXISTS yoneticiler (
  id          SERIAL       PRIMARY KEY,
  kullanici   VARCHAR(128) NOT NULL DEFAULT 'admin' UNIQUE,
  sifre_hash  VARCHAR(255) NOT NULL
);
