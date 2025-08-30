# Performans Testleri Rehberi

Bu rehber, fake-indexeddb ile çalışan satış veritabanı (salesDB) performans testinin nasıl koşulacağını ve sonuçların nasıl yorumlanacağını açıklar.

## Çalıştırma
- Komut: `npm --prefix client run test:performance`
- Konfig: client/vitest.performance.config.ts (yalnız perf testi dahil)

## Senaryo (Örnek)
- Test: src/performance/salesDB.performance.test.ts
- Seed: 150 kayıt (no-index ve indexed iki ayrı senaryo)
- Ölçüm: salesDB.getSalesWithFilter() zamanı ve IndexTelemetry fallback istatistikleri

## Telemetri ve Ortam Notu
- fake-indexeddb ortamında indexNames davranışı gerçek tarayıcıdan farklı olabilir.
- Bu nedenle ‘indexed’ senaryoda da fallback görülebilir. Bu normaldir.
- Gerçek tarayıcı/cihaz ortamında indeksli sorgular fallback’siz çalışarak daha belirgin hız avantajı sağlar.

## Çıktı Örneği
- [perf] salesDB.getSalesWithFilter -> no-index: 2.82ms, indexed: 2.99ms
- [perf] telemetry: noIndexFallbacks=true indexedFallbacks=true

## Kapsam ve Sınırlar
- Bu test bütünsel bir mikro-benchmark değildir; trend takibi içindir.
- Seed ve filtre koşulları değiştirilebilir; süre bütçesini buna göre ayarlayın.

## CI Önerileri
- Varsayılan olarak perf testlerini hafif seed ile koşun; yalnız nightly/manuel tetiklemelerde ağır seed deneyin.
- Perf sonuçlarından yalnız “başarılı koştu mu” bilgisini gate olarak kullanın; zaman doğruluğunu manuel rapora taşıyın.

