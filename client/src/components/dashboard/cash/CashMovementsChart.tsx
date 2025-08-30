import React from "react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";

interface CashMovementsChartProps {
  dailyData: Array<{ date: string; deposits: number; withdrawals: number; veresiye: number; total: number }>;
  period: "day" | "week" | "month" | "year" | "custom";
}

const CashMovementsChart: React.FC<CashMovementsChartProps> = ({ dailyData, period }) => {
  const isSameDay = (dateStr: string) => dateStr.includes(":");
  const formatXAxis = (value: string) => {
    if (isSameDay(value)) {return value;}
    return new Date(value).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          {period === "day" ? "Saatlik Kasa Hareketleri" : "Günlük Kasa Hareketleri"}
        </h3>
      </div>
      <div className="p-4 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={formatXAxis} interval={period === "day" ? 2 : 0} />
            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <Tooltip
              formatter={(value) => [`₺${Number(value).toFixed(2)}`, ""]}
              labelFormatter={(label) => (isSameDay(label) ? `Saat: ${label}` : `Tarih: ${new Date(label).toLocaleDateString("tr-TR")}`)}
              contentStyle={{ borderRadius: "6px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", border: "none" }}
            />
            <Legend iconType="circle" iconSize={8} />
            <Line type="monotone" dataKey="deposits" name="Nakit Girişler" stroke="#10b981" strokeWidth={2} dot={{ stroke: "#10b981", strokeWidth: 2, r: 4 }} activeDot={{ stroke: "#10b981", strokeWidth: 2, r: 6 }} />
            <Line type="monotone" dataKey="withdrawals" name="Nakit Çıkışlar" stroke="#ef4444" strokeWidth={2} dot={{ stroke: "#ef4444", strokeWidth: 2, r: 4 }} activeDot={{ stroke: "#ef4444", strokeWidth: 2, r: 6 }} />
            <Line type="monotone" dataKey="total" name="Net Değişim" stroke="#4f46e5" strokeWidth={2} dot={{ stroke: "#4f46e5", strokeWidth: 2, r: 4 }} activeDot={{ stroke: "#4f46e5", strokeWidth: 2, r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CashMovementsChart;

