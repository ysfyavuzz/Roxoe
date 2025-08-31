/**
 * IndexedDB İndeks Optimizasyon Servisi
 * Mevcut veritabanı tablolarına performans indeksleri ekler
 */

import { openDB, IDBPDatabase, IDBPTransaction } from 'idb';

import { IndexTelemetry } from '../diagnostics/indexTelemetry';
import DBVersionHelper from '../helpers/DBVersionHelper';

export interface IndexOptimizationResult {
  success: boolean;
  optimizedTables: string[];
  addedIndexes: string[];
  errors: string[];
  performanceGain?: string;
}

export class IndexOptimizer {
  
  /**
   * Tüm veritabanlarını indeks optimizasyonu için analiz eder ve optimize eder
   */
  async optimizeAllDatabases(): Promise<IndexOptimizationResult> {
    console.log('🚀 IndexedDB İndeks Optimizasyonu başlatılıyor...');

    // E2E/preview modunda ağır işlemleri atla
    // VITE_E2E_MODE build-time flag'i ile kontrol edilir
    if (import.meta.env.VITE_E2E_MODE === 'true') {
      console.log('🧪 E2E mod: gerçek optimizasyon atlandı, başarı simüle ediliyor.')
      return {
        success: true,
        optimizedTables: [],
        addedIndexes: [],
        errors: [],
        performanceGain: 'E2E mock'
      }
    }
    
    const result: IndexOptimizationResult = {
      success: true,
      optimizedTables: [],
      addedIndexes: [],
      errors: []
    };

    const databases = ['posDB', 'salesDB', 'creditDB'];

    for (const dbName of databases) {
      try {
        const dbResult = await this.optimizeDatabase(dbName);
        result.optimizedTables.push(...dbResult.optimizedTables);
        result.addedIndexes.push(...dbResult.addedIndexes);
        result.errors.push(...dbResult.errors);
        
        if (!dbResult.success) {
          result.success = false;
        }
      } catch (error) {
        console.error(`${dbName} optimizasyonu başarısız:`, error);
        result.errors.push(`${dbName}: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
        result.success = false;
      }
    }

    if (result.success) {
      result.performanceGain = this.calculatePerformanceGain(result.addedIndexes.length);
    }

    console.log('✅ İndeks optimizasyonu tamamlandı:', result);
    return result;
  }

  /**
   * Belirli bir veritabanını optimize eder
   */
  private async optimizeDatabase(dbName: string): Promise<IndexOptimizationResult> {
    const result: IndexOptimizationResult = {
      success: true,
      optimizedTables: [],
      addedIndexes: [],
      errors: []
    };

    try {
      // Mevcut veritabanı sürümünü al ve artır (indeks eklemek için)
      const currentVersion = DBVersionHelper.getVersion(dbName);
      const newVersion = currentVersion + 1;
      
      console.log(`📊 ${dbName} optimizasyonu başlatılıyor (v${currentVersion} → v${newVersion})`);

      const db = await openDB(dbName, newVersion, {
        upgrade: (db, oldVersion, newVersion, transaction) => {
          console.log(`🔧 ${dbName} şeması güncelleniyor: v${oldVersion} → v${newVersion}`);
          
          // Veritabanına göre indeks stratejileri
          switch (dbName) {
            case 'posDB':
              this.optimizePosDB(db, transaction, result);
              break;
            case 'salesDB':
              this.optimizeSalesDB(db, transaction, result);
              break;
            case 'creditDB':
              this.optimizeCreditDB(db, transaction, result);
              break;
          }
        }
      });

      // Yeni sürümü güncelle
      DBVersionHelper.setVersion(dbName, newVersion);
      
      db.close();
    } catch (error) {
      console.error(`${dbName} optimizasyon hatası:`, error);
      result.success = false;
      result.errors.push(`${dbName}: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }

    return result;
  }

  /**
   * posDB için kritik indeksleri ekler
   */
  private optimizePosDB(db: IDBPDatabase<unknown>, upgradeTx: IDBPTransaction<unknown, string[], 'versionchange'>, result: IndexOptimizationResult): void {
    console.log('🏪 posDB indeksleri optimize ediliyor...');

    // Products tablosu indeksleri
    if (db.objectStoreNames.contains('products')) {
      // Upgrade aşamasında objectStore erişimi upgradeTx üzerinden yapılır
      const productStore = upgradeTx.objectStore('products') as unknown as IDBObjectStore;
      
      // Kategori bazlı arama için indeks
      if (!Array.from(productStore.indexNames).includes('categoryIndex')) {
        productStore.createIndex('categoryIndex', 'category', { unique: false });
        result.addedIndexes.push('products.categoryIndex');
        console.log('  ✅ products.categoryIndex eklendi');
      }

      // Barkod arama için indeks  
      if (!Array.from(productStore.indexNames).includes('barcodeIndex')) {
        productStore.createIndex('barcodeIndex', 'barcode', { unique: true });
        result.addedIndexes.push('products.barcodeIndex');
        console.log('  ✅ products.barcodeIndex eklendi');
      }

      // Fiyat aralığı için indeks
      if (!Array.from(productStore.indexNames).includes('priceIndex')) {
        productStore.createIndex('priceIndex', 'price', { unique: false });
        result.addedIndexes.push('products.priceIndex');
        console.log('  ✅ products.priceIndex eklendi');
      }

      // Stok durumu için indeks
      if (!Array.from(productStore.indexNames).includes('stockIndex')) {
        productStore.createIndex('stockIndex', 'stock', { unique: false });
        result.addedIndexes.push('products.stockIndex');
        console.log('  ✅ products.stockIndex eklendi');
      }

      result.optimizedTables.push('products');
    }

    // Cash Register Sessions için tarih indeksi
    if (db.objectStoreNames.contains('cashRegisterSessions')) {
      const sessionStore = upgradeTx.objectStore('cashRegisterSessions') as unknown as IDBObjectStore;
      
      if (!Array.from(sessionStore.indexNames).includes('dateIndex')) {
        sessionStore.createIndex('dateIndex', 'date', { unique: false });
        result.addedIndexes.push('cashRegisterSessions.dateIndex');
        console.log('  ✅ cashRegisterSessions.dateIndex eklendi');
      }

      result.optimizedTables.push('cashRegisterSessions');
    }

    // Cash Transactions için tip ve tarih indeksleri
    if (db.objectStoreNames.contains('cashTransactions')) {
      const transactionStore = upgradeTx.objectStore('cashTransactions') as unknown as IDBObjectStore;
      
      if (!Array.from(transactionStore.indexNames).includes('typeIndex')) {
        transactionStore.createIndex('typeIndex', 'type', { unique: false });
        result.addedIndexes.push('cashTransactions.typeIndex');
        console.log('  ✅ cashTransactions.typeIndex eklendi');
      }

      if (!Array.from(transactionStore.indexNames).includes('dateIndex')) {
        transactionStore.createIndex('dateIndex', 'date', { unique: false });
        result.addedIndexes.push('cashTransactions.dateIndex');
        console.log('  ✅ cashTransactions.dateIndex eklendi');
      }

      result.optimizedTables.push('cashTransactions');
    }
  }

  /**
   * salesDB için kritik indeksleri ekler
   */
  private optimizeSalesDB(db: IDBPDatabase<unknown>, upgradeTx: IDBPTransaction<unknown, string[], 'versionchange'>, result: IndexOptimizationResult): void {
    console.log('💰 salesDB indeksleri optimize ediliyor...');

    if (db.objectStoreNames.contains('sales')) {
      const salesStore = upgradeTx.objectStore('sales') as unknown as IDBObjectStore;

      // Tarih bazlı sorgular için (en kritik)
      if (!Array.from(salesStore.indexNames).includes('date')) {
        salesStore.createIndex('date', 'date', { unique: false });
        result.addedIndexes.push('sales.date');
        console.log('  ✅ sales.date index eklendi - Rapor performansı artacak!');
      }

      // Toplam tutar aralığı sorguları için
      if (!Array.from(salesStore.indexNames).includes('total')) {
        salesStore.createIndex('total', 'total', { unique: false });
        result.addedIndexes.push('sales.total');
        console.log('  ✅ sales.total index eklendi');
      }

      // Müşteri bazlı sorgular için 
      if (!Array.from(salesStore.indexNames).includes('customerId')) {
        salesStore.createIndex('customerId', 'customerId', { unique: false });
        result.addedIndexes.push('sales.customerId');
        console.log('  ✅ sales.customerId index eklendi');
      }

      // Ödeme yöntemi filtreleme için (veri alanı paymentMethod)
      if (!Array.from(salesStore.indexNames).includes('paymentMethod')) {
        salesStore.createIndex('paymentMethod', 'paymentMethod', { unique: false });
        result.addedIndexes.push('sales.paymentMethod');
        console.log('  ✅ sales.paymentMethod index eklendi');
      }

      // Durum filtresi için
      if (!Array.from(salesStore.indexNames).includes('status')) {
        salesStore.createIndex('status', 'status', { unique: false });
        result.addedIndexes.push('sales.status');
        console.log('  ✅ sales.status index eklendi');
      }

      // Bileşik indeks: tarih ve toplam (rapor için kritik)
      if (!Array.from(salesStore.indexNames).includes('dateAndTotalIndex')) {
        salesStore.createIndex('dateAndTotalIndex', ['date', 'total'], { unique: false });
        result.addedIndexes.push('sales.dateAndTotalIndex');
        console.log('  ✅ sales.dateAndTotalIndex eklendi - Performans raporu hızlanacak!');
      }

      result.optimizedTables.push('sales');
    }
  }

  /**
   * creditDB için kritik indeksleri ekler
   */
  private optimizeCreditDB(db: IDBPDatabase<unknown>, upgradeTx: IDBPTransaction<unknown, string[], 'versionchange'>, result: IndexOptimizationResult): void {
    console.log('💳 creditDB indeksleri optimize ediliyor...');

    // Customers tablosu
    if (db.objectStoreNames.contains('customers')) {
      const customerStore = upgradeTx.objectStore('customers') as unknown as IDBObjectStore;

      // İsim bazlı arama için
      if (!Array.from(customerStore.indexNames).includes('nameIndex')) {
        customerStore.createIndex('nameIndex', 'name', { unique: false });
        result.addedIndexes.push('customers.nameIndex');
        console.log('  ✅ customers.nameIndex eklendi');
      }

      // Telefon numarası arama için
      if (!Array.from(customerStore.indexNames).includes('phoneIndex')) {
        customerStore.createIndex('phoneIndex', 'phone', { unique: false });
        result.addedIndexes.push('customers.phoneIndex');
        console.log('  ✅ customers.phoneIndex eklendi');
      }

      result.optimizedTables.push('customers');
    }

    // Transactions tablosu
    if (db.objectStoreNames.contains('transactions')) {
      const transactionStore = upgradeTx.objectStore('transactions') as unknown as IDBObjectStore;

      // Müşteri bazlı işlemler için
      if (!Array.from(transactionStore.indexNames).includes('customerIdIndex')) {
        transactionStore.createIndex('customerIdIndex', 'customerId', { unique: false });
        result.addedIndexes.push('transactions.customerIdIndex');
        console.log('  ✅ transactions.customerIdIndex eklendi');
      }

      // İşlem türü filtreleme için
      if (!Array.from(transactionStore.indexNames).includes('typeIndex')) {
        transactionStore.createIndex('typeIndex', 'type', { unique: false });
        result.addedIndexes.push('transactions.typeIndex');
        console.log('  ✅ transactions.typeIndex eklendi');
      }

      // Tarih bazlı sorgular için
      if (!Array.from(transactionStore.indexNames).includes('dateIndex')) {
        transactionStore.createIndex('dateIndex', 'date', { unique: false });
        result.addedIndexes.push('transactions.dateIndex');
        console.log('  ✅ transactions.dateIndex eklendi');
      }

      result.optimizedTables.push('transactions');
    }
  }

  /**
   * Performans kazancını hesaplar
   */
  private calculatePerformanceGain(indexCount: number): string {
    if (indexCount === 0) {return 'Hiç indeks eklenmedi';}
    
    // Ortalama performans kazancı tahmini
    const estimatedGain = Math.min(indexCount * 15, 80); // Max %80
    
    return `Tahmini %${estimatedGain} performans artışı (${indexCount} indeks eklendi)`;
  }

  /**
   * Mevcut indeksleri listeler (debug için)
   */
  async listCurrentIndexes(): Promise<Record<string, Record<string, string[]> | { error: string }>> {
    const result: Record<string, Record<string, string[]> | { error: string }> = {};
    const databases = ['posDB', 'salesDB', 'creditDB'];

    for (const dbName of databases) {
      try {
        const db = await openDB(dbName);
        const dbInfo: Record<string, string[]> = {};
        
        for (const storeName of Array.from(db.objectStoreNames)) {
          const transaction = db.transaction(storeName, 'readonly');
          const store = transaction.objectStore(storeName);
          dbInfo[storeName] = Array.from(store.indexNames);
        }
        
        result[dbName] = dbInfo;
        db.close();
      } catch (error) {
        result[dbName] = { error: error instanceof Error ? error.message : 'Bilinmeyen hata' };
      }
    }

    return result;
  }
}

// Guard loglarından eksik indeks adaylarını raporlayan yardımcı fonksiyon
export function reportMissingIndexCandidates(): Array<{ db: string; store: string; index: string; count: number }> {
  try {
    return IndexTelemetry.getMissingIndexCandidates()
  } catch (e) {
    console.warn('[IndexOptimizer] Eksik indeks adayları raporu alınamadı:', e)
    return []
  }
}

// Singleton pattern için
export const indexOptimizer = new IndexOptimizer();