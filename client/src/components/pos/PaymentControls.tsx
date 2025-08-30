// components/pos/PaymentControls.tsx
import { CreditCard, Banknote } from "lucide-react";
import React from "react";

import Button from "../ui/Button";

interface PaymentControlsProps {
  isRegisterOpen: boolean;
  hasCartItems: boolean;
  cartTotal: number;
  onQuickCashPayment: () => void | Promise<void>;
  onQuickCardPayment: () => void | Promise<void>;
  onShowPaymentModal: () => void;
  showError: (message: string) => void;
  compactView?: boolean;
}

const PaymentControls: React.FC<PaymentControlsProps> = React.memo(({
  isRegisterOpen,
  hasCartItems,
  cartTotal,
  onQuickCashPayment,
  onQuickCardPayment,
  onShowPaymentModal,
  showError,
  compactView = false
}) => {
  const handlePaymentAction = (action: () => void | Promise<void>) => {
    if (!isRegisterOpen) {
      showError("Kasa henüz açılmadı! Lütfen önce kasayı açın.");
      return;
    }
    action();
  };

  return (
    <div className="space-y-3">
      {/* Ana Ödeme Butonu */}
      <Button
        onClick={() => handlePaymentAction(onShowPaymentModal)}
        disabled={!hasCartItems}
        variant="primary"
        icon={CreditCard}
        className="w-full"
        data-testid="pay-button"
      >
        Ödeme Yap
      </Button>

      {/* Hızlı Ödeme Butonları */}
      <div className="flex gap-2">
        <Button
          onClick={() => handlePaymentAction(onQuickCashPayment)}
          disabled={!hasCartItems}
          variant="cash"
          icon={Banknote}
          className="flex-1"
          data-testid="quick-cash-button"
        >
          {compactView ? "Nakit" : "Hızlı Nakit"}
        </Button>

        <Button
          onClick={() => handlePaymentAction(onQuickCardPayment)}
          disabled={!hasCartItems}
          variant="card"
          icon={CreditCard}
          className="flex-1"
          data-testid="quick-card-button"
        >
          {compactView ? "Kart" : "Hızlı Kart"}
        </Button>
      </div>
    </div>
  );
});

PaymentControls.displayName = "PaymentControls";

export default PaymentControls;