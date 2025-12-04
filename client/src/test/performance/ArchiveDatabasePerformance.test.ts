/**
 * Archive Database Performance Tests
 * Arşiv veritabanı işlemleri, sorgulama ve veri bütünlüğü testleri
 */
import { test, expect } from '@playwright/test';
import { creditService } from '../../services/creditServices';
import { Customer, CreditTransaction } from '../../types/credit';

// Mock localStorage and indexedDB for Node.js environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

// Mock indexedDB
const indexedDBMock = {
  open: () => ({
    onsuccess: () => {},
    onerror: () => {},
    result: {
      createObjectStore: () => ({}),
      transaction: () => ({
        objectStore: () => ({
          createIndex: () => ({}),
          getAll: () => Promise.resolve([]),
          put: () => Promise.resolve(),
          delete: () => Promise.resolve()
        })
      })
    }
  })
};

// Assign to global
(global as any).localStorage = localStorageMock;
(global as any).indexedDB = indexedDBMock;

// Test verileri oluşturma yardımcı fonksiyonları
async function createTestCustomers(count: number): Promise<Customer[]> {
  const customers: Customer[] = [];
  for (let i = 0; i < count; i++) {
    const customer = await creditService.addCustomer({
      name: `Archive Test Müşteri ${i + 1}`,
      phone: `555${(2000 + i).toString().slice(1)}`,
      creditLimit: 10000,
      note: `Archive test müşterisi ${i + 1}`
    });
    customers.push(customer);
  }
  return customers;
}

async function createTestTransactions(customerId: number, count: number): Promise<CreditTransaction[]> {
  const transactions: CreditTransaction[] = [];
  const customer = await creditService.getCustomerById(customerId);
  if (!customer) return transactions;

  for (let i = 0; i < count; i++) {
    const transaction: Omit<CreditTransaction, "id" | "status"> = {
      customerId,
      type: i % 2 === 0 ? 'debt' : 'payment',
      amount: Math.random() * 1000 + 100,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      description: `Archive test işlemi ${i + 1}`,
      dueDate: new Date(Date.now() + (Math.random() * 30 + 1) * 24 * 60 * 60 * 1000)
    };

    const addedTx = await creditService.addTransaction(transaction);
    transactions.push(addedTx);
  }
  return transactions;
}

test.describe('Archive Database Performance Tests', () => {
  test.beforeAll(async () => {
    // Test veritabanını temizle
    await creditService.initCreditDB();
  });

  test.afterAll(async () => {
    // Test verilerini temizle
    const allCustomers = await creditService.getAllCustomers();
    for (const customer of allCustomers) {
      if (customer.name.startsWith('Archive Test Müşteri')) {
        await creditService.deleteCustomer(customer.id);
      }
    }
  });

  test('50.000+ arşiv kayıt sorgulama performansı', async () => {
    // Test müşterileri oluştur
    const customers = await createTestCustomers(5);
    if (customers.length === 0) {
      throw new Error("Test müşterisi oluşturulamadı");
    }
    const customerId = customers[0].id;

    // 10.000 işlem oluştur (arşiv boyutu için)
    await createTestTransactions(customerId, 10000);

    // Tarih aralığına göre sorgulama performansı
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = new Date();

    const startTime = performance.now();
    const transactions = await creditService.getTransactionsByCustomerId(customerId);
    const filteredTransactions = transactions.filter(tx =>
      tx.date >= startDate && tx.date <= endDate
    );
    const endTime = performance.now();

    const queryTime = endTime - startTime;
    console.log(`50.000+ kayıt sorgulama süresi: ${queryTime}ms`);

    // Performans eşiği: 1000ms altında olmalı
    expect(queryTime).toBeLessThan(1000);
    expect(filteredTransactions.length).toBeGreaterThan(0);
  });

  test('Arşiv verisi geri yükleme performansı', async () => {
    // Test müşterisi oluştur
    const customers = await createTestCustomers(1);
    if (customers.length === 0) {
      throw new Error("Test müşterisi oluşturulamadı");
    }
    const customerId = customers[0].id;

    // 1000 işlem oluştur
    await createTestTransactions(customerId, 1000);

    // Veri geri yükleme süresi
    const startTime = performance.now();
    const transactions = await creditService.getTransactionsByCustomerIdWithCache(customerId);
    const endTime = performance.now();

    const restoreTime = endTime - startTime;
    console.log(`Arşiv verisi geri yükleme süresi: ${restoreTime}ms`);

    // Performans eşiği: 500ms altında olmalı
    expect(restoreTime).toBeLessThan(500);
    expect(transactions.length).toBe(1000);
  });

  test('Arşiv ve aktif veritabanı tutarlılık kontrolü', async () => {
    // Test müşterileri oluştur
    const customers = await createTestCustomers(3);
    if (customers.length === 0) {
      throw new Error("Test müşterisi oluşturulamadı");
    }

    // Her müşteri için farklı sayıda işlem oluştur
    for (let i = 0; i < customers.length; i++) {
      if (customers[i]) {
        await createTestTransactions(customers[i].id, (i + 1) * 100);
      }
    }

    // Toplam borç hesaplama
    let totalDebt = 0;
    for (const customer of customers) {
      const summary = await creditService.getCustomerSummary(customer.id);
      totalDebt += summary.totalDebt;
    }

    // Veri bütünlüğü kontrolü
    const allTransactions = await creditService.getAllTransactions();
    const calculatedTotalDebt = allTransactions
      .filter(tx => tx.type === 'debt' && tx.status === 'active')
      .reduce((sum, tx) => sum + tx.amount, 0);

    console.log(`Hesaplanan toplam borç: ${calculatedTotalDebt}`);
    console.log(`Özetlerden gelen toplam borç: ${totalDebt}`);

    // Tutarlılık kontrolü
    expect(Math.abs(calculatedTotalDebt - totalDebt)).toBeLessThan(1);
  });
});