# 10 Dakikada RoxoePOS Geliştirme Ortamı (Windows / PowerShell)

[← Teknik Kitap’a Dön](roxoepos-technical-book.md) · [Genel Kitap](BOOK/roxoepos-book.md)

Hedef: 10 dakikada projeyi çalıştırın, testleri ve temel kalite kontrollerini geçirin.

Önkoşullar
- Node.js 22.x (LTS veya Current)
- Git
- PowerShell (pwsh)

1) Depoyu edin
- GitHub’dan projeyi klonlayın veya mevcut klasörü kullanın.

2) Bağımlılıkları kurun
- PowerShell:
```
# proje kökünde
cd client
npm ci
```

3) Geliştirme modunda çalıştırın
```
npm run dev
```
- Vite dev server ve Electron birlikte açılır. Uygulama penceresi otomatik başlar.

4) Temel kalite kontrolleri (önerilir)
```
npm run lint
npm run type-check
npm run test:run
npm run test:coverage
npm run test:critical  # kritik modüller için ≥%95 satır kapsamı
```
- test:ui ve test:watch seçenekleri de mevcut.
- E2E senaryoları için: `npm run build && npm run preview` ardından `npm run test:e2e`.

5) Üretim benzeri derleme
```
npm run build
npm run preview
```
- preview ile tarayıcıdan UI’yı üretim benzeri görünüme yakın test edebilirsiniz.

6) Windows paketleme (opsiyonel)
```
npm run build:win
```
- Oluşan kurulum dosyası dist/ altında olacaktır.

7) Yayın (opsiyonel ve güvenli)
- GH_TOKEN’ı ortam değişkeni olarak sağlayın ve asla ekrana yazdırmayın:
```
$env:GH_TOKEN = "{{GH_TOKEN}}"  # Değeri güvenli şekilde temin edin
npm run publish:win
```

8) Faydalı klasörler ve dosyalar
- client/src/pages: Ana sayfalar (POS, Products, SalesHistory, CashRegister, Settings, Dashboard)
- client/src/components: UI ve modal bileşenleri
- client/src/services: Veritabanı, dışa aktarım, şifreleme, yedekleme yardımcıları
- client/electron: main ve preload süreçleri
- docs/roxoepos-technical-book.md: Kapsamlı geliştirici kitabı
- docs/diagrams.md: Görsel diyagramlar (Mermaid)

9) POS Ekranı Hızlı Rehber (Kasa Durumu ve Ödeme Akışı)
- Kasa Açık/Kapalı Koşulu: Kasa kapalıyken ödeme ekranı ve hızlı ödeme butonları devre dışıdır. Önce CashRegister sayfasından "Kasayı Aç" ile günlük kasa oturumu başlatın.
- Ödeme Akışı Notu: Ödeme tamamlandığında satış kaydı oluşturulur, kasa kayıtları güncellenir (nakit/kart), varsa veresiye işlemleri kaydedilir ve stoklar güncellenir. Başarısızlık durumunda kullanıcıya açıklayıcı bir uyarı gösterilir.
- İlk Satış Akışı (özet):
  1) CashRegister > Kasayı Aç (başlangıç bakiyesi girin)  
  2) POS > Ürün ekleyin/barkod taratın  
  3) Ödeme butonuna basın (nakit/kart)  
  4) Fiş yazdırma (opsiyonel)

Troubleshooting
- Node sürümü uyuşmazlığı: node -v ile kontrol edin, 22.x önerilir.
- Bağımlılık hataları: npm ci’yi yeniden deneyin; gerekirse npm cache verify.
- Electron açılmıyor: Hata loglarını ve konsolu kontrol edin; client/electron/main.ts içinde hata mesajlarını inceleyin.

---

macOS ve Linux Kısa Notlar
- macOS: Xcode Command Line Tools yüklü olmalı. Paketleme sadece macOS runner/host üzerinde yapılabilir.
- Linux: Gerekli kütüphaneler (glibc, libX11 vb.) ortamda mevcut olmalı; dağıtıma göre electron-builder ek paket gereksinimleriniz olabilir.
- Komutlar aynıdır: client klasöründe npm ci, npm run dev/build.

