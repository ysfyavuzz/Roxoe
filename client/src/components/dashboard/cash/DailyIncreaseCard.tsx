import { Calendar, ArrowDown, ArrowUp, DollarSign } from "lucide-react";
import React from "react";

interface SessionDisplay {
  openingBalance: number;
  cashDepositTotal?: number | null;
  cashWithdrawalTotal?: number | null;
  countingAmount?: number | null;
}

interface DailyIncreaseCardProps {
  cashData: {
    isActive: boolean;
    openingBalance: number;
    totalDeposits: number;
    totalWithdrawals: number;
  };
  session: SessionDisplay | null;
  dailyIncrease: number;
}

const DailyIncreaseCard: React.FC<DailyIncreaseCardProps> = ({ cashData, session, dailyIncrease }) => {
  if (!session) {return null;}

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg shadow text-white p-5">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">Günün Gerçek Artışı</h2>
          <p className="text-indigo-100 mt-1">
            Açılış bakiyesi (₺{session.openingBalance.toFixed(2)}) hariç, kasadaki net değişim
          </p>
        </div>
        <div className="bg-white px-6 py-3 rounded-lg shadow mt-4 md:mt-0">
          <div className={`text-2xl font-bold ${dailyIncrease >= 0 ? "text-green-600" : "text-red-600"}`}>
            {dailyIncrease >= 0 ? "+" : ""}₺{dailyIncrease.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        <div className="bg-white bg-opacity-90 p-3 rounded-lg text-gray-800">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-indigo-600" />
            <div className="text-xs font-medium">Açılış</div>
          </div>
          <div className="text-lg font-semibold mt-1">₺{session.openingBalance.toFixed(2)}</div>
        </div>

        <div className="bg-white bg-opacity-90 p-3 rounded-lg text-gray-800">
          <div className="flex items-center gap-2">
            <ArrowDown className="h-4 w-4 text-green-600" />
            <div className="text-xs font-medium">Nakit Girişler</div>
          </div>
          <div className="text-lg font-semibold text-green-600 mt-1">
            +₺{(cashData.isActive ? cashData.totalDeposits : session.cashDepositTotal || 0).toFixed(2)}
          </div>
        </div>

        <div className="bg-white bg-opacity-90 p-3 rounded-lg text-gray-800">
          <div className="flex items-center gap-2">
            <ArrowUp className="h-4 w-4 text-red-600" />
            <div className="text-xs font-medium">Nakit Çıkışlar</div>
          </div>
          <div className="text-lg font-semibold text-red-600 mt-1">
            -₺{(cashData.isActive ? cashData.totalWithdrawals : session.cashWithdrawalTotal || 0).toFixed(2)}
          </div>
        </div>

        <div className="bg-white bg-opacity-90 p-3 rounded-lg text-gray-800">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-indigo-600" />
            <div className="text-xs font-medium">Sayım Sonucu</div>
          </div>
          <div className="text-lg font-semibold mt-1">
            {cashData.isActive ? "Henüz Yapılmadı" : session.countingAmount ? `₺${session.countingAmount.toFixed(2)}` : "Yapılmadı"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyIncreaseCard;

