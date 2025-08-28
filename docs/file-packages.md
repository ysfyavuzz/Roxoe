# FILE-BATCHES — Dosyaların Batch Bazlı Sınıflandırması

[← Teknik Kitap’a Dön](roxoepos-technical-book.md) · [Genel Kitap](BOOK/roxoepos-book.md)

Son güncelleme: 2025-08-27
Toplam izlenen dosya: 160
Durum: İlk 5 batch sabit tutuldu ve yeni dosyalar bu ilk beş batch’e eklenmedi. Kalan tüm dosyalar Batch 6+ altında, benzer mantıkla kategorize edildi. Aşağıdaki listeler aynı zamanda kontrol listesi olarak kullanılabilir; her dosya incelendikçe işaretlenebilir.

İçindekiler
- Batch 1 — Çekirdek Uygulama ve Altyapı
- Batch 2 — Servisler, Veritabanı ve Yedekleme
- Batch 3 — Ortak UI Bileşenleri ve Hook’lar
- Batch 4 — Dashboard
- Batch 5 — POS, Settings ve Modals
- Batch 6 — Uygulama Sayfaları (Diğer)
- Batch 7 — Tür Tanımları (Types)
- Batch 8 — Yardımcı Araçlar (Utils)
- Batch 9 — Testler
- Batch 10 — Electron
- Batch 11 — Yapı ve Konfigürasyon
- Batch 12 — Statik Varlıklar (Public, Assets)
- Batch 13 — Dokümantasyon ve Kurallar

---

## Batch 1 — Çekirdek Uygulama ve Altyapı

Detay için bkz. docs/components-batch-1.md

- [x] client/src/App.tsx
- [x] client/src/components/AlertProvider.tsx
- [x] client/src/components/BackupDialogManager.tsx
- [x] client/src/components/ClosingBackupLoader.tsx
- [x] client/src/components/DynamicWindowTitle.tsx
- [x] client/src/components/UpdateNotification.tsx
- [x] client/src/components/layout/PageLayout.tsx
- [x] client/src/contexts/NotificationContext.tsx
- [x] client/src/helpers/DBVersionHelper.ts
- [x] client/src/helpers/paymentMethodDisplay.ts
- [x] client/src/index.css
- [x] client/src/layouts/MainLayout.tsx
- [x] client/src/main.tsx
- [x] client/src/vite-env.d.ts

---

## Batch 2 — Servisler, Veritabanı ve Yedekleme

Detay için bkz. docs/components-batch-2.md

- [x] client/src/backup/core/BackupDeserializer.ts
- [x] client/src/backup/core/BackupManager.ts
- [x] client/src/backup/core/BackupSerializer.ts
- [x] client/src/backup/core/OptimizedBackupManager.ts
- [x] client/src/backup/core/StreamingBackupSerializer.ts
- [x] client/src/backup/database/IndexedDBExporter.ts
- [x] client/src/backup/database/IndexedDBImporter.ts
- [x] client/src/backup/database/StreamingIndexedDBExporter.ts
- [x] client/src/backup/index.ts
- [x] client/src/backup/scheduler/BackupScheduler.ts
- [x] client/src/backup/utils/checksumUtils.ts
- [x] client/src/backup/utils/compressionUtils.ts
- [x] client/src/backup/utils/fileUtils.ts
- [x] client/src/services/ArchiveService.ts
- [x] client/src/services/IndexOptimizer.ts
- [x] client/src/services/PerformanceMonitor.ts
- [x] client/src/services/UnifiedDBInitializer.ts
- [x] client/src/services/cashRegisterDB.ts
- [x] client/src/services/creditServices.ts
- [x] client/src/services/dbService.ts
- [x] client/src/services/discountService.ts
- [x] client/src/services/encryptionService.ts
- [x] client/src/services/exportSevices.ts
- [x] client/src/services/importExportServices.ts
- [x] client/src/services/posServices.ts
- [x] client/src/services/productDB.ts
- [x] client/src/services/receiptService.ts
- [x] client/src/services/salesDB.ts

---

## Batch 3 — Ortak UI Bileşenleri ve Hook’lar

Detay için bkz. docs/components-batch-3.md

- [x] client/src/components/AddProductToGroupCard.tsx
- [x] client/src/components/BarcodeGenerator.tsx
- [x] client/src/components/BatchPriceUpdate.tsx
- [x] client/src/components/BulkProductOperations.tsx
- [x] client/src/components/CategoryManagement.tsx
- [x] client/src/components/CustomerSelectionButton.tsx
- [x] client/src/components/ExportButton.tsx
- [x] client/src/components/HotkeySettings.tsx
- [x] client/src/components/LicenseActivation.tsx
- [x] client/src/components/NotificationPopup.tsx
- [x] client/src/components/PrinterDebug.tsx
- [x] client/src/components/ProductGroupTabs.tsx
- [x] client/src/components/ResetDatabaseButton.tsx
- [x] client/src/components/SalesFilterPanel.tsx
- [x] client/src/components/SearchFilterPanel.tsx
- [x] client/src/components/SerialActivation.tsx
- [x] client/src/components/StockManagement.tsx
- [x] client/src/components/ui/Badge.tsx
- [x] client/src/components/ui/Button.tsx
- [x] client/src/components/ui/Card.tsx
- [x] client/src/components/ui/Charts.tsx
- [x] client/src/components/ui/CustomerList.tsx
- [x] client/src/components/ui/DatePicker.tsx
- [x] client/src/components/ui/Dialog.tsx
- [x] client/src/components/ui/FilterPanel.tsx
- [x] client/src/components/ui/Input.tsx
- [x] client/src/components/ui/NeonProductCard.tsx
- [x] client/src/components/ui/Pagination.tsx
- [x] client/src/components/ui/Select.tsx
- [x] client/src/components/ui/Switch.tsx
- [x] client/src/components/ui/Table.tsx
- [x] client/src/components/ui/Tabs.tsx
- [x] client/src/hooks/useBarcode.ts
- [x] client/src/hooks/useCart.ts
- [x] client/src/hooks/useCashRegisterData.ts
- [x] client/src/hooks/useCustomers.ts
- [x] client/src/hooks/useHotkeys.tsx
- [x] client/src/hooks/useProductGroups.ts
- [x] client/src/hooks/useProducts.ts
- [x] client/src/hooks/useSales.ts

---

## Batch 4 — Dashboard

Detay için bkz. docs/components-batch-4.md

- [x] client/src/components/dashboard/CashTab.tsx
- [x] client/src/components/dashboard/OverviewTab.tsx
- [x] client/src/components/dashboard/ProductsTab.tsx
- [x] client/src/components/dashboard/SalesTab.tsx
- [x] client/src/pages/DashboardPage.tsx

---

## Batch 5 — POS, Settings ve Modals

Detay için bkz. docs/components-batch-5.md

- [x] client/src/pages/CashRegisterPage.tsx
- [x] client/src/pages/POSPage.tsx
- [x] client/src/pages/SettingsPage.tsx
- [x] client/src/components/modals/ColumnMappingModal.tsx
- [x] client/src/components/modals/CustomerDetailModal.tsx
- [x] client/src/components/modals/CustomerModal.tsx
- [x] client/src/components/modals/CustomerSearchModal.tsx
- [x] client/src/components/modals/PaymentModal.tsx
- [x] client/src/components/modals/ProductModal.tsx
- [x] client/src/components/modals/ReasonModal.tsx
- [x] client/src/components/modals/ReceiptModal.tsx
- [x] client/src/components/modals/SelectProductModal.tsx
- [x] client/src/components/modals/TransactionModal.tsx

---

## Batch 6 — Uygulama Sayfaları (Diğer)

Detay için bkz. docs/components-batch-6.md

- [x] client/src/pages/CreditPage.tsx
- [x] client/src/pages/ProductsPage.tsx
- [x] client/src/pages/SaleDetailPage.tsx
- [x] client/src/pages/SalesHistoryPage.tsx

---

## Batch 7 — Tür Tanımları (Types)

Detay için bkz. docs/components-batch-7.md

- [x] client/src/types/backup.ts
- [x] client/src/types/barcode.ts
- [x] client/src/types/card.ts
- [x] client/src/types/cashRegister.ts
- [x] client/src/types/credit.ts
- [x] client/src/types/filters.ts
- [x] client/src/types/global.d.ts
- [x] client/src/types/hotkey.ts
- [x] client/src/types/pos.ts
- [x] client/src/types/product.ts
- [x] client/src/types/receipt.ts
- [x] client/src/types/sales.ts
- [x] client/src/types/table.ts

---

## Batch 8 — Yardımcı Araçlar (Utils)

Detay için bkz. docs/components-batch-8.md

- [x] client/src/utils/FocusManager.ts
- [x] client/src/utils/backup-bridge.ts
- [x] client/src/utils/dashboardStats.ts
- [x] client/src/utils/eventBus.ts
- [x] client/src/utils/numberFormatUtils.ts
- [x] client/src/utils/turkishSearch.ts
- [x] client/src/utils/vatUtils.ts

---

## Batch 9 — Testler

Detay için bkz. docs/components-batch-9.md

- [x] client/src/test/Button.test.tsx
- [x] client/src/test/formatters.test.ts
- [x] client/src/test/setup.ts

---

## Batch 10 — Electron

Detay için bkz. docs/components-batch-10.md

- [x] client/electron/electron-env.d.ts
- [x] client/electron/license.ts
- [x] client/electron/main.ts
- [x] client/electron/preload.ts

---

## Batch 11 — Yapı ve Konfigürasyon

Detay için bkz. docs/components-batch-11.md

- [ ] client/.gitignore
- [ ] client/.husky/pre-commit
- [ ] client/.prettierignore
- [ ] client/.prettierrc
- [ ] client/eslint.config.js
- [ ] client/index.html
- [ ] client/installer.nsh
- [ ] client/postcss.config.js
- [ ] client/tailwind.config.js
- [ ] client/tsconfig.json
- [ ] client/tsconfig.node.json
- [ ] client/vite.config.ts
- [ ] client/vitest.config.ts
- [ ] client/package.json
- [ ] package.json

---

## Batch 12 — Statik Varlıklar (Public, Assets)

Detay için bkz. docs/components-batch-12.md

- [x] client/public/electron-vite.animate.svg
- [x] client/public/electron-vite.svg
- [x] client/public/icon.icns
- [x] client/public/icon.ico
- [x] client/public/icon.png
- [x] client/public/vite.svg
- [x] client/src/assets/icon.png
- [x] client/src/assets/react.svg

---

## Batch 13 — Dokümantasyon ve Kurallar

- [ ] .qoder/rules/Turkish.md
- [ ] documentation.md
- [ ] project-summary-report.md
- [ ] README.md
- [ ] cleanup-report.md
- [ ] client/README.md

---

## Genel Kontrol Maddeleri

- [x] Batch 1 — İnceleme tamamlandı; ölü kod/tekrarlar temizlendi; derleme/lint hatası yok
- [x] Batch 2 — İnceleme tamamlandı; ölü kod/tekrarlar temizlendi; derleme/lint hatası yok
- [x] Batch 3 — İnceleme tamamlandı; ölü kod/tekrarlar temizlendi; derleme/lint hatası yok
- [x] Batch 4 — İnceleme tamamlandı; ölü kod/tekrarlar temizlendi; derleme/lint hatası yok
- [x] Batch 5 — İnceleme tamamlandı; ölü kod/tekrarlar temizlendi; derleme/lint hatası yok
- [x] Batch 6 — İnceleme tamamlandı; ölü kod/tekrarlar temizlendi; derleme/lint hatası yok
- [x] Batch 7 — İnceleme tamamlandı; ölü kod/tekrarlar temizlendi; derleme/lint hatası yok
- [x] Batch 8 — İnceleme tamamlandı; ölü kod/tekrarlar temizlendi; derleme/lint hatası yok
- [x] Batch 9 — İnceleme tamamlandı; ölü kod/tekrarlar temizlendi; derleme/lint hatası yok
- [x] Batch 10 — İnceleme tamamlandı; ölü kod/tekrarlar temizlendi; derleme/lint hatası yok
- [x] Batch 11 — İnceleme tamamlandı; ölü kod/tekrarlar temizlendi; derleme/lint hatası yok
- [x] Batch 12 — İnceleme tamamlandı; ölü kod/tekrarlar temizlendi; derleme/lint hatası yok
- [ ] Batch 13 — İnceleme tamamlandı; ölü kod/tekrarlar temizlendi; derleme/lint hatası yok

Notlar
- Bir dosya birden fazla alanda kullanılabilir; ancak burada ana rolüne göre tek bir batch altında listelenmiştir.
- İsterseniz ileride dosya başına satır ve boyut metriklerini de ekleyebilirim.

