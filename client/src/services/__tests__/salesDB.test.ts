/**
 * salesDB Service Unit Tests
 * Satış veritabanı işlemleri için kapsamlı test senaryoları
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as salesDB from '../salesDB';
import { openDB, IDBPDatabase } from 'idb';

// Mock IDB
vi.mock('idb');

describe('salesDB Service', () => {
  let mockDb: Partial<IDBPDatabase>;
  let mockObjectStore: any;
  let mockTransaction: any;
  let mockIndex: any;

  beforeEach(() => {
    // Mock object store
    mockObjectStore = {
      get: vi.fn(),
      getAll: vi.fn(),
      add: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      index: vi.fn(),
      openCursor: vi.fn()
    };

    // Mock index
    mockIndex = {
      get: vi.fn(),
      getAll: vi.fn(),
      count: vi.fn(),
      openCursor: vi.fn()
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

  describe('addSale', () => {
    it('yeni satış kaydı eklemeli', async () => {
      const saleData = {
        items: [
          {
            id: 1,
            productId: 1,
            name: 'Test Ürün',
            quantity: 2,
            price: 100,
            vatRate: 18,
            total: 200,
            vatAmount: 36,
            totalWithVat: 236
          }
        ],
        total: 236,
        paymentMethod: 'cash' as const,
        received: 250,
        change: 14
      };

      mockObjectStore.add.mockResolvedValue(1);
      
      const result = await salesDB.addSale(saleData);
      
      expect(result).toMatchObject({
        id: 1,
        ...saleData,
        createdAt: expect.any(String),
        receiptNo: expect.stringMatching(/^RCP-\d+$/)
      });
      
      expect(mockObjectStore.add).toHaveBeenCalledWith(
        expect.objectContaining(saleData)
      );
    });

    it('veresiye satışı müşteri ID ile kaydetmeli', async () => {
      const creditSale = {
        items: [{
          id: 1,
          productId: 1,
          name: 'Test',
          quantity: 1,
          price: 100,
          vatRate: 18,
          total: 100,
          vatAmount: 18,
          totalWithVat: 118
        }],
        total: 118,
        paymentMethod: 'credit' as const,
        customerId: 5,
        received: 0,
        change: 0
      };

      mockObjectStore.add.mockResolvedValue(2);
      
      const result = await salesDB.addSale(creditSale);
      
      expect(result.customerId).toBe(5);
      expect(result.paymentMethod).toBe('credit');
    });

    it('indirimli satışı kaydetmeli', async () => {
      const discountedSale = {
        items: [{
          id: 1,
          productId: 1,
          name: 'Test',
          quantity: 1,
          price: 100,
          vatRate: 18,
          total: 100,
          vatAmount: 18,
          totalWithVat: 118
        }],
        total: 106.2,
        originalTotal: 118,
        discount: {
          type: 'percentage' as const,
          value: 10,
          amount: 11.8,
          discountedTotal: 106.2
        },
        paymentMethod: 'cash' as const,
        received: 110,
        change: 3.8
      };

      mockObjectStore.add.mockResolvedValue(3);
      
      const result = await salesDB.addSale(discountedSale);
      
      expect(result.discount).toBeDefined();
      expect(result.discount?.value).toBe(10);
      expect(result.total).toBe(106.2);
      expect(result.originalTotal).toBe(118);
    });

    it('split ödeme detaylarını kaydetmeli', async () => {
      const splitPaymentSale = {
        items: [{
          id: 1,
          productId: 1,
          name: 'Test',
          quantity: 1,
          price: 100,
          vatRate: 18,
          total: 100,
          vatAmount: 18,
          totalWithVat: 118
        }],
        total: 118,
        paymentMethod: 'split' as const,
        splitPayment: {
          cash: 50,
          card: 68
        },
        received: 118,
        change: 0
      };

      mockObjectStore.add.mockResolvedValue(4);
      
      const result = await salesDB.addSale(splitPaymentSale);
      
      expect(result.splitPayment).toBeDefined();
      expect(result.splitPayment?.cash).toBe(50);
      expect(result.splitPayment?.card).toBe(68);
    });
  });

  describe('getSales', () => {
    it('tüm satışları getirmeli', async () => {
      const mockSales = [
        { id: 1, total: 100, createdAt: '2025-01-01' },
        { id: 2, total: 200, createdAt: '2025-01-02' }
      ];

      mockObjectStore.getAll.mockResolvedValue(mockSales);
      
      const result = await salesDB.getSales();
      
      expect(result).toEqual(mockSales);
      expect(mockObjectStore.getAll).toHaveBeenCalled();
    });

    it('tarih aralığına göre filtrelemeli', async () => {
      const mockSales = [
        { id: 1, total: 100, createdAt: '2025-01-05T10:00:00Z' },
        { id: 2, total: 200, createdAt: '2025-01-10T10:00:00Z' },
        { id: 3, total: 300, createdAt: '2025-01-15T10:00:00Z' }
      ];

      mockObjectStore.getAll.mockResolvedValue(mockSales);
      
      const result = await salesDB.getSalesByDateRange(
        new Date('2025-01-05'),
        new Date('2025-01-12')
      );
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });

    it('müşteriye göre satışları getirmeli', async () => {
      const mockSales = [
        { id: 1, customerId: 5, total: 100 },
        { id: 2, customerId: 5, total: 200 }
      ];

      mockIndex.getAll.mockResolvedValue(mockSales);
      
      const result = await salesDB.getSalesByCustomer(5);
      
      expect(result).toEqual(mockSales);
      expect(mockIndex.getAll).toHaveBeenCalledWith(5);
    });

    it('ödeme yöntemine göre filtrelemeli', async () => {
      const allSales = [
        { id: 1, paymentMethod: 'cash', total: 100 },
        { id: 2, paymentMethod: 'card', total: 200 },
        { id: 3, paymentMethod: 'cash', total: 150 }
      ];

      mockObjectStore.getAll.mockResolvedValue(allSales);
      
      const result = await salesDB.getSalesByPaymentMethod('cash');
      
      expect(result).toHaveLength(2);
      expect(result.every(s => s.paymentMethod === 'cash')).toBe(true);
    });
  });

  describe('getSaleById', () => {
    it('ID ile satışı getirmeli', async () => {
      const mockSale = { 
        id: 1, 
        total: 100, 
        items: [],
        createdAt: '2025-01-01'
      };

      mockObjectStore.get.mockResolvedValue(mockSale);
      
      const result = await salesDB.getSaleById(1);
      
      expect(result).toEqual(mockSale);
      expect(mockObjectStore.get).toHaveBeenCalledWith(1);
    });

    it('satış bulunamazsa null dönmeli', async () => {
      mockObjectStore.get.mockResolvedValue(undefined);
      
      const result = await salesDB.getSaleById(999);
      
      expect(result).toBeNull();
    });
  });

  describe('updateSale', () => {
    it('satışı güncellemeli', async () => {
      const existingSale = {
        id: 1,
        total: 100,
        items: [],
        status: 'completed'
      };

      const updates = {
        status: 'cancelled',
        cancelReason: 'Müşteri iptali'
      };

      mockObjectStore.get.mockResolvedValue(existingSale);
      mockObjectStore.put.mockResolvedValue(1);
      
      const result = await salesDB.updateSale(1, updates);
      
      expect(result).toMatchObject({
        ...existingSale,
        ...updates
      });
      
      expect(mockObjectStore.put).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          status: 'cancelled',
          cancelReason: 'Müşteri iptali'
        })
      );
    });

    it('satış bulunamazsa hata fırlatmalı', async () => {
      mockObjectStore.get.mockResolvedValue(undefined);
      
      await expect(salesDB.updateSale(999, {}))
        .rejects.toThrow('Satış bulunamadı');
    });
  });

  describe('deleteSale', () => {
    it('satışı silmeli', async () => {
      mockObjectStore.delete.mockResolvedValue(undefined);
      
      await salesDB.deleteSale(1);
      
      expect(mockObjectStore.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('getDailySalesReport', () => {
    it('günlük satış raporunu hesaplamalı', async () => {
      const date = new Date('2025-01-15');
      const mockSales = [
        { 
          id: 1, 
          total: 100, 
          paymentMethod: 'cash',
          createdAt: '2025-01-15T10:00:00Z'
        },
        { 
          id: 2, 
          total: 200, 
          paymentMethod: 'card',
          createdAt: '2025-01-15T14:00:00Z'
        },
        { 
          id: 3, 
          total: 150, 
          paymentMethod: 'cash',
          createdAt: '2025-01-15T18:00:00Z'
        }
      ];

      mockObjectStore.getAll.mockResolvedValue(mockSales);
      
      const report = await salesDB.getDailySalesReport(date);
      
      expect(report).toMatchObject({
        date: '2025-01-15',
        totalSales: 3,
        totalRevenue: 450,
        cashTotal: 250,
        cardTotal: 200,
        creditTotal: 0,
        averageTicket: 150
      });
    });

    it('satış yoksa sıfır değerler dönmeli', async () => {
      mockObjectStore.getAll.mockResolvedValue([]);
      
      const report = await salesDB.getDailySalesReport(new Date());
      
      expect(report).toMatchObject({
        totalSales: 0,
        totalRevenue: 0,
        cashTotal: 0,
        cardTotal: 0,
        creditTotal: 0,
        averageTicket: 0
      });
    });
  });

  describe('getTopSellingProducts', () => {
    it('en çok satan ürünleri hesaplamalı', async () => {
      const mockSales = [
        {
          id: 1,
          items: [
            { productId: 1, name: 'Ürün 1', quantity: 5, total: 500 },
            { productId: 2, name: 'Ürün 2', quantity: 2, total: 200 }
          ]
        },
        {
          id: 2,
          items: [
            { productId: 1, name: 'Ürün 1', quantity: 3, total: 300 },
            { productId: 3, name: 'Ürün 3', quantity: 4, total: 400 }
          ]
        }
      ];

      mockObjectStore.getAll.mockResolvedValue(mockSales);
      
      const result = await salesDB.getTopSellingProducts(2);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        productId: 1,
        name: 'Ürün 1',
        totalQuantity: 8,
        totalRevenue: 800
      });
      expect(result[1]).toMatchObject({
        productId: 3,
        name: 'Ürün 3',
        totalQuantity: 4,
        totalRevenue: 400
      });
    });
  });

  describe('generateReceiptNo', () => {
    it('benzersiz fiş numarası üretmeli', () => {
      const receipt1 = salesDB.generateReceiptNo();
      const receipt2 = salesDB.generateReceiptNo();
      
      expect(receipt1).toMatch(/^RCP-\d+$/);
      expect(receipt2).toMatch(/^RCP-\d+$/);
      expect(receipt1).not.toBe(receipt2);
    });

    it('artan sırada numara üretmeli', () => {
      const receipts = Array.from({ length: 5 }, () => 
        salesDB.generateReceiptNo()
      );
      
      const numbers = receipts.map(r => 
        parseInt(r.replace('RCP-', ''))
      );
      
      for (let i = 1; i < numbers.length; i++) {
        expect(numbers[i]).toBeGreaterThan(numbers[i - 1]);
      }
    });
  });

  describe('searchSales', () => {
    it('fiş numarasına göre arama yapmalı', async () => {
      const mockSales = [
        { id: 1, receiptNo: 'RCP-001', total: 100 },
        { id: 2, receiptNo: 'RCP-002', total: 200 },
        { id: 3, receiptNo: 'RCP-003', total: 300 }
      ];

      mockObjectStore.getAll.mockResolvedValue(mockSales);
      
      const result = await salesDB.searchSales('RCP-002');
      
      expect(result).toHaveLength(1);
      expect(result[0].receiptNo).toBe('RCP-002');
    });

    it('müşteri adına göre arama yapmalı', async () => {
      const mockSales = [
        { id: 1, customerName: 'Ali Veli', total: 100 },
        { id: 2, customerName: 'Ayşe Fatma', total: 200 },
        { id: 3, customerName: 'Ali Yılmaz', total: 300 }
      ];

      mockObjectStore.getAll.mockResolvedValue(mockSales);
      
      const result = await salesDB.searchSales('Ali');
      
      expect(result).toHaveLength(2);
      expect(result.every(s => s.customerName?.includes('Ali'))).toBe(true);
    });
  });

  describe('calculateTaxReport', () => {
    it('KDV raporunu hesaplamalı', async () => {
      const mockSales = [
        {
          id: 1,
          items: [
            { vatRate: 18, vatAmount: 18, totalWithVat: 118 },
            { vatRate: 8, vatAmount: 8, totalWithVat: 108 }
          ],
          total: 226
        },
        {
          id: 2,
          items: [
            { vatRate: 18, vatAmount: 36, totalWithVat: 236 },
            { vatRate: 1, vatAmount: 1, totalWithVat: 101 }
          ],
          total: 337
        }
      ];

      mockObjectStore.getAll.mockResolvedValue(mockSales);
      
      const report = await salesDB.calculateTaxReport(
        new Date('2025-01-01'),
        new Date('2025-01-31')
      );
      
      expect(report).toMatchObject({
        totalSales: 563,
        totalVat: 63,
        vatByRate: {
          1: 1,
          8: 8,
          18: 54
        }
      });
    });
  });

  describe('exportSalesData', () => {
    it('satış verilerini CSV formatında export etmeli', async () => {
      const mockSales = [
        {
          id: 1,
          receiptNo: 'RCP-001',
          createdAt: '2025-01-01T10:00:00Z',
          total: 118,
          paymentMethod: 'cash'
        },
        {
          id: 2,
          receiptNo: 'RCP-002',
          createdAt: '2025-01-02T14:00:00Z',
          total: 236,
          paymentMethod: 'card'
        }
      ];

      mockObjectStore.getAll.mockResolvedValue(mockSales);
      
      const csv = await salesDB.exportSalesData('csv');
      
      expect(csv).toContain('Receipt No,Date,Total,Payment Method');
      expect(csv).toContain('RCP-001,2025-01-01,118,cash');
      expect(csv).toContain('RCP-002,2025-01-02,236,card');
    });

    it('satış verilerini JSON formatında export etmeli', async () => {
      const mockSales = [
        { id: 1, total: 100 },
        { id: 2, total: 200 }
      ];

      mockObjectStore.getAll.mockResolvedValue(mockSales);
      
      const json = await salesDB.exportSalesData('json');
      
      const parsed = JSON.parse(json);
      expect(parsed).toEqual(mockSales);
    });
  });
});
