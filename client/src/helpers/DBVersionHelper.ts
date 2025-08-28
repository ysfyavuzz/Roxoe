// src/helpers/DBVersionHelper.ts
const DB_VERSIONS = {
    // Ana POS veritabanı
    posDB: 7,
    // Diğer veritabanları
    salesDB: 7,
    creditDB: 4
  };
  
  /**
   * Sürüm kontrolü ve yükseltmesi için yardımcı fonksiyon
   * Tüm veritabanı sürüm bilgilerini tek yerden yönetir
   */
  export const DBVersionHelper = {
    /**
     * Belirtilen veritabanı için geçerli sürüm numarasını döndürür
     */
    getVersion(dbName: string): number {
      const versionKey = dbName as keyof typeof DB_VERSIONS;
      
      // Yeni bir sürüm yükseltmesi işareti varsa, +1 döndür
      const upgraded = localStorage.getItem('db_version_upgraded') === 'true';
      
      if (upgraded && versionKey === 'posDB') {
        return DB_VERSIONS[versionKey] + 1;
      }
      
      return DB_VERSIONS[versionKey] || 1;
    },
    
    /**
     * Belirtilen veritabanı için sürüm numarasını manuel olarak ayarlar
     * İndeks optimizasyonu gibi şema değişiklikleri için kullanılır
     */
    setVersion(dbName: string, newVersion: number): void {
      console.log(`📊 ${dbName} sürümü güncelleniyor: v${this.getVersion(dbName)} → v${newVersion}`);
      
      // LocalStorage'da sakla
      localStorage.setItem(`db_version_${dbName}`, newVersion.toString());
      
      // Güncelleme işaretini ekle
      localStorage.setItem('db_version_upgraded', 'true');
    },

    /**
     * LocalStorage'dan kayıtlı sürüm numarasını alır (varsa)
     */
    getStoredVersion(dbName: string): number | null {
      const stored = localStorage.getItem(`db_version_${dbName}`);
      return stored ? parseInt(stored, 10) : null;
    },

    /**
     * Gerçek sürüm numarasını alır (LocalStorage veya varsayılan)
     */
    getRealVersion(dbName: string): number {
      const stored = this.getStoredVersion(dbName);
      if (stored !== null) {
        return stored;
      }
      return this.getVersion(dbName);
    },
    
    /**
     * Sürüm yükseltme işaretini kaldırır
     */
    clearUpgradeFlag() {
      localStorage.removeItem('db_version_upgraded');
    },

    /**
     * Tüm veritabanı sürümlerini listeler (debug için)
     */
    getAllVersions(): Record<string, number> {
      const result: Record<string, number> = {};
      
      Object.keys(DB_VERSIONS).forEach(dbName => {
        result[dbName] = this.getRealVersion(dbName);
      });
      
      return result;
    }
  };
  
  export default DBVersionHelper;