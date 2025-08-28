import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

interface CategoryDistributionPieProps {
  categoryData: Array<{ name: string; revenue: number; profit: number; quantity: number }>;
}

const CategoryDistributionPie: React.FC<CategoryDistributionPieProps> = ({ categoryData }) => {
  const COLORS = ["#4f46e5", "#10b981", "#f97316", "#8b5cf6", "#06b6d4", "#ec4899"];

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-3 border-b border-gray-100">
        <h2 className="text-lg font-medium text-gray-800">Kategori Dağılımı</h2>
      </div>
      <div className="p-4">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="revenue"
                nameKey="name"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {categoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => (typeof value === "number" ? `₺${value.toFixed(2)}` : `${value}`)} contentStyle={{ borderRadius: "6px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", border: "none" }} />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CategoryDistributionPie;

