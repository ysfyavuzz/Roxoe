/**
 * CreditPage Performance Tests
 * Veri yükleme performansı, önbellekleme ve lazy loading testleri
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
      name: `Test Müşteri ${i + 1}`,
      phone: `555${(1000 + i).toString().slice(1)}`,
      creditLimit: 10000,
      note: `Test müşterisi ${i + 1}`
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
      description: `Test işlemi ${i + 1}`,
      dueDate: new Date(Date.now() + (Math.random() * 30 + 1) * 24 * 60 * 60 * 1000)
    };

    const addedTx = await creditService.addTransaction(transaction);
    transactions.push(addedTx);
  }
  return transactions;
}

test.describe('CreditPage Performance Tests', () => {
  test.beforeAll(async () => {
    // Test veritabanını temizle
    await creditService.initCreditDB();
  });

  test.afterAll(async () => {
    // Test verilerini temizle
    const allCustomers = await creditService.getAllCustomers();
    for (const customer of allCustomers) {
      if (customer.name.startsWith('Test Müşteri')) {
        await creditService.deleteCustomer(customer.id);
      }
    }
  });

  test('10.000+ müşteri kaydı yükleme performansı', async () => {
    const startTime = performance.now();
    const customerCount = 10000;

    // Test müşterileri oluştur
    const customers = await createTestCustomers(customerCount);

    // Müşteri sayfasının yükleme süresini ölç
    const pageLoadStart = performance.now();
    const allCustomers = await creditService.getAllCustomers();
    const pageLoadEnd = performance.now();

    const pageLoadTime = pageLoadEnd - pageLoadStart;
    console.log(`10.000 müşteri yükleme süresi: ${pageLoadTime}ms`);

    // Performans eşiği: 2000ms altında olmalı
    expect(pageLoadTime).toBeLessThan(2000);

    // Veri bütünlüğü kontrolü
    expect(allCustomers.length).toBeGreaterThanOrEqual(customerCount);
  });

  test('Lazy loading performansı - 100 müşterinin işlemleri', async () => {
    // Önce test müşterileri oluştur
    const customers = await createTestCustomers(10);
    if (customers.length === 0) {
      throw new Error("Test müşterisi oluşturulamadı");
    }
    const customerId = customers[0].id;

    // 100 işlem oluştur
    await createTestTransactions(customerId, 100);

    // Lazy loading ile işlemleri yükle
    const startTime = performance.now();
    const result = await creditService.getPaginatedTransactions(customerId, 1, 20);
    const endTime = performance.now();

    const loadTime = endTime - startTime;
    console.log(`Lazy loading 20 işlem yükleme süresi: ${loadTime}ms`);

    // Performans eşiği: 500ms altında olmalı
    expect(loadTime).toBeLessThan(500);
    expect(result.transactions.length).toBeLessThanOrEqual(20);
    expect(result.hasMore).toBe(true);
  });

  test('Önbellekleme mekanizması performansı', async () => {
    // Test müşterisi oluştur
    const customers = await createTestCustomers(1);
    if (customers.length === 0) {
      throw new Error("Test müşterisi oluşturulamadı");
    }
    const customerId = customers[0].id;

    // 50 işlem oluştur
    await createTestTransactions(customerId, 50);

    // İlk yükleme (önbellek yok)
    const startTime1 = performance.now();
    const transactions1 = await creditService.getTransactionsByCustomerIdWithCache(customerId);
    const endTime1 = performance.now();
    const firstLoadTime = endTime1 - startTime1;

    // İkinci yükleme (önbellekten)
    const startTime2 = performance.now();
    const transactions2 = await creditService.getTransactionsByCustomerIdWithCache(customerId);
    const endTime2 = performance.now();
    const secondLoadTime = endTime2 - startTime2;

    console.log(`Önbelleksiz yükleme: ${firstLoadTime}ms`);
    console.log(`Önbellekli yükleme: ${secondLoadTime}ms`);

    // Önbellekli yükleme daha hızlı olmalı
    expect(secondLoadTime).toBeLessThan(firstLoadTime);
    expect(transactions1.length).toBe(transactions2.length);
  });

  test('Müşteri özet bilgileri yükleme performansı', async () => {
    // Test müşterileri oluştur
    const customers = await createTestCustomers(5);
    if (customers.length === 0) {
      throw new Error("Test müşterisi oluşturulamadı");
    }
    const customerId = customers[0].id;

    // 30 işlem oluştur
    await createTestTransactions(customerId, 30);

    // Özet bilgileri yükleme süresi
    const startTime = performance.now();
    const summary = await creditService.getCustomerSummary(customerId);
    const endTime = performance.now();

    const loadTime = endTime - startTime;
    console.log(`Özet bilgileri yükleme süresi: ${loadTime}ms`);

    // Performans eşiği: 300ms altında olmalı
    expect(loadTime).toBeLessThan(300);
    expect(summary.totalDebt).toBeGreaterThanOrEqual(0);
  });
});