import React from "react";
import { Table } from "../../ui/Table";
import { Pagination } from "../../ui/Pagination";
import type { ProductStats } from "../../../types/product";
import { Download } from "lucide-react";

interface ProductPerformanceTableProps {
  currentProducts: ProductStats[];
  allProducts: ProductStats[];
  isLoading: boolean;
  onExportExcel: () => void;
  onPageChange: (page: number) => void;
  currentPage: number;
  totalPages: number;
}

const productColumns = [
  { key: "name", title: "Ürün", render: (p: ProductStats) => (<div className="text-sm font-medium text-gray-900">{p.name}</div>) },
  { key: "category", title: "Kategori", render: (p: ProductStats) => (<div className="text-sm text-gray-500">{p.category}</div>) },
  { key: "quantity", title: "Adet", className: "text-right", render: (p: ProductStats) => <div>{p.quantity}</div> },
  { key: "revenue", title: "Ciro (₺)", className: "text-right", render: (p: ProductStats) => <div>{p.revenue.toFixed(2)}</div> },
  { key: "profit", title: "Kâr (₺)", className: "text-right", render: (p: ProductStats) => (<div className="text-green-600 font-medium">{p.profit.toFixed(2)}</div>) },
];

const ProductPerformanceTable: React.FC<ProductPerformanceTableProps> = ({
  currentProducts,
  allProducts,
  isLoading,
  onExportExcel,
  onPageChange,
  currentPage,
  totalPages,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-3 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800">Ürün Satış Performansı</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">Toplam {allProducts.length} ürün</span>
          <button
            onClick={onExportExcel}
            className="text-sm font-medium flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <Download size={14} />
            Excel'e Aktar
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <Table
          data={currentProducts}
          columns={productColumns}
          enableSorting={true}
          defaultSortKey="quantity"
          defaultSortDirection="desc"
          loading={isLoading}
          emptyMessage="Seçilen dönemde satış verisi bulunmuyor."
          showTotals={true}
          totalColumns={{ quantity: "sum", revenue: "sum", profit: "sum" }}
          className="border-none rounded-none"
          totalData={allProducts}
        />
      </div>

      <div className="px-6 py-3 border-t border-gray-100">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          className="flex justify-center"
        />
      </div>
    </div>
  );
};

export default ProductPerformanceTable;

