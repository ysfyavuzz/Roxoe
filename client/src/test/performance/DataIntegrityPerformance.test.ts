/**
 * Data Integrity Performance Tests
 * Veri bütünlüğü, devir işlemleri ve tutarlılık testleri
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
      name: `Integrity Test Müşteri ${i + 1}`,
      phone: `555${(4000 + i).toString().slice(1)}`,
      creditLimit: 10000,
      note: `Integrity test müşterisi ${i + 1}`
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
      description: `Integrity test işlemi ${i + 1}`,
      dueDate: new Date(Date.now() + (Math.random() * 30 + 1) * 24 * 60 * 60 * 1000)
    };

    const addedTx = await creditService.addTransaction(transaction);
    transactions.push(addedTx);
  }
  return transactions;
}

test.describe('Data Integrity Performance Tests', () => {
  test.beforeAll(async () => {
    // Test veritabanını temizle
    await creditService.initCreditDB();
  });

  test.afterAll(async () => {
    // Test verilerini temizle
    const allCustomers = await creditService.getAllCustomers();
    for (const customer of allCustomers) {
      if (customer.name.startsWith('Integrity Test Müşteri')) {
        await creditService.deleteCustomer(customer.id);
      }
    }
  });

  test('Devir işlemleri sırasında veri bütünlüğü', async () => {
    // Test müşterileri oluştur
    const customers = await createTestCustomers(3);
    if (customers.length === 0) {
      throw new Error("Test müşterisi oluşturulamadı");
    }

    // Her müşteri için 100 işlem oluştur
    for (const customer of customers) {
      await createTestTransactions(customer.id, 100);
    }

    // Devir öncesi toplam borç hesaplama
    let totalDebtBefore = 0;
    for (const customer of customers) {
      const summary = await creditService.getCustomerSummary(customer.id);
      totalDebtBefore += summary.totalDebt;
    }

    // Devir işlemi simülasyonu - tüm işlemleri "paid" olarak işaretle
    const allTransactions = await creditService.getAllTransactions();
    const activeTransactions = allTransactions.filter(tx =>
      tx.status === 'active' || tx.status === 'overdue'
    );

    for (const tx of activeTransactions) {
      await creditService.updateTransactionStatus(tx.id, 'paid');
    }

    // Devir sonrası toplam borç hesaplama
    let totalDebtAfter = 0;
    for (const customer of customers) {
      const summary = await creditService.getCustomerSummary(customer.id);
      totalDebtAfter += summary.totalDebt;
    }

    console.log(`Devir öncesi toplam borç: ${totalDebtBefore}`);
    console.log(`Devir sonrası toplam borç: ${totalDebtAfter}`);

    // Veri bütünlüğü kontrolü - devir sonrası borç 0 olmalı
    expect(totalDebtAfter).toBe(0);
  });

  test('Toplamların doğru şekilde korunduğu test', async () => {
    // Test müşterileri oluştur
    const customers = await createTestCustomers(5);
    if (customers.length === 0) {
      throw new Error("Test müşterisi oluşturulamadı");
    }

    // Her müşteri için farklı sayıda işlem oluştur
    const transactionCounts = [50, 75, 100, 125, 150];
    for (let i = 0; i < customers.length; i++) {
      await createTestTransactions(customers[i].id, transactionCounts[i]);
    }

    // Doğrudan veritabanından toplam borç hesaplama
    const allTransactions = await creditService.getAllTransactions();
    const directTotalDebt = allTransactions
      .filter(tx => tx.type === 'debt' && tx.status === 'active')
      .reduce((sum, tx) => sum + tx.amount, 0);

    // Özet bilgilerinden toplam borç hesaplama
    let summaryTotalDebt = 0;
    for (const customer of customers) {
      const summary = await creditService.getCustomerSummary(customer.id);
      summaryTotalDebt += summary.totalDebt;
    }

    console.log(`Doğrudan hesaplanan toplam borç: ${directTotalDebt}`);
    console.log(`Özetlerden hesaplanan toplam borç: ${summaryTotalDebt}`);

    // Tutarlılık kontrolü
    expect(Math.abs(directTotalDebt - summaryTotalDebt)).toBeLessThan(1);
  });

  test('Arşiv ve aktif veritabanı tutarlılığı', async () => {
    // Test müşterileri oluştur
    const customers = await createTestCustomers(2);
    if (customers.length === 0) {
      throw new Error("Test müşterisi oluşturulamadı");
    }

    // Her müşteri için 200 işlem oluştur
    for (const customer of customers) {
      await createTestTransactions(customer.id, 200);
    }

    // Aktif veritabanından toplam işlem sayısı
    const allTransactions = await creditService.getAllTransactions();
    const activeTransactionCount = allTransactions.length;

    // Her müşterinin işlem sayısı
    let customerTransactionCount = 0;
    for (const customer of customers) {
      const transactions = await creditService.getTransactionsByCustomerId(customer.id);
      customerTransactionCount += transactions.length;
    }

    console.log(`Aktif veritabanı toplam işlem sayısı: ${activeTransactionCount}`);
    console.log(`Müşteri bazlı toplam işlem sayısı: ${customerTransactionCount}`);

    // Tutarlılık kontrolü
    expect(activeTransactionCount).toBe(customerTransactionCount);
  });
});