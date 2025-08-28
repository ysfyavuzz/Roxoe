import React from "react";

interface PaymentTypeToggleProps {
  mode: "normal" | "split";
  onChange: (mode: "normal" | "split") => void;
}

const PaymentTypeToggle: React.FC<PaymentTypeToggleProps> = ({ mode, onChange }) => {
  return (
    <div className="p-4 border-b border-gray-200">
      <h3 className="text-base font-medium text-gray-900 mb-3">Ödeme Türü</h3>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onChange("normal")}
          className={`py-3 rounded-lg text-base font-medium transition-all ${
            mode === "normal"
              ? "bg-indigo-600 text-white shadow"
              : "bg-white border border-gray-200 text-gray-700 hover:border-indigo-300"
          }`}
        >
          Normal Ödeme
        </button>
        <button
          onClick={() => onChange("split")}
          className={`py-3 rounded-lg text-base font-medium transition-all ${
            mode === "split"
              ? "bg-indigo-600 text-white shadow"
              : "bg-white border border-gray-200 text-gray-700 hover:border-indigo-300"
          }`}
        >
          Bölünmüş Ödeme
        </button>
      </div>
    </div>
  );
};

export default PaymentTypeToggle;

