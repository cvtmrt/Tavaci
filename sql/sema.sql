-- ============================================================
--  TAVACI MEHMET - VERİTABANI ŞEMASI
--  Hedef: "hesapyon_Tavaci" veritabanı (cPanel / MariaDB 10.6)
--
--  ÖNEMLİ: Sunucu varsayılanı latin1/cp1252'dir. Türkçe karakter
--  ve EMOJİ (🍗 🔥) saklanabilmesi için tüm tablolar utf8mb4
--  olmak ZORUNDA. Bağlantı da utf8mb4 olmalı (lib/db.mjs).
--
--  Çalıştırma (phpMyAdmin > hesapyon_Tavaci > Import) veya:
--    mysql hesapyon_Tavaci < sql/sema.sql
-- ============================================================

SET NAMES utf8mb4;

-- --- KATEGORİLER ---
CREATE TABLE IF NOT EXISTS kategoriler (
  id        VARCHAR(64)  NOT NULL,
  ad        VARCHAR(255) NOT NULL DEFAULT '',
  ad_en     VARCHAR(255) NOT NULL DEFAULT '',
  ikon      VARCHAR(32)  NOT NULL DEFAULT '',
  sira      INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --- ÜRÜNLER ---
CREATE TABLE IF NOT EXISTS urunler (
  id           VARCHAR(64)  NOT NULL,
  ad           VARCHAR(255) NOT NULL DEFAULT '',
  ad_en        VARCHAR(255) NOT NULL DEFAULT '',
  aciklama     TEXT         NULL,
  aciklama_en  TEXT         NULL,
  fiyat        VARCHAR(64)  NOT NULL DEFAULT '',
  kategori_id  VARCHAR(64)  NULL,
  sira         INT          NOT NULL DEFAULT 0,
  gorsel       VARCHAR(1024) NOT NULL DEFAULT '',
  PRIMARY KEY (id),
  KEY idx_urun_kategori (kategori_id),
  CONSTRAINT fk_urun_kategori FOREIGN KEY (kategori_id)
    REFERENCES kategoriler (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --- ŞUBELER ---
CREATE TABLE IF NOT EXISTS subeler (
  id       VARCHAR(64)  NOT NULL,
  sehir    VARCHAR(128) NOT NULL DEFAULT '',
  semt     VARCHAR(128) NOT NULL DEFAULT '',
  adres    VARCHAR(512) NOT NULL DEFAULT '',
  telefon  VARCHAR(64)  NOT NULL DEFAULT '',
  saat     VARCHAR(128) NOT NULL DEFAULT '',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --- AYARLAR (anahtar-değer) ---
CREATE TABLE IF NOT EXISTS ayarlar (
  anahtar  VARCHAR(128) NOT NULL,
  deger    TEXT         NULL,
  PRIMARY KEY (anahtar)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --- TEMA (anahtar-değer: renkler) ---
CREATE TABLE IF NOT EXISTS tema (
  anahtar  VARCHAR(128) NOT NULL,
  deger    VARCHAR(64)  NULL,
  PRIMARY KEY (anahtar)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --- METİNLER (i18n: anahtar + dil) ---
CREATE TABLE IF NOT EXISTS metinler (
  anahtar  VARCHAR(191) NOT NULL,
  dil      VARCHAR(8)   NOT NULL,
  deger    TEXT         NULL,
  PRIMARY KEY (anahtar, dil)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --- ANASAYFA HERO SLAYTLARI ---
CREATE TABLE IF NOT EXISTS hero_slaytlar (
  id            VARCHAR(64)  NOT NULL,
  ust_baslik    VARCHAR(255) NOT NULL DEFAULT '',
  ust_baslik_en VARCHAR(255) NOT NULL DEFAULT '',
  baslik        VARCHAR(255) NOT NULL DEFAULT '',
  baslik_en     VARCHAR(255) NOT NULL DEFAULT '',
  alt_yazi      TEXT         NULL,
  alt_yazi_en   TEXT         NULL,
  buton         VARCHAR(128) NOT NULL DEFAULT '',
  buton_en      VARCHAR(128) NOT NULL DEFAULT '',
  link          VARCHAR(512) NOT NULL DEFAULT '',
  gorsel        VARCHAR(1024) NOT NULL DEFAULT '',
  renk          VARCHAR(128) NOT NULL DEFAULT '',
  emoji         VARCHAR(32)  NOT NULL DEFAULT '',
  sira          INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --- ANASAYFA AYARLARI (anahtar-değer: bolumler/panel/hikaye/cta/animasyon) ---
-- Düzleştirilmiş anahtar örnekleri:
--   bolumler.hero=true | panelGorseller.1=/yuklenenler/x.jpg
--   panelLinkler.2=/subeler | hikaye.emoji=👨‍🍳 | cta.link=/iletisim
--   animasyon.heroEfekt=fade | animasyon.heroSure=3
CREATE TABLE IF NOT EXISTS anasayfa_ayar (
  anahtar  VARCHAR(191) NOT NULL,
  deger    TEXT         NULL,
  PRIMARY KEY (anahtar)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --- HAKKIMIZDA: RAKAMLAR ---
CREATE TABLE IF NOT EXISTS hakkimizda_rakamlar (
  id         VARCHAR(64)  NOT NULL,
  sayi       VARCHAR(64)  NOT NULL DEFAULT '',
  etiket     VARCHAR(255) NOT NULL DEFAULT '',
  etiket_en  VARCHAR(255) NOT NULL DEFAULT '',
  sira       INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --- HAKKIMIZDA: DEĞERLER ---
CREATE TABLE IF NOT EXISTS hakkimizda_degerler (
  id         VARCHAR(64)  NOT NULL,
  emoji      VARCHAR(32)  NOT NULL DEFAULT '',
  baslik     VARCHAR(255) NOT NULL DEFAULT '',
  baslik_en  VARCHAR(255) NOT NULL DEFAULT '',
  metin      TEXT         NULL,
  metin_en   TEXT         NULL,
  sira       INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --- YÖNETİCİLER (panel girişi, bcrypt) ---
CREATE TABLE IF NOT EXISTS yoneticiler (
  id          INT          NOT NULL AUTO_INCREMENT,
  kullanici   VARCHAR(128) NOT NULL DEFAULT 'admin',
  sifre_hash  VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_kullanici (kullanici)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
