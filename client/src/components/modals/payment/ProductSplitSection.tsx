import React from "react";
import { formatCurrency } from "../../../utils/vatUtils";
import { PaymentMethod } from "../../../types/pos";
import { Customer } from "../../../types/credit";

// Types reused from PaymentModal
export type PosItem = {
  id: number;
  name: string;
  amount: number;
  quantity: number;
};

export type ProductPaymentInput = {
  paymentMethod: PaymentMethod;
  received: string;
  customerId: string;
  selectedQuantity: number;
};

export type ProductPaymentData = {
  itemId: number;
  paymentMethod: PaymentMethod;
  paidQuantity: number;
  paidAmount: number;
  received: number;
  customer?: Customer | null;
};

interface ProductSplitSectionProps {
  remainingItems: PosItem[];
  productPaymentInputs: Record<number, ProductPaymentInput>;
  productPayments: ProductPaymentData[];
  customers: Customer[];
  paymentMethods: { method: PaymentMethod; icon: string; label: string }[];
  onQuantityChange: (itemId: number, newQty: number) => void;
  onSetPaymentMethod: (itemId: number, method: PaymentMethod) => void;
  onSetReceived: (itemId: number, value: string) => void;
  onOpenCustomerModal: (itemId: number) => void;
  onProductPay: (itemId: number) => void;
}

const ProductSplitSection: React.FC<ProductSplitSectionProps> = ({
  remainingItems,
  productPaymentInputs,
  productPayments,
  customers,
  paymentMethods,
  onQuantityChange,
  onSetPaymentMethod,
  onSetReceived,
  onOpenCustomerModal,
  onProductPay,
}) => {
  return (
    <div className="space-y-5">
      {/* Kalan Ürünler */}
      {remainingItems.length > 0 && (
        <>
          <h3 className="text-md font-medium text-gray-900">Kalan Ürünler</h3>
          {remainingItems.map((item) => {
            const input = productPaymentInputs[item.id];
            const unitPrice = item.quantity > 0 ? item.amount / item.quantity : 0;
            const partialCost = unitPrice * (input?.selectedQuantity || 0);
            const receivedNum = parseFloat(input?.received || "0") || 0;
            const showChange =
              (input?.paymentMethod === "nakit" || input?.paymentMethod === "nakitpos") &&
              receivedNum > partialCost &&
              partialCost > 0;

            return (
              <div key={item.id} className="bg-white rounded-xl border-2 border-gray-200 p-5 mb-3">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-md font-medium text-gray-900">{item.name}</span>
                  <span className="text-md text-gray-600">
                    {item.quantity} adet × {formatCurrency(unitPrice)}
                  </span>
                </div>

                {/* Adet Seçimi */}
                <div className="mb-5">
                  <label className="block text-md font-medium text-gray-700 mb-2">Adet Seçin</label>
                  <div className="flex items-center">
                    <button
                      onClick={() => onQuantityChange(item.id, (input?.selectedQuantity || 0) - 1)}
                      disabled={(input?.selectedQuantity || 0) <= 0}
                      className="h-12 w-12 flex items-center justify-center text-2xl bg-gray-100 rounded-l-lg disabled:text-gray-300"
                    >
                      -
                    </button>
                    <span className="h-12 min-w-12 flex items-center justify-center text-md font-bold px-4 border-y-2 border-gray-200">
                      {input?.selectedQuantity || 0}
                    </span>
                    <button
                      onClick={() => onQuantityChange(item.id, (input?.selectedQuantity || 0) + 1)}
                      disabled={(input?.selectedQuantity || 0) >= item.quantity}
                      className="h-12 w-12 flex items-center justify-center text-2xl bg-gray-100 rounded-r-lg disabled:text-gray-300"
                    >
                      +
                    </button>
                    <span className="ml-4 text-md">Toplam: <b>{formatCurrency(partialCost)}</b></span>
                  </div>
                </div>

                {/* Ödeme Yöntemi Seçimi */}
                <div className="mb-4">
                  <label className="block text-md font-medium text-gray-700 mb-2">Ödeme Yöntemi</label>
                  <div className="grid grid-cols-3 gap-2">
                    {paymentMethods.map(({ method, icon, label }) => (
                      <button
                        key={method}
                        onClick={() => onSetPaymentMethod(item.id, method)}
                        className={`flex items-center justify-center gap-2 py-3 rounded-lg ${
                          (input?.paymentMethod || "nakit") === method
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        <span className="text-md">{icon}</span>
                        <span className="text-md">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Alınan Tutar */}
                <div className="mb-4">
                  <label className="block text-md font-medium text-gray-700 mb-2">Alınan Tutar</label>
                  <input
                    type="number"
                    placeholder={`Min: ${formatCurrency(partialCost)}`}
                    value={input?.received || ""}
                    onWheel={(e) => e.currentTarget.blur()}
                    onChange={(e) => onSetReceived(item.id, e.target.value)}
                    className="w-full px-4 py-3 text-md rounded-lg border-2 border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {showChange && (
                    <div className="mt-2 text-green-600 font-medium text-md">
                      Para Üstü: {formatCurrency(receivedNum - partialCost)}
                    </div>
                  )}
                </div>

                {/* Veresiye müşteri */}
                {(input?.paymentMethod === "veresiye") && (
                  <div className="mb-4">
                    <label className="block text-md font-medium text-gray-700 mb-2">Müşteri Seçin</label>
                    <button
                      onClick={() => onOpenCustomerModal(item.id)}
                      className="px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Müşteri Seç
                    </button>
                  </div>
                )}

                {/* Ürün seviyesinde ödeme butonu */}
                <button
                  onClick={() => onProductPay(item.id)}
                  disabled={
                    (input?.selectedQuantity || 0) === 0 ||
                    receivedNum < partialCost ||
                    (input?.paymentMethod === "veresiye" && !(input?.customerId))
                  }
                  className={`w-full py-3 rounded-lg text-md font-medium transition-all ${
                    (input?.selectedQuantity || 0) === 0 ||
                    receivedNum < partialCost ||
                    (input?.paymentMethod === "veresiye" && !(input?.customerId))
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  Ürünü Öde
                </button>
              </div>
            );
          })}
        </>
      )}

      {/* Tamamlanan Ödemeler */}
      {productPayments.length > 0 && (
        <div className="mt-6">
          <h3 className="text-md font-medium text-gray-900 mb-3">Tamamlanan Ödemeler</h3>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="space-y-3">
              {productPayments.map((pmt, i) => (
                <div key={i} className="bg-white rounded-lg p-4 border border-gray-200 flex justify-between">
                  <div>
                    <span className="font-medium text-md">{pmt.itemId}</span>
                    <div className="text-gray-500 mt-1">
                      {pmt.paidQuantity} adet, {pmt.paymentMethod}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-md text-indigo-600">
                      {formatCurrency(pmt.received)}
                    </div>
                    {pmt.received > pmt.paidAmount && (
                      <div className="text-green-600">
                        Para Üstü: {formatCurrency(pmt.received - pmt.paidAmount)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSplitSection;

