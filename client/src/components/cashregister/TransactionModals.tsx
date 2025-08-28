// components/cashregister/TransactionModals.tsx
import React from "react";
import { formatCurrency } from "../../utils/vatUtils";

interface Customer {
  id: number;
  name: string;
  currentDebt: number;
}

interface TransactionModalsProps {
  // Deposit Modal
  showDepositModal: boolean;
  setShowDepositModal: (show: boolean) => void;
  onCashDeposit: () => void;
  
  // Withdrawal Modal
  showWithdrawalModal: boolean;
  setShowWithdrawalModal: (show: boolean) => void;
  onCashWithdrawal: () => void;
  
  // Credit Collection Modal
  showCreditCollectionModal: boolean;
  setShowCreditCollectionModal: (show: boolean) => void;
  onCreditCollection: () => void;
  customers: Customer[];
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  
  // Counting Modal
  showCountingModal: boolean;
  setShowCountingModal: (show: boolean) => void;
  onCounting: () => void;
  theoreticalBalance: number;
  countingInputAmount: string;
  setCountingInputAmount: (amount: string) => void;
  
  // Shared Transaction Data
  transactionAmount: string;
  setTransactionAmount: (amount: string) => void;
  transactionDescription: string;
  setTransactionDescription: (description: string) => void;
}

const TransactionModals: React.FC<TransactionModalsProps> = React.memo(({
  showDepositModal,
  setShowDepositModal,
  onCashDeposit,
  showWithdrawalModal,
  setShowWithdrawalModal,
  onCashWithdrawal,
  showCreditCollectionModal,
  setShowCreditCollectionModal,
  onCreditCollection,
  customers,
  selectedCustomer,
  setSelectedCustomer,
  showCountingModal,
  setShowCountingModal,
  onCounting,
  theoreticalBalance,
  countingInputAmount,
  setCountingInputAmount,
  transactionAmount,
  setTransactionAmount,
  transactionDescription,
  setTransactionDescription
}) => {
  return (
    <>
      {/* Deposit Modal */}
      <ModalContainer isVisible={showDepositModal}>
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-medium mb-4">Nakit Giriş Ekle</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tutar
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded-lg"
                placeholder="0.00"
                onWheel={(e) => e.currentTarget.blur()}
                value={transactionAmount}
                onChange={(e) => setTransactionAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg"
                placeholder="Açıklama girin"
                value={transactionDescription}
                onChange={(e) => setTransactionDescription(e.target.value)}
              />
            </div>
            <ModalButtons
              onCancel={() => setShowDepositModal(false)}
              onConfirm={onCashDeposit}
              confirmText="Ekle"
            />
          </div>
        </div>
      </ModalContainer>

      {/* Withdrawal Modal */}
      <ModalContainer isVisible={showWithdrawalModal}>
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-medium mb-4">Nakit Çıkış Ekle</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tutar
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded-lg"
                placeholder="0.00"
                onWheel={(e) => e.currentTarget.blur()}
                value={transactionAmount}
                onChange={(e) => setTransactionAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg"
                placeholder="Açıklama girin"
                value={transactionDescription}
                onChange={(e) => setTransactionDescription(e.target.value)}
              />
            </div>
            <ModalButtons
              onCancel={() => setShowWithdrawalModal(false)}
              onConfirm={onCashWithdrawal}
              confirmText="Ekle"
            />
          </div>
        </div>
      </ModalContainer>

      {/* Credit Collection Modal */}
      <ModalContainer isVisible={showCreditCollectionModal}>
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-medium mb-4">Veresiye Tahsilatı</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Müşteri Seçin
              </label>
              <select
                className="w-full p-2 border rounded-lg"
                value={selectedCustomer?.id || ""}
                onChange={(e) => {
                  const customerId = e.target.value;
                  const customer = customers.find(
                    (c) => c.id.toString() === customerId
                  );
                  setSelectedCustomer(customer || null);
                }}
              >
                <option value="">Müşteri Seçin</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} (Borç: {formatCurrency(customer.currentDebt)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tahsilat Tutarı
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded-lg"
                placeholder="0.00"
                onWheel={(e) => e.currentTarget.blur()}
                value={transactionAmount}
                onChange={(e) => setTransactionAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg"
                placeholder="Açıklama girin (opsiyonel)"
                value={transactionDescription}
                onChange={(e) => setTransactionDescription(e.target.value)}
              />
            </div>
            <ModalButtons
              onCancel={() => setShowCreditCollectionModal(false)}
              onConfirm={onCreditCollection}
              confirmText="Tahsilat Yap"
            />
          </div>
        </div>
      </ModalContainer>

      {/* Counting Modal */}
      <ModalContainer isVisible={showCountingModal}>
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-medium mb-4">Kasa Sayımı</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sayılan Nakit Tutar
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded-lg"
                placeholder="0.00"
                value={countingInputAmount}
                onWheel={(e) => e.currentTarget.blur()}
                onChange={(e) => setCountingInputAmount(e.target.value)}
              />
            </div>
            <div className="text-sm text-gray-500">
              <p>Teorik Kasa Bakiyesi: {formatCurrency(theoreticalBalance)}</p>
              <p>Bu bakiye ile sayımınız arasındaki fark hesaplanacaktır.</p>
            </div>
            <ModalButtons
              onCancel={() => setShowCountingModal(false)}
              onConfirm={onCounting}
              confirmText="Kaydet"
            />
          </div>
        </div>
      </ModalContainer>
    </>
  );
});

// Reusable Modal Container
const ModalContainer: React.FC<{
  isVisible: boolean;
  children: React.ReactNode;
}> = ({ isVisible, children }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {children}
    </div>
  );
};

// Reusable Modal Buttons
const ModalButtons: React.FC<{
  onCancel: () => void;
  onConfirm: () => void;
  confirmText: string;
}> = ({ onCancel, onConfirm, confirmText }) => (
  <div className="flex justify-end space-x-2">
    <button
      onClick={onCancel}
      className="px-4 py-2 border rounded-lg hover:bg-gray-50"
    >
      İptal
    </button>
    <button
      onClick={onConfirm}
      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
    >
      {confirmText}
    </button>
  </div>
);

TransactionModals.displayName = "TransactionModals";

export default TransactionModals;