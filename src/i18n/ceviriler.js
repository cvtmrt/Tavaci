// ============================================================
//  ÇEVİRİ SÖZLÜĞÜ (TR / EN)
//  Arayüz metinleri burada iki dilde tutulur.
//  HTML'de data-i18n="anahtar" taşıyan öğeler, seçilen dile
//  göre bu sözlükten doldurulur (DilSecici.astro betiği yapar).
//
//  Yeni metin eklemek için: hem tr hem en altına aynı anahtarı ekle,
//  sonra ilgili HTML öğesine data-i18n="anahtar" yaz.
//
//  NOT: Menü ürün adları/açıklamaları ve şube adresleri özel isim
//  olduğu için çevrilmez (Türkçe kalır).
//
//  PANEL OVERRIDE: panel/veri/metinler.json içindeki yazılar
//  buradaki varsayılanların ÜZERİNE yazılır. Böylece sayfa
//  metinleri yönetim panelinden düzenlenebilir.
// ============================================================

// Panelde düzenlenen metinler (yoksa boş kabul edilir)
import override from "../../panel/veri/metinler.json";

const varsayilan = {
  tr: {
    // --- Üst menü ---
    "nav.home": "Anasayfa",
    "nav.menu": "Menü",
    "nav.branches": "Şubeler",
    "nav.about": "Hakkımızda",
    "nav.contact": "İletişim",
    "nav.order": "Sipariş Ver",
    "order.sub": "Online Sipariş",

    // --- Arama ---
    "search.placeholder": "Menü, şube, sayfa... her şeyi ara",
    "search.start": "Aramak için yazmaya başla…",

    // --- Dil seçici penceresi ---
    "lang.title": "Dil",
    "lang.apply": "Seçim Yap",
    "lang.close": "Kapat",

    // --- Hero slaytları ---
    "hero.1.tag": "1998'den beri",
    "hero.1.title": "Közde pişen efsane lezzetler",
    "hero.1.sub": "Kendi tavanda, közün dumanıyla pişen tavuk ve köfteler.",
    "hero.1.btn": "Menüyü Keşfet",
    "hero.2.tag": "Kampanya",
    "hero.2.title": "Kampüs Menü artık çok uygun",
    "hero.2.sub": "Tavada tavuk, penne, salata ve içecek bir arada.",
    "hero.2.btn": "Hemen Sipariş Ver",
    "hero.3.tag": "Yeni",
    "hero.3.title": "Tavacı Sokak Lezzetleri",
    "hero.3.sub": "Dürümden burgere, sokağın enerjisi sofranda.",
    "hero.3.btn": "Keşfet",

    // --- Keşfetmeye Başla bölümü ---
    "discover.title": "Keşfetmeye Başla",
    "discover.sub": "Tavacı Mehmet dünyasını panel panel gez",
    "panel.1.tag": "Lezzet Dünyası",
    "panel.1.title": "İnanılmaz Detaylar",
    "panel.1.desc": "Özenle hazırlanmış soslar ve çeşit çeşit baharatlarla marine edilmiş, közde pişen lezzetler seni bekliyor.",
    "panel.1.btn": "Menüyü Gör",
    "panel.2.tag": "Lezzet Noktaları",
    "panel.2.title": "Sana En Yakın Şube",
    "panel.2.desc": "Dört şehirde, aynı köz lezzetiyle hizmetindeyiz. En yakın Tavacı Mehmet'i bul, sıcak sıcak tadına bak.",
    "panel.2.btn": "Şubeleri Gör",
    "panel.3.tag": "Hakkımızda",
    "panel.3.title": "1998'den Beri Köz",
    "panel.3.desc": "Küçük bir mahalle tezgâhında yanan ateş hiç sönmedi. Geleneği bugüne taşıyan hikayemizi keşfet.",
    "panel.3.btn": "Hikayemiz",
    "panel.4.tag": "İletişim",
    "panel.4.title": "Sofranı Hazırlayalım",
    "panel.4.desc": "Sipariş, rezervasyon ve tüm soruların için buradayız. Bir tık uzağındayız.",
    "panel.4.btn": "Bize Ulaş",

    // --- Anasayfa: hikaye / instagram / çağrı ---
    "home.story.title": "Hikayemiz",
    "home.story.text": "Tavacı Mehmet, küçük bir mahalle lokantası olarak 1998'de yola çıktı. Bugün dört şehirde, aynı geleneksel köz lezzetini binlerce misafirimizle paylaşıyoruz. Sırrımız basit: taze malzeme, gerçek köz ateşi ve sabır.",
    "home.story.more": "Daha fazlasını oku →",
    "home.ig.title": "Bizi Takip Et",
    "home.cta.title": "Bugün canınız köz mü çekti?",
    "home.cta.sub": "Hemen sipariş verin, sıcak sıcak kapınızda.",
    "home.cta.btn": "Sipariş Ver",

    // --- Footer ---
    "footer.tagline": "Közde pişen tavalarıyla 1998'den beri sofralarınızda. Geleneksel lezzeti modern bir dokunuşla buluşturuyoruz.",
    "footer.quick": "Hızlı Bağlantılar",
    "footer.contact": "Bize Ulaşın",
    "footer.rights": "Tüm hakları saklıdır.",

    // --- Menü sayfası ---
    "menu.title": "Menümüz",
    "menu.sub": "Köz ateşinde hazırlanan tüm lezzetler",
    "menu.order": "Sipariş Ver",
    "cart.add": "Sepete Ekle",
    "cart.title": "Sepetim",
    "cart.empty": "Sepetin boş. Menüden ürün ekle.",
    "cart.total": "Toplam",
    "cart.name": "Ad Soyad",
    "cart.phone": "Telefon",
    "cart.address": "Adres",
    "cart.note": "Not (isteğe bağlı)",
    "cart.order": "WhatsApp ile Sipariş Ver",
    "cart.cardPay": "Kartla Online Öde",
    "cart.payNote": "Ödeme kapıda (nakit/kart). Siparişin WhatsApp'tan iletilir.",
    "menu.intro": "Kategorilere tıklayarak lezzetlerimizi keşfet ve sipariş ver",
    "menu.items": "ürün",
    "menu.viewCat": "İncele",
    "detail.ingredients": "İçinde Neler Var?",
    "detail.pairing": "Yanına Ne Gider?",
    "detail.nutrition": "Besin Değerleri",
    "detail.allergens": "Alerjenler",
    "detail.related": "Benzer Ürünler",
    "detail.sample": "Temsilî bilgidir",
    "detail.ingText": "Taze malzemeler, özel baharatlar ve közün eşsiz lezzetiyle hazırlanır.",
    "nut.cal": "Kalori",
    "nut.protein": "Protein",
    "nut.carb": "Karbonhidrat",
    "nut.fat": "Yağ",
    "alrj.gluten": "Gluten",
    "alrj.milk": "Süt",
    "alrj.egg": "Yumurta",

    // --- Şubeler sayfası ---
    "branches.title": "Şubelerimiz",
    "branches.sub": "Size en yakın Tavacı Mehmet'i bulun",
    "branches.directions": "Yol Tarifi",

    // --- Hakkımızda sayfası ---
    "about.title": "Hikayemiz",
    "about.intro": "1998'de Mehmet Usta'nın küçük bir mahalle tezgâhında yaktığı köz ateşi hiç sönmedi. Bugün aynı tarif, aynı sabır ve aynı sevgiyle dört şehirde sizlerleyiz. Tavacı Mehmet bir restoran zincirinden çok, kuşaktan kuşağa aktarılan bir lezzet geleneğidir.",
    "about.values": "Değerlerimiz",
    "about.value1.title": "Gerçek Köz",
    "about.value1.text": "Hiçbir tavamız közsüz pişmez. Lezzetin sırrı ateşte.",
    "about.value2.title": "Taze Malzeme",
    "about.value2.text": "Her sabah günlük tedarik, dondurulmuş ürün yok.",
    "about.value3.title": "Ev Sıcaklığı",
    "about.value3.text": "Misafirimizi aile gibi ağırlarız.",
    "stat.year": "Kuruluş yılı",
    "stat.branch": "Şube",
    "stat.staff": "Çalışan",
    "stat.guest": "Mutlu misafir",

    // --- İletişim sayfası ---
    "contact.title": "Bize Ulaşın",
    "contact.sub": "Sipariş, rezervasyon veya görüşleriniz için buradayız.",
    "contact.phone": "Telefon",
    "contact.email": "E-posta",
    "contact.hours": "Çalışma Saatleri",
    "contact.hoursVal": "Her gün 11:00 - 23:00",
    "form.name": "Ad Soyad",
    "form.phone": "Telefon",
    "form.message": "Mesajınız",
    "form.send": "Gönder",
    "form.thanks": "Teşekkürler! En kısa sürede size dönüş yapacağız. 🎉",
  },

  en: {
    // --- Header ---
    "nav.home": "Home",
    "nav.menu": "Menu",
    "nav.branches": "Locations",
    "nav.about": "About Us",
    "nav.contact": "Contact",
    "nav.order": "Order Now",
    "order.sub": "Order Online",

    // --- Search ---
    "search.placeholder": "Search menu, locations, pages...",
    "search.start": "Start typing to search…",

    // --- Language picker ---
    "lang.title": "Language",
    "lang.apply": "Apply",
    "lang.close": "Close",

    // --- Hero slides ---
    "hero.1.tag": "Since 1998",
    "hero.1.title": "Legendary flavors cooked over embers",
    "hero.1.sub": "Chicken and meatballs cooked in your own pan over real charcoal.",
    "hero.1.btn": "Explore the Menu",
    "hero.2.tag": "Campaign",
    "hero.2.title": "The Campus Menu is now great value",
    "hero.2.sub": "Pan-cooked chicken, penne, salad and a drink together.",
    "hero.2.btn": "Order Now",
    "hero.3.tag": "New",
    "hero.3.title": "Tavacı Street Flavors",
    "hero.3.sub": "From wraps to burgers, street energy on your table.",
    "hero.3.btn": "Discover",

    // --- Discover section ---
    "discover.title": "Start Exploring",
    "discover.sub": "Browse the world of Tavacı Mehmet, panel by panel",
    "panel.1.tag": "Flavor World",
    "panel.1.title": "Incredible Details",
    "panel.1.desc": "Carefully crafted sauces and a variety of spices, marinated flavors cooked over embers await you.",
    "panel.1.btn": "View Menu",
    "panel.2.tag": "Locations",
    "panel.2.title": "Your Nearest Branch",
    "panel.2.desc": "We serve the same charcoal flavor in four cities. Find the nearest Tavacı Mehmet and taste it fresh.",
    "panel.2.btn": "View Locations",
    "panel.3.tag": "About Us",
    "panel.3.title": "Charcoal Since 1998",
    "panel.3.desc": "The fire lit at a small neighborhood stall never went out. Discover the story that carries tradition to today.",
    "panel.3.btn": "Our Story",
    "panel.4.tag": "Contact",
    "panel.4.title": "Let's Set Your Table",
    "panel.4.desc": "We're here for orders, reservations and all your questions. Just one click away.",
    "panel.4.btn": "Contact Us",

    // --- Home: story / instagram / cta ---
    "home.story.title": "Our Story",
    "home.story.text": "Tavacı Mehmet started as a small neighborhood eatery in 1998. Today we share the same traditional charcoal flavor with thousands of guests across four cities. Our secret is simple: fresh ingredients, real charcoal fire and patience.",
    "home.story.more": "Read more →",
    "home.ig.title": "Follow Us",
    "home.cta.title": "Craving charcoal flavor today?",
    "home.cta.sub": "Order now, hot and fresh at your door.",
    "home.cta.btn": "Order Now",

    // --- Footer ---
    "footer.tagline": "Serving your tables since 1998 with pans cooked over embers. We blend traditional flavor with a modern touch.",
    "footer.quick": "Quick Links",
    "footer.contact": "Get in Touch",
    "footer.rights": "All rights reserved.",

    // --- Menu page ---
    "menu.title": "Our Menu",
    "menu.sub": "All the flavors prepared over charcoal fire",
    "menu.order": "Order",
    "cart.add": "Add to Cart",
    "cart.title": "My Cart",
    "cart.empty": "Your cart is empty. Add items from the menu.",
    "cart.total": "Total",
    "cart.name": "Full Name",
    "cart.phone": "Phone",
    "cart.address": "Address",
    "cart.note": "Note (optional)",
    "cart.order": "Order via WhatsApp",
    "cart.cardPay": "Pay Online by Card",
    "cart.payNote": "Pay at the door (cash/card). Your order is sent via WhatsApp.",
    "menu.intro": "Click a category to explore our flavors and order",
    "menu.items": "items",
    "menu.viewCat": "View",
    "detail.ingredients": "What's Inside?",
    "detail.pairing": "Goes Well With",
    "detail.nutrition": "Nutrition Facts",
    "detail.allergens": "Allergens",
    "detail.related": "You May Also Like",
    "detail.sample": "Sample information",
    "detail.ingText": "Prepared with fresh ingredients, special spices and the unique flavor of charcoal.",
    "nut.cal": "Calories",
    "nut.protein": "Protein",
    "nut.carb": "Carbs",
    "nut.fat": "Fat",
    "alrj.gluten": "Gluten",
    "alrj.milk": "Milk",
    "alrj.egg": "Egg",

    // --- Branches page ---
    "branches.title": "Our Locations",
    "branches.sub": "Find the Tavacı Mehmet nearest you",
    "branches.directions": "Get Directions",

    // --- About page ---
    "about.title": "Our Story",
    "about.intro": "The charcoal fire that Mehmet Usta lit at a small neighborhood stall in 1998 never went out. Today, with the same recipe, patience and love, we're with you in four cities. Tavacı Mehmet is less a restaurant chain and more a flavor tradition passed down through generations.",
    "about.values": "Our Values",
    "about.value1.title": "Real Charcoal",
    "about.value1.text": "None of our pans cook without charcoal. The secret of flavor is in the fire.",
    "about.value2.title": "Fresh Ingredients",
    "about.value2.text": "Daily supply every morning, no frozen products.",
    "about.value3.title": "Home Warmth",
    "about.value3.text": "We welcome our guests like family.",
    "stat.year": "Founded",
    "stat.branch": "Branches",
    "stat.staff": "Employees",
    "stat.guest": "Happy guests",

    // --- Contact page ---
    "contact.title": "Get in Touch",
    "contact.sub": "We're here for orders, reservations or your feedback.",
    "contact.phone": "Phone",
    "contact.email": "Email",
    "contact.hours": "Working Hours",
    "contact.hoursVal": "Every day 11:00 - 23:00",
    "form.name": "Full Name",
    "form.phone": "Phone",
    "form.message": "Your Message",
    "form.send": "Send",
    "form.thanks": "Thank you! We'll get back to you as soon as possible. 🎉",
  },
};

// Varsayılanları panel metinleriyle birleştir (panel kazanır)
export const ceviriler = {
  tr: { ...varsayilan.tr, ...(override?.tr || {}) },
  en: { ...varsayilan.en, ...(override?.en || {}) },
};
