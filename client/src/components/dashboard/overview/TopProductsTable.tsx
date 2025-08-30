import React from "react";

import type { ProductStats } from "../../../types/product";
import { Table } from "../../ui/Table";

interface TopProductsTableProps {
  productStats: ProductStats[];
  isLoading: boolean;
  onSeeAll: () => void;
}

const TopProductsTable: React.FC<TopProductsTableProps> = ({ productStats, isLoading, onSeeAll }) => {
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

  const sortedProducts = [...productStats].sort((a, b) => b.quantity - a.quantity);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-3 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800">En Çok Satan Ürünler</h2>
        <button onClick={onSeeAll} className="text-sm font-medium text-blue-600 hover:text-blue-800">
          Tümünü Gör
        </button>
      </div>

      {!sortedProducts.length ? (
        <div className="p-8 text-center text-gray-500">
          <p>Bu dönemde satış verisi bulunmuyor.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table
            data={sortedProducts.slice(0, 5)}
            columns={productColumns}
            enableSorting={true}
            defaultSortKey="name"
            defaultSortDirection="asc"
            loading={isLoading}
            emptyMessage="Bu dönemde satış verisi bulunmuyor."
            showTotals={true}
            totalColumns={{ quantity: "sum", revenue: "sum", profit: "sum" }}
            totalData={sortedProducts}
          />
        </div>
      )}
    </div>
  );
};

export default TopProductsTable;

