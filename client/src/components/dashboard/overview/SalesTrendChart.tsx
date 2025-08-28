import React from "react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";

interface SalesTrendChartProps {
  dailySalesData: Array<{ date: string; total: number; profit: number; count: number }>;
  period: "day" | "week" | "month" | "year" | "custom";
}

const SalesTrendChart: React.FC<SalesTrendChartProps> = ({ dailySalesData, period }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-3 border-b border-gray-100">
        <h2 className="text-lg font-medium text-gray-800">Günlük Satış Trend</h2>
      </div>
      <div className="p-4">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailySalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" label={{ value: period === "day" ? "Saat" : "Tarih", position: "insideBottom", offset: -5 }} />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip formatter={(value) => (typeof value === "number" ? `₺${value.toFixed(2)}` : `${value}`)} contentStyle={{ borderRadius: "6px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", border: "none" }} />
              <Legend iconType="circle" iconSize={8} />
              <Line type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={2} name="Ciro" />
              <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Kâr" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SalesTrendChart;

