// components/cashregister/CashRegisterStatus.tsx
import { Calendar, DollarSign, Info } from "lucide-react";
import React from "react";

import { CashRegisterStatus as CashStatus } from "../../types/cashRegister";
import { formatCurrency } from "../../utils/vatUtils";

interface CashRegisterStatusProps {
  // Status
  registerStatus: CashStatus;
  sessionId: string;
  openingDate: Date | null;
  openingBalance: number;
  
  // Sales Data
  dailyCashSales: number;
  dailyCardSales: number;
  cashWithdrawals: number;
  cashDeposits: number;
  dailyTotalSales: number;
  theoreticalBalance: number;
  
  // Counting Data
  countingAmount: number;
  countingDifference: number;
  
  // Opening Actions
  newOpeningBalance: string;
  setNewOpeningBalance: (balance: string) => void;
  onOpenRegister: () => void;
  
  // Action Buttons
  onShowDepositModal: () => void;
  onShowWithdrawalModal: () => void;
  onShowCreditCollectionModal: () => void;
  onShowCountingModal: () => void;
  onCloseDay: () => void;
}

const CashRegisterStatus: React.FC<CashRegisterStatusProps> = React.memo(({
  registerStatus,
  sessionId,
  openingDate,
  openingBalance,
  dailyCashSales,
  dailyCardSales,
  cashWithdrawals,
  cashDeposits,
  dailyTotalSales,
  theoreticalBalance,
  countingAmount,
  countingDifference,
  newOpeningBalance,
  setNewOpeningBalance,
  onOpenRegister,
  onShowDepositModal,
  onShowWithdrawalModal,
  onShowCreditCollectionModal,
  onShowCountingModal,
  onCloseDay
}) => {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold">Kasa Durumu</h2>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            registerStatus === CashStatus.OPEN
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {registerStatus}
        </span>
      </div>

      {registerStatus === CashStatus.CLOSED ? (
        // Register Closed State
        <div className="space-y-4">
          <p className="text-gray-600">
            Kasayı açmak için açılış bakiyesi girin.
          </p>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Açılış Bakiyesi
              </label>
              <input
                type="number"
                placeholder="0.00"
                className="w-full p-2 border rounded-lg"
                value={newOpeningBalance}
                onChange={(e) => setNewOpeningBalance(e.target.value)}
                onWheel={(e) => e.currentTarget.blur()}
              />
            </div>
            <button
              onClick={onOpenRegister}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Kasa Aç
            </button>
          </div>
        </div>
      ) : (
        // Register Open State
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-500">Açılış Tarihi</span>
                <span>{openingDate?.toLocaleString("tr-TR")}</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-500">Açılış Bakiyesi</span>
                <span className="font-medium">
                  {formatCurrency(openingBalance)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-500">Nakit Satışlar</span>
                <span className="text-green-600 font-medium">
                  +{formatCurrency(dailyCashSales)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-500">Kart Satışlar</span>
                <span className="text-green-600 font-medium">
                  +{formatCurrency(dailyCardSales)}
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-500">Nakit Girişler</span>
                <span className="text-green-600 font-medium">
                  +{formatCurrency(cashDeposits)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-500">Nakit Çıkışlar</span>
                <span className="text-red-600 font-medium">
                  -{formatCurrency(cashWithdrawals)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="flex items-center gap-1 text-gray-500">
                  Teorik Kasa Bakiyesi
                  <div className="relative group">
                    <Info size={16} className="text-gray-400 cursor-help" />
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800/75 text-white text-xs rounded p-2 w-48">
                      Kasa Bakiyesi: Açılış bakiyesi sayılmaksızın kasaya giren ve çıkan net parayı gösterir.
                    </div>
                  </div>
                </span>
                <span className="font-medium">
                  {formatCurrency(theoreticalBalance)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm mb-2">
                <span className="flex items-center gap-1 text-gray-500">
                  Toplam Satış Bakiyesi
                  <div className="relative group">
                    <Info size={16} className="text-gray-400 cursor-help" />
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800/75 text-white text-xs rounded p-2 w-48">
                      Net satış hesaplaması: Nakit ve Kart satışları
                      toplamıyla beraber nakit giriş ve çıkış işlemleri
                      hesaplanmış şekilde gösterir.
                    </div>
                  </div>
                </span>
                <span className="font-medium">
                  {formatCurrency(dailyTotalSales)}
                </span>
              </div>
            </div>
          </div>

          {/* Cash Counting Results */}
          {countingAmount > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg border mt-4">
              <h3 className="font-medium mb-2">Kasa Sayımı</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Sayılan Nakit</span>
                  <span className="font-medium">
                    {formatCurrency(countingAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Teorik Bakiye</span>
                  <span className="font-medium">
                    {formatCurrency(theoreticalBalance)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Fark</span>
                  <span
                    className={`font-medium ${
                      countingDifference < 0
                        ? "text-red-600"
                        : countingDifference > 0
                        ? "text-green-600"
                        : "text-gray-600"
                    }`}
                  >
                    {countingDifference > 0 && "+"}
                    {formatCurrency(countingDifference)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <CashRegisterActions
            onShowDepositModal={onShowDepositModal}
            onShowWithdrawalModal={onShowWithdrawalModal}
            onShowCreditCollectionModal={onShowCreditCollectionModal}
            onShowCountingModal={onShowCountingModal}
            onCloseDay={onCloseDay}
          />
        </div>
      )}
    </div>
  );
});

// Action Buttons Component
const CashRegisterActions: React.FC<{
  onShowDepositModal: () => void;
  onShowWithdrawalModal: () => void;
  onShowCreditCollectionModal: () => void;
  onShowCountingModal: () => void;
  onCloseDay: () => void;
}> = ({ 
  onShowDepositModal, 
  onShowWithdrawalModal, 
  onShowCreditCollectionModal, 
  onShowCountingModal, 
  onCloseDay 
}) => (
  <div className="flex flex-wrap gap-2 justify-end mt-4">
    <button
      onClick={onShowDepositModal}
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
    >
      <DollarSign size={16} />
      Nakit Giriş
    </button>
    <button
      onClick={onShowWithdrawalModal}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
    >
      <DollarSign size={16} />
      Nakit Çıkış
    </button>
    <button
      onClick={onShowCreditCollectionModal}
      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
    >
      <Calendar size={16} />
      Veresiye Tahsilatı
    </button>
    <button
      onClick={onShowCountingModal}
      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2"
    >
      <DollarSign size={16} />
      Kasa Sayım
    </button>
    <button
      onClick={onCloseDay}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
    >
      <Calendar size={16} />
      Günü Kapat
    </button>
  </div>
);

CashRegisterStatus.displayName = "CashRegisterStatus";

export default CashRegisterStatus;