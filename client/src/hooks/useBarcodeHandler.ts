// hooks/useBarcodeHandler.ts
import { useCallback } from "react";
import { Product } from "../types/product";
import { CartTab } from "../types/pos";
import { normalizedSearch } from "../utils/turkishSearch";

interface UseBarcodeHandlerProps {
  products: Product[];
  activeTab: CartTab | undefined;
  addToCart: (product: Product & { source: string }) => void;
  updateQuantity: (itemId: number, delta: number) => boolean;
  setSearchTerm: (term: string) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}

interface BarcodeHandlerResult {
  handleBarcodeDetected: (barcode: string) => void;
}

export const useBarcodeHandler = ({
  products,
  activeTab,
  addToCart,
  updateQuantity,
  setSearchTerm,
  showSuccess,
  showError
}: UseBarcodeHandlerProps): BarcodeHandlerResult => {
  
  const handleBarcodeDetected = useCallback((barcode: string) => {
    console.log("🔍 Barkod algılandı:", barcode);

    // 1) SADECE barkod alanı ile tam eşleşme
    let matchingProduct = products.find((p) => p.barcode === barcode);

    if (!matchingProduct) {
      console.log("❓ Barkodla tam eşleşme yok:", barcode);
      
      // 2) Kısmi eşleşme ara
      const partialMatches = products.filter(
        (p) => p.barcode.includes(barcode) || normalizedSearch(p.name, barcode)
      );

      console.log("🔍 Kısmi eşleşme sayısı:", partialMatches.length);

      if (partialMatches.length === 1) {
        matchingProduct = partialMatches[0];
      } else if (partialMatches.length > 1) {
        // Birden çok kısmi eşleşme ⇒ arama terimi
        console.log(
          "ℹ️ Birden çok eşleşme bulundu, arama terimini güncelliyorum:",
          barcode
        );
        setSearchTerm(barcode);
        return;
      } else {
        // Hiç eşleşme yok
        console.log("❓ Hiç eşleşme bulunamadı:", barcode);
        showError(`Barkod bulunamadı: ${barcode}`);
        return;
      }
    }

    if (matchingProduct) {
      console.log(
        "✅ Eşleşen ürün bulundu:",
        matchingProduct.name,
        "ID:",
        matchingProduct.id
      );

      // Stok kontrol
      if (matchingProduct.stock <= 0) {
        console.log("❌ Ürün stokta yok!");
        showError(`${matchingProduct.name} stokta kalmadı!`);
        return;
      }

      // Sepet kontrol - Aktif sepet var mı?
      if (!activeTab) {
        console.log("❌ Aktif sepet bulunamadı!");
        return;
      }

      console.log("🛒 Sepette arama yapılıyor...");
      console.log(
        "Sepet içeriği:",
        activeTab.cart.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          source: item.source,
        }))
      );

      // Aktif sepette aynı ürün var mı?
      const existingItem = activeTab.cart.find(
        (item) => item.id === matchingProduct!.id
      );

      console.log(
        "🔍 Sepette aynı ürün var mı?",
        existingItem
          ? `EVET - ${existingItem.name} (${existingItem.id}) - Miktarı: ${existingItem.quantity}`
          : "HAYIR - Yeni eklenecek"
      );

      if (existingItem) {
        // Eğer aynı ürün varsa, stok kontrolü yap
        if (existingItem.quantity + 1 > matchingProduct.stock) {
          console.log(
            "⚠️ Stok yetersiz:",
            `Stokta ${matchingProduct.stock}, Sepette ${existingItem.quantity}`
          );
          showError(
            `${matchingProduct.name} için stok yetersiz! Stokta ${matchingProduct.stock} adet var.`
          );
          return;
        }

        console.log(
          "📈 Ürünün miktarı artırılıyor:",
          existingItem.quantity,
          " -> ",
          existingItem.quantity + 1
        );

        // Miktarı 1 artır
        const successful = updateQuantity(existingItem.id, 1);
        console.log("Miktar güncelleme başarılı mı:", successful);

        if (successful) {
          showSuccess(`${matchingProduct.name} miktarı güncellendi`);
        } else {
          showError(
            `${matchingProduct.name} miktarı güncellenemedi. Lütfen tekrar deneyin.`
          );
        }

        // Güncellenmiş sepet içeriği kontrol
        setTimeout(() => {
          if (activeTab) {
            const updatedItem = activeTab.cart.find(
              (i) => i.id === existingItem.id
            );
            console.log(
              "🔄 Sepet güncellendi:",
              updatedItem
                ? `${updatedItem.name} - Yeni miktar: ${updatedItem.quantity}`
                : "Ürün bulunamadı"
            );
          }
        }, 100);

        return;
      }

      // Yeni bir ürün olarak ekle, source olarak "barcode" işaretle
      const barcodeProduct = {
        ...matchingProduct,
        source: "barcode", // Önemli: Barkodla eklendiğini belirt
      };

      console.log(
        "➕ Barkod ile sepete YENİ ürün ekleniyor:",
        barcodeProduct.name,
        "kaynak: barcode"
      );
      addToCart(barcodeProduct);
      showSuccess(`${barcodeProduct.name} sepete eklendi`);

      // Güncellenmiş sepeti kontrol et
      setTimeout(() => {
        if (activeTab) {
          console.log(
            "🧾 Güncellenmiş sepet:",
            activeTab.cart.map((item) => ({
              name: item.name,
              id: item.id,
              quantity: item.quantity,
              source: item.source || "bilinmiyor",
            }))
          );
        }
      }, 100);

      return;
    }
  }, [products, activeTab, addToCart, updateQuantity, setSearchTerm, showSuccess, showError]);

  return {
    handleBarcodeDetected
  };
};