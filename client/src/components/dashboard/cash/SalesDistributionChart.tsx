import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

interface SalesDistributionChartProps {
  cashSalesTotal: number;
  cardSalesTotal: number;
}

const SalesDistributionChart: React.FC<SalesDistributionChartProps> = ({ cashSalesTotal, cardSalesTotal }) => {
  const data = [
    { name: "Nakit Satış", value: cashSalesTotal },
    { name: "Kart Satış", value: cardSalesTotal },
  ];

  const COLORS = ["#4f46e5", "#10b981"];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-medium text-gray-900">Satış Dağılımı</h3>
      </div>
      <div className="p-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              dataKey="value"
            >
              <Cell fill={COLORS[0]} />
              <Cell fill={COLORS[1]} />
            </Pie>
            <Tooltip formatter={(value) => [`₺${Number(value).toFixed(2)}`, ""]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesDistributionChart;

