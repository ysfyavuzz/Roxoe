/**
 * dataRotationService.ts
 * Veri devir servisi - aktif verileri ana veritabanında tutarken,
 * geçmiş verileri arşiv veritabanına taşır ve toplamları korur
 */

import { openDB } from 'idb';

import DBVersionHelper from '../helpers/DBVersionHelper';
import { Customer, CreditTransaction, CustomerSummary } from "../types/credit";

import { creditService } from './creditServices';

interface DataRotationConfig {
  enabled: boolean;
  retentionDays: number; // Verileri ana veritabanında tutma süresi (gün)
  batchSize: number; // İşlemleri batch'ler halinde yap
  autoRotate: boolean; // Otomatik devir etkinliği
  rotationFrequency: 'daily' | 'weekly' | 'monthly';
}

interface RotationResult {
  success: boolean;
  rotatedCount: number;
  totalProcessed: number;
  errors: string[];
  duration: number; // milisaniye
  rotatedRecords: RotatedTransactionInfo[];
}

interface RotatedTransactionInfo {
  transactionId: number;
  customerId: number;
  rotationDate: Date;
  originalDate: Date;
  amount: number;
  type: CreditTransaction['type'];
}

interface ArchiveDatabaseStats {
  totalArchived: number;
  lastRotationDate: Date | null;
  activeRecordsCount: number;
  archivedRecordsCount: number;
  sizeReduction: number; // yüzde
  performanceGain: number; // tahmini yüzde
}

export class DataRotationService {
  private readonly ARCHIVE_DB_NAME = 'creditArchiveDB';
  private readonly ARCHIVE_STORE_NAME = 'archivedTransactions';
  private readonly CONFIG_KEY = 'rotationConfig';
  private readonly STATS_KEY = 'rotationStats';

  // Varsayılan yapılandırma
  private defaultConfig: DataRotationConfig = {
    enabled: false,
    retentionDays: 365, // 1 yıl
    batchSize: 50,
    autoRotate: true,
    rotationFrequency: 'monthly',
  };

  // Güvenli JSON parse yardımcı metodu
  private safeParseJson<T>(raw: string | null, fallback: T): T {
    if (!raw) { return fallback; }
    try { return JSON.parse(raw) as T; } catch { return fallback; }
  }

  /**
   * Arşiv veritabanını başlat
   */
  private async initArchiveDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const dbVersion = DBVersionHelper.getVersion(this.ARCHIVE_DB_NAME);
      const request = indexedDB.open(this.ARCHIVE_DB_NAME, dbVersion);

      request.onupgradeneeded = (event) => {
        const db = request.result;
        console.log(`🗄️ Upgrading ${this.ARCHIVE_DB_NAME} from ${event.oldVersion} to ${event.newVersion}`);

        if (!db.objectStoreNames.contains(this.ARCHIVE_STORE_NAME)) {
          const store = db.createObjectStore(this.ARCHIVE_STORE_NAME, { keyPath: 'transactionId' });

          // Arşiv verileri için indeksler oluştur
          store.createIndex('customerIdIndex', 'customerId', { unique: false });
          store.createIndex('rotationDateIndex', 'rotationDate', { unique: false });
          store.createIndex('originalDateIndex', 'originalDate', { unique: false });
          store.createIndex('typeIndex', 'type', { unique: false });
          store.createIndex('amountIndex', 'amount', { unique: false });

          console.log(`✅ Created ${this.ARCHIVE_STORE_NAME} store with indexes`);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Mevcut yapılandırmayı al
   */
  getConfig(): DataRotationConfig {
    const stored = this.safeParseJson<Partial<DataRotationConfig>>(localStorage.getItem(this.CONFIG_KEY), {});
    return { ...this.defaultConfig, ...stored };
  }

  /**
   * Yapılandırmayı güncelle
   */
  updateConfig(config: Partial<DataRotationConfig>): void {
    const current = this.getConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(this.CONFIG_KEY, JSON.stringify(updated));
    console.log('📝 Rotation configuration updated:', updated);
  }

  /**
   * Arşiv istatistiklerini al
   */
  async getStats(): Promise<ArchiveDatabaseStats> {
    try {
      type StoredStats = {
        totalArchived: number;
        lastRotationDate: string | null;
        sizeReduction: number;
        performanceGain: number;
      };

      const stored = this.safeParseJson<StoredStats | null>(localStorage.getItem(this.STATS_KEY), null);
      const baseStats: StoredStats = stored ?? {
        totalArchived: 0,
        lastRotationDate: null,
        sizeReduction: 0,
        performanceGain: 0
      };

      // Mevcut kayıt sayılarını al
      const activeTransactions = await creditService.getAllTransactions();
      const archivedTransactions = await this.getArchivedTransactions();

      return {
        totalArchived: baseStats.totalArchived,
        lastRotationDate: baseStats.lastRotationDate ? new Date(baseStats.lastRotationDate) : null,
        activeRecordsCount: activeTransactions.length,
        archivedRecordsCount: archivedTransactions.length,
        sizeReduction: baseStats.sizeReduction,
        performanceGain: baseStats.performanceGain
      };
    } catch (error) {
      console.error('Error getting rotation stats:', error);
      return {
        totalArchived: 0,
        lastRotationDate: null,
        activeRecordsCount: 0,
        archivedRecordsCount: 0,
        sizeReduction: 0,
        performanceGain: 0
      };
    }
  }

  /**
   * İstatistikleri güncelle
   */
  private async updateStats(rotatedCount: number, sizeReduction: number): Promise<void> {
    const current = await this.getStats();
    const updated = {
      totalArchived: (current.totalArchived || 0) + rotatedCount,
      lastRotationDate: new Date().toISOString(),
      sizeReduction: Math.max(sizeReduction, current.sizeReduction || 0),
      performanceGain: Math.min(sizeReduction * 1.2, 50) // Tahmini performans kazancı
    };
    localStorage.setItem(this.STATS_KEY, JSON.stringify(updated));
  }

  /**
   * Devir edilecek işlemleri belirle
   */
  async identifyTransactionsToRotate(): Promise<CreditTransaction[]> {
    const config = this.getConfig();
    if (!config.enabled) { return []; }

    const allTransactions = await creditService.getAllTransactions();
    const now = new Date();
    const recordsToRotate: CreditTransaction[] = [];

    for (const transaction of allTransactions) {
      const transactionDate = new Date(transaction.date);
      const daysDiff = Math.floor((now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));

      // Sadece ödenmiş ve vadesi geçmiş işlemleri devir et
      const shouldRotate = transaction.status === 'paid' || transaction.status === 'overdue';
      const isOldEnough = daysDiff > config.retentionDays;

      if (shouldRotate && isOldEnough) {
        recordsToRotate.push(transaction);
      }
    }

    console.log(`🔍 Found ${recordsToRotate.length} transactions ready for rotation`);
    return recordsToRotate;
  }

  /**
   * İşlemleri devir et
   */
  async rotateTransactions(transactions: CreditTransaction[]): Promise<RotationResult> {
    const startTime = Date.now();
    const result: RotationResult = {
      success: true,
      rotatedCount: 0,
      totalProcessed: transactions.length,
      errors: [],
      duration: 0,
      rotatedRecords: []
    };

    if (transactions.length === 0) {
      result.duration = Date.now() - startTime;
      return result;
    }

    try {
      const archiveDb = await this.initArchiveDB();
      const config = this.getConfig();

      // Batch'ler halinde işle
      for (let i = 0; i < transactions.length; i += config.batchSize) {
        const batch = transactions.slice(i, i + config.batchSize);

        try {
          await this.processBatch(batch, archiveDb, result);

          // UI'yi bloke etmemek için küçük gecikme
          if (i + config.batchSize < transactions.length) {
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        } catch (error) {
          const errorMsg = `Batch ${Math.floor(i / config.batchSize) + 1} error: ${error instanceof Error ? error.message : 'Unknown error'}`;
          result.errors.push(errorMsg);
          console.error(errorMsg, error);
        }
      }

      // Boyut azalmasını hesapla
      const originalCount = await creditService.getAllTransactions();
      const sizeReduction = Math.round((result.rotatedCount / (originalCount.length + result.rotatedCount)) * 100);

      // İstatistikleri güncelle
      await this.updateStats(result.rotatedCount, sizeReduction);

      result.success = result.errors.length === 0;
      result.duration = Date.now() - startTime;

      console.log(`✅ Rotation operation completed: ${result.rotatedCount}/${result.totalProcessed} records rotated in ${result.duration}ms`);

    } catch (error) {
      result.success = false;
      result.errors.push(`Rotation operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Rotation operation failed:', error);
    }

    return result;
  }

  /**
   * Batch işleme
   */
  private async processBatch(batch: CreditTransaction[], archiveDb: IDBDatabase, result: RotationResult): Promise<void> {
    const transaction = archiveDb.transaction([this.ARCHIVE_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(this.ARCHIVE_STORE_NAME);

    for (const tx of batch) {
      try {
        // Arşiv kaydını oluştur
        const archivedRecord = {
          transactionId: tx.id,
          customerId: tx.customerId,
          rotationDate: new Date(),
          originalDate: tx.date,
          amount: tx.amount,
          type: tx.type,
          status: tx.status,
          description: tx.description,
          dueDate: tx.dueDate,
          relatedSaleId: tx.relatedSaleId,
          originalAmount: tx.originalAmount,
          discountAmount: tx.discountAmount,
          discountType: tx.discountType,
          discountValue: tx.discountValue
        };

        // Arşiv veritabanına ekle
        await new Promise<void>((resolve, reject) => {
          const request = store.put(archivedRecord);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });

        // Ana veritabanından sil
        await this.removeTransactionFromMainDB(tx.id);

        // Devir edilen kaydı takip et
        result.rotatedRecords.push({
          transactionId: tx.id,
          customerId: tx.customerId,
          rotationDate: new Date(),
          originalDate: tx.date,
          amount: tx.amount,
          type: tx.type
        });

        result.rotatedCount++;

      } catch (error) {
        const errorMsg = `Failed to rotate transaction ${tx.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        result.errors.push(errorMsg);
        console.error(errorMsg, error);
      }
    }
  }

  /**
   * Ana veritabanından işlemi sil
   */
  private async removeTransactionFromMainDB(transactionId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('creditDB');
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['transactions'], 'readwrite');
        const store = transaction.objectStore('transactions');
        const deleteRequest = store.delete(transactionId);

        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => reject(deleteRequest.error);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Tüm arşivlenmiş işlemleri al
   */
  async getArchivedTransactions(): Promise<CreditTransaction[]> {
    try {
      const db = await this.initArchiveDB();
      return new Promise<CreditTransaction[]>((resolve, reject) => {
        const transaction = db.transaction([this.ARCHIVE_STORE_NAME], 'readonly');
        const store = transaction.objectStore(this.ARCHIVE_STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result as CreditTransaction[]);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting archived transactions:', error);
      return [];
    }
  }

  /**
   * Arşivlenmiş işlemleri sorgula
   */
  async searchArchivedTransactions(query: {
    startDate?: Date;
    endDate?: Date;
    customerId?: number;
    type?: CreditTransaction['type'];
    status?: CreditTransaction['status'];
  }): Promise<CreditTransaction[]> {
    const allArchived = await this.getArchivedTransactions();

    return allArchived.filter(tx => {
      if (query.startDate && new Date(tx.date) < query.startDate) { return false; }
      if (query.endDate && new Date(tx.date) > query.endDate) { return false; }
      if (query.customerId && tx.customerId !== query.customerId) { return false; }
      if (query.type && tx.type !== query.type) { return false; }
      if (query.status && tx.status !== query.status) { return false; }
      return true;
    });
  }

  /**
   * Arşivlenmiş kaydı geri yükle
   */
  async restoreArchivedTransaction(transactionId: number): Promise<boolean> {
    try {
      const db = await this.initArchiveDB();

      // Arşivlenmiş kaydı al
      const archivedTransaction = await new Promise<CreditTransaction | undefined>((resolve, reject) => {
        const transaction = db.transaction([this.ARCHIVE_STORE_NAME], 'readonly');
        const store = transaction.objectStore(this.ARCHIVE_STORE_NAME);
        const request = store.get(transactionId);

        request.onsuccess = () => resolve(request.result as CreditTransaction | undefined);
        request.onerror = () => reject(request.error);
      });

      if (!archivedTransaction) {
        console.error('Archived transaction not found:', transactionId);
        return false;
      }

      // Ana veritabanına geri yükle
      const txData = { ...archivedTransaction };
      // Remove rotation metadata if present
      if ('rotationDate' in txData) {
        delete (txData as Record<string, unknown>).rotationDate;
      }
      await creditService.addTransaction(txData as Omit<CreditTransaction, 'id' | 'status'>);

      // Arşivden sil
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([this.ARCHIVE_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.ARCHIVE_STORE_NAME);
        const request = store.delete(transactionId);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      console.log(`✅ Restored archived transaction: ${transactionId}`);
      return true;

    } catch (error) {
      console.error('Error restoring archived transaction:', error);
      return false;
    }
  }

  /**
   * Otomatik devir işlemi
   */
  async performAutoRotation(): Promise<RotationResult> {
    console.log('🤖 Starting automatic rotation...');

    const config = this.getConfig();
    if (!config.enabled || !config.autoRotate) {
      console.log('⏸️ Auto rotation is disabled');
      return {
        success: true,
        rotatedCount: 0,
        totalProcessed: 0,
        errors: [],
        duration: 0,
        rotatedRecords: []
      };
    }

    const recordsToRotate = await this.identifyTransactionsToRotate();
    return await this.rotateTransactions(recordsToRotate);
  }

  /**
   * Arşiv özeti al
   */
  async getRotationSummary(): Promise<{
    pendingRotation: number;
    canSaveSpace: number; // MB tahmini
    recommendedAction: string;
  }> {
    const recordsToRotate = await this.identifyTransactionsToRotate();
    const estimatedSize = recordsToRotate.length * 1; // Tahmini: 1KB başına kayıt
    const sizeMB = Math.round(estimatedSize / 1024);

    let recommendedAction = 'None';
    if (recordsToRotate.length > 100) {
      recommendedAction = 'Rotate now to improve performance';
    } else if (recordsToRotate.length > 50) {
      recommendedAction = 'Consider rotating soon';
    }

    return {
      pendingRotation: recordsToRotate.length,
      canSaveSpace: sizeMB,
      recommendedAction
    };
  }

  /**
   * Müşteri özeti için arşiv verilerini dahil et
   */
  async getCustomerSummaryWithArchive(customerId: number): Promise<CustomerSummary> {
    // Mevcut özeti al
    const currentSummary = await creditService.getCustomerSummary(customerId);

    // Arşivden ilgili işlemleri al
    const archivedTransactions = await this.searchArchivedTransactions({
      customerId: customerId
    });

    // Arşiv verilerini özet bilgilerine dahil et
    const archivedDebt = archivedTransactions
      .filter(t => t.type === 'debt' && (t.status === 'paid' || t.status === 'overdue'))
      .reduce((sum, t) => sum + t.amount, 0);

    const archivedOverdue = archivedTransactions
      .filter(t => t.status === 'overdue')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      ...currentSummary,
      totalDebt: currentSummary.totalDebt + archivedDebt,
      totalOverdue: currentSummary.totalOverdue + archivedOverdue,
      // Diğer alanları güncelle
    };
  }
}

export const dataRotationService = new DataRotationService();