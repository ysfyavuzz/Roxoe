import React from "react";
import type { ProductStats } from "../../types/product";
import type { CashRegisterSession } from "../../services/cashRegisterDB";
import OverviewSummaryCards from "./overview/OverviewSummaryCards";
import SalesTrendChart from "./overview/SalesTrendChart";
import CategoryDistributionPie from "./overview/CategoryDistributionPie";
import LastClosedSessionCard from "./overview/LastClosedSessionCard";
import TopProductsTable from "./overview/TopProductsTable";

interface OverviewTabProps {
  totalSales: number;
  totalRevenue: number;
  netProfit: number;
  profitMargin: number;
  dailySalesData: Array<{
    date: string;
    total: number;
    profit: number;
    count: number;
  }>;
  categoryData: Array<{
    name: string;
    revenue: number;
    profit: number;
    quantity: number;
  }>;
  productStats: ProductStats[];
  lastClosedSession: CashRegisterSession | null;
  isLoading: boolean;
  formatDate: (date: Date | string | undefined) => string;
  setCurrentTab: (tab: "overview" | "cash" | "sales" | "products") => void;
  period: "day" | "week" | "month" | "year" | "custom";
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  totalSales,
  totalRevenue,
  netProfit,
  profitMargin,
  dailySalesData,
  categoryData,
  productStats,
  lastClosedSession,
  isLoading,
  formatDate,
  setCurrentTab,
  period,
}) => {
  return (
    <div className="space-y-3">
      <OverviewSummaryCards
        totalSales={totalSales}
        totalRevenue={totalRevenue}
        netProfit={netProfit}
        profitMargin={profitMargin}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesTrendChart dailySalesData={dailySalesData} period={period} />
        <CategoryDistributionPie categoryData={categoryData} />
      </div>

      <LastClosedSessionCard
        lastClosedSession={lastClosedSession}
        formatDate={formatDate}
      />

      <TopProductsTable
        productStats={productStats}
        isLoading={isLoading}
        onSeeAll={() => setCurrentTab("products")}
      />
    </div>
  );
};

export default OverviewTab;
