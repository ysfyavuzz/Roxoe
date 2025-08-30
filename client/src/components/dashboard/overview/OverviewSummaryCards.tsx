import React from "react";

import Card from "../../ui/Card";

interface OverviewSummaryCardsProps {
  totalSales: number;
  totalRevenue: number;
  netProfit: number;
  profitMargin: number;
}

const OverviewSummaryCards: React.FC<OverviewSummaryCardsProps> = ({ totalSales, totalRevenue, netProfit, profitMargin }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card variant="summary" title="Toplam Satış" value={totalSales} description="Toplam satış adedi" color="blue" />
      <Card variant="summary" title="Brüt Ciro" value={`₺${totalRevenue.toFixed(2)}`} description="Toplam gelir" color="indigo" />
      <Card variant="summary" title="Net Kâr" value={`₺${netProfit.toFixed(2)}`} description="Toplam kâr" color="green" />
      <Card variant="summary" title="Kâr Marjı" value={`%${profitMargin.toFixed(1)}`} description="Ortalama kârlılık" color="purple" />
    </div>
  );
};

export default OverviewSummaryCards;

