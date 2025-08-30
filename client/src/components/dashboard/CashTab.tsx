import React, { useMemo } from "react";

import { CashRegisterSession } from "../../services/cashRegisterDB";

import CashFlowCard from "./cash/CashFlowCard";
import CashMovementsChart from "./cash/CashMovementsChart";
import CashSummaryCards from "./cash/CashSummaryCards";
import ClosedSessionsTable from "./cash/ClosedSessionsTable";
import DailyIncreaseCard from "./cash/DailyIncreaseCard";
import SalesDistributionChart from "./cash/SalesDistributionChart";

interface CashTabProps {
  cashData: {
    currentBalance: number;
    totalDeposits: number;
    totalWithdrawals: number;
    veresiyeCollections: number;
    isActive: boolean;
    openingBalance: number;
    cashSalesTotal: number;
    cardSalesTotal: number;
    dailyData: Array<{
      date: string;
      deposits: number;
      withdrawals: number;
      veresiye: number;
      total: number;
    }>;
  };
  closedSessions: CashRegisterSession[];
  lastClosedSession: CashRegisterSession | null;
  sortedClosedSessions: CashRegisterSession[];
  isLoading: boolean;
  formatDate: (date: Date | string | undefined) => string;
  handleCashSort: (key: string) => void;
  cashSortConfig: {
    key: string;
    direction: "asc" | "desc";
  };
  period: "day" | "week" | "month" | "year" | "custom"; // Periyot bilgisi
}

const CashTab: React.FC<CashTabProps> = ({
  cashData,
  closedSessions,
  lastClosedSession,
  sortedClosedSessions,
  isLoading,
  formatDate,
  handleCashSort,
  cashSortConfig,
  period,
}) => {
  // Günlük nakit artışı hesaplama - isActive durumuna göre
  const dailyCashIncrease = cashData.isActive
    ? cashData.currentBalance - cashData.openingBalance
    : lastClosedSession
    ? (lastClosedSession.countingAmount ??
        lastClosedSession.openingBalance +
          (lastClosedSession.cashSalesTotal || 0) +
          (lastClosedSession.cashDepositTotal || 0) -
          (lastClosedSession.cashWithdrawalTotal || 0)) -
      lastClosedSession.openingBalance
    : 0;

  // Gösterilecek oturum (aktif oturum veya son kapanan oturum)
  const sessionToShow = cashData.isActive
    ? {
        openingBalance: cashData.openingBalance,
        cashDepositTotal: cashData.totalDeposits,
        cashWithdrawalTotal: cashData.totalWithdrawals,
        countingAmount: null,
      }
    : lastClosedSession;

  // Table için veri hazırlama
  const displaySessions = useMemo(() => {
    return sortedClosedSessions.slice(0, 5);
  }, [sortedClosedSessions]);

  return (
    <div className="space-y-3">
      {/* Ana Metrikler */}
      <CashSummaryCards cashData={cashData} />

      {/* Günün Artışı Kartı */}
{period === "day" && sessionToShow && (
        <DailyIncreaseCard cashData={cashData} session={sessionToShow} dailyIncrease={dailyCashIncrease} />
      )}

      {/* İki sütun düzen: Nakit Akışı ve Gelir-Gider Dağılımı */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashFlowCard
          veresiyeCollections={cashData.veresiyeCollections}
          totalDeposits={cashData.totalDeposits}
          totalWithdrawals={cashData.totalWithdrawals}
        />
        <SalesDistributionChart
          cashSalesTotal={cashData.cashSalesTotal}
          cardSalesTotal={cashData.cardSalesTotal}
        />
      </div>

      {/* Kasa Hareketleri Grafiği - Günlük veya Saatlik */}
      <CashMovementsChart dailyData={cashData.dailyData} period={period} />

      {/* Kasa Oturumları Tablosu */}
      {sortedClosedSessions.length > 0 && (
        <ClosedSessionsTable
          displaySessions={displaySessions}
          allSessions={sortedClosedSessions}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default CashTab;
