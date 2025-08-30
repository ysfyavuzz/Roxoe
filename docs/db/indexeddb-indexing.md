# IndexedDB İndeksleme Rehberi

Bu belge, IndexedDB üzerinde indeks tasarımı, eksik indekslerin tespiti, fallback davranışları ve sürüm yükseltmelerinin nasıl yönetileceğini açıklar.

## Neden İndeks?
- Sorguları belirli alanlar üzerinde hızlıca filtrelemek ve sıralamak için gereklidir.
- İndeks yoksa, getAll() + JS filtre yoluna düşülür; bu fallback yavaştır ve büyük veri setlerinde sorun yaratır.

## Uygulamadaki Mağazalar ve İndeksler (Özet)
- posDB
  - products (keyPath: id)
    - index: barcode (önerilen; benzersizlik uygulama düzeyinde kontrol edilir)
  - productGroups (keyPath: id)
    - index: order
  - productGroupRelations (keyPath: [groupId, productId])
    - index: groupId, productId
- salesDB
  - sales (keyPath: id)
    - index: status, paymentMethod, date (önerilen)

## Fallback Telemetri (IndexTelemetry)
- Amaç: İndeks eksikliği nedeniyle JS filtreleme çalıştığında kayıt tutmak.
- Örnek kayıt: IndexTelemetry.recordFallback({ db: 'salesDB', store: 'sales', index: 'status', operation: 'query', reason: 'index missing' })
- Raporlama: Geliştirme ve testlerde konsol/raporlar üzerinden izlenebilir.

## Eksik İndekslerin Tespiti
- reportMissingIndexCandidates(): Sorgu kalıpları ve kullanım sıklığına göre indeks adayları sunar.
- UI: Diagnostics sekmesi dry-run listesi ile ayrıntılı görünüm sağlar.

## Sürüm ve Migration Stratejisi
- onupgradeneeded/upgrade callback’inde indeksler yoksa oluşturulur (idempotent yaklaşım).
- Mevcut store üzerinde createIndex denemeleri indexNames kontrolü ile koşullu yapılır.
- Büyük değişikliklerde “kopyala-yarat” deseni: yeni store → veriyi dönüştür → eskiyi kaldır → yeniyi kalıcı isimle oluştur.

## Test Ortamı Notları (fake-indexeddb)
- indexNames davranışı gerçek tarayıcıya göre farklı olabilir; telemetry’de ‘indexed’ senaryoda dahi fallback görülebilir.
- Performans testleri ölçümleri bağlamsaldır; karşılaştırmalı trend takibi için logları kıyaslayın.

