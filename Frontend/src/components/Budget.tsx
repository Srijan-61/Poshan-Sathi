import React, { useState, useEffect } from "react";
import axios from "axios";
import SmartSuggestions from "./SmartSuggestions"; // Imports your AI component!

interface Log {
  _id: string;
  food_name: string;
  calories: number;
  cost: number;
  quantity: number;
  createdAt: string;
}

const Budget: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Default goals (Can later be pulled from user profile)
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
          "http://localhost:5000/api/logs/all",
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

  const dailyLogs = logs.filter(
    (log) => new Date(log.createdAt) >= startOfToday,
  );
  const monthlyLogs = logs.filter(
    (log) => new Date(log.createdAt) >= startOfMonth,
  );

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
          Budget & AI Companion
        </h1>
        <p className="text-gray-500 text-lg font-medium">
          Track your expenses and get smart meal recommendations.
        </p>
      </section>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col gap-4">
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

        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col gap-4">
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

      {/* The AI Brain Component Goes Here! */}
      <SmartSuggestions />

      {/* Expense History */}
      <section className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
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
                      {new Date(log.createdAt).toLocaleDateString()} •{" "}
                      {log.quantity}x
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
