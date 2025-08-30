# KOMUT REHBERİ

Bu depo ile terminalde verimli çalışmak için kısa, Türkçe bir rehber.

## Depo Genel Bakış

- Proje kökü: bu klasör. Aktif uygulama alt klasörde: `client/`
- Tüm geliştirme komutları `client/` dizininde çalıştırılmalıdır.
- Teknoloji: React + TypeScript + Vite + Electron (electron-builder), Tailwind CSS, Vitest + React Testing Library.
- Yol alias: `@/` → `client/src`

## Sık Kullanılan Komutlar (client/ içinde)

Ön hazırlık

- `cd client`
- `npm install`
- (Gerekirse) husky hazırlığı: `npm run prepare`

Geliştirme ve Build

- Geliştirme: `npm run dev`
- Web önizleme (build sonrası): `npm run preview`
- Tip kontrol: `npm run type-check`
- Production build + paketleme (genel): `npm run build`
- Yalnız Windows paketleme: `npm run build:win`
- Yalnız macOS paketleme: `npm run build:mac`
- Tüm platformlar (yapılandırmaya bağlı): `npm run build:all`
- Yayın (GH Releases, GH_TOKEN gerekir): `npm run publish`, `npm run publish:win`, `npm run publish:mac`

Lint ve Format

- Lint: `npm run lint`
- Lint (otomatik düzelt): `npm run lint:fix`
- Prettier yaz: `npm run format`
- Prettier kontrol: `npm run format:check`

Testler (Vitest/Playwright)

- Testleri çalıştır: `npm run test`
- İzleme modunda: `npm run test:watch`
- Sadece koş (no watch): `npm run test:run`
- UI ile çalıştır: `npm run test:ui`
- Kapsam raporu: `npm run test:coverage`
- Birim testleri: `npm run test:unit`
- Entegrasyon testleri: `npm run test:integration`
- Performans testleri: `npm run test:performance`
- E2E testleri: `npm run test:e2e` veya `npm run e2e`
  - Tek E2E dosyası: `npm run e2e -- e2e/pos-sale-flow.spec.ts`
  - Başlık filtresi: `npm run e2e -- -g "POS satış akışı"`
  - Headed/Debug: `npm run e2e -- --headed -g "POS"` veya `PWDEBUG=1 npm run e2e -- e2e/diagnostics.spec.ts`
- Kritik kapsam (≥%95): `npm run test:critical`
  - Eşik özelleştirme: `MIN_CRITICAL_COVERAGE=97 npm run test:critical`
- Tek test dosyası: `npm run test -- src/test/Button.test.tsx`
- İsim filtresiyle tek test: `npm run test -- -t "başlık parçası"`

Not: Playwright E2E, Vite preview sunucusunu otomatik başlatır (baseURL: http://localhost:4173). Test ortamında NODE_ENV=test, VITE_LICENSE_BYPASS=true, VITE_ADMIN_MODE=true, VITE_E2E_MODE=true bayrakları set edilir.

Notlar

- Electron publish işlemleri için GH_TOKEN ortam değişkeni gerekir (private GitHub release yapılandırması mevcut).
- macOS hedefleri yalnızca macOS ortamında paketlenebilir.

## Mimari ve Yapı (Özet)

Katmanlar

- Electron Main: `client/electron/main.ts`
  - Güncellemeler: `electron-updater` (GitHub releases); durumları IPC ile renderer’a iletir.
  - Yedekleme köprüsü: `create-backup-bridge`, `restore-backup-bridge` vb.
  - Yaşam döngüsü, kapanışta yedekleme koordinasyonu, menü/devtools.
- Preload (Güvenli API): `client/electron/preload.ts`
  - Expose edilen window API’leri:
    - `appInfo.getVersion()`
    - `ipcRenderer` proxy (on/off/send/invoke)
    - `updaterAPI` (checkForUpdates, onUpdate..., test*)
    - `backupAPI` (create/restore/read/history/schedule/disable/set-get dir, on/off progress)
    - `serialAPI` (requestPort, getPorts)
    - `indexedDBAPI` (db-export-request/db-import-request)
- Renderer (React): `client/src`
  - Sayfalar: `src/pages` (POS, Settings, Dashboard, Products, SalesHistory, CashRegister)
  - Bileşenler: `src/components` (ui/, modals/, dashboard/, pos/, cashregister/, settings/)
  - Servisler: `src/services` (dbService, productDB, salesDB, encryptionService, exportSevices, importExportServices, PerformanceMonitor, IndexOptimizer, vb.)
  - Backup: `src/backup/*` (core, database, scheduler, utils)
  - Tipler: `src/types` (pos, product, sales, receipt, vb.)
  - Utils: `src/utils` (eventBus, number/türkçe arama, dashboard istatistikleri, vb.)

Derleme ve Konfigürasyon

- Vite: `client/vite.config.ts` (electron/main/preload girişleri, sourcemap)
- TS: `client/tsconfig.json` (strict)
- ESLint: `client/eslint.config.js` (TS, React, hooks, refresh)
- Prettier: `client/.prettierrc`
- Tailwind: `client/tailwind.config.js` (darkMode: class; animate)
- Electron Builder: `client/package.json` build alanı (appId, target’lar, asarUnpack: better-sqlite3)

Veri & Kalıcılık

- IndexedDB (idb)
- `electron-store` + makine kimliği ile ayar/lisans
- Yedekleme: streaming ve optimize strateji; dizin seçimi/schedule IPC ile

Test Altyapısı

- Vitest + jsdom + React Testing Library
- Global setup: `client/src/test/setup.ts` (ResizeObserver, IPC, storage, idb mock)
- Kapsam: `text`, `json`, `html`; thresholds global ≥%80; kritik dosyalara ≥%95 satır (bkz: `client/scripts/check-coverage.js`)

Önemli Belgeler

- `README.md`: Kurulum, özellikler, mimari, sorun giderme
- `docs/roxoepos-technical-book.md`: Kapsamlı teknik kitap
- `docs/changelog.md`: Değişiklik günlüğü
- `docs/diagrams.md`: Mermaid diyagramlar
- `docs/onboarding-10-minutes-roxoepos.md`: 10 dakikada başlangıç
- `docs/operations-monitoring.md`: Operasyon ve monitoring
- `component-splitting-plan.md`: Büyük bileşenleri bölme planı
- `cleanup-report.md`: Temizlik/iyileştirme raporları (İyileştirme Özeti entegre)
- Yeni eklenenler: `docs/status.md`, `docs/modules.md`, `docs/api.md`, `docs/components.md`, `docs/performance-overview.md`, `docs/test-coverage.md`

Operasyonel İpuçları

- Komutları her zaman `client/` dizininde çalıştırın
- Tekil test için dosya/başlık filtreleme kullanın
- Publish öncesi `GH_TOKEN` ortam değişkenini ayarlayın
- Her değişiklik sonrası dokümanları güncel tutun (Kurallar gereği Türkçe içerik)
