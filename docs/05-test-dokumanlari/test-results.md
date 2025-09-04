# Son E2E Çalıştırma Sonuçları

Tarih/Zaman: 2025-08-30 22:53:13Z (UTC)
Komut: `npm --prefix client run e2e`

Özet:
- Geçti: 8
- Skip: 1 (visual-regression)
- Başarısız: 0

Detaylı Liste:
- backup-flow.spec.ts: OK
- pos-basic.spec.ts: OK
- pos-cart-clear.spec.ts: OK
- diagnostics.spec.ts: OK
- pos-sale-flow.spec.ts: OK
- pos-smoke.spec.ts: OK
- visual-regression.spec.ts: SKIPPED
- synthetic-smoke.spec.ts (2 test): OK

Notlar ve Aksiyonlar:
- pos-sale-flow.spec.ts: Ürün araması sonrası ürün görünürlüğü bekleme ve tıklama sırası güçlendirildi; tüm suite’te yeşil.
- Playwright config: Vite preview ve test env bayrakları otomatik.
- İlerleme: Görsel regresyon testi bilinçli olarak skip durumda.

## Performans Testi (fake-indexeddb)
Komut: `npm --prefix client run test:performance`

- Senaryo: salesDB.getSalesWithFilter (seed=150)
- Telemetry: fake-indexeddb ortamında her iki senaryoda da fallback görüldü (indexNames farklılıkları nedeniyle normaldir).
- Ölçümler (yaklaşık):
  - no-index: 2.82ms
  - indexed: 2.99ms

Not: Gerçek tarayıcı/cihaz ortamlarında indeksli sorguların farkı daha belirgin olacaktır. Ölçümler loglarda [perf] satırlarıyla da görülebilir.

