// components/cashregister/CashCounting.tsx
import React from "react";
import { Calculator, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "../../utils/vatUtils";

interface CashCountingProps {
  theoreticalBalance: number;
  countingAmount: number;
  countingDifference: number;
  onShowCountingModal: () => void;
  hasActiveCounting: boolean;
}

const CashCounting: React.FC<CashCountingProps> = React.memo(({
  theoreticalBalance,
  countingAmount,
  countingDifference,
  onShowCountingModal,
  hasActiveCounting
}) => {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calculator size={20} />
          <h3 className="text-lg font-semibold">Kasa Sayımı</h3>
        </div>
        <button
          onClick={onShowCountingModal}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2"
        >
          <Calculator size={16} />
          {hasActiveCounting ? "Tekrar Say" : "Kasa Sayım"}
        </button>
      </div>

      {hasActiveCounting ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">Teorik Bakiye</div>
              <div className="text-lg font-semibold text-blue-800">
                {formatCurrency(theoreticalBalance)}
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Sayılan Tutar</div>
              <div className="text-lg font-semibold text-green-800">
                {formatCurrency(countingAmount)}
              </div>
            </div>
          </div>
          
          <div className={`p-3 rounded-lg flex items-center gap-2 ${
            countingDifference > 0 
              ? "bg-green-50 text-green-700" 
              : countingDifference < 0 
              ? "bg-red-50 text-red-700" 
              : "bg-gray-50 text-gray-700"
          }`}>
            {countingDifference > 0 ? (
              <TrendingUp size={20} />
            ) : countingDifference < 0 ? (
              <TrendingDown size={20} />
            ) : (
              <Calculator size={20} />
            )}
            <div className="flex-1">
              <div className="font-medium">
                Sayım Farkı: {countingDifference > 0 && "+"}{formatCurrency(countingDifference)}
              </div>
              <div className="text-sm opacity-75">
                {countingDifference > 0 
                  ? "Fazla nakit tespit edildi" 
                  : countingDifference < 0 
                  ? "Eksik nakit tespit edildi" 
                  : "Sayım tam olarak eşleşti"}
              </div>
            </div>
          </div>
          
          {Math.abs(countingDifference) > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="text-yellow-800 text-sm">
                <strong>Not:</strong> Sayım farkı tespit edildi. 
                {countingDifference < 0 
                  ? " Eksik tutarın sebebini araştırın."
                  : " Fazla tutarın kaynağını kontrol edin."
                }
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <Calculator size={32} className="mx-auto mb-2 opacity-50" />
          <p>Henüz kasa sayımı yapılmamış.</p>
          <p className="text-sm mt-1">
            Günü kapatmadan önce kasa sayımı yapmanız önerilir.
          </p>
        </div>
      )}
    </div>
  );
});

CashCounting.displayName = "CashCounting";

export default CashCounting;