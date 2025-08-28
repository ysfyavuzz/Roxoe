/**
 * Yedekleme sisteminin ana modülü - Optimize Edilmiş Versiyon
 * Büyük veri setleri için performans sorunlarını çözer
 */

// Core - Orijinal (Deprecated: use OptimizedBackupManager instead)
/**
 * @deprecated BackupManager eski sürümle uyumluluk için ihrac edilmektedir.
 * Yeni geliştirmelerde OptimizedBackupManager kullanın.
 */
export { BackupManager } from './core/BackupManager';
export type { BackupOptions, RestoreOptions, BackupResult } from './core/BackupManager';
export { BackupSerializer } from './core/BackupSerializer';
export type { BackupMetadata } from './core/BackupSerializer';
export { BackupDeserializer } from './core/BackupDeserializer';
export type { DeserializedBackup } from './core/BackupDeserializer';

// Core - Optimize Edilmiş
export { OptimizedBackupManager } from './core/OptimizedBackupManager';
export type { OptimizedBackupOptions } from './core/OptimizedBackupManager';
export { StreamingBackupSerializer } from './core/StreamingBackupSerializer';

// Database - Orijinal
export { IndexedDBExporter } from './database/IndexedDBExporter';
export type { DatabaseExportInfo, ExportResult } from './database/IndexedDBExporter';
export { IndexedDBImporter } from './database/IndexedDBImporter';
export type { ImportResult, ImportOptions } from './database/IndexedDBImporter';

// Database - Optimize Edilmiş
export { StreamingIndexedDBExporter } from './database/StreamingIndexedDBExporter';
export type { StreamingExportOptions, StreamingExportResult } from './database/StreamingIndexedDBExporter';

// Scheduler
export { BackupScheduler } from './scheduler/BackupScheduler';
export type { BackupSchedule } from './scheduler/BackupScheduler';

// Utils
export { ChecksumUtils } from './utils/checksumUtils';
export { CompressionUtils } from './utils/compressionUtils';
export { FileUtils } from './utils/fileUtils';

// Singleton örnekleri
import { BackupManager, type BackupResult } from './core/BackupManager';
import { OptimizedBackupManager, type OptimizedBackupOptions } from './core/OptimizedBackupManager';

export const backupManager = new BackupManager();
export const optimizedBackupManager = new OptimizedBackupManager();

// Veri boyutuna göre en iyi backup yöneticisini otomatik seçer
export async function createSmartBackup(options?: OptimizedBackupOptions): Promise<BackupResult> {
  try {
    // Tekilleştirme: her zaman optimize edilmiş yolu kullan
    console.log('Optimize backup stratejisi kullanılıyor...');
    return await optimizedBackupManager.createOptimizedBackup(options);
  } catch (error: any) {
    console.error('Akıllı backup başarısız:', error);
    return {
      success: false,
      backupId: '',
      metadata: {},
      error: error.message
    };
  }
}

/**
 * Tüm veritabanlarındaki toplam kayıt sayısını tahmin eder
 */
async function estimateDataSize(): Promise<number> {
  try {
    const databaseNames = ['posDB', 'salesDB', 'creditDB'];
    let totalRecords = 0;
    
    for (const dbName of databaseNames) {
      try {
        const { openDB } = await import('idb');
        const db = await openDB(dbName);
        const storeNames = Array.from(db.objectStoreNames);
        
        for (const storeName of storeNames) {
          const tx = db.transaction(storeName as string, 'readonly');
          const count = await tx.objectStore(storeName as string).count();
          totalRecords += count;
        }
        
        db.close();
      } catch (error) {
        console.log(`${dbName}'ye erişilemedi, atlanıyor...`);
      }
    }
    
    return totalRecords;
  } catch (error) {
    console.error('Veri boyutu tahmin hatası:', error);
    return 0;
  }
}
