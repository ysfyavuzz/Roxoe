# Görsel Diyagramlar (Mermaid)

[← Teknik Kitap’a Dön](roxoepos-technical-book.md) · [Genel Kitap](BOOK/roxoepos-book.md)

Bu dosya, RoxoePOS mimarisi ve akışları için Mermaid tabanlı görsel diyagramları içerir. GitHub ve birçok Markdown görüntüleyici mermaid bloklarını doğrudan render eder.

## Component Diagram (Genel Mimari)
```mermaid
graph TD
  R[Renderer (React + TS)] -->|IPC| P[Preload (contextBridge)]
  P -->|IPC| M[Main (Electron)]
  R -->|idb| IDB[(IndexedDB)]
  M -->|fs| FS[(File System)]
  subgraph Renderer Services
    SRV[productDB/salesDB/receiptService/import-export]
  end
  R --> SRV
  subgraph Backup Core (Main)
    BM[BackupManager]
    OBM[OptimizedBackupManager]
  end
  M --> BM
  M --> OBM
  BM --> FS
  OBM --> FS
```

## Sequence Diagram – Satış Akışı
```mermaid
sequenceDiagram
  participant U as User
  participant PP as ProductPanel
  participant UC as useCart
  participant PC as PaymentControls
  participant S as salesDB
  participant R as receiptService

  U->>PP: Ürün seç/ara
  PP->>UC: addItem(product)
  U->>PC: Ödeme ve indirim girişleri
  PC->>S: addSale(sale)
  S->>R: generatePDF(receipt)
  R-->>U: PDF indirilebilir çıktı
```

## Sequence Diagram – Yedekleme Köprüsü
```mermaid
sequenceDiagram
  participant REN as Renderer
  participant PRE as Preload
  participant MAIN as Electron Main
  participant CORE as BackupCore

  REN->>MAIN: create-backup-bridge(options)
  MAIN->>CORE: createSmartBackup()
  CORE-->>MAIN: progress(stage, %)
  MAIN-->>REN: backup-progress
  MAIN-->>REN: result(success, metadata)
```

## Flowchart – Geri Yükleme Akışı
```mermaid
flowchart LR
  A[restore-backup-bridge(content)] --> B[deserialize JSON]
  B --> C[base64 encode]
  C --> D[db-import-base64 (main -> renderer)]
  D --> E[IndexedDBImporter yaz]
  E --> F[db-import-response success]
  F --> G{Başarılı?}
  G -- Evet --> H[Metadata kullanıcıya iletilir]
  G -- Hayır --> I[Hata mesajı ve iptal]
```

---

## Sequence Diagram – Settings Akışı
```mermaid
sequenceDiagram
  participant U as User
  participant ST as SettingsPage
  participant SRV as Services
  participant IDB as IndexedDB

  U->>ST: Ayarlar sekmesini aç
  ST->>SRV: getSettings()
  SRV->>IDB: read settings store
  IDB-->>SRV: settings
  SRV-->>ST: settings
  U->>ST: Yedek dizini seç
  ST->>SRV: setBackupDirectory(path)
  SRV-->>ST: { success }
```

## Sequence Diagram – Dashboard Akışı
```mermaid
sequenceDiagram
  participant U as User
  participant DB as dashboardStats
  participant SRV as salesDB/productDB
  participant UI as DashboardPage

  U->>UI: Dashboard aç
  UI->>SRV: getSalesSummary(range)
  UI->>SRV: getLowStockProducts()
  SRV-->>UI: summary + list
  UI->>DB: compute KPIs
  DB-->>UI: kpi values
  UI-->>U: grafikler ve metrikler
```

## Sequence Diagram – Hata Yönetimi (Renderer)
```mermaid
sequenceDiagram
  participant UI as React UI
  participant EB as ErrorBoundary
  participant EH as ErrorHandler
  participant S as Sentry

  UI->>EB: Render sırasında hata throw
  EB->>EH: componentDidCatch(error, info)
  alt Sentry etkin
    EH->>S: captureException(error)
  end
  EH-->>UI: fallback UI (Yenile butonu)
```

