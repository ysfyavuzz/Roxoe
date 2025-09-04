/**
 * Dashboard Stats Utility Tests
 * Dashboard istatistik hesaplamaları için testler
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  calculateDailyStats,
  calculateWeeklyStats,
  calculateMonthlyStats,
  calculateProductStats,
  calculateCustomerStats,
  calculateCashFlowStats,
  calculateProfitStats,
  formatStatsForChart,
  getTopSellingProducts,
  getTopCustomers,
  calculateGrowthRate,
  calculateAverageBasketSize,
  getPeakSalesHours,
  calculateStockTurnover,
  generateSummaryReport
} from '../dashboardStats';

describe('Dashboard Stats', () => {
  const mockSales = [
    {
      id: 1,
      total: 1000,
      items: [
        { productId: 1, quantity: 2, price: 100, cost: 60 },
        { productId: 2, quantity: 1, price: 800, cost: 500 }
      ],
      customerId: 1,
      date: new Date('2024-01-15T10:30:00'),
      paymentMethod: 'cash'
    },
    {
      id: 2,
      total: 500,
      items: [
        { productId: 1, quantity: 1, price: 100, cost: 60 },
        { productId: 3, quantity: 2, price: 200, cost: 120 }
      ],
      customerId: 2,
      date: new Date('2024-01-15T14:30:00'),
      paymentMethod: 'card'
    },
    {
      id: 3,
      total: 750,
      items: [
        { productId: 2, quantity: 1, price: 750, cost: 450 }
      ],
      customerId: 1,
      date: new Date('2024-01-14T16:00:00'),
      paymentMethod: 'cash'
    }
  ];

  const mockProducts = [
    { id: 1, name: 'Ürün 1', stock: 50, category: 'Elektronik', price: 100 },
    { id: 2, name: 'Ürün 2', stock: 20, category: 'Giyim', price: 800 },
    { id: 3, name: 'Ürün 3', stock: 100, category: 'Gıda', price: 200 }
  ];

  const mockCustomers = [
    { id: 1, name: 'Müşteri 1', totalPurchases: 1750, lastVisit: new Date('2024-01-15') },
    { id: 2, name: 'Müşteri 2', totalPurchases: 500, lastVisit: new Date('2024-01-15') }
  ];

  describe('calculateDailyStats', () => {
    it('günlük istatistikleri doğru hesaplamalı', () => {
      const stats = calculateDailyStats(mockSales, new Date('2024-01-15'));
      
      expect(stats.totalSales).toBe(1500); // İlk iki satış
      expect(stats.transactionCount).toBe(2);
      expect(stats.averageSale).toBe(750);
      expect(stats.cashSales).toBe(1000);
      expect(stats.cardSales).toBe(500);
    });

    it('satış olmayan gün için sıfır dönmeli', () => {
      const stats = calculateDailyStats(mockSales, new Date('2024-01-20'));
      
      expect(stats.totalSales).toBe(0);
      expect(stats.transactionCount).toBe(0);
      expect(stats.averageSale).toBe(0);
    });
  });

  describe('calculateWeeklyStats', () => {
    it('haftalık istatistikleri doğru hesaplamalı', () => {
      const stats = calculateWeeklyStats(mockSales, new Date('2024-01-15'));
      
      expect(stats.totalSales).toBe(2250); // Tüm satışlar aynı hafta
      expect(stats.transactionCount).toBe(3);
      expect(stats.dailyAverage).toBeCloseTo(321.43, 2); // 2250 / 7
      expect(stats.peakDay).toBeDefined();
    });
  });

  describe('calculateMonthlyStats', () => {
    it('aylık istatistikleri doğru hesaplamalı', () => {
      const stats = calculateMonthlyStats(mockSales, new Date('2024-01-15'));
      
      expect(stats.totalSales).toBe(2250);
      expect(stats.transactionCount).toBe(3);
      expect(stats.dailyAverage).toBeCloseTo(72.58, 2); // 2250 / 31 (Ocak)
      expect(stats.weeklyBreakdown).toBeDefined();
      expect(stats.weeklyBreakdown).toHaveLength(5); // Ocak'ta 5 hafta
    });
  });

  describe('calculateProductStats', () => {
    it('ürün istatistiklerini doğru hesaplamalı', () => {
      const stats = calculateProductStats(mockSales, mockProducts);
      
      expect(stats.topSelling).toBeDefined();
      expect(stats.topSelling[0].productId).toBe(2); // En çok satan
      expect(stats.topSelling[0].quantity).toBe(2);
      expect(stats.topSelling[0].revenue).toBe(1550);
      
      expect(stats.categoryBreakdown).toBeDefined();
      expect(stats.stockValue).toBe(33000); // (50*100 + 20*800 + 100*200)
      expect(stats.lowStockCount).toBe(1); // Ürün 2
    });
  });

  describe('calculateCustomerStats', () => {
    it('müşteri istatistiklerini doğru hesaplamalı', () => {
      const stats = calculateCustomerStats(mockSales, mockCustomers);
      
      expect(stats.newCustomers).toBe(0); // Mock'ta yeni müşteri yok
      expect(stats.returningCustomers).toBe(2);
      expect(stats.averagePurchaseValue).toBe(750);
      expect(stats.topCustomers).toBeDefined();
      expect(stats.topCustomers[0].customerId).toBe(1); // En çok alışveriş yapan
    });
  });

  describe('calculateCashFlowStats', () => {
    it('nakit akış istatistiklerini doğru hesaplamalı', () => {
      const stats = calculateCashFlowStats(mockSales);
      
      expect(stats.totalIncome).toBe(2250);
      expect(stats.cashIncome).toBe(1750);
      expect(stats.cardIncome).toBe(500);
      expect(stats.creditIncome).toBe(0);
      expect(stats.expenses).toBe(0); // Mock'ta gider yok
      expect(stats.netCashFlow).toBe(2250);
    });
  });

  describe('calculateProfitStats', () => {
    it('kar istatistiklerini doğru hesaplamalı', () => {
      const stats = calculateProfitStats(mockSales);
      
      expect(stats.totalRevenue).toBe(2250);
      expect(stats.totalCost).toBe(1370); // Toplam maliyet
      expect(stats.grossProfit).toBe(880);
      expect(stats.profitMargin).toBeCloseTo(39.11, 2); // %39.11
      expect(stats.averageMargin).toBeCloseTo(39.11, 2);
    });
  });

  describe('formatStatsForChart', () => {
    it('chart için veriyi formatlamalı', () => {
      const data = [
        { date: '2024-01-15', value: 1500 },
        { date: '2024-01-14', value: 750 }
      ];
      
      const formatted = formatStatsForChart(data, 'daily');
      
      expect(formatted).toHaveLength(2);
      expect(formatted[0].label).toBeDefined();
      expect(formatted[0].value).toBe(1500);
    });
  });

  describe('getTopSellingProducts', () => {
    it('en çok satan ürünleri getirmeli', () => {
      const topProducts = getTopSellingProducts(mockSales, mockProducts, 2);
      
      expect(topProducts).toHaveLength(2);
      expect(topProducts[0].product.id).toBe(2);
      expect(topProducts[0].quantity).toBe(2);
      expect(topProducts[1].product.id).toBe(1);
      expect(topProducts[1].quantity).toBe(3);
    });
  });

  describe('getTopCustomers', () => {
    it('en iyi müşterileri getirmeli', () => {
      const topCustomers = getTopCustomers(mockSales, mockCustomers, 2);
      
      expect(topCustomers).toHaveLength(2);
      expect(topCustomers[0].customer.id).toBe(1);
      expect(topCustomers[0].totalPurchases).toBe(1750);
    });
  });

  describe('calculateGrowthRate', () => {
    it('büyüme oranını doğru hesaplamalı', () => {
      const rate = calculateGrowthRate(1000, 1200);
      expect(rate).toBe(20); // %20 artış

      const negativeRate = calculateGrowthRate(1200, 1000);
      expect(negativeRate).toBe(-16.67); // %16.67 düşüş
    });

    it('önceki değer 0 ise 0 dönmeli', () => {
      const rate = calculateGrowthRate(0, 1000);
      expect(rate).toBe(0);
    });
  });

  describe('calculateAverageBasketSize', () => {
    it('ortalama sepet büyüklüğünü hesaplamalı', () => {
      const avgBasket = calculateAverageBasketSize(mockSales);
      
      expect(avgBasket.averageItemCount).toBeCloseTo(1.67, 2); // 5 ürün / 3 satış
      expect(avgBasket.averageValue).toBe(750);
    });
  });

  describe('getPeakSalesHours', () => {
    it('en yoğun satış saatlerini bulmalı', () => {
      const peakHours = getPeakSalesHours(mockSales);
      
      expect(peakHours).toBeDefined();
      expect(peakHours).toContain(10); // 10:30
      expect(peakHours).toContain(14); // 14:30
      expect(peakHours).toContain(16); // 16:00
    });
  });

  describe('calculateStockTurnover', () => {
    it('stok devir hızını hesaplamalı', () => {
      const turnover = calculateStockTurnover(mockSales, mockProducts);
      
      expect(turnover.turnoverRate).toBeDefined();
      expect(turnover.daysInventory).toBeDefined();
      expect(turnover.productTurnover).toBeDefined();
    });
  });

  describe('generateSummaryReport', () => {
    it('özet rapor oluşturmalı', () => {
      const report = generateSummaryReport(mockSales, mockProducts, mockCustomers);
      
      expect(report).toBeDefined();
      expect(report.period).toBeDefined();
      expect(report.salesSummary).toBeDefined();
      expect(report.productSummary).toBeDefined();
      expect(report.customerSummary).toBeDefined();
      expect(report.financialSummary).toBeDefined();
      expect(report.insights).toBeDefined();
    });

    it('insight\'lar üretmeli', () => {
      const report = generateSummaryReport(mockSales, mockProducts, mockCustomers);
      
      expect(report.insights).toBeInstanceOf(Array);
      expect(report.insights.length).toBeGreaterThan(0);
    });
  });
});
