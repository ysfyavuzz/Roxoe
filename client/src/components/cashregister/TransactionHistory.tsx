// components/cashregister/TransactionHistory.tsx
import React from "react";
import { FileText, Clock } from "lucide-react";
import { formatCurrency } from "../../utils/vatUtils";
import { CashRegisterStatus, CashTransactionType } from "../../types/cashRegister";

interface Transaction {
  id?: string;
  type: CashTransactionType;
  amount: number;
  date: string | Date;
  description?: string;
}

interface TransactionHistoryProps {
  registerStatus: CashRegisterStatus;
  openingDate: Date | null;
  openingBalance: number;
  transactions: Transaction[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = React.memo(({
  registerStatus,
  openingDate,
  openingBalance,
  transactions
}) => {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText size={20} />
        <h2 className="text-xl font-semibold">İşlem Geçmişi</h2>
      </div>
      
      {registerStatus === CashRegisterStatus.OPEN ? (
        <div className="space-y-2">
          {/* Opening Transaction */}
          {openingDate && (
            <TransactionItem
              type="opening"
              amount={openingBalance}
              date={openingDate}
              description="Kasa Açılış"
              isOpening={true}
            />
          )}

          {/* Transaction List */}
          {transactions.length > 0 ? (
            <div className="max-h-80 overflow-y-auto">
              {transactions.map((transaction, index) => (
                <TransactionItem
                  key={transaction.id || index}
                  type={transaction.type}
                  amount={transaction.amount}
                  date={transaction.date}
                  {...(transaction.description !== undefined && { description: transaction.description })}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-3">
              Henüz işlem bulunmuyor.
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-6">
          <Clock size={24} className="mx-auto mb-2 opacity-50" />
          <p>Kasa kapalı. İşlem geçmişi görüntülemek için kasayı açın.</p>
        </div>
      )}
    </div>
  );
});

// Individual Transaction Item Component
const TransactionItem: React.FC<{
  type: CashTransactionType | "opening";
  amount: number;
  date: string | Date;
  description?: string;
  isOpening?: boolean;
}> = React.memo(({ type, amount, date, description, isOpening = false }) => {
  const getTransactionDisplay = () => {
    if (isOpening) {
      return {
        title: "Kasa Açılış",
        color: "text-blue-600",
        sign: "",
        bgColor: "bg-blue-50"
      };
    }

    switch (type) {
      case CashTransactionType.DEPOSIT:
        return {
          title: "Nakit Giriş",
          color: "text-green-600",
          sign: "+",
          bgColor: description?.includes("Veresiye Tahsilatı") ? "bg-purple-50" : "bg-green-50"
        };
      case CashTransactionType.WITHDRAWAL:
        return {
          title: "Nakit Çıkış",
          color: "text-red-600",
          sign: "-",
          bgColor: "bg-red-50"
        };
      default:
        return {
          title: "İşlem",
          color: "text-gray-600",
          sign: "",
          bgColor: "bg-gray-50"
        };
    }
  };

  const { title, color, sign, bgColor } = getTransactionDisplay();
  const isVereisye = description?.includes("Veresiye Tahsilatı");

  return (
    <div
      className={`flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border-b ${
        isVereisye ? bgColor : ""
      }`}
    >
      <div>
        <div className="font-medium">
          {title}
          {description && ` - ${description}`}
        </div>
        <div className="text-xs text-gray-500">
          {new Date(date).toLocaleString("tr-TR")}
        </div>
      </div>
      <div className="text-right">
        <div className={`font-medium ${color}`}>
          {sign}{formatCurrency(amount)}
        </div>
        {isVereisye && (
          <div className="text-xs text-purple-600">
            Veresiye Tahsilatı
          </div>
        )}
        {isOpening && (
          <div className="text-xs text-blue-600">
            Başlangıç Bakiyesi
          </div>
        )}
      </div>
    </div>
  );
});

TransactionHistory.displayName = "TransactionHistory";

export default TransactionHistory;