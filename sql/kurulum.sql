-- Tavacı Mehmet — kurulum (şema + veri). Hedef: hesapyon_Tavaci
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS urunler;
DROP TABLE IF EXISTS kategoriler;
DROP TABLE IF EXISTS subeler;
DROP TABLE IF EXISTS ayarlar;
DROP TABLE IF EXISTS tema;
DROP TABLE IF EXISTS metinler;
DROP TABLE IF EXISTS hero_slaytlar;
DROP TABLE IF EXISTS anasayfa_ayar;
DROP TABLE IF EXISTS hakkimizda_rakamlar;
DROP TABLE IF EXISTS hakkimizda_degerler;
DROP TABLE IF EXISTS yoneticiler;

-- ŞEMA
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

-- VERİLER
INSERT INTO kategoriler (id, ad, ad_en, ikon, sira) VALUES
  ('k1', 'Menüler', 'Menus', '🍽️', 10),
  ('k2', 'Tavada Beyaz Etler', 'Fried White Meats', '🍗', 20),
  ('k3', 'Tavada Beyaz Etler (1.5 Porsiyon)', 'Pan Fried White Meats (1.5 Portions)', '🍗', 30),
  ('k4', 'Makarnalar', 'Pastas', '🍝', 40),
  ('k5', 'Extralar', 'Extras', '➕', 50),
  ('k6', 'Tatlılar', 'sweets', '🍰', 60),
  ('k7', 'İçecekler', 'drinks', '🥤', 70),
  ('k8', 'Poşet', 'Carrier bag', '🛍️', 80),
  ('k9', 'Kovada Penne Tavuk', 'Penne Chicken in a Bucket', '🍝', 90),
  ('k10', 'Tavacı Sokak Lezzetleri', 'Tavacı Street Foods', '🌯', 100);

INSERT INTO urunler (id, ad, ad_en, aciklama, aciklama_en, fiyat, kategori_id, sira, gorsel) VALUES
  ('u-k1-1', 'Kampüs Menü', '', 'Seçeceğiniz Tavada Tavuk + Kremalı Penne + Mevsim Salata + Mozaik Pasta +Seçeceğiniz Ayran + Fırın Pide', 'Pan-Fried Chicken of your choice + Creamy Penne + Seasonal Salad + Mosaic Cake + Ayran of your choice + Oven Pita', '₺420', 'k1', 10, 'https://images.deliveryhero.io/image/fd-tr/Products/78331557.jpg'),
  ('u-k1-2', 'Kral Menü', 'King Menu', 'Seçeceğiniz Tavada Tavuk +  Kremalı Penne+ Mevsim Salata + Mozaik Pasta +Seçeceğiniz Kutu İçecek + Fırın Pide', 'Pan-Fried Chicken of Your Choice + Creamy Penne + Seasonal Salad + Mosaic Cake + Soft Drink of Your Choice + Oven Pita', '₺430', 'k1', 20, 'https://images.deliveryhero.io/image/fd-tr/Products/78331561.jpg'),
  ('u-k1-3', 'Combo Kampüs Menü', 'Combo Campus Menu', 'Seçeceğiniz 1.5 Porsiyon Tavada Tavuk + Kremalı Penne Makarna + Mevsim Salata + Mozaik Pasta +Seçeceğiniz Ayran + Fırın Pide', '1.5 Portions of your choice of Fried Chicken + Creamy Penne Pasta + Seasonal Salad + Mosaic Cake + Ayran of your choice + Oven Pita', '₺560', 'k1', 30, 'https://images.deliveryhero.io/image/fd-tr/Products/78331564.jpg'),
  ('u-k1-4', 'Combo Kral Menü', 'Combo King Menu', 'Seçeceğiniz 1.5 Porsiyon Tavada Tavuk + Kremalı Penne Makarna + Mevsim Salata + Mozaik Pasta +Seçeceğiniz Kutu İçecek + Fırın Pide', '1.5 Portions of your choice of Fried Chicken + Creamy Penne Pasta + Seasonal Salad + Mosaic Cake + Boxed Drink of your choice + Oven Pita', '₺575', 'k1', 40, 'https://images.deliveryhero.io/image/fd-tr/Products/78331596.jpg'),
  ('u-k1-5', 'Kovada Penne / Tavuk Menü', 'Penne / Chicken in a Bucket Menu', 'Seçeceğiniz Kovada Penne / Tavuk + Seçeceğiniz İçecek Mozaik Pasta + Lavaş + Salata', 'Penne / Chicken in a Bucket of your choice + Beverage of your choice Mosaic Cake + Lavash + Salad', '₺430', 'k1', 50, ''),
  ('u-k1-6', 'Kovada Pilav / Tavuk Menü', 'Rice / Chicken in a Bucket Menu', 'Seçeceğiniz Kovada Pilav / Tavuk + Seçeceğiniz İçecek + Mozaik Pasta + Salata + Lavaş', 'Rice / Chicken in a Bucket of your choice + Beverage of your choice + Mosaic Cake + Salad + Lavash', '₺430', 'k1', 60, ''),
  ('u-k1-7', 'Fırsat Lezzet İkilisi', 'Opportunity Flavor Duo', 'Seçeceğiniz 2 Adet Tavada Tavuk + Kremalı Penne Makarna + Mozaik Pasta + Seçeceğiniz 1 Litre İçecek + 2 Adet Salata + 2 Adet Lavaş', '2 Pieces of Fried Chicken of your choice + Creamy Penne Pasta + Mosaic Cake + 1 Liter of Beverage of your choice + 2 Salads + 2 Pieces of Lavash', '₺750', 'k1', 70, ''),
  ('u-k2-1', 'Şefin Tavasi', 'Chef\'s Pan', 'Her lokmasında ayrı bir lezzet şöleni, şefin gizli baharatları ile hazırlanan özgün lezzet. Özel soslu enfes kremalı penne makarna ve taptaze salatas��yla servis edilir.', 'A different feast of taste in every bite, a unique taste prepared with the chef\'s secret spices. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺340', 'k2', 10, ''),
  ('u-k2-2', 'Şefin Tavasi (Kaşarlı)', 'Chef\'s Tavasi (With Kashar)', 'Her lokmasında ayrı bir lezzet şöleni, şefin gizli baharatları ve kaşar peyniri ile hazırlanan özgün lezzet. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'A different feast of taste in every bite, an original taste prepared with the chef\'s secret spices and cheddar cheese. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺340', 'k2', 20, ''),
  ('u-k2-3', 'Şefin Tavasi (Cheddarlı)', 'Chef\'s Tavasi (with Cheddar)', 'Her lokmasında ayrı bir lezzet şöleni, şefin gizli baharatları ve çedar sos ile hazırlanan özgün lezzet. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'A different feast of taste in every bite, a unique taste prepared with the chef\'s secret spices and cheddar sauce. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺340', 'k2', 30, ''),
  ('u-k2-4', 'Kekik Tarlası', 'Thyme Field', 'Mis gibi kekik kokulu çok özel bir tarif. Kekikle hazırlanan sosumuza kaşar peyniri ve krema ilave ederek enfes bir lezzet yarattık Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir', 'A very special recipe with a fragrant thyme scent. We created a delicious taste by adding cheddar cheese and cream to our sauce prepared with thyme. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺340', 'k2', 40, ''),
  ('u-k2-5', 'Köri Soslu Tavuk', 'Chicken with Curry Sauce', 'Körinin tadına doya doya varacağınız eşsiz bir lezzet. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir', 'A unique taste of curry that you will enjoy to your heart\'s content. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺330', 'k2', 50, ''),
  ('u-k2-6', 'Acılı Köri', 'Spicy Curry', 'Körinin tadına acı bir dokunuş ekledik. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'We added a touch of bitterness to the taste of the curry. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺330', 'k2', 60, ''),
  ('u-k2-7', 'Barbekü Soslu Tavuk', 'Chicken with BBQ Sauce', 'Mangal tadını sevenleri unutmadık. Tavuklarımızı yedi özel baharatımızla dinlendiriyoruz, barbekü sosumuzla harmanlıyoruz. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'We haven\'t forgotten those who love the taste of barbecue. We marinate our chickens with our seven special spices and blend them with our barbecue sauce. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺330', 'k2', 70, ''),
  ('u-k2-8', 'Efsane Buffalo', 'Legendary Buffalo', 'Hiç gülerken ağladınız mı Özel tarifimizle hazırlanan meşhur barbekü sosumuzu, Şili biberinin özgün tadı ile acılaştırdık, lokum gibi pişmiş enfes tavuklar hazırladık. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'Have you ever cried while laughing? We made our famous barbecue sauce, prepared with our special recipe, hot with the unique taste of Chile pepper and prepared delicious chickens cooked like Turkish delight. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺330', 'k2', 80, ''),
  ('u-k2-9', 'Cafe de Paris Soslu Tavuk', 'Chicken with Cafe de Paris Sauce', 'Dünya mutfaklarının çok sevilen ve değişmez Café de Paris sosunu, Tavacı Mehmet lezzet anlayışıyla baştan yorumladık. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'We have reinterpreted the much-loved and indispensable Café de Paris sauce of world cuisines with the Tavacı Mehmet flavor approach. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺340', 'k2', 90, ''),
  ('u-k2-10', 'Tatlı Ekşi Soslu Tavuk', 'Chicken with Sweet and Sour Sauce', 'Asya mutfaklarının vazgeçilmez sosu. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'The indispensable sauce of Asian cuisines. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺330', 'k2', 100, ''),
  ('u-k2-11', 'Hot Chili Soslu Tavuk', 'Chicken with Hot Chili Sauce', 'Meksika mutfağının vazgeçilmez lezzetlerinden hot chili sos. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'Hot chili sauce, one of the indispensable flavors of Mexican cuisine. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺330', 'k2', 110, ''),
  ('u-k2-12', 'Sweet Chili Soslu Tavuk', 'Chicken with Sweet Chili Sauce', 'Tatlı acı vazgeçemeyeceğiniz bir lezzet. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir', 'Sweet and bitter is a taste you cannot give up. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺330', 'k2', 120, ''),
  ('u-k2-13', 'Labiate', 'labiate', 'Peynirseverlere özel bir lezzet. Kendine özgü sosu ile marine edilen tavuklarımız, cheddar peyniri ve kaşar peyniri ile birleşince, tadı damağınızda kalacak eşsiz bir lezzet ortaya çıktı. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'A special flavor for cheese lovers. When our chickens marinated in its unique sauce, combined with cheddar cheese and cheddar cheese, a unique flavor emerged that will remain on your palate. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺340', 'k2', 130, ''),
  ('u-k2-14', 'Tavuk Teryaki', 'Chicken Teryaki', 'Muhteşem lezzeti, iştah açıcı görüntüsü ve uzak doğunun esintisi teriyaki, marine tavuklarımızla buluştu. Üzerine serpilen susamla efsaneler arasında yerini buldu. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'Its wonderful taste, appetizing appearance and the breeze of the Far East met with our teriyaki, marinated chickens. It found its place among legends with the sesame seeds sprinkled on it. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺330', 'k2', 140, ''),
  ('u-k2-15', 'Közlüce', 'Közlüce', 'Yumuşacık, lezzetli, köz biber tadında. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'Soft, delicious, with the taste of roasted peppers. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺330', 'k2', 150, ''),
  ('u-k2-16', 'Salsa Meksikana', 'Salsa Mexicana', 'Meksika mutfağının eşsiz salsa sosunu, özenle hazırladığımız tavuklarımızla buluşturduk, ortaya tadına doyulamayacak bir lezzet çıkardık. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'We combined the unique salsa sauce of Mexican cuisine with our carefully prepared chicken and created a taste that cannot be satisfied. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺330', 'k2', 160, ''),
  ('u-k2-17', 'Chili Lokumu', 'Chili Delight', 'Lokum gibi yumuşacık tavuğumuza tatlı acı sos kattık Orijinal Şili biberleriyle hazırladığımız karışımımıza özel acı sosumuzdan ekledik. Tatlı acı vazgeçemeyeceğiniz farklı bir lezzet icat ettik Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'We added sweet and hot sauce to our tender chicken. We added our special hot sauce to the mixture we prepared with original Chile peppers. We have invented a different taste, sweet and bitter, that you cannot give up. It is served with delicious creamy penne pasta with special sauce and fresh salad.', '₺330', 'k2', 170, ''),
  ('u-k2-18', 'Chipotle Soslu Tavuk', 'Chicken with Chipotle Sauce', 'Meksikanın meşhur chipotle biberi ile hazırlanan özel sosumuzu tavuklarımızla harmanladık. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'We blended our special sauce prepared with Mexico\'s famous chipotle pepper with our chicken. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺330', 'k2', 180, ''),
  ('u-k2-19', 'Dem Dem', 'Dem Dem', 'Tavacı mehmetin özel ekşili barbekü sosunu tavuklarımızla harmanladık. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'We blended Tavacı Mehmet\'s special sour barbecue sauce with our chicken. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺330', 'k2', 190, ''),
  ('u-k2-20', 'Soya Doya', 'Soy To Your Heart\'s content', 'Asya mutfaklarının vazgeçilmez soslarından özel soya sosunu kremalı tavuklarımızla harmanladık. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'We blended special soy sauce, one of the indispensable sauces of Asian cuisine, with our creamy chicken. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺330', 'k2', 200, ''),
  ('u-k2-21', 'Tikka Masala Soslu Tavuk', 'Chicken Tikka Masala Sauce', 'Hint mutfağından kremalı tikka masala sosla marine edilmiş tavuklar. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'Chicken marinated in creamy tikka masala sauce from Indian cuisine. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺330', 'k2', 210, ''),
  ('u-k2-22', 'Demi Glace Soslu Tavuk', 'Chicken with Demi Glace Sauce', 'Fransız mutfağının en ünlü soslarından demi glace sos ve krema ile marine marine edilen tavuklar. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'Chicken marinated with demi-glace sauce and cream, one of the most famous sauces of French cuisine. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺330', 'k2', 220, ''),
  ('u-k2-23', 'Acılı Peynirli Tavuk', 'Spicy Cheese Chicken', 'Meksika mutfağının acı sosunu çedar sos ve kaşar peyniri ile harmanladık. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'We blended the hot sauce of Mexican cuisine with cheddar sauce and cheddar cheese. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺340', 'k2', 230, ''),
  ('u-k2-24', 'Pesto Soslu Tavuk', 'Chicken with Pesto Sauce', 'İtalyan mutağından enfes pesto sos. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'Delicious pesto sauce from Italian cuisine. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺330', 'k2', 240, ''),
  ('u-k2-25', 'Kaşarlı Pesto Soslu Tavuk', 'Chicken with Cheddar Pesto Sauce', 'İtalyan mutağından enfes kaşarlı pesto sos. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'Delicious cheddar pesto sauce from Italian cuisine. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺340', 'k2', 250, ''),
  ('u-k2-26', 'Cajun Baharatlım', 'My Cajun Spicy', 'Amerika mutfağının özel cajun baharatını  kremalı tavuklarımızla harmanladık. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'We blended the special Cajun spice of American cuisine with our creamy chicken. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺330', 'k2', 260, ''),
  ('u-k2-27', 'Barbekü Trendy', 'BBQ Trendy', 'Tavacı Mehmet yorumuyla özel barbekülü chipotle sosla marine edilmiş tavuklar. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'Chicken marinated with special barbecue chipotle sauce, interpreted by Tavacı Mehmet. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺330', 'k2', 270, ''),
  ('u-k2-28', 'Acılı Trendy', 'Spicy Trendy', 'Tavacı Mehmet yorumuyla özel acılı chipotle sosla marine edilmiş tavuklar. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'Chicken marinated with special spicy chipotle sauce, interpreted by Tavacı Mehmet. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺330', 'k2', 280, ''),
  ('u-k2-29', 'Fesleğenli Kaşarlı', 'Basil and Cheddar', 'Kuru fesleğen, krema ve kaşar peyniri ile marine edilmiş tavuklar. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'Chicken marinated with dried basil, cream and cheddar cheese. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺340', 'k2', 290, ''),
  ('u-k2-30', 'Gurme Tava', 'Gourmet Pan', 'Özel baharatlar ve acı sos ile marine edilmiş tavuk parçaları. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir', 'Chicken pieces marinated with special spices and hot sauce. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺330', 'k2', 300, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/85632983/0a409e97-f16b-4b86-83b1-b448f7ace9f9.jpg'),
  ('u-k2-31', 'Mucidinden Soslu Tavuk', 'Chicken with Sauce from its Inventor', 'Sizin için en lezzetlisini ararken özel soslu tavuğu keşfettik patentini aldık Tavacı Mehmetin özel reçetesiyle marine edilmiş leziz tavukların sırrı bizde, lezzeti sizde kalsın. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'While we were looking for the most delicious one for you, we discovered chicken with special sauce and patented it. We have the secret of delicious chicken marinated with Tavacı Mehmet\'s special recipe, so you can keep the taste. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺330', 'k2', 310, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/85632985/7e87d99f-eec1-4d5c-ac7e-4a8fa869774f.jpg'),
  ('u-k2-32', '’Kendini Beğenmiş Tavuk', '\'Smug Chicken', 'Şefin özel baharatları ile hazırlanan ekşili acılı tavuk parçaları, kremalı penne makarna, salata ve lavaş ile servis edilir.', 'Sour and spicy chicken pieces prepared with the chef\'s special spices, served with creamy penne pasta, salad and lavash.', '₺330', 'k2', 320, 'https://images.deliveryhero.io/image/fd-tr/Products/80707115.jpg'),
  ('u-k2-33', 'Aşk Acısı', 'Love Pain', 'Özel tarifli sosumuzla marine edilmiş tavuk, yanarsın ama vazgeçemezsin dedirtecek lezzet. Kremalı Penne Makarna, taze Salata ve Lavaş eşliğinde sunulur.', 'Chicken marinated with our special recipe sauce, a taste that will make you say you will burn but you can\'t give up. Served with Creamy Penne Pasta, fresh Salad and Lavash.', '₺330', 'k2', 330, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/7ad4e6bc-a400-40fb-a7de-131640e2140f.jpg'),
  ('u-k2-34', 'Cheddar Soslu Tavuk', 'Chicken with Cheddar Sauce', 'Enfes Cheddar sos ve özel baharatlarla marine edilmiş kremalı tavuk parçaları. Kremalı Penne Makarna Salata ve Lavaş ekmeği ile sunulur.', 'Creamy chicken pieces marinated with delicious Cheddar sauce and special spices. Served with Creamy Penne Pasta Salad and Lavash Bread.', '₺330', 'k2', 340, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/3656db7f-3547-47ce-8030-b94cfb2735c8.jpg'),
  ('u-k2-35', 'Cips Soslu Cheddarlı Tavuk', 'Cheddar Chicken with Chip Sauce', 'Cipsli cheddarlı sos ile marine edilmiş tavuk parçaları. Kremalı Penne Makarna Taze Salata ve Lavaş Ekmek ile servis edilir.', 'Marinated chicken pieces with chips and cheddar sauce. Creamy Penne Pasta served with Fresh Salad and Lavash Bread.', '₺330', 'k2', 350, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/b482f19f-cf8e-4867-9ad8-94c9f08b47b0.jpg'),
  ('u-k2-36', 'Acılı Çedarlı Tavuk', 'Spicy Cheddar Chicken', 'Acı sos, krema ve çedar sosun enfes uyumu.  İkram Kremalı Penne Makarna + İkram Salata + İkram Lavaş', 'The delicious harmony of hot sauce, cream and cheddar sauce.  Ikram Creamy Penne Pasta + Ikram Salad + Ikram Lavash', '₺330', 'k2', 360, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/670cf897-9e46-4583-91b4-42dd25680043.jpg'),
  ('u-k2-37', '(Acılı Kaşarlı Tavuk)', '(Spicy Cheddar Chicken)', 'Acı sos, krema, özel baharatlar ve kaşar peynirinin enfes uyumu. İkram Kremalı Penne Makarna + İkram Salata + İkram Lavaş', 'The delicious harmony of hot sauce, cream, special spices and cheddar cheese. Ikram Creamy Penne Pasta + Ikram Salad + Ikram Lavash', '₺330', 'k2', 370, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/fec1bcda-d20d-4f8a-86b9-a826ffae2bd1.jpg'),
  ('u-k2-38', 'Acılı Labiate', 'Painful Labiate', 'Peynirseverlere özel acılı peynir aromalı enfes bir lezzet. İkram Kremalı Penne Makarna + İkram Salata + İkram Lavaş', 'A delicious taste with spicy cheese flavor, special for cheese lovers. Ikram Creamy Penne Pasta + Ikram Salad + Ikram Lavash', '₺330', 'k2', 380, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/c00e0436-cfa0-4e01-9125-4db216b09f6d.jpg'),
  ('u-k3-1', 'Şefin Special Yemeği (1,5 Porsiyon)', 'Chef\'s Special Meal (1.5 Portions)', 'Her lokmasında ayrı bir lezzet şöleni, şefin gizli baharatları ile hazırlanan özgün lezzet. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'A different feast of taste in every bite, a unique taste prepared with the chef\'s secret spices. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺475', 'k3', 10, ''),
  ('u-k3-2', 'Şefin Special Yemeği (Kaşarlı) (1.5 Porsiyon)', 'Chef\'s Special Meal (With Cheese) (1.5 Portions)', 'Her lokmasında ayrı bir lezzet şöleni, şefin gizli baharatları ve kaşar peyniri ile hazırlanan özgün lezzet. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'A different feast of taste in every bite, an original taste prepared with the chef\'s secret spices and cheddar cheese. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺475', 'k3', 20, ''),
  ('u-k3-3', 'Şefin Special Yemeği (Çedarlı) (1.5 Porsiyon)', 'Chef\'s Special Meal (with Cheddar) (1.5 Portions)', 'Her lokmasında ayrı bir lezzet şöleni, şefin gizli baharatları ve çedar sos ile hazırlanan özgün lezzet. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'A different feast of taste in every bite, a unique taste prepared with the chef\'s secret spices and cheddar sauce. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺475', 'k3', 30, ''),
  ('u-k3-4', 'Kekik Tarlası (1.5 Porsiyon)', 'Thyme Field (1.5 Portions)', 'Mis gibi kekik kokulu çok özel bir tarif. Kekikle hazırlanan sosumuza kaşar peyniri ve krema ilave ederek enfes bir lezzet yarattık Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'A very special recipe with a fragrant thyme scent. We created a delicious taste by adding cheddar cheese and cream to our sauce prepared with thyme. It is served with delicious creamy penne pasta with special sauce and fresh salad.', '₺475', 'k3', 40, ''),
  ('u-k3-5', 'Köri Soslu Tavuk (1.5 Porsiyon)', 'Chicken with Curry Sauce (1.5 Portions)', 'Körinin tadına doya doya varacağınız eşsiz bir lezzet. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'A unique taste of curry that you will enjoy to your heart\'s content. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺475', 'k3', 50, ''),
  ('u-k3-6', 'Acılı Köri (1.5 Porsiyon)', 'Spicy Curry (1.5 Portions)', 'Körinin tadına acı bir dokunuş ekledik. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'We added a touch of bitterness to the taste of the curry. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺475', 'k3', 60, ''),
  ('u-k3-7', 'Barbekü Soslu Tavuk (1.5 Porsiyon)', 'Chicken with Barbecue Sauce (1.5 Portions)', 'Mangal tadını sevenleri unutmadık. Tavuklarımızı yedi özel baharatımızla dinlendiriyoruz, barbekü sosumuzla harmanlıyoruz. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'We haven\'t forgotten those who love the taste of barbecue. We marinate our chickens with our seven special spices and blend them with our barbecue sauce. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺475', 'k3', 70, ''),
  ('u-k3-8', 'Efsane Buffalo (1.5 Porsiyon)', 'Legendary Buffalo (1.5 Portions)', 'Hiç gülerken ağladınız mı Özel tarifimizle hazırlanan meşhur barbekü sosumuzu, Şili biberinin özgün tadı ile acılaştırdık, lokum gibi pişmiş enfes tavuklar hazırladık. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'Have you ever cried while laughing? We made our famous barbecue sauce, prepared with our special recipe, hot with the unique taste of Chile pepper and prepared delicious chickens cooked like Turkish delight. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺475', 'k3', 80, ''),
  ('u-k3-9', 'Cafe de Paris Soslu Tavuk (1.5 Porsiyon)', 'Chicken with Cafe de Paris Sauce (1.5 Portions)', 'Dünya mutfaklarının çok sevilen ve değişmez Café de Paris sosunu, Tavacı Mehmet lezzet anlayışıyla baştan yorumladık. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'We have reinterpreted the much-loved and indispensable Café de Paris sauce of world cuisines with the Tavacı Mehmet flavor approach. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺475', 'k3', 90, ''),
  ('u-k3-10', 'Tatlı Ekşi Soslu Tavuk (1.5 Porsiyon)', 'Chicken with Sweet and Sour Sauce (1.5 Portions)', 'Asya mutfaklarının vazgeçilmez sosu. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'The indispensable sauce of Asian cuisines. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺475', 'k3', 100, ''),
  ('u-k3-11', 'Hot Chili Soslu Tavuk (1.5 Porsiyon)', 'Chicken with Hot Chili Sauce (1.5 Portions)', 'Meksika mutfağının vazgeçilmez lezzetlerinden hot chili sos. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'Hot chili sauce, one of the indispensable flavors of Mexican cuisine. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺475', 'k3', 110, ''),
  ('u-k3-12', 'Sweet Chili Soslu Tavuk (1.5 Porsiyon)', 'Chicken with Sweet Chili Sauce (1.5 Portions)', 'Tatlı acı vazgeçemeyeceğiniz bir lezzet. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'Sweet and bitter is a taste you cannot give up. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺475', 'k3', 120, ''),
  ('u-k3-13', 'Labiate (1.5 Porsiyon)', 'Labiate (1.5 Servings)', 'Peynirseverlere özel bir lezzet Kendine özgü sosu ile marine edilen tavuklarımız, cheddar peyniri ve kaşar peyniri ile birleşince, tadı damağınızda kalacak eşsiz bir lezzet ortaya çıktı. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'A special taste for cheese lovers. When our chickens marinated in its unique sauce, combined with cheddar cheese and cheddar cheese, a unique taste emerged that will remain on your palate. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺475', 'k3', 130, ''),
  ('u-k3-14', 'Tavuk Teryaki (1.5 Porsiyon)', 'Chicken Teryaki (1.5 Portions)', 'Muhteşem lezzeti, iştah açıcı görüntüsü ve uzak doğunun esintisi teriyaki, marine tavuklarımızla buluştu. Üzerine serpilen susamla efsaneler arasında yerini buldu. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'Its wonderful taste, appetizing appearance and the breeze of the Far East met with our teriyaki, marinated chickens. It found its place among legends with the sesame seeds sprinkled on it. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺475', 'k3', 140, ''),
  ('u-k3-15', 'Közlüce (1.5 Porsiyon)', 'Közlüce (1.5 Portions)', 'Yumuşacık, lezzetli, köz biber tadında. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'Soft, delicious, with the taste of roasted peppers. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺475', 'k3', 150, ''),
  ('u-k3-16', 'Salsa Meksikana (1.5 Porsiyon)', 'Salsa Mexicana (1.5 Servings)', 'Meksika mutfağının eşsiz salsa sosunu, özenle hazırladığımız tavuklarımızla buluşturduk, ortaya tadına doyulamayacak bir lezzet çıkardık. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'We combined the unique salsa sauce of Mexican cuisine with our carefully prepared chicken and created a taste that cannot be satisfied. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺475', 'k3', 160, ''),
  ('u-k3-17', 'Chili Lokumu (1.5 Porsiyon)', 'Chili Delight (1.5 Portions)', 'Lokum gibi yumuşacık tavuğumuza tatlı acı sos kattık Orijinal Şili biberleriyle hazırladığımız karışımımıza özel acı sosumuzdan ekledik Tatlı acı vazgeçemeyeceğiniz farklı bir lezzet icat ettik Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir', 'We added sweet hot sauce to our soft chicken like delight. We added our special hot sauce to the mixture we prepared with original Chilean peppers. We invented a different flavor that you can\'t give up, sweet and hot. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺475', 'k3', 170, ''),
  ('u-k3-18', 'Chipotle Soslu Tavuk (1.5 Porsiyon)', 'Chicken with Chipotle Sauce (1.5 Portions)', 'Meksikanın meşhur chipotle biberi ile hazırlanan özel sosumuzu tavuklarımızla harmanladık. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'We blended our special sauce prepared with Mexico\'s famous chipotle pepper with our chicken. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺475', 'k3', 180, ''),
  ('u-k3-19', 'Dem Dem (1.5 Porsiyon)', 'Dem Dem (1.5 Portions)', 'Tavacı mehmetin özel ekşili barbekü sosunu tavuklarımızla harmanladık. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'We blended Tavacı Mehmet\'s special sour barbecue sauce with our chicken. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺475', 'k3', 190, ''),
  ('u-k3-20', 'Soya Doya (1.5 Porsiyon)', 'Soy Doya (1.5 Portions)', 'Asya mutfaklarının vazgeçilmez soslarından özel soya sosunu kremalı tavuklarımızla harmanladık. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'We blended special soy sauce, one of the indispensable sauces of Asian cuisine, with our creamy chicken. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺475', 'k3', 200, ''),
  ('u-k3-21', 'Tikka Masala Tavuk (1.5 Porsiyon)', 'Chicken Tikka Masala (1.5 Servings)', 'Hint mutfağından kremalı tikka masala sosla marine edilmiş tavuklar. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'Chicken marinated in creamy tikka masala sauce from Indian cuisine. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺475', 'k3', 210, ''),
  ('u-k3-22', 'Demi Glace Tavuk (1.5 Porsiyon)', 'Demi Glace Chicken (1.5 Servings)', 'Fransız mutfağının en ünlü soslarından demi glace sos ve krema ile marine marine edilen tavuklar. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'Chicken marinated with demi-glace sauce and cream, one of the most famous sauces of French cuisine. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺475', 'k3', 220, ''),
  ('u-k3-23', 'Acılı Peynirli Tavuk (1.5 Porsiyon)', 'Spicy Cheese Chicken (1.5 Portions)', 'Meksika mutfağının acı sosunu çedar sos ve kaşar peyniri ile harmanladık. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'We blended the hot sauce of Mexican cuisine with cheddar sauce and cheddar cheese. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺475', 'k3', 230, ''),
  ('u-k3-24', 'Pesto Soslu Tavuk (1.5 Porsiyon)', 'Chicken with Pesto Sauce (1.5 Portions)', 'İtalyan mutağından enfes pesto sos. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'Delicious pesto sauce from Italian cuisine. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺475', 'k3', 240, ''),
  ('u-k3-25', 'Kaşarlı Pesto Tavuk (1.5 Porsiyon)', 'Cheddar Pesto Chicken (1.5 Portions)', 'İtalyan mutağından enfes kaşarlı pesto sos. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'Delicious cheddar pesto sauce from Italian cuisine. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺475', 'k3', 250, ''),
  ('u-k3-26', 'Cajun Baharatlım (1.5 Porsiyon)', 'My Cajun Spicy (1.5 Portions)', 'Amerika mutfağının özel cajun baharatını  kremalı tavuklarımızla harmanladık. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'We blended the special Cajun spice of American cuisine with our creamy chicken. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺475', 'k3', 260, ''),
  ('u-k3-27', 'Barbekü Trendy (1.5 Porsiyon)', 'BBQ Trendy (1.5 Portions)', 'Tavacı Mehmet yorumuyla özel barbekülü chipotle sosla marine edilmiş tavuklar. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'Chicken marinated with special barbecue chipotle sauce, interpreted by Tavacı Mehmet. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺475', 'k3', 270, ''),
  ('u-k3-28', 'Acılı Trendy (1.5 Porsiyon)', 'Hot Trendy (1.5 Portions)', 'Tavacı Mehmet yorumuyla özel acılı chipotle sosla marine edilmiş tavuklar. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'Chicken marinated with special spicy chipotle sauce, interpreted by Tavacı Mehmet. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺475', 'k3', 280, ''),
  ('u-k3-29', 'Fesleğenli Kaşarlı (1.5 Porsiyon)', 'Basil Cheese (1.5 Portions)', 'Kuru fesleğen, krema ve kaşar peyniri ile marine edilmiş tavuklar. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'Chicken marinated with dried basil, cream and cheddar cheese. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺475', 'k3', 290, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/85633081/e7dde03d-b702-4d8d-9f58-bb4af4905665.jpg'),
  ('u-k3-30', 'Gurme Tava (1.5 Porsiyon)', 'Gourmet Pan (1.5 Portions)', 'Özel baharatlar ve acı sos ile marine edilmiş tavuk parçaları. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir', 'Chicken pieces marinated with special spices and hot sauce. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺475', 'k3', 300, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/85633083/ef0131f2-1150-4454-96ee-a6a96eb493e0.jpg'),
  ('u-k3-31', 'Mucidinden Tavuk (1.5 Porsiyon)', 'Chicken from its Inventor (1.5 Portions)', 'Sizin için en lezzetlisini ararken özel soslu tavuğu keşfettik; patentini aldık. Tavacı Mehmetin özel reçetesiyle marine edilmiş leziz tavukların sırrı bizde, lezzeti sizde kalsın. Özel soslu enfes kremalı penne makarna ve taptaze salatasıyla servis edilir.', 'While searching for the most delicious one for you, we discovered chicken with special sauce; We patented it. We have the secret of delicious chicken marinated with Tavacı Mehmet\'s special recipe, and you can keep the taste. Served with delicious creamy penne pasta with special sauce and fresh salad.', '₺475', 'k3', 310, ''),
  ('u-k3-32', '’Kendini Beğenmiş Tavuk (1,5 Porsiyon)', '\'Smug Chicken (1.5 Portions)', 'Şefin özel acılı ekşi sosu ile marine edilmiş tavuk parçaları. Özel soslu enfes kremalı penne makarna, salata ve tandır lavaş ile servis edilir', 'Chicken pieces marinated with the chef\'s special hot and sour sauce. Delicious creamy penne pasta with special sauce, served with salad and tandoori lavash', '₺475', 'k3', 320, 'https://images.deliveryhero.io/image/fd-tr/Products/80707117.jpg'),
  ('u-k3-33', '(Aşk Acısı) 1,5 Porsiyon', '(Love Pain) 1.5 Portions', 'Aşk acısına birbir! Çivi çiviyi söker dedik, aşk acısına meydan okuyan özel tarifli sosumuzla tavuklarımızı marine ettik. Yanarsın ama vazgeçemezsin. İkram Kremalı Penne Makarna + İkram Salata + İkram Lavaş', 'Each other for the pain of love! We marinated our chickens with our special recipe sauce that defies the pain of love. You get burned but you can\'t give up. Ikram Creamy Penne Pasta + Ikram Salad + Ikram Lavash', '₺475', 'k3', 330, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/d8bd295a-a616-4a8b-9032-988e0a52e944.jpg'),
  ('u-k3-34', '(Cips Soslu Cheddarlı Tavuk) 1,5 Porsiyon', '(Cheddar Chicken with Chip Sauce) 1.5 Portions', 'Cipsli cheddarlı sos ile marine edilmiş tavuk parçaları. İkram Kremalı Penne Makarna + İkram Salata + İkram Lavaş', 'Marinated chicken pieces with chips and cheddar sauce. Ikram Creamy Penne Pasta + Ikram Salad + Ikram Lavash', '₺475', 'k3', 340, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/4fba9885-159a-4a5e-ba03-7c46cd331607.jpg'),
  ('u-k3-35', '(Acılı Çedarlı Tavuk)  1,5 Porsiyon', '(Hot Cheddar Chicken) 1.5 Portions', 'Acı sos, krema ve çedar sosun enfes uyumu.  İkram Kremalı Penne Makarna + İkram Salata + İkram Lavaş', 'The delicious harmony of hot sauce, cream and cheddar sauce.  Ikram Creamy Penne Pasta + Ikram Salad + Ikram Lavash', '₺475', 'k3', 350, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/850be146-5ae1-42d7-ac18-5aa1a140803a.jpg'),
  ('u-k3-36', '(Acılı Kaşarlı Tavuk) 1,5 Porsiyon', '(Spicy Cheddar Chicken) 1.5 Portions', 'Acı sos, krema, özel baharatlar ve kaşar peynirinin enfes uyumu. İkram Kremalı Penne Makarna + İkram Salata + İkram Lavaş', 'The delicious harmony of hot sauce, cream, special spices and cheddar cheese. Ikram Creamy Penne Pasta + Ikram Salad + Ikram Lavash', '₺475', 'k3', 360, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/fdf619b4-6729-4523-97f2-abb44462628d.jpg'),
  ('u-k3-37', '(Acılı Labiate) 1,5 Porsiyon', '(Spicy Labiate) 1.5 Portions', 'Peynirseverlere özel acılı peynir aromalı enfes bir lezzet. İkram Kremalı Penne Makarna + İkram Salata + İkram Lavaş', 'A delicious taste with spicy cheese flavor, special for cheese lovers. Ikram Creamy Penne Pasta + Ikram Salad + Ikram Lavash', '₺475', 'k3', 370, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/b501aa55-b4f6-49be-ba59-8832400157eb.jpg'),
  ('u-k4-1', 'Kremalı Kaşarlı Penne', 'Creamy Cheddar Penne', 'Şefin özel baharatları ile hazırlanan kremalı kaşarlı penne + Salata + Kebabçı Lavaşı', 'Creamy kashar penne prepared with the chef\'s special spices + Salad + Kebabçı Lavash', '₺230', 'k4', 10, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/89598148/aef6d7c2-403b-4769-95ae-057a2acdccde.jpg'),
  ('u-k4-2', 'Kremalı Tavuklu Penne', 'Creamy Chicken Penne', 'Şefin özel baharatları ile hazırlanan kremalı kaşarlı tavuklu penne + Salata + Kebabçı Lavaşı', 'Chicken penne with creamy kashar cheese prepared with the chef\'s special spices + Salad + Kebabçı Lavash', '₺300', 'k4', 20, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/89598149/e7e8292a-7c31-48c6-aed1-a3a1041053c6.jpg'),
  ('u-k4-3', 'Pesto Soslu Penne', 'Penne with Pesto Sauce', 'Özel pesto sosunun taze aromasıyla kaplanan penne makarna. Her lokmada ferah, dengeli ve doyurucu lezzet. İkram Salata + Kebabçı Lavaşı', 'Penne pasta coated with the fresh aroma of special pesto sauce. Fresh, balanced and satisfying taste in every bite. Catering Salad + Kebab Restaurant Lavash', '₺225', 'k4', 30, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/89598150/4e5e35c6-bc1f-4a95-bf7e-49ee331f9c7f.jpg'),
  ('u-k4-4', 'Pesto Soslu Tavuklu Penne', 'Chicken Penne with Pesto Sauce', 'Özel pesto sosunun taze aromasıyla kaplanan tavuklu penne makarna. Her lokmada ferah, dengeli ve doyurucu lezzet. İkram Salata + Kebabçı Lavaşı', 'Chicken penne pasta coated with the fresh aroma of special pesto sauce. Fresh, balanced and satisfying taste in every bite. Catering Salad + Kebab Restaurant Lavash', '₺300', 'k4', 40, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/89598151/19c8603c-631e-4a50-8ba5-a5392c805cda.jpg'),
  ('u-k4-5', 'Köri Soslu Penne', 'Penne with Curry Sauce', 'Aromatik köri sosuyla buluşan penne makarna. İkram Salata + Kebabçı Lavaş', 'Penne pasta with aromatic curry sauce. Catering Salad + Kebab Lavash', '₺225', 'k4', 50, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/89598154/ec813f40-eeaf-4d8f-9a73-00286916bbb6.jpg'),
  ('u-k4-6', 'Körili Tavuklu Penne', 'Curried Chicken Penne', 'Aromatik köri sosuyla buluşan penne makarna ve lokum gibi yumuşacık tavuk parçaları. Baharatın en sıcak ve lezzetli hali. İkram Salata + Kebabçı Lavaşı', 'Penne pasta and tender chicken pieces like Turkish delight, combined with aromatic curry sauce. The hottest and most delicious form of spice. Catering Salad + Kebab Restaurant Lavash', '₺300', 'k4', 60, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/89598155/9a388dd4-2d11-4f14-8e64-a12b0f3f3fe3.jpg'),
  ('u-k4-7', 'Cheddar Soslu Penne', 'Penne with Cheddar Sauce', 'Aromatik çedar sosuyla buluşan penne makarna. İkram Salata + Kebabçı Lavaşı', 'Penne pasta with aromatic cheddar sauce. Catering Salad + Kebab Restaurant Lavash', '₺225', 'k4', 70, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/89598156/c0584341-d19f-4e52-88b7-af0135d5c7d9.jpg'),
  ('u-k4-8', 'Çedarlı Tavuklu Penne', 'Cheddar Chicken Penne', 'Aromatik çedar sosuyla buluşan tavuklu penne makarna. İkram Salata + Kebabçı Lavaşı', 'Chicken penne pasta with aromatic cheddar sauce. Catering Salad + Kebab Restaurant Lavash', '₺300', 'k4', 80, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/89598157/c5d27ae9-d834-41fb-9128-0ff3dadd56f5.jpg'),
  ('u-k5-1', 'Extra Tandır Lavaş', 'Extra Tandoori Lavash', '', '', '₺32', 'k5', 10, ''),
  ('u-k5-2', 'Extra Kremalı Penne', 'Extra Creamy Penne', '', '', '₺50', 'k5', 20, 'https://images.deliveryhero.io/image/fd-tr/Products/79712087.jpg'),
  ('u-k6-1', 'Mozaik Pasta', 'Mosaic Cake', '1 Dilim', '1 Slice', '₺50', 'k6', 10, 'https://images.deliveryhero.io/image/fd-tr/Products/78067623.jpg'),
  ('u-k7-1', 'Pepsi (33 cl.)', 'Pepsi (33 cl.)', 'Kutu içecek', 'canned beverage', '₺80', 'k7', 10, 'https://images.deliveryhero.io/image/fd-tr/products/5363518.jpg'),
  ('u-k7-2', 'Pepsi Max (33 cl.)', 'Pepsi Max (33 cl.)', 'Kutu içecek', 'canned beverage', '₺80', 'k7', 20, 'https://images.deliveryhero.io/image/fd-tr/products/5363519.jpg'),
  ('u-k7-3', 'Yedigün (33 cl.)', 'Yedigün (33 cl.)', 'Kutu içecek', 'canned beverage', '₺80', 'k7', 30, 'https://images.deliveryhero.io/image/fd-tr/products/5363520.jpg'),
  ('u-k7-4', 'Pepsi (1 L.)', 'Pepsi (1 L.)', 'Pet şişe', 'pet bottle', '₺110', 'k7', 40, 'https://images.deliveryhero.io/image/fd-tr/products/5363523.jpg'),
  ('u-k7-5', 'Pepsi Max (1 L.)', 'Pepsi Max (1 L.)', 'Pet şişe', 'pet bottle', '₺110', 'k7', 50, 'https://images.deliveryhero.io/image/fd-tr/products/5363524.jpg'),
  ('u-k7-6', 'Yedigün (1 L.)', 'Seven Days (1 L.)', 'Pet şişe', 'pet bottle', '₺110', 'k7', 60, 'https://images.deliveryhero.io/image/fd-tr/products/5363525.jpg'),
  ('u-k7-7', 'Lipton Ice Tea Şeftali (33 cl.)', 'Lipton Ice Tea Peach (33 cl.)', 'Kutu içecek', 'canned beverage', '₺80', 'k7', 70, 'https://images.deliveryhero.io/image/fd-tr/products/54532840.jpg'),
  ('u-k7-8', 'Lipton Ice Tea Limon (33 cl.)', 'Lipton Ice Tea Lemon (33 cl.)', 'Kutu içecek', 'canned beverage', '₺80', 'k7', 80, 'https://images.deliveryhero.io/image/fd-tr/products/54532841.jpg'),
  ('u-k7-9', 'Yayık Ayran', 'Buttermilk Ayran', '%100 Doğal Katkısız', '100% Natural, No Additives', '₺70', 'k7', 90, 'https://images.deliveryhero.io/image/fd-tr/Products/74472602.jpg'),
  ('u-k7-10', 'Acılı Ayran', 'Spicy Ayran', '%100 Doğal Katkısız', '100% Natural, No Additives', '₺70', 'k7', 100, 'https://images.deliveryhero.io/image/fd-tr/Products/74472664.jpg'),
  ('u-k7-11', 'Naneli Ayran', 'Mint Ayran', '%100 Doğal Katkısız', '100% Natural, No Additives', '₺70', 'k7', 110, 'https://images.deliveryhero.io/image/fd-tr/Products/74472669.jpg'),
  ('u-k8-1', 'Poşet', 'Carrier bag', 'Çevre Kanunu kapsamında yapılan değişiklikle her bir plastik poşetin tüketicilere 1 TL fiyat karşılığı satılması Çevre, Şehircilik ve İklim Değişikliği Bakanlığı tarafından zorunlu hale getirilmiştir. Plastik poşet talep etmeniz halinde ürünü sepete eklemeniz gerekmektedir. Sepete eklenen her bir plastik poşet için ilgili bedel tarafınızdan tahsil edilecektir.', 'With the amendment made within the scope of the Environmental Law, it has become mandatory for the Ministry of Environment, Urbanization and Climate Change to sell each plastic bag to consumers for 1 TL. If you request a plastic bag, you must add the product to the cart. You will be charged the relevant fee for each plastic bag added to the cart.', '₺1', 'k8', 10, 'https://images.deliveryhero.io/image/fd-tr/products/5363529.jpg'),
  ('u-k9-1', 'Kovada Penne / Şefin Tavasi', 'Penne in a Bucket / Chef\'s Pan', 'Kremalı Penne Makarna Üzerine 200 gr. Özel Marine Edilmiş Tavuk + Salata + Lavaş', '200 gr on Creamy Penne Pasta. Special Marinated Chicken + Salad + Lavash', '₺330', 'k9', 10, 'https://images.deliveryhero.io/image/fd-tr/Products/80707429.jpg'),
  ('u-k9-2', 'Kovada Penne / Şefin Tavasi (Kaşarlı)', 'Penne in a Bucket / Chef\'s Tavasi (With Cheddar)', 'Kremalı Penne Makarna Üzerine 200 gr. Özel Marine Edilmiş Tavuk + Salata + Lavaş', '200 gr on Creamy Penne Pasta. Special Marinated Chicken + Salad + Lavash', '₺330', 'k9', 20, 'https://images.deliveryhero.io/image/fd-tr/Products/80707430.jpg'),
  ('u-k9-3', 'Kovada Penne / Şefin Tavasi (Çedarlı)', 'Penne in a Bucket / Chef\'s Pan (with Cheddar)', 'Kremalı Penne Makarna Üzerine 200 gr. Özel Marine Edilmiş Tavuk + Salata + Lavaş', '200 gr on Creamy Penne Pasta. Special Marinated Chicken + Salad + Lavash', '₺330', 'k9', 30, 'https://images.deliveryhero.io/image/fd-tr/Products/80707431.jpg'),
  ('u-k9-4', 'Kovada Penne / Kekik Tarlası', 'Penne in a Bucket / Thyme Field', 'Kremalı Penne Makarna Üzerine 200 gr. Özel Marine Edilmiş Tavuk + Salata + Lavaş', '200 gr on Creamy Penne Pasta. Special Marinated Chicken + Salad + Lavash', '₺330', 'k9', 40, 'https://images.deliveryhero.io/image/fd-tr/Products/80707433.jpg'),
  ('u-k9-5', 'Kovada Penne / Köri Soslu Tavuk', 'Penne in a Bucket / Chicken with Curry Sauce', 'Kremalı Penne Makarna Üzerine 200 gr. Özel Marine Edilmiş Tavuk + Salata + Lavaş', '200 gr on Creamy Penne Pasta. Special Marinated Chicken + Salad + Lavash', '₺330', 'k9', 50, 'https://images.deliveryhero.io/image/fd-tr/Products/80707434.jpg'),
  ('u-k9-6', 'Kovada Penne / Acılı Köri Soslu Tavuk', 'Penne in a Bucket / Chicken with Spicy Curry Sauce', 'Kremalı Penne Makarna Üzerine 200 gr. Özel Marine Edilmiş Tavuk + Salata + Lavaş', '200 gr on Creamy Penne Pasta. Special Marinated Chicken + Salad + Lavash', '₺330', 'k9', 60, 'https://images.deliveryhero.io/image/fd-tr/Products/80707435.jpg'),
  ('u-k9-7', 'Kovada Penne / Barbekü Soslu Tavuk', 'Penne in a Bucket / Chicken with BBQ Sauce', 'Kremalı Penne Makarna Üzerine 200 gr. Özel Marine Edilmiş Tavuk + Salata + Lavaş', '200 gr on Creamy Penne Pasta. Special Marinated Chicken + Salad + Lavash', '₺330', 'k9', 70, 'https://images.deliveryhero.io/image/fd-tr/Products/80707437.jpg'),
  ('u-k9-8', 'Kovada Penne / Efsane Buffalo', 'Penne in a Bucket / Legendary Buffalo', 'Kremalı Penne Makarna Üzerine 200 gr. Özel Marine Edilmiş Tavuk + Salata + Lavaş', '200 gr on Creamy Penne Pasta. Special Marinated Chicken + Salad + Lavash', '₺330', 'k9', 80, 'https://images.deliveryhero.io/image/fd-tr/Products/80707438.jpg'),
  ('u-k9-9', 'Kovada Penne / Cafe de Paris Soslu Tavuk', 'Penne in a Bucket / Chicken with Cafe de Paris Sauce', 'Kremalı Penne Makarna Üzerine 200 gr. Özel Marine Edilmiş Tavuk + Salata + Lavaş', '200 gr on Creamy Penne Pasta. Special Marinated Chicken + Salad + Lavash', '₺330', 'k9', 90, 'https://images.deliveryhero.io/image/fd-tr/Products/80707439.jpg'),
  ('u-k9-10', 'Kovada Penne / Tatlı Ekşi Soslu Tavuk', 'Penne in a Bucket / Chicken with Sweet and Sour Sauce', 'Kremalı Penne Makarna Üzerine 200 gr. Özel Marine Edilmiş Tavuk + Salata + Lavaş', '200 gr on Creamy Penne Pasta. Special Marinated Chicken + Salad + Lavash', '₺330', 'k9', 100, 'https://images.deliveryhero.io/image/fd-tr/Products/80707441.jpg'),
  ('u-k9-11', 'Kovada Penne / Közlüce', 'Penne in a Bucket / Közlüce', 'Kremalı Penne Makarna Üzerine 200 gr. Özel Marine Edilmiş Tavuk + Salata + Lavaş', '200 gr on Creamy Penne Pasta. Special Marinated Chicken + Salad + Lavash', '₺330', 'k9', 110, 'https://images.deliveryhero.io/image/fd-tr/Products/80707442.jpg'),
  ('u-k9-12', 'Kovada Penne / Hot Chili Soslu Tavuk', 'Penne in a Bucket / Chicken with Hot Chili Sauce', 'Kremalı Penne Makarna Üzerine 200 gr. Özel Marine Edilmiş Tavuk + Salata + Lavaş', '200 gr on Creamy Penne Pasta. Special Marinated Chicken + Salad + Lavash', '₺330', 'k9', 120, 'https://images.deliveryhero.io/image/fd-tr/Products/80707444.jpg'),
  ('u-k9-13', 'Kovada Penne / Sweet Chili Soslu Tavuk', 'Penne in a Bucket / Chicken with Sweet Chili Sauce', 'Kremalı Penne Makarna Üzerine 200 gr. Özel Marine Edilmiş Tavuk + Salata + Lavaş', '200 gr on Creamy Penne Pasta. Special Marinated Chicken + Salad + Lavash', '₺330', 'k9', 130, 'https://images.deliveryhero.io/image/fd-tr/Products/80707446.jpg'),
  ('u-k9-14', 'Kovada Penne / Labiate', 'Penne/Labiate in the Bucket', 'Kremalı Penne Makarna Üzerine 200 gr. Özel Marine Edilmiş Tavuk + Salata + Lavaş', '200 gr on Creamy Penne Pasta. Special Marinated Chicken + Salad + Lavash', '₺330', 'k9', 140, 'https://images.deliveryhero.io/image/fd-tr/Products/80707453.jpg'),
  ('u-k9-15', 'Kovada Penne / Salsa Meksikana', 'Penne/Salsa Mexicana in a Bucket', 'Kremalı Penne Makarna Üzerine 200 gr. Özel Marine Edilmiş Tavuk + Salata + Lavaş', '200 gr on Creamy Penne Pasta. Special Marinated Chicken + Salad + Lavash', '₺330', 'k9', 150, 'https://images.deliveryhero.io/image/fd-tr/Products/80707454.jpg'),
  ('u-k9-16', 'Kovada Penne / Chili Lokumu', 'Penne / Chili Delight in a Bucket', 'Kremalı Penne Makarna Üzerine 200 gr. Özel Marine Edilmiş Tavuk + Salata + Lavaş', '200 gr on Creamy Penne Pasta. Special Marinated Chicken + Salad + Lavash', '₺330', 'k9', 160, 'https://images.deliveryhero.io/image/fd-tr/Products/80707456.jpg'),
  ('u-k9-17', 'Kovada Penne / Chipotle Soslu Tavuk', 'Penne in a Bucket / Chicken with Chipotle Sauce', 'Kremalı Penne Makarna Üzerine 200 gr. Özel Marine Edilmiş Tavuk + Salata + Lavaş', '200 gr on Creamy Penne Pasta. Special Marinated Chicken + Salad + Lavash', '₺330', 'k9', 170, 'https://images.deliveryhero.io/image/fd-tr/Products/80707458.jpg'),
  ('u-k9-18', 'Kovada Penne / Dem Dem', 'Penne in a Bucket / Dem Dem', 'Kremalı Penne Makarna Üzerine 200 gr. Özel Marine Edilmiş Tavuk + Salata + Lavaş', '200 gr on Creamy Penne Pasta. Special Marinated Chicken + Salad + Lavash', '₺330', 'k9', 180, 'https://images.deliveryhero.io/image/fd-tr/Products/80707461.jpg'),
  ('u-k9-19', 'Kovada Penne / Acılı Peynirli Tavuk', 'Penne in a Bucket / Spicy Cheese Chicken', 'Kremalı Penne Makarna Üzerine 200 gr. Özel Marine Edilmiş Tavuk + Salata + Lavaş', '200 gr on Creamy Penne Pasta. Special Marinated Chicken + Salad + Lavash', '₺330', 'k9', 190, 'https://images.deliveryhero.io/image/fd-tr/Products/80707462.jpg'),
  ('u-k9-20', 'Kovada Penne / Soya Doya', 'Penne / Soy Doya in a Bucket', 'Kremalı Penne Makarna Üzerine 200 gr. Özel Marine Edilmiş Tavuk + Salata + Lavaş', '200 gr on Creamy Penne Pasta. Special Marinated Chicken + Salad + Lavash', '₺330', 'k9', 200, 'https://images.deliveryhero.io/image/fd-tr/Products/80707464.jpg'),
  ('u-k9-21', 'Kovada Penne / Tikka Masala Soslu Tavuk', 'Penne in a Bucket / Chicken with Tikka Masala Sauce', 'Kremalı Penne Makarna Üzerine 200 gr. Özel Marine Edilmiş Tavuk + Salata + Lavaş', '200 gr on Creamy Penne Pasta. Special Marinated Chicken + Salad + Lavash', '₺330', 'k9', 210, 'https://images.deliveryhero.io/image/fd-tr/Products/80707469.jpg'),
  ('u-k9-22', 'Kovada Penne / Demi Glace Soslu Tavuk', 'Penne in a Bucket / Chicken with Demi Glace Sauce', 'Kremalı Penne Makarna Üzerine 200 gr. Özel Marine Edilmiş Tavuk + Salata + Lavaş', '200 gr on Creamy Penne Pasta. Special Marinated Chicken + Salad + Lavash', '₺330', 'k9', 220, 'https://images.deliveryhero.io/image/fd-tr/Products/80707472.jpg'),
  ('u-k9-23', 'Kovada Penne / Pesto Soslu Tavuk', 'Penne in a Bucket / Chicken with Pesto Sauce', 'Kremalı Penne Makarna Üzerine 200 gr. Özel Marine Edilmiş Tavuk + Salata + Lavaş', '200 gr on Creamy Penne Pasta. Special Marinated Chicken + Salad + Lavash', '₺330', 'k9', 230, 'https://images.deliveryhero.io/image/fd-tr/Products/80707477.jpg'),
  ('u-k9-24', 'Kovada Penne / Kaşarlı Pesto Soslu Tavuk', 'Penne in a Bucket / Chicken with Cheddar Pesto Sauce', 'Kremalı Penne Makarna Üzerine 200 gr. Özel Marine Edilmiş Tavuk + Salata + Lavaş', '200 gr on Creamy Penne Pasta. Special Marinated Chicken + Salad + Lavash', '₺330', 'k9', 240, 'https://images.deliveryhero.io/image/fd-tr/Products/80707478.jpg'),
  ('u-k9-25', 'Kovada Penne / Cajun Baharatlım', 'Penne in a Bucket / My Cajun Spicy', 'Kremalı Penne Makarna Üzerine 200 gr. Özel Marine Edilmiş Tavuk + Salata + Lavaş', '200 gr on Creamy Penne Pasta. Special Marinated Chicken + Salad + Lavash', '₺330', 'k9', 250, 'https://images.deliveryhero.io/image/fd-tr/Products/80707480.jpg'),
  ('u-k9-26', 'Kovada Penne / Barbekü Trendy', 'Penne in a Bucket / BBQ Trendy', 'Kremalı Penne Makarna Üzerine 200 gr. Özel Marine Edilmiş Tavuk + Salata + Lavaş', '200 gr on Creamy Penne Pasta. Special Marinated Chicken + Salad + Lavash', '₺330', 'k9', 260, 'https://images.deliveryhero.io/image/fd-tr/Products/80707487.jpg'),
  ('u-k9-27', 'Kovada Penne / Acılı Trendy', 'Penne in a Bucket / Spicy Trendy', 'Kremalı Penne Makarna Üzerine 200 gr. Özel Marine Edilmiş Tavuk + Salata + Lavaş', '200 gr on Creamy Penne Pasta. Special Marinated Chicken + Salad + Lavash', '₺330', 'k9', 270, 'https://images.deliveryhero.io/image/fd-tr/Products/80707489.jpg'),
  ('u-k9-28', 'Kovada Penne / Fesleğenli Kaşarlı', 'Penne in a Bucket / Basil and Cheddar', 'Kremalı Penne Makarna Üzerine 200 gr. Özel Marine Edilmiş Tavuk + Salata + Lavaş', '200 gr on Creamy Penne Pasta. Special Marinated Chicken + Salad + Lavash', '₺330', 'k9', 280, 'https://images.deliveryhero.io/image/fd-tr/Products/80707490.jpg'),
  ('u-k9-29', 'Kovada Penne / Mucidinden Soslu Tavuk', 'Penne in a Bucket / Chicken with Sauce from Its Inventor', 'Kremalı Penne Makarna Üzerine 200 gr. Özel Marine Edilmiş Şefin Özel Soslu Tavuğu + Salata + Lavaş', '200 gr on Creamy Penne Pasta. Special Marinated Chicken with Chef\'s Special Sauce + Salad + Lavash', '₺330', 'k9', 290, 'https://images.deliveryhero.io/image/fd-tr/Products/80707493.jpg'),
  ('u-k9-30', 'Kovada Penne / Cheddar Soslu Tavuk', 'Penne in a Bucket / Chicken with Cheddar Sauce', 'Kremalı Penne Makarna Üzerine 200 gr. Özel Marine Edilmiş Tavuk + Salata + Lavaş', '200 gr on Creamy Penne Pasta. Special Marinated Chicken + Salad + Lavash', '₺330', 'k9', 300, 'https://images.deliveryhero.io/image/fd-tr/Products/80707495.jpg'),
  ('u-k9-31', 'Kovada Penne / Kendini Beğenmiş Tavuk', 'Penne in a Bucket / Smug Chicken', 'Kremalı Penne Makarna Üzerine 200 gr. Özel Marine Edilmiş Ekşili Acılı  Tavuk + Salata + Lavaş', '200 gr on Creamy Penne Pasta. Special Marinated Sour and Spicy Chicken + Salad + Lavash', '₺330', 'k9', 310, 'https://images.deliveryhero.io/image/fd-tr/Products/80707496.jpg'),
  ('u-k10-1', 'Pilav Üstü / Şefin Tavasi (Çedarlı)', 'Over Rice / Chef\'s Pan (with Cheddar)', '300 gr. taze pilav ile 200 gr. özel baharatlarla marine edilmiş kremalı çedarlı tavuk parçaları. Yanında salata ve yumuşak lavaş ekmeği ile sunulur.', '300 gr. 200 gr with fresh rice. Creamy cheddar chicken pieces marinated with special spices. It is served with salad and soft lavash bread.', '₺330', 'k10', 10, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/89597832/b402994d-ae7a-4641-8a8a-379193e4e483.jpg'),
  ('u-k10-2', 'Pilav Üstü / Kekik Tarlası', 'Over Rice / Thyme Field', '300 gr. taze pilav ile 200 gr. özel baharatlarla marine edilmiş kremalı kaşarlı kekikli tavuk parçaları. Yanında salata ve yumuşak lavaş ekmeği ile sunulur.', '300 gr. 200 gr with fresh rice. Chicken pieces with creamy kashar and thyme marinated with special spices. It is served with salad and soft lavash bread.', '₺330', 'k10', 20, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/89597833/1b7b2a29-1043-4f91-92ab-37e78bf64a02.jpg'),
  ('u-k10-3', 'Pilav Üstü / Köri Soslu Tavuk', 'Chicken Over Rice / Curry Sauce', '300 gr. taze pilav ile 200 gr. özel marine edilmiş tavuk. Yanında salata ve yumuşak lavaş ekmeği ile sunulur.', '300 gr. 200 gr with fresh rice. special marinated chicken. It is served with salad and soft lavash bread.', '₺330', 'k10', 30, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/89597835/e42b9c97-fae5-4c34-96e6-2891b4159632.jpg'),
  ('u-k10-4', 'Pilav Üstü / Acılı Köri Soslu Tavuk', 'Chicken Over Rice / Spicy Curry Sauce', '300 gr. taze pilav ile 200 gr. özel marine edilmiş tavuk. Yanında salata ve yumuşak lavaş ekmeği ile sunulur.', '300 gr. 200 gr with fresh rice. special marinated chicken. It is served with salad and soft lavash bread.', '₺330', 'k10', 40, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/89597837/bf59c00a-2895-4e67-b1cf-b7be43fb0dcb.jpg'),
  ('u-k10-5', 'Pilav Üstü / Barbekü Soslu Tavuk', 'Chicken Over Rice / BBQ Sauce', '300 gr. taze pilav ile 200 gr. özel marine edilmiş tavuk. Yanında salata ve yumuşak lavaş ekmeği ile sunulur.', '300 gr. 200 gr with fresh rice. special marinated chicken. It is served with salad and soft lavash bread.', '₺330', 'k10', 50, ''),
  ('u-k10-6', 'Pilav Üstü / Efsane Buffalo', 'Over Rice / Legendary Buffalo', '300 gr. taze pilav ile 200 gr. özel marine edilmiş tavuk. Yanında salata ve yumuşak lavaş ekmeği ile sunulur.', '300 gr. 200 gr with fresh rice. special marinated chicken. It is served with salad and soft lavash bread.', '₺330', 'k10', 60, ''),
  ('u-k10-7', 'Pilav Üstü / Cafe de Paris Soslu Tavuk', 'Chicken Over Rice / Cafe de Paris Sauce', '300 gr. taze pilav ile 200 gr. özel marine edilmiş tavuk. Yanında salata ve yumuşak lavaş ekmeği ile sunulur.', '300 gr. 200 gr with fresh rice. special marinated chicken. It is served with salad and soft lavash bread.', '₺330', 'k10', 70, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/89597840/b232d403-4052-4169-bb5e-046ba042f787.jpg'),
  ('u-k10-8', 'Pilav Üstü / Tatlı Ekşi Soslu Tavuk', 'Chicken Over Rice / Sweet and Sour Sauce', '300 gr. taze pilav ile 200 gr. özel marine edilmiş tavuk. Yanında salata ve yumuşak lavaş ekmeği ile sunulur.', '300 gr. 200 gr with fresh rice. special marinated chicken. It is served with salad and soft lavash bread.', '₺330', 'k10', 80, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/89597842/a992251d-9b31-4529-9979-64f242070286.jpg'),
  ('u-k10-9', 'Pilav Üstü / Közlüce', 'Over Rice / Közlüce', '300 gr. taze pilav ile 200 gr. özel marine edilmiş tavuk. Yanında salata ve yumuşak lavaş ekmeği ile sunulur.', '300 gr. 200 gr with fresh rice. special marinated chicken. It is served with salad and soft lavash bread.', '₺330', 'k10', 90, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/89597843/a836af82-7ce3-4d71-9b44-93702be9b18e.jpg'),
  ('u-k10-10', 'Pilav Üstü / Hot Chili Soslu Tavuk', 'Chicken Over Rice / Hot Chili Sauce', '300 gr. taze pilav ile 200 gr. özel marine edilmiş tavuk. Yanında salata ve yumuşak lavaş ekmeği ile sunulur.', '300 gr. 200 gr with fresh rice. special marinated chicken. It is served with salad and soft lavash bread.', '₺330', 'k10', 100, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/89597845/13d4604c-48e3-4c5b-9cca-304198949b21.jpg'),
  ('u-k10-11', 'Pilav Üstü / Sweet Chili Soslu Tavuk', 'Chicken Over Rice / Sweet Chili Sauce', '300 gr. taze pilav ile 200 gr. özel marine edilmiş tavuk. Yanında salata ve yumuşak lavaş ekmeği ile sunulur.', '300 gr. 200 gr with fresh rice. special marinated chicken. It is served with salad and soft lavash bread.', '₺330', 'k10', 110, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/89597846/10f82471-ac77-4866-9a6d-0638d506c9b6.jpg'),
  ('u-k10-12', 'Pilav Üstü / Labiate', 'Rice Top / Labiate', '300 gr. taze pilav ile 200 gr. özel marine edilmiş tavuk. Yanında salata ve yumuşak lavaş ekmeği ile sunulur.', '300 gr. 200 gr with fresh rice. special marinated chicken. It is served with salad and soft lavash bread.', '₺330', 'k10', 120, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/89597868/dba7ba1a-b96c-42f8-b419-bffbe3d05d64.jpg'),
  ('u-k10-13', 'Pilav Üstü / Salsa Meksikana', 'Over Rice / Salsa Mexicana', '300 gr. taze pilav ile 200 gr. özel marine edilmiş tavuk. Yanında salata ve yumuşak lavaş ekmeği ile sunulur.', '300 gr. 200 gr with fresh rice. special marinated chicken. It is served with salad and soft lavash bread.', '₺330', 'k10', 130, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/89597870/4bfe629f-4a9e-4248-9086-bc7ac85e5f03.jpg'),
  ('u-k10-14', 'Pilav Üstü / Chili Lokumu', 'Rice Top / Chili Delight', '300 gr. taze pilav ile 200 gr. özel marine edilmiş tavuk. Yanında salata ve yumuşak lavaş ekmeği ile sunulur', '300 gr. 200 gr with fresh rice. special marinated chicken. Served with salad and soft lavash bread.', '₺330', 'k10', 140, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/89597871/c15314c2-a86c-4f89-a955-41efbad03c00.jpg'),
  ('u-k10-15', 'Pilav Üstü / Chipotle Soslu Tavuk', 'Chicken Over Rice / Chipotle Sauce', '300 gr. taze pilav ile 200 gr. özel marine edilmiş tavuk. Yanında salata ve yumuşak lavaş ekmeği ile sunulur.', '300 gr. 200 gr with fresh rice. special marinated chicken. It is served with salad and soft lavash bread.', '₺330', 'k10', 150, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/89597872/8527584f-c62f-4f49-b6c2-213ab6afa005.jpg'),
  ('u-k10-16', 'Pilav Üstü / Dem Dem', 'Over Rice / Dem Dem', '300 gr. taze pilav ile 200 gr. özel marine edilmiş tavuk. Yanında salata ve yumuşak lavaş ekmeği ile sunulur.', '300 gr. 200 gr with fresh rice. special marinated chicken. It is served with salad and soft lavash bread.', '₺330', 'k10', 160, ''),
  ('u-k10-17', 'Pilav Üstü / Acılı Peynirli Tavuk', 'Chicken Over Rice / Spicy Cheese', '300 gr. taze pilav ile 200 gr. özel marine edilmiş tavuk. Yanında salata ve yumuşak lavaş ekmeği ile sunulur.', '300 gr. 200 gr with fresh rice. special marinated chicken. It is served with salad and soft lavash bread.', '₺330', 'k10', 170, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/89597875/f9a21b7b-dbcf-4181-9926-c0fb763030e3.jpg'),
  ('u-k10-18', 'Pilav Üstü / Soya Doya', 'Over Rice / Soy Doya', '300 gr. taze pilav ile 200 gr. özel marine edilmiş tavuk. Yanında salata ve yumuşak lavaş ekmeği ile sunulur.', '300 gr. 200 gr with fresh rice. special marinated chicken. It is served with salad and soft lavash bread.', '₺330', 'k10', 180, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/89597877/cdf853a4-93c8-4121-91d5-c21e9f066ad4.jpg'),
  ('u-k10-19', 'Pilav Üstü / Tikka Masala Soslu Tavuk', 'Chicken Over Rice / Tikka Masala Sauce', '300 gr. taze pilav ile 200 gr. özel marine edilmiş tavuk. Yanında salata ve yumuşak lavaş ekmeği ile sunulur.', '300 gr. 200 gr with fresh rice. special marinated chicken. It is served with salad and soft lavash bread.', '₺330', 'k10', 190, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/89597879/78cea7d5-2038-49e4-bd96-298115200c84.jpg'),
  ('u-k10-20', 'Pilav Üstü / Demi Glace Soslu Tavuk', 'Chicken Over Rice / Demi Glace Sauce', '300 gr. taze pilav ile 200 gr. özel marine edilmiş tavuk. Yanında salata ve yumuşak lavaş ekmeği ile sunulur.', '300 gr. 200 gr with fresh rice. special marinated chicken. It is served with salad and soft lavash bread.', '₺330', 'k10', 200, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/89597881/dd2e5607-bed1-40ea-b6c1-205549efdc6d.jpg'),
  ('u-k10-21', 'Pilav Üstü / Pesto Soslu Tavuk', 'Chicken Over Rice / Pesto Sauce', '300 gr. taze pilav ile 200 gr. özel marine edilmiş tavuk. Yanında salata ve yumuşak lavaş ekmeği ile sunulur.', '300 gr. 200 gr with fresh rice. special marinated chicken. It is served with salad and soft lavash bread.', '₺330', 'k10', 210, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/89597882/c3fd7c2a-ce3e-4b80-b224-c3f0bb446aa5.jpg'),
  ('u-k10-22', 'Pilav Üstü / Kaşarlı Pesto Soslu Tavuk', 'Chicken Over Rice / Cheddar Pesto Sauce', '300 gr. taze pilav ile 200 gr. özel marine edilmiş tavuk. Yanında salata ve yumuşak lavaş ekmeği ile sunulur.', '300 gr. 200 gr with fresh rice. special marinated chicken. It is served with salad and soft lavash bread.', '₺330', 'k10', 220, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/89597885/a53f23c5-7ba6-4aed-b663-a823d1433afc.jpg'),
  ('u-k10-23', 'Pilav Üstü / Cajun Baharatlım', 'Over Rice / Cajun Spiced', '300 gr. taze pilav ile 200 gr. özel marine edilmiş tavuk. Yanında salata ve yumuşak lavaş ekmeği ile sunulur.', '300 gr. 200 gr with fresh rice. special marinated chicken. It is served with salad and soft lavash bread.', '₺330', 'k10', 230, ''),
  ('u-k10-24', 'Pilav Üstü / Barbekü Trendy', 'Over Rice / BBQ Trendy', '300 gr. taze pilav ile 200 gr. özel marine edilmiş tavuk. Yanında salata ve yumuşak lavaş ekmeği ile sunulur.', '300 gr. 200 gr with fresh rice. special marinated chicken. It is served with salad and soft lavash bread.', '₺330', 'k10', 240, ''),
  ('u-k10-25', 'Pilav Üstü / Acılı Trendy', 'Over Rice / Spicy Trendy', '300 gr. taze pilav ile 200 gr. özel marine edilmiş tavuk. Yanında salata ve yumuşak lavaş ekmeği ile sunulur.', '300 gr. 200 gr with fresh rice. special marinated chicken. It is served with salad and soft lavash bread.', '₺330', 'k10', 250, ''),
  ('u-k10-26', 'Pilav Üstü / Fesleğenli Kaşarlı', 'Over Rice / With Basil and Cheddar', '300 gr. taze pilav ile 200 gr. özel marine edilmiş tavuk. Yanında salata ve yumuşak lavaş ekmeği ile sunulur.', '300 gr. 200 gr with fresh rice. special marinated chicken. It is served with salad and soft lavash bread.', '₺330', 'k10', 260, 'https://images.deliveryhero.io/image/global-menu-service/YS_TR/vendor/oa1t/product/89597897/1fdc92f2-dca8-4216-8920-823217d8b212.jpg'),
  ('u-k10-27', 'Pilav Üstü / Mucidinden Soslu Tavuk', 'Chicken Over Rice / With Sauce From Its Inventor', '300 gr. taze pilav ile 200 gr. özel marine edilmiş tavuk. Yanında salata ve yumuşak lavaş ekmeği ile sunulur.', '300 gr. 200 gr with fresh rice. special marinated chicken. It is served with salad and soft lavash bread.', '₺330', 'k10', 270, ''),
  ('u-k10-28', 'Pilav Üstü / Cheddar Soslu Tavuk', 'Chicken Over Rice / Cheddar Sauce', '300 gr. taze pilav ile 200 gr. özel marine edilmiş tavuk. Yanında salata ve yumuşak lavaş ekmeği ile sunulur.', '300 gr. 200 gr with fresh rice. special marinated chicken. It is served with salad and soft lavash bread.', '₺330', 'k10', 280, ''),
  ('u-k10-29', 'Pilav Üstü / Kendini Beğenmiş Tavuk', 'Over Rice / Smug Chicken', '300 gr. taze pilav ile 200 gr. özel marine edilmiş tavuk. Yanında salata ve yumuşak lavaş ekmeği ile sunulur.', '300 gr. 200 gr with fresh rice. special marinated chicken. It is served with salad and soft lavash bread.', '₺330', 'k10', 290, '');

INSERT INTO subeler (id, sehir, semt, adres, telefon, saat) VALUES
  ('s1', 'Ankara', 'Bilkent', 'Üniversiteler Mah. Uğur Sitesi No:13, Bilkent, Çankaya / Ankara', '0312 000 00 00', '11:00 - 23:00');

INSERT INTO ayarlar (anahtar, deger) VALUES
  ('telefon', '0850 000 00 12'),
  ('eposta', 'bilgi@tavacimehmet.com'),
  ('instagram', 'https://www.instagram.com/tavacimehmetefendiii/'),
  ('siparisLinki', 'https://www.yemeksepeti.com/restaurant/oa1t/tavaci-mehmet-efendi'),
  ('whatsapp', '905363435142');

INSERT INTO tema (anahtar, deger) VALUES
  ('marka', '#d52020'),
  ('markaKoyu', '#9e1d22'),
  ('altin', '#e6a02c'),
  ('koyu', '#1f1b16'),
  ('krem', '#fbf6ee');

INSERT INTO metinler (anahtar, dil, deger) VALUES
  ('hero.1.tag', 'tr', '1998\'den beri hizmetinizde'),
  ('hero.1.title', 'tr', 'Közde pişen efsane lezzetler'),
  ('hero.1.sub', 'tr', 'Kendi tavanda, közün dumanıyla pişen tavuk ve köfteler.'),
  ('hero.1.btn', 'tr', 'Menüyü Keşfet'),
  ('hero.2.tag', 'tr', 'Kampanya'),
  ('hero.2.title', 'tr', 'Kampüs Menü artık çok uygun'),
  ('hero.2.sub', 'tr', 'Tavada tavuk, penne, salata ve içecek bir arada.'),
  ('hero.2.btn', 'tr', 'Hemen Sipariş Ver'),
  ('hero.3.tag', 'tr', 'Yeni'),
  ('hero.3.title', 'tr', 'Tavacı Sokak Lezzetleri'),
  ('hero.3.sub', 'tr', 'Dürümden burgere, sokağın enerjisi sofranda.'),
  ('hero.3.btn', 'tr', 'Keşfet'),
  ('discover.title', 'tr', 'Keşfetmeye Başla'),
  ('discover.sub', 'tr', 'Tavacı Mehmet dünyasını panel panel gez'),
  ('panel.1.tag', 'tr', 'Lezzet Dünyası'),
  ('panel.1.title', 'tr', 'İnanılmaz Detaylar'),
  ('panel.1.desc', 'tr', 'Özenle hazırlanmış soslar ve çeşit çeşit baharatlarla marine edilmiş, közde pişen lezzetler seni bekliyor.'),
  ('panel.1.btn', 'tr', 'Menüyü Gör'),
  ('panel.2.tag', 'tr', 'Lezzet Noktaları'),
  ('panel.2.title', 'tr', 'Sana En Yakın Şube'),
  ('panel.2.desc', 'tr', 'Dört şehirde, aynı köz lezzetiyle hizmetindeyiz. En yakın Tavacı Mehmet\'i bul, sıcak sıcak tadına bak.'),
  ('panel.2.btn', 'tr', 'Şubeleri Gör'),
  ('panel.3.tag', 'tr', 'Hakkımızda'),
  ('panel.3.title', 'tr', '1998\'den Beri Köz'),
  ('panel.3.desc', 'tr', 'Küçük bir mahalle tezgâhında yanan ateş hiç sönmedi. Geleneği bugüne taşıyan hikayemizi keşfet.'),
  ('panel.3.btn', 'tr', 'Hikayemiz'),
  ('panel.4.tag', 'tr', 'İletişim'),
  ('panel.4.title', 'tr', 'Sofranı Hazırlayalım'),
  ('panel.4.desc', 'tr', 'Sipariş, rezervasyon ve tüm soruların için buradayız. Bir tık uzağındayız.'),
  ('panel.4.btn', 'tr', 'Bize Ulaş'),
  ('home.story.title', 'tr', 'Hikayemiz'),
  ('home.story.text', 'tr', 'Tavacı Mehmet, küçük bir mahalle lokantası olarak 1998\'de yola çıktı. Bugün dört şehirde, aynı geleneksel köz lezzetini binlerce misafirimizle paylaşıyoruz. Sırrımız basit: taze malzeme, gerçek köz ateşi ve sabır.'),
  ('home.story.more', 'tr', 'Daha fazlasını oku →'),
  ('home.ig.title', 'tr', 'Bizi Takip Et'),
  ('home.cta.title', 'tr', 'Bugün canınız köz mü çekti?'),
  ('home.cta.sub', 'tr', 'Hemen sipariş verin, sıcak sıcak kapınızda.'),
  ('home.cta.btn', 'tr', 'Sipariş Ver'),
  ('menu.title', 'tr', 'Menümüz'),
  ('menu.sub', 'tr', 'Köz ateşinde hazırlanan tüm lezzetler'),
  ('menu.intro', 'tr', 'Kategorilere tıklayarak lezzetlerimizi keşfet ve sipariş ver'),
  ('branches.title', 'tr', 'Şubelerimiz'),
  ('branches.sub', 'tr', 'Size en yakın Tavacı Mehmet\'i bulun'),
  ('contact.title', 'tr', 'Bize Ulaşın'),
  ('contact.sub', 'tr', 'Sipariş, rezervasyon veya görüşleriniz için buradayız.'),
  ('about.title', 'tr', 'Hikayemiz'),
  ('about.intro', 'tr', '1998\'de Mehmet Usta\'nın küçük bir mahalle tezgâhında yaktığı köz ateşi hiç sönmedi. Bugün aynı tarif, aynı sabır ve aynı sevgiyle dört şehirde sizlerleyiz. Tavacı Mehmet bir restoran zincirinden çok, kuşaktan kuşağa aktarılan bir lezzet geleneğidir.'),
  ('about.values', 'tr', 'Değerlerimiz'),
  ('about.value1.title', 'tr', 'Gerçek Köz'),
  ('about.value1.text', 'tr', 'Hiçbir tavamız közsüz pişmez. Lezzetin sırrı ateşte.'),
  ('about.value2.title', 'tr', 'Taze Malzeme'),
  ('about.value2.text', 'tr', 'Her sabah günlük tedarik, dondurulmuş ürün yok.'),
  ('about.value3.title', 'tr', 'Ev Sıcaklığı'),
  ('about.value3.text', 'tr', 'Misafirimizi aile gibi ağırlarız.'),
  ('footer.tagline', 'tr', 'Közde pişen tavalarıyla 1998\'den beri sofralarınızda. Geleneksel lezzeti modern bir dokunuşla buluşturuyoruz.'),
  ('hero.1.tag', 'en', 'Since 1998'),
  ('hero.1.title', 'en', 'Legendary flavors cooked over embers'),
  ('hero.1.sub', 'en', 'Chicken and meatballs cooked in your own pan over real charcoal.'),
  ('hero.1.btn', 'en', 'Explore the Menu'),
  ('hero.2.tag', 'en', 'Campaign'),
  ('hero.2.title', 'en', 'The Campus Menu is now great value'),
  ('hero.2.sub', 'en', 'Pan-cooked chicken, penne, salad and a drink together.'),
  ('hero.2.btn', 'en', 'Order Now'),
  ('hero.3.tag', 'en', 'New'),
  ('hero.3.title', 'en', 'Tavacı Street Flavors'),
  ('hero.3.sub', 'en', 'From wraps to burgers, street energy on your table.'),
  ('hero.3.btn', 'en', 'Discover'),
  ('discover.title', 'en', 'Start Exploring'),
  ('discover.sub', 'en', 'Browse the world of Tavacı Mehmet, panel by panel'),
  ('panel.1.tag', 'en', 'Flavor World'),
  ('panel.1.title', 'en', 'Incredible Details'),
  ('panel.1.desc', 'en', 'Carefully crafted sauces and a variety of spices, marinated flavors cooked over embers await you.'),
  ('panel.1.btn', 'en', 'View Menu'),
  ('panel.2.tag', 'en', 'Locations'),
  ('panel.2.title', 'en', 'Your Nearest Branch'),
  ('panel.2.desc', 'en', 'We serve the same charcoal flavor in four cities. Find the nearest Tavacı Mehmet and taste it fresh.'),
  ('panel.2.btn', 'en', 'View Locations'),
  ('panel.3.tag', 'en', 'About Us'),
  ('panel.3.title', 'en', 'Charcoal Since 1998'),
  ('panel.3.desc', 'en', 'The fire lit at a small neighborhood stall never went out. Discover the story that carries tradition to today.'),
  ('panel.3.btn', 'en', 'Our Story'),
  ('panel.4.tag', 'en', 'Contact'),
  ('panel.4.title', 'en', 'Let\'s Set Your Table'),
  ('panel.4.desc', 'en', 'We\'re here for orders, reservations and all your questions. Just one click away.'),
  ('panel.4.btn', 'en', 'Contact Us'),
  ('home.story.title', 'en', 'Our Story'),
  ('home.story.text', 'en', 'Tavacı Mehmet started as a small neighborhood eatery in 1998. Today we share the same traditional charcoal flavor with thousands of guests across four cities. Our secret is simple: fresh ingredients, real charcoal fire and patience.'),
  ('home.story.more', 'en', 'Read more →'),
  ('home.ig.title', 'en', 'Follow Us'),
  ('home.cta.title', 'en', 'Craving charcoal flavor today?'),
  ('home.cta.sub', 'en', 'Order now, hot and fresh at your door.'),
  ('home.cta.btn', 'en', 'Order Now'),
  ('menu.title', 'en', 'Our Menu'),
  ('menu.sub', 'en', 'All the flavors prepared over charcoal fire'),
  ('menu.intro', 'en', 'Click a category to explore our flavors and order'),
  ('branches.title', 'en', 'Our Locations'),
  ('branches.sub', 'en', 'Find the Tavacı Mehmet nearest you'),
  ('contact.title', 'en', 'Get in Touch'),
  ('contact.sub', 'en', 'We\'re here for orders, reservations or your feedback.'),
  ('about.title', 'en', 'Our Story'),
  ('about.intro', 'en', 'The charcoal fire that Mehmet Usta lit at a small neighborhood stall in 1998 never went out. Today, with the same recipe, patience and love, we\'re with you in four cities. Tavacı Mehmet is less a restaurant chain and more a flavor tradition passed down through generations.'),
  ('about.values', 'en', 'Our Values'),
  ('about.value1.title', 'en', 'Real Charcoal'),
  ('about.value1.text', 'en', 'None of our pans cook without charcoal. The secret of flavor is in the fire.'),
  ('about.value2.title', 'en', 'Fresh Ingredients'),
  ('about.value2.text', 'en', 'Daily supply every morning, no frozen products.'),
  ('about.value3.title', 'en', 'Home Warmth'),
  ('about.value3.text', 'en', 'We welcome our guests like family.'),
  ('footer.tagline', 'en', 'Serving your tables since 1998 with pans cooked over embers. We blend traditional flavor with a modern touch.');

INSERT INTO hero_slaytlar (id, ust_baslik, ust_baslik_en, baslik, baslik_en, alt_yazi, alt_yazi_en, buton, buton_en, link, gorsel, renk, emoji, sira) VALUES
  ('h1', '1998\'den ', 'Since 1998', 'Közde pişen efsane lezzetler', 'Legendary flavors cooked over embers', 'Kendi tavanda, közün dumanıyla pişen tavuk ve köfteler.', 'Chicken and meatballs cooked in your own pan over real charcoal.', 'Menüyü Keşfet', 'Explore the Menu', '/menu', '/yuklenenler/imgmqp60djt364.png', 'from-marka to-marka-koyu', '🍗', 0),
  ('h2', 'Kampanya', 'Campaign', 'Kampüs Menü artık çok uygun', 'The Campus Menu is now great value', 'Tavada tavuk, penne, salata ve içecek bir arada.', 'Pan-cooked chicken, penne, salad and a drink together.', 'Hemen Sipariş Ver', 'Order Now', '/iletisim', '', 'from-altin to-marka', '🍽️', 10),
  ('h3', 'Yeni', 'New', 'Tavacı Sokak Lezzetleri', 'Tavacı Street Flavors', 'Dürümden burgere, sokağın enerjisi sofranda.', 'From wraps to burgers, street energy on your table.', 'Keşfet', 'Discover', '/menu', '', 'from-koyu to-marka-koyu', '🌯', 20);

INSERT INTO anasayfa_ayar (anahtar, deger) VALUES
  ('bolumler.hero', 'true'),
  ('bolumler.kesfet', 'true'),
  ('bolumler.hikaye', 'true'),
  ('bolumler.instagram', 'true'),
  ('bolumler.cta', 'true'),
  ('panelGorseller.1', '"/yuklenenler/imgmqgw0ruc839.jpeg"'),
  ('panelGorseller.2', '""'),
  ('panelGorseller.3', '""'),
  ('panelGorseller.4', '""'),
  ('panelLinkler.1', '"/menu"'),
  ('panelLinkler.2', '"/subeler"'),
  ('panelLinkler.3', '"/hakkimizda"'),
  ('panelLinkler.4', '"/iletisim"'),
  ('hikaye.emoji', '"👨‍🍳"'),
  ('hikaye.link', '"/hakkimizda"'),
  ('cta.link', '"/iletisim"'),
  ('animasyon.heroEfekt', '"fade"'),
  ('animasyon.heroSure', '3'),
  ('animasyon.heroOtomatik', 'true'),
  ('animasyon.scrollAcik', 'true'),
  ('animasyon.scrollSure', '1000');

INSERT INTO hakkimizda_rakamlar (id, sayi, etiket, etiket_en, sira) VALUES
  ('r1', '1998', 'Kuruluş yılı', 'Founded', 0),
  ('r2', '4', 'Şube', 'Branches', 10),
  ('r3', '120+', 'Çalışan', 'Employees', 20),
  ('r4', '1M+', 'Mutlu misafir', 'Happy guests', 30);

INSERT INTO hakkimizda_degerler (id, emoji, baslik, baslik_en, metin, metin_en, sira) VALUES
  ('d1', '🔥', 'Gerçek Köz', 'Real Charcoal', 'Hiçbir tavamız közsüz pişmez. Lezzetin sırrı ateşte.', 'None of our pans cook without charcoal. The secret of flavor is in the fire.', 0),
  ('d2', '🌿', 'Taze Malzeme', 'Fresh Ingredients', 'Her sabah günlük tedarik, dondurulmuş ürün yok.', 'Daily supply every morning, no frozen products.', 10),
  ('d3', '❤️', 'Ev Sıcaklığı', 'Home Warmth', 'Misafirimizi aile gibi ağırlarız.', 'We welcome our guests like family.', 20);

INSERT INTO yoneticiler (kullanici, sifre_hash) VALUES
  ('admin', '$2a$10$TzbOzXAzipBMWidD.tA1qOW7iM/5Y7N1Aq.rv/k69OD7OmNYbFhEC');


SET FOREIGN_KEY_CHECKS=1;