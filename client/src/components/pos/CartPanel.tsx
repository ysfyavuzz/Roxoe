// components/pos/CartPanel.tsx
import { ShoppingCart, Plus, Minus, X, Trash2 } from "lucide-react";
import React from "react";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";

import { CartItem, CartTab } from "../../types/pos";
import { formatCurrency } from "../../utils/vatUtils";
import { useAlert } from "../AlertProvider";

import PaymentControls from "./PaymentControls";

interface CartTotals {
  subtotal: number;
  vatAmount: number;
  total: number;
  vatBreakdown: Array<{ 
    rate: number; 
    baseAmount: number; 
    vatAmount: number; 
    totalAmount: number; 
  }>;
}

interface CartPanelProps {
  // Cart Management
  cartTabs: CartTab[];
  activeTabId: string;
  activeTab: CartTab | undefined;
  setActiveTabId: (id: string) => void;
  onAddNewTab: () => void;
  onRemoveTab: (id: string) => void;
  onUpdateQuantity: (itemId: number, delta: number) => void;
  onRemoveFromCart: (itemId: number) => void;
  onClearCart: () => void;
  
  // Cart Display
  compactCartView: boolean;
  setCompactCartView: (compact: boolean) => void;
  cartTotals: CartTotals;
  
  // Payment
  onShowPaymentModal: () => void;
  onQuickCashPayment: () => void;
  onQuickCardPayment: () => void;
  isRegisterOpen: boolean;
  
  // UI
  onConfirm: (message: string) => Promise<boolean>;
}

const CartPanel: React.FC<CartPanelProps> = React.memo(({
  cartTabs,
  activeTabId,
  activeTab,
  setActiveTabId,
  onAddNewTab,
  onRemoveTab,
  onUpdateQuantity,
  onRemoveFromCart,
  onClearCart,
  compactCartView,
  setCompactCartView,
  cartTotals,
  onShowPaymentModal,
  onQuickCashPayment,
  onQuickCardPayment,
  isRegisterOpen,
  onConfirm
}) => {
  const { showError } = useAlert();
  const handleTabRemove = async (tabId: string, hasItems: boolean) => {
    if (hasItems) {
      const tab = cartTabs.find(t => t.id === tabId);
      const confirmed = await onConfirm(
        `${tab?.title} sepetini silmek istediğinize emin misiniz?`
      );
      if (confirmed) {onRemoveTab(tabId);}
    } else {
      onRemoveTab(tabId);
    }
  };

  const handleClearCart = async () => {
    const confirmed = await onConfirm(
      "Sepeti tamamen temizlemek istediğinize emin misiniz?"
    );
    if (confirmed) {
      onClearCart();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm flex flex-col h-full">
      {/* Sepet Sekmeleri */}
      <div className="flex items-center justify-between p-3 border-b overflow-x-auto">
        <div className="flex items-center gap-2 overflow-x-auto">
          {cartTabs.map((tab) => {
            const itemCount = tab.cart.reduce((sum, i) => sum + i.quantity, 0);
            return (
              <div
                key={tab.id}
                className={`group flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer ${
                  activeTabId === tab.id
                    ? "bg-indigo-50 text-indigo-600"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setActiveTabId(tab.id)}
              >
                <ShoppingCart size={14} />
                <span className="truncate max-w-[60px]">{tab.title}</span>
                <span className="text-xs text-gray-500">({itemCount})</span>
                {cartTabs.length > 1 && (
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      await handleTabRemove(tab.id, tab.cart.length > 0);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded"
                  >
                    <X size={12} className="text-red-500" />
                  </button>
                )}
              </div>
            );
          })}
          <button
            onClick={onAddNewTab}
            className="p-1 rounded-lg hover:bg-gray-50 text-indigo-600"
            title="Yeni Sepet"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Kompakt görünüm butonu */}
        <button
          onClick={() => setCompactCartView(!compactCartView)}
          className={`p-1 rounded-lg ${
            compactCartView
              ? "bg-indigo-50 text-indigo-600"
              : "text-gray-500 hover:bg-gray-50"
          }`}
          title={compactCartView ? "Normal Görünüm" : "Kompakt Görünüm"}
        >
          {compactCartView ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M8 16h.01" />
              <path d="M12 16h.01" />
              <path d="M16 16h.01" />
              <path d="M8 12h.01" />
              <path d="M12 12h.01" />
              <path d="M16 12h.01" />
              <path d="M8 8h.01" />
              <path d="M12 8h.01" />
              <path d="M16 8h.01" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Aktif Sepet İçeriği */}
      {activeTab && (
        <>
          {/* Sepet Başlık */}
          <div className="p-3 border-b">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <ShoppingCart size={18} />
                {activeTab.cart.reduce((sum, i) => sum + i.quantity, 0)} Ürün
              </h2>
              {activeTab.cart.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="text-red-500 hover:text-red-600 p-1"
                  title="Sepeti Temizle"
                  data-testid="clear-cart-button"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Sepet Öğeleri */}
          <div className="flex-1 overflow-y-auto">
            {activeTab.cart.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <ShoppingCart size={40} className="mx-auto mb-2 opacity-50" />
                <p>Sepet boş</p>
              </div>
            ) : compactCartView ? (
              <CompactCartView
                items={activeTab.cart}
                onUpdateQuantity={onUpdateQuantity}
                onRemoveFromCart={onRemoveFromCart}
              />
            ) : (
              <NormalCartView
                items={activeTab.cart}
                onUpdateQuantity={onUpdateQuantity}
                onRemoveFromCart={onRemoveFromCart}
              />
            )}
          </div>

          {/* Toplam & Ödeme */}
          <div className="border-t p-3">
            <div className="space-y-2 mb-3">
              <div className="flex justify-between font-semibold text-lg">
                <span>Toplam:</span>
                <span className="text-indigo-600">
                  {formatCurrency(cartTotals.total)}
                </span>
              </div>
            </div>

            <PaymentControls
              isRegisterOpen={isRegisterOpen}
              hasCartItems={activeTab.cart.length > 0}
              cartTotal={cartTotals.total}
              onQuickCashPayment={() => Promise.resolve(onQuickCashPayment())}
              onQuickCardPayment={() => Promise.resolve(onQuickCardPayment())}
              onShowPaymentModal={onShowPaymentModal}
              showError={showError}
              compactView={compactCartView}
            />
          </div>
        </>
      )}
    </div>
  );
});

// Kompakt Sepet Görünümü
const CompactCartView: React.FC<{
  items: CartItem[];
  onUpdateQuantity: (itemId: number, delta: number) => void;
  onRemoveFromCart: (itemId: number) => void;
}> = ({ items, onUpdateQuantity, onRemoveFromCart }) => {
  const ITEM_SIZE = 44;
  const THRESHOLD = 50;

  const Row = ({ index, style, data }: ListChildComponentProps<CartItem[]>) => {
    const item = data[index] as CartItem;
    return (
      <div style={style} className="flex items-center px-2 py-1 hover:bg-gray-50">
        <div className="flex-1 mr-1 truncate">
          <div className="font-medium text-sm truncate">{item.name}</div>
        </div>
        <div className="text-gray-900 text-sm font-medium whitespace-nowrap">
          {formatCurrency(item.totalWithVat || 0)}
        </div>
        <div className="flex items-center ml-1">
          <button onClick={() => onUpdateQuantity(item.id, -1)} className="p-0.5 hover:bg-gray-200 rounded">
            <Minus size={14} />
          </button>
          <span className="w-6 text-center text-sm">{item.quantity}</span>
          <button onClick={() => onUpdateQuantity(item.id, 1)} className="p-0.5 hover:bg-gray-200 rounded">
            <Plus size={14} />
          </button>
          <button onClick={() => onRemoveFromCart(item.id)} className="p-0.5 hover:bg-gray-200 rounded text-red-500 ml-1">
            <X size={14} />
          </button>
        </div>
      </div>
    );
  };

  if (items.length > THRESHOLD) {
    return (
      <List
        height={Math.min(400, items.length * ITEM_SIZE)}
        itemCount={items.length}
        itemSize={ITEM_SIZE}
        width={"100%"}
        itemData={items}
      >
        {Row}
      </List>
    );
  }

  return (
    <div className="py-1">
      {items.map((item, idx) => (
        <Row key={item.id} index={idx} style={{}} data={items} />
      ))}
    </div>
  );
};

// Normal Sepet Görünümü
const NormalCartView: React.FC<{
  items: CartItem[];
  onUpdateQuantity: (itemId: number, delta: number) => void;
  onRemoveFromCart: (itemId: number) => void;
}> = ({ items, onUpdateQuantity, onRemoveFromCart }) => {
  const ITEM_SIZE = 56;
  const THRESHOLD = 40;

  const Row = ({ index, style, data }: ListChildComponentProps<CartItem[]>) => {
    const item = data[index] as CartItem;
    return (
      <div style={style} className="flex items-center gap-3 py-2 border-b last:border-0 px-3">
        <div className="flex-1">
          <div className="font-medium">{item.name}</div>
          <div className="text-sm space-y-0.5">
            <div className="text-gray-900 font-normal">
              Toplam: {formatCurrency(item.totalWithVat || 0)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onUpdateQuantity(item.id, -1)} className="p-1 hover:bg-gray-100 rounded">
            <Minus size={16} />
          </button>
          <span className="w-8 text-center">{item.quantity}</span>
          <button onClick={() => onUpdateQuantity(item.id, 1)} className="p-1 hover:bg-gray-100 rounded">
            <Plus size={16} />
          </button>
          <button onClick={() => onRemoveFromCart(item.id)} className="p-1 hover:bg-gray-100 rounded text-red-500">
            <X size={16} />
          </button>
        </div>
      </div>
    );
  };

  if (items.length > THRESHOLD) {
    return (
      <List
        height={Math.min(420, items.length * ITEM_SIZE)}
        itemCount={items.length}
        itemSize={ITEM_SIZE}
        width={"100%"}
        itemData={items}
      >
        {Row}
      </List>
    );
  }

  return (
    <div className="p-3">
      {items.map((_, idx) => (
        <Row key={(items[idx] as CartItem).id} index={idx} style={{}} data={items} />
      ))}
    </div>
  );
};

CartPanel.displayName = "CartPanel";

export default CartPanel;