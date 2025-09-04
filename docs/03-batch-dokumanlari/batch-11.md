# Batch 11 — Yapı ve Konfigürasyon (Build & Config)

Son Güncelleme: 2025-08-27
Sürüm: 0.5.3

Hedef Metrikler (Özet, P95)
- Geliştirme sunucusu (Vite) ilk derleme: ≤ 5 s
- Tip kontrolü (type-check): ≤ 10 s (tüm proje)
- Lint (ESLint): ≤ 8 s (değişen dosyalar)
- Test (Vitest, unit): ≤ 10 s (soğuk); watch modunda ilk çalıştırma ≤ 5 s
- Prod build: ≤ 30 s; paket boyutu kontrollü (tree-shaking, code-splitting)
- Pre-commit hook süresi: ≤ 5 s (yalnızca staged dosyalar)

Tam liste hedefler: docs/performance/measurement-guide.md

---

Bu belge, RoxoePOS projesindeki yapı ve konfigürasyon dosyalarını özetler. Amaç; her dosyanın rolünü, nerede devreye girdiğini ve iyileştirme önerilerini görünür kılmaktır.

11.1 package.json (kök)
- Amaç: Monorepo/proje kökü komutları, sürümler ve script delegasyonu.
- Öneriler:
  - Scriptlerde güvenli ortam değişkeni kullanımı; sırları ekrana yazdırmayın.
  - Ortak script’leri client altına delege edin (örn. "--prefix client").

11.2 client/package.json
- Amaç: Uygulama bağımlılıkları ve script’ler (dev/build/test/lint/type-check).
- Öneriler:
  - Üretim bağımlılıkları ile geliştirme bağımlılıklarını net ayırın.
  - test:critical gibi gate script’leri CI’da koşullandırın.

11.3 client/vite.config.ts
- Amaç: Vite geliştirme sunucusu ve derleme ayarları.
- Öneriler:
  - Alias/path kısayollarını tsconfig ile uyumlu tanımlayın.
  - Code-splitting ve dynamic import ile büyük sayfaları bölün.
  - Sourcemap (prod) sadece gerekliyse etkinleştirin (boyut/hız dengesi).

11.4 client/vitest.config.ts
- Amaç: Vitest yapılandırması (test dosya eşleşmeleri, globals, jsdom/node ortamları).
- Öneriler:
  - testTimeout ve coverage eşiklerini proje politikası ile hizalayın.
  - UI testlerinde jsdom, servis testlerinde node ortamını seçin.

11.5 client/tsconfig.json ve client/tsconfig.node.json
- Amaç: TypeScript hedef/kitaplık ayarları ve modül çözümlemesi.
- Öneriler:
  - strict: true; isolatedModules ve noUncheckedIndexedAccess gibi güvenlik ayarları.
  - paths ile alias kullanımı; Vite ve ESLint ile tutarlılık.

11.6 client/eslint.config.js
- Amaç: Kod kalitesi kuralları.
- Öneriler:
  - TypeScript ve React kurallarını etkin tutun; import sıralaması ve unused import/var kontrolü.
  - Performans odaklı kurallar: hooks exhaustive-deps uyarılarını ele alın.

11.7 client/.prettierrc ve client/.prettierignore
- Amaç: Kod biçimlendirme kuralları.
- Öneriler:
  - Ekip standardı ile uyumlu hale getirin; format-on-save (IDE) önerin.

11.8 client/.gitignore
- Amaç: Gereksiz dosyaları repodan hariç tutma.
- Öneriler:
  - build/artifacts, node_modules, coverage, temp/backup gibi klasörleri kapsayın.

11.9 client/.husky/pre-commit
- Amaç: Commit öncesi kalite kontrolleri (lint, type-check, test:staged gibi).
- Öneriler:
  - Sadece staged dosyalara lint/format çalıştırın; süre ≤ 5 s hedefleyin.
  - Gerekirse CI gate’lerine bırakın (ağır işlemler pre-commit yerine CI’da).

11.10 client/postcss.config.js ve client/tailwind.config.js
- Amaç: CSS işleme ve utility sınıfları.
- Öneriler:
  - Tailwind purge/content kapsamını doğru tanımlayın (dinamik sınıf riskine dikkat).
  - Üretimde minify ve autoprefixer etkin olsun.

11.11 client/index.html
- Amaç: Vite giriş HTML’i (meta, favicon, temel container).
- Öneriler:
  - Meta charset/lang ve viewport doğru ayarlansın; ikonlar public’ten.

11.12 client/installer.nsh (NSIS)
- Amaç: Windows kurulum betiği (özel adımlar, dosya eklemeleri).
- Öneriler:
  - Yükleme dizini, kısayollar ve kaldırma adımları net; loglama açık.

---

Performans & İyileştirme Önerileri (Genel)
- Geliştirme hızları: HMR hızlılığı için ağır bağımlılıkları optimize edin veya lazy-load.
- Build boyutu: Bundle analiz araçları (rollup-plugin-visualizer) ile düzenli kontrol.
- CI optimizasyonu: Cache (node_modules, vite cache), incremental type-check.
- Pre-commit ergonomisi: Uzun süren görevleri CI’a taşıyın; pre-commit sadece hızlı kontroller.

İlgili Belgeler
- Batch 10 — Electron (Ana, Preload, Lisans): docs/components-batch-10.md
- Batch 12 — Statik Varlıklar (Public, Assets): docs/components-batch-12.md
- Performans ve Ölçüm: docs/performance/performance-checklist.md, docs/performance/measurement-guide.md
