import React from "react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";

import type { ProductStats } from "../../../types/product";

interface TopSellingChartProps {
  products: ProductStats[];
}

const TopSellingChart: React.FC<TopSellingChartProps> = ({ products }) => {
  const data = [...products].sort((a, b) => b.quantity - a.quantity).slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-3 border-b border-gray-100">
        <h2 className="text-lg font-medium text-gray-800">En Çok Satan 5 Ürün</h2>
      </div>
      <div className="p-4">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip formatter={(value) => (typeof value === "number" ? value % 1 === 0 ? value : `₺${value.toFixed(2)}` : `${value}`)} />
              <Legend iconType="circle" iconSize={8} />
              <Bar dataKey="quantity" name="Adet" fill="#4f46e5" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TopSellingChart;

