# Batch 9 — Testler

Son Güncelleme: 2025-08-27
Sürüm: 0.5.3

Bu belge, RoxoePOS projesindeki test katmanını (özellikle `client/src/test/*`) derli toplu şekilde açıklar. Amaç; test kapsamı hedeflerini görünür kılmak, dosya bazında neyin test edildiğini özetlemek, eksik senaryoları belirlemek ve geliştirme ekiplerine pratik bir çalışma planı sunmaktır.

---

## Hedef Metrikler (Özet)
- Kapsam (global): statements ≥ %80, branches ≥ %80, functions ≥ %80, lines ≥ %80
- Kritik akışlar (örn: Ödeme, Veri kayıt/restore): satır kapsamı ≥ %95
- Test çalışma süresi: Lokal geliştiricide makul (< 60 sn unit, < 5 dk tüm suite)
- Raporlama: text + json + html (opsiyonel: lcov)

Not: `client/vitest.config.ts` içinde global coverage eşikleri tanımlıdır; CI’de `test:critical` komutu bu eşiği gate eder.

---

## Araçlar ve Yapılandırma
- Test Runner: Vitest (jsdom, globals)
- UI Test: React Testing Library (RTL)
- E2E: Playwright (ayrı dizinde)
- Setup: `setupFiles: ['./src/test/setup.ts']`
- Coverage: v8 provider; `reporter: ['text','json','html']`, `thresholds.global: 80`

İlgili dosya: `client/vitest.config.ts`

---

## 9.1 client/src/test/Button.test.tsx
- Amaç: UI Button bileşeninin temel davranışlarını test eder
- Kapsananlar:
  - Metnin render edilmesi
  - click handler çağrısı
  - disabled durumu
  - variant ve size sınıfları
  - default props (disabled=false, type='button')
- Önerilen ek senaryolar:
  - loading durumu (varsa) ve aria-özellikleri
  - erişilebilirlik (role/aria-pressed/aria-busy vb.)
  - keyboard etkileşimleri (Enter/Space)

## 9.2 client/src/test/formatters.test.ts
- Amaç: `parseTurkishNumber` için pozitif/negatif/boş/NaN/sıfır gibi durumları doğrular
- Kapsananlar:
  - Türkçe format (ör: '1.234,56' → 1234.56)
  - Basit sayılar ve negatif değerler
  - Geçersiz/boş/NaN durumlarında `undefined`
  - Sıfır değerleri
- Önerilen ek senaryolar:
  - Baştaki/sondaki boşluklar ve iç boşluklar (trim)
  - Karışık nokta/virgül varyasyonları (örn: '1,234' beklenen davranışın netleştirilmesi)
  - Çok büyük sayılar ve bilimsel gösterim (gerekliyse)

## 9.3 client/src/test/setup.ts
- Amaç: Ortak test kurulumu ve global mock’lar
- İçerik:
  - RTL sonrası cleanup
  - ResizeObserver mock
  - Electron `ipcRenderer` mock
  - localStorage mock
  - Basit IndexedDB mock
  - Gürültülü uyarıları filtreleme (örnek React uyarısı)
- Öneriler:
  - İleride eklenecek API/mock gereksinimleri için modüler mock yardımcıları (`/src/test/mocks/*`) düşünün
  - IndexedDB için `fake-indexeddb` ile daha kapsamlı kurulum (paket zaten devDep’te mevcut)

---

## İlgili Dizinler (Diğer Test Katmanları)
- Entegrasyon: `client/src/integration/*.test.ts`
  - Örnekler: `backup-restore.test.ts`, `pos-flow.test.ts`, `product-crud.test.ts`
- Performans: `client/src/performance/*.test.ts`
  - Örnekler: `bundle-size.test.ts`, `render-time.test.ts`, `memory-usage.test.ts`
- E2E: `client/e2e/*.spec.ts`
  - Örnekler: `pos-sale-flow.spec.ts`, `backup-flow.spec.ts`, `visual-regression.spec.ts`

Bu belge Batch 9’un odağı gereği `src/test` altına yoğunlaşır; ancak entegrasyon ve E2E testleri de kapsam politikasına dahildir.

---

## Komutlar
- Unit testleri çalıştır: `npm run test` (client içinde)
- Kapsamlı ve coverage raporlarıyla: `npm run test:coverage`
- Kritik eşik gate: `npm run test:critical` (coverage kontrolü + eşik)
- E2E: `npm run test:e2e`

Raporlar: `client/coverage/` (html), `client/coverage/coverage-final.json` (json)

Opsiyonel: LCOV raporu gerekiyorsa `vitest` coverage reporter’a `'lcov'` eklenebilir (CI entegrasyonu için yararlı).

---

## Öncelikli Senaryo Önerileri
- Ödeme akışı (normal/split), indirim uygulaması ve POS cihazlı/cihazsız yollar için smoke test’ler
- Büyük liste render’larında sanallaştırma (react-window) için basit render-time kontrol testleri
- Sayı formatlama ve arama (turkishSearch) edge-case’leri

---

## Raporlama ve CI
- Coverage gate: `client/scripts/check-coverage.js`
- CI’de minimal rapor: `--reporter=dot` (E2E)
- Ajv ile şema doğrulama: `npm run validate:all`

---

## Dosya Haritası (Batch 9)
- client/src/test/Button.test.tsx
- client/src/test/formatters.test.ts
- client/src/test/setup.ts

İlgili belgeler: `docs/TEST-KAPSAMI.md`, `docs/PERFORMANS.md`, `docs/performance/PERFORMANS-KONTROL-LISTESI.md`
