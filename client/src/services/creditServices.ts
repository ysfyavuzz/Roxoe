// creditService.ts
import { openDB } from "idb";

import DBVersionHelper from '../helpers/DBVersionHelper';
import { Customer, CreditTransaction, CustomerSummary } from "../types/credit";

const DB_NAME = "creditDB";

class CreditService {
  private dbPromise = openDB(DB_NAME, DBVersionHelper.getVersion(DB_NAME), {
    upgrade(db, oldVersion, newVersion, transaction) {
      console.log(`Upgrading ${DB_NAME} from ${oldVersion} to ${newVersion}`);
      
      if (!db.objectStoreNames.contains("customers")) {
        db.createObjectStore("customers", { keyPath: "id", autoIncrement: true });
        console.log("Created customers store");
      }
      if (!db.objectStoreNames.contains("transactions")) {
        db.createObjectStore("transactions", { keyPath: "id", autoIncrement: true });
        console.log("Created transactions store");
      }

      // Ensure useful indexes on transactions store
      try {
        const txStore = transaction.objectStore("transactions") as unknown as IDBObjectStore;
        const idxNames = txStore.indexNames as unknown as DOMStringList;
        if (!idxNames.contains("by_customer")) { txStore.createIndex("by_customer", "customerId", { unique: false }); }
        if (!idxNames.contains("by_status")) { txStore.createIndex("by_status", "status", { unique: false }); }
        if (!idxNames.contains("by_type")) { txStore.createIndex("by_type", "type", { unique: false }); }
        if (!idxNames.contains("by_due")) { txStore.createIndex("by_due", "dueDate", { unique: false }); }
        console.log("Ensured transaction indexes");
      } catch (e) {
        console.warn("Index creation skipped for transactions store", e);
      }
    },
  });

  // Veritabanını yeniden başlatma metodu (gerektiğinde çağrılabilir)
  async initCreditDB() {
    this.dbPromise = openDB(DB_NAME, DBVersionHelper.getVersion(DB_NAME), {
      upgrade(db, oldVersion, newVersion) {
        console.log(`Upgrading ${DB_NAME} from ${oldVersion} to ${newVersion}`);
        
        if (!db.objectStoreNames.contains("customers")) {
          db.createObjectStore("customers", { keyPath: "id", autoIncrement: true });
          console.log("Created customers store");
        }
        if (!db.objectStoreNames.contains("transactions")) {
          db.createObjectStore("transactions", { keyPath: "id", autoIncrement: true });
          console.log("Created transactions store");
        }
      },
    });
    
    return this.dbPromise;
  }

  // Müşteri işlemleri
  async getAllCustomers(): Promise<Customer[]> {
    const db = await this.dbPromise;
    const customers = await db.getAll("customers");
    return customers.map((customer) => ({
      ...customer,
      createdAt: new Date(customer.createdAt), // Tarih formatını düzelt
    })) as Customer[];
  }

  // Optimize edilmiş müşteri getirme - sadece gerekli alanları çek
  async getCustomerSummaryForList(): Promise<Omit<Customer, 'note' | 'taxNumber' | 'address'>[]> {
    const db = await this.dbPromise;
    const customers = await db.getAll("customers");
    return customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      creditLimit: customer.creditLimit,
      currentDebt: customer.currentDebt,
      createdAt: new Date(customer.createdAt),
    })) as Omit<Customer, 'note' | 'taxNumber' | 'address'>[];
  }

  async getCustomerById(id: number): Promise<Customer | null> {
    const db = await this.dbPromise;
    const customer = await db.get("customers", id);
    return customer
      ? { ...customer, createdAt: new Date(customer.createdAt) }
      : null;
  }

  async addCustomer(
    customerData: Omit<Customer, "id" | "currentDebt" | "createdAt">
  ): Promise<Customer> {
    const db = await this.dbPromise;

    const newCustomer: Omit<Customer, "id"> = {
      ...customerData,
      currentDebt: 0,
      createdAt: new Date(),
    };

    const id = await db.add("customers", newCustomer);
    return { ...newCustomer, id: id as number }; // id number olarak zorlanır
  }

  async updateCustomer(customerId: number, updates: Partial<Customer>): Promise<Customer | null> {
    const db = await this.dbPromise;
    const existingCustomer = await this.getCustomerById(customerId);

    if (!existingCustomer) {return null;}

    const updatedCustomer = { ...existingCustomer, ...updates };
    await db.put("customers", updatedCustomer);

    return updatedCustomer;
  }

  async deleteCustomer(customerId: number): Promise<boolean> {
    const db = await this.dbPromise;
    const customer = await this.getCustomerById(customerId);
    
    if (!customer) {return false;}
    
    // Müşterinin gerçek borç durumunu kontrol et
    if (customer.currentDebt > 0) {
      console.log(`Müşteri ${customerId}: Borç durumu ${customer.currentDebt}, silinemez.`);
      return false;
    }
    
    // Borcu 0 olsa da, tüm aktif işlemleri kontrol edelim
    const transactions = await this.getTransactionsByCustomerId(customerId);
    const activeTransactions = transactions.filter(t => 
      t.status === "active" || t.status === "overdue"
    );
    
    // Borç 0 ama aktif işlemler varsa
    if (customer.currentDebt === 0 && activeTransactions.length > 0) {
      console.log(`Müşteri ${customerId}: Borç 0 ama ${activeTransactions.length} aktif işlem var. Bunları temizliyoruz.`);
      
      // Tüm aktif işlemleri "paid" olarak işaretle
      for (const tx of activeTransactions) {
        await this.updateTransactionStatus(tx.id, "paid");
      }
    }
    
    // Müşteriyi sil
    await db.delete("customers", customerId);
    return true;
  }

  // Veresiye işlemleri
  async getAllTransactions(): Promise<CreditTransaction[]> {
    const db = await this.dbPromise;
    const transactions = await db.getAll("transactions");
    return transactions.map((transaction) => ({
      ...transaction,
      date: new Date(transaction.date),
      dueDate: transaction.dueDate ? new Date(transaction.dueDate) : undefined,
    })) as CreditTransaction[];
  }

  // Optimize edilmiş işlem getirme - sadece gerekli alanları çek
  async getTransactionsSummary(customerId: number): Promise<{
    totalDebt: number;
    totalOverdue: number;
    activeTransactions: number;
    overdueTransactions: number;
  }> {
    const db = await this.dbPromise;
    const tx = db.transaction('transactions', 'readonly');
    const store = tx.objectStore('transactions');
    const index = store.index('by_customer');
    const transactions = await index.getAll(customerId);

    const activeTransactions = transactions.filter(
      (t) => t.status === "active" || t.status === "overdue"
    );

    return {
      totalDebt: activeTransactions.reduce(
        (sum, t) => sum + (t.type === "debt" ? t.amount : -t.amount),
        0
      ),
      totalOverdue: activeTransactions
        .filter((t) => t.status === "overdue")
        .reduce((sum, t) => sum + t.amount, 0),
      activeTransactions: activeTransactions.length,
      overdueTransactions: activeTransactions.filter(
        (t) => t.status === "overdue"
      ).length,
    };
  }

  // Lazy loading için sayfalama destekli işlem getirme
  async getPaginatedTransactions(
    customerId: number,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{
    transactions: CreditTransaction[];
    totalCount: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  }> {
    const db = await this.dbPromise;
    const tx = db.transaction('transactions', 'readonly');
    const store = tx.objectStore('transactions');
    const index = store.index('by_customer');
    const allTransactions = await index.getAll(customerId);

    // Sadece aktif ve vadesi geçmiş işlemleri filtrele
    const filteredTransactions = allTransactions.filter(
      (t) => t.status === "active" || t.status === "overdue"
    );

    // Sayfalama uygula
    const startIndex = (page - 1) * pageSize;
    const paginatedTransactions = filteredTransactions.slice(
      startIndex,
      startIndex + pageSize
    );

    return {
      transactions: paginatedTransactions.map((transaction) => ({
        ...transaction,
        date: new Date(transaction.date),
        dueDate: transaction.dueDate ? new Date(transaction.dueDate) : undefined,
      })) as CreditTransaction[],
      totalCount: filteredTransactions.length,
      page,
      pageSize,
      hasMore: startIndex + pageSize < filteredTransactions.length
    };
  }

  async getTransactionsByCustomerId(customerId: number): Promise<CreditTransaction[]> {
    const db = await this.dbPromise;
    try {
      const tx = db.transaction('transactions', 'readonly');
      const store = tx.objectStore('transactions') as unknown as IDBObjectStore;
      let items: CreditTransaction[];
      const idxNames = store.indexNames as unknown as DOMStringList;
      if (idxNames.contains('by_customer')) {
        const idx = store.index('by_customer');
        const raw = await (idx as unknown as { getAll: (query: unknown) => Promise<unknown[]> }).getAll(customerId);
        items = (raw as CreditTransaction[]).map((transaction) => ({
          ...transaction,
          date: new Date(transaction.date),
          dueDate: transaction.dueDate ? new Date(transaction.dueDate) : undefined,
        })) as CreditTransaction[];
      } else {
        const all = await db.getAll('transactions');
        items = (all as CreditTransaction[]).map((transaction) => ({
          ...transaction,
          date: new Date(transaction.date),
          dueDate: transaction.dueDate ? new Date(transaction.dueDate) : undefined,
        })) as CreditTransaction[];
        items = items.filter((t) => t.customerId === customerId);
      }
      return items.sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch {
      // Fallback
      const transactions = await this.getAllTransactions();
      return transactions
        .filter((t) => t.customerId === customerId)
        .sort((a, b) => b.date.getTime() - a.date.getTime());
    }
  }

  // Ödeme işlemi yaparken borçları otomatik olarak işleyen yeni metot
  async processPayment(customerId: number, paymentAmount: number): Promise<boolean> {
    try {
      // 1. Müşterinin aktif borç işlemlerini en eski eklenen olandan başlayarak al
      const activeDebts = await this.getTransactionsByCustomerId(customerId)
        .then(txs => 
          txs.filter(tx => 
            tx.type === 'debt' && 
            (tx.status === 'active' || tx.status === 'overdue')
          ).sort((a, b) => {
            // Önce eklenme tarihine göre sırala (en eski eklenmiş borç önce)
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          })
        );
      
      console.log("Aktif borçlar:", activeDebts.map(d => 
        `ID: ${d.id}, Miktar: ${d.amount}, Tarih: ${d.date.toLocaleDateString()}, Vade: ${d.dueDate?.toLocaleDateString() || "Yok"}`
      ));
      
      // 2. Ödeme miktarını en eski eklenen borçlardan başlayarak düş
      let remainingPayment = paymentAmount;
      const paidDebts = [];
      
      for (const debt of activeDebts) {
        if (remainingPayment <= 0) {break;}
        
        // Bu borç ne kadar ödenebilir?
        const paymentForThisDebt = Math.min(debt.amount, remainingPayment);
        
        if (paymentForThisDebt >= debt.amount) {
          // Borç tamamen ödendi
          await this.updateTransactionStatus(debt.id, 'paid');
          paidDebts.push({ id: debt.id, amount: debt.amount, fullyPaid: true });
          remainingPayment -= debt.amount;
          console.log(`Borç ${debt.id} tamamen ödendi: ${debt.amount}. Kalan ödeme: ${remainingPayment}`);
        } else {
          // Borç kısmen ödendi - işlem tutarını güncelle
          const db = await this.dbPromise;
          const transaction = await db.get("transactions", debt.id);
          
          if (transaction) {
            // Kalan borç tutarını hesapla
            const updatedAmount = debt.amount - paymentForThisDebt;
            
            // İşlemi güncelle
            transaction.amount = updatedAmount;
            await db.put("transactions", transaction);
            
            paidDebts.push({ id: debt.id, amount: paymentForThisDebt, fullyPaid: false });
            console.log(`Borç ${debt.id} kısmen ödendi: ${paymentForThisDebt}/${debt.amount}. Kalan borç: ${updatedAmount}`);
            remainingPayment = 0;
          }
        }
      }
      
      console.log("Ödenen borçlar:", paidDebts);
      
      return true;
    } catch (error) {
      console.error("Ödeme işleme hatası:", error);
      return false;
    }
  }

  async addTransaction(
    transaction: Omit<CreditTransaction, "id" | "status">
  ): Promise<CreditTransaction> {
    const db = await this.dbPromise;

    const customer = await this.getCustomerById(transaction.customerId);
    if (!customer) {throw new Error("Müşteri bulunamadı");}

    // Borç ekleme işlemi için limit kontrolü
    if (transaction.type === "debt") {
      const newTotalDebt = customer.currentDebt + transaction.amount;
      if (newTotalDebt > customer.creditLimit) {
        throw new Error("Kredi limiti aşılıyor");
      }
    }

    const newTransaction: Omit<CreditTransaction, "id"> = {
      ...transaction,
      status: "active",
    };

    const id = await db.add("transactions", newTransaction);
    const debtChange =
      transaction.type === "debt" ? transaction.amount : -transaction.amount;

    // Müşteri borç durumunu güncelle
    await this.updateCustomer(customer.id, {
      currentDebt: customer.currentDebt + debtChange,
    });

    // Eğer ödeme işlemiyse, ilgili borçları otomatik olarak güncelle
    if (transaction.type === "payment") {
      await this.processPayment(transaction.customerId, transaction.amount);
    }

    return { ...newTransaction, id: id as number }; // id number olarak zorlanır
  }

  async updateTransactionStatus(
    transactionId: number,
    status: CreditTransaction["status"]
  ): Promise<CreditTransaction | null> {
    const db = await this.dbPromise;
    const transaction = await db.get("transactions", transactionId);

    if (!transaction) {return null;}

    const updatedTransaction = { ...transaction, status };
    await db.put("transactions", updatedTransaction);

    return updatedTransaction;
  }

  // Özet istatistikler
  // creditService.ts içindeki getCustomerSummary metodunu güncelle
  async getCustomerSummary(customerId: number): Promise<CustomerSummary> {
    const transactions = await this.getTransactionsByCustomerId(customerId);
    const activeTransactions = transactions.filter(
      (t) => t.status === "active" || t.status === "overdue"
    );

    // İndirimli işlemleri bul
    const discountedTransactions = transactions.filter(
      (t) => t.discountAmount && t.discountAmount > 0
    );

    // Toplam indirim tutarı
    const totalDiscount = discountedTransactions.reduce(
      (sum, t) => sum + (t.discountAmount || 0), 0
    );

    const summaryBase = {
      totalDebt: activeTransactions.reduce(
        (sum, t) => sum + (t.type === "debt" ? t.amount : -t.amount),
        0
      ),
      totalOverdue: activeTransactions
        .filter((t) => t.status === "overdue")
        .reduce((sum, t) => sum + t.amount, 0),
      activeTransactions: activeTransactions.length,
      overdueTransactions: activeTransactions.filter(
        (t) => t.status === "overdue"
      ).length,
      // Eksik alanları ekle
      discountedSalesCount: discountedTransactions.length,
      totalDiscount: totalDiscount,
    } as CustomerSummary;

    const lastTxDate = transactions[0]?.date;
    if (lastTxDate) {
      summaryBase.lastTransactionDate = lastTxDate;
    }

    return summaryBase;
  }

  // Veri önbelleğe alma mekanizması
  private transactionCache: Map<number, CreditTransaction[]> = new Map();
  private customerCache: Map<number, Customer> = new Map();

  // Önbellek süresi (ms)
  private CACHE_TTL = 300000; // 5 dakika
  private cacheTimestamps: Map<string, number> = new Map();

  // Önbellek anahtarı oluştur
  private getCacheKey(type: 'customer' | 'transactions', id: number): string {
    return `${type}_${id}`;
  }

  // Önbellek geçerliliğini kontrol et
  private isCacheValid(key: string): boolean {
    const timestamp = this.cacheTimestamps.get(key);
    if (!timestamp) return false;
    return Date.now() - timestamp < this.CACHE_TTL;
  }

  // Önbelleğe alma mekanizması - müşteri verileri
  async getCustomerWithCache(customerId: number): Promise<Customer | null> {
    const cacheKey = this.getCacheKey('customer', customerId);

    // Önbellekte var mı ve geçerli mi?
    if (this.customerCache.has(customerId) && this.isCacheValid(cacheKey)) {
      console.log(`📦 Customer ${customerId} önbellekten getirildi`);
      return this.customerCache.get(customerId) || null;
    }

    // Önbellekte yoksa veritabanından çek
    const customer = await this.getCustomerById(customerId);
    if (customer) {
      this.customerCache.set(customerId, customer);
      this.cacheTimestamps.set(cacheKey, Date.now());
    }

    return customer;
  }

  // Önbelleğe alma mekanizması - işlem verileri
  async getTransactionsByCustomerIdWithCache(customerId: number): Promise<CreditTransaction[]> {
    const cacheKey = this.getCacheKey('transactions', customerId);

    // Önbellekte var mı ve geçerli mi?
    if (this.transactionCache.has(customerId) && this.isCacheValid(cacheKey)) {
      console.log(`📦 Transactions for customer ${customerId} önbellekten getirildi`);
      return this.transactionCache.get(customerId) || [];
    }

    // Önbellekte yoksa veritabanından çek
    const transactions = await this.getTransactionsByCustomerId(customerId);
    this.transactionCache.set(customerId, transactions);
    this.cacheTimestamps.set(cacheKey, Date.now());

    return transactions;
  }

  // Önbelleği temizle
  clearCache(): void {
    this.transactionCache.clear();
    this.customerCache.clear();
    this.cacheTimestamps.clear();
    console.log('🧹 Tüm önbellek temizlendi');
  }
}

export const creditService = new CreditService();