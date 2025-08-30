import React from "react";

interface QuantityModeToastProps {
  visible: boolean;
  active: boolean;
  quantityText: string | number;
}

const QuantityModeToast: React.FC<QuantityModeToastProps> = React.memo(({ visible, active, quantityText }) => {
  if (!visible) {return null;}
  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        active ? "bg-green-500 text-white" : "bg-gray-500 text-white"
      } px-4 py-2 rounded-lg shadow-lg`}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium">Miktar Modu:</span>
        {quantityText || "0"}
      </div>
    </div>
  );
});

QuantityModeToast.displayName = "QuantityModeToast";

export default QuantityModeToast;

