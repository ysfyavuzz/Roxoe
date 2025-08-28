import React from "react";

interface CashFlowCardProps {
  veresiyeCollections: number;
  totalDeposits: number;
  totalWithdrawals: number;
}

const CashFlowCard: React.FC<CashFlowCardProps> = ({ veresiyeCollections, totalDeposits, totalWithdrawals }) => {
  const otherDeposits = totalDeposits - veresiyeCollections;
  const net = totalDeposits - totalWithdrawals;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-medium text-gray-900">Nakit Akışı</h3>
      </div>
      <div className="divide-y divide-gray-100">
        <div className="px-4 py-3 flex justify-between items-center">
          <div>
            <span className="block text-sm font-medium text-gray-700">Veresiye Tahsilatı</span>
            <span className="text-xs text-gray-500">Müşteri alacakları</span>
          </div>
          <div className="text-base font-medium text-green-600">+₺{veresiyeCollections.toFixed(2)}</div>
        </div>

        <div className="px-4 py-3 flex justify-between items-center">
          <div>
            <span className="block text-sm font-medium text-gray-700">Diğer Nakit Girişler</span>
            <span className="text-xs text-gray-500">Tüm nakit girişleri</span>
          </div>
          <div className="text-base font-medium text-green-600">+₺{otherDeposits.toFixed(2)}</div>
        </div>

        <div className="px-4 py-3 flex justify-between items-center">
          <div>
            <span className="block text-sm font-medium text-gray-700">Nakit Çıkışlar</span>
            <span className="text-xs text-gray-500">Ödemeler ve giderler</span>
          </div>
          <div className="text-base font-medium text-red-600">-₺{totalWithdrawals.toFixed(2)}</div>
        </div>

        <div className="px-4 py-3 flex justify-between items-center bg-gray-50">
          <div>
            <span className="block text-sm font-medium text-gray-700">Net Nakit Akışı</span>
            <span className="text-xs text-gray-500">Toplam değişim</span>
          </div>
          <div className={`text-lg font-bold ${net >= 0 ? "text-green-600" : "text-red-600"}`}>
            {net >= 0 ? "+" : ""}₺{net.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlowCard;

