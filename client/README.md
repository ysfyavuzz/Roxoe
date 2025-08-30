# RoxoePOS Client (React + Electron + Vite)

Bu klasör, RoxoePOS'un React (renderer) ve Electron entegrasyonunu içeren istemci uygulamasıdır.

Hızlı komutlar:

- npm --prefix client run dev: Vite + Electron geliştirme modu
- npm --prefix client run build: Derleme ve paketleme (tsc + vite + electron-builder)
- npm --prefix client run test:coverage: Vitest kapsam raporu (global ≥%80)
- npm --prefix client run test:critical: Kritik modüller için ≥%95 satır kapsamı kontrolü

Notlar:

- Tam dokümantasyon ve mimari detaylar için proje kökündeki README.md ve docs/ klasörünü inceleyin (özellikle docs/roxoepos-technical-book.md).
- Ürün/sepet listeleri için list sanallaştırma (react-window) devrede; büyük listelerde performans artışı sağlar.

Önemli Hook’lar:

- usePaymentFlow: Ödeme tamamlandıktan sonraki işlemleri tek yerde yönetir; POSPage tarafından kullanılır.
- useRegisterStatus: Kasa açık/kapalı durumu ve oturum işlemlerini merkezileştirir; POSPage ve diğer sayfalarda kullanılabilir.
- useSettingsPage: Ayarlar sayfası için durum/aksiyonları yönetir (client/src/pages/settings/hooks/useSettingsPage.ts).

## Testler

Komutlar (client/ dizini):

```bash
# Unit / Integration / Coverage
npm run test
npm run test:coverage

# E2E (tam suite)
npm run e2e

# E2E (tek dosya)
npm run e2e -- e2e/pos-cart-clear.spec.ts

# Headed/Debug
npm run e2e -- --headed -g "POS"
PWDEBUG=1 npm run e2e -- e2e/diagnostics.spec.ts
```

Notlar:
- Playwright E2E, Vite preview’ı otomatik başlatır (baseURL: http://localhost:4173).
- Test ortamı bayrakları: NODE_ENV=test, VITE_LICENSE_BYPASS=true, VITE_ADMIN_MODE=true, VITE_E2E_MODE=true.
- Görsel regresyon testi varsayılan olarak skip.
