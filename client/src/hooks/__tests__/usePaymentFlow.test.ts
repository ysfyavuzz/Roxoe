/**
 * usePaymentFlow Hook Unit Tests
 * Test coverage'ı artırmak için kritik hook testleri
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePaymentFlow } from '../usePaymentFlow';
import * as salesDB from '../../services/salesDB';
import * as cashRegisterDB from '../../services/cashRegisterDB';
import * as creditServices from '../../services/creditServices';
import * as productDB from '../../services/productDB';

// Mock modüller
vi.mock('../../services/salesDB');
vi.mock('../../services/cashRegisterDB');
vi.mock('../../services/creditServices');
vi.mock('../../services/productDB');

describe('usePaymentFlow Hook', () => {
  const mockSaleData = {
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

  const mockRegisterSession = {
    id: 1,
    openedAt: new Date().toISOString(),
    openingBalance: 1000,
    status: 'open' as const
  };

  beforeEach(() => {
    // Mock implementasyonları
    vi.mocked(salesDB.addSale).mockResolvedValue({
      id: 1,
      ...mockSaleData,
      createdAt: new Date().toISOString(),
      receiptNo: 'RCP-001'
    });
    
    vi.mocked(salesDB.generateReceiptNo).mockReturnValue('RCP-001');
    
    vi.mocked(cashRegisterDB.getActiveSession).mockResolvedValue(mockRegisterSession);
    vi.mocked(cashRegisterDB.addTransaction).mockResolvedValue();
    
    vi.mocked(creditServices.addCreditSale).mockResolvedValue();
    
    vi.mocked(productDB.updateStock).mockResolvedValue();
    
    // localStorage mock
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('processPayment', () => {
    it('nakit ödeme işlemini başarıyla tamamlamalı', async () => {
      const { result } = renderHook(() => usePaymentFlow());

      const onSuccess = vi.fn();
      const clearCart = vi.fn();

      await act(async () => {
        await result.current.processPayment(
          mockSaleData,
          null,
          null,
          clearCart,
          onSuccess
        );
      });

      // Satış kaydedilmeli
      expect(salesDB.addSale).toHaveBeenCalledWith(
        expect.objectContaining({
          items: mockSaleData.items,
          total: mockSaleData.total,
          paymentMethod: 'cash',
          received: mockSaleData.received,
          change: mockSaleData.change
        })
      );

      // Kasa hareketi eklenmeli
      expect(cashRegisterDB.addTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'income',
          amount: mockSaleData.total,
          paymentMethod: 'cash',
          description: expect.stringContaining('Satış')
        })
      );

      // Stoklar güncellenmeli
      expect(productDB.updateStock).toHaveBeenCalledWith(1, -2);

      // Sepet temizlenmeli ve success callback çağrılmalı
      expect(clearCart).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({
        id: 1,
        receiptNo: 'RCP-001'
      }));
    });

    it('kart ödemesi işlemini doğru kaydetmeli', async () => {
      const { result } = renderHook(() => usePaymentFlow());
      
      const cardSaleData = {
        ...mockSaleData,
        paymentMethod: 'card' as const,
        received: 236,
        change: 0
      };

      await act(async () => {
        await result.current.processPayment(
          cardSaleData,
          null,
          null,
          vi.fn(),
          vi.fn()
        );
      });

      expect(cashRegisterDB.addTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentMethod: 'card',
          amount: cardSaleData.total
        })
      );
    });

    it('veresiye satışı müşteri bilgisi ile kaydetmeli', async () => {
      const { result } = renderHook(() => usePaymentFlow());
      
      const creditSaleData = {
        ...mockSaleData,
        paymentMethod: 'credit' as const,
        customerId: 5,
        received: 0,
        change: 0
      };

      await act(async () => {
        await result.current.processPayment(
          creditSaleData,
          null,
          null,
          vi.fn(),
          vi.fn()
        );
      });

      // Veresiye kaydı oluşturulmalı
      expect(creditServices.addCreditSale).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: 5,
          saleId: 1,
          amount: creditSaleData.total,
          remainingAmount: creditSaleData.total
        })
      );

      // Kasa hareketi eklenmemeli (veresiye)
      expect(cashRegisterDB.addTransaction).not.toHaveBeenCalled();
    });

    it('indirimli satışı doğru hesaplamalı', async () => {
      const { result } = renderHook(() => usePaymentFlow());
      
      const discountedSale = {
        ...mockSaleData,
        discount: {
          type: 'percentage' as const,
          value: 10,
          amount: 23.6,
          discountedTotal: 212.4
        },
        total: 212.4,
        originalTotal: 236
      };

      await act(async () => {
        await result.current.processPayment(
          discountedSale,
          null,
          null,
          vi.fn(),
          vi.fn()
        );
      });

      expect(salesDB.addSale).toHaveBeenCalledWith(
        expect.objectContaining({
          total: 212.4,
          discount: discountedSale.discount,
          originalTotal: 236
        })
      );
    });

    it('split ödeme işlemini doğru kaydetmeli', async () => {
      const { result } = renderHook(() => usePaymentFlow());
      
      const splitPayment = {
        cash: 100,
        card: 136
      };

      await act(async () => {
        await result.current.processPayment(
          mockSaleData,
          splitPayment,
          null,
          vi.fn(),
          vi.fn()
        );
      });

      // İki ayrı kasa hareketi olmalı
      expect(cashRegisterDB.addTransaction).toHaveBeenCalledTimes(2);
      expect(cashRegisterDB.addTransaction).toHaveBeenNthCalledWith(1,
        expect.objectContaining({
          paymentMethod: 'cash',
          amount: 100
        })
      );
      expect(cashRegisterDB.addTransaction).toHaveBeenNthCalledWith(2,
        expect.objectContaining({
          paymentMethod: 'card',
          amount: 136
        })
      );
    });

    it('barkod bazlı ürünleri (id > 1,000,000) ayrı satır olarak kaydetmeli', async () => {
      const { result } = renderHook(() => usePaymentFlow());
      
      const barcodeItems = {
        ...mockSaleData,
        items: [
          ...mockSaleData.items,
          {
            id: 1000001, // Barkod bazlı ürün
            productId: 2,
            name: 'Barkod Ürün',
            quantity: 1,
            price: 50,
            vatRate: 8,
            total: 50,
            vatAmount: 4,
            totalWithVat: 54
          }
        ],
        total: 290
      };

      await act(async () => {
        await result.current.processPayment(
          barcodeItems,
          null,
          null,
          vi.fn(),
          vi.fn()
        );
      });

      // Barkod ürünü için stok güncellenmemeli (zaten benzersiz)
      expect(productDB.updateStock).toHaveBeenCalledTimes(1);
      expect(productDB.updateStock).toHaveBeenCalledWith(1, -2);
    });

    it('hata durumunda işlemi geri almalı', async () => {
      const { result } = renderHook(() => usePaymentFlow());
      
      // Satış başarılı ama stok güncellemesi başarısız
      vi.mocked(productDB.updateStock).mockRejectedValueOnce(
        new Error('Stok güncelleme hatası')
      );

      const onError = vi.fn();

      await act(async () => {
        await result.current.processPayment(
          mockSaleData,
          null,
          null,
          vi.fn(),
          vi.fn(),
          onError
        );
      });

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Stok güncelleme hatası')
        })
      );
    });

    it('kasa kapalıyken nakit/kart işlemi yapmamalı', async () => {
      const { result } = renderHook(() => usePaymentFlow());
      
      vi.mocked(cashRegisterDB.getActiveSession).mockResolvedValueOnce(null);

      const onError = vi.fn();

      await act(async () => {
        await result.current.processPayment(
          mockSaleData,
          null,
          null,
          vi.fn(),
          vi.fn(),
          onError
        );
      });

      expect(cashRegisterDB.addTransaction).not.toHaveBeenCalled();
      // Satış yine de kaydedilmeli (veresiye gibi)
      expect(salesDB.addSale).toHaveBeenCalled();
    });

    it('customer split payment doğru dağıtılmalı', async () => {
      const { result } = renderHook(() => usePaymentFlow());
      
      const customerSplits = [
        { customerId: 1, amount: 100, paid: false },
        { customerId: 2, amount: 136, paid: false }
      ];

      await act(async () => {
        await result.current.processPayment(
          mockSaleData,
          null,
          customerSplits,
          vi.fn(),
          vi.fn()
        );
      });

      // Her müşteri için ayrı veresiye kaydı
      expect(creditServices.addCreditSale).toHaveBeenCalledTimes(2);
      expect(creditServices.addCreditSale).toHaveBeenNthCalledWith(1,
        expect.objectContaining({
          customerId: 1,
          amount: 100,
          remainingAmount: 100
        })
      );
      expect(creditServices.addCreditSale).toHaveBeenNthCalledWith(2,
        expect.objectContaining({
          customerId: 2,
          amount: 136,
          remainingAmount: 136
        })
      );
    });

    it('product split işlemini doğru kaydetmeli', async () => {
      const { result } = renderHook(() => usePaymentFlow());
      
      const productSplits = [
        {
          customerId: 3,
          productId: 1,
          quantity: 1,
          amount: 118,
          paid: false
        },
        {
          customerId: 4,
          productId: 1,
          quantity: 1,
          amount: 118,
          paid: false
        }
      ];

      await act(async () => {
        await result.current.processPayment(
          mockSaleData,
          null,
          productSplits,
          vi.fn(),
          vi.fn()
        );
      });

      // Ürün bazlı split'ler için veresiye kayıtları
      expect(creditServices.addCreditSale).toHaveBeenCalledTimes(2);
    });

    it('localStorage cart temizleme işlemini yapmalı', async () => {
      const { result } = renderHook(() => usePaymentFlow());
      
      const clearCart = vi.fn();
      window.localStorage.getItem.mockReturnValue(
        JSON.stringify({ tabs: [{ id: 1, items: mockSaleData.items }] })
      );

      await act(async () => {
        await result.current.processPayment(
          mockSaleData,
          null,
          null,
          clearCart,
          vi.fn()
        );
      });

      expect(clearCart).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('boş sepet ile işlem yapmamalı', async () => {
      const { result } = renderHook(() => usePaymentFlow());
      
      const emptySale = {
        ...mockSaleData,
        items: [],
        total: 0
      };

      const onError = vi.fn();

      await act(async () => {
        await result.current.processPayment(
          emptySale,
          null,
          null,
          vi.fn(),
          vi.fn(),
          onError
        );
      });

      expect(salesDB.addSale).not.toHaveBeenCalled();
    });

    it('negatif stok durumunda uyarı vermeli', async () => {
      const { result } = renderHook(() => usePaymentFlow());
      
      vi.mocked(productDB.updateStock).mockRejectedValueOnce(
        new Error('Yetersiz stok')
      );

      const onError = vi.fn();

      await act(async () => {
        await result.current.processPayment(
          mockSaleData,
          null,
          null,
          vi.fn(),
          vi.fn(),
          onError
        );
      });

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Yetersiz stok')
        })
      );
    });
  });
});
