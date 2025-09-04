/**
 * productDB Service Unit Tests
 * Ürün veritabanı işlemleri için kapsamlı test senaryoları
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as productDB from '../productDB';
import { openDB, IDBPDatabase } from 'idb';

// Mock IDB
vi.mock('idb');

describe('productDB Service', () => {
  let mockDb: Partial<IDBPDatabase>;
  let mockObjectStore: any;
  let mockTransaction: any;
  let mockIndex: any;
  let mockCursor: any;

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

  describe('addProduct', () => {
    it('yeni ürün eklemeli', async () => {
      const newProduct = {
        name: 'Test Ürün',
        barcode: '123456789',
        price: 100,
        vatRate: 18,
        category: 'Test Kategori',
        stock: 50,
        minStock: 10,
        unit: 'Adet'
      };

      mockObjectStore.add.mockResolvedValue(1);
      
      const result = await productDB.addProduct(newProduct);
      
      expect(result).toMatchObject({
        id: 1,
        ...newProduct,
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      });
      
      expect(mockObjectStore.add).toHaveBeenCalledWith(
        expect.objectContaining(newProduct)
      );
    });

    it('barkod benzersizliği kontrol etmeli', async () => {
      const existingProduct = {
        id: 1,
        barcode: '123456789'
      };

      mockIndex.get.mockResolvedValue(existingProduct);
      
      const newProduct = {
        name: 'Yeni Ürün',
        barcode: '123456789',
        price: 100,
        stock: 50
      };

      await expect(productDB.addProduct(newProduct))
        .rejects.toThrow('Bu barkod zaten kayıtlı');
    });

    it('zorunlu alanları kontrol etmeli', async () => {
      const invalidProduct = {
        name: '',
        price: -100,
        stock: -5
      };

      await expect(productDB.addProduct(invalidProduct))
        .rejects.toThrow('Geçersiz ürün bilgileri');
    });
  });

  describe('getProducts', () => {
    it('tüm ürünleri getirmeli', async () => {
      const mockProducts = [
        { id: 1, name: 'Ürün 1', price: 100, stock: 50 },
        { id: 2, name: 'Ürün 2', price: 200, stock: 30 }
      ];

      mockObjectStore.getAll.mockResolvedValue(mockProducts);
      
      const result = await productDB.getProducts();
      
      expect(result).toEqual(mockProducts);
      expect(mockObjectStore.getAll).toHaveBeenCalled();
    });

    it('kategoriye göre filtrelemeli', async () => {
      const allProducts = [
        { id: 1, name: 'Ürün 1', category: 'Gıda' },
        { id: 2, name: 'Ürün 2', category: 'Temizlik' },
        { id: 3, name: 'Ürün 3', category: 'Gıda' }
      ];

      mockIndex.getAll.mockResolvedValue(
        allProducts.filter(p => p.category === 'Gıda')
      );
      
      const result = await productDB.getProductsByCategory('Gıda');
      
      expect(result).toHaveLength(2);
      expect(result.every(p => p.category === 'Gıda')).toBe(true);
      expect(mockIndex.getAll).toHaveBeenCalledWith('Gıda');
    });

    it('stok durumuna göre filtrelemeli', async () => {
      const allProducts = [
        { id: 1, name: 'Ürün 1', stock: 0, minStock: 10 },
        { id: 2, name: 'Ürün 2', stock: 5, minStock: 10 },
        { id: 3, name: 'Ürün 3', stock: 20, minStock: 10 }
      ];

      mockObjectStore.getAll.mockResolvedValue(allProducts);
      
      const lowStockProducts = await productDB.getLowStockProducts();
      
      expect(lowStockProducts).toHaveLength(2);
      expect(lowStockProducts[0].stock).toBeLessThan(lowStockProducts[0].minStock);
    });

    it('aktif/pasif ürünleri filtrelemeli', async () => {
      const allProducts = [
        { id: 1, name: 'Ürün 1', isActive: true },
        { id: 2, name: 'Ürün 2', isActive: false },
        { id: 3, name: 'Ürün 3', isActive: true }
      ];

      mockObjectStore.getAll.mockResolvedValue(allProducts);
      
      const activeProducts = await productDB.getActiveProducts();
      
      expect(activeProducts).toHaveLength(2);
      expect(activeProducts.every(p => p.isActive)).toBe(true);
    });
  });

  describe('getProductById', () => {
    it('ID ile ürünü getirmeli', async () => {
      const mockProduct = { 
        id: 1, 
        name: 'Test Ürün',
        price: 100,
        stock: 50
      };

      mockObjectStore.get.mockResolvedValue(mockProduct);
      
      const result = await productDB.getProductById(1);
      
      expect(result).toEqual(mockProduct);
      expect(mockObjectStore.get).toHaveBeenCalledWith(1);
    });

    it('ürün bulunamazsa null dönmeli', async () => {
      mockObjectStore.get.mockResolvedValue(undefined);
      
      const result = await productDB.getProductById(999);
      
      expect(result).toBeNull();
    });
  });

  describe('getProductByBarcode', () => {
    it('barkod ile ürünü getirmeli', async () => {
      const mockProduct = { 
        id: 1, 
        name: 'Test Ürün',
        barcode: '123456789'
      };

      mockIndex.get.mockResolvedValue(mockProduct);
      
      const result = await productDB.getProductByBarcode('123456789');
      
      expect(result).toEqual(mockProduct);
      expect(mockIndex.get).toHaveBeenCalledWith('123456789');
    });

    it('ürün bulunamazsa null dönmeli', async () => {
      mockIndex.get.mockResolvedValue(undefined);
      
      const result = await productDB.getProductByBarcode('999999999');
      
      expect(result).toBeNull();
    });
  });

  describe('updateProduct', () => {
    it('ürünü güncellemeli', async () => {
      const existingProduct = {
        id: 1,
        name: 'Eski Ürün',
        price: 100,
        stock: 50,
        updatedAt: '2025-01-01'
      };

      const updates = {
        name: 'Yeni Ürün',
        price: 150,
        stock: 60
      };

      mockObjectStore.get.mockResolvedValue(existingProduct);
      mockObjectStore.put.mockResolvedValue(1);
      
      const result = await productDB.updateProduct(1, updates);
      
      expect(result).toMatchObject({
        ...existingProduct,
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

    it('ürün bulunamazsa hata fırlatmalı', async () => {
      mockObjectStore.get.mockResolvedValue(undefined);
      
      await expect(productDB.updateProduct(999, {}))
        .rejects.toThrow('Ürün bulunamadı');
    });

    it('barkod değişikliğinde benzersizlik kontrolü yapmalı', async () => {
      const existingProduct = {
        id: 1,
        barcode: '111111111'
      };

      const anotherProduct = {
        id: 2,
        barcode: '222222222'
      };

      mockObjectStore.get.mockResolvedValue(existingProduct);
      mockIndex.get.mockResolvedValue(anotherProduct);
      
      await expect(productDB.updateProduct(1, { barcode: '222222222' }))
        .rejects.toThrow('Bu barkod başka bir ürüne ait');
    });
  });

  describe('updateStock', () => {
    it('stok miktarını artırmalı', async () => {
      const product = {
        id: 1,
        name: 'Test Ürün',
        stock: 50
      };

      mockObjectStore.get.mockResolvedValue(product);
      mockObjectStore.put.mockResolvedValue(1);
      
      const result = await productDB.updateStock(1, 10);
      
      expect(result).toMatchObject({
        ...product,
        stock: 60
      });
    });

    it('stok miktarını azaltmalı', async () => {
      const product = {
        id: 1,
        name: 'Test Ürün',
        stock: 50
      };

      mockObjectStore.get.mockResolvedValue(product);
      mockObjectStore.put.mockResolvedValue(1);
      
      const result = await productDB.updateStock(1, -10);
      
      expect(result).toMatchObject({
        ...product,
        stock: 40
      });
    });

    it('yetersiz stok durumunda hata fırlatmalı', async () => {
      const product = {
        id: 1,
        name: 'Test Ürün',
        stock: 5
      };

      mockObjectStore.get.mockResolvedValue(product);
      
      await expect(productDB.updateStock(1, -10))
        .rejects.toThrow('Yetersiz stok');
    });

    it('stok hareketi kaydı oluşturmalı', async () => {
      const product = {
        id: 1,
        name: 'Test Ürün',
        stock: 50
      };

      mockObjectStore.get.mockResolvedValue(product);
      mockObjectStore.put.mockResolvedValue(1);
      mockObjectStore.add.mockResolvedValue(1); // Stock movement
      
      await productDB.updateStock(1, 10, 'Mal girişi');
      
      // Stock movements store'a kayıt eklenmeli
      expect(mockObjectStore.add).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: 1,
          quantity: 10,
          type: 'in',
          reason: 'Mal girişi',
          previousStock: 50,
          newStock: 60
        })
      );
    });
  });

  describe('deleteProduct', () => {
    it('ürünü silmeli', async () => {
      mockObjectStore.delete.mockResolvedValue(undefined);
      
      await productDB.deleteProduct(1);
      
      expect(mockObjectStore.delete).toHaveBeenCalledWith(1);
    });

    it('satış geçmişi olan ürünü soft delete yapmalı', async () => {
      const product = {
        id: 1,
        name: 'Test Ürün',
        isActive: true
      };

      mockObjectStore.get.mockResolvedValue(product);
      mockObjectStore.put.mockResolvedValue(1);
      
      // Satış geçmişi var
      const hasSalesHistory = true;
      
      await productDB.deleteProduct(1, hasSalesHistory);
      
      expect(mockObjectStore.put).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          isActive: false,
          deletedAt: expect.any(String)
        })
      );
      expect(mockObjectStore.delete).not.toHaveBeenCalled();
    });
  });

  describe('searchProducts', () => {
    it('isme göre arama yapmalı', async () => {
      const allProducts = [
        { id: 1, name: 'Coca Cola 1L', barcode: '111' },
        { id: 2, name: 'Pepsi Cola 1L', barcode: '222' },
        { id: 3, name: 'Fanta 1L', barcode: '333' }
      ];

      mockObjectStore.getAll.mockResolvedValue(allProducts);
      
      const result = await productDB.searchProducts('Cola');
      
      expect(result).toHaveLength(2);
      expect(result.every(p => p.name.includes('Cola'))).toBe(true);
    });

    it('barkoda göre arama yapmalı', async () => {
      const allProducts = [
        { id: 1, name: 'Ürün 1', barcode: '123456789' },
        { id: 2, name: 'Ürün 2', barcode: '987654321' },
        { id: 3, name: 'Ürün 3', barcode: '123000000' }
      ];

      mockObjectStore.getAll.mockResolvedValue(allProducts);
      
      const result = await productDB.searchProducts('123');
      
      expect(result).toHaveLength(2);
      expect(result[0].barcode).toContain('123');
      expect(result[1].barcode).toContain('123');
    });

    it('kategoriye göre arama yapmalı', async () => {
      const allProducts = [
        { id: 1, name: 'Ürün 1', category: 'Gıda' },
        { id: 2, name: 'Ürün 2', category: 'Temizlik' },
        { id: 3, name: 'Ürün 3', category: 'Gıda' }
      ];

      mockObjectStore.getAll.mockResolvedValue(allProducts);
      
      const result = await productDB.searchProducts('', { category: 'Gıda' });
      
      expect(result).toHaveLength(2);
      expect(result.every(p => p.category === 'Gıda')).toBe(true);
    });

    it('fiyat aralığına göre filtrelemeli', async () => {
      const allProducts = [
        { id: 1, name: 'Ürün 1', price: 50 },
        { id: 2, name: 'Ürün 2', price: 150 },
        { id: 3, name: 'Ürün 3', price: 100 }
      ];

      mockObjectStore.getAll.mockResolvedValue(allProducts);
      
      const result = await productDB.searchProducts('', { 
        minPrice: 75, 
        maxPrice: 125 
      });
      
      expect(result).toHaveLength(1);
      expect(result[0].price).toBeGreaterThanOrEqual(75);
      expect(result[0].price).toBeLessThanOrEqual(125);
    });
  });

  describe('importProducts', () => {
    it('CSV formatında ürünleri import etmeli', async () => {
      const csvData = `name,barcode,price,stock,category,vatRate
Ürün 1,123456,100,50,Gıda,18
Ürün 2,789012,200,30,Temizlik,8`;

      mockObjectStore.add.mockResolvedValue(1);
      
      const result = await productDB.importProducts(csvData, 'csv');
      
      expect(result).toMatchObject({
        success: 2,
        failed: 0,
        errors: []
      });
      
      expect(mockObjectStore.add).toHaveBeenCalledTimes(2);
    });

    it('JSON formatında ürünleri import etmeli', async () => {
      const jsonData = JSON.stringify([
        { name: 'Ürün 1', barcode: '123456', price: 100, stock: 50 },
        { name: 'Ürün 2', barcode: '789012', price: 200, stock: 30 }
      ]);

      mockObjectStore.add.mockResolvedValue(1);
      
      const result = await productDB.importProducts(jsonData, 'json');
      
      expect(result).toMatchObject({
        success: 2,
        failed: 0,
        errors: []
      });
    });

    it('hatalı ürünleri raporlamalı', async () => {
      const jsonData = JSON.stringify([
        { name: '', barcode: '123456', price: -100 }, // Hatalı
        { name: 'Ürün 2', barcode: '789012', price: 200, stock: 30 } // Geçerli
      ]);

      mockObjectStore.add
        .mockRejectedValueOnce(new Error('Geçersiz ürün'))
        .mockResolvedValueOnce(2);
      
      const result = await productDB.importProducts(jsonData, 'json');
      
      expect(result).toMatchObject({
        success: 1,
        failed: 1,
        errors: expect.arrayContaining([
          expect.objectContaining({
            row: 0,
            error: 'Geçersiz ürün'
          })
        ])
      });
    });
  });

  describe('exportProducts', () => {
    it('ürünleri CSV formatında export etmeli', async () => {
      const products = [
        { id: 1, name: 'Ürün 1', barcode: '123', price: 100, stock: 50 },
        { id: 2, name: 'Ürün 2', barcode: '456', price: 200, stock: 30 }
      ];

      mockObjectStore.getAll.mockResolvedValue(products);
      
      const csv = await productDB.exportProducts('csv');
      
      expect(csv).toContain('name,barcode,price,stock');
      expect(csv).toContain('Ürün 1,123,100,50');
      expect(csv).toContain('Ürün 2,456,200,30');
    });

    it('ürünleri JSON formatında export etmeli', async () => {
      const products = [
        { id: 1, name: 'Ürün 1', price: 100 },
        { id: 2, name: 'Ürün 2', price: 200 }
      ];

      mockObjectStore.getAll.mockResolvedValue(products);
      
      const json = await productDB.exportProducts('json');
      
      const parsed = JSON.parse(json);
      expect(parsed).toEqual(products);
    });
  });

  describe('getCategories', () => {
    it('tüm kategorileri benzersiz olarak getirmeli', async () => {
      const products = [
        { id: 1, category: 'Gıda' },
        { id: 2, category: 'Temizlik' },
        { id: 3, category: 'Gıda' },
        { id: 4, category: 'Kırtasiye' }
      ];

      mockObjectStore.getAll.mockResolvedValue(products);
      
      const categories = await productDB.getCategories();
      
      expect(categories).toEqual(['Gıda', 'Temizlik', 'Kırtasiye']);
      expect(categories).toHaveLength(3);
    });
  });

  describe('getStockValue', () => {
    it('toplam stok değerini hesaplamalı', async () => {
      const products = [
        { id: 1, price: 100, stock: 10 }, // 1000
        { id: 2, price: 50, stock: 20 },  // 1000
        { id: 3, price: 200, stock: 5 }   // 1000
      ];

      mockObjectStore.getAll.mockResolvedValue(products);
      
      const totalValue = await productDB.getStockValue();
      
      expect(totalValue).toBe(3000);
    });

    it('kategoriye göre stok değerini hesaplamalı', async () => {
      const products = [
        { id: 1, category: 'Gıda', price: 100, stock: 10 }, // 1000
        { id: 2, category: 'Temizlik', price: 50, stock: 20 }, // 1000
        { id: 3, category: 'Gıda', price: 200, stock: 5 } // 1000
      ];

      mockObjectStore.getAll.mockResolvedValue(products);
      
      const categoryValue = await productDB.getStockValueByCategory('Gıda');
      
      expect(categoryValue).toBe(2000);
    });
  });

  describe('getPriceHistory', () => {
    it('ürünün fiyat geçmişini getirmeli', async () => {
      const priceHistory = [
        { productId: 1, oldPrice: 90, newPrice: 100, date: '2025-01-01' },
        { productId: 1, oldPrice: 100, newPrice: 110, date: '2025-01-15' }
      ];

      mockIndex.getAll.mockResolvedValue(priceHistory);
      
      const history = await productDB.getPriceHistory(1);
      
      expect(history).toEqual(priceHistory);
      expect(history).toHaveLength(2);
    });
  });
});
