# Değişiklik Günlüğü (Changelog)

[← Teknik Kitap’a Dön](roxoepos-technical-book.md) · [Genel Kitap](BOOK/roxoepos-book.md)

Tarih: 2025-08-31
Sürüm: 0.5.3 (dokümantasyon ve test stabilizasyonu)

Ek: RoxoePOS Kitabı (Yatırımcı + Kullanıcı + Geliştirici)
- docs/BOOK/roxoepos-book.md eklendi.
- PDF üretimi için docs/BOOK/BUILD-PDF.ps1 sağlandı (Pandoc ile).

Öne çıkanlar
- Kasa: Kasa açma hatasında kullanıcıya ayrıntılı mesaj gösterimi sağlandı. Mevcut açık oturum tespit edilirse isteğe bağlı “kurtarma modunda kapatıp yeniden aç” akışı eklendi.
- Test stabilizasyonu: addProductToGroup duplicate ilişkide idb AbortError → Unhandled Rejection sorunu giderildi (tx.abort + tx.done swallow).
- test:critical kapısı: Windows PowerShell için MIN_CRITICAL_COVERAGE örnekleri belgelendi.
- Runbook (db-inconsistency): repairDatabase/db_force_reset detayları eklendi.
- Doküman güncellemesi: test-coverage.md, command-guide.md, runbooks/db-inconsistency.md.

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
  - docs/roxoepos-technical-book.md: test komutları, kapsam politikası, error-handler ve yedekleme tekilleştirmesi işlendi.
- docs/operations-monitoring.md: Sentry entegrasyonu etkin kullanım olarak güncellendi.
  - docs/onboarding-10-minutes-roxoepos.md: test:critical ve E2E adımları eklendi.
- docs/diagrams.md: Hata Yönetimi sequence diyagramı eklendi.
- command-guide.md: test komut listesi genişletildi; tamamı Türkçeleştirildi.
- README.md: Lisans rozeti ve lisans bölümü kaldırıldı; ekran görüntüleri placeholder .svg olarak eklendi.
- Yeni dokümanlar eklendi: docs/status.md, docs/modules.md, docs/api.md, docs/components.md, docs/performance-overview.md, docs/test-coverage.md.
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
- component-splitting-plan.md ve roxoepos-technical-book.md ilgili bölümler bu değişikliklere göre güncellendi

Ek Dokümantasyon Güncellemeleri (2025-08-27)
- improvement-summary-report.md arşive taşındı: docs/archive/improvement-summary-report.en.md (tek kaynak: cleanup-report.md)
- component-splitting-plan.md içindeki son İngilizce cümle Türkçeleştirildi
- README.md içine “RoxoePOS Kitabı (Genel)” bağlantısı eklendi
- docs/roxoepos-technical-book.md içine “Dokümantasyon Ana İndeksi (Hızlı Bağlantılar)” bölümü eklendi

---

Tarih: 2025-08-28
- Lisanslandırma: UNLICENSED (paket lisansı) uygulandı; LICENSE dosyası eklendi.
- README.md içine “Lisans” bölümü eklendi.
- package.json ve client/package.json dosyalarına "license": "UNLICENSED" alanı eklendi.
- Özellik bayrakları eklendi: `VITE_LICENSE_BYPASS`, `VITE_SERIAL_FEATURE` (docs/feature-flags.md)
- App.tsx: dev/test’te lisans kontrolü BYPASS edildi; Settings: Serial sekmesi feature flag ile koşullu.
- README.md: “Özellik Bayrakları” bölümü eklendi.
- PR şablonu eklendi: .github/pull_request_template.md
- PR kalite kontrol iş akışı eklendi: .github/workflows/pr-quality.yml (zorunlu başlık kontrolü)
- BILESENLER_TOPLU_1/5: BYPASS ve serial flag notları işlendi.
- BILESENLER_TOPLU_13: Dokümantasyon/PR/Kitap/Media/Feature Flags referansları oluşturuldu.

---

Tarih: 2025-08-30
Sürüm: 0.5.3 (E2E ve Diagnostics iyileştirmeleri)

Öne çıkanlar
- Diagnostics Tab: indeks önerileri için “Yenile” ve “Uygula” akışları onay diyaloğu ile güvence altına alındı; “dry-run” önizleme listesi eklendi.
- RBAC/Guard: İndeks uygulama işlemi admin mod ile sınırlandı (VITE_ADMIN_MODE).
- Telemetri: IndexedDB indeks fallback (index yokken) durumları kayıt altına alınıyor.
- E2E: Playwright yapılandırması Vite preview ile güncellendi; test modu ortam bayrakları eklendi; yeni POS senaryoları ile kapsam genişletildi.

Ayrıntılar
- Playwright
  - client/playwright.config.ts: webServer=`npm run preview`, baseURL=http://localhost:4173; env: NODE_ENV=test, VITE_LICENSE_BYPASS=true, VITE_ADMIN_MODE=true, VITE_E2E_MODE=true.
  - Yeni/iyileştirilen E2E testleri: 
    - e2e/pos-sale-flow.spec.ts: placeholder tabanlı seçiciler; arama öncesi "Tümü" grubu aktivasyonu.
    - e2e/pos-cart-clear.spec.ts: ürünü iki kez sepete ekle, sepeti temizle ve onayla akışı.
    - e2e/diagnostics.spec.ts ve e2e/backup-flow.spec.ts stabilize edildi.
    - e2e/visual-regression.spec.ts varsayılan olarak skip.
- Dokümantasyon
  - README.md ve client/README.md: Testler/E2E bölümleri eklendi.
  - WARP.md ve command-guide.md: Playwright ve E2E çalıştırma örnekleri genişletildi.
  - Yeni: docs/testing/playwright-e2e.md
- Performans Testi
  - fake-indexeddb ile örnek kıyas testleri mevcut; süre nedeniyle CI’da skip.
  - Komut: `npm run test:performance --prefix client`

