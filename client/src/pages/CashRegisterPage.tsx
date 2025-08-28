import React, { Suspense, lazy } from "react";
import { RefreshCw } from "lucide-react";
import PageLayout from "../components/layout/PageLayout";
import { CashRegisterStatus } from "../types/cashRegister";
import { useRegisterStatus } from "../hooks/useRegisterStatus";
import { useCashRegisterPage } from "./cashregister/hooks/useCashRegisterPage";

// Lazy loaded components
const CashRegisterStatusWidget = lazy(() => import("../components/cashregister/CashRegisterStatus"));
const TransactionControls = lazy(() => import("../components/cashregister/TransactionControls"));
const CashCounting = lazy(() => import("../components/cashregister/CashCounting"));
const TransactionHistory = lazy(() => import("../components/cashregister/TransactionHistory"));
const TransactionModals = lazy(() => import("../components/cashregister/TransactionModals"));

// Loading component
const ComponentLoading: React.FC = () => (
  <div className="flex items-center justify-center h-32">
    <RefreshCw size={20} className="animate-spin" />
    <span className="ml-2">Yükleniyor...</span>
  </div>
);

const CashRegisterPage: React.FC = () => {
  const {
    registerStatus,
    sessionId,
    openingDate,
    openingBalance,
    dailyCashSales,
    dailyCardSales,
    cashWithdrawals,
    cashDeposits,
    countingAmount,
    countingDifference,
    newOpeningBalance,
    showDepositModal,
    showWithdrawalModal,
    transactionAmount,
    transactionDescription,
    showCountingModal,
    countingInputAmount,
    transactions,
    isLoading,
    showCreditCollectionModal,
    selectedCustomer,
    customers,
    theoreticalBalance,
    dailyTotalSales,
    setNewOpeningBalance,
    setShowDepositModal,
    setShowWithdrawalModal,
    setTransactionAmount,
    setTransactionDescription,
    setShowCountingModal,
    setCountingInputAmount,
    setShowCreditCollectionModal,
    setSelectedCustomer,
    loadCashRegister,
    handleOpenRegister,
    handleCashDeposit,
    handleCashWithdrawal,
    handleCreditCollection,
    handleCounting,
    handleCloseDay,
  } = useCashRegisterPage();

  // Kasa durum rozetleri için merkezi durum hook'u (toolbar)
  const { isOpen: isRegisterOpen, loading: registerLoading, refresh: refreshRegister } = useRegisterStatus({
    onError: () => {},
  });

  // Loading state
  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-4">
        {/* Toolbar with useRegisterStatus */}
        <div className="flex items-center justify-between bg-white rounded-lg border px-3 py-2">
          <div className="text-sm">
            Kasa: {registerLoading ? "Yükleniyor..." : isRegisterOpen ? "Açık" : "Kapalı"}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="text-xs px-2 py-1 rounded-lg text-gray-600 hover:bg-gray-50"
              onClick={async () => {
                await refreshRegister();
                await loadCashRegister();
              }}
            >
              Yenile
            </button>
            <button
              className="text-xs px-2 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              onClick={handleOpenRegister}
              disabled={registerLoading || isRegisterOpen}
              title="Kasayı Aç"
            >
              Aç
            </button>
            <button
              className="text-xs px-2 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700"
              onClick={handleCloseDay}
              disabled={registerLoading || !isRegisterOpen}
              title="Günü Kapat"
            >
              Kapat
            </button>
          </div>
        </div>

        {/* Cash Register Status Widget */}
        <Suspense fallback={<ComponentLoading />}>
          <CashRegisterStatusWidget
            registerStatus={registerStatus}
            sessionId={sessionId}
            openingDate={openingDate}
            openingBalance={openingBalance}
            dailyCashSales={dailyCashSales}
            dailyCardSales={dailyCardSales}
            cashWithdrawals={cashWithdrawals}
            cashDeposits={cashDeposits}
            dailyTotalSales={dailyTotalSales}
            theoreticalBalance={theoreticalBalance}
            countingAmount={countingAmount}
            countingDifference={countingDifference}
            newOpeningBalance={newOpeningBalance}
            setNewOpeningBalance={setNewOpeningBalance}
            onOpenRegister={handleOpenRegister}
            onShowDepositModal={() => setShowDepositModal(true)}
            onShowWithdrawalModal={() => setShowWithdrawalModal(true)}
            onShowCreditCollectionModal={() => setShowCreditCollectionModal(true)}
            onShowCountingModal={() => setShowCountingModal(true)}
            onCloseDay={handleCloseDay}
          />
        </Suspense>

        {/* Transaction Controls Widget */}
        {registerStatus === CashRegisterStatus.OPEN && (
          <Suspense fallback={<ComponentLoading />}>
            <TransactionControls
              onShowDepositModal={() => setShowDepositModal(true)}
              onShowWithdrawalModal={() => setShowWithdrawalModal(true)}
              onShowCreditCollectionModal={() => setShowCreditCollectionModal(true)}
              onShowCountingModal={() => setShowCountingModal(true)}
              onCloseDay={handleCloseDay}
            />
          </Suspense>
        )}

        {/* Cash Counting Widget */}
        {registerStatus === CashRegisterStatus.OPEN && (
          <Suspense fallback={<ComponentLoading />}>
            <CashCounting
              theoreticalBalance={theoreticalBalance}
              countingAmount={countingAmount}
              countingDifference={countingDifference}
              onShowCountingModal={() => setShowCountingModal(true)}
              hasActiveCounting={countingAmount > 0}
            />
          </Suspense>
        )}

        {/* Transaction History Widget */}
        <Suspense fallback={<ComponentLoading />}>
          <TransactionHistory
            registerStatus={registerStatus}
            openingDate={openingDate}
            openingBalance={openingBalance}
            transactions={transactions}
          />
        </Suspense>

        {/* Transaction Modals Widget */}
        <Suspense fallback={<ComponentLoading />}>
          <TransactionModals
            showDepositModal={showDepositModal}
            setShowDepositModal={setShowDepositModal}
            onCashDeposit={handleCashDeposit}
            showWithdrawalModal={showWithdrawalModal}
            setShowWithdrawalModal={setShowWithdrawalModal}
            onCashWithdrawal={handleCashWithdrawal}
            showCreditCollectionModal={showCreditCollectionModal}
            setShowCreditCollectionModal={setShowCreditCollectionModal}
            onCreditCollection={handleCreditCollection}
            customers={customers}
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
            showCountingModal={showCountingModal}
            setShowCountingModal={setShowCountingModal}
            onCounting={handleCounting}
            theoreticalBalance={theoreticalBalance}
            countingInputAmount={countingInputAmount}
            setCountingInputAmount={setCountingInputAmount}
            transactionAmount={transactionAmount}
            setTransactionAmount={setTransactionAmount}
            transactionDescription={transactionDescription}
            setTransactionDescription={setTransactionDescription}
          />
        </Suspense>
      </div>
    </PageLayout>
  );
};

export default CashRegisterPage;
