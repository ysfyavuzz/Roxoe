# 🧩 COMPONENTS – Bileşen Envanteri

[← Teknik Kitap’a Dön](roxoepos-technical-book.md) · [Genel Kitap](BOOK/roxoepos-book.md) · [Batch Endeksi](components-batch-index.md)

Son Güncelleme: 2025-08-27
Sürüm: 0.5.3

Bu dosya, ana bileşen gruplarını ve önemli notları özetler. Ayrıntılı props arayüzleri için dosya içinde TypeScript interfaceleri takip edin.

Durum: Batch 1–7, 8, 9, 10, 11 ve 12 detay dokümantasyonu tamamlandı. Batch 13 tamamlandı. Ayrıntılar için aşağıdaki toplu belgeleri inceleyin (bkz. docs/components-batch-index.md):
- docs/components-batch-1.md
- docs/components-batch-2.md
- docs/components-batch-3.md (prop tabloları ve kısa kullanım örnekleri eklendi)
- docs/components-batch-4.md
- docs/components-batch-5.md (prop tabloları ve kısa kullanım örnekleri eklendi)

Performans referansları:
- docs/performance-overview.md
- docs/performance/performance-checklist.md
- docs/performance/measurement-guide.md
- docs/performance/performance-playbook.md

Ek Referanslar:
- Onboarding: docs/onboarding-10-minutes-roxoepos.md
- Operasyon/Monitoring: docs/operations-monitoring.md
- Sütun Eşleştirme Worker Planı: docs/column-mapping-worker-plan.md
- Props Özetleri: docs/components/props.md
- Donanım: docs/hardware/esc-pos-appendix.md, docs/hardware/test-checklist.md
- Runbook’lar: docs/runbooks/operation-guides.md
- Dosya Grupları: docs/file-packages.md

## 1) UI (src/components/ui)
- Button.tsx, Input.tsx, Select.tsx, Switch.tsx, Dialog.tsx, Table.tsx, Tabs.tsx, Card.tsx, Badge.tsx, Pagination.tsx, DatePicker.tsx
- Notlar:
  - Tüm public props’lar TypeScript interface ile tanımlanmalı (ComponentNameProps)
  - Zorunlu/opsiyonel alanlar net olmalı, gerektiğinde default değerler sağlanmalı

Örnek (JSDoc)
```ts path=null start=null
/**
 * Birincil buton bileşeni
 * @param children - Buton metni veya içerik
 * @param onClick - Tıklama olay işleyicisi
 * @param variant - Görsel varyant ('primary' | 'secondary')
 */
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}
```

## 2) Modals (src/components/modals)
- PaymentModal.tsx, TransactionModal.tsx, ReceiptModal.tsx, CustomerModal.tsx, ProductModal.tsx
- PaymentModal alt bileşenleri: payment/ altında ProductSplitSection, EqualSplitSection, PaymentHeader/PaymentFooter
- Notlar: Ağır işlevlerde memoization/useCallback; form validasyonlarında Türkçe ve açıklayıcı uyarılar

## 3) POS (src/components/pos)
- POSHeader.tsx, ProductPanel.tsx, CartPanel.tsx, PaymentControls.tsx, SearchFilterPanel.tsx
- Performans: Büyük listelerde `react-window` sanallaştırma (eşikler Teknik Kitap 8.1)

## 4) CashRegister (src/components/cashregister)
- CashCounting.tsx, CashRegisterStatus.tsx, TransactionHistory.tsx, TransactionControls.tsx
- Kullanım: `useRegisterStatus` ile kasa açık/kapalı kontrolü

## 5) Settings (src/components/settings)
- AboutTab.tsx, BackupSettingsTab.tsx, BarcodeSettingsTab.tsx, POSSettingsTab.tsx, ReceiptSettingsTab.tsx, SerialSettingsTab.tsx
- Sayfa mantığı: `src/pages/settings/hooks/useSettingsPage.ts`

## 6) Dashboard (src/components/dashboard)
- OverviewTab.tsx, SalesTab.tsx, ProductsTab.tsx, CashTab.tsx
- Veri: `useDashboardSalesData` ve `useCashDashboardData`

## 7) Diğer Önemli Bileşenler
- Error handler: src/components/error-handler/ErrorBoundary.tsx, index.ts
- Bildirim: AlertProvider.tsx, NotificationPopup.tsx
- Lisans UI: LicenseActivation.tsx / SerialActivation.tsx

## 8) Performans İpuçları
- React.memo: Görsel ağırlıklı ve sık render olan bileşenlerde
- useMemo: Türetilmiş maliyetli veriler
- useCallback: Prop olarak aktarılan fonksiyonlar
- Virtualization: Uzun listelerde `react-window`

## 9) Tailwind Sınıf Sırası
- Düzen: Layout → Spacing → Typography → Colors → Effects (bkz. proje kuralı)

## 10) Batch Dökümanları
- Batch 1 — Çekirdek Uygulama ve Altyapı: docs/components-batch-1.md
- Batch 2 — Servisler ve Veritabanı Katmanı: docs/components-batch-2.md
- Batch 3 — Ortak UI Bileşenleri ve Hook’lar: docs/components-batch-3.md
- Batch 4 — Dashboard (Sales, Products): docs/components-batch-4.md
- Batch 5 — POS, Settings ve Modals: docs/components-batch-5.md
- Batch 6 — Uygulama Sayfaları (Diğer): docs/components-batch-6.md
- Batch 7 — Tür Tanımları (Types): docs/components-batch-7.md
- Batch 8 — Yardımcı Araçlar (Utils): docs/components-batch-8.md
- Batch 9 — Testler: docs/components-batch-9.md
- Batch 10 — Electron (Ana, Preload, Lisans): docs/components-batch-10.md
- Batch 11 — Yapı ve Konfigürasyon (Build & Config): docs/components-batch-11.md
- Batch 12 — Statik Varlıklar (Public, Assets): docs/components-batch-12.md
- Batch 13 — Dokümantasyon ve Süreç Altyapısı: docs/components-batch-13.md

