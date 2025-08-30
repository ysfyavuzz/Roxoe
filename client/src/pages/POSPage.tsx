// pages/POSPage.tsx
import { RefreshCw, Tag } from "lucide-react";
import React, { useState, useRef, useEffect, Suspense, lazy, useCallback, useMemo } from "react";

import { useAlert } from "../components/AlertProvider";
import PageLayout from "../components/layout/PageLayout";
import PaymentModal from "../components/modals/PaymentModal";
import ReceiptModal from "../components/modals/ReceiptModal";
import SelectProductsModal from "../components/modals/SelectProductModal";
import POSHeader from "../components/pos/POSHeader";
import QuantityModeToast from "../components/pos/QuantityModeToast";
import { ActiveFilter } from "../components/ui/FilterPanel";
import { useBarcodeHandler } from "../hooks/useBarcodeHandler";
import { useCart } from "../hooks/useCart";
import { useHotkeys } from "../hooks/useHotkeys";
import { usePaymentFlow } from "../hooks/usePaymentFlow";
import { usePOSViewPreferences } from "../hooks/usePOSViewPreferences";
import { useProductGroups } from "../hooks/useProductGroups";
import { useProducts } from "../hooks/useProducts";
import { useRegisterStatus } from "../hooks/useRegisterStatus";
import { creditService } from "../services/creditServices";
import { posService } from "../services/posServices";
import { productService } from "../services/productDB";
import { salesDB } from "../services/salesDB";
import { Customer } from "../types/credit";
import { CartTab, PaymentMethod, PaymentResult } from "../types/pos";
import { ReceiptInfo } from "../types/receipt";
import { Sale } from "../types/sales";
import { calculateCartTotals } from "../utils/vatUtils";

// Lazy loaded components
const SearchFilterPanel = lazy(() => import("../components/pos/SearchFilterPanel"));
const ProductPanel = lazy(() => import("../components/pos/ProductPanel"));
const CartPanel = lazy(() => import("../components/pos/CartPanel"));

// Loading component
const ComponentLoading: React.FC = () => (
  <div className="flex items-center justify-center h-32">
    <RefreshCw size={20} className="animate-spin" />
    <span className="ml-2">Yükleniyor...</span>
  </div>
);

const POSPage: React.FC = () => {
  const { showError, showSuccess, confirm } = useAlert();

  // 1) Ürün / Kategori Yönetimi
  const {
    products,
    categories,
    loading: productsLoading,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    filteredProducts,
  } = useProducts({ enableCategories: true });

  // 2) Sepet Yönetimi
  const {
    cartTabs,
    activeTabId,
    setActiveTabId,
    activeTab,
    addNewTab,
    removeTab,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  // Görünüm tercihleri (hook ile kalıcı)
  const {
    compactCartView,
    setCompactCartView,
    compactProductView,
    setCompactProductView,
  } = usePOSViewPreferences();

  // 3) Müşteriler (veresiye için)
  const [customers, setCustomers] = useState<Customer[]>([]);
  useEffect(() => {
    creditService
      .getAllCustomers()
      .then(setCustomers)
      .catch((e) => console.error("Müşteriler yüklenemedi:", e));
  }, []);

  // 4) Seçili müşteri (veresiye vs.)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  // 5) UI state'leri (Payment, Receipt, Filtre, SelectProductsModal)
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<ReceiptInfo | null>(
    null
  );
  const [showFilters, setShowFilters] = useState(false);
  const [showSelectProductsModal, setShowSelectProductsModal] = useState(false);

  // 6) Ürün Grupları
  const {
    groups: productGroups,
    addGroup,
    renameGroup,
    addProductToGroup,
    removeProductFromGroup,
    refreshGroups,
  } = useProductGroups();

  // activeGroupId'yi başlangıçta 0 olarak ayarla
  const [activeGroupId, setActiveGroupId] = useState<number>(0);

  // Grupları yükledikten sonra varsayılan grubu (Tümü) bul ve aktif yap
  useEffect(() => {
    if (productGroups.length > 0 && activeGroupId === 0) {
      // Yalnızca activeGroupId sıfır ise
      const defaultGroup = productGroups.find((g) => g.isDefault);
      if (defaultGroup) {
        console.log("Setting default group as active:", defaultGroup);
        setActiveGroupId(defaultGroup.id);
      }
    }
  }, [productGroups, activeGroupId]);

  // 7) Barkod config + input ref
  const [barcodeConfig] = useState(() => {
    const saved = localStorage.getItem("barcodeConfig");
    return saved ? JSON.parse(saved) : { enabled: true, suffix: "\n" };
  });
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Yıldız modu görünürlüğü ve barkod tarama modu
  const [showQuantityModeToast, setShowQuantityModeToast] =
    useState<boolean>(false);
  const [barcodeScanMode, setBarcodeScanMode] = useState<boolean>(false);

  // Kasa durumu - merkezi hook
  const { isOpen: isRegisterOpen, loading: registerLoading, error: registerError, refresh: refreshRegister } = useRegisterStatus({
    onError: () => showError("Kasa durumu sorgulanırken bir hata oluştu!"),
  });

  // POS için filtreleme etiketleri
  const activeFilters: ActiveFilter[] = selectedCategory && selectedCategory !== "Tümü" ? [
    {
      key: "category",
      label: "Kategori",
      value: selectedCategory,
      color: "blue",
      icon: <Tag size={14} />,
    }
  ] : [];

  // Start new sale
  async function startNewSale(): Promise<void> {
    if (!activeTab?.cart.length) {
      searchInputRef.current?.focus();
      return;
    }
    const confirmed = await confirm(
      "Mevcut satışı iptal edip yeni satış başlatmak istiyor musunuz?"
    );
    if (confirmed) {
      clearCart();
      setSearchTerm("");
      searchInputRef.current?.focus();
    }
  }

  // Yeni grup ekleme işlemi
  const handleAddGroup = useCallback(async () => {
    console.log("Add group handler triggered");
    try {
      const groupName = "Yeni Grup";
      console.log(`Adding new group: ${groupName}`);

      const g = await addGroup(groupName);
      console.log("Group added successfully:", g);

      setActiveGroupId(g.id);
      showSuccess(`'${groupName}' grubu başarıyla eklendi`);
    } catch (error) {
      console.error("Grup eklenirken hata oluştu:", error);
      showError("Grup eklenirken bir hata oluştu. Lütfen tekrar deneyin.");
    }
  }, [addGroup, showSuccess, showError]);

  // Barkod Handler Hook
  const { handleBarcodeDetected } = useBarcodeHandler({
    products,
    activeTab,
    addToCart,
    updateQuantity,
    setSearchTerm,
    showSuccess,
    showError
  });

  // Barkod tarama modu değişikliği yönetimi
  const handleSearchPanelModeChange = useCallback((isScanMode: boolean) => {
    setBarcodeScanMode(isScanMode);
  }, []);

  // Hızlı Nakit Ödeme
  const handleQuickCashPayment = useCallback(async () => {
    if (!activeTab?.cart.length) {
      showError("Sepet boş! Ödeme yapılamaz");
      return;
    }
    if (!isRegisterOpen) {
      showError("Kasa henüz açılmadı! Lütfen önce kasayı açın.");
      return;
    }

    try {
      const paymentResult: PaymentResult = {
        mode: "normal",
        paymentMethod: "nakit",
        received: cartTotals.total,
      };
      await handlePaymentComplete(paymentResult);
    } catch (error) {
      console.error("Hızlı nakit ödeme hatası:", error);
      showError("Ödeme işlemi sırasında bir hata oluştu");
    }
  }, [activeTab?.cart.length, isRegisterOpen, showError]);

  // Hızlı Kart Ödeme
  const handleQuickCardPayment = useCallback(async () => {
    if (!activeTab?.cart.length) {
      showError("Sepet boş! Ödeme yapılamaz");
      return;
    }
    if (!isRegisterOpen) {
      showError("Kasa henüz açılmadı! Lütfen önce kasayı açın.");
      return;
    }

    try {
      const isManualMode = await posService.isManualMode();
      if (!isManualMode) {
        showSuccess("Kredi kartı işlemi başlatılıyor...");
        const connected = await posService.connect("Ingenico");
        if (!connected) {
          showError("POS cihazına bağlanılamadı!");
          return;
        }
        const result = await posService.processPayment(cartTotals.total);
        await posService.disconnect();
        if (!result.success) {
          showError(result.message);
          return;
        }
      }

      const paymentResult: PaymentResult = {
        mode: "normal",
        paymentMethod: "kart",
        received: cartTotals.total,
      };

      await handlePaymentComplete(paymentResult);
    } catch (error) {
      console.error("Hızlı kredi kartı ödeme hatası:", error);
      showError("Ödeme işlemi sırasında bir hata oluştu");
    }
  }, [activeTab?.cart.length, isRegisterOpen, showError, showSuccess]);

  // Hotkeys
  const { quantityMode, tempQuantity, resetQuantityMode } = useHotkeys({
    hotkeys: [
      {
        key: "n",
        ctrlKey: true,
        callback: startNewSale,
      },
      {
        key: "p",
        ctrlKey: true,
        callback: () => activeTab?.cart.length && setShowPaymentModal(true),
      },
      {
        key: "Escape",
        callback: async () => {
          if (showPaymentModal) {
            setShowPaymentModal(false);
          } else if (searchTerm) {
            setSearchTerm("");
          } else {
            const confirmed = await confirm(
              "Sepeti tamamen temizlemek istediğinize emin misiniz?"
            );
            if (confirmed) {clearCart();}
          }
        },
      },
      {
        key: "k",
        ctrlKey: true,
        callback: () => searchInputRef.current?.focus(),
      },
      {
        key: "t",
        ctrlKey: true,
        callback: addNewTab,
      },
      {
        key: "w",
        ctrlKey: true,
        callback: () => cartTabs.length > 1 && removeTab(activeTabId),
      },
      {
        key: "Tab",
        ctrlKey: true,
        callback: () => {
          const currentIndex = cartTabs.findIndex(
            (tab) => tab.id === activeTabId
          );
          const nextIndex = (currentIndex + 1) % cartTabs.length;
          const nextTab = cartTabs[nextIndex];
          if (nextTab) {
            setActiveTabId(nextTab.id);
          }
        },
      },
      {
        key: "F7",
        callback: handleQuickCashPayment,
      },
      {
        key: "F8",
        callback: handleQuickCardPayment,
      },
    ],
    onQuantityUpdate: (newQuantity) => {
      if (!activeTab?.cart.length) {
        showError("Sepet boş! Miktar güncellenemez.");
        return;
      }

      const lastItem = activeTab.cart[activeTab.cart.length - 1];
      
      // Safety check to prevent TypeScript error
      if (!lastItem) {
        showError("Sepet boş! Miktar güncellenemez.");
        return;
      }

      if (newQuantity > lastItem.stock) {
        showError(`Stokta sadece ${lastItem.stock} adet ${lastItem.name} var.`);
        return;
      }

      updateQuantity(lastItem.id, newQuantity - lastItem.quantity);
      showSuccess(`${lastItem.name} miktarı ${newQuantity} olarak güncellendi`);
    },
    shouldHandleEvent: (event) => {
      if (barcodeScanMode) {
        return false;
      }
      return true;
    },
  });

  // Yıldız modunu izle ve toast görünümünü kontrol et
  useEffect(() => {
    if (quantityMode) {
      setShowQuantityModeToast(true);
      return; // Explicitly return undefined for consistency
    } else {
      const timeout = setTimeout(() => {
        setShowQuantityModeToast(false);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [quantityMode]);

  // Çoklu ürün ekleme
  const handleAddMultipleProducts = useCallback(async (productIds: number[]) => {
    if (activeGroupId === 0) {return;}
    try {
      await Promise.all(
        productIds.map((pid) =>
          productService.addProductToGroup(activeGroupId, pid)
        )
      );
      await refreshGroups();
      showSuccess("Ürünler gruba eklendi");
    } catch (error) {
      showError("Ürün eklenirken hata oluştu");
      console.error("Multiple products add error:", error);
    }
  }, [activeGroupId, refreshGroups, showSuccess, showError]);

  // Ürün grubu filtreleme ProductPanel içinde yapılır (double-filter'ı önlemek için burada kaldırıldı)

  // Sepet toplamları (optimized with useMemo)
  const cartTotals = useMemo(() => {
    return activeTab
      ? calculateCartTotals(activeTab.cart)
      : { subtotal: 0, vatAmount: 0, total: 0, vatBreakdown: [] };
  }, [activeTab?.cart]);

  // Ödeme tamamlandığında
  const { handlePaymentComplete } = usePaymentFlow({
    activeTab,
    cartTotals,
    products,
    selectedCustomer,
    clearCart,
    setSelectedCustomer,
    showSuccess,
    showError,
  });

  return (
    <PageLayout>
      {/* POS Header */}
      <POSHeader
        isRegisterOpen={isRegisterOpen}
        filtersOpen={showFilters}
        onStartNewSale={startNewSale}
        onToggleFilters={() => setShowFilters((prev) => !prev)}
        onRefreshRegister={refreshRegister}
        onFocusSearch={() => searchInputRef.current?.focus()}
      />

      <div className="flex h-[calc(90vh)] relative">
        {/* Sol Panel - Ürün Arama ve Listeleme */}
        <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm overflow-hidden h-full mr-2">
          <Suspense fallback={<ComponentLoading />}>
            <SearchFilterPanel
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={categories}
              activeFilters={activeFilters}
              onBarcodeDetected={handleBarcodeDetected}
              onScanModeChange={handleSearchPanelModeChange}
              quantityModeActive={quantityMode}
              searchInputRef={searchInputRef}
            />
          </Suspense>

          <Suspense fallback={<ComponentLoading />}>
            <ProductPanel
              productGroups={productGroups}
              activeGroupId={activeGroupId}
              setActiveGroupId={setActiveGroupId}
              onAddGroup={handleAddGroup}
              onRenameGroup={renameGroup}
              onDeleteGroup={async (gid) => {
                const c = await confirm(
                  "Bu grubu silmek istediğinize emin misiniz?"
                );
                if (!c) {return;}
                try {
                  await productService.deleteProductGroup(gid);
                  await refreshGroups();

                  if (activeGroupId === gid) {
                    const defaultGroup = productGroups.find((g) => g.isDefault);
                    if (defaultGroup) {
                      setActiveGroupId(defaultGroup.id);
                    }
                  }

                  showSuccess("Grup başarıyla silindi");
                } catch (error) {
                  console.error("Delete group error:", error);
                  showError("Grup silinirken bir hata oluştu");
                }
              }}
              filteredProducts={filteredProducts}
              compactProductView={compactProductView}
              setCompactProductView={setCompactProductView}
              onProductClick={(product) => {
                if (product.stock > 0) {
                  addToCart(product);
                }
              }}
              onAddProductToGroup={addProductToGroup}
              onRemoveProductFromGroup={removeProductFromGroup}
              setShowSelectProductsModal={setShowSelectProductsModal}
            />
          </Suspense>
        </div>

        {/* Sağ Panel - Sepet Yönetimi */}
        <div className="w-80 bg-white rounded-lg shadow-sm flex flex-col h-full">
          <Suspense fallback={<ComponentLoading />}>
            <CartPanel
              cartTabs={cartTabs}
              activeTabId={activeTabId}
              activeTab={activeTab}
              setActiveTabId={setActiveTabId}
              onAddNewTab={addNewTab}
              onRemoveTab={removeTab}
              onUpdateQuantity={updateQuantity}
              onRemoveFromCart={removeFromCart}
              onClearCart={clearCart}
              compactCartView={compactCartView}
              setCompactCartView={setCompactCartView}
              cartTotals={cartTotals}
              onShowPaymentModal={() => {
                if (!isRegisterOpen) {
                  showError(
                    "Kasa henüz açılmadı! Lütfen önce kasayı açın."
                  );
                  return;
                }
                setShowPaymentModal(true);
              }}
              onQuickCashPayment={handleQuickCashPayment}
              onQuickCardPayment={handleQuickCardPayment}
              isRegisterOpen={isRegisterOpen}
              onConfirm={confirm}
            />
          </Suspense>
        </div>
      </div>

      {/* Quantity Mode Toast */}
      <QuantityModeToast
        visible={showQuantityModeToast}
        active={quantityMode}
        quantityText={tempQuantity || "0"}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        total={cartTotals.total}
        subtotal={cartTotals.subtotal}
        vatAmount={cartTotals.vatAmount}
        onComplete={handlePaymentComplete}
        customers={customers}
        selectedCustomer={selectedCustomer}
        setSelectedCustomer={setSelectedCustomer}
        items={
          activeTab
            ? activeTab.cart.map((item) => ({
                id: item.id,
                name: item.name,
                amount: item.priceWithVat * item.quantity,
                quantity: item.quantity,
              }))
            : []
        }
      />

      {/* Receipt Modal */}
      {currentReceipt && (
        <ReceiptModal
          isOpen={showReceiptModal}
          onClose={() => {
            setShowReceiptModal(false);
            setCurrentReceipt(null);
          }}
          receiptData={currentReceipt}
        />
      )}

      {/* Select Products Modal */}
      <SelectProductsModal
        isOpen={showSelectProductsModal}
        onClose={() => setShowSelectProductsModal(false)}
        onSelect={handleAddMultipleProducts}
        products={products}
        existingProductIds={
          productGroups.find((g) => g.id === activeGroupId)?.productIds || []
        }
      />
    </PageLayout>
  );
};

export default POSPage;