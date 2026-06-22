# Railway kurulumu

Bu proje için gereken mimari:

- 1 adet GitHub kaynaklı Node servisi
- 1 adet MySQL servisi
- Node servisine bağlı 1 adet Volume

PostgreSQL, Redis ve Bucket gerekmez.

## Node servisi değişkenleri

Railway'deki MySQL servisinin adı `MySQL` ise:

```env
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASS=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
ADMIN_SIFRE=guclu-panel-parolasi
OTURUM_ANAHTARI=uzun-rastgele-bir-deger
VERI_DIZIN=/data
```

`PORT` değişkenini elle tanımlamayın; Railway otomatik verir.

## Deploy ayarları

- Build command: `npm ci && npm run build`
- Pre-deploy command: `npm run db-kur`
- Start command: `npm start`

`db-kur` ilk deploy'da şemayı ve başlangıç verisini kurar. Sonraki
deploy'larda mevcut veritabanını ezmez.

## Volume

Node servisine bir Volume bağlayın:

- Mount path: `/data`

Panelden yüklenen görseller, logo ve JSON yedekleri burada kalıcı tutulur.

## Domain

Node servisinde `Settings -> Networking -> Generate Domain` seçin.

- Site: `/`
- Yönetim paneli: `/panel`
