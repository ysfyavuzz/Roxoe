import { Filter, RefreshCw } from "lucide-react";
import React from "react";

interface POSHeaderProps {
  isRegisterOpen: boolean;
  filtersOpen: boolean;
  onStartNewSale: () => void;
  onToggleFilters: () => void;
  onRefreshRegister?: () => void;
  onFocusSearch?: () => void;
}

const POSHeader: React.FC<POSHeaderProps> = ({
  isRegisterOpen,
  filtersOpen,
  onStartNewSale,
  onToggleFilters,
  onRefreshRegister,
  onFocusSearch,
}) => {
  return (
    <div className="mb-2 px-3 py-2 bg-white rounded-lg shadow-sm border flex items-center justify-between">
      {/* Left: Kasa durum ve filtre */}
      <div className="flex items-center gap-2">
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            isRegisterOpen ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
          }`}
          title="Kasa Durumu"
        >
          Kasa: {isRegisterOpen ? "Açık" : "Kapalı"}
        </span>

        <button
          onClick={onToggleFilters}
          className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg ${
            filtersOpen ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"
          }`}
          aria-label="Filtreleri Aç/Kapat"
          title="Filtreleri Aç/Kapat"
        >
          <Filter size={14} />
          Filtreler
        </button>

        {onRefreshRegister && (
          <button
            onClick={onRefreshRegister}
            className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg text-gray-600 hover:bg-gray-50"
            aria-label="Kasa Durumunu Yenile"
            title="Kasa Durumunu Yenile"
          >
            <RefreshCw size={14} />
            Yenile
          </button>
        )}
      </div>

      {/* Right: Hızlı eylemler */}
      <div className="flex items-center gap-2">
        {onFocusSearch && (
          <button
            onClick={onFocusSearch}
            className="text-xs px-2 py-1 rounded-lg text-gray-600 hover:bg-gray-50"
            aria-label="Ürün aramaya odaklan (Ctrl+K)"
            title="Ürün aramaya odaklan (Ctrl+K)"
          >
            Ara (Ctrl+K)
          </button>
        )}
        <button
          onClick={onStartNewSale}
          className="text-xs px-2 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          aria-label="Yeni Satış (Ctrl+N)"
          title="Yeni Satış (Ctrl+N)"
        >
          Yeni Satış
        </button>
      </div>
    </div>
  );
};

export default POSHeader;

