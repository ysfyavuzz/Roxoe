// cashRegisterDB.ts
import { type IDBPDatabase } from "idb";
import { v4 as uuidv4 } from "uuid";

import {
  CashRegisterSession,
  CashRegisterStatus,
  CashTransaction,
  CashTransactionType,
} from "../types/cashRegister";
import type { PosDBSchema } from "../types/db";

import initUnifiedPOSDB from './UnifiedDBInitializer';
import { IndexTelemetry } from '../diagnostics/indexTelemetry';

const DB_NAME = "posDB";

// initCashRegisterDB fonksiyonunu birleştirilmiş başlatıcıyı kullanacak şekilde güncelle
const initCashRegisterDB = async (): Promise<IDBPDatabase<PosDBSchema>> => {
  return initUnifiedPOSDB(); // Birleştirilmiş başlatıcıyı kullan
};

class CashRegisterService {
  async getActiveSession(): Promise<CashRegisterSession | null> {
    const db = await initCashRegisterDB();
    const tx = db.transaction("cashRegisterSessions", "readonly");
    const store = tx.objectStore("cashRegisterSessions") as unknown as IDBObjectStore;

    // Index guard for 'status'
    try {
      const idxNames = (store as unknown as { indexNames: DOMStringList }).indexNames as unknown as DOMStringList;
      if (typeof (idxNames as unknown as DOMStringList).contains === 'function' && (idxNames as unknown as DOMStringList).contains('status')) {
        const index = (store as unknown as { index: (name: string) => unknown }).index("status") as unknown as { get: (q: unknown) => Promise<unknown> };
        const activeSession = await index.get(CashRegisterStatus.OPEN) as CashRegisterSession | undefined;
        return activeSession || null;
      }
      console.warn("[IndexedDB] 'cashRegisterSessions.status' indeksi bulunamadı, fallback ile taranacak.");
      IndexTelemetry.recordFallback({ db: 'posDB', store: 'cashRegisterSessions', index: 'status', operation: 'query', reason: "index missing: 'status'" });
      const all = await (store as unknown as { getAll: () => Promise<unknown[]> }).getAll();
      const active = (all as CashRegisterSession[]).find(s => s.status === CashRegisterStatus.OPEN) || null;
      return active;
    } catch (e) {
      console.warn("[IndexedDB] 'status' indeksi kontrolü hata, fallback kullanılacak:", e);
      IndexTelemetry.recordFallback({ db: 'posDB', store: 'cashRegisterSessions', index: 'status', operation: 'query', reason: 'status index check failed, using full scan' });
      const all = await (store as unknown as { getAll: () => Promise<unknown[]> }).getAll();
      const active = (all as CashRegisterSession[]).find(s => s.status === CashRegisterStatus.OPEN) || null;
      return active;
    }
  }

  async openRegister(openingBalance: number): Promise<CashRegisterSession> {
    // Check if there's already an active session
    const activeSession = await this.getActiveSession();
    if (activeSession) {
      throw new Error(
        "Zaten açık bir kasa dönemi mevcut. Önce mevcut dönemi kapatın."
      );
    }

    // Create new session
    const newSession: CashRegisterSession = {
      id: uuidv4(),
      openingDate: new Date(),
      openingBalance: openingBalance,
      cashSalesTotal: 0,
      cardSalesTotal: 0,
      cashDepositTotal: 0,
      cashWithdrawalTotal: 0,
      status: CashRegisterStatus.OPEN,
    };

    // Save to database
    const db = await initCashRegisterDB();
    const tx = db.transaction("cashRegisterSessions", "readwrite");
    const store = tx.objectStore("cashRegisterSessions") as unknown as { add: (v: unknown) => Promise<unknown> };
    await store.add(newSession as unknown as PosDBSchema['cashRegisterSessions']['value']);
    await tx.done;

    return newSession;
  }

  async addCashTransaction(
    sessionId: string,
    type: CashTransactionType,
    amount: number,
    description: string
  ): Promise<CashTransaction> {
    // Check active session
    const activeSession = await this.getActiveSession();
    if (!activeSession || activeSession.id !== sessionId) {
      throw new Error("Geçerli bir açık kasa dönemi bulunamadı.");
    }

    // Check balance for withdrawals
    if (type === CashTransactionType.WITHDRAWAL) {
      const theoreticalBalance = this.getRegisterBalance(activeSession);
      if (amount > theoreticalBalance) {
        throw new Error("Kasada yeterli nakit yok.");
      }
    }

    // Create new transaction
    const newTransaction: CashTransaction = {
      id: uuidv4(),
      sessionId,
      type,
      amount,
      description,
      date: new Date(),
    };

    // Save transaction to database
    const db = await initCashRegisterDB();
    const tx = db.transaction(
      ["cashTransactions", "cashRegisterSessions"],
      "readwrite"
    );

    // Add transaction
    const cashTxStore = tx.objectStore("cashTransactions") as unknown as { add: (v: unknown) => Promise<unknown> };
    await cashTxStore.add(newTransaction as unknown as PosDBSchema['cashTransactions']['value']);

    // Update session
    const session = { ...activeSession };
    if (type === CashTransactionType.DEPOSIT) {
      session.cashDepositTotal += amount;
    } else {
      session.cashWithdrawalTotal += amount;
    }

    const sessionStore = tx.objectStore("cashRegisterSessions") as unknown as { put: (v: unknown) => Promise<unknown> };
    await sessionStore.put(session);
    await tx.done;

    return newTransaction;
  }

  async recordSale(cashAmount: number, cardAmount: number): Promise<void> {
    const activeSession = await this.getActiveSession();
    if (!activeSession) {
      throw new Error("Açık bir kasa dönemi bulunamadı.");
    }

    const db = await initCashRegisterDB();
    const tx = db.transaction("cashRegisterSessions", "readwrite");

    const session = { ...activeSession };
    session.cashSalesTotal += cashAmount;
    session.cardSalesTotal += cardAmount;

    const sessionStore = tx.objectStore("cashRegisterSessions") as unknown as { put: (v: unknown) => Promise<unknown> };
    await sessionStore.put(session);
    await tx.done;
  }

  async saveCounting(
    sessionId: string,
    countingAmount: number
  ): Promise<CashRegisterSession> {
    const activeSession = await this.getActiveSession();
    if (!activeSession || activeSession.id !== sessionId) {
      throw new Error("Geçerli bir açık kasa dönemi bulunamadı.");
    }

    const theoreticalBalance = this.getRegisterBalance(activeSession);
    const countingDifference = countingAmount - theoreticalBalance;

    const db = await initCashRegisterDB();
    const tx = db.transaction("cashRegisterSessions", "readwrite");

    const session = { ...activeSession };
    session.countingAmount = countingAmount;
    session.countingDifference = countingDifference;

    const sessionStore = tx.objectStore("cashRegisterSessions") as unknown as { put: (v: unknown) => Promise<unknown> };
    await sessionStore.put(session);
    await tx.done;

    return session;
  }

  async closeRegister(sessionId: string): Promise<CashRegisterSession> {
    const activeSession = await this.getActiveSession();
    if (!activeSession || activeSession.id !== sessionId) {
      throw new Error("Geçerli bir açık kasa dönemi bulunamadı.");
    }

    const db = await initCashRegisterDB();
    const tx = db.transaction("cashRegisterSessions", "readwrite");

    const session = { ...activeSession };
    session.status = CashRegisterStatus.CLOSED;
    session.closingDate = new Date();

    const sessionStore = tx.objectStore("cashRegisterSessions") as unknown as { put: (v: unknown) => Promise<unknown> };
    await sessionStore.put(session as unknown as PosDBSchema['cashRegisterSessions']['value']);
    await tx.done;

    return session;
  }

  async getSessionDetails(sessionId: string): Promise<{ 
    session: CashRegisterSession | null; 
    transactions: CashTransaction[] 
  }> {
    try {
      const db = await initCashRegisterDB();
  
      // Get session info
      const session = await db.get("cashRegisterSessions", sessionId);
      if (!session) {
        console.warn(`Kasa dönemi bulunamadı, ID: ${sessionId}`);
        return { session: null, transactions: [] };
      }
  
      // Get all transactions for this session
      const tx = db.transaction("cashTransactions", "readonly");
      const store = tx.objectStore("cashTransactions") as unknown as IDBObjectStore;
      const index = (store as unknown as { index: (n: string) => unknown }).index("sessionId") as unknown as { getAll: (q: unknown) => Promise<unknown[]> };
      let transactions: CashTransaction[] = [];
      
      try {
        transactions = await index.getAll(sessionId) as CashTransaction[];
      } catch (err) {
        console.error("İşlem geçmişi alınırken hata:", err);
        transactions = []; // Hata durumunda boş dizi döndür
      }
  
      console.log(`${sessionId} ID'li oturum için ${transactions.length} işlem bulundu`);
      return { session, transactions };
    } catch (error) {
      console.error(`Session details retrieval error for ${sessionId}:`, error);
      return { session: null, transactions: [] }; // Hata durumunda boş dizi döndür
    }
  }

  async getAllSessions(): Promise<CashRegisterSession[]> {
    const db = await initCashRegisterDB();
    return db.getAll("cashRegisterSessions");
  }

  // Helper functions
  getRegisterBalance(session: CashRegisterSession): number {
    return (
      session.openingBalance +
      session.cashSalesTotal +
      session.cashDepositTotal -
      session.cashWithdrawalTotal
    );
  }

  async getVeresiyeTransactions(
    sessionId?: string
  ): Promise<CashTransaction[]> {
    const db = await initCashRegisterDB();

    // Tüm nakit işlemlerini çek
    let tx;
    let transactions: CashTransaction[];

    if (sessionId) {
      // Belirli bir dönem için
      tx = db.transaction("cashTransactions", "readonly");
      const store = tx.objectStore("cashTransactions") as unknown as IDBObjectStore;
      try {
        const idxNames = (store as unknown as { indexNames: DOMStringList }).indexNames as unknown as DOMStringList;
        if (typeof (idxNames as unknown as DOMStringList).contains === 'function' && (idxNames as unknown as DOMStringList).contains('sessionId')) {
          const index = (store as unknown as { index: (n: string) => unknown }).index("sessionId") as unknown as { getAll: (q: unknown) => Promise<unknown[]> };
          transactions = await index.getAll(sessionId) as CashTransaction[];
        } else {
          console.warn("[IndexedDB] 'cashTransactions.sessionId' indeksi yok, fallback ile filtrelenecek.");
          IndexTelemetry.recordFallback({ db: 'posDB', store: 'cashTransactions', index: 'sessionId', operation: 'query', reason: "index missing: 'sessionId'" });
          const all = await (store as unknown as { getAll: () => Promise<unknown[]> }).getAll();
          transactions = (all as CashTransaction[]).filter(t => t.sessionId === sessionId);
        }
      } catch (e) {
        console.warn("[IndexedDB] sessionId indeksi kontrolü hata, fallback kullanılacak:", e);
        IndexTelemetry.recordFallback({ db: 'posDB', store: 'cashTransactions', index: 'sessionId', operation: 'query', reason: 'sessionId index check failed, using full scan' });
        const all = await (store as unknown as { getAll: () => Promise<unknown[]> }).getAll();
        transactions = (all as CashTransaction[]).filter(t => t.sessionId === sessionId);
      }
    } else {
      // Tüm dönemler için
      transactions = await db.getAll("cashTransactions");
    }

    // Açıklaması "Veresiye Tahsilatı" içeren işlemleri filtrele
    return transactions.filter(
      (t: CashTransaction) =>
        t.description.toLowerCase().includes("veresiye tahsilatı") ||
        t.description.toLowerCase().includes("veresiye") ||
        t.type === CashTransactionType.CREDIT_COLLECTION // Eğer özel tip eklediyseniz
    );
  }

  // Veresiye tahsilatı özeti
  async getVeresiyeSummary(): Promise<{
    totalCollected: number;
    transactionCount: number;
    byCustomer: { customerId: string; customerName: string; amount: number }[];
  }> {
    const transactions = await this.getVeresiyeTransactions();

    // Müşteri bazlı gruplama için
    const customerMap = new Map();

    // Toplam hesaplama
    let totalCollected = 0;

    for (const tx of transactions) {
      totalCollected += tx.amount;

      // Müşteri ismini açıklamadan çıkar
      const match = tx.description.match(/Veresiye Tahsilatı - (.+)/);
      if (match && match[1]) {
        const customerName = match[1];
        // Müşteri ID'yi eğer kaydetmişsek kullanabiliriz
        const customerId = "unknown"; // Gerçek uygulamada müşteri id'si de kaydedilmeli

        if (customerMap.has(customerName)) {
          customerMap.get(customerName).amount += tx.amount;
        } else {
          customerMap.set(customerName, {
            customerId,
            customerName,
            amount: tx.amount,
          });
        }
      }
    }

    return {
      totalCollected,
      transactionCount: transactions.length,
      byCustomer: Array.from(customerMap.values()),
    };
  }
}

export const cashRegisterService = new CashRegisterService();

// CashRegisterStatus enum'unu dışa aktar
export { CashTransactionType, CashRegisterStatus };
export type { CashRegisterSession };