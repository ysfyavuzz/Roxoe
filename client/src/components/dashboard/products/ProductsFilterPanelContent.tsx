import { Tag, Package, DollarSign, LineChart } from "lucide-react";
import React from "react";

import { ActiveFilter } from "../../ui/FilterPanel";

interface ProductsFilterPanelContentProps {
  visible: boolean;
  categories: string[];
  activeFilters: ActiveFilter[];
  onReset: () => void;
  onClose: () => void;
  onAddCategory: (category: string) => void;
  onAddQuantity: (min?: number, max?: number) => void;
  onAddRevenue: (min?: number, max?: number) => void;
  onAddProfit: (min?: number, max?: number) => void;
}

const ProductsFilterPanelContent: React.FC<ProductsFilterPanelContentProps> = ({
  visible,
  categories,
  activeFilters,
  onReset,
  onClose,
  onAddCategory,
  onAddQuantity,
  onAddRevenue,
  onAddProfit,
}) => {
  if (!visible) {return null;}

  const getFilterValue = (key: string) => activeFilters.find(f => f.key === key)?.value || "";

  return (
    <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl z-20 border border-gray-100 w-80 p-4 animate-in fade-in zoom-in-95 duration-150">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-gray-800">Ürün Filtreleri</h3>
        <button onClick={onReset} className="text-sm text-indigo-600 hover:text-indigo-800">
          Tümünü Temizle
        </button>
      </div>

      <div className="space-y-4">
        {/* Kategori Filtresi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            onChange={(e) => e.target.value && onAddCategory(e.target.value)}
            value=""
          >
            <option value="">Kategori Seçin</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Miktar Filtresi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Satış Adedi</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="number"
                placeholder="Min Adet"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                onBlur={(e) => {
                  if (e.target.value) {
                    const min = parseInt(e.target.value);
                    const maxFilter = activeFilters.find(f => f.key === "maxQuantity");
                    const max = maxFilter ? parseInt(maxFilter.value) : undefined;
                    onAddQuantity(min, max);
                  }
                }}
                defaultValue={getFilterValue("minQuantity")}
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Max Adet"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                onBlur={(e) => {
                  if (e.target.value) {
                    const max = parseInt(e.target.value);
                    const minFilter = activeFilters.find(f => f.key === "minQuantity");
                    const min = minFilter ? parseInt(minFilter.value) : undefined;
                    onAddQuantity(min, max);
                  }
                }}
                defaultValue={getFilterValue("maxQuantity")}
              />
            </div>
          </div>
        </div>

        {/* Ciro Filtresi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ciro Aralığı (₺)</label>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">₺</span>
              </div>
              <input
                type="number"
                placeholder="Min Ciro"
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                onBlur={(e) => {
                  if (e.target.value) {
                    const min = parseFloat(e.target.value);
                    const maxFilter = activeFilters.find(f => f.key === "maxRevenue");
                    const max = maxFilter ? parseFloat(maxFilter.value) : undefined;
                    onAddRevenue(min, max);
                  }
                }}
                defaultValue={getFilterValue("minRevenue")}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">₺</span>
              </div>
              <input
                type="number"
                placeholder="Max Ciro"
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                onBlur={(e) => {
                  if (e.target.value) {
                    const max = parseFloat(e.target.value);
                    const minFilter = activeFilters.find(f => f.key === "minRevenue");
                    const min = minFilter ? parseFloat(minFilter.value) : undefined;
                    onAddRevenue(min, max);
                  }
                }}
                defaultValue={getFilterValue("maxRevenue")}
              />
            </div>
          </div>
        </div>

        {/* Kâr Filtresi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kâr Aralığı (₺)</label>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">₺</span>
              </div>
              <input
                type="number"
                placeholder="Min Kâr"
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                onBlur={(e) => {
                  if (e.target.value) {
                    const min = parseFloat(e.target.value);
                    const maxFilter = activeFilters.find(f => f.key === "maxProfit");
                    const max = maxFilter ? parseFloat(maxFilter.value) : undefined;
                    onAddProfit(min, max);
                  }
                }}
                defaultValue={getFilterValue("minProfit")}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">₺</span>
              </div>
              <input
                type="number"
                placeholder="Max Kâr"
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                onBlur={(e) => {
                  if (e.target.value) {
                    const max = parseFloat(e.target.value);
                    const minFilter = activeFilters.find(f => f.key === "minProfit");
                    const min = minFilter ? parseFloat(minFilter.value) : undefined;
                    onAddProfit(min, max);
                  }
                }}
                defaultValue={getFilterValue("maxProfit")}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="pt-4 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          Kapat
        </button>
      </div>
    </div>
  );
};

export default ProductsFilterPanelContent;

