# 🔌 API – IPC ve Servis Referansı

[← Teknik Kitap’a Dön](roxoepos-technical-book.md) · [Genel Kitap](BOOK/roxoepos-book.md)

Son Güncelleme: 2025-08-29
Sürüm: 0.5.3

## 1) IPC Kanalları (Özet)

- Güncelleme
  - check-for-updates (renderer → main, send)
  - update-available/progress/downloaded/status/error (main → renderer, on)
  - quit-and-install (renderer → main, send)
  - test-update-* (renderer → main, send, geliştirme)

- Uygulama Bilgisi
  - get-app-version (renderer → main, invoke) → string

- Yedekleme & Dosya
  - create-backup-bridge (renderer → main, invoke) → { success, backupId?, metadata?, size?, recordCount?, error? }
  - restore-backup-bridge (renderer → main, invoke) → { success, metadata?, error? }
  - get-backup-history (renderer → main, invoke)
  - read-backup-file (renderer → main, invoke)
  - schedule-backup / disable-scheduled-backup (renderer → main, invoke)
  - select-directory / set-backup-directory / get-backup-directory (renderer → main, invoke)
  - backup-progress (main → renderer, on) → { stage, progress }

- Kapanış Koordinasyonu
  - app-close-requested (main → renderer, event)
  - confirm-app-close (renderer → main, send)

- Lisans/Seri
  - check-serial / activate-serial / get-serial-info / reset-serial (invoke)

## 2) Payload Örnekleri

Güncelleme Durumu
```json path=null start=null
{
  "status": "downloading",
  "version": "0.5.3",
  "progress": {
    "percent": 42.3,
    "transferred": 25432100,
    "total": 120000000,
    "speed": "1.25",
    "remaining": 94567900,
    "isDelta": true
  },
  "error": null
}
```

Yedekleme Sonucu (create-backup-bridge)
```json path=null start=null
{
  "success": true,
  "backupId": "2025-08-27T00-45-10Z-full",
  "metadata": { "description": "Manuel", "backupType": "full", "createdAt": "2025-08-27T00:45:10.123Z" },
  "size": 10485760,
  "recordCount": 15234,
  "error": null
}
```

## 3) Renderer Window API (Preload Yüzeyi)
- appInfo.getVersion()
- ipcRenderer: on/off/send/invoke (proxy)
- updaterAPI: checkForUpdates, onUpdateAvailable/Downloaded/Error/Message/Progress/Status, test*
- backupAPI: createBackup, restoreBackup, read/save file, getBackupHistory, schedule/disable, set/getBackupDirectory, on/off backup-progress
- serialAPI: requestPort, getPorts
- indexedDBAPI: db-export-request, db-import-request (köprü)

## 4) Servis API (Özet)

productService (productDB.ts)
- getAllProducts(): Promise<Product[]>
- addProduct(product: Omit<Product, 'id'>): Promise<number> (barkod tekillik kontrolü)
- updateProduct(product: Product): Promise<void>
- deleteProduct(id: number): Promise<void>
- Kategoriler ve Gruplar: add/update/delete, addProductToGroup/remove, getGroupProducts
- updateStock(id: number, qty: number): Promise<void>

salesDB
- addSale(sale: Omit<Sale, 'id'>): Promise<Sale>
- getSalesWithFilter(filter): Promise<Sale[]>
- getSalesSummary(start: Date, end: Date): Promise<Summary>
- applyDiscount(sale: Sale, type: 'percentage' | 'amount', value: number): Sale
- generateReceiptNo(): string

receiptService
- generatePDF(receipt: ReceiptInfo): Promise<void>
- printReceipt(receipt: ReceiptInfo): Promise<boolean>
- checkPrinterStatus(): Promise<boolean>

import/export
- exportToExcel(products: Product[], fileName?): Promise<void>
- exportToCSV(products: Product[], fileName?): void
- generateTemplate(type?: 'excel'|'csv'): Promise<void>
- exportCashDataToExcel(data: CashExportData, title: string): Promise<boolean>

## 5) Hata Yönetimi
- Merkezi yaklaşım önerilir (bkz. src/error-handler/): özel hata sınıfları (ValidationError, DatabaseError, ImportExportError, BackupError)
- Kullanıcı geri bildirimi: NotificationContext
- Loglama: electron-log

## 6) Referanslar
- Teknik Kitap – IPC Bölümü: docs/roxoepos-technical-book.md (Bölüm 18, 41)
- Tipler: client/src/types

