// components/pos/SearchFilterPanel.tsx
import React from "react";
import FilterPanel, { ActiveFilter } from "../ui/FilterPanel";

interface SearchFilterPanelProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: Array<{ id: number; name: string; icon: string }>;
  activeFilters: ActiveFilter[];
  onBarcodeDetected: (barcode: string) => void;
  onScanModeChange: (isScanMode: boolean) => void;
  quantityModeActive: boolean;
  searchInputRef: React.RefObject<HTMLInputElement>;
}

const SearchFilterPanel: React.FC<SearchFilterPanelProps> = React.memo(({
  searchTerm,
  setSearchTerm,
  showFilters,
  setShowFilters,
  selectedCategory,
  setSelectedCategory,
  categories,
  activeFilters,
  onBarcodeDetected,
  onScanModeChange,
  quantityModeActive,
  searchInputRef
}) => {
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("Tümü");
    setShowFilters(false);
  };

  return (
    <div className="p-3 border-b">
      <FilterPanel
        mode="pos"
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onReset={resetFilters}
        showFilter={showFilters}
        toggleFilter={() => setShowFilters((prev) => !prev)}
        inputRef={searchInputRef}
        onBarcodeDetected={onBarcodeDetected}
        onScanModeChange={onScanModeChange}
        quantityModeActive={quantityModeActive}
        activeFilters={activeFilters}
        searchPlaceholder="Ürün Adı, Barkod veya Kategori Ara..."
        inputId="searchInput"
      />

      {showFilters && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => setSelectedCategory("Tümü")}
              className={`px-3 py-1.5 rounded-lg ${
                selectedCategory === "Tümü"
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Tümü
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.name)}
                className={`px-3 py-1.5 rounded-lg ${
                  selectedCategory === c.name
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span className="mr-2">{c.icon}</span>
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

SearchFilterPanel.displayName = "SearchFilterPanel";

export default SearchFilterPanel;