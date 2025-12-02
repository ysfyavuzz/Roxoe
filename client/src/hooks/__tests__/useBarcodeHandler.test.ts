/**
 * useBarcodeHandler Tests
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBarcodeHandler } from '../useBarcodeHandler';

describe('useBarcodeHandler', () => {
  const mockProduct = {
    id: 1,
    name: 'Test Product',
    barcode: '123456789',
    price: 100,
    stock: 10,
    category: 'Test',
    vatRate: 18,
  };

  const mockProps = {
    products: [mockProduct],
    activeTab: {
      id: 1,
      name: 'Tab 1',
      cart: [],
    },
    addToCart: vi.fn(),
    updateQuantity: vi.fn(),
    setSearchTerm: vi.fn(),
    showSuccess: vi.fn(),
    showError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle barcode detection for matching product', () => {
    const { result } = renderHook(() => useBarcodeHandler(mockProps));

    act(() => {
      result.current.handleBarcodeDetected('123456789');
    });

    expect(mockProps.addToCart).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        name: 'Test Product',
        source: 'barcode',
      })
    );
    expect(mockProps.showSuccess).toHaveBeenCalled();
  });

  it('should show error for non-existent barcode', () => {
    const { result } = renderHook(() => useBarcodeHandler(mockProps));

    act(() => {
      result.current.handleBarcodeDetected('999999999');
    });

    expect(mockProps.showError).toHaveBeenCalledWith(expect.stringContaining('Barkod bulunamadı'));
  });

  it('should update quantity for existing item in cart', () => {
    const propsWithItemInCart = {
      ...mockProps,
      activeTab: {
        id: 1,
        name: 'Tab 1',
        cart: [{ id: 1, name: 'Test Product', quantity: 1, source: 'manual' }],
      },
      updateQuantity: vi.fn().mockReturnValue(true),
    };

    const { result } = renderHook(() => useBarcodeHandler(propsWithItemInCart));

    act(() => {
      result.current.handleBarcodeDetected('123456789');
    });

    expect(propsWithItemInCart.updateQuantity).toHaveBeenCalledWith(1, 1);
    expect(propsWithItemInCart.showSuccess).toHaveBeenCalled();
  });

  it('should handle out of stock products', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    const propsWithOutOfStock = {
      ...mockProps,
      products: [outOfStockProduct],
    };

    const { result } = renderHook(() => useBarcodeHandler(propsWithOutOfStock));

    act(() => {
      result.current.handleBarcodeDetected('123456789');
    });

    expect(mockProps.showError).toHaveBeenCalledWith(expect.stringContaining('stokta kalmadı'));
  });

  it('should handle partial matches with multiple results', () => {
    const propsWithMultipleProducts = {
      ...mockProps,
      products: [
        mockProduct,
        { ...mockProduct, id: 2, barcode: '123456780' },
      ],
    };

    const { result } = renderHook(() => useBarcodeHandler(propsWithMultipleProducts));

    act(() => {
      result.current.handleBarcodeDetected('12345');
    });

    expect(mockProps.setSearchTerm).toHaveBeenCalledWith('12345');
  });
});
