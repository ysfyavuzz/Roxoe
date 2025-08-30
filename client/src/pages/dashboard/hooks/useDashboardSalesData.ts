import { useMemo } from "react";

import { useSales } from "../../../hooks/useSales";
import type { Sale } from "../../../types/sales";
import { calculateStatsForDashboard, type DashboardStats } from "../../../utils/dashboardStats";

export type DashboardPeriod = "day" | "week" | "month" | "year" | "custom";

interface UseDashboardSalesDataReturn extends Pick<
  DashboardStats,
  | "totalSales"
  | "totalRevenue"
  | "netProfit"
  | "profitMargin"
  | "averageBasket"
  | "cancelRate"
  | "refundRate"
  | "dailySalesData"
  | "categoryData"
  | "productStats"
> {
  sales: Sale[];
  filteredSales: Sale[];
  salesLoading: boolean;
}

/**
 * Dashboard satış verilerini yönetir:
 * - useSales ile satışları getirir (polling opsiyonel)
 * - Tarih aralığına göre filtreler
 * - calculateStatsForDashboard ile istatistikleri üretir
 */
export function useDashboardSalesData(
  startDate: Date,
  endDate: Date,
  period: DashboardPeriod,
  pollIntervalMs: number = 30000
): UseDashboardSalesDataReturn {
  const { sales, loading: salesLoading } = useSales(pollIntervalMs);

  const filteredSales = useMemo(() => {
    const startDateTime = new Date(startDate);
    startDateTime.setHours(0, 0, 0, 0);

    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999);

    return sales.filter((sale) => {
      const saleDate = new Date(sale.date);
      return saleDate >= startDateTime && saleDate <= endDateTime;
    });
  }, [sales, startDate, endDate]);

  const stats = useMemo(() => {
    return calculateStatsForDashboard(filteredSales, period === "day");
  }, [filteredSales, period]);

  return {
    sales,
    filteredSales,
    salesLoading,
    totalSales: stats.totalSales,
    totalRevenue: stats.totalRevenue,
    netProfit: stats.netProfit,
    profitMargin: stats.profitMargin,
    averageBasket: stats.averageBasket,
    cancelRate: stats.cancelRate,
    refundRate: stats.refundRate,
    dailySalesData: stats.dailySalesData,
    categoryData: stats.categoryData,
    productStats: stats.productStats,
  };
}

