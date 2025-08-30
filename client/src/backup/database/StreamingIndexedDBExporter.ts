/**
 * Büyük veri setleri için bellek-verimli streaming IndexedDB exporter
 * Veri çoğaldığında kasma sorununu çözüm için optimize edilmiştir
 */

import { openDB, IDBPDatabase } from 'idb';

export interface StreamingExportOptions {
  chunkSize?: number; // Her parçada kaç kayıt (varsayılan: 1000)
  onProgress?: (progress: { current: number; total: number; table: string }) => void;
  onTableStart?: (tableName: string, recordCount: number) => void;
  onTableComplete?: (tableName: string) => void;
}

export interface StreamingExportResult {
  databases: Record<string, Record<string, unknown[]>>;
  exportInfo: {
    databases: DatabaseExportInfo[];
    totalRecords: number;
    timestamp: string;
  };
}

export interface DatabaseExportInfo {
  name: string;
  version: number;
  stores: string[];
  recordCounts: Record<string, number>;
}

type SimpleCursor = { value: unknown; continue: () => Promise<unknown> } | null;

export class StreamingIndexedDBExporter {
  private defaultChunkSize = 1000; // Bellek optimizasyonu için chunk boyutu

  /**
   * Tüm veritabanlarını streaming yaklaşımı ile dışa aktarır
   * Bellek verimliliği için parçalar halinde işler
   */
  async exportAllDatabases(options?: StreamingExportOptions): Promise<StreamingExportResult> {
    console.log('Streaming export başlatılıyor - büyük veri setleri için optimize edilmiş...');
    
    const databaseNames = ['posDB', 'salesDB', 'creditDB'];
    const result: Record<string, Record<string, unknown[]>> = {};
    const dbInfoList: DatabaseExportInfo[] = [];
    let totalRecords = 0;
    
    for (const dbName of databaseNames) {
      try {
        console.log(`${dbName} streaming export başlatılıyor...`);
        const { data, info } = await this.exportDatabaseStreaming(dbName, options);
        result[dbName] = data;
        dbInfoList.push(info);
        totalRecords += Object.values(info.recordCounts).reduce((sum, count) => sum + count, 0);
      } catch (error) {
        console.error(`${dbName} veritabanı dışa aktarılamadı:`, error);
        // Diğer veritabanlarıyla devam et
      }
    }
    
    return {
      databases: result,
      exportInfo: {
        databases: dbInfoList,
        totalRecords,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Tek bir veritabanını streaming chunks kullanarak dışa aktarır
   */
  async exportDatabaseStreaming(
    dbName: string, 
    options?: StreamingExportOptions
  ): Promise<{ data: Record<string, unknown[]>, info: DatabaseExportInfo }> {
    console.log(`${dbName} streaming export başlatılıyor...`);
    
    const db = await openDB(dbName);
    const storeNames = Array.from(db.objectStoreNames);
    
    const data: Record<string, unknown[]> = {};
    const recordCounts: Record<string, number> = {};
    
    for (const storeName of storeNames) {
      const { records, count } = await this.exportTableStreaming(db, storeName as string, options);
      data[storeName as string] = records;
      recordCounts[storeName as string] = count;
    }
    
    const dbInfo: DatabaseExportInfo = {
      name: dbName,
      version: db.version,
      stores: storeNames as string[],
      recordCounts
    };
    
    db.close();
    
    return { data, info: dbInfo };
  }

  /**
   * Tablo verilerini parçalar halinde dışa aktarır - bellek sorunlarını önler
   */
  async exportTableStreaming(
    db: IDBPDatabase, 
    tableName: string, 
    options?: StreamingExportOptions
  ): Promise<{ records: unknown[], count: number }> {
    console.log(`${tableName} tablosu streaming export başlatılıyor...`);
    
    const chunkSize = options?.chunkSize || this.defaultChunkSize;
    const allRecords: unknown[] = [];
    let totalCount = 0;
    let processedCount = 0;

    try {
      // İlerleme takibi için toplam kayıt sayısını al
      totalCount = await this.getTableRecordCount(db, tableName);
      console.log(`${tableName} tablosunda ${totalCount} kayıt bulundu`);
      
      if (options?.onTableStart) {
        options.onTableStart(tableName, totalCount);
      }

      // Cursor kullanarak kayıtları parçalar halinde işle
      const transaction = db.transaction(tableName, 'readonly');
      const objectStore = transaction.objectStore(tableName);
      let cursor: SimpleCursor = (await objectStore.openCursor()) as unknown as SimpleCursor;

      while (cursor) {
        const chunk: unknown[] = [];
        let chunkCount = 0;

        // Bir chunk dolusu kayıt topla
        while (cursor && chunkCount < chunkSize) {
          const processedRecord = this.processDateFields(cursor.value);
          chunk.push(processedRecord);
          chunkCount++;
          processedCount++;
          
          // Sonraki kayıta geç
          cursor = (await (cursor as unknown as { continue: () => Promise<unknown> }).continue()) as unknown as SimpleCursor;
        }

        // Chunk'ı sonuçlara ekle
        allRecords.push(...chunk);

        // İlerleme bildir
        if (options?.onProgress) {
          options.onProgress({
            current: processedCount,
            total: totalCount,
            table: tableName
          });
        }

        // UI thread'inin nefes almasına izin ver
        await this.yield();
      }

      if (options?.onTableComplete) {
        options.onTableComplete(tableName);
      }

      console.log(`${tableName} streaming export tamamlandı: ${processedCount} kayıt`);
      return { records: allRecords, count: processedCount };

    } catch (error) {
      console.error(`${tableName} streaming export hatası:`, error);
      return { records: [], count: 0 };
    }
  }

  /**
   * Tablodaki toplam kayıt sayısını verimli şekilde alır
   */
  private async getTableRecordCount(db: IDBPDatabase, tableName: string): Promise<number> {
    try {
      const tx = db.transaction(tableName, 'readonly');
      const store = tx.objectStore(tableName);
      return await store.count();
    } catch (error) {
      console.error(`${tableName} kayıt sayısı alınamadı:`, error);
      return 0;
    }
  }

  /**
   * Kayıtlardaki Date alanlarını işle
   */
  private processDateFields(data: unknown): unknown {
    if (data === null || data === undefined) {
      return data;
    }
    
    if (data instanceof Date) {
      return {
        __isDate: true,
        value: data.toISOString()
      };
    }
    
    if (Array.isArray(data)) {
      return data.map((item) => this.processDateFields(item));
    }
    
    if (typeof data === 'object') {
      const result: Record<string, unknown> = {};
      const obj = data as Record<string, unknown>;
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          result[key] = this.processDateFields(obj[key]);
        }
      }
      return result;
    }
    
    return data;
  }

  /**
   * UI güncellemelerine izin vermek için control'u bırakır
   */
  private async yield(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
  }
}