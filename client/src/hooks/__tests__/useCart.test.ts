/**
 * useCart Hook Unit Tests
 * Sepet yönetimi için kritik test senaryoları
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCart } from '../useCart';
import { toast } from 'react-hot-toast';

// Mock dependencies
vi.mock('react-hot-toast');

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('useCart Hook', () => {
  const mockProduct = {
    id: 1,
    name: 'Test Ürün',
    price: 100,
    vatRate: 18,
    barcode: '123456789',
    category: 'Test',
    stock: 50
  };

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('addToCart', () => {
    it('sepete yeni ürün eklemeli', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockProduct);
      });

      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0]).toMatchObject({
        productId: mockProduct.id,
        name: mockProduct.name,
        price: mockProduct.price,
        quantity: 1,
        vatRate: mockProduct.vatRate,
        total: mockProduct.price
      });
    });

    it('aynı ürünü eklediğinde miktarı artırmalı', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockProduct);
        result.current.addToCart(mockProduct);
      });

      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0].quantity).toBe(2);
      expect(result.current.cartItems[0].total).toBe(200);
    });

    it('stok kontrolü yapmalı', () => {
      const { result } = renderHook(() => useCart());
      const lowStockProduct = { ...mockProduct, stock: 1 };

      act(() => {
        result.current.addToCart(lowStockProduct);
        result.current.addToCart(lowStockProduct);
      });

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Stok yetersiz')
      );
      expect(result.current.cartItems[0].quantity).toBe(1);
    });

    it('barkod bazlı ürünleri ayrı satır olarak eklemeli', () => {
      const { result } = renderHook(() => useCart());
      const barcodeProduct = { ...mockProduct, id: 1000001 };

      act(() => {
        result.current.addToCart(barcodeProduct);
        result.current.addToCart(barcodeProduct);
      });

      // Barkod ürünleri ayrı satır olarak eklenmeli
      expect(result.current.cartItems).toHaveLength(2);
      expect(result.current.cartItems[0].quantity).toBe(1);
      expect(result.current.cartItems[1].quantity).toBe(1);
    });

    it('özel fiyatlı ürün eklemeli', () => {
      const { result } = renderHook(() => useCart());
      const customPrice = 85;

      act(() => {
        result.current.addToCart(mockProduct, customPrice);
      });

      expect(result.current.cartItems[0].price).toBe(customPrice);
      expect(result.current.cartItems[0].total).toBe(customPrice);
    });
  });

  describe('updateCartItem', () => {
    it('ürün miktarını güncellemeli', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockProduct);
      });

      const itemId = result.current.cartItems[0].id;

      act(() => {
        result.current.updateCartItem(itemId, { quantity: 5 });
      });

      expect(result.current.cartItems[0].quantity).toBe(5);
      expect(result.current.cartItems[0].total).toBe(500);
    });

    it('ürün fiyatını güncellemeli', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockProduct);
      });

      const itemId = result.current.cartItems[0].id;

      act(() => {
        result.current.updateCartItem(itemId, { price: 90 });
      });

      expect(result.current.cartItems[0].price).toBe(90);
      expect(result.current.cartItems[0].total).toBe(90);
    });

    it('sıfır veya negatif miktar ile ürünü kaldırmalı', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockProduct);
      });

      const itemId = result.current.cartItems[0].id;

      act(() => {
        result.current.updateCartItem(itemId, { quantity: 0 });
      });

      expect(result.current.cartItems).toHaveLength(0);
    });

    it('KDV oranını güncellemeli', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockProduct);
      });

      const itemId = result.current.cartItems[0].id;

      act(() => {
        result.current.updateCartItem(itemId, { vatRate: 8 });
      });

      expect(result.current.cartItems[0].vatRate).toBe(8);
      expect(result.current.cartItems[0].vatAmount).toBe(8); // 100 * 0.08
      expect(result.current.cartItems[0].totalWithVat).toBe(108);
    });
  });

  describe('removeFromCart', () => {
    it('ürünü sepetten kaldırmalı', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockProduct);
      });

      const itemId = result.current.cartItems[0].id;

      act(() => {
        result.current.removeFromCart(itemId);
      });

      expect(result.current.cartItems).toHaveLength(0);
    });

    it('sadece belirtilen ürünü kaldırmalı', () => {
      const { result } = renderHook(() => useCart());
      const secondProduct = { ...mockProduct, id: 2, name: 'İkinci Ürün' };

      act(() => {
        result.current.addToCart(mockProduct);
        result.current.addToCart(secondProduct);
      });

      const firstItemId = result.current.cartItems[0].id;

      act(() => {
        result.current.removeFromCart(firstItemId);
      });

      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0].name).toBe('İkinci Ürün');
    });
  });

  describe('clearCart', () => {
    it('tüm sepeti temizlemeli', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockProduct);
        result.current.addToCart({ ...mockProduct, id: 2 });
        result.current.addToCart({ ...mockProduct, id: 3 });
      });

      expect(result.current.cartItems).toHaveLength(3);

      act(() => {
        result.current.clearCart();
      });

      expect(result.current.cartItems).toHaveLength(0);
      expect(result.current.totals.subtotal).toBe(0);
      expect(result.current.totals.vatTotal).toBe(0);
      expect(result.current.totals.total).toBe(0);
    });

    it('localStorage temizlemeli', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockProduct);
      });

      act(() => {
        result.current.clearCart();
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cart',
        JSON.stringify({ items: [], activeTabId: 1 })
      );
    });
  });

  describe('applyDiscount', () => {
    it('yüzde indirimi uygulamalı', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockProduct);
      });

      act(() => {
        result.current.applyDiscount({
          type: 'percentage',
          value: 10
        });
      });

      expect(result.current.discount).toMatchObject({
        type: 'percentage',
        value: 10,
        amount: 11.8, // 118 * 0.10
        discountedTotal: 106.2 // 118 - 11.8
      });
    });

    it('tutar indirimi uygulamalı', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockProduct);
      });

      act(() => {
        result.current.applyDiscount({
          type: 'amount',
          value: 20
        });
      });

      expect(result.current.discount).toMatchObject({
        type: 'amount',
        value: 20,
        amount: 20,
        discountedTotal: 98 // 118 - 20
      });
    });

    it('toplam tutardan fazla indirim yapmamalı', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockProduct);
      });

      act(() => {
        result.current.applyDiscount({
          type: 'amount',
          value: 200
        });
      });

      expect(result.current.discount?.discountedTotal).toBeGreaterThanOrEqual(0);
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('İndirim tutarı')
      );
    });

    it('indirimi kaldırmalı', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockProduct);
        result.current.applyDiscount({
          type: 'percentage',
          value: 10
        });
      });

      expect(result.current.discount).toBeTruthy();

      act(() => {
        result.current.removeDiscount();
      });

      expect(result.current.discount).toBeNull();
    });
  });

  describe('totals hesaplamaları', () => {
    it('toplam hesaplamalarını doğru yapmalı', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockProduct); // 100 TL, %18 KDV
        result.current.addToCart({ ...mockProduct, id: 2, price: 200, vatRate: 8 }); // 200 TL, %8 KDV
      });

      expect(result.current.totals).toMatchObject({
        subtotal: 300,
        vatTotal: 34, // (100 * 0.18) + (200 * 0.08) = 18 + 16
        total: 334
      });
    });

    it('farklı KDV oranlarını gruplamalı', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart({ ...mockProduct, vatRate: 18 });
        result.current.addToCart({ ...mockProduct, id: 2, vatRate: 18 });
        result.current.addToCart({ ...mockProduct, id: 3, vatRate: 8 });
        result.current.addToCart({ ...mockProduct, id: 4, vatRate: 1 });
      });

      const vatGroups = result.current.vatGroups;
      
      expect(vatGroups).toHaveLength(3); // 3 farklı KDV grubu
      expect(vatGroups.find(g => g.rate === 18)?.total).toBe(200); // 2 ürün x 100
      expect(vatGroups.find(g => g.rate === 8)?.total).toBe(100);
      expect(vatGroups.find(g => g.rate === 1)?.total).toBe(100);
    });
  });

  describe('multi-tab işlemleri', () => {
    it('yeni sekme oluşturmalı', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockProduct);
      });

      act(() => {
        result.current.createTab('Müşteri 2');
      });

      expect(result.current.tabs).toHaveLength(2);
      expect(result.current.activeTabId).toBe(2);
      expect(result.current.cartItems).toHaveLength(0); // Yeni sekme boş olmalı
    });

    it('sekmeler arası geçiş yapmalı', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockProduct);
        result.current.createTab('Tab 2');
        result.current.addToCart({ ...mockProduct, id: 2 });
      });

      // Tab 2'de 1 ürün olmalı
      expect(result.current.cartItems).toHaveLength(1);

      act(() => {
        result.current.switchTab(1);
      });

      // Tab 1'de 1 ürün olmalı
      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0].productId).toBe(1);
    });

    it('sekme silmeli', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.createTab('Tab 2');
        result.current.createTab('Tab 3');
      });

      expect(result.current.tabs).toHaveLength(3);

      act(() => {
        result.current.closeTab(2);
      });

      expect(result.current.tabs).toHaveLength(2);
      expect(result.current.tabs.find(t => t.id === 2)).toBeUndefined();
    });

    it('son sekme silinemez', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.closeTab(1);
      });

      expect(result.current.tabs).toHaveLength(1);
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Son sekme')
      );
    });
  });

  describe('localStorage persistence', () => {
    it('sepet verilerini localStorage kaydetmeli', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockProduct);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cart',
        expect.stringContaining(mockProduct.name)
      );
    });

    it('sayfa yenilenmesinde veriyi geri yüklemeli', () => {
      const savedCart = {
        tabs: [{
          id: 1,
          name: 'Tab 1',
          items: [{
            id: 1,
            productId: 1,
            name: 'Kayıtlı Ürün',
            price: 150,
            quantity: 2,
            total: 300,
            vatRate: 18,
            vatAmount: 54,
            totalWithVat: 354
          }]
        }],
        activeTabId: 1
      };

      localStorageMock.setItem('cart', JSON.stringify(savedCart));

      const { result } = renderHook(() => useCart());

      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0].name).toBe('Kayıtlı Ürün');
      expect(result.current.cartItems[0].quantity).toBe(2);
    });
  });

  describe('quick sale işlemleri', () => {
    it('hızlı satış ürünü eklemeli', () => {
      const { result } = renderHook(() => useCart());
      
      act(() => {
        result.current.addQuickSaleItem('Hızlı Satış', 50, 18);
      });

      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0].name).toBe('Hızlı Satış');
      expect(result.current.cartItems[0].price).toBe(50);
      expect(result.current.cartItems[0].productId).toBeGreaterThan(1000000);
    });
  });
});
