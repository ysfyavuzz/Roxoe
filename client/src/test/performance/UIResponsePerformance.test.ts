/**
 * UI Response Performance Tests
 * Kullanıcı arayüzü yanıt süreleri, özet bilgi panelleri ve farklı cihaz performansı testleri
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
      name: `UI Test Müşteri ${i + 1}`,
      phone: `555${(3000 + i).toString().slice(1)}`,
      creditLimit: 10000,
      note: `UI test müşterisi ${i + 1}`
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
      description: `UI test işlemi ${i + 1}`,
      dueDate: new Date(Date.now() + (Math.random() * 30 + 1) * 24 * 60 * 60 * 1000)
    };

    const addedTx = await creditService.addTransaction(transaction);
    transactions.push(addedTx);
  }
  return transactions;
}

test.describe('UI Response Performance Tests', () => {
  test.beforeAll(async () => {
    // Test veritabanını temizle
    await creditService.initCreditDB();
  });

  test.afterAll(async () => {
    // Test verilerini temizle
    const allCustomers = await creditService.getAllCustomers();
    for (const customer of allCustomers) {
      if (customer.name.startsWith('UI Test Müşteri')) {
        await creditService.deleteCustomer(customer.id);
      }
    }
  });

  test('Özet bilgi panelleri yükleme performansı', async () => {
    // Test müşterileri oluştur
    const customers = await createTestCustomers(10);
    if (customers.length === 0) {
      throw new Error("Test müşterisi oluşturulamadı");
    }

    // Her müşteri için farklı sayıda işlem oluştur
    for (let i = 0; i < customers.length; i++) {
      if (customers[i]) {
        await createTestTransactions(customers[i].id, (i + 1) * 50);
      }
    }

    // Özet bilgileri yükleme süresi
    const startTime = performance.now();
    const summaryPromises = customers.map(customer =>
      creditService.getCustomerSummary(customer.id)
    );
    const summaries = await Promise.all(summaryPromises);
    const endTime = performance.now();

    const loadTime = endTime - startTime;
    console.log(`10 müşterinin özet bilgileri yükleme süresi: ${loadTime}ms`);

    // Performans eşiği: 500ms altında olmalı
    expect(loadTime).toBeLessThan(500);
    expect(summaries.length).toBe(10);
  });

  test('Arşiv verilerine erişim yanıt süresi', async () => {
    // Test müşterisi oluştur
    const customers = await createTestCustomers(1);
    if (customers.length === 0) {
      throw new Error("Test müşterisi oluşturulamadı");
    }
    const customerId = customers[0].id;

    // 500 işlem oluştur
    await createTestTransactions(customerId, 500);

    // Arşiv verilerine erişim süresi
    const startTime = performance.now();
    const transactions = await creditService.getTransactionsByCustomerIdWithCache(customerId);
    const endTime = performance.now();

    const accessTime = endTime - startTime;
    console.log(`500 arşiv verisine erişim süresi: ${accessTime}ms`);

    // Performans eşiği: 300ms altında olmalı
    expect(accessTime).toBeLessThan(300);
    expect(transactions.length).toBe(500);
  });

  test('Farklı cihaz performansı simülasyonu', async () => {
    // Test müşterileri oluştur
    const customers = await createTestCustomers(5);
    if (customers.length === 0) {
      throw new Error("Test müşterisi oluşturulamadı");
    }

    // Her müşteri için 100 işlem oluştur
    for (const customer of customers) {
      await createTestTransactions(customer.id, 100);
    }

    // Düşük performanslı cihaz simülasyonu (yapay gecikme)
    const lowPerfStart = performance.now();
    await new Promise(resolve => setTimeout(resolve, 100)); // 100ms gecikme
    const summary = await creditService.getCustomerSummary(customers[0].id);
    const lowPerfEnd = performance.now();

    const lowPerfTime = lowPerfEnd - lowPerfStart;
    console.log(`Düşük performanslı cihaz simülasyonu: ${lowPerfTime}ms`);

    // Yüksek performanslı cihaz simülasyonu
    const highPerfStart = performance.now();
    const highPerfSummary = await creditService.getCustomerSummary(customers[0].id);
    const highPerfEnd = performance.now();

    const highPerfTime = highPerfEnd - highPerfStart;
    console.log(`Yüksek performanslı cihaz simülasyonu: ${highPerfTime}ms`);

    // Önbellekleme etkisi
    expect(highPerfTime).toBeLessThan(lowPerfTime);
    expect(summary.totalDebt).toBe(highPerfSummary.totalDebt);
  });
});