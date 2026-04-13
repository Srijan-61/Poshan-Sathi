import React from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Props {
  last7DaysData: { name: string; spent: number }[];
  dailyBudgetGoal: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-lg border border-neutral-100 text-sm font-bold">
        <p className="text-neutral-500 mb-1">{label}</p>
        <p className="text-neutral-900">
          Spent: <span className="text-green-600">Rs. {payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
}

export default function WeeklyTrendChart({ last7DaysData, dailyBudgetGoal }: Props) {
  const { isDark } = useTheme();

  const card = isDark ? "bg-neutral-900 border-neutral-800 shadow-none" : "bg-white border-neutral-100 shadow-sm";
  const heading = isDark ? "text-white" : "text-neutral-900";

  return (
    <section className={`rounded-3xl p-6 border flex flex-col gap-4 ${card}`}>
      <h3 className={`text-xl font-bold flex items-center gap-2 mb-2 ${heading}`}>
        <span className="material-symbols-outlined text-blue-500">
          bar_chart
        </span>
        7-Day Spending Trend
      </h3>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={last7DaysData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 12, fontWeight: "bold" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 12, fontWeight: "bold" }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F3F4F6" }} />
            <Bar dataKey="spent" radius={[6, 6, 6, 6]}>
              {last7DaysData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.spent > dailyBudgetGoal ? "#EF4444" : "#22C55E"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
