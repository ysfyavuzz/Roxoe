import React from "react";
import { formatCurrency } from "../../../utils/vatUtils";
import { PaymentMethod } from "../../../types/pos";
import { Customer } from "../../../types/credit";

interface EqualPayment {
  paymentMethod: PaymentMethod;
  received: string;
  customerId: string;
}

interface EqualSplitSectionProps {
  friendCount: number;
  discountedTotal: number;
  equalPayments: EqualPayment[];
  remainingTotal: number;
  paymentMethods: { method: PaymentMethod; icon: string; label: string }[];
  customers: Customer[];
  calculateRemainingForPerson: (index: number) => number;
  onFriendCountDecrease: () => void;
  onFriendCountIncrease: () => void;
  onPaymentChange: (index: number, updates: EqualPayment) => void;
  onOpenCustomerModal: (index: number) => void;
}

const EqualSplitSection: React.FC<EqualSplitSectionProps> = ({
  friendCount,
  discountedTotal,
  equalPayments,
  remainingTotal,
  paymentMethods,
  customers,
  calculateRemainingForPerson,
  onFriendCountDecrease,
  onFriendCountIncrease,
  onPaymentChange,
  onOpenCustomerModal,
}) => {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">Kişi Sayısı</label>
        <div className="flex items-center">
          <button onClick={onFriendCountDecrease} className="h-10 w-10 flex items-center justify-center text-lg font-bold bg-gray-100 rounded-l-md">-</button>
          <div className="h-10 min-w-10 flex items-center justify-center text-lg font-bold px-3 border-y border-gray-200">{friendCount}</div>
          <button onClick={onFriendCountIncrease} className="h-10 w-10 flex items-center justify-center text-lg font-bold bg-gray-100 rounded-r-md">+</button>
          <div className="ml-3 text-sm">
            <span className="text-gray-700">Kişi Başına:</span>{" "}
            <span className="font-bold text-indigo-600">{formatCurrency(discountedTotal / Math.max(friendCount,1))}</span>
          </div>
        </div>
      </div>

      {Array.from({ length: friendCount }, (_, i) => {
        const p = equalPayments[i] || { paymentMethod: "nakit" as PaymentMethod, received: "", customerId: "" };
        const personRemaining = calculateRemainingForPerson(i);
        return (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-900">Kişi {i + 1}</h4>
              {i === 0 ? (
                <span className="text-xs text-gray-600">Toplam: {formatCurrency(discountedTotal)}</span>
              ) : (
                <span className="text-xs text-gray-600">Kalan: {formatCurrency(personRemaining)}</span>
              )}
            </div>

            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Ödeme Yöntemi</label>
              <div className="grid grid-cols-3 gap-1">
                {paymentMethods.map(({ method, icon, label }) => (
                  <button
                    key={method}
                    onClick={() => onPaymentChange(i, { ...p, paymentMethod: method })}
                    className={`flex items-center justify-center gap-1 py-2 rounded-md ${p.paymentMethod === method ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    <span className="text-sm">{icon}</span>
                    <span className="text-xs">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Alınan Tutar</label>
              <input
                type="number"
                placeholder="Ödeme Tutarı"
                value={p.received}
                onWheel={(e) => e.currentTarget.blur()}
                onChange={(e) => onPaymentChange(i, { ...p, received: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {parseFloat(p.received) > personRemaining && personRemaining > 0 && (
                <div className="mt-1 text-green-600 font-medium text-xs">
                  Para Üstü: {formatCurrency(parseFloat(p.received) - personRemaining)}
                </div>
              )}
            </div>

            {p.paymentMethod === 'veresiye' && (
              <div className="mb-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Müşteri Seçin</label>
                <button onClick={() => onOpenCustomerModal(i)} className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm">Müşteri Seç</button>
              </div>
            )}
          </div>
        );
      })}

      {equalPayments.some((p) => parseFloat(p.received) > 0) && (
        <div className="bg-gray-50 rounded-xl p-5">
          <h4 className="text-md font-medium text-gray-900 mb-3">Ödeme Özeti</h4>
          <div className="space-y-3 text-md">
            <div className="flex justify-between">
              <span className="font-medium">Toplam Alınan:</span>
              <span>{formatCurrency(equalPayments.reduce((sum, x) => sum + (parseFloat(x.received) || 0), 0))}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Toplam Tutar:</span>
              <span>{formatCurrency(discountedTotal)}</span>
            </div>
            {remainingTotal > 0 && (
              <div className="flex justify-between text-red-600 font-medium">
                <span>Kalan Ödeme:</span>
                <span>{formatCurrency(remainingTotal)}</span>
              </div>
            )}
            {remainingTotal < 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Fazla Ödeme:</span>
                <span>{formatCurrency(Math.abs(remainingTotal))}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EqualSplitSection;

