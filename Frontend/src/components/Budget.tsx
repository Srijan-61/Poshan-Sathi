import React, { useState, useEffect } from "react";
import axios from "axios";
import SmartSuggestions from "./SmartSuggestions";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Log {
  _id: string;
  food_name: string;
  calories: number;
  cost: number;
  quantity: number;
  date: string;
}

const Budget: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Default goals
  const DAILY_BUDGET_GOAL = 500;
  const MONTHLY_BUDGET_GOAL = 15000;

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        if (!userInfo.token) return;

        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };
        const { data } = await axios.get(
          "http://localhost:5000/api/logs",
          config,
        );
        setLogs(data);
      } catch (err) {
        console.error("Failed to fetch logs", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // --- Date Math ---
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const dailyLogs = logs.filter((log) => new Date(log.date) >= startOfToday);
  const monthlyLogs = logs.filter((log) => new Date(log.date) >= startOfMonth);

  const todaySpent = dailyLogs.reduce((sum, log) => sum + log.cost, 0);
  const monthSpent = monthlyLogs.reduce((sum, log) => sum + log.cost, 0);

  const dailyPercent = Math.min((todaySpent / DAILY_BUDGET_GOAL) * 100, 100);
  const monthlyPercent = Math.min(
    (monthSpent / MONTHLY_BUDGET_GOAL) * 100,
    100,
  );

  const getProgressColor = (percent: number) => {
    if (percent >= 90) return "bg-red-500";
    if (percent >= 75) return "bg-orange-500";
    return "bg-green-500";
  };

  // --- Graph Data Preparation (Last 7 Days) ---
  const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i)); // Go back 6 days, then 5, 4... to today
    d.setHours(0, 0, 0, 0);

    const nextDay = new Date(d);
    nextDay.setDate(nextDay.getDate() + 1);

    // Calculate total cost for this specific day
    const spentThisDay = logs
      .filter((log) => {
        const logDate = new Date(log.date);
        return logDate >= d && logDate < nextDay;
      })
      .reduce((sum, log) => sum + log.cost, 0);

    return {
      // Get short day name (e.g., 'Mon', 'Tue')
      name: d.toLocaleDateString("en-US", { weekday: "short" }),
      spent: spentThisDay,
    };
  });

  // Custom Tooltip for the Graph
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 text-sm font-bold">
          <p className="text-gray-500 mb-1">{label}</p>
          <p className="text-gray-900">
            Spent:{" "}
            <span className="text-green-600">Rs. {payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-green-600">
        <span className="material-symbols-outlined animate-spin text-4xl">
          autorenew
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-24 md:pb-6 animate-in fade-in slide-in-from-bottom-4 pt-2">
      {/* Page Header */}
      <section className="flex flex-col gap-2">
        <h1 className="text-gray-900 text-3xl md:text-4xl font-extrabold tracking-tight">
          Budget Analytics
        </h1>
        <p className="text-gray-500 text-lg font-medium">
          Track your expenses and get smart meal recommendations.
        </p>
      </section>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-500 font-bold uppercase tracking-wider text-sm">
              Today's Spend
            </h3>
            <span className="material-symbols-outlined text-gray-400">
              today
            </span>
          </div>
          <div className="flex items-end gap-2">
            <h2 className="text-4xl font-black text-gray-900">
              Rs. {todaySpent}
            </h2>
            <span className="text-gray-400 font-medium mb-1">
              / {DAILY_BUDGET_GOAL}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getProgressColor(dailyPercent)}`}
              style={{ width: `${dailyPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-500 font-bold uppercase tracking-wider text-sm">
              This Month
            </h3>
            <span className="material-symbols-outlined text-gray-400">
              calendar_month
            </span>
          </div>
          <div className="flex items-end gap-2">
            <h2 className="text-4xl font-black text-gray-900">
              Rs. {monthSpent}
            </h2>
            <span className="text-gray-400 font-medium mb-1">
              / {MONTHLY_BUDGET_GOAL}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getProgressColor(monthlyPercent)}`}
              style={{ width: `${monthlyPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* --- NEW: Recharts Graph Section --- */}
      <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-2">
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
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "#F3F4F6" }}
              />
              <Bar dataKey="spent" radius={[6, 6, 6, 6]}>
                {last7DaysData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.spent > DAILY_BUDGET_GOAL ? "#EF4444" : "#22C55E"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* The AI Brain Component */}
      <SmartSuggestions />

      {/* Expense History */}
      <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-green-600">
            receipt_long
          </span>
          Recent Expenses
        </h3>
        {logs.length === 0 ? (
          <div className="text-center p-8 text-gray-400 font-medium">
            No expenses tracked yet.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {logs.slice(0, 5).map((log) => (
              <li
                key={log._id}
                className="py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
                    <span className="material-symbols-outlined">
                      restaurant
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 text-lg">
                      {log.food_name}
                    </span>
                    <span className="text-xs font-bold text-gray-400">
                      {new Date(log.date).toLocaleDateString()} • {log.quantity}
                      x
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-900 text-lg block">
                    Rs. {log.cost}
                  </span>
                  <span className="text-xs font-bold text-orange-500">
                    {log.calories} kcal
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Budget;
