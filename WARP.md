# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

# WARP.md – RoxoePOS Hızlı Komutlar ve Operasyon Rehberi

Not: Aşağıdaki tüm komutlar depo kök dizininden çalıştırılmak üzere, --prefix client ile yazılmıştır.

1) Yaygın Komutlar

- Kurulum
```bash path=null start=null
npm --prefix client install
```

- Geliştirme
```bash path=null start=null
npm run dev --prefix client
```

- Önizleme (Vite preview)
```bash path=null start=null
npm run preview --prefix client
```

- Testler (Unit / Integration / Performance)
```bash path=null start=null
npm run test --prefix client
npm run test:coverage --prefix client
npm run test:watch --prefix client
npm run test:unit --prefix client
npm run test:integration --prefix client
npm run test:performance --prefix client
npm run test:critical --prefix client   # kritik dosyalar ≥ %95 satır kapsamı
```

- Tek test çalıştırma (örnekler)
```bash path=null start=null
# Tek dosya (Vitest)
npm run test:run --prefix client -- src/utils/turkishSearch.test.ts

# Tek test ismi (pattern ile)
npm run test:run --prefix client -- -t "pozitif sayıları doğru formatlamalı"

# Tek E2E dosyası (Playwright)
npm run e2e --prefix client -- e2e/pos-sale-flow.spec.ts

# E2E: belirli satır
npm run e2e --prefix client -- e2e/pos-sale-flow.spec.ts:45

# E2E: isim ile filtre
npm run e2e --prefix client -- -g "POS sale flow"
```

- E2E (tam suite)
```bash path=null start=null
npm run e2e --prefix client
npm run test:e2e --prefix client
npm run e2e:ci --prefix client
```

- Lint, Format, Tip Kontrol
```bash path=null start=null
npm run lint --prefix client
npm run lint:fix --prefix client
npm run format:check --prefix client
npm run format --prefix client
npm run type-check --prefix client
```

- JSON Şema Doğrulama (AJV)
```bash path=null start=null
npm run validate:schemas --prefix client
npm run validate:samples --prefix client
npm run validate:all --prefix client
```

- Build ve Yayın
```bash path=null start=null
npm run build --prefix client
npm run build:win --prefix client
npm run build:mac --prefix client
npm run build:all --prefix client
npm run publish --prefix client
npm run publish:win --prefix client
npm run publish:mac --prefix client
```

2) Mimari Genel Bakış (Büyük Resim)

- Süreçler ve Katmanlar
  - Electron Main (client/electron/main.ts):
    - Otomatik güncelleme: electron-updater (GitHub Releases feed; GH_TOKEN ile yapılandırılır)
    - Loglama: electron-log
    - İsteğe bağlı hata izleme: SENTRY_DSN varsa @sentry/electron
    - Yedekleme entegrasyonu: backupManager, optimizedBackupManager, createSmartBackup
    - Lisans/serial IPC elçileri: client/electron/license.ts
  - Preload (client/electron/preload.ts):
    - contextBridge ile güvenli API yüzeyi sağlar: 
      - appInfo (getVersion)
      - sentry (dsn)
      - ipcRenderer proxy (on/off/send/invoke)
      - serialAPI (Web Serial)
      - updaterAPI (güncelleme olayları + test yardımcıları)
      - backupAPI (backup oluştur/geri yükle/dosya/planlama/ilerleme)
      - indexedDBAPI (içe/dışa aktarım istek köprüsü)
  - Renderer (React 18 + TS 5.8 + Vite 6):
    - Stil/UI: Tailwind, shadcn/ui, lucide-react
    - Electron entegrasyonu: vite-plugin-electron/simple (main/preload build ve renderer polyfill’leri)

- Veri ve Servis Katmanı
  - Kalıcı veri: IndexedDB (idb) — ana depolama
  - Ayarlar/lisans: electron-store
  - Servisler: client/src/services/* (ör. productDB.ts, salesDB.ts, receiptService.ts)
  - Yedekleme altyapısı: client/src/backup/*
    - OptimizedBackupManager ve Streaming* bileşenleri (büyük veri için parça parça işleme)

- IPC Sözleşmeleri (özet, ayrıntı: docs/api.md)
  - Güncelleme: check-for-updates, update-available/progress/downloaded/status/error, quit-and-install
  - Uygulama Bilgisi: get-app-version
  - Yedekleme: create-backup-bridge, restore-backup-bridge, get-backup-history, read-backup-file, schedule-backup/disable-scheduled-backup, backup-progress
  - Kapanış koordinasyonu: app-close-requested, confirm-app-close
  - Lisans/Seri: check-serial, activate-serial, get-serial-info, reset-serial

- Önemli Mimari Kararlar (ADR)
  - IndexedDB tercih edildi (offline-first, web standartları) — docs/adr/0001-indexeddb.md
  - Güncellemeler electron-updater ile — docs/adr/0002-electron-updater.md
  - Yedekleme stratejisi optimize/streaming — docs/adr/0003-backup-strategy.md
  - Büyük listelerde react-window sanallaştırma — docs/adr/0004-virtualized-lists.md
  - Cihaz bazlı anahtar + AES/HMAC şifreleme — docs/adr/0005-encryption-keys.md

- Alan Bazlı Önemli Hook’lar
  - usePaymentFlow, useRegisterStatus, useSettingsPage — akışlar tek yerde merkezileştirilir (bkz. client/src/pages/*/hooks)

3) Test Stratejisi ve Raporlar

- Vitest (client/vitest.config.ts)
  - Ortam: jsdom, globals: true, setupFiles: src/test/setup.ts
  - Coverage: v8 provider; text/json/html (client/coverage/)
  - Eşikler (global): branches/functions/lines/statements ≥ %80
  - Kritik eşik: npm run test:critical (client/scripts/check-coverage.js) — belirlenmiş dosyalar için ≥ %95 satır kapsamı (docs/test-coverage.md)

- Playwright (client/playwright.config.ts)
  - testDir: client/e2e
  - baseURL: http://localhost:4173
  - webServer: npm run preview (otomatik başlatılır)
  - env: NODE_ENV=test, VITE_LICENSE_BYPASS=true, VITE_ADMIN_MODE=true, VITE_E2E_MODE=true
  - trace: on-first-retry, video: retain-on-failure

- Raporlara Erişim
  - Unit/Integration/Performance coverage HTML: client/coverage/index.html
  - Playwright raporları: playwright-report ve test-results klasörleri

4) Build ve Yayın (electron-builder)

- Yapılandırma (client/package.json > build)
  - appId: com.roxoepos.app, productName: RoxoePOS
  - Dosyalar: dist, dist-electron
  - Yayın: GitHub provider (private repo) — GH_TOKEN ortam değişkeni gerekir
  - electronDownload.arch: x64

- Hedefler
  - Windows: nsis (oneClick=false) ve portable
  - macOS: dmg ve zip (x64)

- Artifact İsimleri
  - NSIS: RoxoePOS-Setup-${version}.${ext}
  - Portable: RoxoePOS-Portable-${version}.${ext}
  - DMG: RoxoePOS-Installer-${version}.${ext}
  - macOS zip: RoxoePOS-Mac-${version}.zip

- Özel Notlar
  - asarUnpack: node_modules/better-sqlite3
  - compression: normal
  - Auto-update: main.ts içinde setFeedURL; GH_TOKEN varsa GitHub feed etkin
  - Sentry isteğe bağlı (SENTRY_DSN)

5) Faydalı Referanslar

- Genel
  - README.md
  - client/README.md

- API & Mimari
  - docs/api.md
  - docs/adr/0001-indexeddb.md

- Test Politikası
  - docs/test-coverage.md

- Yapılandırma Dosyaları
  - client/vite.config.ts
  - client/vitest.config.ts
  - client/playwright.config.ts
  - client/electron/main.ts
  - client/electron/preload.ts

