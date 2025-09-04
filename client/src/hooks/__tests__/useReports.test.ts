/**
 * useReports Hook Unit Tests
 * Raporlama yönetimi hook'u için kapsamlı test senaryoları
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useReports } from '../useReports';
import * as salesDB from '../../services/salesDB';
import * as productDB from '../../services/productDB';
import * as customerDB from '../../services/customerDB';
import * as reportService from '../../services/reportService';
import { toast } from 'react-hot-toast';

// Mock dependencies
vi.mock('../../services/salesDB');
vi.mock('../../services/productDB');
vi.mock('../../services/customerDB');
vi.mock('../../services/reportService');
vi.mock('react-hot-toast');

describe('useReports Hook', () => {
  const mockSalesData = [
    {
      id: 1,
      date: '2025-01-20',
      total: 500,
      tax: 90,
      discount: 10,
      paymentMethod: 'cash',
      customerId: 1,
      items: [
        { productId: 1, quantity: 2, price: 200, total: 400 },
        { productId: 2, quantity: 1, price: 100, total: 100 }
      ]
    },
    {
      id: 2,
      date: '2025-01-20',
      total: 750,
      tax: 135,
      discount: 0,
      paymentMethod: 'credit_card',
      customerId: 2,
      items: [
        { productId: 3, quantity: 3, price: 250, total: 750 }
      ]
    },
    {
      id: 3,
      date: '2025-01-19',
      total: 300,
      tax: 54,
      discount: 5,
      paymentMethod: 'credit',
      customerId: 3,
      items: [
        { productId: 1, quantity: 1, price: 300, total: 300 }
      ]
    }
  ];

  const mockProductData = [
    { id: 1, name: 'Ürün 1', category: 'Elektronik', stock: 50, sold: 100 },
    { id: 2, name: 'Ürün 2', category: 'Gıda', stock: 30, sold: 75 },
    { id: 3, name: 'Ürün 3', category: 'Temizlik', stock: 20, sold: 50 }
  ];

  const mockCustomerData = [
    { id: 1, name: 'Ali Veli', totalPurchases: 5000, totalDebt: 500 },
    { id: 2, name: 'Ayşe Fatma', totalPurchases: 3000, totalDebt: 0 },
    { id: 3, name: 'Mehmet Yılmaz', totalPurchases: 2000, totalDebt: 1000 }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(salesDB.getSales).mockResolvedValue(mockSalesData);
    vi.mocked(productDB.getProducts).mockResolvedValue(mockProductData);
    vi.mocked(customerDB.getCustomers).mockResolvedValue(mockCustomerData);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('daily reports', () => {
    it('günlük satış raporunu oluşturmalı', async () => {
      const { result } = renderHook(() => useReports());

      const dailyReport = await result.current.getDailyReport('2025-01-20');

      expect(dailyReport).toMatchObject({
        date: '2025-01-20',
        totalSales: 2,
        totalRevenue: 1250,
        totalTax: 225,
        totalDiscount: 10,
        netRevenue: expect.any(Number),
        averageSale: 625,
        paymentBreakdown: {
          cash: 500,
          credit_card: 750,
          credit: 0
        },
        topProducts: expect.any(Array),
        hourlyBreakdown: expect.any(Array)
      });
    });

    it('günlük kar raporunu hesaplamalı', async () => {
      const { result } = renderHook(() => useReports());

      const profitReport = await result.current.getDailyProfitReport('2025-01-20');

      expect(profitReport).toMatchObject({
        date: '2025-01-20',
        totalRevenue: 1250,
        totalCost: expect.any(Number),
        grossProfit: expect.any(Number),
        netProfit: expect.any(Number),
        profitMargin: expect.any(Number),
        productProfits: expect.any(Array)
      });
    });

    it('günlük kasa raporunu oluşturmalı', async () => {
      const { result } = renderHook(() => useReports());

      const cashReport = await result.current.getDailyCashReport('2025-01-20');

      expect(cashReport).toMatchObject({
        date: '2025-01-20',
        openingBalance: expect.any(Number),
        cashIn: 500,
        cashOut: 0,
        closingBalance: expect.any(Number),
        cashTransactions: expect.any(Array)
      });
    });
  });

  describe('weekly reports', () => {
    it('haftalık satış raporunu oluşturmalı', async () => {
      const { result } = renderHook(() => useReports());

      const weeklyReport = await result.current.getWeeklyReport('2025-01-14', '2025-01-20');

      expect(weeklyReport).toMatchObject({
        startDate: '2025-01-14',
        endDate: '2025-01-20',
        totalSales: expect.any(Number),
        totalRevenue: expect.any(Number),
        dailyAverage: expect.any(Number),
        weekOverWeekGrowth: expect.any(Number),
        dailyBreakdown: expect.any(Array),
        bestDay: expect.any(Object),
        worstDay: expect.any(Object)
      });
    });

    it('haftalık trend analizini yapmalı', async () => {
      const { result } = renderHook(() => useReports());

      const trendAnalysis = await result.current.getWeeklyTrendAnalysis('2025-01-14', '2025-01-20');

      expect(trendAnalysis).toMatchObject({
        salesTrend: expect.any(String), // 'increasing', 'decreasing', 'stable'
        revenueTrend: expect.any(String),
        averageGrowth: expect.any(Number),
        peakDays: expect.any(Array),
        lowDays: expect.any(Array)
      });
    });
  });

  describe('monthly reports', () => {
    it('aylık satış raporunu oluşturmalı', async () => {
      const { result } = renderHook(() => useReports());

      const monthlyReport = await result.current.getMonthlyReport('2025-01');

      expect(monthlyReport).toMatchObject({
        month: '2025-01',
        totalSales: expect.any(Number),
        totalRevenue: expect.any(Number),
        totalProfit: expect.any(Number),
        dailyAverage: expect.any(Number),
        weeklyBreakdown: expect.any(Array),
        categoryBreakdown: expect.any(Array),
        topProducts: expect.any(Array),
        topCustomers: expect.any(Array)
      });
    });

    it('aylık karşılaştırma raporu oluşturmalı', async () => {
      const { result } = renderHook(() => useReports());

      const comparison = await result.current.getMonthlyComparison('2025-01', '2024-12');

      expect(comparison).toMatchObject({
        currentMonth: '2025-01',
        previousMonth: '2024-12',
        salesGrowth: expect.any(Number),
        revenueGrowth: expect.any(Number),
        customerGrowth: expect.any(Number),
        productPerformance: expect.any(Array)
      });
    });

    it('aylık KPI raporunu oluşturmalı', async () => {
      const { result } = renderHook(() => useReports());

      const kpiReport = await result.current.getMonthlyKPIs('2025-01');

      expect(kpiReport).toMatchObject({
        month: '2025-01',
        salesTarget: expect.any(Number),
        actualSales: expect.any(Number),
        targetAchievement: expect.any(Number),
        customerRetention: expect.any(Number),
        averageBasketSize: expect.any(Number),
        conversionRate: expect.any(Number),
        inventoryTurnover: expect.any(Number)
      });
    });
  });

  describe('product reports', () => {
    it('ürün satış raporunu oluşturmalı', async () => {
      const { result } = renderHook(() => useReports());

      const productReport = await result.current.getProductSalesReport(1, '2025-01-01', '2025-01-31');

      expect(productReport).toMatchObject({
        productId: 1,
        productName: 'Ürün 1',
        period: { start: '2025-01-01', end: '2025-01-31' },
        totalQuantitySold: expect.any(Number),
        totalRevenue: expect.any(Number),
        averagePrice: expect.any(Number),
        salesFrequency: expect.any(Number),
        dailySales: expect.any(Array)
      });
    });

    it('en çok satan ürünleri getirmeli', async () => {
      const { result } = renderHook(() => useReports());

      const topProducts = await result.current.getTopSellingProducts(5, '2025-01-01', '2025-01-31');

      expect(topProducts).toBeInstanceOf(Array);
      expect(topProducts.length).toBeLessThanOrEqual(5);
      if (topProducts.length > 0) {
        expect(topProducts[0]).toMatchObject({
          productId: expect.any(Number),
          productName: expect.any(String),
          totalQuantity: expect.any(Number),
          totalRevenue: expect.any(Number),
          rank: 1
        });
      }
    });

    it('kategori bazlı satış raporunu oluşturmalı', async () => {
      const { result } = renderHook(() => useReports());

      const categoryReport = await result.current.getCategorySalesReport('Elektronik', '2025-01');

      expect(categoryReport).toMatchObject({
        category: 'Elektronik',
        period: '2025-01',
        totalProducts: expect.any(Number),
        totalQuantitySold: expect.any(Number),
        totalRevenue: expect.any(Number),
        topProducts: expect.any(Array),
        salesDistribution: expect.any(Array)
      });
    });

    it('yavaş satan ürünleri tespit etmeli', async () => {
      const { result } = renderHook(() => useReports());

      const slowMovers = await result.current.getSlowMovingProducts(30); // Son 30 gün

      expect(slowMovers).toBeInstanceOf(Array);
      slowMovers.forEach(product => {
        expect(product).toMatchObject({
          productId: expect.any(Number),
          productName: expect.any(String),
          daysWithoutSale: expect.any(Number),
          lastSaleDate: expect.any(String),
          currentStock: expect.any(Number)
        });
      });
    });
  });

  describe('customer reports', () => {
    it('müşteri satış raporunu oluşturmalı', async () => {
      const { result } = renderHook(() => useReports());

      const customerReport = await result.current.getCustomerReport(1, '2025-01');

      expect(customerReport).toMatchObject({
        customerId: 1,
        customerName: 'Ali Veli',
        period: '2025-01',
        totalPurchases: expect.any(Number),
        totalAmount: expect.any(Number),
        averagePurchase: expect.any(Number),
        purchaseFrequency: expect.any(Number),
        favoriteProducts: expect.any(Array),
        paymentHistory: expect.any(Array)
      });
    });

    it('en iyi müşterileri getirmeli', async () => {
      const { result } = renderHook(() => useReports());

      const topCustomers = await result.current.getTopCustomers(10, '2025-01');

      expect(topCustomers).toBeInstanceOf(Array);
      expect(topCustomers.length).toBeLessThanOrEqual(10);
      if (topCustomers.length > 0) {
        expect(topCustomers[0]).toMatchObject({
          customerId: expect.any(Number),
          customerName: expect.any(String),
          totalPurchases: expect.any(Number),
          totalAmount: expect.any(Number),
          rank: 1
        });
      }
    });

    it('müşteri borç raporunu oluşturmalı', async () => {
      const { result } = renderHook(() => useReports());

      const debtReport = await result.current.getCustomerDebtReport();

      expect(debtReport).toMatchObject({
        totalDebt: expect.any(Number),
        totalDebtors: expect.any(Number),
        averageDebt: expect.any(Number),
        overdueDebts: expect.any(Array),
        debtAging: expect.any(Array),
        highRiskCustomers: expect.any(Array)
      });
    });

    it('müşteri segmentasyon analizini yapmalı', async () => {
      const { result } = renderHook(() => useReports());

      const segmentation = await result.current.getCustomerSegmentation();

      expect(segmentation).toMatchObject({
        vipCustomers: expect.any(Array),
        regularCustomers: expect.any(Array),
        occasionalCustomers: expect.any(Array),
        inactiveCustomers: expect.any(Array),
        segmentMetrics: expect.any(Object)
      });
    });
  });

  describe('financial reports', () => {
    it('gelir gider raporunu oluşturmalı', async () => {
      const { result } = renderHook(() => useReports());

      const incomeReport = await result.current.getIncomeStatement('2025-01');

      expect(incomeReport).toMatchObject({
        period: '2025-01',
        revenue: {
          grossSales: expect.any(Number),
          returns: expect.any(Number),
          discounts: expect.any(Number),
          netSales: expect.any(Number)
        },
        costs: {
          costOfGoodsSold: expect.any(Number),
          operatingExpenses: expect.any(Number),
          otherExpenses: expect.any(Number)
        },
        profit: {
          grossProfit: expect.any(Number),
          operatingProfit: expect.any(Number),
          netProfit: expect.any(Number)
        },
        margins: {
          grossMargin: expect.any(Number),
          operatingMargin: expect.any(Number),
          netMargin: expect.any(Number)
        }
      });
    });

    it('nakit akış raporunu oluşturmalı', async () => {
      const { result } = renderHook(() => useReports());

      const cashFlow = await result.current.getCashFlowReport('2025-01');

      expect(cashFlow).toMatchObject({
        period: '2025-01',
        openingBalance: expect.any(Number),
        cashInflows: {
          cashSales: expect.any(Number),
          creditPayments: expect.any(Number),
          otherIncome: expect.any(Number),
          total: expect.any(Number)
        },
        cashOutflows: {
          purchases: expect.any(Number),
          expenses: expect.any(Number),
          otherPayments: expect.any(Number),
          total: expect.any(Number)
        },
        netCashFlow: expect.any(Number),
        closingBalance: expect.any(Number)
      });
    });

    it('vergi raporunu oluşturmalı', async () => {
      const { result } = renderHook(() => useReports());

      const taxReport = await result.current.getTaxReport('2025-01');

      expect(taxReport).toMatchObject({
        period: '2025-01',
        totalSales: expect.any(Number),
        taxableSales: expect.any(Number),
        taxExemptSales: expect.any(Number),
        totalTaxCollected: expect.any(Number),
        taxByRate: expect.any(Array),
        taxByCategory: expect.any(Array)
      });
    });
  });

  describe('inventory reports', () => {
    it('stok değerleme raporunu oluşturmalı', async () => {
      const { result } = renderHook(() => useReports());

      const inventoryReport = await result.current.getInventoryValuationReport();

      expect(inventoryReport).toMatchObject({
        date: expect.any(String),
        totalProducts: expect.any(Number),
        totalQuantity: expect.any(Number),
        totalValue: expect.any(Number),
        categoryBreakdown: expect.any(Array),
        topValueProducts: expect.any(Array),
        lowStockProducts: expect.any(Array),
        outOfStockProducts: expect.any(Array)
      });
    });

    it('stok hareket raporunu oluşturmalı', async () => {
      const { result } = renderHook(() => useReports());

      const movementReport = await result.current.getInventoryMovementReport('2025-01');

      expect(movementReport).toMatchObject({
        period: '2025-01',
        openingStock: expect.any(Number),
        purchases: expect.any(Number),
        sales: expect.any(Number),
        adjustments: expect.any(Number),
        closingStock: expect.any(Number),
        stockTurnover: expect.any(Number),
        movementDetails: expect.any(Array)
      });
    });

    it('stok yaşlandırma raporunu oluşturmalı', async () => {
      const { result } = renderHook(() => useReports());

      const agingReport = await result.current.getInventoryAgingReport();

      expect(agingReport).toMatchObject({
        date: expect.any(String),
        agingBrackets: [
          { range: '0-30 gün', count: expect.any(Number), value: expect.any(Number) },
          { range: '31-60 gün', count: expect.any(Number), value: expect.any(Number) },
          { range: '61-90 gün', count: expect.any(Number), value: expect.any(Number) },
          { range: '90+ gün', count: expect.any(Number), value: expect.any(Number) }
        ],
        obsoleteItems: expect.any(Array),
        recommendations: expect.any(Array)
      });
    });
  });

  describe('comparison reports', () => {
    it('dönemsel karşılaştırma raporu oluşturmalı', async () => {
      const { result } = renderHook(() => useReports());

      const comparison = await result.current.getPeriodComparison(
        '2025-01-01', '2025-01-15',
        '2025-01-16', '2025-01-31'
      );

      expect(comparison).toMatchObject({
        period1: { start: '2025-01-01', end: '2025-01-15' },
        period2: { start: '2025-01-16', end: '2025-01-31' },
        salesComparison: {
          period1Total: expect.any(Number),
          period2Total: expect.any(Number),
          growth: expect.any(Number),
          growthPercentage: expect.any(Number)
        },
        revenueComparison: expect.any(Object),
        productComparison: expect.any(Array),
        customerComparison: expect.any(Object)
      });
    });

    it('yıllık karşılaştırma raporu oluşturmalı', async () => {
      const { result } = renderHook(() => useReports());

      const yearComparison = await result.current.getYearOverYearComparison('2025', '2024');

      expect(yearComparison).toMatchObject({
        currentYear: '2025',
        previousYear: '2024',
        annualGrowth: expect.any(Number),
        quarterlyComparison: expect.any(Array),
        monthlyTrends: expect.any(Array),
        categoryPerformance: expect.any(Array)
      });
    });
  });

  describe('export functionality', () => {
    it('raporu PDF olarak export etmeli', async () => {
      const { result } = renderHook(() => useReports());

      const mockPdfData = 'PDF_BINARY_DATA';
      vi.mocked(reportService.exportToPDF).mockResolvedValueOnce(mockPdfData);

      const dailyReport = await result.current.getDailyReport('2025-01-20');
      const pdfData = await result.current.exportReportToPDF(dailyReport, 'daily-report');

      expect(pdfData).toBe(mockPdfData);
      expect(reportService.exportToPDF).toHaveBeenCalledWith(dailyReport, 'daily-report');
      expect(toast.success).toHaveBeenCalledWith('Rapor PDF olarak hazırlandı');
    });

    it('raporu Excel olarak export etmeli', async () => {
      const { result } = renderHook(() => useReports());

      const mockExcelData = 'EXCEL_BINARY_DATA';
      vi.mocked(reportService.exportToExcel).mockResolvedValueOnce(mockExcelData);

      const monthlyReport = await result.current.getMonthlyReport('2025-01');
      const excelData = await result.current.exportReportToExcel(monthlyReport, 'monthly-report');

      expect(excelData).toBe(mockExcelData);
      expect(reportService.exportToExcel).toHaveBeenCalledWith(monthlyReport, 'monthly-report');
      expect(toast.success).toHaveBeenCalledWith('Rapor Excel olarak hazırlandı');
    });

    it('raporu CSV olarak export etmeli', async () => {
      const { result } = renderHook(() => useReports());

      const mockCsvData = 'CSV_DATA';
      vi.mocked(reportService.exportToCSV).mockResolvedValueOnce(mockCsvData);

      const productReport = await result.current.getTopSellingProducts(10, '2025-01-01', '2025-01-31');
      const csvData = await result.current.exportReportToCSV(productReport, 'top-products');

      expect(csvData).toBe(mockCsvData);
      expect(reportService.exportToCSV).toHaveBeenCalledWith(productReport, 'top-products');
    });
  });

  describe('scheduled reports', () => {
    it('zamanlanmış rapor oluşturmalı', async () => {
      const { result } = renderHook(() => useReports());

      const schedule = {
        reportType: 'daily',
        frequency: 'daily',
        time: '09:00',
        recipients: ['admin@example.com'],
        format: 'pdf'
      };

      const scheduledReport = await result.current.scheduleReport(schedule);

      expect(scheduledReport).toMatchObject({
        id: expect.any(String),
        ...schedule,
        status: 'active',
        nextRun: expect.any(String)
      });

      expect(toast.success).toHaveBeenCalledWith('Rapor zamanlaması oluşturuldu');
    });

    it('zamanlanmış raporları listemeli', async () => {
      const { result } = renderHook(() => useReports());

      const mockSchedules = [
        { id: '1', reportType: 'daily', frequency: 'daily', status: 'active' },
        { id: '2', reportType: 'monthly', frequency: 'monthly', status: 'active' }
      ];

      vi.mocked(reportService.getScheduledReports).mockResolvedValueOnce(mockSchedules);

      const schedules = await result.current.getScheduledReports();

      expect(schedules).toEqual(mockSchedules);
    });
  });

  describe('dashboard metrics', () => {
    it('dashboard metrikleri hesaplamalı', async () => {
      const { result } = renderHook(() => useReports());

      const metrics = await result.current.getDashboardMetrics();

      expect(metrics).toMatchObject({
        todaySales: expect.any(Number),
        todayRevenue: expect.any(Number),
        todayProfit: expect.any(Number),
        todayCustomers: expect.any(Number),
        weekGrowth: expect.any(Number),
        monthGrowth: expect.any(Number),
        topSellingProduct: expect.any(Object),
        lowStockAlert: expect.any(Number),
        pendingOrders: expect.any(Number),
        outstandingDebts: expect.any(Number)
      });
    });

    it('gerçek zamanlı metrikleri güncellemeli', async () => {
      const { result } = renderHook(() => useReports());

      // İlk metrikleri al
      const initialMetrics = await result.current.getDashboardMetrics();

      // Yeni satış simüle et
      const newSale = {
        id: 4,
        date: new Date().toISOString().split('T')[0],
        total: 200
      };
      mockSalesData.push(newSale);

      // Metrikleri yenile
      await act(async () => {
        await result.current.refreshMetrics();
      });

      const updatedMetrics = await result.current.getDashboardMetrics();

      expect(updatedMetrics.todaySales).toBeGreaterThan(initialMetrics.todaySales);
    });
  });

  describe('custom reports', () => {
    it('özel rapor oluşturmalı', async () => {
      const { result } = renderHook(() => useReports());

      const customQuery = {
        name: 'Özel Satış Raporu',
        dateRange: { start: '2025-01-01', end: '2025-01-31' },
        metrics: ['totalSales', 'totalRevenue', 'averageBasket'],
        dimensions: ['date', 'category', 'paymentMethod'],
        filters: {
          minAmount: 100,
          categories: ['Elektronik', 'Gıda']
        }
      };

      const customReport = await result.current.createCustomReport(customQuery);

      expect(customReport).toMatchObject({
        name: 'Özel Satış Raporu',
        data: expect.any(Array),
        summary: expect.any(Object),
        charts: expect.any(Array)
      });
    });

    it('rapor şablonu kaydetmeli', async () => {
      const { result } = renderHook(() => useReports());

      const template = {
        name: 'Aylık Özet Şablonu',
        reportType: 'monthly',
        includedSections: ['sales', 'products', 'customers', 'financial'],
        format: 'pdf'
      };

      const savedTemplate = await result.current.saveReportTemplate(template);

      expect(savedTemplate).toMatchObject({
        id: expect.any(String),
        ...template,
        createdAt: expect.any(String)
      });

      expect(toast.success).toHaveBeenCalledWith('Rapor şablonu kaydedildi');
    });
  });

  describe('error handling', () => {
    it('veri yokken hata vermeli', async () => {
      const { result } = renderHook(() => useReports());

      vi.mocked(salesDB.getSales).mockResolvedValueOnce([]);

      const report = await result.current.getDailyReport('2025-01-20');

      expect(report).toMatchObject({
        date: '2025-01-20',
        totalSales: 0,
        totalRevenue: 0,
        message: 'Bu tarih için veri bulunamadı'
      });
    });

    it('geçersiz tarih formatında hata vermeli', async () => {
      const { result } = renderHook(() => useReports());

      await expect(
        result.current.getDailyReport('invalid-date')
      ).rejects.toThrow('Geçersiz tarih formatı');

      expect(toast.error).toHaveBeenCalledWith('Geçersiz tarih formatı');
    });

    it('export hatalarını yönetmeli', async () => {
      const { result } = renderHook(() => useReports());

      vi.mocked(reportService.exportToPDF).mockRejectedValueOnce(
        new Error('PDF oluşturma hatası')
      );

      const report = { data: 'test' };
      
      await expect(
        result.current.exportReportToPDF(report, 'test')
      ).rejects.toThrow('PDF oluşturma hatası');

      expect(toast.error).toHaveBeenCalledWith('Rapor export edilemedi');
    });
  });

  describe('performance optimization', () => {
    it('büyük veri setlerini sayfalandırmalı', async () => {
      const { result } = renderHook(() => useReports());

      // 1000 satışlık büyük veri seti
      const largeSalesData = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        date: '2025-01-20',
        total: Math.random() * 1000
      }));

      vi.mocked(salesDB.getSales).mockResolvedValueOnce(largeSalesData);

      const report = await result.current.getDailyReport('2025-01-20', { 
        pageSize: 100,
        page: 1 
      });

      expect(report.data).toHaveLength(100);
      expect(report.totalPages).toBe(10);
      expect(report.currentPage).toBe(1);
    });

    it('rapor verilerini önbelleğe almalı', async () => {
      const { result } = renderHook(() => useReports());

      // İlk çağrı - veritabanından
      const report1 = await result.current.getDailyReport('2025-01-20');
      expect(salesDB.getSales).toHaveBeenCalledTimes(1);

      // İkinci çağrı - önbellekten
      const report2 = await result.current.getDailyReport('2025-01-20');
      expect(salesDB.getSales).toHaveBeenCalledTimes(1); // Hala 1
      
      expect(report1).toEqual(report2);
    });

    it('önbelleği temizleyebilmeli', async () => {
      const { result } = renderHook(() => useReports());

      await result.current.getDailyReport('2025-01-20');
      
      act(() => {
        result.current.clearCache();
      });

      await result.current.getDailyReport('2025-01-20');
      expect(salesDB.getSales).toHaveBeenCalledTimes(2);
    });
  });
});
