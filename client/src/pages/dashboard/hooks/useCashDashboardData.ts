import { useEffect, useState } from "react";
import {
  cashRegisterService,
  CashRegisterSession,
  CashRegisterStatus,
} from "../../../services/cashRegisterDB";

export type DashboardPeriod = "day" | "week" | "month" | "year" | "custom";

interface CashData {
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
}

interface UseCashDashboardDataReturn {
  cashData: CashData;
  closedSessions: CashRegisterSession[];
  lastClosedSession: CashRegisterSession | null;
  loading: boolean;
}

/**
 * Dashboard (Kasa) verilerini ve kapanmış oturumları getirir.
 * - Seçili tarih aralığına göre oturumları filtreler
 * - Günlük/saatlik (period === 'day') özet verisini hazırlar
 * - Aktif oturum veya son kapanan oturum üzerinden güncel bakiyeyi hesaplar
 */
export function useCashDashboardData(
  startDate: Date,
  endDate: Date,
  period: DashboardPeriod
): UseCashDashboardDataReturn {
  const [loading, setLoading] = useState<boolean>(true);

  const [cashData, setCashData] = useState<CashData>({
    currentBalance: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    veresiyeCollections: 0,
    isActive: false,
    openingBalance: 0,
    cashSalesTotal: 0,
    cardSalesTotal: 0,
    dailyData: [],
  });

  const [closedSessions, setClosedSessions] = useState<CashRegisterSession[]>([]);
  const [lastClosedSession, setLastClosedSession] =
    useState<CashRegisterSession | null>(null);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);

      try {
        const all = await cashRegisterService.getAllSessions();

        // Tarih aralığını günün başı/sonu ile normalize et
        const startDateTime = new Date(startDate);
        startDateTime.setHours(0, 0, 0, 0);
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);

        const sessionsInRange = all.filter((s) => {
          const sessionDate = new Date(s.openingDate);
          return sessionDate >= startDateTime && sessionDate <= endDateTime;
        });

        const activeSession = await cashRegisterService.getActiveSession();

        let totalDeposits = 0;
        let totalWithdrawals = 0;
        let veresiyeCollections = 0;
        let totalCashSales = 0;
        let totalCardSales = 0;
        let totalOpeningBalance = 0;

        const transactionsData: Record<
          string,
          { date: string; deposits: number; withdrawals: number; veresiye: number; total: number }
        > = {};

        if (period === "day") {
          for (let hour = 0; hour < 24; hour++) {
            const hourKey = `${hour.toString().padStart(2, "0")}:00`;
            transactionsData[hourKey] = {
              date: hourKey,
              deposits: 0,
              withdrawals: 0,
              veresiye: 0,
              total: 0,
            };
          }
        }

        for (const sess of sessionsInRange) {
          const details = await cashRegisterService.getSessionDetails(sess.id);

          totalOpeningBalance += sess.openingBalance;
          totalCashSales += sess.cashSalesTotal || 0;
          totalCardSales += sess.cardSalesTotal || 0;

          if (details.transactions) {
            for (const tx of details.transactions) {
              const dt = new Date(tx.date);
              const dataKey =
                period === "day"
                  ? `${dt.getHours().toString().padStart(2, "0")}:00`
                  : dt.toISOString().split("T")[0];

              if (!transactionsData[dataKey]) {
                transactionsData[dataKey] = {
                  date: dataKey,
                  deposits: 0,
                  withdrawals: 0,
                  veresiye: 0,
                  total: 0,
                };
              }

              if (tx.type === "GİRİŞ") {
                totalDeposits += tx.amount;
                transactionsData[dataKey].deposits += tx.amount;
                transactionsData[dataKey].total += tx.amount;
              } else if (tx.type === "ÇIKIŞ") {
                totalWithdrawals += tx.amount;
                transactionsData[dataKey].withdrawals += tx.amount;
                transactionsData[dataKey].total -= tx.amount;
              } else if (tx.type === "VERESIYE_TAHSILAT") {
                totalDeposits += tx.amount;
                veresiyeCollections += tx.amount;
                transactionsData[dataKey].veresiye += tx.amount;
                transactionsData[dataKey].deposits += tx.amount;
                transactionsData[dataKey].total += tx.amount;
              }
            }
          }
        }

        const closed = sessionsInRange
          .filter((s) => s.status === CashRegisterStatus.CLOSED)
          .sort((a, b) => {
            return (
              new Date(b.closingDate || b.openingDate).getTime() -
              new Date(a.closingDate || a.openingDate).getTime()
            );
          });

        setClosedSessions(closed);
        setLastClosedSession(closed.length > 0 ? closed[0] : null);

        // Bakiye ve açılış bakiyesi
        let currBalance = 0;
        let isActive = false;
        let openingBalance = period === "day" ? 0 : totalOpeningBalance;

        if (activeSession) {
          isActive = true;
          currBalance =
            activeSession.openingBalance +
            (activeSession.cashSalesTotal || 0) +
            (activeSession.cashDepositTotal || 0) -
            (activeSession.cashWithdrawalTotal || 0);

          if (period === "day") {
            openingBalance = activeSession.openingBalance;
          }
        } else if (closed.length > 0) {
          const lastSession = closed[0];
          currBalance =
            lastSession.countingAmount !== null &&
            lastSession.countingAmount !== undefined
              ? lastSession.countingAmount
              : lastSession.openingBalance +
                (lastSession.cashSalesTotal || 0) +
                (lastSession.cashDepositTotal || 0) -
                (lastSession.cashWithdrawalTotal || 0);

          if (period === "day") {
            openingBalance = lastSession.openingBalance;
          }
        }

        const dailyData = (period === "day"
          ? Object.values(transactionsData).sort(
              (a, b) => parseInt(a.date.split(":")[0]) - parseInt(b.date.split(":")[0])
            )
          : Object.values(transactionsData).sort((a, b) => a.date.localeCompare(b.date)));

        setCashData({
          currentBalance: currBalance,
          totalDeposits,
          totalWithdrawals,
          veresiyeCollections,
          isActive,
          openingBalance,
          cashSalesTotal: totalCashSales,
          cardSalesTotal: totalCardSales,
          dailyData,
        });
      } catch (err) {
        console.error("Kasa verileri yüklenirken hata:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [startDate, endDate, period]);

  return { cashData, closedSessions, lastClosedSession, loading };
}

