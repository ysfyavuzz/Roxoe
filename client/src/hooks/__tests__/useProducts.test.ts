/**
 * useProducts Hook Unit Tests
 * Ürün yönetimi hook'u için kapsamlı test senaryoları
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useProducts } from '../useProducts';
import * as productDB from '../../services/productDB';
import { toast } from 'react-hot-toast';

// Mock dependencies
vi.mock('../../services/productDB');
vi.mock('react-hot-toast');

describe('useProducts Hook', () => {
  const mockProducts = [
    {
      id: 1,
      name: 'Test Ürün 1',
      barcode: '123456789',
      price: 100,
      stock: 50,
      category: 'Gıda',
      vatRate: 18,
      minStock: 10,
      isActive: true
    },
    {
      id: 2,
      name: 'Test Ürün 2',
      barcode: '987654321',
      price: 200,
      stock: 5,
      category: 'Temizlik',
      vatRate: 8,
      minStock: 10,
      isActive: true
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(productDB.getProducts).mockResolvedValue(mockProducts);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization and loading', () => {
    it('başlangıçta ürünleri yüklemeli', async () => {
      const { result } = renderHook(() => useProducts());

      expect(result.current.loading).toBe(true);
      expect(result.current.products).toEqual([]);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.products).toEqual(mockProducts);
      });

      expect(productDB.getProducts).toHaveBeenCalled();
    });

    it('yükleme hatası durumunu yönetmeli', async () => {
      const error = new Error('Veritabanı hatası');
      vi.mocked(productDB.getProducts).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useProducts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(error.message);
        expect(result.current.products).toEqual([]);
      });

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Ürünler yüklenirken hata')
      );
    });
  });

  describe('addProduct', () => {
    it('yeni ürün eklemeli', async () => {
      const { result } = renderHook(() => useProducts());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const newProduct = {
        name: 'Yeni Ürün',
        barcode: '555555555',
        price: 150,
        stock: 20,
        category: 'Gıda',
        vatRate: 18
      };

      const addedProduct = { ...newProduct, id: 3 };
      vi.mocked(productDB.addProduct).mockResolvedValueOnce(addedProduct);

      await act(async () => {
        await result.current.addProduct(newProduct);
      });

      expect(productDB.addProduct).toHaveBeenCalledWith(newProduct);
      expect(result.current.products).toContainEqual(addedProduct);
      expect(toast.success).toHaveBeenCalledWith('Ürün başarıyla eklendi');
    });

    it('ekleme hatası durumunda mesaj göstermeli', async () => {
      const { result } = renderHook(() => useProducts());

      await waitFor(() => expect(result.current.loading).toBe(false));

      vi.mocked(productDB.addProduct).mockRejectedValueOnce(
        new Error('Barkod zaten mevcut')
      );

      await act(async () => {
        const success = await result.current.addProduct({
          name: 'Test',
          barcode: '123456789',
          price: 100
        });
        expect(success).toBe(false);
      });

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Barkod zaten mevcut')
      );
    });
  });

  describe('updateProduct', () => {
    it('ürünü güncellemeli', async () => {
      const { result } = renderHook(() => useProducts());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const updates = {
        name: 'Güncellenmiş Ürün',
        price: 120
      };

      const updatedProduct = { ...mockProducts[0], ...updates };
      vi.mocked(productDB.updateProduct).mockResolvedValueOnce(updatedProduct);

      await act(async () => {
        await result.current.updateProduct(1, updates);
      });

      expect(productDB.updateProduct).toHaveBeenCalledWith(1, updates);
      expect(result.current.products[0]).toEqual(updatedProduct);
      expect(toast.success).toHaveBeenCalledWith('Ürün güncellendi');
    });

    it('güncelleme hatası durumunda eskiye dönmeli', async () => {
      const { result } = renderHook(() => useProducts());

      await waitFor(() => expect(result.current.loading).toBe(false));

      vi.mocked(productDB.updateProduct).mockRejectedValueOnce(
        new Error('Güncelleme başarısız')
      );

      const originalProducts = [...result.current.products];

      await act(async () => {
        const success = await result.current.updateProduct(1, { price: 999 });
        expect(success).toBe(false);
      });

      expect(result.current.products).toEqual(originalProducts);
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Güncelleme başarısız')
      );
    });
  });

  describe('deleteProduct', () => {
    it('ürünü silmeli', async () => {
      const { result } = renderHook(() => useProducts());

      await waitFor(() => expect(result.current.loading).toBe(false));

      vi.mocked(productDB.deleteProduct).mockResolvedValueOnce();

      await act(async () => {
        await result.current.deleteProduct(1);
      });

      expect(productDB.deleteProduct).toHaveBeenCalledWith(1);
      expect(result.current.products).not.toContainEqual(
        expect.objectContaining({ id: 1 })
      );
      expect(toast.success).toHaveBeenCalledWith('Ürün silindi');
    });

    it('silme onayı istemeli', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
      
      const { result } = renderHook(() => useProducts());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.deleteProduct(1, true);
      });

      expect(confirmSpy).toHaveBeenCalledWith(
        expect.stringContaining('silmek istediğinizden emin misiniz')
      );
      expect(productDB.deleteProduct).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
    });
  });

  describe('updateStock', () => {
    it('stok miktarını güncellemeli', async () => {
      const { result } = renderHook(() => useProducts());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const updatedProduct = { ...mockProducts[0], stock: 60 };
      vi.mocked(productDB.updateStock).mockResolvedValueOnce(updatedProduct);

      await act(async () => {
        await result.current.updateStock(1, 10);
      });

      expect(productDB.updateStock).toHaveBeenCalledWith(1, 10, undefined);
      expect(result.current.products[0].stock).toBe(60);
    });

    it('stok azaltırken yetersizlik kontrolü yapmalı', async () => {
      const { result } = renderHook(() => useProducts());

      await waitFor(() => expect(result.current.loading).toBe(false));

      vi.mocked(productDB.updateStock).mockRejectedValueOnce(
        new Error('Yetersiz stok')
      );

      await act(async () => {
        const success = await result.current.updateStock(2, -10);
        expect(success).toBe(false);
      });

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Yetersiz stok')
      );
    });

    it('toplu stok güncelleme yapabilmeli', async () => {
      const { result } = renderHook(() => useProducts());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const updates = [
        { productId: 1, quantity: 10 },
        { productId: 2, quantity: 5 }
      ];

      vi.mocked(productDB.updateStock)
        .mockResolvedValueOnce({ ...mockProducts[0], stock: 60 })
        .mockResolvedValueOnce({ ...mockProducts[1], stock: 10 });

      await act(async () => {
        await result.current.bulkUpdateStock(updates);
      });

      expect(productDB.updateStock).toHaveBeenCalledTimes(2);
      expect(result.current.products[0].stock).toBe(60);
      expect(result.current.products[1].stock).toBe(10);
    });
  });

  describe('searchProducts', () => {
    it('isme göre arama yapmalı', async () => {
      const { result } = renderHook(() => useProducts());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.searchProducts('Ürün 1');
      });

      expect(result.current.filteredProducts).toHaveLength(1);
      expect(result.current.filteredProducts[0].name).toContain('Ürün 1');
    });

    it('barkoda göre arama yapmalı', async () => {
      const { result } = renderHook(() => useProducts());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.searchProducts('123456');
      });

      expect(result.current.filteredProducts).toHaveLength(1);
      expect(result.current.filteredProducts[0].barcode).toContain('123456');
    });

    it('boş arama tüm ürünleri göstermeli', async () => {
      const { result } = renderHook(() => useProducts());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.searchProducts('');
      });

      expect(result.current.filteredProducts).toEqual(mockProducts);
    });
  });

  describe('filterByCategory', () => {
    it('kategoriye göre filtrelemeli', async () => {
      const { result } = renderHook(() => useProducts());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.filterByCategory('Gıda');
      });

      expect(result.current.filteredProducts).toHaveLength(1);
      expect(result.current.filteredProducts[0].category).toBe('Gıda');
    });

    it('tüm kategorileri göstermeli', async () => {
      const { result } = renderHook(() => useProducts());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.filterByCategory('');
      });

      expect(result.current.filteredProducts).toEqual(mockProducts);
    });
  });

  describe('getLowStockProducts', () => {
    it('düşük stoklu ürünleri getirmeli', async () => {
      const { result } = renderHook(() => useProducts());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const lowStock = result.current.getLowStockProducts();

      expect(lowStock).toHaveLength(1);
      expect(lowStock[0].id).toBe(2);
      expect(lowStock[0].stock).toBeLessThan(lowStock[0].minStock);
    });

    it('kritik stok ürünlerini işaretlemeli', async () => {
      const { result } = renderHook(() => useProducts());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const criticalStock = result.current.getCriticalStockProducts();

      // Stok 0 veya 1 olan ürünler
      const expected = mockProducts.filter(p => p.stock <= 1);
      expect(criticalStock).toEqual(expected);
    });
  });

  describe('importProducts', () => {
    it('CSV dosyasından ürün import etmeli', async () => {
      const { result } = renderHook(() => useProducts());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const csvData = 'name,price,stock\nYeni Ürün,100,50';
      const importResult = {
        success: 1,
        failed: 0,
        errors: []
      };

      vi.mocked(productDB.importProducts).mockResolvedValueOnce(importResult);

      await act(async () => {
        const result = await result.current.importProducts(csvData, 'csv');
        expect(result).toEqual(importResult);
      });

      expect(productDB.importProducts).toHaveBeenCalledWith(csvData, 'csv');
      expect(toast.success).toHaveBeenCalledWith('1 ürün başarıyla içe aktarıldı');
    });

    it('import hatalarını göstermeli', async () => {
      const { result } = renderHook(() => useProducts());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const importResult = {
        success: 1,
        failed: 2,
        errors: [
          { row: 1, error: 'Geçersiz fiyat' },
          { row: 2, error: 'Barkod mevcut' }
        ]
      };

      vi.mocked(productDB.importProducts).mockResolvedValueOnce(importResult);

      await act(async () => {
        await result.current.importProducts('data', 'csv');
      });

      expect(toast.error).toHaveBeenCalledWith('2 ürün içe aktarılamadı');
    });
  });

  describe('exportProducts', () => {
    it('ürünleri CSV olarak export etmeli', async () => {
      const { result } = renderHook(() => useProducts());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const csvData = 'id,name,price\n1,Ürün 1,100\n2,Ürün 2,200';
      vi.mocked(productDB.exportProducts).mockResolvedValueOnce(csvData);

      await act(async () => {
        const data = await result.current.exportProducts('csv');
        expect(data).toBe(csvData);
      });

      expect(productDB.exportProducts).toHaveBeenCalledWith('csv');
    });

    it('export sonrası dosya indirmeli', async () => {
      const { result } = renderHook(() => useProducts());

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
      vi.mocked(productDB.exportProducts).mockResolvedValueOnce(csvData);

      await act(async () => {
        await result.current.downloadProducts('csv');
      });

      expect(linkElement.download).toContain('products');
      expect(linkElement.download).toContain('.csv');
      expect(linkElement.click).toHaveBeenCalled();

      createElementSpy.mockRestore();
    });
  });

  describe('sorting', () => {
    it('isme göre sıralama yapmalı', async () => {
      const { result } = renderHook(() => useProducts());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.sortProducts('name', 'asc');
      });

      expect(result.current.filteredProducts[0].name).toBe('Test Ürün 1');
      expect(result.current.filteredProducts[1].name).toBe('Test Ürün 2');

      act(() => {
        result.current.sortProducts('name', 'desc');
      });

      expect(result.current.filteredProducts[0].name).toBe('Test Ürün 2');
      expect(result.current.filteredProducts[1].name).toBe('Test Ürün 1');
    });

    it('fiyata göre sıralama yapmalı', async () => {
      const { result } = renderHook(() => useProducts());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.sortProducts('price', 'asc');
      });

      expect(result.current.filteredProducts[0].price).toBe(100);
      expect(result.current.filteredProducts[1].price).toBe(200);
    });

    it('stoka göre sıralama yapmalı', async () => {
      const { result } = renderHook(() => useProducts());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.sortProducts('stock', 'asc');
      });

      expect(result.current.filteredProducts[0].stock).toBe(5);
      expect(result.current.filteredProducts[1].stock).toBe(50);
    });
  });

  describe('statistics', () => {
    it('ürün istatistiklerini hesaplamalı', async () => {
      const { result } = renderHook(() => useProducts());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const stats = result.current.getStatistics();

      expect(stats).toMatchObject({
        totalProducts: 2,
        activeProducts: 2,
        lowStockProducts: 1,
        outOfStockProducts: 0,
        totalStockValue: expect.any(Number),
        averagePrice: 150,
        categories: ['Gıda', 'Temizlik']
      });
    });

    it('kategori bazlı istatistik vermeli', async () => {
      const { result } = renderHook(() => useProducts());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const categoryStats = result.current.getCategoryStatistics();

      expect(categoryStats).toEqual(
        expect.objectContaining({
          'Gıda': expect.objectContaining({
            count: 1,
            stockValue: 5000,
            averagePrice: 100
          }),
          'Temizlik': expect.objectContaining({
            count: 1,
            stockValue: 1000,
            averagePrice: 200
          })
        })
      );
    });
  });

  describe('refresh', () => {
    it('ürün listesini yenilemeli', async () => {
      const { result } = renderHook(() => useProducts());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const newProducts = [
        { ...mockProducts[0], name: 'Yenilenmiş Ürün' }
      ];
      vi.mocked(productDB.getProducts).mockResolvedValueOnce(newProducts);

      await act(async () => {
        await result.current.refresh();
      });

      expect(productDB.getProducts).toHaveBeenCalledTimes(2);
      expect(result.current.products).toEqual(newProducts);
    });
  });
});
