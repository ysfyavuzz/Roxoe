/**
 * useInventory Hook Unit Tests
 * Envanter yönetimi hook'u için kapsamlı test senaryoları
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useInventory } from '../useInventory';
import * as productDB from '../../services/productDB';
import * as inventoryDB from '../../services/inventoryDB';
import { toast } from 'react-hot-toast';

// Mock dependencies
vi.mock('../../services/productDB');
vi.mock('../../services/inventoryDB');
vi.mock('react-hot-toast');

describe('useInventory Hook', () => {
  const mockProducts = [
    {
      id: 1,
      name: 'Ürün 1',
      barcode: '123456789',
      category: 'Elektronik',
      price: 100,
      cost: 70,
      stock: 50,
      minStock: 10,
      maxStock: 100,
      unit: 'adet',
      tax: 18,
      isActive: true,
      supplier: 'Tedarikçi A',
      lastPurchaseDate: '2025-01-15',
      lastSaleDate: '2025-01-19'
    },
    {
      id: 2,
      name: 'Ürün 2',
      barcode: '987654321',
      category: 'Gıda',
      price: 50,
      cost: 30,
      stock: 5, // Kritik stok seviyesi
      minStock: 10,
      maxStock: 50,
      unit: 'kg',
      tax: 8,
      isActive: true,
      supplier: 'Tedarikçi B',
      lastPurchaseDate: '2025-01-10',
      lastSaleDate: '2025-01-20'
    },
    {
      id: 3,
      name: 'Ürün 3',
      barcode: '456789123',
      category: 'Temizlik',
      price: 75,
      cost: 50,
      stock: 0, // Stokta yok
      minStock: 5,
      maxStock: 30,
      unit: 'lt',
      tax: 18,
      isActive: true,
      supplier: 'Tedarikçi C',
      lastPurchaseDate: '2025-01-05',
      lastSaleDate: '2025-01-18'
    }
  ];

  const mockInventoryMovements = [
    {
      id: 1,
      productId: 1,
      type: 'purchase',
      quantity: 100,
      date: '2025-01-15',
      cost: 7000,
      supplier: 'Tedarikçi A',
      invoiceNo: 'FAT-2025-001',
      note: 'Stok alımı'
    },
    {
      id: 2,
      productId: 1,
      type: 'sale',
      quantity: -50,
      date: '2025-01-19',
      price: 5000,
      customer: 'Müşteri 1',
      receiptNo: 'FIS-2025-001'
    },
    {
      id: 3,
      productId: 2,
      type: 'adjustment',
      quantity: -2,
      date: '2025-01-18',
      reason: 'Fire/Kayıp',
      note: 'Sayım farkı'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(productDB.getProducts).mockResolvedValue(mockProducts);
    vi.mocked(inventoryDB.getMovements).mockResolvedValue(mockInventoryMovements);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization and loading', () => {
    it('başlangıçta envanter verilerini yüklemeli', async () => {
      const { result } = renderHook(() => useInventory());

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

      const { result } = renderHook(() => useInventory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(error.message);
      });

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Envanter yüklenirken hata')
      );
    });
  });

  describe('stock management', () => {
    it('stok girişi yapmalı', async () => {
      const { result } = renderHook(() => useInventory());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const stockEntry = {
        productId: 2,
        quantity: 20,
        cost: 600,
        supplier: 'Tedarikçi B',
        invoiceNo: 'FAT-2025-002'
      };

      vi.mocked(inventoryDB.addStockEntry).mockResolvedValueOnce({
        id: 4,
        ...stockEntry,
        type: 'purchase',
        date: '2025-01-20'
      });

      vi.mocked(productDB.updateStock).mockResolvedValueOnce();

      await act(async () => {
        await result.current.addStockEntry(stockEntry);
      });

      expect(inventoryDB.addStockEntry).toHaveBeenCalledWith(stockEntry);
      expect(productDB.updateStock).toHaveBeenCalledWith(2, 20);
      expect(toast.success).toHaveBeenCalledWith('Stok girişi başarılı');
    });

    it('stok çıkışı yapmalı', async () => {
      const { result } = renderHook(() => useInventory());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const stockExit = {
        productId: 1,
        quantity: 10,
        reason: 'Satış',
        note: 'Müşteri siparişi'
      };

      vi.mocked(inventoryDB.addStockExit).mockResolvedValueOnce({
        id: 5,
        ...stockExit,
        type: 'sale',
        quantity: -10,
        date: '2025-01-20'
      });

      vi.mocked(productDB.updateStock).mockResolvedValueOnce();

      await act(async () => {
        await result.current.addStockExit(stockExit);
      });

      expect(inventoryDB.addStockExit).toHaveBeenCalledWith(stockExit);
      expect(productDB.updateStock).toHaveBeenCalledWith(1, -10);
      expect(toast.success).toHaveBeenCalledWith('Stok çıkışı kaydedildi');
    });

    it('yetersiz stok hatası vermeli', async () => {
      const { result } = renderHook(() => useInventory());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const stockExit = {
        productId: 3, // Stok: 0
        quantity: 5,
        reason: 'Satış'
      };

      await act(async () => {
        const success = await result.current.addStockExit(stockExit);
        expect(success).toBe(false);
      });

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Yetersiz stok')
      );
    });

    it('stok düzeltmesi yapmalı', async () => {
      const { result } = renderHook(() => useInventory());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const adjustment = {
        productId: 1,
        newStock: 60,
        reason: 'Sayım düzeltmesi',
        note: 'Fiziksel sayım sonucu'
      };

      vi.mocked(inventoryDB.adjustStock).mockResolvedValueOnce({
        id: 6,
        productId: 1,
        type: 'adjustment',
        quantity: 10,
        date: '2025-01-20',
        reason: adjustment.reason,
        note: adjustment.note
      });

      vi.mocked(productDB.setStock).mockResolvedValueOnce();

      await act(async () => {
        await result.current.adjustStock(adjustment);
      });

      expect(inventoryDB.adjustStock).toHaveBeenCalledWith(adjustment);
      expect(productDB.setStock).toHaveBeenCalledWith(1, 60);
      expect(toast.success).toHaveBeenCalledWith('Stok düzeltmesi yapıldı');
    });
  });

  describe('low stock alerts', () => {
    it('kritik stok seviyesindeki ürünleri getirmeli', async () => {
      const { result } = renderHook(() => useInventory());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const lowStockProducts = result.current.getLowStockProducts();

      expect(lowStockProducts).toHaveLength(2); // Ürün 2 ve 3
      expect(lowStockProducts.every(p => p.stock <= p.minStock)).toBe(true);
    });

    it('stokta olmayan ürünleri getirmeli', async () => {
      const { result } = renderHook(() => useInventory());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const outOfStock = result.current.getOutOfStockProducts();

      expect(outOfStock).toHaveLength(1); // Sadece Ürün 3
      expect(outOfStock[0].stock).toBe(0);
    });

    it('kritik stok uyarısı göstermeli', async () => {
      const { result } = renderHook(() => useInventory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Hook yüklendiğinde otomatik kritik stok kontrolü
      expect(toast.warning).toHaveBeenCalledWith(
        expect.stringContaining('2 ürün kritik stok seviyesinde')
      );
    });
  });

  describe('inventory movements', () => {
    it('ürün hareketlerini getirmeli', async () => {
      const { result } = renderHook(() => useInventory());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const movements = await result.current.getProductMovements(1);

      expect(movements).toHaveLength(2); // Ürün 1 için 2 hareket
      expect(movements[0].productId).toBe(1);
    });

    it('tarih aralığına göre hareketleri filtrelemeli', async () => {
      const { result } = renderHook(() => useInventory());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const filteredMovements = [mockInventoryMovements[1]];
      vi.mocked(inventoryDB.getMovementsByDateRange).mockResolvedValueOnce(filteredMovements);

      const movements = await result.current.getMovementsByDateRange(
        '2025-01-19',
        '2025-01-19'
      );

      expect(movements).toEqual(filteredMovements);
      expect(inventoryDB.getMovementsByDateRange).toHaveBeenCalledWith(
        '2025-01-19',
        '2025-01-19'
      );
    });

    it('hareket tipine göre filtrelemeli', async () => {
      const { result } = renderHook(() => useInventory());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const purchaseMovements = await result.current.getMovementsByType('purchase');
      const saleMovements = await result.current.getMovementsByType('sale');
      const adjustmentMovements = await result.current.getMovementsByType('adjustment');

      expect(purchaseMovements).toHaveLength(1);
      expect(saleMovements).toHaveLength(1);
      expect(adjustmentMovements).toHaveLength(1);
    });
  });

  describe('inventory valuation', () => {
    it('toplam stok değerini hesaplamalı', async () => {
      const { result } = renderHook(() => useInventory());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const totalValue = result.current.getTotalInventoryValue();

      // (50 * 70) + (5 * 30) + (0 * 50) = 3500 + 150 + 0 = 3650
      expect(totalValue).toBe(3650);
    });

    it('kategori bazlı stok değerini hesaplamalı', async () => {
      const { result } = renderHook(() => useInventory());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const electronicsValue = result.current.getInventoryValueByCategory('Elektronik');
      const foodValue = result.current.getInventoryValueByCategory('Gıda');
      const cleaningValue = result.current.getInventoryValueByCategory('Temizlik');

      expect(electronicsValue).toBe(3500); // 50 * 70
      expect(foodValue).toBe(150); // 5 * 30
      expect(cleaningValue).toBe(0); // 0 * 50
    });

    it('potansiyel satış değerini hesaplamalı', async () => {
      const { result } = renderHook(() => useInventory());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const potentialRevenue = result.current.getPotentialRevenue();

      // (50 * 100) + (5 * 50) + (0 * 75) = 5000 + 250 + 0 = 5250
      expect(potentialRevenue).toBe(5250);
    });

    it('kar marjını hesaplamalı', async () => {
      const { result } = renderHook(() => useInventory());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const profitMargin = result.current.getProfitMargin();

      // (5250 - 3650) / 5250 * 100 = 30.48%
      expect(profitMargin).toBeCloseTo(30.48, 1);
    });
  });

  describe('stock transfer', () => {
    it('stok transfer işlemi yapmalı', async () => {
      const { result } = renderHook(() => useInventory());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const transfer = {
        fromProductId: 1,
        toProductId: 2,
        quantity: 5,
        reason: 'Kategori değişimi'
      };

      vi.mocked(inventoryDB.transferStock).mockResolvedValueOnce({
        success: true,
        fromMovement: { id: 7, type: 'transfer_out' },
        toMovement: { id: 8, type: 'transfer_in' }
      });

      await act(async () => {
        await result.current.transferStock(transfer);
      });

      expect(inventoryDB.transferStock).toHaveBeenCalledWith(transfer);
      expect(toast.success).toHaveBeenCalledWith('Stok transferi tamamlandı');
    });
  });

  describe('inventory reports', () => {
    it('stok raporu oluşturmalı', async () => {
      const { result } = renderHook(() => useInventory());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const report = result.current.generateInventoryReport();

      expect(report).toMatchObject({
        date: expect.any(String),
        totalProducts: 3,
        totalValue: 3650,
        lowStockCount: 2,
        outOfStockCount: 1,
        categories: expect.any(Array),
        topValueProducts: expect.any(Array),
        movements: {
          purchases: expect.any(Number),
          sales: expect.any(Number),
          adjustments: expect.any(Number)
        }
      });
    });

    it('ABC analizi yapmalı', async () => {
      const { result } = renderHook(() => useInventory());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const abcAnalysis = result.current.performABCAnalysis();

      expect(abcAnalysis).toMatchObject({
        A: expect.any(Array), // Yüksek değerli ürünler
        B: expect.any(Array), // Orta değerli ürünler
        C: expect.any(Array)  // Düşük değerli ürünler
      });

      // A kategorisi en yüksek değerli %70
      expect(abcAnalysis.A[0].id).toBe(1); // En yüksek değerli ürün
    });

    it('stok devir hızını hesaplamalı', async () => {
      const { result } = renderHook(() => useInventory());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const turnoverRate = await result.current.getInventoryTurnoverRate(1);

      expect(turnoverRate).toBeGreaterThan(0);
    });
  });

  describe('supplier management', () => {
    it('tedarikçi bazlı ürünleri getirmeli', async () => {
      const { result } = renderHook(() => useInventory());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const supplierAProducts = result.current.getProductsBySupplier('Tedarikçi A');
      const supplierBProducts = result.current.getProductsBySupplier('Tedarikçi B');

      expect(supplierAProducts).toHaveLength(1);
      expect(supplierAProducts[0].id).toBe(1);
      expect(supplierBProducts).toHaveLength(1);
      expect(supplierBProducts[0].id).toBe(2);
    });

    it('tedarikçi performansını analiz etmeli', async () => {
      const { result } = renderHook(() => useInventory());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const performance = await result.current.analyzeSupplierPerformance('Tedarikçi A');

      expect(performance).toMatchObject({
        supplier: 'Tedarikçi A',
        totalPurchases: expect.any(Number),
        totalProducts: 1,
        averageCost: expect.any(Number),
        lastPurchaseDate: '2025-01-15'
      });
    });
  });

  describe('barcode operations', () => {
    it('barkod ile ürün aramalı', async () => {
      const { result } = renderHook(() => useInventory());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const product = result.current.findProductByBarcode('123456789');

      expect(product).toBeDefined();
      expect(product?.id).toBe(1);
      expect(product?.name).toBe('Ürün 1');
    });

    it('barkod bulunamadığında null dönmeli', async () => {
      const { result } = renderHook(() => useInventory());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const product = result.current.findProductByBarcode('999999999');

      expect(product).toBeNull();
    });

    it('çoklu barkod ile toplu arama yapmalı', async () => {
      const { result } = renderHook(() => useInventory());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const barcodes = ['123456789', '987654321', '999999999'];
      const products = result.current.findProductsByBarcodes(barcodes);

      expect(products).toHaveLength(2); // 2 ürün bulundu
      expect(products.map(p => p.id)).toEqual([1, 2]);
    });
  });

  describe('filters and search', () => {
    it('kategori filtrelemesi yapmalı', async () => {
      const { result } = renderHook(() => useInventory());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.filterByCategory('Elektronik');
      });

      expect(result.current.filteredProducts).toHaveLength(1);
      expect(result.current.filteredProducts[0].category).toBe('Elektronik');

      act(() => {
        result.current.filterByCategory('Gıda');
      });

      expect(result.current.filteredProducts).toHaveLength(1);
      expect(result.current.filteredProducts[0].category).toBe('Gıda');
    });

    it('stok durumuna göre filtrelemeli', async () => {
      const { result } = renderHook(() => useInventory());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.filterByStockStatus('low');
      });

      expect(result.current.filteredProducts).toHaveLength(2); // Ürün 2 ve 3

      act(() => {
        result.current.filterByStockStatus('out');
      });

      expect(result.current.filteredProducts).toHaveLength(1); // Ürün 3

      act(() => {
        result.current.filterByStockStatus('normal');
      });

      expect(result.current.filteredProducts).toHaveLength(1); // Ürün 1
    });

    it('ürün adına göre arama yapmalı', async () => {
      const { result } = renderHook(() => useInventory());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.searchProducts('Ürün 1');
      });

      expect(result.current.filteredProducts).toHaveLength(1);
      expect(result.current.filteredProducts[0].name).toBe('Ürün 1');
    });
  });

  describe('import/export', () => {
    it('envanter verilerini export etmeli', async () => {
      const { result } = renderHook(() => useInventory());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const exportData = 'CSV_DATA';
      vi.mocked(inventoryDB.exportInventory).mockResolvedValueOnce(exportData);

      const data = await result.current.exportInventory('csv');

      expect(data).toBe(exportData);
      expect(inventoryDB.exportInventory).toHaveBeenCalledWith('csv');
    });

    it('envanter verilerini import etmeli', async () => {
      const { result } = renderHook(() => useInventory());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const importData = 'CSV_DATA';
      const importResult = {
        success: 5,
        failed: 1,
        errors: [{ row: 3, error: 'Geçersiz barkod' }]
      };

      vi.mocked(inventoryDB.importInventory).mockResolvedValueOnce(importResult);

      const result2 = await result.current.importInventory(importData, 'csv');

      expect(result2).toEqual(importResult);
      expect(toast.success).toHaveBeenCalledWith('5 ürün başarıyla içe aktarıldı');
      
      if (importResult.failed > 0) {
        expect(toast.error).toHaveBeenCalledWith('1 ürün içe aktarılamadı');
      }
    });
  });

  describe('batch operations', () => {
    it('toplu stok güncellemesi yapmalı', async () => {
      const { result } = renderHook(() => useInventory());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const updates = [
        { productId: 1, stock: 60 },
        { productId: 2, stock: 20 },
        { productId: 3, stock: 10 }
      ];

      vi.mocked(inventoryDB.batchUpdateStock).mockResolvedValueOnce({
        success: 3,
        failed: 0
      });

      await act(async () => {
        await result.current.batchUpdateStock(updates);
      });

      expect(inventoryDB.batchUpdateStock).toHaveBeenCalledWith(updates);
      expect(toast.success).toHaveBeenCalledWith('3 ürün stoğu güncellendi');
    });

    it('toplu fiyat güncellemesi yapmalı', async () => {
      const { result } = renderHook(() => useInventory());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const priceUpdates = [
        { productId: 1, price: 110, cost: 75 },
        { productId: 2, price: 55, cost: 32 }
      ];

      vi.mocked(productDB.batchUpdatePrices).mockResolvedValueOnce({
        success: 2,
        failed: 0
      });

      await act(async () => {
        await result.current.batchUpdatePrices(priceUpdates);
      });

      expect(productDB.batchUpdatePrices).toHaveBeenCalledWith(priceUpdates);
      expect(toast.success).toHaveBeenCalledWith('2 ürün fiyatı güncellendi');
    });
  });

  describe('refresh and reset', () => {
    it('envanter listesini yenilemeli', async () => {
      const { result } = renderHook(() => useInventory());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const newProducts = [
        { ...mockProducts[0], stock: 45 }
      ];
      vi.mocked(productDB.getProducts).mockResolvedValueOnce(newProducts);

      await act(async () => {
        await result.current.refresh();
      });

      expect(productDB.getProducts).toHaveBeenCalledTimes(2);
      expect(result.current.products).toEqual(newProducts);
    });

    it('filtreleri temizlemeli', async () => {
      const { result } = renderHook(() => useInventory());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.filterByCategory('Elektronik');
      });

      expect(result.current.filteredProducts).toHaveLength(1);

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.filteredProducts).toEqual(mockProducts);
    });
  });
});
