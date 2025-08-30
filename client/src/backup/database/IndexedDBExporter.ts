/**
 * IndexedDB veritabanlarını dışa aktaracak servis
 */

import { openDB, IDBPDatabase } from 'idb';

export interface DatabaseExportInfo {
  name: string;
  version: number;
  stores: string[];
  recordCounts: Record<string, number>;
}

export interface ExportResult {
  databases: Record<string, Record<string, unknown[]>>;
  exportInfo: {
    databases: DatabaseExportInfo[];
    totalRecords: number;
    timestamp: string;
  };
}

export class IndexedDBExporter {
  /**
   * Tüm veritabanlarını dışa aktarır
   * @returns Veritabanlarının içeriği
   */
  async exportAllDatabases(): Promise<ExportResult> {
    console.log('Tüm veritabanları dışa aktarılıyor...');
    
    // Bu uygulamadaki veritabanlarını tanımlayalım
    const databaseNames = ['posDB', 'salesDB', 'creditDB'];
  
    // Her veritabanını dışa aktar
    const result: Record<string, Record<string, unknown[]>> = {};
    const dbInfoList: DatabaseExportInfo[] = [];
    let totalRecords = 0;
    
    for (const dbName of databaseNames) {
      try {
        const { data, info } = await this.exportDatabase(dbName);
        result[dbName] = data;
        dbInfoList.push(info);
        totalRecords += Object.values(info.recordCounts).reduce((sum, count) => sum + count, 0);
      } catch (error) {
        console.error(`${dbName} veritabanı dışa aktarılamadı:`, error);
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
   * Belirli bir veritabanını dışa aktarır
   * @param dbName Veritabanı adı
   * @returns Veritabanının içeriği
   */
  async exportDatabase(dbName: string): Promise<{ data: Record<string, unknown[]>, info: DatabaseExportInfo }> {
    console.log(`${dbName} veritabanı dışa aktarılıyor...`);
    
    // Veritabanını aç
    const db = await openDB(dbName);
    const storeNames = Array.from(db.objectStoreNames);
  
    // Her tabloyu dışa aktar
    const data: Record<string, unknown[]> = {};
    const recordCounts: Record<string, number> = {};
    
    for (const storeName of storeNames) {
      const storeData = await this.exportTable(db, storeName);
      data[storeName] = storeData;
      recordCounts[storeName] = storeData.length;
    }
    
    // Veritabanı bilgilerini döndür
    const dbInfo: DatabaseExportInfo = {
      name: dbName,
      version: db.version,
      stores: storeNames,
      recordCounts
    };
    
    db.close();
    
    return { data, info: dbInfo };
  }

  /**
   * Belirli bir tabloyu dışa aktarır
   * @param db Veritabanı bağlantısı
   * @param tableName Tablo adı
   * @returns Tablonun içeriği
   */
  async exportTable(db: IDBPDatabase, tableName: string): Promise<unknown[]> {
    console.log(`${tableName} tablosu dışa aktarılıyor...`);
    
    try {
      // Tablodaki tüm verileri al
      const tx = db.transaction(tableName, 'readonly');
      const store = tx.objectStore(tableName);
      const rawData = await store.getAll();
      
      // Date nesnelerini özel formata dönüştür
      const processedData = rawData.map(item => this.processDateFields(item));
      
      return processedData;
    } catch (error) {
      console.error(`${tableName} tablosu dışa aktarılamadı:`, error);
      return [];
    }
  }

  /**
   * Nesne içerisindeki tüm Date alanlarını işaretler
   */
  private processDateFields(data: unknown): unknown {
    if (data === null || data === undefined) {
      return data;
    }
    
    // Date nesnesi kontrolü
    if (data instanceof Date) {
      return {
        __isDate: true,
        value: data.toISOString()
      };
    }
    
    // Dizi kontrolü
    if (Array.isArray(data)) {
      return data.map((item) => this.processDateFields(item));
    }
    
    // Nesne kontrolü
    if (typeof data === 'object') {
      const out: Record<string, unknown> = {};
      const obj = data as Record<string, unknown>;
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          out[key] = this.processDateFields(obj[key]);
        }
      }
      return out;
    }
    
    // Diğer tip değerleri doğrudan döndür
    return data;
  }
}