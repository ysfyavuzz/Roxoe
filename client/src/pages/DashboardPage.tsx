import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Dashboard Bileşenleri
import CashTab from "../components/dashboard/CashTab";
import OverviewTab from "../components/dashboard/OverviewTab";
import ProductsTab from "../components/dashboard/ProductsTab";
import SalesTab from "../components/dashboard/SalesTab";
import ExportButton from "../components/ExportButton";
import DateFilter from "../components/ui/DatePicker"; // Yeni DateFilter bileşeni
// Hooks ve Servisler
import {
  cashRegisterService,
  CashRegisterSession,
} from "../services/cashRegisterDB";
import { exportService } from "../services/exportSevices";
import { CashTransaction } from "../types/cashRegister";

import { useCashDashboardData } from "./dashboard/hooks/useCashDashboardData";
import { useDashboardSalesData } from "./dashboard/hooks/useDashboardSalesData";

// Dashboard sekme tipleri
type DashboardTabKey = "overview" | "cash" | "sales" | "products";

const DashboardPage: React.FC = () => {
  // URL parametrelerini al
  const { tabKey = "overview" } = useParams<{ tabKey?: DashboardTabKey }>();
  const navigate = useNavigate();

  // Tarih filtresi state'leri
  const [period, setPeriod] = useState<
    "day" | "week" | "month" | "year" | "custom"
  >("day");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Sıralama state'i
  const [cashSortConfig, setCashSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "openingDate",
    direction: "desc",
  });

  // Satış ve istatistik verileri (tarih aralığına göre)
  const {
    sales,
    filteredSales,
    salesLoading,
    totalSales,
    totalRevenue,
    netProfit,
    profitMargin,
    averageBasket,
    cancelRate,
    refundRate,
    dailySalesData,
    categoryData,
    productStats,
  } = useDashboardSalesData(startDate, endDate, period);

  // Kasa verileri (tarih aralığına göre)
  const {
    cashData,
    closedSessions,
    lastClosedSession,
    loading: cashLoading,
  } = useCashDashboardData(startDate, endDate, period);

  // Kapanmış oturumları sıralayan useMemo
  const sortedClosedSessions = useMemo(() => {
    const sessions = [...closedSessions];
    if (cashSortConfig) {
      sessions.sort((a, b) => {
        const key = cashSortConfig.key;
        let aVal, bVal;
        if (key === "totalSales") {
          aVal = (a.cashSalesTotal || 0) + (a.cardSalesTotal || 0);
          bVal = (b.cashSalesTotal || 0) + (b.cardSalesTotal || 0);
        } else {
          aVal = a[key as keyof CashRegisterSession];
          bVal = b[key as keyof CashRegisterSession];
          if (key === "openingDate" || key === "closingDate") {
            aVal = new Date(aVal || 0);
            bVal = new Date(bVal || 0);
          }
        }
        if (typeof aVal === "number" && typeof bVal === "number") {
          return cashSortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
        }
        if (aVal instanceof Date && bVal instanceof Date) {
          return cashSortConfig.direction === "asc"
            ? aVal.getTime() - bVal.getTime()
            : bVal.getTime() - aVal.getTime();
        }
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
        if (aVal < bVal) {return cashSortConfig.direction === "asc" ? -1 : 1;}
        if (aVal > bVal) {return cashSortConfig.direction === "asc" ? 1 : -1;}
        return 0;
      });
    }
    return sessions;
  }, [closedSessions, cashSortConfig]);

  // Sütun başlığına tıklanınca sıralama yönünü değiştiren fonksiyon
  const handleCashSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (cashSortConfig.key === key && cashSortConfig.direction === "asc") {
      direction = "desc";
    }
    setCashSortConfig({ key, direction });
  };

  // Yükleniyor durumu
  const isLoading = salesLoading || cashLoading;

  // Veriyi yenile
  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Dışa aktarma fonksiyonu
  async function handleExport(
    fileType: "excel" | "pdf",
    reportType: "sale" | "product" | "cash"
  ) {
    const dateRangeString = exportService.formatDateRange(startDate, endDate);
    try {
      if (fileType === "excel") {
        if (reportType === "cash") {
          // İşlem geçmişini yükle - tip tanımlamaları eklendi
          let allTransactions: CashTransaction[] = [];
          let veresiyeTx: CashTransaction[] = [];

          // Aktif oturum varsa verileri al
          const activeSession = await cashRegisterService.getActiveSession();
          if (activeSession) {
            const sessionDetails = await cashRegisterService.getSessionDetails(
              activeSession.id
            );
            allTransactions = sessionDetails.transactions || [];
            veresiyeTx = allTransactions.filter(
              (t) =>
                t.description?.toLowerCase().includes("veresiye") ||
                t.description?.toLowerCase().includes("tahsilat")
            );
          }

          console.log(
            "Veri hazırlama başlıyor - Transactions sayısı:",
            allTransactions.length
          );

          const cashExportData = {
            summary: {
              openingBalance: cashData.openingBalance,
              currentBalance: cashData.currentBalance,
              totalDeposits: cashData.totalDeposits,
              totalWithdrawals: cashData.totalWithdrawals,
              veresiyeCollections: cashData.veresiyeCollections,
              cashSalesTotal: cashData.cashSalesTotal,
              cardSalesTotal: cashData.cardSalesTotal,
            },
            dailyData: cashData.dailyData || [],
            closedSessions,
            transactions: allTransactions,
            salesData: filteredSales.filter((s) => s.status === "completed"),
            veresiyeTransactions: veresiyeTx,
            productSummary: productStats.map((product) => ({
              productName: product.name,
              category: product.category || "Kategori Yok",
              totalSales: product.quantity,
              totalRevenue: product.revenue,
              totalProfit: product.profit,
              profitMargin: product.profitMargin || 0,
            })),
          };

          console.log("Kasa Export Verileri:", {
            "dailyData sayısı": cashExportData.dailyData.length,
            "transactions sayısı": cashExportData.transactions.length,
            "veresiye sayısı": cashExportData.veresiyeTransactions.length,
            "satış sayısı": cashExportData.salesData.length,
          });

          await exportService.exportCashDataToExcel(
            cashExportData,
            `Kasa Raporu ${dateRangeString}`
          );
        } else {
          // Diğer raporlar aynı kalabilir
          await exportService.exportToExcel(
            filteredSales,
            dateRangeString,
            reportType
          );
        }
      } else {
        // PDF raporları aynı kalabilir
        if (reportType === "cash") {
          alert("Kasa raporu PDF olarak henüz desteklenmiyor!");
        } else {
          await exportService.exportToPDF(
            filteredSales,
            dateRangeString,
            reportType
          );
        }
      }
    } catch (err) {
      console.error("Dışa aktarım hatası:", err);
      alert("Dışa aktarım sırasında bir hata oluştu!");
    }
  }

  // Tarih formatını güzelleştiren yardımcı fonksiyon
  const formatDate = (date: Date | string | undefined) => {
    if (!date) {return "-";}
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(date).toLocaleDateString("tr-TR", options);
  };

  // Tarih değişimleri için callback
  const handleDateChange = (start: Date, end: Date) => {
    console.log("Tarih değişiyor:", start, end);
    setStartDate(start);
    setEndDate(end);
  };

  // Periyot değişimi için callback
  const handlePeriodChange = (
    newPeriod: "day" | "week" | "month" | "year" | "custom"
  ) => {
    console.log("Periyot değişiyor:", newPeriod);
    setPeriod(newPeriod);
  };

  // Seçili sekmeye göre içerik gösterme
  const renderTabContent = () => {
    switch (tabKey) {
      case "overview":
        return (
          <OverviewTab
            totalSales={totalSales}
            totalRevenue={totalRevenue}
            netProfit={netProfit}
            profitMargin={profitMargin}
            dailySalesData={dailySalesData}
            categoryData={categoryData}
            productStats={productStats}
            lastClosedSession={lastClosedSession}
            isLoading={isLoading}
            formatDate={formatDate}
            setCurrentTab={(tab) => navigate(`/dashboard/${tab}`)}
            period={period}
          />
        );
      case "cash":
        return (
          <CashTab
            cashData={cashData}
            closedSessions={closedSessions}
            lastClosedSession={lastClosedSession}
            sortedClosedSessions={sortedClosedSessions}
            isLoading={isLoading}
            formatDate={formatDate}
            handleCashSort={handleCashSort}
            cashSortConfig={cashSortConfig}
            period={period}
          />
        );
      case "sales":
        return (
          <SalesTab
            totalSales={totalSales}
            totalRevenue={totalRevenue}
            netProfit={netProfit}
            profitMargin={profitMargin}
            averageBasket={averageBasket}
            cancelRate={cancelRate}
            refundRate={refundRate}
            dailySalesData={dailySalesData}
            categoryData={categoryData}
            period={period}
          />
        );
      case "products":
        return (
          <ProductsTab
            productStats={productStats}
            isLoading={isLoading}
            handleExport={handleExport}
          />
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center p-8 text-gray-500">
            <div className="text-lg font-medium">Sekme bulunamadı</div>
            <p className="mt-2">Lütfen geçerli bir sekme seçin</p>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container p-2">
      {/* Yeni DateFilter bileşeni */}
      <DateFilter
        startDate={startDate}
        endDate={endDate}
        period={period}
        onPeriodChange={handlePeriodChange}
        onDateChange={handleDateChange}
        isLoading={isLoading}
        onRefresh={handleRefresh}
        exportButton={
          <ExportButton
            currentTab={tabKey as "overview" | "cash" | "sales" | "products"}
            startDate={startDate}
            endDate={endDate}
            isLoading={isLoading}
            sales={filteredSales}
            cashData={cashData}
            productStats={productStats}
            closedSessions={closedSessions}
            transactions={[]}
          />
        }
      />

      {/* Seçilen Sekmenin İçeriği */}
      <div className="transition-all duration-300 ease-in-out">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default DashboardPage;
