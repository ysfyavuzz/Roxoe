import React from "react";

import { formatCurrency } from "../../../utils/vatUtils";

interface PaymentHeaderProps {
  subtotal: number;
  vatAmount: number;
  total: number;
  applyDiscount: boolean;
  discountedTotal: number;
  onClose: () => void;
}

const PaymentHeader: React.FC<PaymentHeaderProps> = ({
  subtotal,
  vatAmount,
  total,
  applyDiscount,
  discountedTotal,
  onClose,
}) => {
  return (
    <div className="px-5 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
      <div className="flex-1">
        <h2 className="text-xl font-semibold text-gray-900">Ödeme</h2>
        <p className="text-gray-500 text-sm">
          {formatCurrency(subtotal)} + KDV {formatCurrency(vatAmount)}
        </p>
      </div>

      <div className="text-right">
        <p className="text-gray-500 text-sm">Toplam</p>
        <p className="text-2xl font-bold text-indigo-600">
          {applyDiscount ? (
            <>
              <span className="line-through text-gray-400 text-sm mr-2">
                {formatCurrency(total)}
              </span>
              {formatCurrency(discountedTotal)}
            </>
          ) : (
            formatCurrency(total)
          )}
        </p>
      </div>

      <button
        onClick={onClose}
        className="ml-3 p-2 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default PaymentHeader;

