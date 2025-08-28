# RoxoePOS Teknik Doküman (Geliştirici Kitabı)

Son Güncelleme: 2025-08-27
Sürüm Bağlamı: 0.5.3 (client/package.json)

İçindekiler
- 1. Proje Genel Bakış
- 2. Geliştirme Komutları ve Çalışma Ortamı
- 3. Yüksek Seviye Mimari
- 4. Uygulama Modülleri (Sayfalar ve Akışlar)
- 5. Elektron (Main ve Preload) & IPC Köprüleri
- 6. Veri Katmanı: IndexedDB, Servisler ve Yedekleme Altyapısı
- 7. Bileşenler ve UI Yapısı
- 8. Performans ve İleri Seviye Özellikler
- 9. Test Altyapısı ve Kapsam
- 10. Derleme, Paketleme ve Yayınlama
- 11. Kod Kalitesi, Lint ve Format Standartları
- 12. Tailwind ve Stil Rehberi
- 13. Yol Alias ve Proje Yolu Konvansiyonları
- 14. Dosya Rehberi (Önemli Dosyalar ve Amaçları)
- 15. Bilinen Sorunlar, Eksikler ve İyileştirme Önerileri
- 16. Yol Haritası (Önerilen Sırayla Uygulanacaklar)

---

Dokümantasyon Ana İndeksi (Hızlı Bağlantılar)
- Proje Karşılama ve Kullanım Rehberi: ../README.md
- Terminal/Komut Rehberi: ../KOMUT-REHBERI.md
- Proje Durumu: DURUM.md
- Modül Durumları: MODULLER.md
- API Referansı: API.md
- Bileşen Envanteri: BILESENLER.md (ve ayrıntılar için BILESENLER_TOPLU_1..12)
- Performans Rehberi: PERFORMANS.md (ayrıca performance/PERFORMANS-KONTROL-LISTESI.md, performance/OLCUM-REHBERI.md, performance/PERFORMANS-PLAYBOOK.md)
- Test Kapsam Politikası: TEST-KAPSAMI.md
- Diyagramlar: DIYAGRAMLAR.md
- Operasyon & Monitoring: OPERASYON-IZLEME.md
- Runbook’lar: runbooks/CALISMA-KILAVUZLARI.md
- Genel Kitap (Yatırımcı + Kullanıcı + Geliştirici): BOOK/ROXOEPOS-KITAP.md
- İyileştirme/Temizlik Raporu: ../TEMIZLIK-RAPORU.md

---

1. Proje Genel Bakış
RoxoePOS; React + TypeScript + Vite + Electron temelli, masaüstü odaklı bir POS (Point of Sale) uygulamasıdır. Yerel veri kalıcılığı için IndexedDB kullanır; yedekleme/geri yükleme, performans izleme, AI destekli indeks optimizasyonu ve akıllı arşivleme gibi gelişmiş özelliklere sahiptir. Uygulama Windows/macOS/Linux üzerinde çalışacak şekilde electron-builder ile paketlenir.

Önemli dizinler:
- client/: Tüm uygulama kodu (React + Electron + Build toolchain)
- client/src/: React kodu, sayfalar, bileşenler, servisler, tipler, yedekleme altyapısı
- client/electron/: Electron main ve preload süreçleri, lisans yöneticisi
- docs içeriği: Bu belge ve diğer raporlar (kökte mevcut raporlar: TEMIZLIK-RAPORU.md (İyileştirme Özeti entegre), BILESEN-BOLME-PLANI.md)

---

2. Geliştirme Komutları ve Çalışma Ortamı
Komutlar client/ klasöründe çalıştırılmalıdır. Özet:
- Geliştirme: npm run dev
- Build: npm run build (tsc + vite build + electron-builder)
- Platforma özel build: npm run build:win, npm run build:mac, npm run build:all
- Yayın: npm run publish (GH_TOKEN gerekir), publish:win, publish:mac
- Lint: npm run lint | Otomatik düzelt: npm run lint:fix
- Format: npm run format | Kontrol: npm run format:check
- Tip kontrol: npm run type-check
- Test (genel): npm run test | test:run | test:watch | test:ui | test:coverage
- Test (ayrıntılı):
  - Birim: npm run test:unit
  - Entegrasyon: npm run test:integration
  - Performans: npm run test:performance
  - E2E: npm run test:e2e (Playwright)
  - Kritik kapsam: npm run test:critical  (global ≥%80, kritik dosyalar ≥%95)
    - Eşik özelleştirme: MIN_CRITICAL_COVERAGE=97 npm run test:critical
- Tek test dosyası: npm run test -- src/test/Button.test.tsx
- İsim filtresi: npm run test -- -t "başlık parçası"

Notlar:
- KOMUT-REHBERI.md kökte ek rehber içerir (komutlar ve mimari özet).
- KOMUT-REHBERI.md ve kökteki Markdown dosyaları için Prettier’i doğrudan npx prettier -w KOMUT-REHBERI.md gibi çalıştırın.

---

3. Yüksek Seviye Mimari
Katmanlar:
- Electron Main (client/electron/main.ts): Uygulamanın yaşam döngüsü, güncelleme (electron-updater), yedekleme köprüleri (IPC), pencere yönetimi, kapanışta yedekleme koordinasyonu.
- Preload (client/electron/preload.ts): Güvenli şekilde window.* API’lerini expose eder (appInfo, ipcRenderer proxy, updaterAPI, backupAPI, serialAPI, indexedDBAPI).
- Renderer (client/src): React 18 + TS ile sayfalar, bileşenler, servisler, yedekleme altyapısı, tipler ve yardımcılar.
- Persistans: IndexedDB (idb) + electron-store (ayarlar/lisans), şifreleme (crypto-js + machine-id).
- Build/Tooling: Vite + vite-plugin-electron, ESLint + TS strict, Prettier, Tailwind.

Akışlar (özet):
- UI olayları → React komponentleri/hooks → Servisler (db, export/import) → IndexedDB ve dosya sistemi (Preload üzerinden IPC gerekiyorsa) → Geri bildirimler (NotificationContext, UI state) → Gerekirse Main süreçte yedekleme/güncelleme olayları.

---

4. Uygulama Modülleri (Sayfalar ve Akışlar)
- POSPage.tsx: Satış akışı, sepet yönetimi, ödeme işlemleri; bileşenleri pos/ altından kullanır.
- ProductsPage.tsx: Ürün listeleme/arama/filtreleme, toplu işlemler (Excel import/export, barkod üretimi).
- SalesHistoryPage.tsx & SaleDetailPage.tsx: Geçmiş satışlar, detay görüntüleme ve filtreler.
- CashRegisterPage.tsx: Kasa aç/kapat, işlem geçmişi, durum ve sayfa içi kontroller.
- SettingsPage.tsx: POS, Barkod, Fiş/İşletme, Yedekleme, Serial, About sekmeleri. Not: SettingsPage artık useSettingsPage hook’u ile yönetiliyor; sekmeler lazy load ve props ile beslenecek şekilde bağlandı (BILESEN-BOLME-PLANI.md güncellendi).
- DashboardPage.tsx: Özet metrikler, satış grafikleri, stok uyarıları, performans göstergeleri.

Akış örneği (Satış):
- Kullanıcı ürün ekler → useCart/useProducts hook’ları veri sağlar → Ödeme başlatılır → receiptService/salesDB işlemleri → Fiş yazdırma ve kayıt.

---

5. Elektron (Main ve Preload) & IPC Köprüleri
Main (client/electron/main.ts):
- Güncelleme olayları: checking-for-update, update-available, download-progress, update-downloaded, error
- IPC Handlers:
  - get-app-version (invoke): Uygulama sürümü
  - quit-and-install: Güncellemeyi uygula
  - check-for-updates: Manuel kontrol
  - create-backup-bridge, restore-backup-bridge: Optimize yedekleme/geri yükleme köprüsü
  - create-backup, restore-backup: Eski API (uyumluluk)
  - get-backup-history: Yedek listesi
  - read-backup-file: Dosyadan yedek oku (dosya seçimi için FileUtils ile)
  - schedule-backup, disable-scheduled-backup, test-auto-backup: Zamanlama API’leri
  - select-directory, set-backup-directory, get-backup-directory: Dizin yönetimi
- Kapanış senaryosu: app-close-requested ve confirm-app-close ile yedekleme güvenli kapanış koordinasyonu.

Preload (client/electron/preload.ts):
- appInfo.getVersion()
- ipcRenderer proxy (on/off/send/invoke)
- updaterAPI: checkForUpdates, onUpdateAvailable/Downloaded/Error/Message/Progress/Status, test* (dev)
- backupAPI: createBackup, restoreBackup, save/read file, getBackupHistory, schedule/disable, testAutoBackup, on/off backup-progress, set/getBackupDirectory
- serialAPI: Web Serial API erişim köprüsü (requestPort, getPorts)
- indexedDBAPI: db-export-request/db-import-request köprüsü (renderer tarafında gerçek erişim)

Lisans (client/electron/license.ts):
- VALID_SERIALS listesi ve electron-store üzerinde aktivasyon/validasyon; machineId bağlama.

---

6. Veri Katmanı: IndexedDB, Servisler ve Yedekleme Altyapısı
IndexedDB ve Servisler (client/src/services):
- dbService.ts: Genel veritabanı erişim yardımcıları
- productDB.ts, salesDB.ts, cashRegisterDB.ts: Domain odaklı CRUD/işlemler
- encryptionService.ts: crypto-js + node-machine-id ile veri/ayar güvenliği
- importExportServices.ts, exportSevices.ts, creditServices.ts, receiptService.ts, posServices.ts, IndexOptimizer.ts, PerformanceMonitor.ts, UnifiedDBInitializer.ts

Yedekleme Altyapısı (client/src/backup):
- core: BackupManager, OptimizedBackupManager, BackupSerializer/Deserializer, StreamingBackupSerializer
- database: IndexedDBExporter/Importer (streaming sürümleri dahil)
- scheduler: BackupScheduler
- utils: checksumUtils, compressionUtils, fileUtils
- index.ts: backupManager, optimizedBackupManager, createSmartBackup, FileUtils gibi dışarı açılan nesneler/fonksiyonlar

Not (Güncel Durum):
- Yedekleme stratejisi tekilleştirildi. createSmartBackup artık daima OptimizedBackupManager kullanır. BackupManager uyumluluk için export edilmeye devam eder ancak deprecated olarak işaretlenmiştir.

---

7. Bileşenler ve UI Yapısı
- src/components/ui/: Button, Card, Dialog, Input, Select, Switch, Table, Tabs vb. temel UI bileşenleri
- src/components/modals/: Customer/Product/Payment/Transaction gibi modal bileşenleri
- src/components/dashboard/: CashTab, OverviewTab, ProductsTab, SalesTab
  - dashboard/products/: ProductsFilterPanelContent.tsx, ProductSummaryCards.tsx, ProductPerformanceTable.tsx, TopSellingChart.tsx, TopProfitableChart.tsx
  - dashboard/cash/: CashSummaryCards.tsx, DailyIncreaseCard.tsx, CashFlowCard.tsx, SalesDistributionChart.tsx, CashMovementsChart.tsx, ClosedSessionsTable.tsx
  - dashboard/overview/: OverviewSummaryCards.tsx, SalesTrendChart.tsx, CategoryDistributionPie.tsx, LastClosedSessionCard.tsx, TopProductsTable.tsx
  - Not: OverviewTab.tsx bu alt bileşenleri kullanacak şekilde refaktör edilmiştir
- src/components/pos/ ve src/components/cashregister/: POS ve Kasa ekranlarının parça bileşenleri
  - Not: QuantityModeToast (POS “miktar modu” toast’ı) ayrı bir bileşen olarak ayrıştırıldı.
- src/components/settings/: SettingsPage sekme bileşenleri (AboutTab, BackupSettingsTab, BarcodeSettingsTab, POSSettingsTab, ReceiptSettingsTab, SerialSettingsTab)
- SettingsPage state/aksiyonları: useSettingsPage (src/pages/settings/hooks/useSettingsPage.ts); sekmeler lazy load ile render edilir
- src/components/AdvancedFeaturesTab.tsx, PerformanceDashboard.tsx gibi ileri özellik ekranları

Hook’lar ve Bağlamlar:
- src/hooks/: useCart, useProducts, useSales, useBarcode, useHotkeys, useProductGroups, useCustomers, useCashRegisterData vs.
- src/hooks/usePOSViewPreferences: POS görünüm tercihleri (kompakt sepet/ürün listesi) için localStorage kalıcılığı olan özel hook.
- src/hooks/usePaymentFlow: Ödeme tamamlandıktan sonraki işlemleri merkezileştirir; POSPage tarafından kullanılır.
- src/hooks/useRegisterStatus: Kasa açık/kapalı durumu ve oturum işlemleri; POSPage dahil farklı sayfalarda tekrar kullanılabilir.
- src/pages/dashboard/hooks/: useDashboardSalesData (satış istatistikleri), useCashDashboardData (kasa özetleri ve kapanan oturumlar)
- src/pages/cashregister/hooks/: useCashRegisterPage (CashRegisterPage durum+aksiyonları)
- src/pages/settings/hooks/: useSettingsPage (SettingsPage durum+aksiyonları)
  
CashRegisterPage ve useRegisterStatus (Kullanım Örneği)

- CashRegisterPage tepesinde basit bir toolbar, useRegisterStatus ile kasa durumunu gösterir ve Yenile/Aç/Kapat butonları sunar. Aç/Kapat butonları sayfanın mevcut handler’larını (handleOpenRegister/handleCloseDay) çağırır; Yenile hem hook.refresh hem de sayfa içi loadCashRegister fonksiyonunu tetikler.
  ```ts path=null start=null
  import { useRegisterStatus } from "../hooks/useRegisterStatus";
  
  export function CashRegisterToolbar() {
    const { isOpen, loading, open, close, refresh } = useRegisterStatus({
      onError: () => alert("Kasa durumu okunurken hata oluştu"),
    });
  
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm">Kasa: {loading ? "Yükleniyor..." : isOpen ? "Açık" : "Kapalı"}</span>
        <button disabled={loading || isOpen} onClick={() => open(0)}>Kasayı Aç</button>
        <button disabled={loading || !isOpen} onClick={() => close()}>Kasayı Kapat</button>
        <button disabled={loading} onClick={() => refresh()}>Yenile</button>
      </div>
    );
  }
  ```
- src/contexts/NotificationContext.tsx: Uygulama içi bildirim/uyarı akışı

---

8. Performans ve İleri Seviye Özellikler
- AI destekli indeks optimizasyonu: src/services/AIIndexAnalyzer.ts ve src/services/IndexOptimizer.ts
- Akıllı arşivleme: src/services/SmartArchiveManager.ts ve backup altyapısı ile entegre
- Performans izleme: src/services/PerformanceMonitor.ts ve UI’da PerformanceDashboard
- Mobil performans optimizasyonu: src/utils/MobilePerformanceOptimizer.ts
- Cloud senkronizasyon: src/services/CloudSyncManager.ts (uygulama içinde yetenekler planlanmış)

8.1 POS List Sanallaştırma (react-window)
- Bağımlılıklar: client/package.json → dependencies: react-window; devDependencies: @types/react-window
- Kapsam:
  - client/src/components/pos/ProductPanel.tsx → ProductListView (liste görünümü) FixedSizeList ile sanallaştırıldı
  - client/src/components/pos/CartPanel.tsx → CompactCartView ve NormalCartView FixedSizeList ile sanallaştırıldı
- Eşikler ve satır yükseklikleri:
  - ProductListView: THRESHOLD=100, ITEM_SIZE=64
  - CompactCartView: THRESHOLD=50, ITEM_SIZE=44
  - NormalCartView: THRESHOLD=40, ITEM_SIZE=56
- Davranış:
  - Eşik altı klasik render (fallback); eşik üzeri react-window ile sanallaştırma devreye girer
  - Satır yüksekliği sabit olmalıdır; CSS paddings ve ikon boyutları ITEM_SIZE ile uyumlu tutulmalıdır (dinamik yükseklik desteklenmez)
- Ayar/Tuning:
  - Eşik ve ITEM_SIZE değerleri ilgili bileşenlerde sabit değişkenlerdir; performans ihtiyaçlarınıza göre düzenleyebilirsiniz
  - Küçük listelerde sanallaştırmayı devre dışı bırakmak için THRESHOLD değerini yükseltebilir veya geliştirme sırasında geçici olarak Infinity yapabilirsiniz
- Grid görünümü:
  - ProductGridView: Büyük listelerde FixedSizeGrid ile sanallaştırma aktif; küçük listelerde klasik render devam eder.
- Test:
  - Büyük veri listelerinde scroll ve görünür satırların doğru render edildiğini doğrulayan smoke testleri eklenebilir (RTL ile container scroll + görünür satır metin kontrolü)

---

9. Test Altyapısı ve Kapsam
- Test çatısı: Vitest (jsdom) + React Testing Library, E2E için Playwright
- Gelişmiş Test Stratejileri:
  - Contract Testing (IPC): Ajv ile JSON Schema doğrulaması (src/ipc-schemas/*, src/integration/ipc-contracts.test.ts)
  - Visual Regression: Playwright toHaveScreenshot ile piksel-düzeyi kontroller (client/e2e/visual-regression.spec.ts)
  - Synthetic Monitoring: GitHub Actions cron ile nightly smoke (client/e2e/synthetic-smoke.spec.ts, .github/workflows/synthetic-monitoring.yml)
  - Chaos/Resilience: Yedekleme sırasında hata/istisna simülasyonları (src/backup/core/Resilience*.test.ts)
  - Performance Benchmark: Büyük veri üzerinde arama/hesap testleri (src/performance/search-benchmark.test.ts)
- Konfig: client/vitest.config.ts
  - globals, environment: jsdom, setupFiles: src/test/setup.ts, css: true
  - coverage: provider v8, reporter: text/json/html, reportsDirectory: coverage
  - thresholds.global: branches/functions/lines/statements ≥ %80
  - exclude: node_modules, src/test, **/*.d.ts, **/*.config.*, **/*.test.*, **/*.spec.*, dist*, release*
- Setup dosyası: src/test/setup.ts (ResizeObserver, Electron IPC, localStorage, indexedDB mock’ları ve konsol gürültüsü filtreleme)
- Kritik kapsama denetimi: client/scripts/check-coverage.js
  - npm run test:critical, global kapsamı aldıktan sonra kritik modüller için satır kapsamını ≥%95 zorunlu kılar
  - Varsayılan eşik: %95, değiştirilebilir: MIN_CRITICAL_COVERAGE=97 npm run test:critical

Eklenen Birim Testleri (örnekler):
- src/test/hooks/useSettingsPage.test.tsx (SettingsPage state ve işlemlerinin testi)
- src/utils/numberFormatUtils.test.ts (parseTurkishNumber)
- src/utils/turkishSearch.test.ts (cleanTextForSearch, normalizedSearch)
- src/services/salesDB.test.ts (applyDiscount)
- src/services/receiptService.test.ts (printReceipt başarı/başarısız)
- src/backup/core/BackupManager.test.ts (serialize/deserialize roundtrip)
- src/services/productDB.test.ts (barkod tekilliği; UnifiedDBInitializer mock)

Entegrasyon Testleri (iskelet, it.skip):
- src/integration/pos-flow.test.ts (sepet → ödeme → fiş → stok)
- src/integration/backup-restore.test.ts (yedekleme → geri yükleme)
- src/integration/product-crud.test.ts (CRUD + kategori çakışması)
- src/integration/ipc-channels.test.ts (IPC whitelist/payload)

Bileşen Testleri (iskelet):
- src/components/pos/CartPanel.test.tsx
- src/components/modals/PaymentModal.test.tsx
- src/pages/POSPage.test.tsx

Performans Testleri (iskelet):
- src/performance/bundle-size.test.ts
- src/performance/render-time.test.ts
- src/performance/memory-usage.test.ts

Komutlar:
- Birim: npm run test:unit
- Entegrasyon: npm run test:integration
- E2E: npm run test:e2e
- Performans: npm run test:performance
- Kapsam: npm run test:coverage
- Kritik kapsam: npm run test:critical

---

10. Derleme, Paketleme ve Yayınlama
- Vite (client/vite.config.ts) + vite-plugin-electron/simple ile main (electron/main.ts) ve preload (electron/preload.ts) girişleri
- electron-builder ayarları client/package.json içinde (appId, productName, publish→github, NSIS/dmg/portable hedefleri, asarUnpack: better-sqlite3)
- Yayın için GH_TOKEN gerekir (private release yapılandırması). macOS hedefleri macOS ortamında paketlenir.

---

11. Kod Kalitesi, Lint ve Format Standartları
- ESLint (client/eslint.config.js): TS + React + Hooks + Refresh kuralları; project-aware parsing (tsconfig), no-duplicate-imports, no-console (warn), eqeqeq, curly, TS için no-explicit-any (warn), explicit-function-return-type (warn) vb.
- Prettier (client/.prettierrc): semi: true, singleQuote: true, printWidth: 80, trailingComma: es5 vb.
- TSConfig (client/tsconfig.json): strict tüm bayraklar aktif; noUncheckedIndexedAccess, exactOptionalPropertyTypes vb. gelişmiş güvenlikler etkin.

---

12. Tailwind ve Stil Rehberi
- Tailwind konfig (client/tailwind.config.js): darkMode: class, animate eklentisi, tema genişletmeleri (primary/secondary tonlar, chart renkleri, gölgeler, borderRadius), content yolları src/**/*
- Stil kullanımında projenin kurallarına göre sınıf sıralaması (Layout → Spacing → Typography → Colors → Effects) tercih edilir.

---

13. Yol Alias ve Proje Yolu Konvansiyonları
- Vite alias: '@' → './src' (client/vite.config.ts)
- Tip kökleri: tsconfig typeRoots içinde './src/types' ve node_modules/@types
- Filepath önerisi: utils/hook/component ayrımı için klasör düzeni zaten oturmuş durumda.

---

14. Dosya Rehberi (Önemli Dosyalar ve Amaçları)
Kök:
- README.md: Ürün özellikleri, kurulum, kullanım, mimari, sorun giderme
- KOMUT-REHBERI.md: Komut rehberi (tamamen Türkçe)
- TEMIZLIK-RAPORU.md: Temizlik ve iyileştirme raporu
- BILESEN-BOLME-PLANI.md: Büyük bileşenleri bölme planı
- DURUM.md: Genel proje durumu, metrikler ve son değişiklikler
- MODULLER.md: Modül bazlı durum ve tamamlanma yüzdeleri
- API.md: IPC ve servis özet referansı
- BILESENLER.md: Bileşen envanteri ve notlar
- PERFORMANS.md: Performans bütçeleri ve ölçüm rehberi
- TEST-KAPSAMI.md: Test kapsam politikası ve komutlar
- schemas/README.md: IPC ve Servis JSON Şemaları
- runbooks/CALISMA-KILAVUZLARI.md: Operasyonel runbook’lar
- performance/PERFORMANS-PLAYBOOK.md: Performans ölçüm playbook’u
- hardware/TEST-KONTROL-LISTESI.md ve hardware/ESC-POS-EKI.md: Donanım testleri ve ESC/POS eki
- adr/README.md: Mimari karar kayıtları (ADR)
- samples/ORNEKLER.md: Örnek veriler ve şablonlar
- components/PROPS.md: Kritik bileşen prop tabloları
- DOSYA-BAZLI-REFERANS.md: Ayrıntılı dosya bazlı inceleme (her dosya için amaç/sorumluluk/bağımlılıklar)

14.1 Dosya Metrikleri (Satır/Boyut) – Otomasyon
- Amaç: Depodaki tüm metin dosyaları için satır ve boyut metriklerini otomatik üretmek.
- Windows PowerShell betiği: docs/scripts/GENERATE-FILE-METRICS.ps1
  - Örnek kullanım: pwsh -File docs/scripts/GENERATE-FILE-METRICS.ps1 -OpenReport
  - Üretir: docs/file-metrics.json ve docs/file-metrics-summary.md (toplamlar ve en büyük/uzun dosyalar)
  - Büyük projelerde birkaç dakika sürebilir.

client/ (seçme dosyalar):
- package.json: Komutlar, bağımlılıklar, electron-builder konfigürasyonu
- vite.config.ts: Vite ve electron girişleri, alias
- vitest.config.ts: Test konfigürasyonu
- eslint.config.js: ESLint kuralları
- .prettierrc: Prettier ayarları
- electron/
  - main.ts: Uygulama ana süreç; güncelleme ve yedekleme IPC’leri
  - preload.ts: window API’leri ve IPC proxy’leri
  - license.ts: Serial numara yönetimi
- src/
  - main.tsx, App.tsx: React giriş noktaları
  - pages/: Uygulama sayfaları (POS, Products, SalesHistory, CashRegister, Settings, Dashboard)
  - components/: UI, modals, dashboard, pos, cashregister, settings alt bileşenleri
  - services/: Veri erişimi, dışa aktarım/içe aktarım, şifreleme, izleme vb.
  - backup/: Yedekleme çekirdeği, veritabanı export/import, scheduler, utils
  - types/: Domain tipleri (pos, product, sales, receipt, table vb.)
  - utils/: eventBus, number/turkish search formatlayıcıları, dashboard istatistikleri, vat utils
  - contexts/: Bildirim bağlamı
  - test/: Testler ve setup

Not: UI dosyaları çok sayıda olduğundan her biri benzer kalıpları izler (TSX fonksiyonel komponentler, props → TS interface’leri, gerektiğinde context veya hooks kullanımı). Detaylı bileşen bazlı açıklama gerektiğinde modül modül genişletilebilir.

---

15. Bilinen Sorunlar, Eksikler ve İyileştirme Önerileri
Özet (TEMIZLIK-RAPORU.md ile uyumlu, İyileştirme Özeti entegre):
1) Büyük Bileşenlerin Bölünmesi
- SettingsPage.tsx ve POSPage.tsx gibi dosyalar büyük. BILESEN-BOLME-PLANI.md’de detaylı bölme planı mevcut.
- Beklenen fayda: Bakım kolaylığı, performans ve test edilebilirlik artışı.

2) Yedekleme Sistemi Tekilleştirme (TAMAMLANDI)
- createSmartBackup artık daima OptimizedBackupManager kullanır. BackupManager deprecated olarak işaretlendi ve yalnız uyumluluk için export edilmektedir.

3) Tip Güvenliği ve Kod Temizliği
- any kullanımlarını azaltma, explicit return types, @ts-ignore temizliği; ESLint/TS kuralları uygulanmaya devam edilmeli.

4) Test Kapsamı (GÜNCELLENDİ)
- Global kapsam eşiği vitest.config.ts içinde ≥%80 olarak tanımlandı. Kritik modüller için ≥%95 satır kapsamı client/scripts/check-coverage.js ile test:critical komutu aracılığıyla CI/yerelde zorunlu kılınır.

5) Hata Yönetimi (MERKEZİ)
- src/error-handler/ (ErrorBoundary + global promise/error yakalama) eklendi ve main.tsx içinde devreye alındı. Sentry mevcutsa otomatik raporlama yapılır.

5) Bundle/Performans Optimizasyonu
- Lazy loading ve code splitting daha da genişletilmeli.
- Gereksiz bağımlılıklar gözden geçirilmeli.

6) Yayın/CI
- GH_TOKEN gereksinimi dokümante. CI pipeline’da test/lint/build adımları zorunlu olmalı.

7) Dokümantasyon Sürekliliği
- KOMUT-REHBERI.md ve bu teknik kitap düzenli güncellenmeli; RELEASE/DEGISIKLIK-GUNLUGU akışı eklenebilir.

Ek Öneriler (Kurallarla uyumlu):
- React.memo/useMemo/useCallback kullanımlarını kritik bileşenlerde artırın.
- Ortak fonksiyonları utils ve hooks klasörlerinde tekrar kullanılır hale getirin (DRY).
- Error handling’i merkezi bir biçimde yönetin (örneğin /src/error-handler/ yapısı; proje hazır değilse planlayın).

---

16. Yol Haritası (Önerilen Sırayla Uygulanacaklar)
A) Kısa Vade (1-2 hafta)
- SettingsPage.tsx ve DashboardPage.tsx bölünmesi (plan dosyasına göre)
- Yedekleme sistemi tekilleştirme (OptimizedBackupManager ana yol)
- Kritik akışlara test ekleme, coverage ≥ %80

B) Orta Vade (1 ay)
- Lazy loading/code splitting kapsamını genişletme
- Bundle analiz ve iyileştirme
- UI bileşenlerinde prop sadeleştirmeleri ve gerekli yerlerde memoizasyon

C) Uzun Vade (3-6 ay)
- Cloud sync stratejisinin netleştirilmesi ve entegrasyon
- Gelişmiş performans dashboard’u ve izleme metrikleri
- Dokümantasyonun otomatik güncellenmesi (git hook veya CI) ve DEGISIKLIK-GUNLUGU

Bu belge, projenin tamamını yüksek seviyede kapsar ve derinleşmesi gereken alanlar için kaynak dosya yollarını ve mevcut plan dokümanlarını referans alır. İhtiyaç duyulan başlıklarda modül/komponent bazlı ayrıntılandırma eklenebilir.

---

17. Proje Standartları ve Kurallar (Özet ve Uygulama)
- Dil politikası: Tüm dokümantasyon ve yorumlar Türkçe olmalıdır; teknik terimler istisna. (language_policy)
- TypeScript: strict mode zorunlu; noImplicitAny, strictNullChecks vb. etkin. Fonksiyon parametre/dönüş tipleri belirtilmeli. (typescript_strict)
- Test coverage: Minimum %80; kritik yollar (ödeme, auth, kayıt) için %95. Unit, integration ve kritik akışlarda E2E önerilir. (test_coverage, xyHMAO...)
- Performans: Ana bundle < 500KB (gzip), chunk < 200KB (gzip); FCP < 1.5s, TTI < 3s, TBT < 200ms. (performance_standards)
- React performansı: React.memo, useMemo/useCallback uygun yerlerde; büyük bileşenleri lazy load et. (BJomom...)
- Tekrarın önlenmesi: Ortak fonksiyonlar src/utils, ortak hooks src/hooks, ortak UI src/components/Common altında toparlanmalı. (CPIzoV...)
- Hata yönetimi: Merkezi bir yapı önerilir (src/error-handler/), özel hata sınıfları ve logger entegrasyonu. (EEqXKF...)
- İsimlendirme: Değişken/fonksiyon camelCase; dosyalar kebab-case; fonksiyonlar fiil ile başlar. (U5VJ4P...)
- Import sırası: React/Node → third-party → iç modüller (utils, hooks, types) → bileşenler → statik dosyalar. (v0jGHq...)
- Tailwind sınıf sırası: Layout → Spacing → Typography → Colors → Effects; mobile-first. (Mmd1aI...)
- Kod formatı ve commit: Prettier + ESLint; commit mesajları Türkçe ve standarda uygun. (D1pkpru..., Ohqkcv...)
- CI/CD ve dokümantasyon: Testler zorunlu; otomatik güncelleme/doküman entegrasyonu önerilir. (PwySgB..., RUjNxw...)
- Dokümantasyon sürekliliği: Her işlem/kod değişikliği tamamlandığında ilgili tüm dokümanlar güncellenecektir (README, Teknik Kitap, KOMUT-REHBERI, DIYAGRAMLAR, ONBOARDING, OPERASYON-IZLEME, DEGISIKLIK-GUNLUGU vb.).

Pratik uygulama ipuçları:
- Büyük bileşenleri böl (BILESEN-BOLME-PLANI.md).
- Her public fonksiyon için JSDoc (Türkçe) ekle.
- Tekrarlanan yardımcıları utils ve hooks altında topla.
- Kritik akışlar için entegrasyon/E2E testleri ekle.

---

18. IPC API Referansı (Kanal ve Amaç)
Güncelleme
- check-for-updates (send): Manuel güncelleme kontrolü tetikler.
- update-available (on): Mevcut sürüm bilgisi iletilir.
- update-progress (on): İndirme yüzdesi, hız, kalan ve delta/full bilgisi.
- update-downloaded (on): İndirme tamamlandı; kullanıcıya kurulum mümkün.
- update-error (on): Güncelleme hatası.
- update-status (on): checking/available/downloading/downloaded/error durum objesi.
- quit-and-install (send): Güncellemeyi uygulayıp yeniden başlat.
- test-update-available / test-update-downloaded / test-update-error (send): Geliştirme amaçlı simülasyonlar.

Uygulama Bilgisi
- get-app-version (invoke): Uygulama sürümü (appInfo.getVersion() ile preload üzerinden çağrılır).

Yedekleme ve Dosya İşlemleri
- create-backup-bridge (invoke): Optimize edilmiş yedekleme oluşturmaya başlar; ilerleme backup-progress ile bildirilir.
- restore-backup-bridge (invoke): Yedekten geri yükleme başlatır; renderer tarafında IndexedDB import köprüsü ile tamamlanır.
- create-backup / restore-backup (invoke): Eski API, uyumluluk için.
- get-backup-history (invoke): Geçmiş yedek listesi.
- read-backup-file (invoke): Dosyadan yedek içerik okuma (FileUtils UI ile).
- schedule-backup / disable-scheduled-backup (invoke): Otomatik yedekleme zamanlayıcısı.
- test-auto-backup (invoke): Otomatik yedekleme testi.
- select-directory / set-backup-directory / get-backup-directory (invoke): Yedek dizini yönetimi.
- backup-progress (on): { stage, progress } şeklinde ilerleme olayları.

Veritabanı Köprüsü
- indexedDBAPI.exportAllDatabases (invoke): Renderer tarafında export isteği (main köprü event’leri ile koordine edilir).
- indexedDBAPI.importAllDatabases (invoke): Renderer tarafında import isteği.

Pencere/Kapanış Akışı
- app-close-requested (send from main): Kapanış öncesi işlemler (örn. yedekleme) için renderer’ı uyarır.
- confirm-app-close (send from renderer): Kapanış onayı; main uygulamayı kapatır.

Seri/Lisans
- check-serial / activate-serial / get-serial-info / reset-serial (invoke): Lisans doğrulama, aktivasyon ve reset işlemleri.

---

19. Tipler ve Veri Modelleri (src/types)
- backup.ts: Yedekleme meta ve içerik tipleri (kayıt sayısı, boyut, aşamalar, seçenekler).
- barcode.ts: Barkod yapı ve ayar tipleri.
- card.ts: Kart ödeme tipleri.
- cashRegister.ts: Kasa aç/kapa, hareket ve durum tipleri.
- credit.ts: Veresiye/borç kayıtlarıyla ilgili tipler.
- filters.ts: Listeleme/raporlama filtre tipleri.
- global.d.ts: Global tanımlar (renderer window API genişletmeleri vb.).
- hotkey.ts: Kısayol tuşları yapı tipleri.
- pos.ts: POS sepet, ödeme ve işlem tipleri.
- product.ts: Ürün ve stok tipleri.
- receipt.ts: Fiş, işletme ve yazdırma ile ilgili tipler.
- sales.ts: Satış ve satış kalemleri tipleri.
- table.ts: Tablo ve pagination tipleri.

---

20. Klasör ve Dosya Açıklamaları (Ayrıntılı)
client/electron
- main.ts: Electron ana süreç. Pencere oluşturma, menü/devtools (dev modunda), autoUpdater olay akışı, backup köprüleri, kapanış senaryosu, dizin seçimi ve zamanlama handler’ları.
- preload.ts: Güvenli window API yüzeyi. appInfo, ipcRenderer proxy, updaterAPI, backupAPI, serialAPI, indexedDBAPI expose edilir.
- license.ts: Serial/Lisans yönetimi. electron-store ile makine ID’ye bağlı lisans aktivasyonu.
- electron-env.d.ts: Ortam değişkenleri ve type deklarasyonları.

client/src/backup
- core/
  - BackupManager.ts: Klasik yedek stratejisi, serialize/deserialize ile çalışır.
  - OptimizedBackupManager.ts: Büyük veri setleri için optimizasyonlar (önerilen ana strateji).
  - BackupSerializer.ts / BackupDeserializer.ts: JSON/stream tabanlı serileştirme katmanı.
  - StreamingBackupSerializer.ts: Büyük veri için parça parça serileştirme.
- database/
  - IndexedDBExporter.ts / StreamingIndexedDBExporter.ts: IndexedDB verisini export eder.
  - IndexedDBImporter.ts: Yedekten IndexedDB’ye veri geri yükler.
- scheduler/BackupScheduler.ts: Otomatik yedekleme zamanlayıcısı.
- utils/
  - checksumUtils.ts: Tutarlılık ve bütünlük kontrol yardımcıları.
  - compressionUtils.ts: Sıkıştırma yardımcıları.
  - fileUtils.ts: Dosya okuma/yazma, dialog ve dizin yönetimi ile entegrasyon.
- index.ts: backupManager, optimizedBackupManager, createSmartBackup, FileUtils dışa açılır.

client/src/services
- dbService.ts: Genel DB yardımcıları ve bağlantı yönetimi.
- productDB.ts / salesDB.ts / cashRegisterDB.ts: Domain odaklı CRUD/aggregate işlemler.
- receiptService.ts: Fiş oluşturma, yazdırma ve şablon işlemleri.
- discountService.ts: İndirim hesaplamaları.
- posServices.ts: POS akışı yardımcıları (ödeme, sepet işlemleri).
- exportSevices.ts / importExportServices.ts: Excel/CSV dışa/içe aktarma (ExcelJS, PapaParse).
- encryptionService.ts: crypto-js ve machine-id ile şifreleme/çözme yardımcıları.
- creditServices.ts: Veresiye/borç işlemleri.
- UnifiedDBInitializer.ts: DB başlangıç/init akışı.
- PerformanceMonitor.ts: Zamanlayıcılar/ölçümler ve metrik yayımı.
- IndexOptimizer.ts: İndeks ve performans optimizasyonu (AI analiz ile birlikte kullanılır).
- AIIndexAnalyzer.ts / CloudSyncManager.ts / SmartArchiveManager.ts: Gelişmiş özellikler; analiz, cloud senk ve arşiv stratejileri.

client/src/hooks
- useCart.ts: Sepet durum yönetimi ve işlemleri.
- useProducts.ts / useProductGroups.ts: Ürün ve grup veri akışı.
- useSales.ts: Satış verileri ve işlemleri.
- useBarcode.ts / useBarcodeHandler.ts: Barkod okuma/işleme yardımcıları.
- useCustomers.ts: Müşteri verileri.
- useCashRegisterData.ts: Kasa verileri ve durum.
- useHotkeys.tsx: Kısayol tuşları yönetimi.

client/src/components (seçme ve temsilî dosyalar)
- ui/
  - Button.tsx, Input.tsx, Select.tsx, Switch.tsx, Dialog.tsx, Table.tsx, Tabs.tsx, Card.tsx, Badge.tsx, Pagination.tsx, DatePicker.tsx: Temel UI bileşenleri. Tip güvenliği ve props arayüzleri ile birlikte gelir.
- modals/
  - CustomerModal.tsx, CustomerDetailModal.tsx, CustomerSearchModal.tsx: Müşteri seçimi/oluşturma/detay modalları.
  - ProductModal.tsx, SelectProductModal.tsx: Ürün seçimi/oluşturma modalları.
  - PaymentModal.tsx, TransactionModal.tsx, ReceiptModal.tsx: Ödeme, işlem ve fiş süreç modalları.
  - modals/payment/: PaymentTypeToggle.tsx, PaymentHeader.tsx, PaymentFooter.tsx, ProductSplitSection.tsx, EqualSplitSection.tsx (PaymentModal alt bileşenleri).
  - ColumnMappingModal.tsx, ReasonModal.tsx: Excel sütun eşleme, sebep/nota girişleri.
- dashboard/
  - OverviewTab.tsx, SalesTab.tsx, ProductsTab.tsx, CashTab.tsx: Dashboard sekmeleri.
- pos/
  - POSHeader.tsx: POS tepesindeki durum/filtre/eylem çubuğu.
  - ProductPanel.tsx, CartPanel.tsx, PaymentControls.tsx, SearchFilterPanel.tsx: POS ekran bileşenleri.
- cashregister/
  - CashCounting.tsx, CashRegisterStatus.tsx, TransactionHistory.tsx, TransactionControls.tsx, TransactionModals.tsx: Kasa ekranı bileşenleri.
- settings/
  - AboutTab.tsx, BackupSettingsTab.tsx, BarcodeSettingsTab.tsx, POSSettingsTab.tsx, ReceiptSettingsTab.tsx, SerialSettingsTab.tsx: Ayarlar sekmeleri.
- error-handler/
  - ErrorBoundary.tsx: UI tarafında beklenmeyen hataları yakalar, kullanıcı dostu geri bildirim verir ve (varsa) Sentry’ye raporlar.
  - index.ts: reportError ve setupGlobalErrorHandlers (window.error ve unhandledrejection yakalama).
- Diğer önemli bileşenler
  - AlertProvider.tsx, NotificationPopup.tsx: Bildirim/uyarı altyapısı.
  - UpdateNotification.tsx: Güncelleme bildirim akışı.
  - LicenseActivation.tsx / SerialActivation.tsx: Lisans/seri etkinleştirme UI.
  - CategoryManagement.tsx, StockManagement.tsx, SalesFilterPanel.tsx, BarcodeGenerator.tsx, BulkProductOperations.tsx, BatchPriceUpdate.tsx, ExportButton.tsx, PrinterDebug.tsx: Yönetim ve araç bileşenleri.
  - layout/PageLayout.tsx: Sayfa düzeni.

client/src/pages
- POSPage.tsx: Satış akışının ana sayfası.
- ProductsPage.tsx: Ürün yönetimi.
- SalesHistoryPage.tsx / SaleDetailPage.tsx: Satış geçmişi ve detay.
- CashRegisterPage.tsx: Kasa akışları.
- SettingsPage.tsx: Ayarlar (bölünmesi planlı).
- DashboardPage.tsx: Özet ve metrikler.

client/src/utils
- eventBus.ts: Uygulama içi olay yayım/abonelik (tip güvenliği iyileştirilmiş).
- numberFormatUtils.ts, turkishSearch.ts, vatUtils.ts: Yardımcı formatlama/arama/KDV araçları.
- dashboardStats.ts: Dashboard metrik hesaplamaları.
- FocusManager.ts: Odak yönetimi.
- backup-bridge.ts: Yedekleme köprüsü yardımcıları.
- MobilePerformanceOptimizer.ts: Mobil cihaz performans yardımcıları.

client/src/contexts
- NotificationContext.tsx: Bildirim sağlayıcısı ve context API.

client/src/test
- setup.ts: Test ortamı global mock’lar ve cleanup; jest-dom entegrasyonu.
- Button.test.tsx, formatters.test.ts: Örnek testler.

client/config ve kök dosyalar
- vite.config.ts: Electron main/preload girişleri ve alias '@'.
- vitest.config.ts: Test ayarları ve kapsam raporu (text/json/html), exclude kalıpları.
- eslint.config.js: Kapsamlı ESLint kuralları; TS ve React entegrasyonu.
- .prettierrc: Prettier kuralları (semi, singleQuote, printWidth: 80 vb.).
- tailwind.config.js: Tema ve eklenti ayarları (tailwindcss-animate).
- client/package.json: Script’ler (dev, build, publish, lint, format, test), electron-builder konfigürasyonu (appId, target’lar, publish: github, asarUnpack: better-sqlite3).

---

21. Güvenlik, Gizlilik ve Yayın Notları
- Ortam değişkenleri: GH_TOKEN gibi hassas değerleri yalnız ortam değişkeni olarak kullanın; kod/commit içinde yazmayın.
- electron-store ile saklanan lisans/ayarlar için encryptionKey kullanılır; makine ID ile bağ kurulur.
- Export/backup içerikleri kullanıcı seçimiyle dosyaya yazılır; dizin izinleri ve boş alan kontrolü önemlidir.
- Publish işlemleri private GitHub Releases’a yönlendirilmiştir; token zorunludur.

---

22. Sorun Giderme (Özet)
- Aktivasyon: Geçerli serial kullanın, internet/sistem saati kontrolü, gerekli ise reset-serial.
- POS bağlantı: Manuel mod, seri port ayarları, driver ve USB bağlantıları.
- Yedekleme: Disk alanı, dizin izinleri, streaming backup, eski yedekleri temizleme.
- Log konumları: OS’e göre appdata/logs klasörleri; dev modunda konsol logları ve electron-log dosyaları.

---

23. Ek İyileştirme Önerileri (Uygulanabilir Adımlar)
- SettingsPage ve POSPage bölünmesi; lazy loading ve React.memo yaygınlaştırma.
- Backup sisteminin tekilleştirilmesi; eski API’nin resmen deprecate edilip yeni köprülerin belgelenmesi.
- Test kapsamını artırma; kritik akışlarda integration/E2E.
- Bundle analizi ve dinamik import’lar; kullanılmayan bağımlılıkların ayıklanması.
- Merkezi hata yöneticisi (src/error-handler/) eklenmesi ve logger ile entegrasyon.
- Otomatik dokümantasyon/STATUS güncellemeleri için git hook/CI entegrasyonu.

---

24. Derin Akış Açıklamaları (Uçtan Uca)
Satış Oluşturma (POS → Satış Kaydı → Fiş)
1) Kullanıcı POS ekranından ürün ekler (components/pos/* + hooks/useCart.ts). Ürün verileri productService üzerinden IndexedDB'den gelir.
2) Ödeme adımında sepet toplamı ve olası indirim hesaplanır.
3) salesDB.addSale çağrılır:
   - DBVersionHelper ile salesDB sürümü alınır ve DB açılır.
   - İlk kezse 'sales' object store'u { keyPath: 'id' } ile oluşturulur.
   - İndirim varsa: total = discount.discountedTotal, originalTotal = indirimsiz tutar olarak set edilir.
   - Satış kaydı id formatı: SALE-<timestamp>-<random> olarak üretilir ve store.add ile yazılır.
4) receiptService.generatePDF veya printReceipt ile fiş PDF'i hazırlanır ve indirilir.
5) Özetleme ve raporlar için salesDB.getSalesSummary ile dönemsel metrikler hesaplanır.

Stok Güncelleme (Ürün Ekleme/İptal/İade Sonrası)
1) productService.updateStock(id, qty) çağrısı ile 'products' store'unda stok güncellenir.
2) Güncelleme sonrası emitStockChange(product) tetiklenir → abone bileşenler anlık güncellemeyi alır.

Yedekleme (Renderer → Main IPC → Backup Çekirdeği)
1) Renderer: window.backupAPI.createBackup(options) ile invoke → main 'create-backup-bridge'.
2) Main: createSmartBackup ile veri büyüklüğüne göre optimize/streaming yol seçer. onProgress callback ile 'backup-progress' event gönderilir.
3) Sonuç: backupManager/optimizedBackupManager ile dosya yazımı ve metadata üretimi; kullanıcıya başarı/durum bilgisi döndürülür.

Veritabanı Onarım (Schema Tutarsızlığı Algılandığında)
1) initProductDB içinde beklenen store seti doğrulanır: products, categories, productGroups, productGroupRelations.
2) Tutarsızlık tespit edilirse localStorage 'db_force_reset' işaretlenir ve sonraki yüklemede resetDatabases çalışır.

---

25. IndexedDB Şema ve İndeksler (Tespit Edilenler)
Birleştirilmiş POS DB (posDB)
- Stores:
  - products: Ürün kayıtları (barcode index'i mevcut). Alanlar: id, name, category, purchasePrice, salePrice, vatRate, priceWithVat, stock, barcode.
  - categories: Kategori kayıtları (isim eşsizliği uygulama düzeyinde kontrol ediliyor).
  - productGroups: Ürün grupları; default grup 'Tümü' tekil tutulur. İndeks: 'order'.
  - productGroupRelations: Many-to-many ilişki (groupId, productId). Primary key: [groupId, productId]. İndeksler: groupId, productId.

Satış Veritabanı (salesDB)
- Store: sales (keyPath: 'id').
- İndirim kaydı: discount: { type, value, discountedTotal }, originalTotal alanı indirimsiz tutarı korur.
- Özet fonksiyonları: tarih aralığına göre toplam satış, tutar, indirim, ödeme yöntemine göre dağılım.

Şifreli yardımcı DB (createEncryptedDB)
- Her çağrıda openDB ile belirtilen dbName ve storeName için store yoksa oluşturur.
- Kayıtlar encryptionService ile encrypt edilerek { data: <cipher> } şeklinde saklanır. get/getAll çağrıları decrypt uygular.

Sürümleme ve Onarım
- DBVersionHelper.getVersion(dbName) ile veritabanı bazlı versiyonlama.
- resetDatabases(): posDB, productDB (eski), salesDB, creditDB silinir ve birleştirilmiş DB yeniden kurulur.

---

26. İçe/Dışa Aktarım Şemaları
Excel/CSV Ürün Dışa Aktarım (importExportServices)
- Excel sütunları: Barkod, Ürün Adı, Kategori, Alış Fiyatı, Satış Fiyatı, KDV Oranı, KDV'li Fiyat, Stok.
- CSV: PapaParse ile aynı alanların düz metin üretimi.
- Şablon üretimi: generateTemplate('excel'|'csv') örnek satırla indirir.

Kasa Verisi Excel Raporu (exportSevices)
- Çok sayfalı workbook: Kasa Özeti, Günlük Veriler, İşlem Geçmişi, Satılan Ürünler (koşullu), Veresiye Tahsilatları (koşullu).
- Başlık/alt başlık/stil ve sayfa kenarlıkları standartlaştırılmış.
- Veresiye işlemleri açıklama içinden regex ile müşteri çıkarımı yapar ("Veresiye Tahsilatı - (.+)").
- Özet satırları ve para birimi numFmt ayarları yapılır (₺ formatları).

---

27. PDF Fiş Oluşturma Detayları (receiptService)
- pdf-lib ile PDFDocument.create → Helvetica/HelveticaBold fontları embed edilir.
- Sayfa boyutu: yaklaşık 80x200 mm (point çevrimi 1mm≈2.83pt).
- Başlık, adres, tel, çizgiler, tablo başlıkları, satır satır ürünler, toplam alanı ve ödeme bilgileri çizilir.
- Nakit ödemede alınan ve para üstü bilgisi basılır.
- Blob oluşturulup indirilebilir link ile kullanıcıya sunulur (download adı: fis-<receiptNo>.pdf).

---

28. Test Senaryosu Önerileri (Öncelikli)
Ürün Veritabanı (productService)
- Barkod benzersizliği: Aynı barkodla addProduct hata fırlatmalı.
- Kategori ekleme: İsim çakışmasında uyarı vermeli, farklı harf büyüklüğünde de yakalamalı.
- Grup ilişkileri: Varsayılan gruba ürün eklenememeli; composite key [groupId, productId] tekrarda hata vermemeli (ConstraintError toleransı test edilmeli).
- Toplu ekleme: Mevcut barkodlar güncellenmeli, yeniler eklenmeli (updatedCount/addedCount davranışı doğrulanmalı).

Satış Veritabanı (salesDB)
- İndirimli satış: total = discountedTotal, originalTotal doğru set edilmeli.
- Güncelleme: discount güncellemesinde total/originalTotal yeniden hesaplanmalı.
- Özet: Tarih aralığında toplamlar ve paymentMethod dağılımı doğru olmalı.

PDF Fiş
- generatePDF: Ürün satırlarının kısaltma (20+ karakter) davranışı; nakit ödemede para üstü hesabı.

Excel Raporları
- exportCashDataToExcel: Boş veri setlerinde bilgi mesajı; toplam satırlarının formatı; müşteri gruplama doğru hesaplanmalı.

---

29. IPC Sekans Akışları (Adım Adım Metinsel Diyagramlar)
Güncelleme Kontrolü (Renderer başlatır)
- Renderer: updaterAPI.checkForUpdates → main 'check-for-updates'.
- Main: autoUpdater.checkForUpdatesAndNotify(); 'checking-for-update' → 'update-available' → 'download-progress' → 'update-downloaded' veya 'error'.
- Preload: update-available/progress/downloaded/status/error event'lerini window.updaterAPI.* ile UI'a aktarır.
- Renderer: "indir" veya "kur" eyleminde 'quit-and-install' gönderir.

Yedekleme Oluşturma
- Renderer: backupAPI.createBackup(options) (invoke).
- Main: createSmartBackup → backup-progress event akışı → sonuç döndür.
- Renderer: UI ilerlemeyi backupAPI.onBackupProgress ile izler.

Geri Yükleme
- Renderer: backupAPI.restoreBackup(content) (invoke).
- Main: deserialize → base64 encode → 'db-import-base64' ile renderer'a aktar → renderer IndexedDB'ye yazar → 'db-import-response' döner.
- Main: başarı/metadata'yı resolve eder.

Kapanış Senaryosu
- Main: pencere 'close' → app-close-requested event → Renderer yedeklemeyi bitirip confirm-app-close gönderir → Main app.quit.

---

30. Örnek Kod Kalıpları ve JSDoc (Türkçe)
Props Arayüzü ve Bileşen
```tsx path=null start=null
/**
 * Satın alma özet kartı bileşeni
 * @param totalAmount - Toplam tutar (₺)
 * @param itemCount - Satılan ürün adedi
 * @param onDetails - Detaylara gitme callback'i
 */
interface PurchaseSummaryCardProps {
  totalAmount: number;
  itemCount: number;
  onDetails: () => void;
}

export function PurchaseSummaryCard({ totalAmount, itemCount, onDetails }: PurchaseSummaryCardProps) {
  // Büyük hesaplamaları memoize edin
  const formatted = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalAmount);
  
  return (
    <div className='flex flex-col gap-2 p-4 text-sm bg-white rounded-lg shadow-md'>
      <div className='flex items-center justify-between'>
        <span className='font-medium'>Toplam</span>
        <span className='font-bold'>{formatted}</span>
      </div>
      <div className='flex items-center justify-between'>
        <span className='text-gray-600'>Ürün Adedi</span>
        <span>{itemCount}</span>
      </div>
      <button className='mt-2 px-3 py-2 bg-primary-500 text-white rounded' onClick={onDetails}>
        Detaylar
      </button>
    </div>
  );
}
```

Basit EventBus Kullanımı
```ts path=null start=null
// Yayınla
eventBus.emit('stock:changed', { productId: 123, delta: -1 });

// Abone ol
const unsubscribe = eventBus.on('stock:changed', (payload) => {
  console.log('Stok değişti', payload);
});

// Abonelik iptal
unsubscribe();
```

TypeScript Strict ve Hata Yönetimi Örneği
```ts path=null start=null
/**
 * İndirimli tutarı hesaplar
 * @throws Error Geçersiz indirim değeri durumunda
 */
function calculateDiscountedTotal(total: number, type: 'percentage' | 'amount', value: number): number {
  if (type === 'percentage') {
    if (value < 0 || value > 100) throw new Error('Geçersiz indirim yüzdesi');
    return +(total * (1 - value / 100)).toFixed(2);
  }
  if (value < 0 || value > total) throw new Error('Geçersiz indirim tutarı');
  return +(total - value).toFixed(2);
}
```

---

31. Bileşen Bazlı Derin İnceleme (POS Ekranı Örneği)
POSPage.tsx (Akış ve Veri Kaynakları)
- Üst Çubuk: POSHeader ile kasa durumu rozetleri, filtre toggle ve hızlı eylemler (Yeni Satış, Ara) yönetilir.
- Giriş: Kullanıcı ürün araması (SearchFilterPanel) veya barkod ile ekleme.
- CartPanel: Sepet satırları, adet/değer güncellemeleri; useCart hook’u ile state yönetimi.
- PaymentModal alt bölümleri: ProductSplitSection (ürün bazlı bölme) ve EqualSplitSection (eşit bölme) ile modüler yapı.
- Ödeme Akışı: usePaymentFlow hook’u; satış kaydı (salesDB), fiş (receiptService), kasa kaydı (cashRegisterService), stok güncelleme (productService) ve sepet temizliği.
- Kasa Durumu: useRegisterStatus hook’u; kasa açık/kapalı kontrolü ve hızlı ödeme/ödeme modali açma koşullarının merkezileştirilmesi.
- Görünüm Tercihleri: usePOSViewPreferences ile kompakt sepet/ürün listesi kalıcı hale getirildi.
- “Miktar Modu” göstergesi: QuantityModeToast bileşeni ile yönetilir.
- Ürün veri kaynağı: productService.getAllProducts() → IndexedDB ‘products’ store.

PaymentControls.tsx (Sorumluluklar ve Kenarlar)
- Sorumluluk: Ödeme yöntemi seçimi, indirim tip/tutar girişleri, onay akışı tetikleme.
- Kenarlar: İndirim validasyonu (yüzde 0-100, tutar 0-total arası), nakit ödemede alınan/para üstü hesabı.
- Yan etkiler: Satış kaydı oluşturma; başarıda sepet temizleme, fiş oluşturma çağrısı.

CartPanel.tsx (Sorumluluklar)
- Sepet satırları ekleme/çıkarma, adet değişimi, satır bazlı ara toplam hesapları.
- Etkileşim: useCart ile total/originalTotal/discount gibi türetilmiş state’ler.

ProductPanel.tsx (Sorumluluklar)
- Kategori/Grup filtreleri ve ürün listeleme; hızlı ekleme butonları.
- Grup üyeliği: productService.getGroupProducts ile grup içerikleri; default grup davranışı (Tümü → tüm ürünler varsayılan).

Önemli Not: Büyük bileşenlerde prop drilling yerine context veya eventBus kullanılabilir; performans için React.memo ve seçici prop’lar tercih edilmelidir.

---

32. Hooks Derin İnceleme
useCart (Örnek Eyalet Şekli ve Yükümlülükler)
- State: items[], total, originalTotal, discount?, paymentMethod, receiptNo.
- İşlemler: addItem(product, qty), removeItem(id), updateQty(id, qty), applyDiscount(type, value), resetCart().
- Yan etkiler: applyDiscount, salesDB.applyDiscount ile uyumlu olmalı.

useProducts
- Sorgular: getAll, getById, getGroups, getGroupProducts.
- Önbellekleme: Sık erişilen listeler için basit bellek önbelleği düşünülebilir.

useSales
- Listeler: getDailySales, getSalesWithFilter.
- Özet: getSalesSummary çağrısı ile rapor "+ graf data" hazırlama.

useHotkeys
- Kısayollar: Örn. POS artış/azalış, ödeme aç; UI odağı için FocusManager ile birlikte kullanımı önerilir.

---

33. EventBus Kanalları ve Abonelikler
- Örnek kanal: 'stock:changed' → payload: { productId, delta? } (productService.emitStockChange tetiklenir).
- Önerilen kalıp: eventBus.on(eventName, handler) → unsubscribe fonksiyonu döner; component unmount’ta çağrılır.
- İsimlendirme: domain:olay (ör. sales:completed, backup:progress, updater:status) şeklinde.

---

34. Sürümleme, Şema Değişiklikleri ve Güvenli Yükseltme
- DBVersionHelper: Her veritabanı için sürüm numarası üretir; schema değişikliğinde arttırılmalıdır.
- Yükseltme Stratejisi: onupgradeneeded/upgrade callback’inde store ve index tanımları; geriye dönük uyumluluk için “varsa oluştur” yaklaşımı.
- Tutarsızlık Kurtarma: initProductDB doğrulama başarısızsa 'db_force_reset' işaretlenir ve bir sonraki açılışta resetDatabases çağrılır.
- Not: Kritik veri kaybını önlemek için reset öncesi otomatik yedekleme tetiklemesi planlanabilir (backupManager.startScheduler entegrasyonu).

---

35. Electron ↔ Renderer Güvenliği ve Yapılandırma
- Preload: contextBridge ile güvenli API yüzeyi; renderer doğrudan Node API’lerine erişmez.
- BrowserWindow (main.ts): preload kullanımı ve devTools geliştirme modunda açık. Güncelleme splash penceresi nodeIntegration:true ve contextIsolation:false ile açılıyor; yalnızca dahili statik HTML içerik yüklendiğinden risk düşüktür. Hassas işlem yapılmaz.
- Tavsiye: Renderer’da window.ipcRenderer üzerinden yalnız whitelist edilmiş kanalları kullanın; arbitrary channel kabul etmeyin.
- Kaynak Bütünlüğü: preload’ta expose edilen API’ler dar ve belgelenmiş tutulmalıdır (bu dokümandaki IPC referansı esas alınmalı).

---

36. Performans Ölçümü ve Bütçeler (Uygulama Adımları)
- Başlangıç Ölçümü: Renderer load sonrası PerformanceMonitor ile FCP/TTI benzeri olay zamanlarını toplayın ve konsola/loga yazın.
- Komutlar: npm run build sonrası üretim benzeri ortamda npm run preview ile profilleme; devtools Performance tabı ile ölçüm.
- Bundle Boyutu: Vite build çıktısı dist/ altında; büyük chunk’lar için dinamik import noktaları belirleyin (örn. Settings sekmeleri, Dashboard ağır widget’lar).
- Render Optimizasyonu: React.memo; listelerde key ve virtualization; ağır hesaplar için useMemo; handler’lar için useCallback.

---

37. Hata Yönetimi Merkezi (Öneri Uygulama)
Yapı Önerisi: src/error-handler/
- errorClasses.ts: ValidationError, DatabaseError, ImportExportError, BackupError.
- handleError.ts: Logger entegrasyonu (electron-log veya konsol), kullanıcıya bildirim (NotificationContext) ve tür’e özgü geri bildirim.
- boundary: React Error Boundary bileşeni (kritik UI bölgelerinde kullanın).

Örnek Error Sınıfı
```ts path=null start=null
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

---

38. Quality Gates ve Otomasyon
- Pre-commit: Husky + lint-staged ile TS/TSX dosyalarında ESLint fix ve Prettier format çalıştırılır (client/package.json lint-staged bölümü mevcut).
- Lokal Kalite Hedefi: npm run lint && npm run type-check && npm run test:coverage (≥ %80) && npm run build.
- Raporlama: Vitest coverage html raporunu artifacts olarak saklama (CI yoksa local docs/ içine kopyalanabilir).
- Dokümantasyon güncelleme komutları (kök package.json):
- docs:update → Teknik Kitap + API/BILESENLER/PERFORMANS meta güncelleme
- status:update → DURUM.md meta + coverage özeti (varsa)
- analyze:project → Birden fazla dokümanda meta tarih/sürüm senkronizasyonu
- docs:all → analyze:project + docs:update + status:update zinciri
- Yerel hook örnekleri: scripts/post-commit.example.sh ve scripts/post-commit.example.ps1 (manuel kopyalama ile kullanılabilir).

---

39. Sık Sorulanlar (Proje Özel)
- “Default grup neden ‘Tümü’ ve ürün listesi boş dönüyor?”
  - Varsayılan grup tüm ürünleri kapsar; ilişkiler store’u boş olabilir. Grup ürünlerini çekerken isDefault ise tüm ürünleri alın ya da boş listeyi UI’da ‘tüm ürünler’ olarak yorumlayın.
- “İndirim sonrası total/originalTotal neden farklı?”
  - originalTotal indirimsiz tutarı korur; raporlama ve indirim toplamı hesapları için gereklidir. total, indirim uygulanmış değerdir.
- “Şema tutarsızlığı tespit edildi, neden sayfa yenileniyor?”
  - initProductDB doğrulaması başarısız; resetDatabases tetiklenmek üzere ‘db_force_reset’ işaretlendi. Sonraki açılışta temiz kurulum yapılır.

---

40. Terimler ve Sözlük
- POS: Point of Sale (Satış Noktası)
- IndexedDB: Tarayıcı içi anahtar/değer veritabanı
- IPC: Inter-Process Communication (Main ↔ Renderer mesajlaşma)
- Preload: Renderer’a güvenli API köprüsü sağlayan katman
- FCP/TTI/TBT: Performans metrikleri (First Contentful Paint / Time To Interactive / Total Blocking Time)
- Bundle: Derlenmiş JS/CSS çıktıları

---

41. IPC Tablo Referansı (Kanal, Yön, İstek/Cevap)
Güncelleme
- check-for-updates: renderer → main (send). İstek: yok. Cevap: event akışları ile.
- update-available: main → renderer (event). Payload: { version, ... }.
- update-progress: main → renderer (event). Payload: { percent, transferred, total, speed, remaining, isDelta }.
- update-downloaded: main → renderer (event). Payload: { version, updateType }.
- update-status: main → renderer (event). Payload: { status: 'checking' | 'available' | 'downloading' | 'downloaded' | 'error', ... }.
- update-error: main → renderer (event). Payload: Error.
- quit-and-install: renderer → main (send). İstek: yok. Cevap: uygulama kapanır/yükler.
- test-update-available | test-update-downloaded | test-update-error | test-quit-and-install: renderer → main (send). Sadece geliştirme amaçlı.

Uygulama/Pencere
- get-app-version: renderer → main (invoke). Cevap: string (sürüm).
- update-window-title: renderer → main (send). İstek: newTitle: string.

Yedekleme/Dosya
- create-backup-bridge: renderer → main (invoke). İstek: options. Cevap: { success, backupId?, metadata?, size?, recordCount?, error? }.
- restore-backup-bridge: renderer → main (invoke). İstek: content(string), options?. Cevap: { success, metadata?, error? }. Not: Handshake kanalları:
  - db-import-base64: main → renderer (event). Payload: base64Data (JSON verisi).
  - db-import-response: renderer → main (send). Payload: { success: boolean, error?: string }.
- get-backup-history: renderer → main (invoke). Cevap: Backup geçmiş listesi.
- read-backup-file: renderer → main (invoke). Cevap: Dosya içeriği (kullanıcı seçimi sonrası).
- schedule-backup: renderer → main (invoke). İstek: (frequency, hour?, minute?). Cevap: boolean.
- disable-scheduled-backup: renderer → main (invoke). Cevap: boolean.
- select-directory: renderer → main (invoke). Cevap: dialog sonucu (seçilen dizinler).
- set-backup-directory: renderer → main (invoke). İstek: directory: string. Cevap: { success: boolean }.
- get-backup-directory: renderer → main (invoke). Cevap: string | null (FileUtils yanıtı).
- backup-progress: main → renderer (event). Payload: { stage: string, progress: number }.
- test-auto-backup: renderer → main (invoke). Cevap: yedekleme sonucu.

Kapanış Koordinasyonu
- app-close-requested: main → renderer (event). Amaç: kapanış öncesi işlemler.
- confirm-app-close: renderer → main (send). Amaç: kapanış onayı.
- backup-in-progress: renderer → main (send). Amaç: kapatma sırasında yedekleme devam ediyor bilgisini iletmek.

IndexedDB Köprüsü (Not)
- indexedDBAPI.exportAllDatabases / importAllDatabases: preload’ta expose edilmiştir; ancak main tarafında doğrudan handler bulunmamakta. Şu an restore akışı db-import-base64/db-import-response ile çalışır. Bu metotlar gelecekte genişletme için ayrılmış olabilir.

---

42. IndexedDB Şema Metinsel Diyagramı
posDB
- products (keyPath: id)
  - index: barcode (unique?) → uygulama düzeyi kontrol var (addProduct bakar)
  - alanlar: id, name, category, purchasePrice, salePrice, vatRate, priceWithVat, stock, barcode
- categories (keyPath: id)
  - alanlar: id, name
  - davranış: addCategory’de isim çakışması uygulama düzeyinde engellenir (case-insensitive)
- productGroups (keyPath: id)
  - index: order (sıralama için)
  - alanlar: id, name, order, isDefault
  - davranış: en az bir ‘Tümü’ isDefault:true grup; fazlaysa fazlalar silinir
- productGroupRelations (keyPath: [groupId, productId])
  - index: groupId
  - index: productId
  - alanlar: groupId, productId
  - davranış: default gruba ürün eklenmez; duplicate ekleme ConstraintError toleransı var

salesDB
- sales (keyPath: id)
  - alanlar: id, items[], total, originalTotal?, discount?, date, status, paymentMethod, receiptNo, ...
  - davranış: discount varsa total=discountedTotal, originalTotal korunur; summary hesapları bu ayrımı kullanır

Şifreli DB (createEncryptedDB)
- store adı parametre ile dinamik; kayıtlar { data: cipher } şeklinde saklanır; get/getAll decrypt eder

---

43. Performans Ölçüm Kontrol Listesi
- İlk yükleme
  - Geliştirme: npm run dev ile sayfayı açın; devtools Performance ile ilk render profilini alın
  - Üretim benzeri: npm run build && npm run preview, aynı ölçümleri tekrarlayın
- Ağır bileşen tespiti
  - React Profiler ile POSPage, SettingsPage ve DashboardPage render sürelerini ölçün
  - 16ms kare bütçesinin aşıldığı yerleri not alın
- Bundle analizi
  - Vite build çıktısında büyük chunk’ları belirleyin (ör. >200KB gzip)
  - Dinamik import önerisi: Settings sekmeleri, Dashboard ağır widget’lar, Advanced features kartları
- Render optimizasyonu
  - Uzun listelerde virtualization (ör. react-window) düşünün
  - Memoization: Derived değerler için useMemo; event handler’lar için useCallback
- Veri erişimi
  - Sık tekrarlanan sorgular için bellek önbelleği veya basit invalidation mekaniği
- İzleme
  - PerformanceMonitor çıktıları ve konsol loglarını toplayın; regresyonları not edin

---

44. Test Planı (Given/When/Then Örnekleri)
Ürün Ekleme (Barkod benzersizliği)
- Given: Veritabanında barkodu 123 olan ürün var
- When: Aynı barkodla addProduct çağrılır
- Then: Hata fırlatılmalı “Bu barkoda sahip ürün zaten mevcut: 123”

Kategori Ekleme (Case-insensitive)
- Given: ‘Genel’ kategorisi mevcut
- When: ‘genel’ eklenmeye çalışılır
- Then: Hata fırlatılmalı “kategori zaten mevcut”

Satış (İndirimli)
- Given: Sepet toplamı 100₺
- When: %10 indirim uygulanır ve addSale çağrılır
- Then: total=90, originalTotal=100 olarak kaydedilmeli

Özet (Tarih aralığı)
- Given: Belirli tarih aralığında 3 tamamlanmış satış var
- When: getSalesSummary çağrılır
- Then: totalSales=3 ve paymentMethod dağılımı doğru olmalı

Yedekleme Geri Yükleme Handshake
- Given: Valid yedek JSON’u
- When: restore-backup-bridge çağrılır
- Then: main → renderer db-import-base64 gönderir; renderer → main db-import-response success:true döner

Excel Raporu (Boş veri)
- Given: transactions boş
- When: exportCashDataToExcel çalışır
- Then: ‘Bu tarih aralığında işlem kaydı bulunmamaktadır.’ mesajı A5 hücresinde yer almalı

---

45. Bileşen/Props Detayları (Temsilî)
PaymentControls
- Props (temsilî):
  - totalAmount: number, originalTotal?: number, onConfirm(payment: { method: 'cash'|'card', discount? }): void
- Validasyon: indirim yüzdesi 0-100, indirim tutarı 0-total aralığında olmalı
- Yan etki: onConfirm sonrası sepet reset ve fiş üretimi tetiklenir

CartPanel
- Props (temsilî):
  - items: Array<{ id, name, qty, priceWithVat }>, onQtyChange(id, qty): void, onRemove(id): void
- Türetilmiş değerler: satır toplamı, genel toplam (original vs. discounted)

Not: Gerçek props imzaları dosya içinde kontrol edilmelidir; burada sorumluluk ve etkileşimler belgelenmiştir.

---

46. IPC Payload Şemaları (JSON Örnekleri)
Güncelleme Durumu (update-status → renderer)
```json path=null start=null
{
  "status": "downloading", // checking | available | downloading | downloaded | error
  "version": "0.5.3",
  "progress": {
    "percent": 42.3,
    "transferred": 25432100,
    "total": 120000000,
    "speed": "1.25", // MB/s (string)
    "remaining": 94567900,
    "isDelta": true
  },
  "error": null
}
```

Güncelleme İlerleme (update-progress → renderer)
```json path=null start=null
{
  "percent": 42.3,
  "transferred": 25432100,
  "total": 120000000,
  "speed": "1.25",
  "remaining": 94567900,
  "isDelta": true
}
```

Yedekleme Oluşturma Sonucu (create-backup-bridge ← main)
```json path=null start=null
{
  "success": true,
  "backupId": "2025-08-27T00-45-10Z-full",
  "metadata": {
    "description": "Manuel Yedekleme - Optimize",
    "backupType": "full", // full | incremental (plan)
    "createdAt": "2025-08-27T00:45:10.123Z"
  },
  "size": 10485760,
  "recordCount": 15234,
  "error": null
}
```

Yedekleme İlerleme (backup-progress → renderer)
```json path=null start=null
{
  "stage": "serialize", // export | serialize | compress | write
  "progress": 67 // %
}
```

Geri Yükleme Köprüsü (main → renderer db-import-base64 ve renderer → main db-import-response)
```json path=null start=null
// main → renderer (db-import-base64)
{
  "data": "eyJkYXRhYmFzZXMiOnsiYXBwRGIiOnsgLi4ufX19" // Base64(JSON)
}
```
```json path=null start=null
// renderer → main (db-import-response)
{
  "success": true,
  "error": null
}
```

Zamanlama Sonuçları
```json path=null start=null
{
  "scheduled": true,
  "frequency": "daily", // hourly | daily | weekly
  "time": { "hour": 3, "minute": 0 }
}
```

---

47. IndexedDB Migration Rehberi (Şema Değişiklikleri)
- Versiyon Politikası: Her şema değişikliğinde ilgili veritabanı için DBVersionHelper.getVersion(dbName) çıktısı artırılmalı.
- onupgradeneeded/upgrade:
  - Yeni store ekleme: yoksa oluştur (idempotent yaklaşım).
  - Yeni indeks ekleme: store.indexNames kontrol edilerek yoksa oluştur.
  - Alan ekleme: IndexedDB satır bazında esnik; alanlar schema-less. Gerekliyse mevcut kayıtları migrate etmek için readAll → write back uygulanır.
- Store Yeniden Şekillendirme (keyPath değişikliği vb.):
  1) Yeni store oluştur (ör. products_v2)
  2) Eski store’dan tüm kayıtları okuyup dönüştür
  3) Yeni store’a yaz
  4) Eski store’u sil ve yeni store’u kalıcı isimle yeniden adlandır (uygulamada “kopyala-yarat” deseni gerekir)
- Geriye Dönük Uyumluluk: Kod içinde opsiyonel alanlara guard’lar konulmalı (?. ve varsayılanlarla).
- Kurtarma: initProductDB doğrulaması başarısızsa ‘db_force_reset’ işaretlenir; kullanıcı veri kaybını önlemek için reset öncesi otomatik yedekleme önerilir.

---

48. Yedekleme Formatı ve Metadata
- İçerik Katmanları:
  - export: IndexedDB dump (databases → stores → kayıtlar)
  - serialize: JSON veya streaming JSON blokları
  - compress: LZ/benzeri (compressionUtils)
  - checksum: checksumUtils ile bütünlük
- Dosya İsimlendirme (öneri):
  - RoxoePOS-backup-<type>-<YYYYMMDD_HHMMSS>.rxb
- Metadata Alanları (örnek):
```json path=null start=null
{
  "version": "0.5.3",
  "app": "RoxoePOS",
  "createdAt": "2025-08-27T00:45:10.123Z",
  "backupType": "full",
  "exportInfo": {
    "databases": [
      { "name": "posDB", "recordCounts": { "products": 1234, "categories": 16 } },
      { "name": "salesDB", "recordCounts": { "sales": 854 } }
    ],
    "totalRecords": 2088
  },
  "integrity": {
    "algorithm": "sha256",
    "checksum": "..."
  }
}
```
- Geri Yükleme Adımları:
  1) Deserialize → JSON çıkar
  2) Base64 encode edilip db-import-base64 ile renderer’a gönderilir
  3) Renderer IndexedDBImporter ile yazıp db-import-response success döndürür
  4) Başarı durumunda metadata kullanıcıya iletilir

---

49. Sayfa/Bileşen Bazlı Performans Bütçeleri
- POSPage
  - Initial render ≤ 150ms (prod build)
  - Ürün ekleme → sepet güncelleme ≤ 16ms (tek frame)
  - Barkod okuma → sepet güncelleme ≤ 50ms
- SettingsPage (sekme bazlı lazy load önerilir)
  - İlk sekme render ≤ 200ms, diğer sekmeler dinamik import
- DashboardPage
  - Ağır grafikler lazy ve memoize; ilk anlamlı içerik ≤ 300ms; etkileşimde 60fps
- Genel
  - Ağır listelerde virtualization; gereksiz re-render’ları React.memo + seçici props ile kısıtlayın

---

50. Modül Bazlı Test Checklist
- POS Akışı
  - Sepete ekle/çıkar/güncelle; indirim türleri; ödeme nakit/kart; fiş no formatı
- Ürün Yönetimi
  - Barkod benzersizliği; kategori CRUD; grup ekleme/silme; default grup kısıtları
- Yedekleme
  - create-backup-bridge success/fail; backup-progress olayları; schedule/disable
  - restore-backup-bridge handshake; bozuk içerikte hata akışı
- Güncelleyici
  - update-status akışları; progress eventleri; downloaded sonrası quit-and-install tetiklemesi (simülasyon kanalları ile)
- Raporlama
  - Excel export sayfaları ve toplam satırları; boş veri mesajı

---

51. Güvenlik ve Gizlilik Derinleştirme
- Preload sınırı: Renderer’ın Node API’lerine doğrudan erişimi yoktur; yalnız expose edilen API’leri kullanın.
- Şifreleme: encryptionService ile veriler { data: <cipher> } olarak saklanır; anahtar yönetimi makineye bağlıdır (node-machine-id). Anahtar değerini hiçbir yerde loglamayın.
- Yayın: GH_TOKEN’ı sadece ortam değişkeni olarak sağlayın; kod/commit içinde yer vermeyin.
- Dosya Erişimleri: Yedek dosyaları kullanıcı seçimi ile yazın/okuyun; path hardcode etmeyin.
- XSS/İçerik: UI tarafında dış girdileri sanitize edin (DOMPurify kullanımı projede mevcut).

---

52. Sayfa/Bileşen Etkileşim Diyagramları (Metinsel)
POS Akışı (Yüksek Seviye)
```text path=null start=null
Kullanıcı → ProductPanel: Ürün seç/ara/barkod
ProductPanel → useCart: addItem(product)
useCart → CartPanel: items, totals (state)
Kullanıcı → PaymentControls: ödeme yöntemi/indirim gir
PaymentControls → salesDB.addSale(): satış kaydı oluştur
salesDB → receiptService.generatePDF(): fiş oluştur
salesDB → productService.updateStock(): stok düş
```

Yedekleme/Geri Yükleme
```text path=null start=null
Renderer (backupAPI.createBackup) → Main (create-backup-bridge)
Main → createSmartBackup → backupManager/optimizedBackupManager
Main → Renderer: backup-progress (event)
Main → Renderer: sonuç (success + metadata)

Renderer (backupAPI.restoreBackup) → Main (restore-backup-bridge)
Main → deserialize → base64(JSON)
Main → Renderer: db-import-base64 (event)
Renderer → IndexedDBImporter: yaz
Renderer → Main: db-import-response { success }
```

Güncelleyici
```text path=null start=null
Renderer (checkForUpdates) → Main (autoUpdater)
Main → Renderer: update-status/update-progress/update-downloaded
Renderer (quit-and-install) → Main (quitAndInstall)
```

---

53. IndexedDB Migration Kod Örneği (Illustratif)
```ts path=null start=null
import { openDB, IDBPDatabase } from 'idb'

interface ProductV2 { id: number; name: string; barcode?: string; categoryId?: number }

async function openPosDB(): Promise<IDBPDatabase> {
  return openDB('posDB', 3, { // ← versiyon artırıldı
    upgrade(db, oldVersion, newVersion, tx) {
      // v1 → v2: products store'a 'barcode' index'i ekle
      if (oldVersion < 2) {
        const store = db.objectStoreNames.contains('products')
          ? tx.objectStore('products')
          : db.createObjectStore('products', { keyPath: 'id', autoIncrement: true })
        if (!store.indexNames.contains('barcode')) {
          store.createIndex('barcode', 'barcode', { unique: false })
        }
      }
      // v2 → v3: categories store ekle ve product.category → categoryId geçişi (kopyala-yarat)
      if (oldVersion < 3) {
        const categories = db.objectStoreNames.contains('categories')
          ? tx.objectStore('categories')
          : db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true })

        // Kopyala-yarat deseni (özet):
        const temp = db.createObjectStore('products_v2', { keyPath: 'id' })
        const products = tx.objectStore('products')
        // Not: idb API ile cursor dönüp tek tek dönüştürülür (illustratif)
        products.getAll().then(rows => {
          rows.forEach((p: any) => {
            const p2: ProductV2 = { id: p.id, name: p.name, barcode: p.barcode, categoryId: undefined }
            temp.add(p2)
          })
        })
        // Eski store'u kaldırıp yenisini kalıcı isimle oluşturmak için bir sonraki yükseltmede taşınabilir
      }
    }
  })
}
```

Not: Gerçek migration’lar mevcut schema ve veri yüküne göre aşamalı uygulanmalı; büyük veri setlerinde streaming/partisyon yaklaşımı tercih edin.

---

54. Performans Profilleme Rehberi (Uygulamalı)
- Üretim Benzeri Profil:
  1) npm run build
  2) npm run preview (Vite preview)
  3) Tarayıcı DevTools → Performance: kayıt başlat, POS/Settings/Dashboard etkileşimi yap, kayıt durdur
  4) Uzun görevleri (>50ms) ve re-render dalgalarını işaretleyin
- React Profiler:
  1) React DevTools (Profiler) → “Record”
  2) Ağır komponentleri bulun (render süresi/commit sayısı)
  3) Memoization fırsatlarını belirleyin
- Hızlı Ölçüm (Kod içi):
```ts path=null start=null
console.time('addSale')
await salesDB.addSale(someSale)
console.timeEnd('addSale')
```
- Ağ İzleme: Ağır export/import işlemlerinde kullanıcıya progress sağlayın (mevcut backup-progress olayları gibi).

---

55. Test Dizin Stratejisi ve İsimlendirme
- Birim testleri: src/test/*.test.ts(x) (utils, services, hooks)
- Bileşen testleri: src/test/*.test.tsx (RTL + jsdom)
- İsimlendirme: türkçe ve açıklayıcı; “<modül> davranışı” şeklinde
- Örnek iskelet:
```ts path=null start=null
describe('satış özeti', () => {
  it('tarih aralığında toplamları doğru hesaplamalı', async () => {
    // arrange: mock sales
    // act: getSalesSummary
    // assert: totals
  })
})
```

---

56. Hata Senaryoları Matrisi (Özet)
- Ürün ekle (barkod çakışması) → ValidationError | kullanıcıya uyarı
- Kategori sil (kullanımda) → kullanılma durumunda ürünleri ‘Genel’e taşı, sonra sil
- Yedek geri yükleme (bozuk içerik) → error: mesaj + işlem iptali
- Güncelleme (ağ hatası) → update-status: error ve kullanıcıya bildirim
- Şema tutarsızlığı → db_force_reset işareti + bir sonraki açılışta reset

---

57. Build/Yayın Notları (Platform Spesifik)
- Windows: NSIS installer ve portable hedefleri; simge: public/icon.ico
- macOS: dmg/zip hedefleri; simge: public/icon.icns; yalnız macOS ortamında imzalama/notarization gerekebilir
- asarUnpack: better-sqlite3 paketinin çalışması için unpack listesine ekli
- GitHub Private Release: publish alanında repo/owner tanımlı; GH_TOKEN zorunlu

---

58. Periyodik Bakım Listesi
- Yedekleme otomasyonunu doğrula (schedule etkin mi)
- IndexedDB sürümlerini gözden geçir; migration gerekirse planla
- Bağımlılık güncellemeleri: electron, vite, vitest, eslint, tailwind
- Performans profillerini periyodik al; regression gözle
- Test coverage raporlarını izle; kritik modüllerde ≥%95

---

59. Ek Kaynaklar ve İzleme
- Kod içi TODO/FIXME taraması yaparak borçları topla
- TEMIZLIK-RAPORU.md’deki maddeleri sprint planına al
- BILESEN-BOLME-PLANI.md hedeflerini parça parça tamamla
- KOMUT-REHBERI.md’yi süreç içinde güncel tut (komut veya mimari değişirse)

---

60. Son Söz
Bu teknik kitap, RoxoePOS içinde hızlı on-boarding ve üretkenlik için hazırlanmıştır. Değişiklik yaptıkça güncelleyerek “tek kaynak” halini koruyun. İhtiyaç halinde bölüm bazlı daha da derinleştirilebilir (ör. her bileşen için giriş/çıkış şemaları veya ayrıntılı test planları). 
Güvenlik notları için ilgili derin bölüme başvurun (Bölüm 21: Güvenlik, Gizlilik ve Yayın Notları).

---

61. Yerel Doğrulama ve Opsiyonel CI/CD (GitHub Actions örnekleri)
Not: Bu projede Git/GitHub kullanılmıyorsa bu bölüm opsiyoneldir; yerel doğrulama komutları (validate:all, test, build) yeterlidir.
Temel Doğrulama (lint, type-check, test, build)
```yaml path=null start=null
name: ci
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Install
        run: |
          cd client
          npm ci
      - name: Lint
        run: |
          cd client
          npm run lint
      - name: Type Check
        run: |
          cd client
          npm run type-check
      - name: Test (Coverage)
        run: |
          cd client
          npm run test:coverage
      - name: Build
        run: |
          cd client
          npm run build
```

Release (isteğe bağlı, GH_TOKEN gerektirir)
```yaml path=null start=null
name: release
on:
  workflow_dispatch:
jobs:
  publish-win:
    runs-on: windows-latest
    env:
      GH_TOKEN: ${{ secrets.GH_TOKEN }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Install
        run: |
          cd client
          npm ci
      - name: Build Windows
        run: |
          cd client
          npm run build:win
      - name: Publish Windows
        run: |
          cd client
          npm run publish:win
```

Not: macOS paketleme sadece macOS runner’da yapılmalıdır.

---

62. Veri Akış Diyagramları (UML - Metinsel)
Component Diagram (Özet)
```text path=null start=null
[Renderer (React)] --IPC--> [Preload (contextBridge)] --IPC--> [Main (Electron)]
[Renderer] --idb--> [IndexedDB]
[Main] --fs--> [File System]
[Services in Renderer] --idb--> [posDB, salesDB]
[Backup Core in Main] --fs--> [Backup Files]
```

Sequence (Satış)
```text path=null start=null
User -> ProductPanel: ürün seç
ProductPanel -> useCart: addItem(product)
User -> PaymentControls: ödeme + indirim
PaymentControls -> salesDB: addSale(sale)
salesDB -> receiptService: generatePDF(receipt)
receiptService -> User: indirilebilir PDF
```

Sequence (Yedekleme)
```text path=null start=null
Renderer -> Main: create-backup-bridge(options)
Main -> BackupCore: createSmartBackup()
BackupCore -> Main: progress(stage, %)
Main -> Renderer: backup-progress
Main -> Renderer: result(success, metadata)
```

---

63. Error Handling & Logging Standardı
Log Seviyeleri
- error: Uygulama çalışmasını etkileyen hatalar
- warn: Olağan dışı ancak toleranslı durumlar
- info: İş akışı adımları (kritik olmayan)
- debug: Geliştirme sırasında detaylar (production’da sınırlı)

Kod Örneği
```ts path=null start=null
import log from 'electron-log'

export function handleError(err: unknown, context: string) {
  const msg = err instanceof Error ? err.message : String(err)
  log.error(`[${context}] ${msg}`)
  // TODO: NotificationContext üzerinden kullanıcıya bildirim göster
}

export class ImportExportError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ImportExportError'
  }
}
```

---

64. Servis API Referansı (Özet)
productService (productDB.ts)
- getAllProducts(): Promise<Product[]>
- getProduct(id: number): Promise<Product | undefined>
- addProduct(product: Omit<Product, 'id'>): Promise<number>
  - Hata: barkod çakışmasında Error
- updateProduct(product: Product): Promise<void>
- deleteProduct(id: number): Promise<void>
- getCategories(): Promise<Category[]>
- addCategory(category: Omit<Category, 'id'>): Promise<number>
  - Hata: kategori adı çakışırsa Error
- updateCategory(category: Category): Promise<void>
- deleteCategory(id: number): Promise<void>
- updateStock(id: number, qty: number): Promise<void>
- bulkInsertProducts(products: Product[]): Promise<void>
- getProductGroups(): Promise<ProductGroup[]>
- addProductGroup(name: string): Promise<ProductGroup>
- updateProductGroup(group: ProductGroup): Promise<void>
- deleteProductGroup(id: number): Promise<void>
- addProductToGroup(groupId: number, productId: number): Promise<void>
- removeProductFromGroup(groupId: number, productId: number): Promise<void>
- getGroupProducts(groupId: number): Promise<number[]>

salesDB (SalesService)
- addSale(sale: Omit<Sale, 'id'>): Promise<Sale>
- getAllSales(): Promise<Sale[]>
- getSalesWithFilter(filter): Promise<Sale[]>
- getSaleById(id: string): Promise<Sale | null>
- updateSale(id: string, updates: Partial<Sale>): Promise<Sale | null>
- cancelSale(id: string, reason: string): Promise<Sale | null>
- refundSale(id: string, reason: string): Promise<Sale | null>
- getDailySales(date?: Date): Promise<Sale[]>
- applyDiscount(sale: Sale, type: 'percentage' | 'amount', value: number): Sale
- getSalesSummary(start: Date, end: Date): Promise<Summary>
- generateReceiptNo(): string

receiptService
- generatePDF(receipt: ReceiptInfo): Promise<void>
- printReceipt(receipt: ReceiptInfo): Promise<boolean>
- checkPrinterStatus(): Promise<boolean>

importExportService / exportSevices
- exportToExcel(products: Product[], fileName?: string): Promise<void>
- exportToCSV(products: Product[], fileName?: string): void
- generateTemplate(type?: 'excel'|'csv'): Promise<void>
- exportCashDataToExcel(data: CashExportData, title: string): Promise<boolean>

encryptionService (özet)
- encrypt<T>(data: T): string
- decrypt<T>(cipher: string): T

Hata Tipleri (örnek)
- ValidationError, ImportExportError, DatabaseError, BackupError

---

65. E2E Test Planı (Playwright)
Strateji
- Renderer UI’yi web önizleme modunda test etmek (npm run preview) + preload/IPC davranışlarını stub’lamak
- Kritik akışlar: POS satış, ürün ekleme, yedekleme butonu akışı (yalancı başarı), güncelleme bildirimi simülasyonu

Örnek Senaryo (POS Satış Akışı)
```ts path=null start=null
import { test, expect } from '@playwright/test'

test('POS satış akışı', async ({ page }) => {
  await page.goto('http://localhost:4173') // preview
  await page.getByPlaceholder('Ürün ara').fill('Çikolata')
  await page.getByText('Ekle').first().click()
  await page.getByRole('button', { name: 'Ödeme' }).click()
  await page.getByRole('button', { name: 'Nakit' }).click()
  await expect(page.getByText('Satış tamamlandı')).toBeVisible()
})
```

Not: Electron ile tam entegrasyon için Playwright Electron runner (deneysel) veya resmi Electron Testing Library araştırılabilir. Basitleştirilmiş yaklaşımda IPC çağrıları mock’lanır.

---

66. UI/UX Guideline & Accessibility Check
- Klavye erişilebilirliği: Tüm etkileşimli öğeler Tab sırası içinde, Enter/Space ile tetiklenebilir
- Odak görünürlüğü: :focus-visible stilleri; Tailwind ile ring kullanımı
- Kontrast: Metin/arka plan en az 4.5:1
- ARIA: Buton/ikonlara uygun rol ve label; modal’larda aria-modal, role=dialog, odak tuzağı
- Okunabilirlik: Maks satır uzunluğu ~80-100, yeterli satır aralığı
- Dil/yerelleştirme: lang='tr', tarih/sayı biçimleri tr-TR
- Hata mesajları: Açıklayıcı, kullanıcıyı yönlendiren metinler; inline ve toast

---

67. Security Appendix
- Şifreleme: AES-256 (crypto-js) + HMAC-SHA256 önerilir; anahtar üretimi machine-id ile türetme (salt+KDF)
- Lisanslama: serial + machineId eşlemesi, electron-store’da şifreli saklama; geçerlilik kontrolü ve reset
- Electron Güvenliği: contextIsolation:true (ana pencere için), nodeIntegration:false; preload sınırlı API; CSP (mümkünse)
- OWASP Checklist (özet):
  - Girdi doğrulama/sanitize (DOMPurify)
  - Kimlik bilgilerinin/secret’ların saklanmaması
  - Yetkisiz erişim yollarının kapatılması (IPC kanal beyaz listesi)
  - Güncel bağımlılıklar ve imzalı yayınlar
  - Loglarda kişisel/veri sızıntısı olmaması

---

68. Release Policy
- SemVer: MAJOR.MINOR.PATCH
- Changelog: Conventional Commits’ten üretim (ör. conventional-changelog veya changesets)
- Kanallar: main → release (manual trigger)
- Rollback: Son stabil sürüm installer’ı tutulur; autoUpdater.allowDowngrade=false ise manuel kurulum ile geri alma
- Etiketleme: v0.5.3, v0.5.4 …

---

69. Genişletilmiş Kod Örnekleri
Ürün Ekleme (Barkod Benzersizliği)
```ts path=null start=null
async function addProductSafe(p: Omit<Product, 'id'>) {
  try {
    const id = await productService.addProduct(p)
    return id
  } catch (err) {
    // Barkod çakışması vb.
    throw new Error('Ürün eklenemedi: ' + (err as Error).message)
  }
}
```

İndirimli Satış Oluşturma
```ts path=null start=null
async function createDiscountedSale(sale: Omit<Sale, 'id'>, discountPct: number) {
  const withDiscount = salesDB.applyDiscount(sale as Sale, 'percentage', discountPct)
  const saved = await salesDB.addSale(withDiscount)
  return saved
}
```

Yedekleme Başlat & İlerleme Dinleme
```ts path=null start=null
window.backupAPI.onBackupProgress(({ stage, progress }) => {
  console.log(`[Backup] ${stage}: ${progress}%`)
})

const result = await window.backupAPI.createBackup({ description: 'Elle yedek' })
if (!result.success) {
  throw new Error('Yedekleme başarısız: ' + result.error)
}
```

---

70. Genişletilmiş Sözlük (Glossary)
- Veresiye: Müşterinin ürün/hizmeti daha sonra ödeme taahhüdüyle alması (kredi)
- Kasa Oturumu: Kasa aç/kapat aralığı; nakit giriş/çıkışlar bu oturumda izlenir
- Barkod: Ürünü tekil tanımlayan kod; benzersizlik iş kuralı
- Fiş No: Satış kaydının benzersiz referansı (örn. FYYYYMMDD-RANDOM)
- Delta Güncelleme: Tam paketin değil, değişen kısımların indirildiği güncelleme yöntemi
- Streaming Backup: Verinin parça parça serileştirilerek aktarılması

---

71. Görsel Diyagramlar (Mermaid)
- Dosya: docs/DIYAGRAMLAR.md
- İçerik: Component diyagramı, Satış ve Yedekleme sequence’ları, Geri yükleme flowchart’ı.
- Not: GitHub ve birçok Markdown görüntüleyicide mermaid blokları otomatik render edilir.

---

72. Onboarding Tutorial (10 Dakika)
- Dosya: docs/ONBOARDING-10-DAKIKADA-ROXOEPOS.md
- İçerik: Windows/PowerShell için 8 adımda kurulum, kalite kontrolleri ve paketleme.

---

73. Gerçek Senaryolar (Case Studies)
- Kurulum: docs/case-studies/kurulum.md — Derleme, ilk ayarlar, ilk satış, paketleme.
- Yedekleme/Geri Yükleme Testi: docs/case-studies/yedekleme-geri-yukleme-testi.md — UI ve programatik örneklerle test.
- Cihaz Değişimi/Migrasyon: docs/case-studies/cihaz-degisimi-migrasyon.md — Eski cihazdan yeni cihaza veri taşıma.
- İlk Ürün Yükleme (Excel/CSV): docs/case-studies/ilk-urun-yukleme-excel.md — Şablon, içe aktarma ve doğrulama ipuçları.

---

74. Operasyon & Monitoring
- Dosya: docs/OPERASYON-IZLEME.md
- İçerik: Log toplama, performans dashboard, merkezi hata yönetimi, Sentry entegrasyon planı, alarm kuralları.

---

75. Future Vision
- Dosya: docs/GELECEK-VIZYONU.md
- İçerik: Cloud sync, mobil entegrasyon, AI öneri sistemi, eklenti mimarisi ve SLO’lar.

---
