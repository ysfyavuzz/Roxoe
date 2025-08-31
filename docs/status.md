# 📊 STATUS – Proje Durumu

[← Teknik Kitap’a Dön](roxoepos-technical-book.md) · [Genel Kitap](BOOK/roxoepos-book.md)

Son Güncelleme: 2025-08-31
Sürüm: 0.5.3

## 🎯 Genel Durum
- Durum: Aktif geliştirme
- Tamamlanma (yaklaşık): %80
- Kod Kalitesi: Yüksek (TS strict, ESLint, Prettier)
- Performans Bütçeleri: Hedefler tanımlı (bkz. performance-overview.md ve performance/performance-checklist.md)
- Dokümantasyon: Batch 1–13 tamamlandı (bkz. components-batch-index.md)

## 🧪 Test ve Kapsam Özeti
- Politika: Global ≥ %80, kritik dosyalar ≥ %95 (satır)
- Araçlar: Vitest + RTL, Playwright (E2E), Ajv (Contract)
- Son Ölçüm: Yerelde `npm run test:coverage` ile üretin
- Kritik Gate: `npm run test:critical` (client/scripts/check-coverage.js)

## 🚀 Son Değişiklikler (Özet)
- Son 7 gün commit özeti:
- 2025-08-31 docs/test: coverage ve komut rehberi güncellendi (Windows PowerShell çevresel değişken örnekleri); runbook (db-inconsistency) repairDatabase/db_force_reset notları eklendi; addProductToGroup duplicate yolunda idb AbortError yakalanarak Unhandled Rejection giderildi.
- 2025-08-28 6874f3a docs: add Components Batch Index links; mark Batch 13 complete; rename FEATURE-FLAGS.md -> feature-flags.md and update references; refresh docs metrics
- 2025-08-28 75064f1 docs: link components-batch-index in components.md and BOOK; mark Batch 13 complete in status; standardize archive filename to kebab-case and update references
- 2025-08-28 3e58a16 docs: add components-batch-index (master list + metrics link)
- 2025-08-28 711e7f4 docs(batch13): rewrite documentation/process infra with full metrics; add metrics script
- 2025-08-28 b4b3009 chore: align remaining script comments to kebab-case filenames
- 2025-08-28 af7233a docs: replace old doc names in plain text; update scripts comments and file-list.txt
- 2025-08-28 ee0f461 docs: normalize narrative mentions to kebab-case doc names across repo
- 2025-08-28 a7c82fe docs: rename to English kebab-case and update references/scripts
- 2025-08-28 9a8214b docs(bilesenler): Batch 13 dokümanı ve envanter bağlantısı ekle
- 2025-08-28 e03a771 docs(pr): PR şablonu ve PR kalite kontrol iş akışı ekle
- 2025-08-27: Temizlik yapıldı (client/node_modules, client/dist). Bağımlılıklar yeniden kurulmalı.
- Batch 1–5 dokümanları detaylandırıldı: “Ne işe yarar / Nasıl çalışır” ve “Performans & İyileştirme Önerileri” eklendi
- Batch 3 ve Batch 5 için prop tabloları ve küçük kullanım örnekleri eklendi
- Performans Checklist ve Ölçüm Rehberi yayınlandı (performance/performance-checklist.md, performance/measurement-guide.md)
- Test altyapısı güçlendirildi; coverage eşikleri eklendi
- Yedekleme stratejisi tekilleştirildi (OptimizedBackupManager varsayılan)
- SettingsPage ve POS akışları için özel hook’lar (useSettingsPage, usePaymentFlow, useRegisterStatus)
- POS listeleri için react-window sanallaştırma
- Onboarding/Diagram/Monitoring dokümanları genişletildi

Ayrıntı: docs/changelog.md

Güncel Notlar (2025-08-31)
- addProductToGroup duplicate ilişki yolunda idb AbortError kaynaklı Unhandled Rejection giderildi (test stabilitesi ↑).
- test:critical gate’i Windows PowerShell ortam değişkeni örnekleri ile belgelendi; test-coverage.md ve command-guide.md güncellendi.
- Runbook (db-inconsistency) repairDatabase ve db_force_reset akışlarıyla genişletildi.

Güncel Notlar (2025-08-30)
- E2E suite genişletildi: POS satış akışı iyileştirildi, sepet temizleme senaryosu eklendi; Diagnostics ve Backup akışları stabilize edildi.
- Playwright testleri Vite preview ile koşturuluyor; test ortamı bayrakları otomatik set ediliyor.
- Dokümantasyon güncellendi; Playwright E2E rehberi eklendi.

## 🧱 Modül Durumu
Modül detayları için: docs/modules.md

## 📈 Performans
- Hedefler ve ölçüm rehberi: docs/performance-overview.md
- Sanallaştırma eşikleri: Teknik Kitap Bölüm 8.1

## 🔗 Referanslar
- API Referansı: docs/api.md
- Bileşen Envanteri: docs/components.md
- Bileşen Batch Endeksi: docs/components-batch-index.md
- Test Politikası: docs/test-coverage.md
- Performans: docs/performance/performance-checklist.md, docs/performance/measurement-guide.md, docs/performance/performance-playbook.md
- Runbook’lar: docs/runbooks/operation-guides.md
- Onboarding: docs/onboarding-10-minutes-roxoepos.md
- Operasyon/Monitoring: docs/operations-monitoring.md
- Teknik Kitap: docs/roxoepos-technical-book.md

