# Müşteri Veresiye Sistemi - Bileşen Tanımları

## 1. Giriş

Bu belge, müşteri veresiye sistemindeki performans sorunlarını çözmek için tasarlanan aylık/haftalık veri devir sisteminin bileşenlerini detaylı bir şekilde tanımlar. Sistem, mevcut verilerin ana veritabanında tutulmasını, geçmiş verilerin IndexedDB tabanlı bir arşiv veritabanına taşınmasını ve kullanıcı arayüzünde hızlı erişim için özet bilgilerin gösterilmesini sağlar.

## 2. Bileşenler

### 2.1 Veri Devir Modülü

#### 2.1.1 Arayüz

```typescript
interface DataTransferModule {
  transferData(): Promise<void>;
  ensureDataIntegrity(): Promise<void>;
  maintainTotals(): Promise<void>;
}
```

#### 2.1.2 Uygulama

```typescript
class DataTransferModuleImpl implements DataTransferModule {
  private mainDatabase: MainDatabase;
  private archiveDatabase: ArchiveDatabase;

  constructor(mainDatabase: MainDatabase, archiveDatabase: ArchiveDatabase) {
    this.mainDatabase = mainDatabase;
    this.archiveDatabase = archiveDatabase;
  }

  async transferData(): Promise<void> {
    // Mevcut veritabanından aktif verileri al
    const activeData = await this.mainDatabase.getActiveData();

    // Geçmiş verileri arşiv veritabanına taşı
    const historicalData = await this.mainDatabase.getHistoricalData();
    await this.archiveDatabase.storeData(historicalData);

    // Veri bütünlüğünü sağla
    await this.ensureDataIntegrity();
  }

  async ensureDataIntegrity(): Promise<void> {
    // Veri bütünlüğünü sağla
    const mainData = await this.mainDatabase.getAllData();
    const archiveData = await this.archiveDatabase.getAllData();

    // Veri bütünlüğünü doğrula
    if (mainData.length + archiveData.length !== (await this.mainDatabase.getTotalCount())) {
      throw new Error("Veri bütünlüğü sağlanamadı");
    }
  }

  async maintainTotals(): Promise<void> {
    // Toplamları koru
    const mainTotals = await this.mainDatabase.getTotals();
    const archiveTotals = await this.archiveDatabase.getTotals();

    // Toplamları doğrula
    if (mainTotals.totalSales + archiveTotals.totalSales !== (await this.mainDatabase.getTotalSales())) {
      throw new Error("Toplamlar korunamadı");
    }
  }
}
```

### 2.2 Arşiv Veritabanı

#### 2.2.1 Arayüz

```typescript
interface ArchiveDatabase {
  queryData(startDate: Date, endDate: Date): Promise<CreditTransaction[]>;
  ensureDataIntegrity(): Promise<void>;
  optimizePerformance(): Promise<void>;
}
```

#### 2.2.2 Uygulama

```typescript
class ArchiveDatabaseImpl implements ArchiveDatabase {
  private db: IDBDatabase;

  constructor(db: IDBDatabase) {
    this.db = db;
  }

  async queryData(startDate: Date, endDate: Date): Promise<CreditTransaction[]> {
    // Veri sorgulama
    const transaction = this.db.transaction("transactions", "readonly");
    const store = transaction.objectStore("transactions");
    const index = store.index("by_date");
    const range = IDBKeyRange.bound(startDate, endDate);
    const request = index.getAll(range);

    return new Promise<CreditTransaction[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async ensureDataIntegrity(): Promise<void> {
    // Veri bütünlüğünü sağla
    const transaction = this.db.transaction("transactions", "readonly");
    const store = transaction.objectStore("transactions");
    const request = store.getAll();

    return new Promise<void>((resolve, reject) => {
      request.onsuccess = () => {
        const data = request.result;
        // Veri bütünlüğünü doğrula
        if (data.length !== (await this.getTotalCount())) {
          reject(new Error("Veri bütünlüğü sağlanamadı"));
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async optimizePerformance(): Promise<void> {
    // Performans optimizasyonu
    const transaction = this.db.transaction("transactions", "readwrite");
    const store = transaction.objectStore("transactions");
    const request = store.createIndex("by_date", "date", { unique: false });

    return new Promise<void>((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
```

### 2.3 Kullanıcı Arayüzü

#### 2.3.1 Arayüz

```typescript
interface UserInterface {
  displaySummary(): Promise<void>;
  improveUserExperience(): Promise<void>;
}
```

#### 2.3.2 Uygulama

```typescript
class UserInterfaceImpl implements UserInterface {
  private dataTransferModule: DataTransferModule;
  private archiveDatabase: ArchiveDatabase;

  constructor(dataTransferModule: DataTransferModule, archiveDatabase: ArchiveDatabase) {
    this.dataTransferModule = dataTransferModule;
    this.archiveDatabase = archiveDatabase;
  }

  async displaySummary(): Promise<void> {
    // Özet bilgileri göster
    const summary = await this.archiveDatabase.getSummary();
    console.log("Özet Bilgiler:", summary);
  }

  async improveUserExperience(): Promise<void> {
    // Kullanıcı deneyimini iyileştir
    const userPreferences = await this.getUserPreferences();
    this.applyUserPreferences(userPreferences);
  }
}
```

## 3. Veri Yapıları

### 3.1 CreditTransaction

```typescript
interface CreditTransaction {
  id: number;
  customerId: number;
  type: 'debt' | 'payment';
  amount: number;
  date: Date;
  dueDate?: Date;
  description: string;
  status: 'active' | 'paid' | 'overdue';
  relatedSaleId?: string;
  originalAmount?: number;
  discountAmount?: number;
  discountType?: 'percentage' | 'amount';
  discountValue?: number;
}
```

### 3.2 CustomerSummary

```typescript
interface CustomerSummary {
  totalDebt: number;
  totalOverdue: number;
  lastTransactionDate?: Date;
  activeTransactions: number;
  overdueTransactions: number;
  discountedSalesCount: number;
  totalDiscount: number;
  averageDiscount?: number;
}
```

## 4. Sonuç

Bu belge, müşteri veresiye sistemindeki performans sorunlarını çözmek için tasarlanan aylık/haftalık veri devir sisteminin bileşenlerini detaylı bir şekilde tanımlar. Sistem, veri bütünlüğünü korur, performans optimizasyonu sağlar, kullanıcı deneyimini olumsuz etkilemez ve mevcut sistemle uyumludur.