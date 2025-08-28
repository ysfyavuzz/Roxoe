import React, { useState, useMemo, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Download, Tag, DollarSign, Package, LineChart, XCircle } from "lucide-react";
import { ProductStats } from "../../types/product";
import Card from "../ui/Card";
import FilterPanel, { ActiveFilter, FilterValue } from "../ui/FilterPanel";
import { normalizedSearch } from "../../utils/turkishSearch";
import ProductsFilterPanelContent from "./products/ProductsFilterPanelContent";
import ProductSummaryCards from "./products/ProductSummaryCards";
import ProductPerformanceTable from "./products/ProductPerformanceTable";
import TopSellingChart from "./products/TopSellingChart";
import TopProfitableChart from "./products/TopProfitableChart";

interface ProductsTabProps {
  productStats: ProductStats[];
  isLoading: boolean;
  handleExport: (
    fileType: "excel" | "pdf",
    reportType: "sale" | "product" | "cash"
  ) => Promise<void>;
}

const ProductsTab: React.FC<ProductsTabProps> = ({
  productStats,
  isLoading,
  handleExport,
}) => {
  // Filtreleme state'i
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filtre paneli görünürlüğü
  const [isFilterPanelVisible, setIsFilterPanelVisible] = useState<boolean>(false);

  // Sıralama state'i
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ProductStats;
    direction: "asc" | "desc";
  }>({ key: "quantity", direction: "desc" });

  // Sayfalama state'i
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Ürün kategorilerini getir
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(productStats.map(product => product.category))];
    return uniqueCategories.filter(category => category); // undefined ve null değerleri filtrele
  }, [productStats]);

  // Aktif filtre ve arama terimine göre ürünleri filtrele
  const filteredProducts = useMemo(() => {
    let result = [...productStats];
  
    // Arama terimini uygula
    if (searchTerm.trim()) {
      result = result.filter(
        (product) =>
          normalizedSearch(product.name, searchTerm) ||
          (product.category && normalizedSearch(product.category, searchTerm))
      );
    }
  
    // Aktif filtreleri uygula
    if (activeFilters.length > 0) {
      // Kategori filtrelerini ayır (OR mantığı için)
      const categoryFilters = activeFilters.filter(filter => filter.key === "category");
      // Diğer filtreler (AND mantığı için)
      const otherFilters = activeFilters.filter(filter => filter.key !== "category");
  
      // Önce kategori filtreleri için OR mantığını uygula
      if (categoryFilters.length > 0) {
        result = result.filter(product => 
          // Eğer bir ürün herhangi bir kategori filtresine uyuyorsa, ürünü dahil et
          categoryFilters.some(filter => product.category === filter.value)
        );
      }
  
      // Sonra diğer filtreler için AND mantığını uygula
      if (otherFilters.length > 0) {
        result = result.filter((product) => {
          return otherFilters.every((filter) => {
            switch (filter.key) {
              case "minQuantity":
                return product.quantity >= parseInt(filter.value);
              case "maxQuantity":
                return product.quantity <= parseInt(filter.value);
              case "minRevenue":
                return product.revenue >= parseFloat(filter.value);
              case "maxRevenue":
                return product.revenue <= parseFloat(filter.value);
              case "minProfit":
                return product.profit >= parseFloat(filter.value);
              case "maxProfit":
                return product.profit <= parseFloat(filter.value);
              case "minProfitMargin":
                return (product.profitMargin || 0) >= parseFloat(filter.value);
              case "maxProfitMargin":
                return (product.profitMargin || 0) <= parseFloat(filter.value);
              default:
                return true;
            }
          });
        });
      }
    }
  
    return result;
  }, [productStats, searchTerm, activeFilters]);

  // Sıralanmış ürünler
  const sortedProducts = useMemo(() => {
    let sortableProducts = [...filteredProducts];
    if (sortConfig) {
      sortableProducts.sort((a, b) => {
        const key = sortConfig.key;
        let aVal = a[key];
        let bVal = b[key];

        // Sayısal değerler için karşılaştırma
        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
        }

        // String değerler için karşılaştırma
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableProducts;
  }, [filteredProducts, sortConfig]);

  // Sayfalama hesaplamaları
  const idxLast = currentPage * itemsPerPage;
  const idxFirst = idxLast - itemsPerPage;
  const currentProducts = sortedProducts.slice(idxFirst, idxLast);
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  // Başlık tıklama işlevi
  const handleSort = (key: keyof ProductStats) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Kategori filtresi ekle
  const handleAddCategoryFilter = (category: string) => {
    // Zaten aynı kategori filtresi varsa ekleme
    if (activeFilters.some(filter => filter.key === "category" && filter.value === category)) {
      return;
    }

    const newFilter: ActiveFilter = {
      key: "category",
      label: "Kategori",
      value: category,
      color: "blue",
      icon: <Tag size={14} />,
    };

    setActiveFilters([...activeFilters, newFilter]);
    setCurrentPage(1); // Filtre değişince ilk sayfaya dön
    setIsFilterPanelVisible(false); // Kategori ekledikten sonra paneli kapat
  };

  // Filtre kaldırma işlevi
  const handleRemoveFilter = (key: string, value?: string) => {
    // value parametresi verilmişse, sadece belirli bir kategori filtresini kaldır
    if (key === "category" && value) {
      setActiveFilters(activeFilters.filter(filter => 
        !(filter.key === "category" && filter.value === value)
      ));
    } else {
      // Diğer filtreler için önceki mantığı kullan
      setActiveFilters(activeFilters.filter(filter => {
        // Eğer key doğrudan eşleşiyorsa veya key.startsWith(filterKey) ise kaldır
        // Bu, minQuantity ve maxQuantity gibi benzer filtreleri gruplamak için
        return !(filter.key === key || filter.key.startsWith(`${key}`));
      }));
    }
    setCurrentPage(1); // Filtre değişince ilk sayfaya dön
  };

  // Miktar filtresi ekle
  const handleAddQuantityFilter = (min?: number, max?: number) => {
    // Önce mevcut miktar filtrelerini kaldır
    const filtersWithoutQuantity = activeFilters.filter(
      filter => filter.key !== "minQuantity" && filter.key !== "maxQuantity"
    );
    
    const newFilters = [...filtersWithoutQuantity];

    if (min !== undefined) {
      newFilters.push({
        key: "minQuantity",
        label: "Min Adet",
        value: min.toString(),
        color: "amber",
        icon: <Package size={14} />,
      });
    }

    if (max !== undefined) {
      newFilters.push({
        key: "maxQuantity",
        label: "Max Adet",
        value: max.toString(),
        color: "amber",
        icon: <Package size={14} />,
      });
    }

    setActiveFilters(newFilters);
    setCurrentPage(1);
    
    // Sadece iki değer de girilmişse paneli kapat (kullanıcı deneyimi için)
    if (min !== undefined && max !== undefined) {
      setIsFilterPanelVisible(false);
    }
  };

  // Ciro filtresi ekle
  const handleAddRevenueFilter = (min?: number, max?: number) => {
    // Önce mevcut ciro filtrelerini kaldır
    const filtersWithoutRevenue = activeFilters.filter(
      filter => filter.key !== "minRevenue" && filter.key !== "maxRevenue"
    );
    
    const newFilters = [...filtersWithoutRevenue];

    if (min !== undefined) {
      newFilters.push({
        key: "minRevenue",
        label: "Min Ciro",
        value: min.toString(),
        color: "emerald",
        icon: <DollarSign size={14} />,
      });
    }

    if (max !== undefined) {
      newFilters.push({
        key: "maxRevenue",
        label: "Max Ciro",
        value: max.toString(),
        color: "emerald",
        icon: <DollarSign size={14} />,
      });
    }

    setActiveFilters(newFilters);
    setCurrentPage(1);
    
    // İki değer de girilmişse paneli kapat
    if (min !== undefined && max !== undefined) {
      setIsFilterPanelVisible(false);
    }
  };

  // Kâr filtresi ekle
  const handleAddProfitFilter = (min?: number, max?: number) => {
    // Önce mevcut kâr filtrelerini kaldır
    const filtersWithoutProfit = activeFilters.filter(
      filter => filter.key !== "minProfit" && filter.key !== "maxProfit"
    );
    
    const newFilters = [...filtersWithoutProfit];

    if (min !== undefined) {
      newFilters.push({
        key: "minProfit",
        label: "Min Kâr",
        value: min.toString(),
        color: "green",
        icon: <LineChart size={14} />,
      });
    }

    if (max !== undefined) {
      newFilters.push({
        key: "maxProfit",
        label: "Max Kâr",
        value: max.toString(),
        color: "green",
        icon: <LineChart size={14} />,
      });
    }

    setActiveFilters(newFilters);
    setCurrentPage(1);
    
    // İki değer de girilmişse paneli kapat
    if (min !== undefined && max !== undefined) {
      setIsFilterPanelVisible(false);
    }
  };

  // Tüm filtreleri temizle
  const handleResetFilters = () => {
    setActiveFilters([]);
    setSearchTerm("");
    setCurrentPage(1);
    setIsFilterPanelVisible(false); // Filtreler temizlendiğinde paneli kapat
  };

  // Özel filtre paneli render fonksiyonu
  const renderFilterPanelContent = () => (
    <ProductsFilterPanelContent
      visible={isFilterPanelVisible}
      categories={categories}
      activeFilters={activeFilters}
      onReset={handleResetFilters}
      onClose={() => setIsFilterPanelVisible(false)}
      onAddCategory={handleAddCategoryFilter}
      onAddQuantity={handleAddQuantityFilter}
      onAddRevenue={handleAddRevenueFilter}
      onAddProfit={handleAddProfitFilter}
    />
  );

  // Ürün tablosu kolonları
  const productColumns = [
    {
      key: "name",
      title: "Ürün",
      render: (p: ProductStats) => (
        <div className="text-sm font-medium text-gray-900">{p.name}</div>
      ),
    },
    {
      key: "category",
      title: "Kategori",
      render: (p: ProductStats) => (
        <div className="text-sm text-gray-500">{p.category}</div>
      ),
    },
    {
      key: "quantity",
      title: "Adet",
      className: "text-right",
      render: (p: ProductStats) => <div>{p.quantity}</div>,
    },
    {
      key: "revenue",
      title: "Ciro (₺)",
      className: "text-right",
      render: (p: ProductStats) => <div>{p.revenue.toFixed(2)}</div>,
    },
    {
      key: "profit",
      title: "Kâr (₺)",
      className: "text-right",
      render: (p: ProductStats) => (
        <div className="text-green-600 font-medium">{p.profit.toFixed(2)}</div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      {/* Arama ve Filtre Paneli */}
      <div className="mb-4 relative">
        <FilterPanel
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          activeFilters={activeFilters}
          onFilterRemove={(key) => {
            // Kategori filtreleri için özel işlem yapma, çünkü render içinde bizim kendi 
            // butonlarımız olacak ve onlar handleRemoveFilter'ı çağıracak
            if (key === "category") return;
            handleRemoveFilter(key);
          }}
          onReset={handleResetFilters}
          mode="pos" // "basic" yerine "pos" kullanıyoruz, böylece dış kontrolü kullanır
          searchPlaceholder="Ürün adı veya kategoride ara..."
          filterPanelContent={renderFilterPanelContent()}
          inputRef={searchInputRef}
          isLoading={isLoading}
          toggleFilter={() => setIsFilterPanelVisible(!isFilterPanelVisible)}
          showFilter={isFilterPanelVisible}
          renderActiveFilters={() => (
            <>
              {/* Aktif filtreleri görüntüle */}
              {activeFilters.map((filter, index) => {
                const color = filter.color || "indigo";
                const bgColorClass = color === "blue" ? "bg-blue-50" : 
                                    color === "green" ? "bg-green-50" : 
                                    color === "emerald" ? "bg-emerald-50" : 
                                    color === "amber" ? "bg-amber-50" : 
                                    "bg-indigo-50";
                const textColorClass = color === "blue" ? "text-blue-700" : 
                                      color === "green" ? "text-green-700" : 
                                      color === "emerald" ? "text-emerald-700" : 
                                      color === "amber" ? "text-amber-700" : 
                                      "text-indigo-700";
                
                return (
                  <span
                    key={`${filter.key}-${index}`}
                    className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium ${bgColorClass} ${textColorClass}`}
                  >
                    {filter.icon || <Tag size={14} />}
                    {filter.label}: {filter.value}
                    <button
                      onClick={() => {
                        // Kategori filtresi için özel işlem
                        if (filter.key === "category") {
                          handleRemoveFilter("category", filter.value);
                        } 
                        // Diğer filtreler için normal işlem
                        else {
                          handleRemoveFilter(filter.key);
                        }
                      }}
                      className="text-gray-400 hover:text-gray-600 ml-1"
                    >
                      <XCircle size={14} />
                    </button>
                  </span>
                );
              })}
            </>
          )}
        />
      </div>

      {/* Üst Özet Kartları */}
      <ProductSummaryCards products={sortedProducts} />

      {/* Ürün Performans Tablosu */}
      <ProductPerformanceTable
        currentProducts={currentProducts}
        allProducts={sortedProducts}
        isLoading={isLoading}
        onExportExcel={() => handleExport("excel", "product")}
        onPageChange={setCurrentPage}
        currentPage={currentPage}
        totalPages={totalPages}
      />

      {/* Performans Grafikleri */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopSellingChart products={sortedProducts} />
        <TopProfitableChart products={sortedProducts} />
      </div>
    </div>
  );
};

export default ProductsTab;