# E2E Seçici En İyi Uygulamaları

Bu rehber, Playwright E2E testlerinde kararlı (flaky olmayan) seçiciler yazmak ve beklemeleri doğru yapmak için uyguladığımız prensipleri içerir.

## Genel İlkeler
- data-testid tercih edin: Metin/placeholder/label değişikliklerine karşı testleri izole eder.
- Metin/placeholder yedek: data-testid yoksa placeholder/metin tabanlı seçicileri exact: true ve ek bağlamla daraltın.
- Görünürlük beklemeleri: Tıklamadan/yazmadan önce expect(locator).toBeVisible({ timeout }) ile bekleyin.
- Strict mode ihlali: Birden fazla öğeye eşleşen locator’ı daraltın (nth/first, exact: true, parent filter).
- Zamanlama: Ağır render/async durumlarda 10-15s görünürlük beklemeleri flakiness’i azaltır.

## POS Örnekleri
- Arama inputu (POS):
  - data-testid: pos-search-input
- Ödeme butonları:
  - data-testid: pay-button, quick-cash-button, quick-card-button
- Sepeti temizle:
  - data-testid: clear-cart-button
- Ürün ekleme modalı:
  - product-name-input, product-barcode-input, product-purchase-price-input, product-sale-price-input, product-stock-input, product-save-button

## Diagnostics Örnekleri
- Başlık: diagnostics-title
- Yenile: btn-refresh
- Uygula: btn-apply
- Liste: candidate-list | no-candidates

## Bekleme Stratejileri
- Arama sonra ürün kartı:
  - const item = page.getByText(name, { exact: true }).first()
  - await expect(item).toBeVisible({ timeout: 15000 })
  - await item.click()
- Modal/form:
  - await expect(page.getByText('Yeni Ürün Ekle')).toBeVisible()
  - await page.getByTestId('product-name-input').fill('Ad')

## Hata Ayıklama
- Headed mod: --headed ile UI akışını gözlemleyin.
- Trace/video: on-first-retry + retain-on-failure ile test-results’ta izleri saklayın.
- ffmpeg ile GIF: test-results/<klasör>/video.webm → docs/testing/media/*.gif

