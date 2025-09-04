# Batch 13 — Dokümantasyon ve Süreç Altyapısı (Docs, PR, Kitap, Media, Betikler)

Son Güncelleme: 2025-08-28
Sürüm: 0.5.3

Hedef Metrikler (Özet)
- Toplam .md doküman: 55
- Toplam satır: 6573
- Toplam boyut: 322324 bytes

Amaç
- Dokümantasyonun izlenebilir, tutarlı ve güncel kalmasını sağlayan altyapının tek yerde toplanması.
- Kod değişiklikleri ile dokümanların eşzamanlı güncellenmesini garanti edecek kuralların belirlenmesi.
- Kitap (BOOK), media, PR akışı ve otomasyon betiklerinin görünür ve ölçülebilir olması.

Kapsam
- PR Şablonu, önerilen kalite kontrolleri ve (opsiyonel) Danger JS kuralları
- Özellik Bayrakları (Feature Flags) dokümanı ve kullanım yerleri
- Geliştirici Kitabı (BOOK) ve media klasör yapısı
- Tüm dokümanların metrikleri (satır/boyut), konumları ve toplu özetler
- Bakım betikleri (update-*, analyze-*, replace-old-doc-names, generate-docs-metrics)

---

13.1 Gruplar ve Metrikler (Özet)
- components-batch: 13 dosya — 2345 satır — 126641 bytes
- root: 17 dosya — 3306 satır — 157439 bytes
- book: 2 dosya — 246 satır — 12949 bytes
- performance: 3 dosya — 192 satır — 9929 bytes
- adr: 6 dosya — 95 satır — 2414 bytes
- runbooks: 5 dosya — 100 satır — 2820 bytes
- case-studies: 4 dosya — 157 satır — 6075 bytes
- components: 1 dosya — 31 satır — 996 bytes
- hardware: 2 dosya — 34 satır — 1062 bytes
- schemas: 1 dosya — 35 satır — 1067 bytes
- samples: 1 dosya — 32 satır — 932 bytes

Eksik Doküman Kontrolü
- components-batch-1..13 mevcut (eksik yok).
- BOOK dizini mevcut (roxoepos-book.md + media/README.md mevcut).
- Performans, runbook, ADR, hardware, case-studies, schemas, components altlarındaki ana dosyalar mevcut.

Not: Bu metrikler scripts/generate-docs-metrics.js ile üretildi ve docs/docs-metrics.json altında saklandı.

---

13.2 Süreçler ve Standartlar
- PR Şablonu: .github/pull_request_template.md
  - Bölümler: Amaç, Kapsam, Ekran/Video, Testler, Performans, Güvenlik, Risk/Rollback, Dokümantasyon, PR Türü, İzlenebilirlik, Checklist.
  - Öneri: Danger JS ile PR’da doküman/görsel/test/coverage gibi zorunlulukları otomatik denetleyin.
- Özellik Bayrakları (Feature Flags): docs/feature-flags.md
  - VITE_LICENSE_BYPASS ve VITE_SERIAL_FEATURE ile dev/test’te aktivasyon bypass ve Serial sekmesi görünürlüğü yönetilir.
  - Uygulama tarafı: App.tsx (bypass), SettingsPage/Serial tabs (görünürlük), electron main/license.ts (LICENSE_BYPASS).
- Kitap (BOOK) ve Media
  - Kitap: docs/BOOK/roxoepos-book.md
  - Media: docs/BOOK/media/ (görseller/videolar için adlandırma standardı; büyük videolar için harici depolama linki önerilir).
- Bakım/Otomasyon Betikleri
  - scripts/update-status.js → docs/status.md meta güncelleme
  - scripts/update-components.js → docs/components.md meta güncelleme
  - scripts/update-performance-docs.js → docs/performance-overview.md meta güncelleme
  - scripts/analyze-project.js → çoklu dokümanda tarih/sürüm senkronizasyonu
  - scripts/update-tech-book-metadata.js → teknik kitap/BOOK meta senkronizasyonu
  - scripts/replace-old-doc-names.js → eski dosya adlarını düz metinde kebab-case’e normalize eder (tutuldu)
  - scripts/generate-docs-metrics.js → doküman metriklerini üretir (yeni)

---

13.3 Detaylı Liste (Tüm .md Dokümanlar)

ADR (6)
- ADR-0001: Yerel veri deposu olarak IndexedDB — satır: 17, boyut: 450 bytes — yol: docs/adr/0001-indexeddb.md
- ADR-0002: Güncelleme için electron-updater — satır: 16, boyut: 359 bytes — yol: docs/adr/0002-electron-updater.md
- ADR-0003: Optimize edilmiş yedekleme stratejisi — satır: 17, boyut: 431 bytes — yol: docs/adr/0003-backup-strategy.md
- ADR-0004: Sanallaştırılmış listeler (react-window) — satır: 17, boyut: 456 bytes — yol: docs/adr/0004-virtualized-lists.md
- ADR-0005: Şifreleme anahtar yönetimi — satır: 16, boyut: 407 bytes — yol: docs/adr/0005-encryption-keys.md
- Mimari Karar Kayıtları (ADR) — satır: 12, boyut: 311 bytes — yol: docs/adr/README.md

BOOK (2)
- README.md — satır: 12, boyut: 529 bytes — yol: docs/BOOK/media/README.md
- RoxoePOS Kitabı (Yatırımcı + Kullanıcı + Geliştirici) — satır: 234, boyut: 12420 bytes — yol: docs/BOOK/roxoepos-book.md

Case Studies (4)
- Case Study: Yedekleme ve Geri Yükleme Testi — satır: 46, boyut: 1805 bytes — yol: docs/case-studies/backup-restore-test.md
- Case Study: Cihaz Değişimi ve Veri Taşıma (Backup/Restore) — satır: 31, boyut: 1257 bytes — yol: docs/case-studies/device-migration.md
- Case Study: İlk Ürün Yükleme (Excel/CSV) — satır: 34, boyut: 1303 bytes — yol: docs/case-studies/initial-product-import-excel.md
- Case Study: RoxoePOS Kurulumu (Adım Adım) — satır: 46, boyut: 1710 bytes — yol: docs/case-studies/setup.md

Components (1)
- Kritik Bileşen Props Tabloları — satır: 31, boyut: 996 bytes — yol: docs/components/props.md

Components Batch (13)
- Batch 1 — Çekirdek Uygulama ve Altyapı (Router, Layout, Sağlayıcılar, Hata Yönetimi, Güncelleme ve Yedekleme) — satır: 305, boyut: 18162 bytes — yol: docs/components-batch-1.md
- Batch 2 — Servisler ve Veritabanı Katmanı (IndexedDB, POS/Ödeme, Dışa Aktarım, Arşiv, Performans) — satır: 366, boyut: 25511 bytes — yol: docs/components-batch-2.md
- Batch 3 — Ortak UI Bileşenleri ve Hook’lar — satır: 408, boyut: 19824 bytes — yol: docs/components-batch-3.md
- Batch 4 — Dashboard (Türkçe) — satır: 77, boyut: 4481 bytes — yol: docs/components-batch-4.md
- Batch 5 — POS Bileşenleri ve Ayarlar (Türkçe) — satır: 472, boyut: 22947 bytes — yol: docs/components-batch-5.md
- Batch 6 — Uygulama Sayfaları (Diğer) — satır: 84, boyut: 5048 bytes — yol: docs/components-batch-6.md
- Batch 7 — Tür Tanımları (Types) — satır: 92, boyut: 5150 bytes — yol: docs/components-batch-7.md
- Batch 8 — Yardımcı Araçlar (Utils) — satır: 116, boyut: 4874 bytes — yol: docs/components-batch-8.md
- Batch 9 — Testler — satır: 115, boyut: 4601 bytes — yol: docs/components-batch-9.md
- Batch 10 — Electron (Ana, Preload, Lisans) — satır: 78, boyut: 4520 bytes — yol: docs/components-batch-10.md
- Batch 11 — Yapı ve Konfigürasyon (Build & Config) — satır: 101, boyut: 4561 bytes — yol: docs/components-batch-11.md
- Batch 12 — Statik Varlıklar (Public, Assets) — satır: 74, boyut: 3469 bytes — yol: docs/components-batch-12.md
- Batch 13 — Dokümantasyon ve Süreç Altyapısı (bu belge) — satır: 57+, boyut: 3493 bytes — yol: docs/components-batch-13.md

Hardware (2)
- ESC/POS Eki — satır: 14, boyut: 505 bytes — yol: docs/hardware/esc-pos-appendix.md
- Donanım Test Checklist’i — satır: 20, boyut: 557 bytes — yol: docs/hardware/test-checklist.md

Performance (3)
- 📏 Ölçüm Rehberi — satır: 112, boyut: 6507 bytes — yol: docs/performance/measurement-guide.md
- 🚀 Performans Kontrol Listesi — satır: 50, boyut: 2547 bytes — yol: docs/performance/performance-checklist.md
- Performans Ölçüm Playbook’u — satır: 30, boyut: 875 bytes — yol: docs/performance/performance-playbook.md

Runbooks (5)
- Runbook: Aktivasyon/Serial Sorunu — satır: 21, boyut: 593 bytes — yol: docs/runbooks/activation-issue.md
- Runbook: Yedekleme Başarısız — satır: 23, boyut: 717 bytes — yol: docs/runbooks/backup-failed.md
- Runbook: Veritabanı Tutarsızlığı — satır: 21, boyut: 582 bytes — yol: docs/runbooks/db-inconsistency.md
- Runbook’lar — satır: 13, boyut: 337 bytes — yol: docs/runbooks/operation-guides.md
- Runbook: Güncelleme Hatası — satır: 22, boyut: 591 bytes — yol: docs/runbooks/update-error.md

Schemas (1)
- Şemalar (JSON Schema) — satır: 35, boyut: 1067 bytes — yol: docs/schemas/README.md

Samples (1)
- Örnekler (samples) — satır: 32, boyut: 932 bytes — yol: docs/samples/examples.md

Root (17)
- 🔌 API – IPC ve Servis Referansı — satır: 111, boyut: 3877 bytes — yol: docs/api.md
- Değişiklik Günlüğü (Changelog) — satır: 113, boyut: 8567 bytes — yol: docs/changelog.md
- ColumnMappingModal için Web Worker Planı — satır: 161, boyut: 8196 bytes — yol: docs/column-mapping-worker-plan.md
- 🧩 COMPONENTS – Bileşen Envanteri — satır: 103, boyut: 4797 bytes — yol: docs/components.md
- Görsel Diyagramlar (Mermaid) — satır: 127, boyut: 3344 bytes — yol: docs/diagrams.md
- Özellik Bayrakları (Feature Flags) — satır: 60, boyut: 1950 bytes — yol: docs/feature-flags.md
- Dosya Bazlı İnceleme (Batch 1) — satır: 205, boyut: 12850 bytes — yol: docs/file-based-reference.md
- Dosya Haritası (Kapsam ve Durum) — satır: 54, boyut: 4679 bytes — yol: docs/file-map.md
- FILE-BATCHES — Dosyaların Batch Bazlı Sınıflandırması — satır: 295, boyut: 10575 bytes — yol: docs/file-packages.md
- 📦 MODULES – Modül Durumu — satır: 22, boyut: 1279 bytes — yol: docs/modules.md
- 10 Dakikada RoxoePOS Geliştirme Ortamı (Windows / PowerShell) — satır: 89, boyut: 3401 bytes — yol: docs/onboarding-10-minutes-roxoepos.md
- Operasyon & Monitoring Rehberi — satır: 59, boyut: 2416 bytes — yol: docs/operations-monitoring.md
- 🚀 PERFORMANCE – Performans Bütçeleri ve Rehber — satır: 55, boyut: 1572 bytes — yol: docs/performance-overview.md
- Future Vision — satır: 32, boyut: 1405 bytes — yol: docs/roadmap.md
- RoxoePOS Teknik Doküman (Geliştirici Kitabı) — satır: 1729, boyut: 84847 bytes — yol: docs/roxoepos-technical-book.md
- 📊 STATUS – Proje Durumu — satır: 51, boyut: 2387 bytes — yol: docs/status.md
- 🧪 TEST-COVERAGE – Test Kapsam Politikası — satır: 40, boyut: 1297 bytes — yol: docs/test-coverage.md

---

13.4 Bakım ve Otomasyon (Önerilen Akış)
- Değişiklik geliştirilir → İlgili components-batch-* dokümanı ve/veya teknik kitap/README güncellenir.
- scripts/generate-docs-metrics.js çalıştırılarak doküman metrikleri güncellenir (docs/docs-metrics.json).
- PR açıklamasına amaç/kapsam/ekran-görsel/test/performans/riske dair bölümler eklenir.
- CI (opsiyonel): coverage ve bundle raporları artefact olarak eklenir; Danger JS ile PR kuralları uygulanır.

13.5 Notlar
- Eski dosya adlarını düz metinde normalize etmek için scripts/replace-old-doc-names.js tutuldu.
- Bu belge, dokümantasyon süreçleri için referans düşer; gerektiğinde daha fazla alt başlıkla genişletilebilir.

