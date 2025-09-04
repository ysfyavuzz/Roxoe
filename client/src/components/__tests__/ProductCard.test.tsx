/**
 * ProductCard Component Tests
 * Ürün kartı bileşeni için kapsamlı unit testler
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ProductCard } from '../ProductCard';
import { useCart } from '../../hooks/useCart';
import { useProducts } from '../../hooks/useProducts';
import { toast } from 'react-hot-toast';

// Mock hooks
vi.mock('../../hooks/useCart');
vi.mock('../../hooks/useProducts');
vi.mock('react-hot-toast');

// Mock IntersectionObserver for lazy loading
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

describe('ProductCard Component', () => {
  const mockProduct = {
    id: 1,
    name: 'Test Ürün',
    barcode: '1234567890',
    price: 99.99,
    discountedPrice: null,
    stock: 10,
    category: 'Elektronik',
    brand: 'Test Marka',
    image: '/images/test-product.jpg',
    description: 'Test ürün açıklaması',
    tax: 18,
    unit: 'adet',
    minStock: 5,
    isActive: true,
    isFeatured: false,
    tags: ['yeni', 'popüler']
  };

  const mockCartHook = {
    addToCart: vi.fn(),
    removeFromCart: vi.fn(),
    updateQuantity: vi.fn(),
    isInCart: vi.fn(),
    getCartItem: vi.fn(),
    cartItems: []
  };

  const mockProductsHook = {
    updateStock: vi.fn(),
    toggleFavorite: vi.fn(),
    isFavorite: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCart).mockReturnValue(mockCartHook);
    vi.mocked(useProducts).mockReturnValue(mockProductsHook);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('ürün bilgilerini göstermeli', () => {
      render(<ProductCard product={mockProduct} />);

      expect(screen.getByText('Test Ürün')).toBeInTheDocument();
      expect(screen.getByText('₺99,99')).toBeInTheDocument();
      expect(screen.getByText('Test Marka')).toBeInTheDocument();
      expect(screen.getByText('Stok: 10')).toBeInTheDocument();
    });

    it('indirimli fiyatı göstermeli', () => {
      const discountedProduct = {
        ...mockProduct,
        discountedPrice: 79.99
      };

      render(<ProductCard product={discountedProduct} />);

      expect(screen.getByText('₺79,99')).toBeInTheDocument();
      expect(screen.getByText('₺99,99')).toHaveClass('line-through');
      expect(screen.getByText('%20')).toBeInTheDocument(); // İndirim yüzdesi
    });

    it('stok durumunu göstermeli', () => {
      const lowStockProduct = {
        ...mockProduct,
        stock: 3
      };

      render(<ProductCard product={lowStockProduct} />);

      expect(screen.getByText('Son 3 ürün!')).toBeInTheDocument();
      expect(screen.getByText('Son 3 ürün!')).toHaveClass('text-warning');
    });

    it('stokta yok durumunu göstermeli', () => {
      const outOfStockProduct = {
        ...mockProduct,
        stock: 0
      };

      render(<ProductCard product={outOfStockProduct} />);

      expect(screen.getByText('Stokta Yok')).toBeInTheDocument();
      expect(screen.getByTestId('add-to-cart-btn')).toBeDisabled();
    });

    it('ürün resmi göstermeli', () => {
      render(<ProductCard product={mockProduct} />);

      const productImage = screen.getByAltText('Test Ürün') as HTMLImageElement;
      expect(productImage).toBeInTheDocument();
      expect(productImage.src).toContain('test-product.jpg');
    });

    it('varsayılan resim göstermeli', () => {
      const productWithoutImage = {
        ...mockProduct,
        image: null
      };

      render(<ProductCard product={productWithoutImage} />);

      const defaultImage = screen.getByAltText('Test Ürün') as HTMLImageElement;
      expect(defaultImage.src).toContain('no-image.png');
    });

    it('öne çıkan ürün badge göstermeli', () => {
      const featuredProduct = {
        ...mockProduct,
        isFeatured: true
      };

      render(<ProductCard product={featuredProduct} />);

      expect(screen.getByText('Öne Çıkan')).toBeInTheDocument();
      expect(screen.getByText('Öne Çıkan')).toHaveClass('badge-featured');
    });

    it('ürün etiketlerini göstermeli', () => {
      render(<ProductCard product={mockProduct} />);

      expect(screen.getByText('yeni')).toBeInTheDocument();
      expect(screen.getByText('popüler')).toBeInTheDocument();
    });
  });

  describe('cart operations', () => {
    it('sepete ürün eklemeli', async () => {
      mockCartHook.isInCart.mockReturnValue(false);

      render(<ProductCard product={mockProduct} />);

      const addToCartButton = screen.getByTestId('add-to-cart-btn');
      fireEvent.click(addToCartButton);

      await waitFor(() => {
        expect(mockCartHook.addToCart).toHaveBeenCalledWith(mockProduct, 1);
        expect(toast.success).toHaveBeenCalledWith('Ürün sepete eklendi');
      });
    });

    it('sepetteki ürün için miktar kontrolü göstermeli', () => {
      mockCartHook.isInCart.mockReturnValue(true);
      mockCartHook.getCartItem.mockReturnValue({
        product: mockProduct,
        quantity: 2
      });

      render(<ProductCard product={mockProduct} />);

      expect(screen.getByTestId('quantity-display')).toHaveTextContent('2');
      expect(screen.getByTestId('decrease-quantity-btn')).toBeInTheDocument();
      expect(screen.getByTestId('increase-quantity-btn')).toBeInTheDocument();
    });

    it('sepetteki ürün miktarını artırmalı', async () => {
      mockCartHook.isInCart.mockReturnValue(true);
      mockCartHook.getCartItem.mockReturnValue({
        product: mockProduct,
        quantity: 2
      });

      render(<ProductCard product={mockProduct} />);

      const increaseButton = screen.getByTestId('increase-quantity-btn');
      fireEvent.click(increaseButton);

      await waitFor(() => {
        expect(mockCartHook.updateQuantity).toHaveBeenCalledWith(mockProduct.id, 3);
      });
    });

    it('sepetteki ürün miktarını azaltmalı', async () => {
      mockCartHook.isInCart.mockReturnValue(true);
      mockCartHook.getCartItem.mockReturnValue({
        product: mockProduct,
        quantity: 2
      });

      render(<ProductCard product={mockProduct} />);

      const decreaseButton = screen.getByTestId('decrease-quantity-btn');
      fireEvent.click(decreaseButton);

      await waitFor(() => {
        expect(mockCartHook.updateQuantity).toHaveBeenCalledWith(mockProduct.id, 1);
      });
    });

    it('son ürünü sepetten kaldırmalı', async () => {
      mockCartHook.isInCart.mockReturnValue(true);
      mockCartHook.getCartItem.mockReturnValue({
        product: mockProduct,
        quantity: 1
      });

      render(<ProductCard product={mockProduct} />);

      const decreaseButton = screen.getByTestId('decrease-quantity-btn');
      fireEvent.click(decreaseButton);

      await waitFor(() => {
        expect(mockCartHook.removeFromCart).toHaveBeenCalledWith(mockProduct.id);
        expect(toast.info).toHaveBeenCalledWith('Ürün sepetten kaldırıldı');
      });
    });

    it('stok limitini aşmamalı', async () => {
      mockCartHook.isInCart.mockReturnValue(true);
      mockCartHook.getCartItem.mockReturnValue({
        product: mockProduct,
        quantity: 10 // Max stok
      });

      render(<ProductCard product={mockProduct} />);

      const increaseButton = screen.getByTestId('increase-quantity-btn');
      fireEvent.click(increaseButton);

      await waitFor(() => {
        expect(mockCartHook.updateQuantity).not.toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalledWith('Stok yetersiz');
      });
    });
  });

  describe('quick add', () => {
    it('hızlı ekleme yapmalı', async () => {
      mockCartHook.isInCart.mockReturnValue(false);

      render(<ProductCard product={mockProduct} />);

      const quickAddButton = screen.getByTestId('quick-add-btn');
      fireEvent.click(quickAddButton);

      await waitFor(() => {
        expect(mockCartHook.addToCart).toHaveBeenCalledWith(mockProduct, 1);
      });
    });

    it('klavye ile miktar girmeli', async () => {
      render(<ProductCard product={mockProduct} showQuantityInput />);

      const quantityInput = screen.getByTestId('quantity-input') as HTMLInputElement;
      
      await userEvent.clear(quantityInput);
      await userEvent.type(quantityInput, '5');

      const addButton = screen.getByTestId('add-to-cart-btn');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockCartHook.addToCart).toHaveBeenCalledWith(mockProduct, 5);
      });
    });

    it('geçersiz miktar girilemez', async () => {
      render(<ProductCard product={mockProduct} showQuantityInput />);

      const quantityInput = screen.getByTestId('quantity-input') as HTMLInputElement;
      
      await userEvent.clear(quantityInput);
      await userEvent.type(quantityInput, '-5');

      expect(quantityInput.value).toBe('1'); // Minimum 1 olmalı
    });
  });

  describe('favorite operations', () => {
    it('favori butonunu göstermeli', () => {
      render(<ProductCard product={mockProduct} showFavorite />);

      expect(screen.getByTestId('favorite-btn')).toBeInTheDocument();
    });

    it('favorilere eklemeli', async () => {
      mockProductsHook.isFavorite.mockReturnValue(false);

      render(<ProductCard product={mockProduct} showFavorite />);

      const favoriteButton = screen.getByTestId('favorite-btn');
      fireEvent.click(favoriteButton);

      await waitFor(() => {
        expect(mockProductsHook.toggleFavorite).toHaveBeenCalledWith(mockProduct.id);
        expect(toast.success).toHaveBeenCalledWith('Favorilere eklendi');
      });
    });

    it('favorilerden çıkarmalı', async () => {
      mockProductsHook.isFavorite.mockReturnValue(true);

      render(<ProductCard product={mockProduct} showFavorite />);

      const favoriteButton = screen.getByTestId('favorite-btn');
      expect(favoriteButton).toHaveClass('active');

      fireEvent.click(favoriteButton);

      await waitFor(() => {
        expect(mockProductsHook.toggleFavorite).toHaveBeenCalledWith(mockProduct.id);
        expect(toast.info).toHaveBeenCalledWith('Favorilerden kaldırıldı');
      });
    });
  });

  describe('comparison', () => {
    it('karşılaştırma butonunu göstermeli', () => {
      render(<ProductCard product={mockProduct} showCompare />);

      expect(screen.getByTestId('compare-btn')).toBeInTheDocument();
    });

    it('karşılaştırmaya eklemeli', async () => {
      const onCompare = vi.fn();
      render(<ProductCard product={mockProduct} showCompare onCompare={onCompare} />);

      const compareButton = screen.getByTestId('compare-btn');
      fireEvent.click(compareButton);

      await waitFor(() => {
        expect(onCompare).toHaveBeenCalledWith(mockProduct);
      });
    });

    it('maksimum karşılaştırma limiti uyarısı vermeli', async () => {
      const onCompare = vi.fn().mockReturnValue(false);
      render(<ProductCard product={mockProduct} showCompare onCompare={onCompare} />);

      const compareButton = screen.getByTestId('compare-btn');
      fireEvent.click(compareButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('En fazla 4 ürün karşılaştırılabilir');
      });
    });
  });

  describe('quick view', () => {
    it('hızlı görünüm modalını açmalı', async () => {
      render(<ProductCard product={mockProduct} />);

      const quickViewButton = screen.getByTestId('quick-view-btn');
      fireEvent.click(quickViewButton);

      await waitFor(() => {
        expect(screen.getByTestId('quick-view-modal')).toBeInTheDocument();
        expect(screen.getByText('Test ürün açıklaması')).toBeInTheDocument();
      });
    });

    it('modal içinde sepete eklemeli', async () => {
      render(<ProductCard product={mockProduct} />);

      const quickViewButton = screen.getByTestId('quick-view-btn');
      fireEvent.click(quickViewButton);

      const modalAddButton = await screen.findByTestId('modal-add-to-cart-btn');
      fireEvent.click(modalAddButton);

      await waitFor(() => {
        expect(mockCartHook.addToCart).toHaveBeenCalledWith(mockProduct, 1);
      });
    });

    it('ESC tuşu ile modalı kapatmalı', async () => {
      render(<ProductCard product={mockProduct} />);

      const quickViewButton = screen.getByTestId('quick-view-btn');
      fireEvent.click(quickViewButton);

      const modal = await screen.findByTestId('quick-view-modal');
      expect(modal).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByTestId('quick-view-modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('display variants', () => {
    it('grid görünümde render etmeli', () => {
      render(<ProductCard product={mockProduct} variant="grid" />);

      const card = screen.getByTestId('product-card');
      expect(card).toHaveClass('card-grid');
    });

    it('list görünümde render etmeli', () => {
      render(<ProductCard product={mockProduct} variant="list" />);

      const card = screen.getByTestId('product-card');
      expect(card).toHaveClass('card-list');
      expect(screen.getByText('Test ürün açıklaması')).toBeInTheDocument();
    });

    it('compact görünümde render etmeli', () => {
      render(<ProductCard product={mockProduct} variant="compact" />);

      const card = screen.getByTestId('product-card');
      expect(card).toHaveClass('card-compact');
      expect(screen.queryByText('Test ürün açıklaması')).not.toBeInTheDocument();
    });
  });

  describe('loading states', () => {
    it('yükleme durumu göstermeli', () => {
      render(<ProductCard product={mockProduct} loading />);

      expect(screen.getByTestId('product-card-skeleton')).toBeInTheDocument();
      expect(screen.queryByText('Test Ürün')).not.toBeInTheDocument();
    });

    it('lazy loading image kullanmalı', () => {
      render(<ProductCard product={mockProduct} />);

      const image = screen.getByAltText('Test Ürün') as HTMLImageElement;
      expect(image).toHaveAttribute('loading', 'lazy');
    });

    it('placeholder image göstermeli', () => {
      render(<ProductCard product={mockProduct} />);

      const image = screen.getByAltText('Test Ürün') as HTMLImageElement;
      
      // Simulate image loading error
      fireEvent.error(image);

      expect(image.src).toContain('placeholder.png');
    });
  });

  describe('hover effects', () => {
    it('hover durumunda butonları göstermeli', async () => {
      render(<ProductCard product={mockProduct} />);

      const card = screen.getByTestId('product-card');
      
      fireEvent.mouseEnter(card);

      await waitFor(() => {
        expect(screen.getByTestId('quick-view-btn')).toBeVisible();
        expect(screen.getByTestId('quick-add-btn')).toBeVisible();
      });

      fireEvent.mouseLeave(card);

      await waitFor(() => {
        expect(screen.getByTestId('quick-view-btn')).not.toBeVisible();
        expect(screen.getByTestId('quick-add-btn')).not.toBeVisible();
      });
    });

    it('mobilde dokunma ile butonları göstermeli', async () => {
      render(<ProductCard product={mockProduct} />);

      const card = screen.getByTestId('product-card');
      
      fireEvent.touchStart(card);

      await waitFor(() => {
        expect(screen.getByTestId('quick-view-btn')).toBeVisible();
      });
    });
  });

  describe('pricing display', () => {
    it('KDV dahil fiyat göstermeli', () => {
      render(<ProductCard product={mockProduct} showTaxIncluded />);

      const priceWithTax = 99.99 * 1.18; // %18 KDV
      expect(screen.getByText(`₺${priceWithTax.toFixed(2)}`)).toBeInTheDocument();
      expect(screen.getByText('KDV Dahil')).toBeInTheDocument();
    });

    it('birim fiyatı göstermeli', () => {
      const productWithUnit = {
        ...mockProduct,
        unit: 'kg',
        price: 50
      };

      render(<ProductCard product={productWithUnit} />);

      expect(screen.getByText('₺50,00 / kg')).toBeInTheDocument();
    });

    it('kargo bedava badge göstermeli', () => {
      const highPriceProduct = {
        ...mockProduct,
        price: 150 // Kargo bedava limiti üstünde
      };

      render(<ProductCard product={highPriceProduct} freeShippingLimit={100} />);

      expect(screen.getByText('Kargo Bedava')).toBeInTheDocument();
    });
  });

  describe('stock alerts', () => {
    it('kritik stok uyarısı göstermeli', () => {
      const criticalStockProduct = {
        ...mockProduct,
        stock: 4, // minStock: 5'in altında
        minStock: 5
      };

      render(<ProductCard product={criticalStockProduct} />);

      expect(screen.getByText('Kritik Stok')).toBeInTheDocument();
      expect(screen.getByText('Kritik Stok')).toHaveClass('text-danger');
    });

    it('yeni ürün badge göstermeli', () => {
      const newProduct = {
        ...mockProduct,
        createdAt: new Date().toISOString() // Bugün eklendi
      };

      render(<ProductCard product={newProduct} />);

      expect(screen.getByText('Yeni')).toBeInTheDocument();
      expect(screen.getByText('Yeni')).toHaveClass('badge-new');
    });
  });

  describe('accessibility', () => {
    it('ARIA etiketlerine sahip olmalı', () => {
      render(<ProductCard product={mockProduct} />);

      expect(screen.getByRole('article')).toBeInTheDocument();
      expect(screen.getByLabelText('Ürün fiyatı')).toBeInTheDocument();
      expect(screen.getByLabelText('Sepete ekle')).toBeInTheDocument();
    });

    it('klavye navigasyonunu desteklemeli', async () => {
      render(<ProductCard product={mockProduct} />);

      const addButton = screen.getByTestId('add-to-cart-btn');
      addButton.focus();

      expect(document.activeElement).toBe(addButton);

      // Enter tuşu ile tıklama
      fireEvent.keyDown(addButton, { key: 'Enter' });

      await waitFor(() => {
        expect(mockCartHook.addToCart).toHaveBeenCalled();
      });
    });

    it('screen reader için açıklamalara sahip olmalı', () => {
      render(<ProductCard product={mockProduct} />);

      const image = screen.getByAltText('Test Ürün');
      expect(image).toHaveAttribute('aria-label', 'Test Ürün ürün görseli');

      const priceElement = screen.getByText('₺99,99');
      expect(priceElement).toHaveAttribute('aria-label', 'Ürün fiyatı: 99,99 TL');
    });
  });

  describe('click analytics', () => {
    it('ürün tıklama olayını takip etmeli', () => {
      const onProductClick = vi.fn();
      render(<ProductCard product={mockProduct} onProductClick={onProductClick} />);

      const card = screen.getByTestId('product-card');
      fireEvent.click(card);

      expect(onProductClick).toHaveBeenCalledWith({
        productId: mockProduct.id,
        productName: mockProduct.name,
        price: mockProduct.price,
        category: mockProduct.category
      });
    });

    it('sepete ekleme olayını takip etmeli', async () => {
      const onAddToCart = vi.fn();
      render(<ProductCard product={mockProduct} onAddToCart={onAddToCart} />);

      const addButton = screen.getByTestId('add-to-cart-btn');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(onAddToCart).toHaveBeenCalledWith({
          productId: mockProduct.id,
          quantity: 1,
          price: mockProduct.price
        });
      });
    });
  });

  describe('responsive behavior', () => {
    it('mobil görünümde düzgün render etmeli', () => {
      // Mock window width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });

      render(<ProductCard product={mockProduct} />);

      const card = screen.getByTestId('product-card');
      expect(card).toHaveClass('mobile-optimized');
    });

    it('tablet görünümde grid-2 olmalı', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      });

      render(<ProductCard product={mockProduct} />);

      const card = screen.getByTestId('product-card');
      expect(card).toHaveClass('tablet-grid-2');
    });

    it('desktop görünümde tüm özellikler görünmeli', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920
      });

      render(<ProductCard product={mockProduct} showAllFeatures />);

      expect(screen.getByTestId('favorite-btn')).toBeInTheDocument();
      expect(screen.getByTestId('compare-btn')).toBeInTheDocument();
      expect(screen.getByTestId('quick-view-btn')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('hatalı ürün verisi ile render etmemeli', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation();
      
      render(<ProductCard product={null as any} />);

      expect(screen.queryByTestId('product-card')).not.toBeInTheDocument();
      expect(consoleError).toHaveBeenCalled();

      consoleError.mockRestore();
    });

    it('eksik ürün bilgileri ile güvenli render etmeli', () => {
      const incompleteProduct = {
        id: 1,
        name: 'Test',
        // price missing
        // stock missing
      } as any;

      render(<ProductCard product={incompleteProduct} />);

      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.getByText('₺0,00')).toBeInTheDocument(); // Default price
      expect(screen.getByText('Stok bilgisi yok')).toBeInTheDocument();
    });
  });
});
