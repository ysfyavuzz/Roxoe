# Diagnostics Rehberi (İndeks Optimizasyonu)

Bu rehber, Tanılama (Diagnostics) sekmesinin nasıl çalıştığını, önerilen indeksleri nasıl uyguladığını, role-based guard (admin modu), dry-run önizleme ve telemetri (IndexTelemetry) mekanizmalarını ayrıntılı olarak açıklar.

## Amaç
IndexedDB üzerinde sık kullanılan sorgulara uygun indeksler olmadığı durumda, sorgular tüm veriyi tarayarak (full scan) yavaş çalışabilir. Diagnostics sekmesi:
- Eksik indeks adaylarını raporlar (dry-run önizleme ile),
- Uygulama öncesinde kullanıcı onayı ister,
- Admin guard ile “indeks uygula” yetkisini sınırlar,
- İndeks oluşturma sonrası refresh ile güncel durumu gösterir,
- Telemetri ile indeks fallback (index yokken kullanılan JS filtreleme) durumlarını kaydeder.

## UI Akışı
1) Sekmeye girildiğinde “Eksik indeks adayları” listesi otomatik yüklenir.
2) Yenile (Refresh) ile liste yeniden hesaplanır.
3) Önerilen indeksleri uygula:
   - Admin guard (VITE_ADMIN_MODE=true) kontrol edilir.
   - Onay diyaloğu açılır; dry-run önizleme listesi kullanıcıya gösterilir.
   - Onaylandığında optimizasyon başlar; işlem bitince başarı/uyarı mesajı gösterilir.

## Admin Guard (RBAC)
- guard: VITE_ADMIN_MODE (boolean). Testlerde true; üretimde false veya kontrol edilen koşullara göre etkinleştirilir.
- “Önerilen indeksleri uygula” butonu admin değilse gri/etkisiz olur ve tıklamada uyarı verilir.

## Dry-Run Önizleme
- ReportMissingIndexCandidates() çıktısı kullanıcıya satır satır gösterilir:
  - Biçim: db.store.index (adet: count)
- Uygulama onayı alınmadan önce, hangi indekslerin ekleneceğine dair net görünürlük sağlar.

## Telemetri (IndexTelemetry)
- Amaç: Index yokken yapılan sorgularda fallback (JS filtreleme) kullanımlarını saymak ve gözlemlemek.
- Kullanım Yerleri: services katmanında sorgu yollarında, indeks yoksa IndexTelemetry.recordFallback({ db, store, index, operation, reason }) ile kayıt.
- Gözlem: Testlerde (fake-indexeddb) indexNames farkları nedeniyle her iki senaryoda da fallback görülebilir; gerçek tarayıcı/cihaz ortamında indeksli senaryoda fallback sıfıra yaklaşır.

## Teknik Detaylar
- Raporlama: reportMissingIndexCandidates()
- Uygulama: indexOptimizer.optimizeAllDatabases() → DB versiyon artırma ve index eklemeleri.
- UI bileşeni: client/src/components/settings/DiagnosticsTab.tsx
- Onay diyaloğu/alert: client/src/components/AlertProvider.tsx

## Testler
- Unit: client/src/components/settings/DiagnosticsTab.test.tsx
  - Listeleme, yenileme, onay akışı, admin guard uyarısı senaryoları.
- E2E: client/e2e/diagnostics.spec.ts
  - Yenile + Uygula + Onay akışı; admin mod (VITE_ADMIN_MODE=true) altında çalışır.

## Sorun Giderme
- Production’da guard devre dışı: VITE_ADMIN_MODE=false → Uygulama kapalı; sadece listeleme yapılır.
- Index çakışmaları: upgrade sırasında index zaten varsa createIndex atlanır; konsolda uyarı görülebilir.
- Büyük veri setleri: optimizeAllDatabases işlemi kısa bir süre alabilir; UI’da “yükleniyor” göstergesi esnasında sabırlı olun.

