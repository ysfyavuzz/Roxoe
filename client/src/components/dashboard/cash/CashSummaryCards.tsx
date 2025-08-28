import React from "react";
import Card from "../../ui/Card";

interface CashSummaryCardsProps {
  cashData: {
    currentBalance: number;
    cashSalesTotal: number;
    cardSalesTotal: number;
  };
}

const CashSummaryCards: React.FC<CashSummaryCardsProps> = ({ cashData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card
        variant="summary"
        title="Kasa Bakiyesi"
        value={`₺${cashData.currentBalance.toFixed(2)}`}
        description="Güncel toplam bakiye"
        color="indigo"
      />
      <Card
        variant="summary"
        title="Nakit Satışlar"
        value={`₺${cashData.cashSalesTotal.toFixed(2)}`}
        description="Nakit ile yapılan satışlar"
        color="green"
      />
      <Card
        variant="summary"
        title="Kart Satışlar"
        value={`₺${cashData.cardSalesTotal.toFixed(2)}`}
        description="Kart ile yapılan satışlar"
        color="blue"
      />
      <Card
        variant="summary"
        title="Toplam Satış"
        value={`₺${(cashData.cashSalesTotal + cashData.cardSalesTotal).toFixed(2)}`}
        description="Tüm satışların toplamı"
        color="purple"
      />
    </div>
  );
};

export default CashSummaryCards;

