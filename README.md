# Tavacı Mehmet Efendi — Web Sitesi + Yönetim Paneli

Tavacı Mehmet Efendi restoranı için **çift dilli (TR/EN)**, animasyonlu bir restoran web sitesi ve ona bağlı **tamamen bağımsız bir yönetim paneli**. Tüm içerik (menü, sayfalar, anasayfa tasarımı, renkler) panelden, kodsuz yönetilir. Veri tamamen yereldedir (`panel/veri/*.json`) — dış servis yok.

---

## 📁 Proje Yapısı

```
.
├── src/                  →  WEB SİTESİ (Astro + Tailwind CSS)
│   ├── pages/            →  Sayfalar: anasayfa, menü, kategori, ürün detay, şubeler, hakkımızda, iletişim
│   ├── components/       →  Header, Footer, Hero slider, Sepet, Arama, Dil seçici, Bölüm panelleri
│   ├── layouts/          →  Ortak iskelet (tema, animasyon, WhatsApp butonu)
│   ├── data/             →  İçerik katmanı (panel verisini okur)
│   ├── i18n/             →  TR/EN çeviri sözlüğü
│   └── styles/           →  Tema (marka renkleri, fontlar)
│
├── panel/                →  YÖNETİM PANELİ (Node + Express, bağımsız)
│   ├── sunucu.mjs        →  Panel sunucusu (API + statik)
│   ├── genel/            →  Panel arayüzü (index.html + app.js)
│   └── veri/             →  İÇERİK (menü, kategoriler, şubeler, ayarlar, anasayfa, tema, hakkımızda)
│
├── public/               →  Logo + yüklenen görseller
├── astro.config.mjs
└── package.json          →  "dev" (site) ve "panel" (yönetim) komutları
```

---

## 🌐 Web Sitesi
- **Astro + Tailwind CSS** (statik, hızlı, SEO dostu)
- Gerçek menü (Yemeksepeti'nden), kategori + ürün detay sayfaları
- **Çift dilli** TR/EN (anlık dil değişimi, çeviri panelden)
- Animasyonlar (hero slider, scroll animasyonları — panelden ayarlanır)
- **Sepet + WhatsApp sipariş** (kapıda ödeme), şube haritası, online sipariş linki

Çalıştırma:
```bash
npm install
npm run dev        # http://localhost:4321
```

## 🛠️ Yönetim Paneli
- **Bağımsız** (Node/Express), veri `panel/veri/*.json` içinde — sende
- Düzenlenebilir: ürünler, kategoriler, şubeler, **anasayfa tasarımı** (hero, paneller, görünürlük), **sayfa yazıları** (TR/EN), **renkler**, logo, animasyonlar, iletişim
- **Canlı önizleme**, otomatik kayıt, **otomatik çeviri (TR→EN)**, **otomatik yedek + Geri Al**, ürün arama
- Site içeriğini bu panel besler

Çalıştırma:
```bash
npm run panel      # http://localhost:5174
```
> Giriş şifresi `panel/.env` içindeki `ADMIN_SIFRE` ile ayarlanır (varsayılan: `tavaci123`).

---

## 🚀 Akış
Panelde düzenle → **Önizleme**'de gör → **Yayınla** (site `npm run build` ile yeniden derlenir, `dist/`).

## 📌 Notlar
- Online kart ödeme (iyzico/PayTR), SEO ve canlıya alma (deploy) ileride, restoran sahibinin onayıyla eklenecek.
- Hero/panel görselleri panelden istenince yüklenebilir (şimdilik degrade + emoji).
