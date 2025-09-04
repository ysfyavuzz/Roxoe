/**
 * useSales Hook Unit Tests
 * Satış yönetimi hook'u için kapsamlı test senaryoları
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSales } from '../useSales';
import * as salesDB from '../../services/salesDB';
import * as productDB from '../../services/productDB';
import * as customerDB from '../../services/customerDB';
import * as cashRegisterDB from '../../services/cashRegisterDB';
import { toast } from 'react-hot-toast';

// Mock dependencies
vi.mock('../../services/salesDB');
vi.mock('../../services/productDB');
vi.mock('../../services/customerDB');
vi.mock('../../services/cashRegisterDB');
vi.mock('react-hot-toast');

describe('useSales Hook', () => {
  const mockSales = [
    {
      id: 1,
      date: '2025-01-20',
      time: '10:30:00',
      items: [
        { productId: 1, productName: 'Ürün 1', quantity: 2, price: 100, total: 200 },
        { productId: 2, productName: 'Ürün 2', quantity: 1, price: 50, total: 50 }
      ],
      subtotal: 250,
      tax: 45,
      discount: 10,
      total: 285,
      paymentMethod: 'cash',
      customerId: null,
      customerName: null,
      userId: 1,
      userName: 'Kasiyer 1',
      status: 'completed',
      receiptNo: 'FIS-2025-001'
    },
    {
      id: 2,
      date: '2025-01-20',
      time: '11:15:00',
      items: [
        { productId: 3, productName: 'Ürün 3', quantity: 3, price: 75, total: 225 }
      ],
      subtotal: 225,
      tax: 40.5,
      discount: 0,
      total: 265.5,
      paymentMethod: 'credit_card',
      customerId: 1,
      customerName: 'Ali Veli',
      userId: 1,
      userName: 'Kasiyer 1',
      status: 'completed',
      receiptNo: 'FIS-2025-002'
    },
    {
      id: 3,
      date: '2025-01-20',
      time: '12:00:00',
      items: [
        { productId: 1, productName: 'Ürün 1', quantity: 1, price: 100, total: 100 }
      ],
      subtotal: 100,
      tax: 18,
      discount: 5,
      total: 113,
      paymentMethod: 'credit',
      customerId: 2,
      customerName: 'Ayşe Fatma',
      userId: 2,
      userName: 'Kasiyer 2',
      status: 'pending',
      receiptNo: 'FIS-2025-003'
    }
  ];

  const mockProducts = [
    { id: 1, name: 'Ürün 1', barcode: '123456', price: 100, stock: 50, tax: 18 },
    { id: 2, name: 'Ürün 2', barcode: '234567', price: 50, stock: 30, tax: 18 },
    { id: 3, name: 'Ürün 3', barcode: '345678', price: 75, stock: 20, tax: 18 }
  ];

  const mockCustomers = [
    { id: 1, name: 'Ali Veli', phone: '5551234567', creditLimit: 1000, currentDebt: 500 },
    { id: 2, name: 'Ayşe Fatma', phone: '5559876543', creditLimit: 2000, currentDebt: 0 }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(salesDB.getSales).mockResolvedValue(mockSales);
    vi.mocked(productDB.getProducts).mockResolvedValue(mockProducts);
    vi.mocked(customerDB.getCustomers).mockResolvedValue(mockCustomers);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization and loading', () => {
    it('başlangıçta satışları yüklemeli', async () => {
      const { result } = renderHook(() => useSales());

      expect(result.current.loading).toBe(true);
      expect(result.current.sales).toEqual([]);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.sales).toEqual(mockSales);
      });

      expect(salesDB.getSales).toHaveBeenCalled();
    });

    it('yükleme hatası durumunu yönetmeli', async () => {
      const error = new Error('Veritabanı hatası');
      vi.mocked(salesDB.getSales).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useSales());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(error.message);
        expect(result.current.sales).toEqual([]);
      });

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Satışlar yüklenirken hata')
      );
    });
  });

  describe('createSale', () => {
    it('yeni satış oluşturmalı', async () => {
      const { result } = renderHook(() => useSales());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const newSale = {
        items: [
          { productId: 1, quantity: 2, price: 100 },
          { productId: 2, quantity: 1, price: 50 }
        ],
        paymentMethod: 'cash',
        discount: 10,
        userId: 1
      };

      const createdSale = {
        id: 4,
        ...newSale,
        date: '2025-01-20',
        time: '14:00:00',
        subtotal: 250,
        tax: 45,
        total: 285,
        status: 'completed',
        receiptNo: 'FIS-2025-004'
      };

      vi.mocked(salesDB.createSale).mockResolvedValueOnce(createdSale);
      vi.mocked(productDB.updateStock).mockResolvedValue();

      await act(async () => {
        const result = await result.current.createSale(newSale);
        expect(result).toEqual(createdSale);
      });

      expect(salesDB.createSale).toHaveBeenCalledWith(newSale);
      expect(productDB.updateStock).toHaveBeenCalledTimes(2);
      expect(toast.success).toHaveBeenCalledWith('Satış başarıyla tamamlandı');
    });

    it('stok yetersiz hatası vermeli', async () => {
      const { result } = renderHook(() => useSales());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const newSale = {
        items: [
          { productId: 3, quantity: 100, price: 75 } // Stok: 20
        ],
        paymentMethod: 'cash'
      };

      vi.mocked(productDB.getProduct).mockResolvedValueOnce(mockProducts[2]);

      await act(async () => {
        const result = await result.current.createSale(newSale);
        expect(result).toBeNull();
      });

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Stok yetersiz')
      );
    });

    it('veresiye satış oluşturmalı', async () => {
      const { result } = renderHook(() => useSales());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const creditSale = {
        items: [{ productId: 1, quantity: 1, price: 100 }],
        paymentMethod: 'credit',
        customerId: 2,
        userId: 1
      };

      const createdSale = {
        id: 5,
        ...creditSale,
        customerName: 'Ayşe Fatma',
        status: 'pending',
        total: 118
      };

      vi.mocked(salesDB.createSale).mockResolvedValueOnce(createdSale);
      vi.mocked(customerDB.updateCustomerDebt).mockResolvedValue();

      await act(async () => {
        await result.current.createSale(creditSale);
      });

      expect(customerDB.updateCustomerDebt).toHaveBeenCalledWith(2, 118);
      expect(toast.success).toHaveBeenCalledWith('Veresiye satış kaydedildi');
    });

    it('kredi limiti aşımı kontrolü yapmalı', async () => {
      const { result } = renderHook(() => useSales());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const creditSale = {
        items: [{ productId: 1, quantity: 10, price: 100 }],
        paymentMethod: 'credit',
        customerId: 1, // Limit: 1000, Mevcut: 500
        total: 1180 // 1000 + KDV
      };

      vi.mocked(customerDB.getCustomer).mockResolvedValueOnce(mockCustomers[0]);

      await act(async () => {
        const result = await result.current.createSale(creditSale);
        expect(result).toBeNull();
      });

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Kredi limiti aşılıyor')
      );
    });
  });

  describe('updateSale', () => {
    it('satışı güncellemeli', async () => {
      const { result } = renderHook(() => useSales());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const updates = {
        discount: 20,
        paymentMethod: 'credit_card'
      };

      const updatedSale = { ...mockSales[0], ...updates };
      vi.mocked(salesDB.updateSale).mockResolvedValueOnce(updatedSale);

      await act(async () => {
        await result.current.updateSale(1, updates);
      });

      expect(salesDB.updateSale).toHaveBeenCalledWith(1, updates);
      expect(result.current.sales[0]).toEqual(updatedSale);
      expect(toast.success).toHaveBeenCalledWith('Satış güncellendi');
    });

    it('tamamlanmış satışı güncelleyememeli', async () => {
      const { result } = renderHook(() => useSales());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      await act(async () => {
        await result.current.updateSale(1, { discount: 30 });
      });

      expect(confirmSpy).toHaveBeenCalledWith(
        expect.stringContaining('Tamamlanmış satışı değiştirmek istediğinize emin misiniz')
      );
      expect(salesDB.updateSale).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
    });
  });

  describe('cancelSale', () => {
    it('satışı iptal etmeli', async () => {
      const { result } = renderHook(() => useSales());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const reason = 'Müşteri vazgeçti';
      vi.mocked(salesDB.cancelSale).mockResolvedValueOnce();
      vi.mocked(productDB.updateStock).mockResolvedValue();

      await act(async () => {
        await result.current.cancelSale(1, reason);
      });

      expect(salesDB.cancelSale).toHaveBeenCalledWith(1, reason);
      // Stok geri eklenmeli
      expect(productDB.updateStock).toHaveBeenCalledWith(1, 2); // +2 adet
      expect(productDB.updateStock).toHaveBeenCalledWith(2, 1); // +1 adet
      expect(toast.success).toHaveBeenCalledWith('Satış iptal edildi');
    });

    it('veresiye satış iptali borcu güncellemeli', async () => {
      const { result } = renderHook(() => useSales());

      await waitFor(() => expect(result.current.loading).toBe(false));

      vi.mocked(salesDB.cancelSale).mockResolvedValueOnce();
      vi.mocked(customerDB.updateCustomerDebt).mockResolvedValue();

      await act(async () => {
        await result.current.cancelSale(3, 'Hatalı işlem');
      });

      expect(customerDB.updateCustomerDebt).toHaveBeenCalledWith(2, -113);
      expect(toast.success).toHaveBeenCalledWith('Satış iptal edildi ve borç güncellendi');
    });
  });

  describe('returnSale', () => {
    it('kısmi iade işlemi yapmalı', async () => {
      const { result } = renderHook(() => useSales());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const returnItems = [
        { productId: 1, quantity: 1, amount: 100 }
      ];

      const returnResult = {
        id: 1,
        saleId: 1,
        items: returnItems,
        totalRefund: 118,
        date: '2025-01-20'
      };

      vi.mocked(salesDB.returnSale).mockResolvedValueOnce(returnResult);
      vi.mocked(productDB.updateStock).mockResolvedValue();

      await act(async () => {
        const result = await result.current.returnSale(1, returnItems, 'Bozuk ürün');
        expect(result).toEqual(returnResult);
      });

      expect(salesDB.returnSale).toHaveBeenCalled();
      expect(productDB.updateStock).toHaveBeenCalledWith(1, 1);
      expect(toast.success).toHaveBeenCalledWith('İade işlemi tamamlandı');
    });

    it('tam iade işlemi yapmalı', async () => {
      const { result } = renderHook(() => useSales());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const returnItems = mockSales[0].items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        amount: item.total
      }));

      vi.mocked(salesDB.returnSale).mockResolvedValueOnce({
        totalRefund: mockSales[0].total
      });

      await act(async () => {
        await result.current.returnSale(1, returnItems);
      });

      expect(toast.success).toHaveBeenCalledWith('Satış tamamen iade edildi');
    });
  });

  describe('getSalesByDate', () => {
    it('tarih aralığına göre satışları getirmeli', async () => {
      const { result } = renderHook(() => useSales());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const startDate = '2025-01-20';
      const endDate = '2025-01-20';

      act(() => {
        const sales = result.current.getSalesByDate(startDate, endDate);
        expect(sales).toHaveLength(3);
      });
    });

    it('tek güne ait satışları getirmeli', async () => {
      const { result } = renderHook(() => useSales());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        const todaySales = result.current.getTodaySales();
        expect(todaySales).toHaveLength(3);
      });
    });
  });

  describe('getSalesByCustomer', () => {
    it('müşteriye ait satışları getirmeli', async () => {
      const { result } = renderHook(() => useSales());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const customerSales = result.current.getSalesByCustomer(1);
      
      expect(customerSales).toHaveLength(1);
      expect(customerSales[0].customerId).toBe(1);
    });

    it('veresiye satışları getirmeli', async () => {
      const { result } = renderHook(() => useSales());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const creditSales = result.current.getCreditSales();
      
      expect(creditSales).toHaveLength(1);
      expect(creditSales[0].paymentMethod).toBe('credit');
      expect(creditSales[0].status).toBe('pending');
    });
  });

  describe('getSalesByPaymentMethod', () => {
    it('ödeme yöntemine göre satışları filtrelemeli', async () => {
      const { result } = renderHook(() => useSales());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const cashSales = result.current.getSalesByPaymentMethod('cash');
      const cardSales = result.current.getSalesByPaymentMethod('credit_card');
      const creditSales = result.current.getSalesByPaymentMethod('credit');

      expect(cashSales).toHaveLength(1);
      expect(cardSales).toHaveLength(1);
      expect(creditSales).toHaveLength(1);
    });
  });

  describe('searchSales', () => {
    it('fiş numarasına göre arama yapmalı', async () => {
      const { result } = renderHook(() => useSales());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.searchSales('FIS-2025-001');
      });

      expect(result.current.filteredSales).toHaveLength(1);
      expect(result.current.filteredSales[0].receiptNo).toBe('FIS-2025-001');
    });

    it('müşteri adına göre arama yapmalı', async () => {
      const { result } = renderHook(() => useSales());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.searchSales('Ali');
      });

      expect(result.current.filteredSales).toHaveLength(1);
      expect(result.current.filteredSales[0].customerName).toContain('Ali');
    });

    it('ürün adına göre arama yapmalı', async () => {
      const { result } = renderHook(() => useSales());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.searchSales('Ürün 1');
      });

      expect(result.current.filteredSales).toHaveLength(2); // Ürün 1 iki satışta var
    });
  });

  describe('statistics', () => {
    it('günlük satış istatistiklerini hesaplamalı', async () => {
      const { result } = renderHook(() => useSales());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const stats = result.current.getDailyStatistics('2025-01-20');

      expect(stats).toMatchObject({
        date: '2025-01-20',
        totalSales: 3,
        totalRevenue: expect.any(Number),
        totalTax: expect.any(Number),
        totalDiscount: expect.any(Number),
        averageSale: expect.any(Number),
        cashSales: expect.any(Number),
        cardSales: expect.any(Number),
        creditSales: expect.any(Number)
      });
    });

    it('aylık satış istatistiklerini hesaplamalı', async () => {
      const { result } = renderHook(() => useSales());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const monthlyStats = result.current.getMonthlyStatistics('2025-01');

      expect(monthlyStats).toMatchObject({
        month: '2025-01',
        totalSales: 3,
        totalRevenue: expect.any(Number),
        dailyAverage: expect.any(Number),
        topProducts: expect.any(Array),
        topCustomers: expect.any(Array)
      });
    });

    it('en çok satan ürünleri getirmeli', async () => {
      const { result } = renderHook(() => useSales());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const topProducts = result.current.getTopProducts(2);

      expect(topProducts).toHaveLength(2);
      expect(topProducts[0].productId).toBe(1); // Ürün 1 iki satışta var
      expect(topProducts[0].totalQuantity).toBe(3); // 2 + 1
    });
  });

  describe('receipt generation', () => {
    it('fiş oluşturmalı', async () => {
      const { result } = renderHook(() => useSales());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const receipt = {
        saleId: 1,
        format: 'pdf',
        includeCompanyInfo: true
      };

      const receiptData = 'PDF_DATA_BASE64';
      vi.mocked(salesDB.generateReceipt).mockResolvedValueOnce(receiptData);

      await act(async () => {
        const result = await result.current.generateReceipt(receipt);
        expect(result).toBe(receiptData);
      });

      expect(salesDB.generateReceipt).toHaveBeenCalledWith(receipt);
    });

    it('fiş yazdırma işlemi başlatmalı', async () => {
      const { result } = renderHook(() => useSales());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const printSpy = vi.spyOn(window, 'print').mockImplementation();
      
      await act(async () => {
        await result.current.printReceipt(1);
      });

      expect(printSpy).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Fiş yazdırma kuyruğuna eklendi');

      printSpy.mockRestore();
    });
  });

  describe('export operations', () => {
    it('satışları Excel olarak export etmeli', async () => {
      const { result } = renderHook(() => useSales());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const excelData = 'EXCEL_DATA';
      vi.mocked(salesDB.exportSales).mockResolvedValueOnce(excelData);

      await act(async () => {
        const data = await result.current.exportSales('excel', '2025-01-20', '2025-01-20');
        expect(data).toBe(excelData);
      });

      expect(salesDB.exportSales).toHaveBeenCalledWith(
        'excel', 
        '2025-01-20', 
        '2025-01-20'
      );
    });

    it('Z raporu oluşturmalı', async () => {
      const { result } = renderHook(() => useSales());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const zReport = {
        date: '2025-01-20',
        totalSales: 3,
        totalRevenue: 663.5,
        cashTotal: 285,
        cardTotal: 265.5,
        creditTotal: 113,
        taxTotal: 103.5,
        discountTotal: 15,
        returns: 0
      };

      vi.mocked(cashRegisterDB.generateZReport).mockResolvedValueOnce(zReport);

      await act(async () => {
        const report = await result.current.generateZReport('2025-01-20');
        expect(report).toEqual(zReport);
      });

      expect(toast.success).toHaveBeenCalledWith('Z raporu oluşturuldu');
    });
  });

  describe('bulk operations', () => {
    it('toplu fiş yazdırma yapmalı', async () => {
      const { result } = renderHook(() => useSales());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const saleIds = [1, 2, 3];
      const printSpy = vi.spyOn(window, 'print').mockImplementation();

      await act(async () => {
        await result.current.bulkPrintReceipts(saleIds);
      });

      expect(printSpy).toHaveBeenCalledTimes(3);
      expect(toast.success).toHaveBeenCalledWith('3 fiş yazdırma kuyruğuna eklendi');

      printSpy.mockRestore();
    });

    it('toplu iptal işlemi yapmalı', async () => {
      const { result } = renderHook(() => useSales());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      vi.mocked(salesDB.cancelSale).mockResolvedValue();

      const saleIds = [1, 2];
      const reason = 'Sistem hatası';

      await act(async () => {
        await result.current.bulkCancelSales(saleIds, reason);
      });

      expect(confirmSpy).toHaveBeenCalledWith(
        expect.stringContaining('2 satışı iptal etmek istediğinize emin misiniz')
      );
      expect(salesDB.cancelSale).toHaveBeenCalledTimes(2);
      expect(toast.success).toHaveBeenCalledWith('2 satış iptal edildi');

      confirmSpy.mockRestore();
    });
  });

  describe('filters and sorting', () => {
    it('durum filtrelemesi yapmalı', async () => {
      const { result } = renderHook(() => useSales());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.filterByStatus('completed');
      });

      expect(result.current.filteredSales).toHaveLength(2);
      expect(result.current.filteredSales.every(s => s.status === 'completed')).toBe(true);

      act(() => {
        result.current.filterByStatus('pending');
      });

      expect(result.current.filteredSales).toHaveLength(1);
      expect(result.current.filteredSales[0].status).toBe('pending');
    });

    it('tutara göre sıralama yapmalı', async () => {
      const { result } = renderHook(() => useSales());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.sortSales('total', 'desc');
      });

      expect(result.current.filteredSales[0].total).toBe(285);
      expect(result.current.filteredSales[1].total).toBe(265.5);
      expect(result.current.filteredSales[2].total).toBe(113);

      act(() => {
        result.current.sortSales('total', 'asc');
      });

      expect(result.current.filteredSales[0].total).toBe(113);
    });

    it('tarihe göre sıralama yapmalı', async () => {
      const { result } = renderHook(() => useSales());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.sortSales('date', 'desc');
      });

      expect(result.current.filteredSales[0].time).toBe('12:00:00');
      expect(result.current.filteredSales[1].time).toBe('11:15:00');
      expect(result.current.filteredSales[2].time).toBe('10:30:00');
    });
  });

  describe('refresh', () => {
    it('satış listesini yenilemeli', async () => {
      const { result } = renderHook(() => useSales());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const newSales = [
        { ...mockSales[0], total: 300 }
      ];
      vi.mocked(salesDB.getSales).mockResolvedValueOnce(newSales);

      await act(async () => {
        await result.current.refresh();
      });

      expect(salesDB.getSales).toHaveBeenCalledTimes(2);
      expect(result.current.sales).toEqual(newSales);
      expect(toast.success).toHaveBeenCalledWith('Satış listesi güncellendi');
    });
  });
});
