import React from "react";

interface PaymentFooterProps {
  disabled: boolean;
  primaryText: string;
  onPrimaryClick: () => void;
  onCancel: () => void;
}

const PaymentFooter: React.FC<PaymentFooterProps> = ({
  disabled,
  primaryText,
  onPrimaryClick,
  onCancel,
}) => {
  return (
    <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 space-y-3">
      <button
        onClick={onPrimaryClick}
        disabled={disabled}
        className={`w-full py-3 rounded-lg text-base font-bold transition-all ${
          disabled
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-green-600 text-white hover:bg-green-700 shadow"
        }`}
      >
        {primaryText}
      </button>

      <button
        onClick={onCancel}
        className="w-full py-3 rounded-lg text-base font-medium border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
      >
        İptal
      </button>
    </div>
  );
};

export default PaymentFooter;

