import React from "react";
import type { CashRegisterSession } from "../../../services/cashRegisterDB";

interface LastClosedSessionCardProps {
  lastClosedSession: CashRegisterSession | null;
  formatDate: (date: Date | string | undefined) => string;
}

const LastClosedSessionCard: React.FC<LastClosedSessionCardProps> = ({ lastClosedSession, formatDate }) => {
  if (!lastClosedSession) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-3 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800">Son Kapanan Kasa Özeti</h2>
        <span className="text-sm px-3 py-1 bg-gray-100 rounded-full text-gray-600">
          {formatDate(lastClosedSession.closingDate || lastClosedSession.openingDate)}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 p-1">
        <div className="p-4 m-2 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-700 mb-1">Açılış Bakiyesi</div>
          <div className="text-lg font-medium text-blue-900">₺{lastClosedSession.openingBalance.toFixed(2)}</div>
        </div>
        <div className="p-4 m-2 bg-green-50 rounded-lg">
          <div className="text-sm text-green-700 mb-1">Toplam Satış</div>
          <div className="text-lg font-medium text-green-900">
            ₺{((lastClosedSession.cashSalesTotal || 0) + (lastClosedSession.cardSalesTotal || 0)).toFixed(2)}
          </div>
        </div>
        <div className="p-4 m-2 bg-indigo-50 rounded-lg">
          <div className="text-sm text-indigo-700 mb-1">Sayım Sonucu</div>
          <div className="text-lg font-medium text-indigo-900">
            {lastClosedSession.countingAmount ? `₺${lastClosedSession.countingAmount.toFixed(2)}` : "Sayım yapılmadı"}
          </div>
        </div>
        <div className="p-4 m-2 bg-purple-50 rounded-lg">
          <div className="text-sm text-purple-700 mb-1">Kasa Farkı</div>
          <div className={`text-lg font-medium ${!lastClosedSession.countingDifference ? "text-gray-500" : lastClosedSession.countingDifference < 0 ? "text-red-600" : lastClosedSession.countingDifference > 0 ? "text-green-600" : "text-gray-800"}`}>
            {lastClosedSession.countingDifference
              ? `${lastClosedSession.countingDifference > 0 ? "+" : ""}₺${lastClosedSession.countingDifference.toFixed(2)}`
              : "-"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LastClosedSessionCard;

