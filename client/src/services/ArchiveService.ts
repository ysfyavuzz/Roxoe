/**
 * ArchiveService.ts
 * Comprehensive data archiving service for old sales records
 * Automatically moves old sales data to archive database to improve performance
 */

import DBVersionHelper from '../helpers/DBVersionHelper';
import { Sale } from '../types/sales';

import { salesDB } from './salesDB';

// Archive configuration interface
export interface ArchiveConfig {
  enabled: boolean;
  retentionDays: number; // Keep records for this many days before archiving
  batchSize: number; // Process records in batches to avoid UI blocking
  autoArchive: boolean; // Enable automatic archiving
  archiveFrequency: 'daily' | 'weekly' | 'monthly';
  keepCompletedSales: boolean; // Keep completed sales longer than cancelled/refunded
  completedRetentionDays: number; // Separate retention for completed sales
}

// Archive operation result interface
export interface ArchiveResult {
  success: boolean;
  archivedCount: number;
  totalProcessed: number;
  errors: string[];
  duration: number; // milliseconds
  archivedRecords: ArchivedSalesInfo[];
}

// Archived sales information
export interface ArchivedSalesInfo {
  originalId: string;
  receiptNo: string;
  archiveDate: Date;
  originalDate: Date;
  total: number;
  status: Sale['status'];
}

// Arşivde tutulan satış kaydının tam yapısı
export type ArchivedSaleRecord = Sale & {
  originalId: string;
  archiveDate: Date;
  originalDate: Date;
};

// Archive statistics
export interface ArchiveStats {
  totalArchived: number;
  lastArchiveDate: Date | null;
  activeRecordsCount: number;
  archivedRecordsCount: number;
  sizeReduction: number; // percentage
  performanceGain: number; // estimated percentage
}

export class ArchiveService {
  private readonly ARCHIVE_DB_NAME = 'salesArchiveDB';
  private readonly ARCHIVE_STORE_NAME = 'archivedSales';
  private readonly CONFIG_KEY = 'archiveConfig';
  private readonly STATS_KEY = 'archiveStats';

  // Default configuration
  private defaultConfig: ArchiveConfig = {
    enabled: false,
    retentionDays: 365, // 1 year
    batchSize: 50,
    autoArchive: true,
    archiveFrequency: 'monthly',
    keepCompletedSales: true,
    completedRetentionDays: 730 // 2 years for completed sales
  };

  // Güvenli JSON parse yardımcı metodu
  private safeParseJson<T>(raw: string | null, fallback: T): T {
    if (!raw) { return fallback; }
    try { return JSON.parse(raw) as T; } catch { return fallback; }
  }

  /**
   * Initialize archive database
   */
  private async initArchiveDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const dbVersion = DBVersionHelper.getVersion(this.ARCHIVE_DB_NAME);
      const request = indexedDB.open(this.ARCHIVE_DB_NAME, dbVersion);

      request.onupgradeneeded = (event) => {
        const db = request.result;
        console.log(`🗄️ Upgrading ${this.ARCHIVE_DB_NAME} from ${event.oldVersion} to ${event.newVersion}`);
        
        if (!db.objectStoreNames.contains(this.ARCHIVE_STORE_NAME)) {
          const store = db.createObjectStore(this.ARCHIVE_STORE_NAME, { keyPath: 'originalId' });
          
          // Create indexes for archived data
          store.createIndex('archiveDateIndex', 'archiveDate', { unique: false });
          store.createIndex('originalDateIndex', 'originalDate', { unique: false });
          store.createIndex('receiptNoIndex', 'receiptNo', { unique: false });
          store.createIndex('statusIndex', 'status', { unique: false });
          store.createIndex('totalIndex', 'total', { unique: false });
          
          console.log(`✅ Created ${this.ARCHIVE_STORE_NAME} store with indexes`);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get current archive configuration
   */
  getConfig(): ArchiveConfig {
    const stored = this.safeParseJson<Partial<ArchiveConfig>>(localStorage.getItem(this.CONFIG_KEY), {});
    return { ...this.defaultConfig, ...stored };
  }

  /**
   * Update archive configuration
   */
  updateConfig(config: Partial<ArchiveConfig>): void {
    const current = this.getConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(this.CONFIG_KEY, JSON.stringify(updated));
    console.log('📝 Archive configuration updated:', updated);
  }

  /**
   * Get archive statistics
   */
  async getStats(): Promise<ArchiveStats> {
    try {
      type StoredStats = {
        totalArchived: number;
        lastArchiveDate: string | null;
        sizeReduction: number;
        performanceGain: number;
      };

      const stored = this.safeParseJson<StoredStats | null>(localStorage.getItem(this.STATS_KEY), null);
      const baseStats: StoredStats = stored ?? {
        totalArchived: 0,
        lastArchiveDate: null,
        sizeReduction: 0,
        performanceGain: 0
      };

      // Get current record counts
      const activeSales = await salesDB.getAllSales();
      const archivedSales = await this.getArchivedSales();

      return {
        totalArchived: baseStats.totalArchived,
        lastArchiveDate: baseStats.lastArchiveDate ? new Date(baseStats.lastArchiveDate) : null,
        activeRecordsCount: activeSales.length,
        archivedRecordsCount: archivedSales.length,
        sizeReduction: baseStats.sizeReduction,
        performanceGain: baseStats.performanceGain
      };
    } catch (error) {
      console.error('Error getting archive stats:', error);
      return {
        totalArchived: 0,
        lastArchiveDate: null,
        activeRecordsCount: 0,
        archivedRecordsCount: 0,
        sizeReduction: 0,
        performanceGain: 0
      };
    }
  }

  /**
   * Update archive statistics
   */
  private async updateStats(archivedCount: number, sizeReduction: number): Promise<void> {
    const current = await this.getStats();
    const updated = {
      totalArchived: (current.totalArchived || 0) + archivedCount,
      lastArchiveDate: new Date().toISOString(),
      sizeReduction: Math.max(sizeReduction, current.sizeReduction || 0),
      performanceGain: Math.min(sizeReduction * 1.2, 50) // Estimate performance gain
    };
    localStorage.setItem(this.STATS_KEY, JSON.stringify(updated));
  }

  /**
   * Identify sales records that should be archived
   */
  async identifyRecordsToArchive(): Promise<Sale[]> {
    const config = this.getConfig();
    if (!config.enabled) {return [];}

    const allSales = await salesDB.getAllSales();
    const now = new Date();
    const recordsToArchive: Sale[] = [];

    for (const sale of allSales) {
      const saleDate = new Date(sale.date);
      const daysDiff = Math.floor((now.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24));

      let shouldArchive = false;

      if (config.keepCompletedSales && sale.status === 'completed') {
        // Use longer retention for completed sales
        shouldArchive = daysDiff > config.completedRetentionDays;
      } else {
        // Use standard retention for cancelled/refunded sales
        shouldArchive = daysDiff > config.retentionDays;
      }

      if (shouldArchive) {
        recordsToArchive.push(sale);
      }
    }

    console.log(`🔍 Found ${recordsToArchive.length} records ready for archiving`);
    return recordsToArchive;
  }

  /**
   * Archive specific sales records
   */
  async archiveRecords(records: Sale[]): Promise<ArchiveResult> {
    const startTime = Date.now();
    const result: ArchiveResult = {
      success: true,
      archivedCount: 0,
      totalProcessed: records.length,
      errors: [],
      duration: 0,
      archivedRecords: []
    };

    if (records.length === 0) {
      result.duration = Date.now() - startTime;
      return result;
    }

    try {
      const archiveDb = await this.initArchiveDB();
      const config = this.getConfig();

      // Process in batches to avoid blocking UI
      for (let i = 0; i < records.length; i += config.batchSize) {
        const batch = records.slice(i, i + config.batchSize);
        
        try {
          await this.processBatch(batch, archiveDb, result);
          
          // Small delay between batches to keep UI responsive
          if (i + config.batchSize < records.length) {
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        } catch (error) {
          const errorMsg = `Batch ${Math.floor(i / config.batchSize) + 1} error: ${error instanceof Error ? error.message : 'Unknown error'}`;
          result.errors.push(errorMsg);
          console.error(errorMsg, error);
        }
      }

      // Calculate size reduction
      const originalCount = await salesDB.getAllSales();
      const sizeReduction = Math.round((result.archivedCount / (originalCount.length + result.archivedCount)) * 100);

      // Update statistics
      await this.updateStats(result.archivedCount, sizeReduction);

      result.success = result.errors.length === 0;
      result.duration = Date.now() - startTime;

      console.log(`✅ Archive operation completed: ${result.archivedCount}/${result.totalProcessed} records archived in ${result.duration}ms`);
      
    } catch (error) {
      result.success = false;
      result.errors.push(`Archive operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Archive operation failed:', error);
    }

    return result;
  }

  /**
   * Process a batch of records for archiving
   */
  private async processBatch(batch: Sale[], archiveDb: IDBDatabase, result: ArchiveResult): Promise<void> {
    const transaction = archiveDb.transaction([this.ARCHIVE_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(this.ARCHIVE_STORE_NAME);

    for (const sale of batch) {
      try {
        // Create archived record
        const archivedRecord = {
          ...sale,
          originalId: sale.id,
          archiveDate: new Date(),
          originalDate: sale.date
        };

        // Add to archive database
        await new Promise<void>((resolve, reject) => {
          const request = store.put(archivedRecord);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });

        // Remove from main database
        await this.removeSaleFromMainDB(sale.id);

        // Track archived record
        result.archivedRecords.push({
          originalId: sale.id,
          receiptNo: sale.receiptNo,
          archiveDate: new Date(),
          originalDate: sale.date,
          total: sale.total,
          status: sale.status
        });

        result.archivedCount++;
        
      } catch (error) {
        const errorMsg = `Failed to archive sale ${sale.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        result.errors.push(errorMsg);
        console.error(errorMsg, error);
      }
    }
  }

  /**
   * Remove sale from main database
   */
  private async removeSaleFromMainDB(saleId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('salesDB');
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['sales'], 'readwrite');
        const store = transaction.objectStore('sales');
        const deleteRequest = store.delete(saleId);
        
        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => reject(deleteRequest.error);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all archived sales
   */
  async getArchivedSales(): Promise<ArchivedSaleRecord[]> {
    try {
      const db = await this.initArchiveDB();
      return new Promise<ArchivedSaleRecord[]>((resolve, reject) => {
        const transaction = db.transaction([this.ARCHIVE_STORE_NAME], 'readonly');
        const store = transaction.objectStore(this.ARCHIVE_STORE_NAME);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result as ArchivedSaleRecord[]);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting archived sales:', error);
      return [];
    }
  }

  /**
   * Search archived sales
   */
  async searchArchivedSales(query: {
    startDate?: Date;
    endDate?: Date;
    receiptNo?: string;
    status?: Sale['status'];
  }): Promise<ArchivedSaleRecord[]> {
    const allArchived = await this.getArchivedSales();
    
    return allArchived.filter(sale => {
      if (query.startDate && new Date(sale.originalDate) < query.startDate) {return false;}
      if (query.endDate && new Date(sale.originalDate) > query.endDate) {return false;}
      if (query.receiptNo && !sale.receiptNo.includes(query.receiptNo)) {return false;}
      if (query.status && sale.status !== query.status) {return false;}
      return true;
    });
  }

  /**
   * Restore archived record back to main database
   */
  async restoreArchivedRecord(originalId: string): Promise<boolean> {
    try {
      const db = await this.initArchiveDB();
      
      // Get archived record
      const archivedSale = await new Promise<ArchivedSaleRecord | undefined>((resolve, reject) => {
        const transaction = db.transaction([this.ARCHIVE_STORE_NAME], 'readonly');
        const store = transaction.objectStore(this.ARCHIVE_STORE_NAME);
        const request = store.get(originalId);
        
        request.onsuccess = () => resolve(request.result as ArchivedSaleRecord | undefined);
        request.onerror = () => reject(request.error);
      });

      if (!archivedSale) {
        console.error('Archived record not found:', originalId);
        return false;
      }

      // Restore to main database
      const { archiveDate, originalId: _, originalDate, ...saleData } = archivedSale;
      await salesDB.addSale(saleData as Omit<Sale, 'id'>);

      // Remove from archive
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([this.ARCHIVE_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.ARCHIVE_STORE_NAME);
        const request = store.delete(originalId);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      console.log(`✅ Restored archived record: ${originalId}`);
      return true;
      
    } catch (error) {
      console.error('Error restoring archived record:', error);
      return false;
    }
  }

  /**
   * Perform automatic archiving based on configuration
   */
  async performAutoArchive(): Promise<ArchiveResult> {
    console.log('🤖 Starting automatic archiving...');
    
    const config = this.getConfig();
    if (!config.enabled || !config.autoArchive) {
      console.log('⏸️ Auto archiving is disabled');
      return {
        success: true,
        archivedCount: 0,
        totalProcessed: 0,
        errors: [],
        duration: 0,
        archivedRecords: []
      };
    }

    const recordsToArchive = await this.identifyRecordsToArchive();
    return await this.archiveRecords(recordsToArchive);
  }

  /**
   * Get archive summary for display
   */
  async getArchiveSummary(): Promise<{
    pendingArchive: number;
    canSaveSpace: number; // MB estimate
    recommendedAction: string;
  }> {
    const recordsToArchive = await this.identifyRecordsToArchive();
    const estimatedSize = recordsToArchive.length * 2; // Rough estimate: 2KB per record
    const sizeMB = Math.round(estimatedSize / 1024);

    let recommendedAction = 'None';
    if (recordsToArchive.length > 100) {
      recommendedAction = 'Archive now to improve performance';
    } else if (recordsToArchive.length > 50) {
      recommendedAction = 'Consider archiving soon';
    }

    return {
      pendingArchive: recordsToArchive.length,
      canSaveSpace: sizeMB,
      recommendedAction
    };
  }
}

export const archiveService = new ArchiveService();