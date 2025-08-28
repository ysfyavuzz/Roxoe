# 🧩 COMPONENTS – Bileşen Envanteri

[← Teknik Kitap’a Dön](ROXOEPOS-TEKNIK-KITAP.md) · [Genel Kitap](BOOK/ROXOEPOS-KITAP.md)

Son Güncelleme: 2025-08-27
Sürüm: 0.5.3

Bu dosya, ana bileşen gruplarını ve önemli notları özetler. Ayrıntılı props arayüzleri için dosya içinde TypeScript interfaceleri takip edin.

Durum: Batch 1–7, 8, 9, 10, 11 ve 12 detay dokümantasyonu tamamlandı. Batch 13 beklemede. Ayrıntılar için aşağıdaki toplu belgeleri inceleyin:
- docs/BILESENLER_TOPLU_1.md
- docs/BILESENLER_TOPLU_2.md
- docs/BILESENLER_TOPLU_3.md (prop tabloları ve kısa kullanım örnekleri eklendi)
- docs/BILESENLER_TOPLU_4.md
- docs/BILESENLER_TOPLU_5.md (prop tabloları ve kısa kullanım örnekleri eklendi)

Performans referansları:
- docs/PERFORMANS.md
- docs/performance/PERFORMANS-KONTROL-LISTESI.md
- docs/performance/OLCUM-REHBERI.md
- docs/performance/PERFORMANS-PLAYBOOK.md

Ek Referanslar:
- Onboarding: docs/ONBOARDING-10-DAKIKADA-ROXOEPOS.md
- Operasyon/Monitoring: docs/OPERASYON-IZLEME.md
- Sütun Eşleştirme Worker Planı: docs/SUTUN-ESLESTIRME-WORKER-PLANI.md
- Props Özetleri: docs/components/PROPS.md
- Donanım: docs/hardware/ESC-POS-EKI.md, docs/hardware/TEST-KONTROL-LISTESI.md
- Runbook’lar: docs/runbooks/CALISMA-KILAVUZLARI.md
- Dosya Grupları: docs/DOSYA-PAKETLERI.md

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
- Batch 1 — Çekirdek Uygulama ve Altyapı: docs/BILESENLER_TOPLU_1.md
- Batch 2 — Servisler ve Veritabanı Katmanı: docs/BILESENLER_TOPLU_2.md
- Batch 3 — Ortak UI Bileşenleri ve Hook’lar: docs/BILESENLER_TOPLU_3.md
- Batch 4 — Dashboard (Sales, Products): docs/BILESENLER_TOPLU_4.md
- Batch 5 — POS, Settings ve Modals: docs/BILESENLER_TOPLU_5.md
- Batch 6 — Uygulama Sayfaları (Diğer): docs/BILESENLER_TOPLU_6.md
- Batch 7 — Tür Tanımları (Types): docs/BILESENLER_TOPLU_7.md
- Batch 8 — Yardımcı Araçlar (Utils): docs/BILESENLER_TOPLU_8.md
- Batch 9 — Testler: docs/BILESENLER_TOPLU_9.md
- Batch 10 — Electron (Ana, Preload, Lisans): docs/BILESENLER_TOPLU_10.md
- Batch 11 — Yapı ve Konfigürasyon (Build & Config): docs/BILESENLER_TOPLU_11.md
- Batch 12 — Statik Varlıklar (Public, Assets): docs/BILESENLER_TOPLU_12.md

