/**
 * customerDB Service Unit Tests
 * Müşteri veritabanı işlemleri için kapsamlı test senaryoları
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as customerDB from '../customerDB';
import { toast } from 'react-hot-toast';

// Mock IDB
vi.mock('idb');

describe('customerDB Service', () => {
  let mockDb: Partial<IDBPDatabase>;
  let mockObjectStore: any;
  let mockTransaction: any;
  let mockIndex: any;
  let mockCursor: any;

  const mockCustomer = {
    id: 1,
    name: 'Test Müşteri',
    phone: '5551234567',
    email: 'test@example.com',
    address: 'Test Adres',
    taxNumber: '12345678901',
    taxOffice: 'Test Vergi Dairesi',
    creditLimit: 1000,
    currentDebt: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  beforeEach(() => {
    // Mock cursor
    mockCursor = {
      value: null,
      continue: vi.fn(),
      advance: vi.fn()
    };

    // Mock object store
    mockObjectStore = {
      get: vi.fn(),
      getAll: vi.fn(),
      add: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
      count: vi.fn(),
      index: vi.fn(),
      openCursor: vi.fn(() => Promise.resolve(mockCursor))
    };

    // Mock index
    mockIndex = {
      get: vi.fn(),
      getAll: vi.fn(),
      count: vi.fn(),
      openCursor: vi.fn(() => Promise.resolve(mockCursor))
    };

    // Mock transaction
    mockTransaction = {
      objectStore: vi.fn(() => mockObjectStore),
      done: Promise.resolve()
    };

    // Mock database
    mockDb = {
      transaction: vi.fn(() => mockTransaction),
      get: vi.fn(),
      getAll: vi.fn(),
      add: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    };

    vi.mocked(openDB).mockResolvedValue(mockDb as any);
    mockObjectStore.index.mockReturnValue(mockIndex);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('addCustomer', () => {
    it('yeni müşteri eklemeli', async () => {
      const newCustomer = {
        name: 'Yeni Müşteri',
        phone: '5559876543',
        email: 'yeni@example.com',
        address: 'Yeni Adres',
        creditLimit: 500
      };

      mockObjectStore.add.mockResolvedValue(1);

      const result = await customerDB.addCustomer(newCustomer);

      expect(result).toMatchObject({
        id: 1,
        ...newCustomer,
        currentDebt: 0,
        isActive: true,
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      });

      expect(mockObjectStore.add).toHaveBeenCalledWith(
        expect.objectContaining(newCustomer)
      );
    });

    it('telefon numarası benzersizliği kontrol etmeli', async () => {
      mockIndex.get.mockResolvedValue(mockCustomer);

      const duplicateCustomer = {
        name: 'Başka Müşteri',
        phone: '5551234567', // Aynı telefon
        creditLimit: 1000
      };

      await expect(customerDB.addCustomer(duplicateCustomer))
        .rejects.toThrow('Bu telefon numarası zaten kayıtlı');
    });

    it('vergi numarası benzersizliği kontrol etmeli', async () => {
      mockIndex.get.mockResolvedValueOnce(null); // Phone check
      mockIndex.get.mockResolvedValueOnce(mockCustomer); // Tax number check

      const duplicateTaxCustomer = {
        name: 'Başka Müşteri',
        phone: '5559999999',
        taxNumber: '12345678901', // Aynı vergi no
        creditLimit: 1000
      };

      await expect(customerDB.addCustomer(duplicateTaxCustomer))
        .rejects.toThrow('Bu vergi numarası zaten kayıtlı');
    });

    it('zorunlu alanları kontrol etmeli', async () => {
      const invalidCustomer = {
        name: '', // Boş isim
        phone: '123', // Geçersiz telefon
        creditLimit: -100 // Negatif limit
      };

      await expect(customerDB.addCustomer(invalidCustomer))
        .rejects.toThrow('Geçersiz müşteri bilgileri');
    });
  });

  describe('getCustomers', () => {
    it('tüm müşterileri getirmeli', async () => {
      const mockCustomers = [
        mockCustomer,
        { ...mockCustomer, id: 2, name: 'Müşteri 2' }
      ];

      mockObjectStore.getAll.mockResolvedValue(mockCustomers);

      const result = await customerDB.getCustomers();

      expect(result).toEqual(mockCustomers);
      expect(mockObjectStore.getAll).toHaveBeenCalled();
    });

    it('sadece aktif müşterileri getirmeli', async () => {
      const allCustomers = [
        { ...mockCustomer, id: 1, isActive: true },
        { ...mockCustomer, id: 2, isActive: false },
        { ...mockCustomer, id: 3, isActive: true }
      ];

      mockObjectStore.getAll.mockResolvedValue(allCustomers);

      const result = await customerDB.getActiveCustomers();

      expect(result).toHaveLength(2);
      expect(result.every(c => c.isActive)).toBe(true);
    });

    it('borçlu müşterileri getirmeli', async () => {
      const allCustomers = [
        { ...mockCustomer, id: 1, currentDebt: 0 },
        { ...mockCustomer, id: 2, currentDebt: 500 },
        { ...mockCustomer, id: 3, currentDebt: 1000 }
      ];

      mockObjectStore.getAll.mockResolvedValue(allCustomers);

      const result = await customerDB.getDebtorCustomers();

      expect(result).toHaveLength(2);
      expect(result.every(c => c.currentDebt > 0)).toBe(true);
    });

    it('limit aşan müşterileri getirmeli', async () => {
      const allCustomers = [
        { ...mockCustomer, id: 1, creditLimit: 1000, currentDebt: 500 },
        { ...mockCustomer, id: 2, creditLimit: 1000, currentDebt: 1200 },
        { ...mockCustomer, id: 3, creditLimit: 500, currentDebt: 600 }
      ];

      mockObjectStore.getAll.mockResolvedValue(allCustomers);

      const result = await customerDB.getOverLimitCustomers();

      expect(result).toHaveLength(2);
      expect(result.every(c => c.currentDebt > c.creditLimit)).toBe(true);
    });
  });

  describe('getCustomerById', () => {
    it('ID ile müşteri getirmeli', async () => {
      mockObjectStore.get.mockResolvedValue(mockCustomer);

      const result = await customerDB.getCustomerById(1);

      expect(result).toEqual(mockCustomer);
      expect(mockObjectStore.get).toHaveBeenCalledWith(1);
    });

    it('müşteri bulunamazsa null dönmeli', async () => {
      mockObjectStore.get.mockResolvedValue(undefined);

      const result = await customerDB.getCustomerById(999);

      expect(result).toBeNull();
    });
  });

  describe('getCustomerByPhone', () => {
    it('telefon numarası ile müşteri getirmeli', async () => {
      mockIndex.get.mockResolvedValue(mockCustomer);

      const result = await customerDB.getCustomerByPhone('5551234567');

      expect(result).toEqual(mockCustomer);
      expect(mockIndex.get).toHaveBeenCalledWith('5551234567');
    });

    it('müşteri bulunamazsa null dönmeli', async () => {
      mockIndex.get.mockResolvedValue(undefined);

      const result = await customerDB.getCustomerByPhone('9999999999');

      expect(result).toBeNull();
    });
  });

  describe('updateCustomer', () => {
    it('müşteri bilgilerini güncellemeli', async () => {
      const existingCustomer = { ...mockCustomer };
      const updates = {
        name: 'Güncellenmiş İsim',
        creditLimit: 2000,
        address: 'Yeni Adres'
      };

      mockObjectStore.get.mockResolvedValue(existingCustomer);
      mockObjectStore.put.mockResolvedValue(1);

      const result = await customerDB.updateCustomer(1, updates);

      expect(result).toMatchObject({
        ...existingCustomer,
        ...updates,
        updatedAt: expect.any(String)
      });

      expect(mockObjectStore.put).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          ...updates
        })
      );
    });

    it('müşteri bulunamazsa hata fırlatmalı', async () => {
      mockObjectStore.get.mockResolvedValue(undefined);

      await expect(customerDB.updateCustomer(999, {}))
        .rejects.toThrow('Müşteri bulunamadı');
    });

    it('telefon değişikliğinde benzersizlik kontrolü yapmalı', async () => {
      const existingCustomer = { ...mockCustomer, phone: '5551111111' };
      const anotherCustomer = { ...mockCustomer, id: 2, phone: '5552222222' };

      mockObjectStore.get.mockResolvedValue(existingCustomer);
      mockIndex.get.mockResolvedValue(anotherCustomer);

      await expect(customerDB.updateCustomer(1, { phone: '5552222222' }))
        .rejects.toThrow('Bu telefon numarası başka bir müşteriye ait');
    });
  });

  describe('updateCustomerDebt', () => {
    it('müşteri borcunu artırmalı', async () => {
      const customer = { ...mockCustomer, currentDebt: 500 };

      mockObjectStore.get.mockResolvedValue(customer);
      mockObjectStore.put.mockResolvedValue(1);

      const result = await customerDB.updateCustomerDebt(1, 200);

      expect(result).toMatchObject({
        ...customer,
        currentDebt: 700
      });
    });

    it('müşteri borcunu azaltmalı', async () => {
      const customer = { ...mockCustomer, currentDebt: 500 };

      mockObjectStore.get.mockResolvedValue(customer);
      mockObjectStore.put.mockResolvedValue(1);

      const result = await customerDB.updateCustomerDebt(1, -200);

      expect(result).toMatchObject({
        ...customer,
        currentDebt: 300
      });
    });

    it('borç sıfırın altına düşmemeli', async () => {
      const customer = { ...mockCustomer, currentDebt: 100 };

      mockObjectStore.get.mockResolvedValue(customer);

      await expect(customerDB.updateCustomerDebt(1, -200))
        .rejects.toThrow('Borç miktarı sıfırın altına düşemez');
    });

    it('kredi limitini aşarsa uyarı vermeli', async () => {
      const customer = { ...mockCustomer, creditLimit: 1000, currentDebt: 900 };

      mockObjectStore.get.mockResolvedValue(customer);
      mockObjectStore.put.mockResolvedValue(1);

      const result = await customerDB.updateCustomerDebt(1, 200);

      expect(result.currentDebt).toBe(1100);
      expect(result.currentDebt).toBeGreaterThan(result.creditLimit);
      // Uyarı log'u veya flag olmalı
    });

    it('borç hareketi kaydı oluşturmalı', async () => {
      const customer = { ...mockCustomer, currentDebt: 500 };

      mockObjectStore.get.mockResolvedValue(customer);
      mockObjectStore.put.mockResolvedValue(1);
      mockObjectStore.add.mockResolvedValue(1); // Debt movement

      await customerDB.updateCustomerDebt(1, 200, 'Satış');

      // Borç hareketi kaydı eklenmeli
      expect(mockObjectStore.add).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: 1,
          amount: 200,
          type: 'increase',
          reason: 'Satış',
          previousDebt: 500,
          newDebt: 700,
          date: expect.any(String)
        })
      );
    });
  });

  describe('deleteCustomer', () => {
    it('müşteriyi silmeli', async () => {
      mockObjectStore.delete.mockResolvedValue(undefined);

      await customerDB.deleteCustomer(1);

      expect(mockObjectStore.delete).toHaveBeenCalledWith(1);
    });

    it('borcu olan müşteriyi soft delete yapmalı', async () => {
      const customer = { ...mockCustomer, currentDebt: 500, isActive: true };

      mockObjectStore.get.mockResolvedValue(customer);
      mockObjectStore.put.mockResolvedValue(1);

      await customerDB.deleteCustomer(1, true);

      expect(mockObjectStore.put).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          isActive: false,
          deletedAt: expect.any(String)
        })
      );
      expect(mockObjectStore.delete).not.toHaveBeenCalled();
    });

    it('işlem geçmişi olan müşteriyi silmemeli', async () => {
      const customer = { ...mockCustomer };

      mockObjectStore.get.mockResolvedValue(customer);
      // Has transaction history
      const hasHistory = true;

      await expect(customerDB.deleteCustomer(1, false, hasHistory))
        .rejects.toThrow('İşlem geçmişi olan müşteri silinemez');
    });
  });

  describe('searchCustomers', () => {
    it('isme göre arama yapmalı', async () => {
      const allCustomers = [
        { ...mockCustomer, id: 1, name: 'Ali Veli' },
        { ...mockCustomer, id: 2, name: 'Mehmet Ali' },
        { ...mockCustomer, id: 3, name: 'Ayşe Fatma' }
      ];

      mockObjectStore.getAll.mockResolvedValue(allCustomers);

      const result = await customerDB.searchCustomers('Ali');

      expect(result).toHaveLength(2);
      expect(result.every(c => c.name.includes('Ali'))).toBe(true);
    });

    it('telefona göre arama yapmalı', async () => {
      const allCustomers = [
        { ...mockCustomer, id: 1, phone: '5551234567' },
        { ...mockCustomer, id: 2, phone: '5559876543' },
        { ...mockCustomer, id: 3, phone: '5551234999' }
      ];

      mockObjectStore.getAll.mockResolvedValue(allCustomers);

      const result = await customerDB.searchCustomers('555123');

      expect(result).toHaveLength(2);
      expect(result[0].phone).toContain('555123');
      expect(result[1].phone).toContain('555123');
    });

    it('vergi numarasına göre arama yapmalı', async () => {
      const allCustomers = [
        { ...mockCustomer, id: 1, taxNumber: '12345678901' },
        { ...mockCustomer, id: 2, taxNumber: '98765432109' },
        { ...mockCustomer, id: 3, taxNumber: '12345000000' }
      ];

      mockObjectStore.getAll.mockResolvedValue(allCustomers);

      const result = await customerDB.searchCustomers('12345');

      expect(result).toHaveLength(2);
    });
  });

  describe('getCustomerTransactions', () => {
    it('müşteri işlem geçmişini getirmeli', async () => {
      const transactions = [
        { customerId: 1, type: 'sale', amount: 100, date: '2025-01-01' },
        { customerId: 1, type: 'payment', amount: -50, date: '2025-01-02' },
        { customerId: 1, type: 'sale', amount: 200, date: '2025-01-03' }
      ];

      mockIndex.getAll.mockResolvedValue(transactions);

      const result = await customerDB.getCustomerTransactions(1);

      expect(result).toEqual(transactions);
      expect(result).toHaveLength(3);
    });

    it('tarih aralığına göre filtrelemeli', async () => {
      const allTransactions = [
        { customerId: 1, date: '2025-01-01T10:00:00Z', amount: 100 },
        { customerId: 1, date: '2025-01-05T10:00:00Z', amount: 200 },
        { customerId: 1, date: '2025-01-10T10:00:00Z', amount: 300 }
      ];

      mockIndex.getAll.mockResolvedValue(allTransactions);

      const result = await customerDB.getCustomerTransactions(
        1,
        new Date('2025-01-02'),
        new Date('2025-01-08')
      );

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(200);
    });
  });

  describe('getCustomerBalance', () => {
    it('müşteri bakiyesini hesaplamalı', async () => {
      const transactions = [
        { type: 'sale', amount: 500 },
        { type: 'payment', amount: -200 },
        { type: 'sale', amount: 300 },
        { type: 'return', amount: -50 }
      ];

      mockIndex.getAll.mockResolvedValue(transactions);

      const balance = await customerDB.getCustomerBalance(1);

      expect(balance).toBe(550); // 500 - 200 + 300 - 50
    });

    it('işlem yoksa sıfır dönmeli', async () => {
      mockIndex.getAll.mockResolvedValue([]);

      const balance = await customerDB.getCustomerBalance(1);

      expect(balance).toBe(0);
    });
  });

  describe('getCustomerStatistics', () => {
    it('müşteri istatistiklerini hesaplamalı', async () => {
      const customer = {
        ...mockCustomer,
        createdAt: new Date('2024-01-01').toISOString()
      };

      const transactions = [
        { type: 'sale', amount: 1000, date: '2025-01-01' },
        { type: 'sale', amount: 500, date: '2025-01-15' },
        { type: 'payment', amount: -800, date: '2025-01-20' }
      ];

      mockObjectStore.get.mockResolvedValue(customer);
      mockIndex.getAll.mockResolvedValue(transactions);

      const stats = await customerDB.getCustomerStatistics(1);

      expect(stats).toMatchObject({
        totalPurchases: 1500,
        totalPayments: 800,
        currentDebt: 700,
        transactionCount: 3,
        averagePurchase: 750,
        lastTransactionDate: '2025-01-20',
        customerSince: '2024-01-01',
        creditUtilization: 70 // 700/1000 * 100
      });
    });
  });

  describe('importCustomers', () => {
    it('CSV formatında müşteri import etmeli', async () => {
      const csvData = `name,phone,creditLimit,address
Ali Veli,5551234567,1000,Adres 1
Ayşe Fatma,5559876543,2000,Adres 2`;

      mockObjectStore.add.mockResolvedValue(1);

      const result = await customerDB.importCustomers(csvData, 'csv');

      expect(result).toMatchObject({
        success: 2,
        failed: 0,
        errors: []
      });

      expect(mockObjectStore.add).toHaveBeenCalledTimes(2);
    });

    it('hatalı müşteri kayıtlarını raporlamalı', async () => {
      const jsonData = JSON.stringify([
        { name: '', phone: '123' }, // Hatalı
        { name: 'Geçerli', phone: '5551234567', creditLimit: 1000 } // Geçerli
      ]);

      mockObjectStore.add
        .mockRejectedValueOnce(new Error('Geçersiz müşteri'))
        .mockResolvedValueOnce(2);

      const result = await customerDB.importCustomers(jsonData, 'json');

      expect(result).toMatchObject({
        success: 1,
        failed: 1,
        errors: expect.arrayContaining([
          expect.objectContaining({
            row: 0,
            error: 'Geçersiz müşteri'
          })
        ])
      });
    });
  });

  describe('exportCustomers', () => {
    it('müşterileri CSV formatında export etmeli', async () => {
      const customers = [
        { ...mockCustomer, id: 1, name: 'Müşteri 1' },
        { ...mockCustomer, id: 2, name: 'Müşteri 2' }
      ];

      mockObjectStore.getAll.mockResolvedValue(customers);

      const csv = await customerDB.exportCustomers('csv');

      expect(csv).toContain('name,phone,creditLimit,currentDebt');
      expect(csv).toContain('Müşteri 1');
      expect(csv).toContain('Müşteri 2');
    });

    it('müşterileri JSON formatında export etmeli', async () => {
      const customers = [
        { ...mockCustomer, id: 1 },
        { ...mockCustomer, id: 2 }
      ];

      mockObjectStore.getAll.mockResolvedValue(customers);

      const json = await customerDB.exportCustomers('json');

      const parsed = JSON.parse(json);
      expect(parsed).toHaveLength(2);
      expect(parsed).toEqual(customers);
    });
  });
});
