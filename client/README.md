# RoxoePOS Client (React + Electron + Vite)

Bu klasör, RoxoePOS'un React (renderer) ve Electron entegrasyonunu içeren istemci uygulamasıdır.

Hızlı komutlar:

- npm --prefix client run dev: Vite + Electron geliştirme modu
- npm --prefix client run build: Derleme ve paketleme (tsc + vite + electron-builder)
- npm --prefix client run test:coverage: Vitest kapsam raporu (global ≥%80)
- npm --prefix client run test:critical: Kritik modüller için ≥%95 satır kapsamı kontrolü

Notlar:

- Tam dokümantasyon ve mimari detaylar için proje kökündeki README.md ve docs/ klasörünü inceleyin (özellikle docs/ROXOEPOS-TEKNIK-KITAP.md).
- Ürün/sepet listeleri için list sanallaştırma (react-window) devrede; büyük listelerde performans artışı sağlar.

Önemli Hook’lar:

- usePaymentFlow: Ödeme tamamlandıktan sonraki işlemleri tek yerde yönetir; POSPage tarafından kullanılır.
- useRegisterStatus: Kasa açık/kapalı durumu ve oturum işlemlerini merkezileştirir; POSPage ve diğer sayfalarda kullanılabilir.
- useSettingsPage: Ayarlar sayfası için durum/aksiyonları yönetir (client/src/pages/settings/hooks/useSettingsPage.ts).
