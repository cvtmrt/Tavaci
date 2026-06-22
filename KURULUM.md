# Sunucu Kurulumu (cPanel + MariaDB)

Site ve yönetim paneli artık **tek Node uygulaması** olarak çalışır ve tüm
veriyi **MariaDB (`hesapyon_Tavaci`)** veritabanından okur (SSR — panelde yapılan
değişiklik anında sitede görünür). JSON dosyaları kullanılmaz.

## 1. Veritabanı şemasını uygula
phpMyAdmin → `hesapyon_Tavaci` → **Import** → `sql/sema.sql` dosyasını yükle.

> Tablolar `utf8mb4`'tür (Türkçe karakter + emoji için zorunlu). Sunucu
> varsayılanı latin1 olsa da tablolar utf8mb4 oluşturulur.

## 2. Ortam değişkenleri
`panel/.env` dosyasını oluştur (`panel/.env.example`'ı kopyala) ve doldur:
```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=hesapyon_kullanici
DB_PASS=...
DB_NAME=hesapyon_Tavaci
ADMIN_SIFRE=...        # ilk panel parolası (migration sırasında hash'lenir)
OTURUM_ANAHTARI=...    # rastgele uzun bir değer
```

## 3. Bağımlılıklar + verinin aktarımı + derleme
```
npm install
npm run aktar     # mevcut panel/veri/*.json verisini DB'ye taşır (bir kez)
npm run build     # SSR derlemesi (dist/)
```

## 4. cPanel "Setup Node.js App"
- **Application startup file:** `panel/sunucu.mjs`
- Ortam değişkenlerini panele de ekle (veya `.env` kullan).
- Uygulamayı başlat. Site `/`, panel `/panel` adresinde.

## 5. Doğrulama
- Panele gir (`/panel`), bir ürünün fiyatını değiştir → siteyi yenile, anında değişti mi?
- Emoji/Türkçe içeren bir alan kaydet → phpMyAdmin'de ve sitede bozulmadan görünüyor mu? (charset testi)
- Kategori sil → ürünleri de gitti mi (FK CASCADE)?
- Geri Al penceresinden bir yedeğe dönülebiliyor mu?

## Notlar
- Yedekler: her düzenlemeden önce DB anlık görüntüsü kalıcı veri dizininde `yedekler/<zaman>.json` olarak alınır (son 30 tutulur).
- Fotoğraflar kalıcı veri dizininde `yuklenenler/` içinde kalır; logo `<VERI_DIZIN>/logo.png` (route ile `/logo.png` adresinden sunulur).
- `npm run aktar` ve doğrulama bittikten sonra `panel/veri/*.json` dosyaları artık kullanılmıyor; istersen silebilirsin.

---

# Railway ile Yayınlama (PostgreSQL)

Uygulama Node + PostgreSQL + disk (Volume) olarak Railway'de çalışır.
Free plan ($1/ay, 30 gün $5 kredili deneme) küçük restoran sitesi için yeterli.
Şema ve ilk veri **otomatik** kurulur (`scripts/db-kur.mjs`, her deploy öncesi çalışır).

## 1. Proje + PostgreSQL
Railway → **New Project** → **Provision PostgreSQL**. Railway `DATABASE_URL` ve
`PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE` değişkenlerini üretir (dışarıdan bağlanmak
için public proxy host/port da verilir).

## 2. Uygulama servisi
Aynı projeye GitHub reposundan servis ekle. `railway.json` her şeyi tanımlar:
- **build:** `npm ci && npm run build`
- **preDeploy:** `npm run db-kur` (şema + boşsa ilk veri + admin)
- **start:** `npm start`

## 3. Volume (kalıcı görsel/yedek/logo)
Uygulama servisine bir **Volume** ekle, mount yolu: `/app/.veri-kalici`.

## 4. Ortam değişkenleri (uygulama servisinde)
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
VERI_DIZIN=/app/.veri-kalici
ADMIN_SIFRE=<panel parolası>        # db-kur bunu bcrypt'leyip admin yapar
OTURUM_ANAHTARI=<rastgele uzun değer>
```
> Not: `${{Postgres...}}` referansındaki servis adı, Railway'deki Postgres servisinin
> adıyla aynı olmalı (örn. `Postgres`).

## 5. Şema + veri
Otomatik: deploy sırasında `preDeployCommand` (`npm run db-kur`) çalışır →
şema oluşturulur, veritabanı **boşsa** `panel/veri/*.json` aktarılır ve admin yaratılır.
Sonraki deploy'larda canlı veriye dokunulmaz.

İstersen yerelden bağlantıyı test et (public proxy `DATABASE_URL` ile, `?sslmode=require` ekleyerek):
```
npm run db-test   # bağlantı + Türkçe/emoji testi
```
Mevcut veriyi JSON ile **zorla ezmek** istersen: `npm run aktar`.

## 6. Doğrulama
- Railway URL → `/panel` giriş (ADMIN_SIFRE) → ürün fiyatı değiştir → site anında güncellendi mi (SSR).
- Görsel yükle → **redeploy sonrası** görsel duruyor mu (Volume).
- Logo yükle → `/logo.png` güncellendi mi, redeploy sonrası kalıcı mı.
- Türkçe/emoji kaydet → bozulmadan görünüyor mu.
