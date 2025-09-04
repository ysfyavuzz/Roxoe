# Playwright E2E Rehberi

Bu doküman, Playwright ile uçtan uca (E2E) testleri nasıl çalıştıracağınızı ve projenin test ortamı ayarlarını özetler.

## Özette
- Test runner: Playwright (@playwright/test)
- Sunucu: Vite preview (otomatik)
- Base URL: http://localhost:4173
- Ortam bayrakları (test sırasında otomatik):
  - NODE_ENV=test
  - VITE_LICENSE_BYPASS=true (aktivasyon ekranını atlar)
  - VITE_ADMIN_MODE=true (admin modu; Diagnostics indeks uygulama guard'ı için)
  - VITE_E2E_MODE=true (test özel davranışları için)

## Tüm E2E testlerini çalıştırma
```bash
npm --prefix client run e2e
# veya
npm --prefix client run test:e2e
```

- playwight.config.ts, webServer olarak `npm run preview` komutunu kullanır; ayrı bir dev sunucusu başlatmanız gerekmez.
- trace=on-first-retry, video=retain-on-failure ayarları etkin; hatalarda `test-results/` altında video ve izler saklanır.

## Tek bir E2E dosyası/örnek çalıştırma
```bash
# Tek dosya
npm --prefix client run e2e -- e2e/pos-sale-flow.spec.ts

# Başlık ile filtreleme
npm --prefix client run e2e -- -g "POS satış akışı"

# Headed mod (gözle izlemek için)
npm --prefix client run e2e -- --headed -g "POS"

# Debug modu (adım adım)
PWDEBUG=1 npm --prefix client run e2e -- e2e/diagnostics.spec.ts
```

## Seçiciler ve stabilite notları
- Ürün ekleme modalindeki alanlar için label yerine placeholder kullanılır:
  - "Ürün adı girin", "Barkod girin", fiyatlar için "0.00", stok için "0" (exact: true)
- POS sayfasında ürün araması öncesi varsayılan grup "Tümü" aktif edilmelidir. Aksi halde grup filtresi ürünü listelemeyi engelleyebilir.
- Görsel regresyon testi (visual-regression.spec.ts) varsayılan olarak skip edilmiştir.

## Sık karşılaşılan sorunlar
- 30s timeout aşımları: Selector’ları beklerken `expect(locator).toBeVisible()` kullanın; gerekirse `timeout` arttırın (ör. 10s).
- Strict mode violation: Tek eşleşmesi beklenen locator birden fazla öğe döndürdüğünde olur. Placeholder ve `exact: true` ile daraltın veya `.first()`/`nth()` kullanın.
- Browserslist uyarısı: `npx update-browserslist-db@latest` ile güncelleyebilirsiniz (opsiyonel).

## Kısa kapsama
- E2E senaryolar (örnekler):
  - Diagnostics: indeks önerilerini yenile ve uygulama (admin guard + onay diyaloğu)
  - Backup Flow: yedekleme arayüzünde başarı mesajı doğrulama
  - POS: sayfa yükleniyor (smoke), basit satış akışı, sepet temizleme

Daha fazla örnek için `client/e2e/` klasörüne bakın.

## Medya (Ekran görüntüsü ve GIF)
- Playwright her testte hata olduğunda video kaydını `test-results/` altına alır (video: retain-on-failure).
- Anlık ekran görüntüsü almak için test içinde `await page.screenshot({ path: 'screenshot.png' })` kullanılabilir.
- WebM videoları GIF’e dönüştürme (ffmpeg):
```bash
ffmpeg -i test-results/<klasör>/video.webm -vf "fps=10,scale=800:-1:flags=lanczos" -loop 0 docs/testing/media/pos-sale-flow.gif
```
- Küçük boyut için fps=6 ve ölçek düşürülebilir.
- Örnek GIF yerleştirme:

![POS satış akışı](media/pos-sale-flow.gif)
