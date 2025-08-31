// salesDB.ts
import { IndexTelemetry } from "../diagnostics/indexTelemetry";
import DBVersionHelper from '../helpers/DBVersionHelper';
import { discountService } from "../services/discountService";
import { Sale, DiscountInfo } from "../types/sales";

const DB_NAME = "salesDB";
const STORE_NAME = "sales";

// IndexedDB veritabanını başlatma - DBVersionHelper kullanarak
async function initSalesDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const dbVersion = DBVersionHelper.getVersion(DB_NAME);
    const request = indexedDB.open(DB_NAME, dbVersion);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      console.log(`Upgrading ${DB_NAME} from ${event.oldVersion} to ${event.newVersion}`);
      
      // Store'ı oluştur veya mevcut store'u al
      let store: IDBObjectStore;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        console.log(`Created ${STORE_NAME} store`);
      } else {
        store = (request.transaction as IDBTransaction).objectStore(STORE_NAME);
      }

      // Yalnızca yeni versiyon 8 veya üzeriyse indeksleri oluştur (testlerde kontrollü kullanılacak)
      const newVersion = (event as IDBVersionChangeEvent).newVersion ?? 0;
      if (newVersion >= 8) {
        const idxNames = Array.from((store as unknown as { indexNames?: DOMStringList }).indexNames || []) as string[];
        if (!idxNames.includes('status')) store.createIndex('status', 'status');
        if (!idxNames.includes('paymentMethod')) store.createIndex('paymentMethod', 'paymentMethod');
        if (!idxNames.includes('date')) store.createIndex('date', 'date');
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

class SalesService {
  // Satış ekleme
  async addSale(saleData: Omit<Sale, "id">): Promise<Sale> {
    const db = await initSalesDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      // Transaction lifecycle: always close DB to prevent upgrade deadlocks in tests
      transaction.oncomplete = () => { try { db.close(); } catch {} };
      transaction.onabort = () => { try { db.close(); } catch {} };
      transaction.onerror = () => { try { db.close(); } catch {} };

      // İndirimsiz durumu önce kontrol et
      let finalData: Omit<Sale, "id"> = { ...saleData };
      
      // İndirim varsa
      if (saleData.discount) {
        // Orijinal tutarı öncelikle originalTotal'den al, yoksa total'den
        const originalTotal = saleData.originalTotal || saleData.total;
        
        // Yeni kayıt için veriyi hazırla
        finalData = {
          ...saleData,
          // İndirimli tutarı total'e ata
          total: saleData.discount.discountedTotal,
          // Orijinal tutarı (indirimsiz) originalTotal olarak sakla
          originalTotal: originalTotal
        };
      }

      const newSale: Sale = {
        ...finalData,
        id: `SALE-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      };

      const request = store.add(newSale);

      request.onsuccess = () => {
        resolve(newSale);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Tüm satışları alma
  async getAllSales(): Promise<Sale[]> {
    const db = await initSalesDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);

      // Always close DB after readonly transaction too
      transaction.oncomplete = () => { try { db.close(); } catch {} };
      transaction.onabort = () => { try { db.close(); } catch {} };
      transaction.onerror = () => { try { db.close(); } catch {} };

      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result as Sale[]);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Filtrelenmiş satışları getirme (indirim filtresi dahil)
  async getSalesWithFilter(filter: {
    startDate?: Date;
    endDate?: Date;
    status?: string;
    paymentMethod?: string;
    hasDiscount?: boolean;
  }): Promise<Sale[]> {
    // Hızlı yol: indeksler mevcutsa daraltılmış okuma
    try {
      const db = await initSalesDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const idxNames: DOMStringList | undefined = (store as unknown as { indexNames?: DOMStringList }).indexNames;
      // Ensure connection closes after this attempt (even if we fall back)
      tx.oncomplete = () => { try { db.close(); } catch {} };
      tx.onabort = () => { try { db.close(); } catch {} };
      tx.onerror = () => { try { db.close(); } catch {} };

      const needStatus = !!filter.status;
      const needPayment = !!filter.paymentMethod;
      const needDate = !!(filter.startDate || filter.endDate);

      // Telemetri/log (indeks yoksa)
      if (needStatus && !(idxNames && idxNames.contains('status'))) {
        console.warn("[IndexedDB] 'sales.status' indeksi bulunamadı, filtre JS fallback ile uygulanacak.");
        IndexTelemetry.recordFallback({ db: 'salesDB', store: 'sales', index: 'status', operation: 'query', reason: "index missing: 'status'" });
      }
      if (needPayment && !(idxNames && idxNames.contains('paymentMethod'))) {
        console.warn("[IndexedDB] 'sales.paymentMethod' indeksi bulunamadı, filtre JS fallback ile uygulanacak.");
        IndexTelemetry.recordFallback({ db: 'salesDB', store: 'sales', index: 'paymentMethod', operation: 'query', reason: "index missing: 'paymentMethod'" });
      }
      if (needDate && !(idxNames && idxNames.contains('date'))) {
        console.warn("[IndexedDB] 'sales.date' indeksi bulunamadı, tarih aralığı JS fallback ile uygulanacak.");
        IndexTelemetry.recordFallback({ db: 'salesDB', store: 'sales', index: 'date', operation: 'query', reason: "index missing: 'date'" });
      }

      // Eğer en az bir uygun indeks varsa, daraltılmış okuma yapalım
      if (idxNames && (needStatus || needPayment || needDate)) {
        let candidate: Sale[] | null = null

        async function getAllFromIndex(indexName: string, query: IDBKeyRange | IDBValidKey): Promise<Sale[]> {
          return new Promise<Sale[]>((resolve, reject) => {
            try {
              const idx = (store as IDBObjectStore).index(indexName) as IDBIndex
              const req = (query instanceof IDBKeyRange) ? idx.getAll(query) : idx.getAll(query)
              req.onsuccess = () => resolve(((req.result as unknown) as Sale[]) || [])
              req.onerror = () => reject(req.error as unknown)
            } catch (e) {
              reject(e as unknown)
            }
          })
        }

        if (needStatus && idxNames.contains('status')) {
          const byStatus = await getAllFromIndex('status', filter.status as unknown as IDBValidKey)
          candidate = byStatus
        }
        if (needPayment && idxNames.contains('paymentMethod')) {
          const byPayment = await getAllFromIndex('paymentMethod', filter.paymentMethod as unknown as IDBValidKey)
          candidate = candidate ? candidate.filter(s => byPayment.some(p => p.id === s.id)) : byPayment
        }
        if (needDate && idxNames.contains('date') && (filter.startDate || filter.endDate)) {
          const range = IDBKeyRange.bound(
            filter.startDate ?? new Date(0),
            filter.endDate ? new Date(new Date(filter.endDate).setHours(23,59,59,999)) : new Date(8640000000000000)
          )
          const byDate = await getAllFromIndex('date', range)
          candidate = candidate ? candidate.filter(s => byDate.some(p => p.id === s.id)) : byDate
        }

        // JS tarafında kalan filtreleri uygula (hasDiscount gibi)
        if (candidate) {
          return candidate.filter(sale => {
            if (filter.hasDiscount === true && !sale.discount) {return false}
            if (filter.hasDiscount === false && sale.discount) {return false}
            return true
          })
        }
      }
    } catch (e) {
      console.warn('[IndexedDB] salesDB indeks kontrolü veya hızlı yol hatası, JS fallback kullanılacak:', e)
    }

    // Yavaş ama güvenli yol: tüm kayıtları al ve filtrele
    const sales = await this.getAllSales();
    
    return sales.filter(sale => {
      // Tarih filtresi
      if (filter.startDate && new Date(sale.date) < filter.startDate) {return false;}
      if (filter.endDate) {
        const endDateCopy = new Date(filter.endDate);
        endDateCopy.setHours(23, 59, 59, 999);
        if (new Date(sale.date) > endDateCopy) {return false;}
      }
      
      // Durum filtresi
      if (filter.status && sale.status !== filter.status) {return false;}
      
      // Ödeme yöntemi filtresi
      if (filter.paymentMethod && sale.paymentMethod !== filter.paymentMethod) {return false;}
      
      // İndirim filtresi
      if (filter.hasDiscount === true && !sale.discount) {return false;}
      if (filter.hasDiscount === false && sale.discount) {return false;}
      
      return true;
    });
  }

  // Satış ID ile bir satış alma
  async getSaleById(id: string): Promise<Sale | null> {
    const db = await initSalesDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);

      transaction.oncomplete = () => { try { db.close(); } catch {} };
      transaction.onabort = () => { try { db.close(); } catch {} };
      transaction.onerror = () => { try { db.close(); } catch {} };

      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Satışı güncelleme
  async updateSale(saleId: string, updates: Partial<Sale>): Promise<Sale | null> {
    const db = await initSalesDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      transaction.oncomplete = () => { try { db.close(); } catch {} };
      transaction.onabort = () => { try { db.close(); } catch {} };
      transaction.onerror = () => { try { db.close(); } catch {} };

      const getRequest = store.get(saleId);

      getRequest.onsuccess = () => {
        const sale = getRequest.result;
        if (!sale) {
          resolve(null);
          return;
        }

        let finalUpdates = { ...updates };
        
        // Eğer güncelleme içinde indirim bilgisi varsa
        if (updates.discount) {
          // Orijinal tutarı, mevcut originalTotal veya total değerinden al
          const originalTotal = updates.originalTotal || sale.originalTotal || sale.total;
          
          finalUpdates = {
            ...updates,
            total: updates.discount.discountedTotal,
            originalTotal: originalTotal
          };
        }

        const updatedSale = { ...sale, ...finalUpdates };
        const updateRequest = store.put(updatedSale);

        updateRequest.onsuccess = () => {
          resolve(updatedSale);
        };

        updateRequest.onerror = () => {
          reject(updateRequest.error);
        };
      };

      getRequest.onerror = () => {
        reject(getRequest.error);
      };
    });
  }

  // Satışı iptal etme
  async cancelSale(saleId: string, reason: string): Promise<Sale | null> {
    return this.updateSale(saleId, {
      status: "cancelled",
      cancelReason: reason,
      cancelDate: new Date(),
    });
  }

  // Satışı iade etme
  async refundSale(saleId: string, reason: string): Promise<Sale | null> {
    return this.updateSale(saleId, {
      status: "refunded",
      refundReason: reason,
      refundDate: new Date(),
    });
  }

  // Günlük satışları alma
  async getDailySales(date: Date = new Date()): Promise<Sale[]> {
    const sales = await this.getAllSales();

    return sales.filter((sale) => {
      const saleDate = new Date(sale.date);
      return (
        saleDate.getDate() === date.getDate() &&
        saleDate.getMonth() === date.getMonth() &&
        saleDate.getFullYear() === date.getFullYear()
      );
    });
  }

  // İndirim uygulama (ayrı bir yardımcı fonksiyon)
  applyDiscount(saleData: Sale, type: 'percentage' | 'amount', value: number): Sale {
    // İndirimsiz fiyatı doğru şekilde al (orijinal fiyat veya mevcut fiyat)
    const originalTotal = saleData.originalTotal || saleData.total;
    
    // İndirimli fiyatı hesapla
    const discountedTotal = discountService.calculateDiscountedTotal(originalTotal, type, value);

    return {
      ...saleData,
      // İndirimli tutarı total'e ata (dış sistemler bunu kullanacak)
      total: discountedTotal,
      // Orijinal tutarı originalTotal olarak sakla (raporlama için)
      originalTotal: originalTotal,
      // İndirim bilgilerini ekle/güncelle
      discount: {
        type,
        value,
        discountedTotal
      }
    };
  }

  // Satış özeti oluşturma (indirim bilgileri dahil)
  async getSalesSummary(startDate: Date, endDate: Date): Promise<{
    totalSales: number;
    totalAmount: number;
    totalDiscount: number;
    originalAmount: number;
    discountedSalesCount: number;
    salesByPaymentMethod: Record<string, number>;
  }> {
    const sales = await this.getSalesWithFilter({
      startDate,
      endDate,
      status: 'completed'
    });
    
    let totalSales = 0;
    let totalAmount = 0;
    let totalDiscount = 0;
    let originalAmount = 0;
    let discountedSalesCount = 0;
    const salesByPaymentMethod: Record<string, number> = {};
    
    for (const sale of sales) {
      totalSales++;
      // Her zaman indirimli (veya indirimsiz) toplam tutarı ekle
      totalAmount += sale.total;
      
      // İndirim bilgileri
      if (sale.discount && sale.originalTotal) {
        discountedSalesCount++;
        const discountAmount = sale.originalTotal - sale.total;
        totalDiscount += discountAmount;
        originalAmount += sale.originalTotal;
      } else {
        // İndirimsiz satışlar için total değerini ekle
        originalAmount += sale.total;
      }
      
      // Ödeme yöntemine göre grupla - her zaman mevcut total değerini kullan
      const method = sale.paymentMethod;
      salesByPaymentMethod[method] = (salesByPaymentMethod[method] || 0) + sale.total;
    }
    
    return {
      totalSales,
      totalAmount,
      totalDiscount,
      originalAmount,
      discountedSalesCount,
      salesByPaymentMethod
    };
  }

  // Fiş numarası oluştur
  generateReceiptNo(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const random = Math.random().toString(36).substring(2, 9).toUpperCase();
    return `F${year}${month}${day}-${random}`; // Fiş no formatı
  }
}

export const salesDB = new SalesService();