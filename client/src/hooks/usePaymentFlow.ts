import { useCallback } from "react";

import { cashRegisterService } from "../services/cashRegisterDB";
import { creditService } from "../services/creditServices";
import { productService } from "../services/productDB";
import { salesDB } from "../services/salesDB";
import { Customer } from "../types/credit";
import { PaymentMethod, PaymentResult, CartItem } from "../types/pos";
import { Product } from "../types/product";
import { Sale } from "../types/sales";

interface UsePaymentFlowParams {
  activeTab: { cart: CartItem[] } | undefined;
  cartTotals: { subtotal: number; vatAmount: number; total: number };
  products: Product[];
  selectedCustomer: Customer | null;
  clearCart: () => void;
  setSelectedCustomer: (c: Customer | null) => void;
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
}

export function usePaymentFlow({
  activeTab,
  cartTotals,
  products,
  selectedCustomer,
  clearCart,
  setSelectedCustomer,
  showSuccess,
  showError,
}: UsePaymentFlowParams) {
  const handlePaymentComplete = useCallback(async (paymentResult: PaymentResult) => {
    if (!activeTab) {return;}
    const { subtotal, vatAmount, total } = cartTotals;

    let paymentMethodForSale: PaymentMethod = "nakit";
    let cashReceived: number | undefined;
    let splitDetails: Sale["splitDetails"] | undefined = undefined;

    const discount = paymentResult.discount;

    let finalTotal = total;
    let originalTotal: number | undefined = undefined;

    if (discount) {
      finalTotal = discount.discountedTotal;
      originalTotal = total;
    }

    if (paymentResult.mode === "normal") {
      paymentMethodForSale = paymentResult.paymentMethod;
      cashReceived = paymentResult.received;
    } else {
      paymentMethodForSale = "mixed";
      splitDetails = {
        productPayments: paymentResult.productPayments || [],
        equalPayments: paymentResult.equalPayments || [],
      } as Sale["splitDetails"];
    }

    const saleData: Omit<Sale, "id"> = {
      items: activeTab.cart.map((item: CartItem) => ({
        ...item,
        salePrice: item.salePrice,
        priceWithVat: item.priceWithVat,
        total: item.salePrice * item.quantity,
        totalWithVat: item.priceWithVat * item.quantity,
        vatAmount: (item.priceWithVat - item.salePrice) * item.quantity,
      })),
      subtotal,
      vatAmount,
      total: finalTotal,
      paymentMethod: paymentMethodForSale,
      date: new Date(),
      status: "completed",
      receiptNo: salesDB.generateReceiptNo(),
      ...(originalTotal !== undefined && { originalTotal }),
      ...(discount && { discount }),
      ...(cashReceived !== undefined && { cashReceived }),
      ...((paymentResult.mode === "normal" &&
        (paymentResult.paymentMethod === "nakit" ||
          paymentResult.paymentMethod === "nakitpos")) && {
        changeAmount: (cashReceived || 0) - finalTotal,
      }),
      ...(splitDetails && { splitDetails }),
    };

    try {
      const newSale = await salesDB.addSale(saleData);

      try {
        const activeSession = await cashRegisterService.getActiveSession();
        if (activeSession) {
          if (paymentResult.mode === "normal") {
            if (paymentResult.paymentMethod === "nakit") {
              await cashRegisterService.recordSale(finalTotal, 0);
            } else if (paymentResult.paymentMethod === "kart") {
              await cashRegisterService.recordSale(0, finalTotal);
            } else if (paymentResult.paymentMethod === "nakitpos") {
              await cashRegisterService.recordSale(finalTotal, 0);
            }
          } else {
            let totalCash = 0;
            let totalCard = 0;
            if (paymentResult.productPayments) {
              for (const payment of paymentResult.productPayments) {
                if (payment.paymentMethod === "nakit" || payment.paymentMethod === "nakitpos") {
                  totalCash += payment.received;
                } else if (payment.paymentMethod === "kart") {
                  totalCard += payment.received;
                }
              }
            }
            if (paymentResult.equalPayments) {
              for (let i = 0; i < paymentResult.equalPayments.length; i++) {
                const eq = paymentResult.equalPayments[i];
                if (eq && (eq.paymentMethod === "nakit" || eq.paymentMethod === "nakitpos")) {
                  totalCash += eq.received;
                } else if (eq && eq.paymentMethod === "kart") {
                  totalCard += eq.received;
                }
              }
            }
            await cashRegisterService.recordSale(totalCash, totalCard);
          }
        }
      } catch (cashError) {
        console.error("Kasa kaydı güncellenirken hata:", cashError);
      }

      if (paymentResult.mode === "normal") {
        if (paymentResult.paymentMethod === "veresiye" && selectedCustomer) {
          await creditService.addTransaction({
            customerId: selectedCustomer.id,
            type: "debt",
            amount: finalTotal,
            date: new Date(),
            description: `Fiş No: ${newSale.receiptNo}`,
          });
        }
      } else {
        if (paymentResult.productPayments) {
          for (const pp of paymentResult.productPayments) {
            if (pp.paymentMethod === "veresiye" && pp.customer) {
              await creditService.addTransaction({
                customerId: pp.customer.id,
                type: "debt",
                amount: pp.received,
                date: new Date(),
                description: `Fiş No: ${newSale.receiptNo} (Ürün ID: ${pp.itemId})`,
              });
            }
          }
        }
        if (paymentResult.equalPayments) {
          for (let i = 0; i < paymentResult.equalPayments.length; i++) {
            const eq = paymentResult.equalPayments[i];
            if (eq && eq.paymentMethod === "veresiye" && eq.customer) {
              await creditService.addTransaction({
                customerId: eq.customer.id,
                type: "debt",
                amount: eq.received,
                date: new Date(),
                description: `Fiş No: ${newSale.receiptNo} (Kişi ${i + 1})`,
              });
            }
          }
        }
      }

      for (const cartItem of activeTab.cart) {
        await productService.updateStock(cartItem.id, -cartItem.quantity);
      }

      clearCart();
      setSelectedCustomer(null);

      products.forEach((product: Product) => {
        const cartItem = activeTab.cart.find((item: CartItem) => item.id === product.id);
        if (cartItem) {
          product.stock -= cartItem.quantity;
        }
      });

      showSuccess(`Satış başarıyla tamamlandı! Fiş No: ${newSale.receiptNo}`);
    } catch (error) {
      console.error("Satış kaydedilirken hata:", error);
      showError("Satış sırasında bir hata oluştu!");
    }
  }, [activeTab, cartTotals, selectedCustomer, clearCart, setSelectedCustomer, products, showSuccess, showError]);

  return { handlePaymentComplete };
}

