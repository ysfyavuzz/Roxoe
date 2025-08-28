# Değişiklik Günlüğü (Changelog)

[← Teknik Kitap’a Dön](ROXOEPOS-TEKNIK-KITAP.md) · [Genel Kitap](BOOK/ROXOEPOS-KITAP.md)

Tarih: 2025-08-27
Sürüm: 0.5.3 (dokümantasyon ve test altyapısı güncellemeleri)

Ek: RoxoePOS Kitabı (Yatırımcı + Kullanıcı + Geliştirici)
- docs/BOOK/ROXOEPOS-KITAP.md eklendi.
- PDF üretimi için docs/BOOK/BUILD-PDF.ps1 sağlandı (Pandoc ile).

Öne çıkanlar
- Test altyapısı güçlendirildi: global kapsam eşiği (≥%80) ve kritik modüller için (≥%95) satır kapsamı zorunluluğu eklendi.
- Gelişmiş testler eklendi: IPC Contract (Ajv+JSON Schema), Visual Regression (Playwright snapshot), Synthetic Monitoring (nightly cron), Chaos/Resilience (backup hata yolları), Performance Benchmark (50k arama).
- Merkezi hata yönetimi uygulandı: ErrorBoundary + global error/promise yakalama; Sentry ile entegre çalışır.
- Yedekleme stratejisi tekilleştirildi: createSmartBackup artık daima OptimizedBackupManager kullanır; BackupManager deprecated.
- Onboarding ve KOMUT REHBERİ dokümanları güncellendi; E2E, entegrasyon ve performans testleri için komutlar eklendi.
- Diyagramlar genişletildi: Hata Yönetimi sequence diyagramı eklendi.

Ayrıntılar
- Test
  - client/vitest.config.ts: coverage.thresholds.global (branches/functions/lines/statements ≥%80), exclude kalıpları genişletildi.
  - client/scripts/check-coverage.js: coverage-summary.json üzerinden kritik dosyalar için ≥%95 satır kapsamı kontrolü.
  - client/package.json scriptleri: test:unit, test:integration, test:performance, test:e2e, test:critical eklendi.
  - Yeni birim testleri: utils (numberFormatUtils, turkishSearch), services (salesDB.applyDiscount, receiptService.printReceipt, productDB duplicate barcode), backup serialize/deserialize roundtrip.
  - Entegrasyon/bileşen/performans test iskeletleri eklendi (it.skip ile).
  - IPC Contract Testing: Ajv + JSON Schema (src/ipc-schemas/*, src/integration/ipc-contracts.test.ts)
  - Visual Regression: client/e2e/visual-regression.spec.ts (toHaveScreenshot)
  - Synthetic Monitoring: .github/workflows/synthetic-monitoring.yml + client/e2e/synthetic-smoke.spec.ts
  - Chaos/Resilience: src/backup/core/Resilience*.test.ts
  - Performance Benchmark: src/performance/search-benchmark.test.ts
- Hata Yönetimi
  - client/src/error-handler/: ErrorBoundary.tsx ve index.ts (reportError, setupGlobalErrorHandlers) eklendi.
  - client/src/main.tsx: <ErrorBoundary> ile sarmalama ve setupGlobalErrorHandlers entegrasyonu yapıldı.
  - Sentry: renderer’da preload üzerinden DSN varsa dinamik başlatma; ErrorBoundary componentDidCatch ile captureException.
- Yedekleme
  - client/src/backup/index.ts: createSmartBackup → OptimizedBackupManager’a yönlendirildi; BackupManager deprecated notu eklendi.
- Dokümantasyon
  - docs/ROXOEPOS-TEKNIK-KITAP.md: test komutları, kapsam politikası, error-handler ve yedekleme tekilleştirmesi işlendi.
- docs/OPERASYON-IZLEME.md: Sentry entegrasyonu etkin kullanım olarak güncellendi.
  - docs/ONBOARDING-10-DAKIKADA-ROXOEPOS.md: test:critical ve E2E adımları eklendi.
- docs/DIYAGRAMLAR.md: Hata Yönetimi sequence diyagramı eklendi.
- KOMUT-REHBERI.md: test komut listesi genişletildi; tamamı Türkçeleştirildi.
- README.md: Lisans rozeti ve lisans bölümü kaldırıldı; ekran görüntüleri placeholder .svg olarak eklendi.
- Yeni dokümanlar eklendi: docs/DURUM.md, docs/MODULLER.md, docs/API.md, docs/BILESENLER.md, docs/PERFORMANS.md, docs/TEST-KAPSAMI.md.
- Yerel otomasyon scriptleri eklendi: scripts/update-tech-book-metadata.js, update-status.js, update-api-docs.js, update-components.js, update-performance-docs.js, analyze-project.js.
  - Kök package.json’a komutlar eklendi: docs:update, status:update, analyze:project, docs:all.

Güvenlik
- Sırlar (GH_TOKEN, SENTRY_DSN) yalnız ortam değişkenleri ile kullanılmalı; terminalde görüntülenmemelidir.

Performans (2025-08-27)
- POS ekranında ürün liste (liste görünümü) ve sepet listeleri için react-window sanallaştırma eklendi.
- Eşikler: ürün listesi ≥100, sepet kompakt ≥50, sepet normal ≥40; küçük listelerde klasik render.

Refactor / Modülerleştirme (2025-08-27)
- POSPage sadeleştirildi:
  - Görünüm tercihleri özel hook’a taşındı: usePOSViewPreferences (localStorage kalıcılığı)
  - "Miktar Modu" toast’ı ayrı bileşene çıkarıldı: QuantityModeToast
  - Grup filtreleme tek yerde (ProductPanel) yapılarak çifte filtre kaldırıldı

Tamamlanan Modülerleştirmeler (2025-08-27)
- Ödeme akışı usePaymentFlow hook’una taşındı; POSPage bu hook’u kullanıyor.
- Kasa durumu yönetimi useRegisterStatus hook’u ile merkezileştirildi; POSPage bu hook’a geçirildi.
- PaymentModal bölündü:
  - ProductSplitSection.tsx (ürün bazlı bölme)
  - EqualSplitSection.tsx (eşit bölme)
- POSHeader bileşeni eklendi; POS üst kontrol şeridi modüler hale getirildi ve POSPage tepesine entegre edildi.
- Hızlı ödeme ve ödeme modali açma kontrolü kasa durumu (isRegisterOpen) üzerinden tutarlı şekilde çalışıyor.
- Dashboard veri mantığı özel hook’lara taşındı: useDashboardSalesData ve useCashDashboardData; DashboardPage sadeleştirildi.
- CashRegister veri mantığı özel hook’a taşındı: useCashRegisterPage; CashRegisterPage sadeleştirildi.
- Dashboard sekmeleri modülerleştirildi:
  - ProductsTab parçalandı: client/src/components/dashboard/products/{ProductsFilterPanelContent.tsx, ProductSummaryCards.tsx, ProductPerformanceTable.tsx, TopSellingChart.tsx, TopProfitableChart.tsx}
  - CashTab parçalandı: client/src/components/dashboard/cash/{CashSummaryCards.tsx, DailyIncreaseCard.tsx, CashFlowCard.tsx, SalesDistributionChart.tsx, CashMovementsChart.tsx, ClosedSessionsTable.tsx}
  - OverviewTab parçalandı: client/src/components/dashboard/overview/{OverviewSummaryCards.tsx, SalesTrendChart.tsx, CategoryDistributionPie.tsx, LastClosedSessionCard.tsx, TopProductsTable.tsx}; OverviewTab.tsx bu bileşenleri kullanacak şekilde refaktör edildi

Gelecek
- CI pipeline’a test:critical adımının zorunlu gate olarak eklenmesi.

Performans (Grid Sanallaştırma) (2025-08-27)
- ProductPanel kart görünümü için FixedSizeGrid tabanlı sanallaştırma eklendi. Büyük ürün listelerinde ilk render ve scroll performansı iyileşti.

CashRegister Güncellemeleri (2025-08-27)
- CashRegisterPage tepesine useRegisterStatus tabanlı basit bir toolbar eklendi (Aç/Kapat/Yenile + durum etiketi).
- Mevcut sayfa yükleyicisi loadCashRegister fonksiyonuna çıkarıldı ve toolbar ile birlikte kullanılabilir hale getirildi.

Settings Güncellemeleri (2025-08-27)
- SettingsPage durum ve eylemleri özel hook'a taşındı: useSettingsPage (client/src/pages/settings/hooks/useSettingsPage.ts)
- SettingsPage artık mevcut tab bileşenlerini (AboutTab, BackupSettingsTab, BarcodeSettingsTab, POSSettingsTab, ReceiptSettingsTab, SerialSettingsTab, HotkeySettings) lazy load ederek props ile render ediyor
- Yeni birim testi: useSettingsPage.test.tsx (client/src/test/hooks/useSettingsPage.test.tsx)
- BILESEN-BOLME-PLANI.md ve ROXOEPOS-TEKNIK-KITAP.md ilgili bölümler bu değişikliklere göre güncellendi

Ek Dokümantasyon Güncellemeleri (2025-08-27)
- IMPROVEMENT-SUMMARY-REPORT.md arşive taşındı: docs/archive/IMPROVEMENT-SUMMARY-REPORT.en.md (tek kaynak: TEMIZLIK-RAPORU.md)
- BILESEN-BOLME-PLANI.md içindeki son İngilizce cümle Türkçeleştirildi
- README.md içine “RoxoePOS Kitabı (Genel)” bağlantısı eklendi
- docs/ROXOEPOS-TEKNIK-KITAP.md içine “Dokümantasyon Ana İndeksi (Hızlı Bağlantılar)” bölümü eklendi

