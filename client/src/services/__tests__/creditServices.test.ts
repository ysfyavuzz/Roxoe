/**
 * creditServices Unit Tests
 * Veresiye işlemleri servisi için kapsamlı test senaryoları
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as creditServices from '../creditServices';
import * as customerDB from '../customerDB';
import * as salesDB from '../salesDB';
import { openDB, IDBPDatabase } from 'idb';

// Mock dependencies
vi.mock('idb');
vi.mock('../customerDB');
vi.mock('../salesDB');

describe('creditServices', () => {
  let mockDb: Partial<IDBPDatabase>;
  let mockObjectStore: any;
  let mockTransaction: any;
  let mockIndex: any;

  const mockCreditSale = {
    id: 1,
    customerId: 1,
    customerName: 'Test Müşteri',
    saleId: 1,
    amount: 500,
    remainingAmount: 500,
    status: 'pending' as const,
    dueDate: '2025-02-01',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockPayment = {
    id: 1,
    creditSaleId: 1,
    customerId: 1,
    amount: 200,
    paymentMethod: 'cash' as const,
    paymentDate: new Date().toISOString(),
    notes: 'Kısmi ödeme'
  };

  beforeEach(() => {
    // Mock object store
    mockObjectStore = {
      get: vi.fn(),
      getAll: vi.fn(),
      add: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
      count: vi.fn(),
      index: vi.fn()
    };

    // Mock index
    mockIndex = {
      get: vi.fn(),
      getAll: vi.fn(),
      count: vi.fn()
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

  describe('addCreditSale', () => {
    it('yeni veresiye satışı eklemeli', async () => {
      mockObjectStore.add.mockResolvedValue(1);
      
      vi.mocked(customerDB.getCustomerById).mockResolvedValue({
        id: 1,
        name: 'Test Müşteri',
        creditLimit: 1000,
        currentDebt: 200
      });

      vi.mocked(customerDB.updateCustomerDebt).mockResolvedValue({
        id: 1,
        currentDebt: 700
      });

      const creditData = {
        customerId: 1,
        saleId: 1,
        amount: 500,
        dueDate: '2025-02-01'
      };

      const result = await creditServices.addCreditSale(creditData);

      expect(result).toMatchObject({
        id: 1,
        ...creditData,
        remainingAmount: 500,
        status: 'pending',
        customerName: 'Test Müşteri'
      });

      expect(customerDB.updateCustomerDebt).toHaveBeenCalledWith(1, 500);
      expect(mockObjectStore.add).toHaveBeenCalled();
    });

    it('kredi limiti aşımını kontrol etmeli', async () => {
      vi.mocked(customerDB.getCustomerById).mockResolvedValue({
        id: 1,
        name: 'Test Müşteri',
        creditLimit: 500,
        currentDebt: 400
      });

      const creditData = {
        customerId: 1,
        saleId: 1,
        amount: 200, // 400 + 200 = 600 > 500 limit
        dueDate: '2025-02-01'
      };

      await expect(creditServices.addCreditSale(creditData))
        .rejects.toThrow('Kredi limiti aşılıyor');
    });

    it('müşteri bulunamazsa hata fırlatmalı', async () => {
      vi.mocked(customerDB.getCustomerById).mockResolvedValue(null);

      await expect(creditServices.addCreditSale({
        customerId: 999,
        saleId: 1,
        amount: 100
      })).rejects.toThrow('Müşteri bulunamadı');
    });

    it('vade tarihi geçmişte olamaz', async () => {
      vi.mocked(customerDB.getCustomerById).mockResolvedValue({
        id: 1,
        name: 'Test',
        creditLimit: 1000,
        currentDebt: 0
      });

      await expect(creditServices.addCreditSale({
        customerId: 1,
        saleId: 1,
        amount: 100,
        dueDate: '2024-01-01' // Geçmiş tarih
      })).rejects.toThrow('Vade tarihi geçmişte olamaz');
    });
  });

  describe('addPayment', () => {
    it('ödeme kaydı eklemeli ve borcu güncellemeli', async () => {
      mockObjectStore.get.mockResolvedValue(mockCreditSale);
      mockObjectStore.put.mockResolvedValue(1);
      mockObjectStore.add.mockResolvedValue(1);

      vi.mocked(customerDB.updateCustomerDebt).mockResolvedValue({
        id: 1,
        currentDebt: 300
      });

      const paymentData = {
        creditSaleId: 1,
        amount: 200,
        paymentMethod: 'cash' as const,
        notes: 'Kısmi ödeme'
      };

      const result = await creditServices.addPayment(paymentData);

      expect(result).toMatchObject({
        id: 1,
        ...paymentData,
        customerId: 1,
        paymentDate: expect.any(String)
      });

      // Veresiye kaydı güncellenmeli
      expect(mockObjectStore.put).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          remainingAmount: 300 // 500 - 200
        })
      );

      // Müşteri borcu azaltılmalı
      expect(customerDB.updateCustomerDebt).toHaveBeenCalledWith(1, -200);
    });

    it('tam ödeme yapıldığında status paid olmalı', async () => {
      mockObjectStore.get.mockResolvedValue(mockCreditSale);
      mockObjectStore.put.mockResolvedValue(1);
      mockObjectStore.add.mockResolvedValue(1);

      vi.mocked(customerDB.updateCustomerDebt).mockResolvedValue({
        id: 1,
        currentDebt: 0
      });

      await creditServices.addPayment({
        creditSaleId: 1,
        amount: 500, // Tam ödeme
        paymentMethod: 'cash' as const
      });

      expect(mockObjectStore.put).toHaveBeenCalledWith(
        expect.objectContaining({
          remainingAmount: 0,
          status: 'paid'
        })
      );
    });

    it('fazla ödeme engellemeli', async () => {
      mockObjectStore.get.mockResolvedValue(mockCreditSale);

      await expect(creditServices.addPayment({
        creditSaleId: 1,
        amount: 600, // Borçtan fazla
        paymentMethod: 'cash' as const
      })).rejects.toThrow('Ödeme tutarı borç tutarından fazla');
    });

    it('ödenmemiş veresiye bulunamazsa hata fırlatmalı', async () => {
      mockObjectStore.get.mockResolvedValue(null);

      await expect(creditServices.addPayment({
        creditSaleId: 999,
        amount: 100,
        paymentMethod: 'cash' as const
      })).rejects.toThrow('Veresiye kaydı bulunamadı');
    });

    it('zaten ödenmiş veresiyeye ödeme yapılamaz', async () => {
      const paidCredit = {
        ...mockCreditSale,
        remainingAmount: 0,
        status: 'paid' as const
      };

      mockObjectStore.get.mockResolvedValue(paidCredit);

      await expect(creditServices.addPayment({
        creditSaleId: 1,
        amount: 100,
        paymentMethod: 'cash' as const
      })).rejects.toThrow('Bu veresiye zaten ödenmiş');
    });
  });

  describe('getCreditSales', () => {
    it('tüm veresiye satışlarını getirmeli', async () => {
      const creditSales = [
        mockCreditSale,
        { ...mockCreditSale, id: 2, customerId: 2 }
      ];

      mockObjectStore.getAll.mockResolvedValue(creditSales);

      const result = await creditServices.getCreditSales();

      expect(result).toEqual(creditSales);
      expect(mockObjectStore.getAll).toHaveBeenCalled();
    });

    it('müşteriye göre filtrelemeli', async () => {
      const creditSales = [
        { ...mockCreditSale, customerId: 1 },
        { ...mockCreditSale, id: 2, customerId: 2 },
        { ...mockCreditSale, id: 3, customerId: 1 }
      ];

      mockIndex.getAll.mockResolvedValue(
        creditSales.filter(c => c.customerId === 1)
      );

      const result = await creditServices.getCreditSalesByCustomer(1);

      expect(result).toHaveLength(2);
      expect(result.every(c => c.customerId === 1)).toBe(true);
    });

    it('ödenmemiş veresiye satışlarını getirmeli', async () => {
      const creditSales = [
        { ...mockCreditSale, status: 'pending' },
        { ...mockCreditSale, id: 2, status: 'paid' },
        { ...mockCreditSale, id: 3, status: 'pending' }
      ];

      mockObjectStore.getAll.mockResolvedValue(creditSales);

      const result = await creditServices.getPendingCreditSales();

      expect(result).toHaveLength(2);
      expect(result.every(c => c.status === 'pending')).toBe(true);
    });

    it('vadesi geçmiş veresiye satışlarını getirmeli', async () => {
      const today = new Date();
      const pastDate = new Date(today.setDate(today.getDate() - 5));
      const futureDate = new Date(today.setDate(today.getDate() + 5));

      const creditSales = [
        { ...mockCreditSale, dueDate: pastDate.toISOString(), status: 'pending' },
        { ...mockCreditSale, id: 2, dueDate: futureDate.toISOString(), status: 'pending' },
        { ...mockCreditSale, id: 3, dueDate: pastDate.toISOString(), status: 'paid' }
      ];

      mockObjectStore.getAll.mockResolvedValue(creditSales);

      const result = await creditServices.getOverdueCreditSales();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });
  });

  describe('getPaymentHistory', () => {
    it('veresiye ödeme geçmişini getirmeli', async () => {
      const payments = [
        mockPayment,
        { ...mockPayment, id: 2, amount: 100 },
        { ...mockPayment, id: 3, amount: 200 }
      ];

      mockIndex.getAll.mockResolvedValue(payments);

      const result = await creditServices.getPaymentHistory(1);

      expect(result).toEqual(payments);
      expect(result).toHaveLength(3);
    });

    it('müşterinin tüm ödemelerini getirmeli', async () => {
      const payments = [
        { ...mockPayment, customerId: 1, creditSaleId: 1 },
        { ...mockPayment, id: 2, customerId: 1, creditSaleId: 2 },
        { ...mockPayment, id: 3, customerId: 2, creditSaleId: 3 }
      ];

      mockIndex.getAll.mockResolvedValue(
        payments.filter(p => p.customerId === 1)
      );

      const result = await creditServices.getCustomerPayments(1);

      expect(result).toHaveLength(2);
      expect(result.every(p => p.customerId === 1)).toBe(true);
    });

    it('tarih aralığına göre ödemeleri filtrelemeli', async () => {
      const payments = [
        { ...mockPayment, paymentDate: '2025-01-01T10:00:00Z' },
        { ...mockPayment, id: 2, paymentDate: '2025-01-05T10:00:00Z' },
        { ...mockPayment, id: 3, paymentDate: '2025-01-10T10:00:00Z' }
      ];

      mockObjectStore.getAll.mockResolvedValue(payments);

      const result = await creditServices.getPaymentsByDateRange(
        new Date('2025-01-02'),
        new Date('2025-01-08')
      );

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
    });
  });

  describe('calculateCreditSummary', () => {
    it('müşteri veresiye özetini hesaplamalı', async () => {
      const creditSales = [
        { ...mockCreditSale, amount: 500, remainingAmount: 300 },
        { ...mockCreditSale, id: 2, amount: 300, remainingAmount: 0, status: 'paid' },
        { ...mockCreditSale, id: 3, amount: 200, remainingAmount: 200 }
      ];

      mockIndex.getAll.mockResolvedValue(creditSales);

      const summary = await creditServices.getCustomerCreditSummary(1);

      expect(summary).toMatchObject({
        customerId: 1,
        totalCredit: 1000, // 500 + 300 + 200
        totalPaid: 500, // (500-300) + 300 + 0
        totalRemaining: 500, // 300 + 0 + 200
        creditCount: 3,
        paidCount: 1,
        pendingCount: 2
      });
    });

    it('genel veresiye özetini hesaplamalı', async () => {
      const creditSales = [
        { ...mockCreditSale, amount: 1000, remainingAmount: 600 },
        { ...mockCreditSale, id: 2, amount: 500, remainingAmount: 0, status: 'paid' },
        { ...mockCreditSale, id: 3, amount: 800, remainingAmount: 800 }
      ];

      mockObjectStore.getAll.mockResolvedValue(creditSales);

      const summary = await creditServices.getTotalCreditSummary();

      expect(summary).toMatchObject({
        totalCredit: 2300,
        totalPaid: 900,
        totalRemaining: 1400,
        totalCustomers: expect.any(Number),
        overdueAmount: expect.any(Number),
        averageCredit: expect.any(Number)
      });
    });
  });

  describe('cancelCreditSale', () => {
    it('veresiye satışını iptal etmeli', async () => {
      mockObjectStore.get.mockResolvedValue(mockCreditSale);
      mockObjectStore.put.mockResolvedValue(1);

      vi.mocked(customerDB.updateCustomerDebt).mockResolvedValue({
        id: 1,
        currentDebt: 0
      });

      vi.mocked(salesDB.updateSale).mockResolvedValue({
        id: 1,
        status: 'cancelled'
      });

      const result = await creditServices.cancelCreditSale(1, 'Müşteri iptali');

      expect(result).toMatchObject({
        id: 1,
        status: 'cancelled',
        cancelledAt: expect.any(String),
        cancelReason: 'Müşteri iptali'
      });

      // Müşteri borcu düşürülmeli
      expect(customerDB.updateCustomerDebt).toHaveBeenCalledWith(1, -500);

      // Satış iptal edilmeli
      expect(salesDB.updateSale).toHaveBeenCalledWith(1, {
        status: 'cancelled',
        cancelReason: 'Müşteri iptali'
      });
    });

    it('kısmi ödenmiş veresiyeyi iptal ederken sadece kalan tutarı düşürmeli', async () => {
      const partiallyPaid = {
        ...mockCreditSale,
        amount: 500,
        remainingAmount: 300 // 200 ödenmiş
      };

      mockObjectStore.get.mockResolvedValue(partiallyPaid);
      mockObjectStore.put.mockResolvedValue(1);

      vi.mocked(customerDB.updateCustomerDebt).mockResolvedValue({
        id: 1,
        currentDebt: 200
      });

      await creditServices.cancelCreditSale(1, 'İptal');

      // Sadece kalan borç düşürülmeli
      expect(customerDB.updateCustomerDebt).toHaveBeenCalledWith(1, -300);
    });

    it('tamamen ödenmiş veresiye iptal edilemez', async () => {
      const paidCredit = {
        ...mockCreditSale,
        remainingAmount: 0,
        status: 'paid' as const
      };

      mockObjectStore.get.mockResolvedValue(paidCredit);

      await expect(creditServices.cancelCreditSale(1, 'İptal'))
        .rejects.toThrow('Ödenmiş veresiye iptal edilemez');
    });

    it('zaten iptal edilmiş veresiye tekrar iptal edilemez', async () => {
      const cancelledCredit = {
        ...mockCreditSale,
        status: 'cancelled' as const
      };

      mockObjectStore.get.mockResolvedValue(cancelledCredit);

      await expect(creditServices.cancelCreditSale(1, 'İptal'))
        .rejects.toThrow('Bu veresiye zaten iptal edilmiş');
    });
  });

  describe('updateDueDate', () => {
    it('vade tarihini güncellemeli', async () => {
      mockObjectStore.get.mockResolvedValue(mockCreditSale);
      mockObjectStore.put.mockResolvedValue(1);

      const newDueDate = '2025-03-01';
      const result = await creditServices.updateDueDate(1, newDueDate);

      expect(result).toMatchObject({
        id: 1,
        dueDate: newDueDate,
        updatedAt: expect.any(String)
      });

      expect(mockObjectStore.put).toHaveBeenCalledWith(
        expect.objectContaining({
          dueDate: newDueDate
        })
      );
    });

    it('geçmiş tarihe güncelleme engellemeli', async () => {
      mockObjectStore.get.mockResolvedValue(mockCreditSale);

      await expect(creditServices.updateDueDate(1, '2024-01-01'))
        .rejects.toThrow('Vade tarihi geçmişte olamaz');
    });

    it('ödenmiş veresiye vadesi değiştirilemez', async () => {
      const paidCredit = {
        ...mockCreditSale,
        status: 'paid' as const
      };

      mockObjectStore.get.mockResolvedValue(paidCredit);

      await expect(creditServices.updateDueDate(1, '2025-03-01'))
        .rejects.toThrow('Ödenmiş veresiye vadesi değiştirilemez');
    });
  });

  describe('addDiscount', () => {
    it('veresiye indirimi uygulamalı', async () => {
      mockObjectStore.get.mockResolvedValue(mockCreditSale);
      mockObjectStore.put.mockResolvedValue(1);
      mockObjectStore.add.mockResolvedValue(1);

      vi.mocked(customerDB.updateCustomerDebt).mockResolvedValue({
        id: 1,
        currentDebt: 450
      });

      const result = await creditServices.addDiscount(1, {
        amount: 50,
        reason: 'İyi müşteri indirimi'
      });

      expect(result).toMatchObject({
        originalAmount: 500,
        discountAmount: 50,
        remainingAmount: 450
      });

      // Müşteri borcu azaltılmalı
      expect(customerDB.updateCustomerDebt).toHaveBeenCalledWith(1, -50);
    });

    it('indirim kalan borçtan fazla olamaz', async () => {
      mockObjectStore.get.mockResolvedValue(mockCreditSale);

      await expect(creditServices.addDiscount(1, {
        amount: 600,
        reason: 'Test'
      })).rejects.toThrow('İndirim tutarı borç tutarından fazla');
    });
  });

  describe('getAgingReport', () => {
    it('yaşlandırma raporunu hesaplamalı', async () => {
      const today = new Date();
      const creditSales = [
        { // 0-30 gün
          ...mockCreditSale,
          dueDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          remainingAmount: 1000
        },
        { // 31-60 gün
          ...mockCreditSale,
          id: 2,
          dueDate: new Date(today.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString(),
          remainingAmount: 500
        },
        { // 61-90 gün
          ...mockCreditSale,
          id: 3,
          dueDate: new Date(today.getTime() - 70 * 24 * 60 * 60 * 1000).toISOString(),
          remainingAmount: 300
        },
        { // 90+ gün
          ...mockCreditSale,
          id: 4,
          dueDate: new Date(today.getTime() - 100 * 24 * 60 * 60 * 1000).toISOString(),
          remainingAmount: 200
        }
      ];

      mockObjectStore.getAll.mockResolvedValue(creditSales);

      const report = await creditServices.getAgingReport();

      expect(report).toMatchObject({
        current: { count: 1, amount: 1000 },
        days30: { count: 1, amount: 500 },
        days60: { count: 1, amount: 300 },
        days90Plus: { count: 1, amount: 200 },
        total: 2000
      });
    });
  });

  describe('exportCreditData', () => {
    it('veresiye verilerini CSV formatında export etmeli', async () => {
      const creditSales = [
        mockCreditSale,
        { ...mockCreditSale, id: 2, customerId: 2, amount: 300 }
      ];

      mockObjectStore.getAll.mockResolvedValue(creditSales);

      const csv = await creditServices.exportCreditData('csv');

      expect(csv).toContain('Customer,Amount,Remaining,Status,DueDate');
      expect(csv).toContain('Test Müşteri,500,500,pending');
    });

    it('veresiye verilerini JSON formatında export etmeli', async () => {
      const creditSales = [mockCreditSale];
      mockObjectStore.getAll.mockResolvedValue(creditSales);

      const json = await creditServices.exportCreditData('json');

      const parsed = JSON.parse(json);
      expect(parsed).toHaveLength(1);
      expect(parsed[0]).toMatchObject(mockCreditSale);
    });
  });

  describe('sendPaymentReminder', () => {
    it('ödeme hatırlatması oluşturmalı', async () => {
      mockObjectStore.get.mockResolvedValue(mockCreditSale);
      mockObjectStore.add.mockResolvedValue(1);

      const result = await creditServices.sendPaymentReminder(1, {
        method: 'sms',
        message: 'Borcunuzun vadesi yaklaşıyor'
      });

      expect(result).toMatchObject({
        creditSaleId: 1,
        customerId: 1,
        reminderType: 'sms',
        message: expect.stringContaining('vadesi yaklaşıyor'),
        sentAt: expect.any(String),
        status: 'sent'
      });

      expect(mockObjectStore.add).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'payment_reminder'
        })
      );
    });
  });

  describe('calculateInterest', () => {
    it('gecikme faizi hesaplamalı', async () => {
      const overdueDate = new Date();
      overdueDate.setDate(overdueDate.getDate() - 30); // 30 gün gecikmiş

      const overdueCredit = {
        ...mockCreditSale,
        dueDate: overdueDate.toISOString(),
        remainingAmount: 1000
      };

      mockObjectStore.get.mockResolvedValue(overdueCredit);

      const result = await creditServices.calculateInterest(1, {
        dailyRate: 0.001 // Günlük %0.1
      });

      expect(result).toMatchObject({
        principal: 1000,
        days: 30,
        rate: 0.001,
        interest: 30, // 1000 * 0.001 * 30
        totalAmount: 1030
      });
    });

    it('vadesi geçmemiş veresiyeye faiz hesaplanamaz', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);

      const notOverdue = {
        ...mockCreditSale,
        dueDate: futureDate.toISOString()
      };

      mockObjectStore.get.mockResolvedValue(notOverdue);

      await expect(creditServices.calculateInterest(1, { dailyRate: 0.001 }))
        .rejects.toThrow('Vadesi geçmemiş veresiyeye faiz hesaplanamaz');
    });
  });
});
