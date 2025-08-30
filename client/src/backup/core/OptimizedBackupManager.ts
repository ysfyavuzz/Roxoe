/**
 * Büyük veri setlerini verimli şekilde işleyen optimize edilmiş backup manager
 * Performans sorunlarını ve kasmaları çözmek için tasarlanmıştır
 */

import { v4 as uuidv4 } from 'uuid';

import { StreamingIndexedDBExporter, StreamingExportOptions, type DatabaseExportInfo } from '../database/StreamingIndexedDBExporter';
import { FileUtils } from '../utils/fileUtils';

import { BackupResult } from './BackupManager';
import { StreamingBackupSerializer } from './StreamingBackupSerializer';

export interface OptimizedBackupOptions {
  description?: string;
  backupType?: 'full' | 'incremental';
  chunkSize?: number;
  onProgress?: (stage: string, progress: number) => void;
  isAutoBackup?: boolean;
}



export class OptimizedBackupManager {
  private exporter: StreamingIndexedDBExporter;
  private serializer: StreamingBackupSerializer;
  
  constructor() {
    this.exporter = new StreamingIndexedDBExporter();
    this.serializer = new StreamingBackupSerializer();
  }

  /**
   * İlerleme takibi ve bellek yönetimi ile optimize edilmiş backup oluşturur
   */
  async createOptimizedBackup(options?: OptimizedBackupOptions): Promise<BackupResult> {
    const backupId = uuidv4();
    const startTime = Date.now();
    
    try {
      console.log('Optimize edilmiş backup işlemi başlatılıyor...');
      
      if (options?.onProgress) {
        options.onProgress('Backup başlatılıyor...', 0);
      }

      // Streaming seçenekleri ile ilerleme callback'leri ayarla
      const streamingOptions: StreamingExportOptions = {
        chunkSize: options?.chunkSize || 1000,
        onProgress: (progress) => {
          if (options?.onProgress) {
            const percentage = Math.round((progress.current / progress.total) * 30); // Export için 0-30%
            options.onProgress(`${progress.table} dışa aktarılıyor: ${progress.current}/${progress.total}`, percentage);
          }
        },
        onTableStart: (tableName, recordCount) => {
          console.log(`${tableName} export başlatılıyor (${recordCount} kayıt)`);
          if (options?.onProgress) {
            options.onProgress(`${tableName} export başlatılıyor...`, 0);
          }
        },
        onTableComplete: (tableName) => {
          console.log(`${tableName} export tamamlandı`);
        }
      };

      // Streaming yaklaşımı ile veri export'u
      const exportResult = await this.exporter.exportAllDatabases(streamingOptions);
      
      if (options?.onProgress) {
        options.onProgress('Veri export\'u tamamlandı, metadata hazırlanıyor...', 35);
      }

      // Metadata hazırla
      const metadata = {
        version: '2.0', // Optimize edilmiş format için güncellenmiş versiyon
        appVersion: 'Roxoe POS v2.0 Optimize',
        createdAt: new Date().toISOString(),
        description: options?.description || 'Optimize Edilmiş Yedekleme',
        databases: exportResult.exportInfo.databases.map(db => db.name),
        recordCounts: this.calculateRecordCounts(exportResult.exportInfo.databases),
        backupType: options?.backupType || 'full',
        dataFormat: 'compressed' as const,
        compressionMethod: 'lz-string-streaming',
        totalRecords: exportResult.exportInfo.totalRecords
      };

      if (options?.onProgress) {
        options.onProgress('Backup verisi serileştiriliyor...', 40);
      }

      // Streaming yaklaşımı ile veri serileştirme
      const serializedData = await this.serializer.serializeToRoxoeFormatStreaming(
        exportResult.databases, 
        metadata,
        {
          chunkSize: options?.chunkSize ? options.chunkSize * 100 : 100000, // Serileştirme için büyük chunk'lar
          onProgress: (serProgress) => {
            if (options?.onProgress) {
              const totalProgress = 40 + Math.round(serProgress.current * 0.4); // 40-80%
              options.onProgress(serProgress.stage, totalProgress);
            }
          }
        }
      );

      if (options?.onProgress) {
        options.onProgress('Backup dosyası hazırlanıyor...', 85);
      }

      // Dosya adı oluştur
      const date = new Date();
      const dateStr = date.toISOString().split('T')[0];
      const timeStr = date.toTimeString().split(' ')[0]?.replace(/:/g, '-') ?? 'unknown';
      const filename = `roxoe-backup-optimize-${dateStr}-${timeStr}.roxoe`;

      // Backup boyutunu hesapla
      const backupSize = new Blob([serializedData]).size;
      console.log(`Backup boyutu: ${this.formatFileSize(backupSize)}`);

      if (options?.onProgress) {
        options.onProgress('Backup dosyası kaydediliyor...', 90);
      }

      // Backup dosyasını kaydet
      await FileUtils.downloadFile(serializedData, filename, options?.isAutoBackup === true);

      // Geçmişe kaydet
      FileUtils.saveBackupToHistory(backupId, {
        filename,
        description: options?.description || 'Optimize Edilmiş Yedekleme',
        createdAt: date.toISOString(),
        databases: metadata.databases,
        recordCounts: metadata.recordCounts,
        totalRecords: exportResult.exportInfo.totalRecords,
        size: backupSize,
        optimized: true
      });

      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (options?.onProgress) {
        options.onProgress('Backup başarıyla tamamlandı!', 100);
      }

      console.log(`Optimize edilmiş backup ${duration}ms'de tamamlandı - Boyut: ${this.formatFileSize(backupSize)} - Kayıt: ${exportResult.exportInfo.totalRecords}`);

      return {
        success: true,
        backupId,
        metadata,
        filename,
        size: backupSize,
        recordCount: exportResult.exportInfo.totalRecords
      };

    } catch (error: unknown) {
      console.error('Optimize edilmiş backup başarısız:', error);
      
      const message = error instanceof Error ? error.message : 'Bilinmeyen hata';
      if (options?.onProgress) {
        options.onProgress(`Backup başarısız: ${message}`, 0);
      }

      return {
        success: false,
        backupId,
        metadata: {},
        error: `Backup başarısız: ${message}`
      };
    }
  }

  /**
   * Export bilgisinden kayıt sayılarını hesapla
   */
  private calculateRecordCounts(databases: DatabaseExportInfo[]): Record<string, number> {
    const counts: Record<string, number> = {};
    
    databases.forEach((db) => {
      Object.entries(db.recordCounts).forEach(([store, count]) => {
        counts[`${db.name}.${store}`] = count;
      });
    });
    
    return counts;
  }

  /**
   * Dosya boyutunu görüntülenebilir formata çevir
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) {return '0 Bytes';}
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}