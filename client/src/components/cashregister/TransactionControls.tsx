// components/cashregister/TransactionControls.tsx
import React from "react";
import {
  ArrowDown,
  ArrowUp,
  UserCheck,
  DollarSign,
  FileText,
  Settings
} from "lucide-react";

interface TransactionControlsProps {
  onShowDepositModal: () => void;
  onShowWithdrawalModal: () => void;
  onShowCreditCollectionModal: () => void;
  onShowCountingModal: () => void;
  onCloseDay: () => void;
}

const TransactionControls: React.FC<TransactionControlsProps> = React.memo(({
  onShowDepositModal,
  onShowWithdrawalModal,
  onShowCreditCollectionModal,
  onShowCountingModal,
  onCloseDay
}) => {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings size={20} />
        <h3 className="text-lg font-semibold">İşlem Kontrolleri</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        <button
          onClick={onShowDepositModal}
          className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 justify-center transition-colors"
        >
          <ArrowDown size={16} />
          <span className="font-medium">Nakit Giriş</span>
        </button>
        
        <button
          onClick={onShowWithdrawalModal}
          className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center transition-colors"
        >
          <ArrowUp size={16} />
          <span className="font-medium">Nakit Çıkış</span>
        </button>
        
        <button
          onClick={onShowCreditCollectionModal}
          className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 justify-center transition-colors"
        >
          <UserCheck size={16} />
          <span className="font-medium">Veresiye Tahsilatı</span>
        </button>
        
        <button
          onClick={onShowCountingModal}
          className="px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2 justify-center transition-colors"
        >
          <DollarSign size={16} />
          <span className="font-medium">Kasa Sayım</span>
        </button>
        
        <button
          onClick={onCloseDay}
          className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 justify-center transition-colors"
        >
          <FileText size={16} />
          <span className="font-medium">Günü Kapat</span>
        </button>
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <strong>İpucu:</strong> İşlemlerinizi gerçekleştirmek için yukarıdaki butonları kullanın.
          Günü kapatmadan önce kasa sayımı yapmanız önerilir.
        </div>
      </div>
    </div>
  );
});

TransactionControls.displayName = "TransactionControls";

export default TransactionControls;