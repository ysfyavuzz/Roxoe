/**
 * useCustomers Hook Unit Tests
 * Müşteri yönetimi hook'u için kapsamlı test senaryoları
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCustomers } from '../useCustomers';
import * as customerDB from '../../services/customerDB';
import * as creditServices from '../../services/creditServices';
import { toast } from 'react-hot-toast';

// Mock dependencies
vi.mock('../../services/customerDB');
vi.mock('../../services/creditServices');
vi.mock('react-hot-toast');

describe('useCustomers Hook', () => {
  const mockCustomers = [
    {
      id: 1,
      name: 'Ali Veli',
      phone: '5551234567',
      email: 'ali@test.com',
      address: 'Test Adres 1',
      creditLimit: 1000,
      currentDebt: 500,
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 2,
      name: 'Ayşe Fatma',
      phone: '5559876543',
      email: 'ayse@test.com',
      address: 'Test Adres 2',
      creditLimit: 2000,
      currentDebt: 0,
      isActive: true,
      createdAt: '2024-01-02',
      updatedAt: '2024-01-02'
    },
    {
      id: 3,
      name: 'Mehmet Yılmaz',
      phone: '5555555555',
      email: 'mehmet@test.com',
      address: 'Test Adres 3',
      creditLimit: 500,
      currentDebt: 600, // Limit aşımı
      isActive: true,
      createdAt: '2024-01-03',
      updatedAt: '2024-01-03'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(customerDB.getCustomers).mockResolvedValue(mockCustomers);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization and loading', () => {
    it('başlangıçta müşterileri yüklemeli', async () => {
      const { result } = renderHook(() => useCustomers());

      expect(result.current.loading).toBe(true);
      expect(result.current.customers).toEqual([]);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.customers).toEqual(mockCustomers);
      });

      expect(customerDB.getCustomers).toHaveBeenCalled();
    });

    it('yükleme hatası durumunu yönetmeli', async () => {
      const error = new Error('Veritabanı hatası');
      vi.mocked(customerDB.getCustomers).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useCustomers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(error.message);
        expect(result.current.customers).toEqual([]);
      });

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Müşteriler yüklenirken hata')
      );
    });
  });

  describe('addCustomer', () => {
    it('yeni müşteri eklemeli', async () => {
      const { result } = renderHook(() => useCustomers());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const newCustomer = {
        name: 'Yeni Müşteri',
        phone: '5556667788',
        email: 'yeni@test.com',
        creditLimit: 1500
      };

      const addedCustomer = { ...newCustomer, id: 4 };
      vi.mocked(customerDB.addCustomer).mockResolvedValueOnce(addedCustomer);

      await act(async () => {
        await result.current.addCustomer(newCustomer);
      });

      expect(customerDB.addCustomer).toHaveBeenCalledWith(newCustomer);
      expect(result.current.customers).toContainEqual(addedCustomer);
      expect(toast.success).toHaveBeenCalledWith('Müşteri başarıyla eklendi');
    });

    it('telefon numarası zaten kayıtlı hatası göstermeli', async () => {
      const { result } = renderHook(() => useCustomers());

      await waitFor(() => expect(result.current.loading).toBe(false));

      vi.mocked(customerDB.addCustomer).mockRejectedValueOnce(
        new Error('Bu telefon numarası zaten kayıtlı')
      );

      await act(async () => {
        const success = await result.current.addCustomer({
          name: 'Test',
          phone: '5551234567', // Mevcut numara
          creditLimit: 1000
        });
        expect(success).toBe(false);
      });

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Bu telefon numarası zaten kayıtlı')
      );
    });
  });

  describe('updateCustomer', () => {
    it('müşteri bilgilerini güncellemeli', async () => {
      const { result } = renderHook(() => useCustomers());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const updates = {
        name: 'Güncellenmiş İsim',
        creditLimit: 1500
      };

      const updatedCustomer = { ...mockCustomers[0], ...updates };
      vi.mocked(customerDB.updateCustomer).mockResolvedValueOnce(updatedCustomer);

      await act(async () => {
        await result.current.updateCustomer(1, updates);
      });

      expect(customerDB.updateCustomer).toHaveBeenCalledWith(1, updates);
      expect(result.current.customers[0]).toEqual(updatedCustomer);
      expect(toast.success).toHaveBeenCalledWith('Müşteri güncellendi');
    });

    it('kredi limiti değişikliği uyarısı göstermeli', async () => {
      const { result } = renderHook(() => useCustomers());

      await waitFor(() => expect(result.current.loading).toBe(false));

      // Borcu olan müşterinin limitini düşürme
      const updates = { creditLimit: 400 }; // Mevcut borç: 500

      const updatedCustomer = { ...mockCustomers[0], ...updates };
      vi.mocked(customerDB.updateCustomer).mockResolvedValueOnce(updatedCustomer);

      await act(async () => {
        await result.current.updateCustomer(1, updates);
      });

      expect(toast.warning).toHaveBeenCalledWith(
        expect.stringContaining('Kredi limiti borçtan düşük')
      );
    });
  });

  describe('deleteCustomer', () => {
    it('müşteriyi silmeli', async () => {
      const { result } = renderHook(() => useCustomers());

      await waitFor(() => expect(result.current.loading).toBe(false));

      vi.mocked(customerDB.deleteCustomer).mockResolvedValueOnce();

      await act(async () => {
        await result.current.deleteCustomer(2); // Borcu olmayan müşteri
      });

      expect(customerDB.deleteCustomer).toHaveBeenCalledWith(2);
      expect(result.current.customers).not.toContainEqual(
        expect.objectContaining({ id: 2 })
      );
      expect(toast.success).toHaveBeenCalledWith('Müşteri silindi');
    });

    it('borcu olan müşteriyi soft delete yapmalı', async () => {
      const { result } = renderHook(() => useCustomers());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      vi.mocked(customerDB.deleteCustomer).mockResolvedValueOnce();

      await act(async () => {
        await result.current.deleteCustomer(1); // Borcu olan müşteri
      });

      expect(confirmSpy).toHaveBeenCalledWith(
        expect.stringContaining('Bu müşterinin 500 TL borcu var')
      );
      expect(customerDB.deleteCustomer).toHaveBeenCalledWith(1, true); // Soft delete

      confirmSpy.mockRestore();
    });

    it('silme işlemini iptal edebilmeli', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
      
      const { result } = renderHook(() => useCustomers());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.deleteCustomer(1);
      });

      expect(customerDB.deleteCustomer).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
    });
  });

  describe('searchCustomers', () => {
    it('isme göre arama yapmalı', async () => {
      const { result } = renderHook(() => useCustomers());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.searchCustomers('Ali');
      });

      expect(result.current.filteredCustomers).toHaveLength(1);
      expect(result.current.filteredCustomers[0].name).toContain('Ali');
    });

    it('telefona göre arama yapmalı', async () => {
      const { result } = renderHook(() => useCustomers());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.searchCustomers('555123');
      });

      expect(result.current.filteredCustomers).toHaveLength(1);
      expect(result.current.filteredCustomers[0].phone).toContain('555123');
    });

    it('boş arama tüm müşterileri göstermeli', async () => {
      const { result } = renderHook(() => useCustomers());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.searchCustomers('');
      });

      expect(result.current.filteredCustomers).toEqual(mockCustomers);
    });
  });

  describe('getDebtorCustomers', () => {
    it('borçlu müşterileri getirmeli', async () => {
      const { result } = renderHook(() => useCustomers());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const debtors = result.current.getDebtorCustomers();

      expect(debtors).toHaveLength(2); // Ali ve Mehmet
      expect(debtors.every(c => c.currentDebt > 0)).toBe(true);
    });
  });

  describe('getOverLimitCustomers', () => {
    it('limit aşan müşterileri getirmeli', async () => {
      const { result } = renderHook(() => useCustomers());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const overLimit = result.current.getOverLimitCustomers();

      expect(overLimit).toHaveLength(1); // Sadece Mehmet
      expect(overLimit[0].id).toBe(3);
      expect(overLimit[0].currentDebt).toBeGreaterThan(overLimit[0].creditLimit);
    });
  });

  describe('updateCustomerDebt', () => {
    it('müşteri borcunu güncellemeli', async () => {
      const { result } = renderHook(() => useCustomers());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const updatedCustomer = { ...mockCustomers[0], currentDebt: 700 };
      vi.mocked(customerDB.updateCustomerDebt).mockResolvedValueOnce(updatedCustomer);

      await act(async () => {
        await result.current.updateCustomerDebt(1, 200); // 200 TL borç ekle
      });

      expect(customerDB.updateCustomerDebt).toHaveBeenCalledWith(1, 200);
      expect(result.current.customers[0].currentDebt).toBe(700);
    });

    it('borç ödeme işlemi yapmalı', async () => {
      const { result } = renderHook(() => useCustomers());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const updatedCustomer = { ...mockCustomers[0], currentDebt: 300 };
      vi.mocked(customerDB.updateCustomerDebt).mockResolvedValueOnce(updatedCustomer);

      await act(async () => {
        await result.current.makePayment(1, 200); // 200 TL ödeme
      });

      expect(customerDB.updateCustomerDebt).toHaveBeenCalledWith(1, -200);
      expect(result.current.customers[0].currentDebt).toBe(300);
      expect(toast.success).toHaveBeenCalledWith('Ödeme kaydedildi');
    });

    it('fazla ödeme uyarısı vermeli', async () => {
      const { result } = renderHook(() => useCustomers());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const updatedCustomer = { ...mockCustomers[0], currentDebt: 0 };
      vi.mocked(customerDB.updateCustomerDebt).mockResolvedValueOnce(updatedCustomer);

      await act(async () => {
        await result.current.makePayment(1, 600); // 500 borç, 600 ödeme
      });

      expect(toast.info).toHaveBeenCalledWith('Fazla ödeme: 100 TL');
    });
  });

  describe('getCustomerTransactions', () => {
    it('müşteri işlem geçmişini getirmeli', async () => {
      const { result } = renderHook(() => useCustomers());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const mockTransactions = [
        { id: 1, customerId: 1, type: 'sale', amount: 500, date: '2025-01-01' },
        { id: 2, customerId: 1, type: 'payment', amount: -200, date: '2025-01-02' }
      ];

      vi.mocked(customerDB.getCustomerTransactions).mockResolvedValueOnce(mockTransactions);

      await act(async () => {
        const transactions = await result.current.getCustomerTransactions(1);
        expect(transactions).toEqual(mockTransactions);
      });

      expect(customerDB.getCustomerTransactions).toHaveBeenCalledWith(1);
    });
  });

  describe('getCustomerStatistics', () => {
    it('müşteri istatistiklerini hesaplamalı', async () => {
      const { result } = renderHook(() => useCustomers());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const mockStats = {
        totalPurchases: 5000,
        totalPayments: 4500,
        currentDebt: 500,
        transactionCount: 25,
        averagePurchase: 200,
        lastTransactionDate: '2025-01-15',
        customerSince: '2024-01-01',
        creditUtilization: 50
      };

      vi.mocked(customerDB.getCustomerStatistics).mockResolvedValueOnce(mockStats);

      await act(async () => {
        const stats = await result.current.getCustomerStatistics(1);
        expect(stats).toEqual(mockStats);
      });
    });
  });

  describe('getCustomerCreditInfo', () => {
    it('müşteri kredi bilgilerini getirmeli', async () => {
      const { result } = renderHook(() => useCustomers());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const mockCreditInfo = {
        customerId: 1,
        totalCredit: 2000,
        totalPaid: 1500,
        totalRemaining: 500,
        creditCount: 5,
        paidCount: 3,
        pendingCount: 2
      };

      vi.mocked(creditServices.getCustomerCreditSummary).mockResolvedValueOnce(mockCreditInfo);

      await act(async () => {
        const creditInfo = await result.current.getCustomerCreditInfo(1);
        expect(creditInfo).toEqual(mockCreditInfo);
      });
    });
  });

  describe('importCustomers', () => {
    it('CSV dosyasından müşteri import etmeli', async () => {
      const { result } = renderHook(() => useCustomers());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const csvData = 'name,phone,creditLimit\nTest Müşteri,5551112233,1000';
      const importResult = {
        success: 1,
        failed: 0,
        errors: []
      };

      vi.mocked(customerDB.importCustomers).mockResolvedValueOnce(importResult);

      await act(async () => {
        const result = await result.current.importCustomers(csvData, 'csv');
        expect(result).toEqual(importResult);
      });

      expect(customerDB.importCustomers).toHaveBeenCalledWith(csvData, 'csv');
      expect(toast.success).toHaveBeenCalledWith('1 müşteri başarıyla içe aktarıldı');
    });

    it('import hatalarını göstermeli', async () => {
      const { result } = renderHook(() => useCustomers());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const importResult = {
        success: 1,
        failed: 2,
        errors: [
          { row: 1, error: 'Geçersiz telefon' },
          { row: 2, error: 'Telefon zaten kayıtlı' }
        ]
      };

      vi.mocked(customerDB.importCustomers).mockResolvedValueOnce(importResult);

      await act(async () => {
        await result.current.importCustomers('data', 'csv');
      });

      expect(toast.error).toHaveBeenCalledWith('2 müşteri içe aktarılamadı');
      importResult.errors.forEach(err => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining(err.error)
        );
      });
    });
  });

  describe('exportCustomers', () => {
    it('müşterileri CSV olarak export etmeli', async () => {
      const { result } = renderHook(() => useCustomers());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const csvData = 'id,name,phone,creditLimit\n1,Ali Veli,5551234567,1000';
      vi.mocked(customerDB.exportCustomers).mockResolvedValueOnce(csvData);

      await act(async () => {
        const data = await result.current.exportCustomers('csv');
        expect(data).toBe(csvData);
      });

      expect(customerDB.exportCustomers).toHaveBeenCalledWith('csv');
    });

    it('export sonrası dosya indirmeli', async () => {
      const { result } = renderHook(() => useCustomers());

      await waitFor(() => expect(result.current.loading).toBe(false));

      // Mock download
      const createElementSpy = vi.spyOn(document, 'createElement');
      const linkElement = {
        href: '',
        download: '',
        click: vi.fn()
      };
      createElementSpy.mockReturnValueOnce(linkElement as any);

      const csvData = 'data';
      vi.mocked(customerDB.exportCustomers).mockResolvedValueOnce(csvData);

      await act(async () => {
        await result.current.downloadCustomers('csv');
      });

      expect(linkElement.download).toContain('customers');
      expect(linkElement.download).toContain('.csv');
      expect(linkElement.click).toHaveBeenCalled();

      createElementSpy.mockRestore();
    });
  });

  describe('sorting', () => {
    it('isme göre sıralama yapmalı', async () => {
      const { result } = renderHook(() => useCustomers());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.sortCustomers('name', 'asc');
      });

      expect(result.current.filteredCustomers[0].name).toBe('Ali Veli');
      expect(result.current.filteredCustomers[1].name).toBe('Ayşe Fatma');
      expect(result.current.filteredCustomers[2].name).toBe('Mehmet Yılmaz');

      act(() => {
        result.current.sortCustomers('name', 'desc');
      });

      expect(result.current.filteredCustomers[0].name).toBe('Mehmet Yılmaz');
    });

    it('borca göre sıralama yapmalı', async () => {
      const { result } = renderHook(() => useCustomers());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.sortCustomers('debt', 'desc');
      });

      expect(result.current.filteredCustomers[0].currentDebt).toBe(600);
      expect(result.current.filteredCustomers[1].currentDebt).toBe(500);
      expect(result.current.filteredCustomers[2].currentDebt).toBe(0);
    });

    it('kredi limitine göre sıralama yapmalı', async () => {
      const { result } = renderHook(() => useCustomers());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.sortCustomers('creditLimit', 'desc');
      });

      expect(result.current.filteredCustomers[0].creditLimit).toBe(2000);
      expect(result.current.filteredCustomers[1].creditLimit).toBe(1000);
      expect(result.current.filteredCustomers[2].creditLimit).toBe(500);
    });
  });

  describe('statistics', () => {
    it('müşteri istatistiklerini hesaplamalı', async () => {
      const { result } = renderHook(() => useCustomers());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const stats = result.current.getStatistics();

      expect(stats).toMatchObject({
        totalCustomers: 3,
        activeCustomers: 3,
        totalDebt: 1100, // 500 + 0 + 600
        totalCreditLimit: 3500, // 1000 + 2000 + 500
        creditUtilization: expect.any(Number),
        debtorCount: 2,
        overLimitCount: 1,
        averageDebt: expect.any(Number),
        averageCreditLimit: expect.any(Number)
      });
    });
  });

  describe('filters', () => {
    it('aktif müşterileri filtrelemeli', async () => {
      const { result } = renderHook(() => useCustomers());

      const customersWithInactive = [
        ...mockCustomers,
        { ...mockCustomers[0], id: 4, isActive: false }
      ];

      vi.mocked(customerDB.getCustomers).mockResolvedValue(customersWithInactive);

      await act(async () => {
        await result.current.refresh();
      });

      act(() => {
        result.current.filterActiveCustomers();
      });

      expect(result.current.filteredCustomers).toHaveLength(3);
      expect(result.current.filteredCustomers.every(c => c.isActive)).toBe(true);
    });

    it('borçlu müşterileri filtrelemeli', async () => {
      const { result } = renderHook(() => useCustomers());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.filterDebtorCustomers();
      });

      expect(result.current.filteredCustomers).toHaveLength(2);
      expect(result.current.filteredCustomers.every(c => c.currentDebt > 0)).toBe(true);
    });

    it('limit aşan müşterileri filtrelemeli', async () => {
      const { result } = renderHook(() => useCustomers());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.filterOverLimitCustomers();
      });

      expect(result.current.filteredCustomers).toHaveLength(1);
      expect(result.current.filteredCustomers[0].id).toBe(3);
    });

    it('filtreleri temizlemeli', async () => {
      const { result } = renderHook(() => useCustomers());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.filterDebtorCustomers();
      });

      expect(result.current.filteredCustomers).toHaveLength(2);

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.filteredCustomers).toEqual(mockCustomers);
    });
  });

  describe('refresh', () => {
    it('müşteri listesini yenilemeli', async () => {
      const { result } = renderHook(() => useCustomers());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const newCustomers = [
        { ...mockCustomers[0], name: 'Yenilenmiş Müşteri' }
      ];
      vi.mocked(customerDB.getCustomers).mockResolvedValueOnce(newCustomers);

      await act(async () => {
        await result.current.refresh();
      });

      expect(customerDB.getCustomers).toHaveBeenCalledTimes(2);
      expect(result.current.customers).toEqual(newCustomers);
    });
  });
});
