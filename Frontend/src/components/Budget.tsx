import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import { useTheme } from "../context/ThemeContext";
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

interface BudgetProps {
  dailyBudgetGoal: number;
  monthlyBudgetGoal: number;
}

// --- Helper: Format month key ---
const toMonthKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

const formatMonthLabel = (monthKey: string): string => {
  const [y, m] = monthKey.split("-");
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

const Budget: React.FC<BudgetProps> = ({
  dailyBudgetGoal,
  monthlyBudgetGoal,
}) => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isDark } = useTheme();

  // Theme helpers
  const card = isDark ? "bg-neutral-900 border-neutral-800 shadow-none" : "bg-white border-neutral-100 shadow-sm";
  const heading = isDark ? "text-white" : "text-neutral-900";
  const subtext = isDark ? "text-neutral-400" : "text-neutral-500";
  const progressBg = isDark ? "bg-neutral-800" : "bg-neutral-100";

  // --- Budget History State ---
  const [historyMonth, setHistoryMonth] = useState(() => {
    // Default to previous month
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return toMonthKey(d);
  });
  const [historyLogs, setHistoryLogs] = useState<Log[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showAllExpenses, setShowAllExpenses] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await axios.get("/api/logs?range=month");
        setLogs(data);
      } catch (err) {
        console.error("Failed to fetch logs", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // --- Fetch history month logs ---
  useEffect(() => {
    if (!historyMonth) return;
    const currentMonthKey = toMonthKey(new Date());
    if (historyMonth === currentMonthKey) {
      // If current month, just reuse existing logs
      setHistoryLogs(logs);
      return;
    }

    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const { data } = await axios.get(`/api/logs?month=${historyMonth}`);
        setHistoryLogs(data);
      } catch (err) {
        console.error("Failed to fetch budget history", err);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [historyMonth, logs]);

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

  const dailyPercent = Math.min(
    (todaySpent / Math.max(dailyBudgetGoal, 1)) * 100,
    100,
  );
  const monthlyPercent = Math.min(
    (monthSpent / Math.max(monthlyBudgetGoal, 1)) * 100,
    100,
  );

  const getProgressColor = (percent: number) => {
    if (percent >= 90) return "bg-red-500";
    if (percent >= 75) return "bg-orange-500";
    return "bg-green-500";
  };

  // --- 7-Day Chart Data ---
  const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);

    const nextDay = new Date(d);
    nextDay.setDate(nextDay.getDate() + 1);

    const spentThisDay = logs
      .filter((log) => {
        const logDate = new Date(log.date);
        return logDate >= d && logDate < nextDay;
      })
      .reduce((sum, log) => sum + log.cost, 0);

    return {
      name: d.toLocaleDateString("en-US", { weekday: "short" }),
      spent: spentThisDay,
    };
  });

  // --- History Month Chart Data ---
  const getHistoryChartData = () => {
    const [y, m] = historyMonth.split("-").map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();

    return Array.from({ length: daysInMonth }).map((_, i) => {
      const day = i + 1;
      const dayStart = new Date(y, m - 1, day, 0, 0, 0, 0);
      const dayEnd = new Date(y, m - 1, day, 23, 59, 59, 999);

      const spentThisDay = historyLogs
        .filter((log) => {
          const logDate = new Date(log.date);
          return logDate >= dayStart && logDate <= dayEnd;
        })
        .reduce((sum, log) => sum + log.cost, 0);

      return { name: String(day), spent: Math.round(spentThisDay) };
    });
  };

  const historyChartData = getHistoryChartData();
  const historyTotalSpent = historyLogs.reduce((sum, log) => sum + log.cost, 0);
  const historyTotalCalories = historyLogs.reduce((sum, log) => sum + log.calories, 0);
  const historyDaysWithData = new Set(
    historyLogs.map((log) => new Date(log.date).getDate()),
  ).size;
  const historyDailyAvg = historyDaysWithData > 0 ? Math.round(historyTotalSpent / historyDaysWithData) : 0;

  // --- Month Navigation ---
  const navigateMonth = (direction: number) => {
    const [y, m] = historyMonth.split("-").map(Number);
    const d = new Date(y, m - 1 + direction, 1);
    // Don't go into the future
    if (d > new Date()) return;
    setHistoryMonth(toMonthKey(d));
    setShowAllExpenses(false);
  };

  const isCurrentMonth = historyMonth === toMonthKey(new Date());

  // Custom Tooltip for the Graph
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-neutral-100 text-sm font-bold">
          <p className="text-neutral-500 mb-1">{label}</p>
          <p className="text-neutral-900">
            Spent:{" "}
            <span className="text-green-600">Rs. {payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // History tooltip
  const HistoryTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-neutral-100 text-sm font-bold">
          <p className="text-neutral-500 mb-1">Day {label}</p>
          <p className="text-neutral-900">
            Spent:{" "}
            <span className="text-indigo-600">Rs. {payload[0].value}</span>
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
        <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${heading}`}>
          Budget Analytics
        </h1>
        <p className={`text-lg font-medium ${subtext}`}>
          Track your expenses and get smart meal recommendations.
        </p>
      </section>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`rounded-3xl p-6 border flex flex-col gap-4 ${card}`}>
          <div className="flex justify-between items-center">
            <h3 className={`font-bold uppercase tracking-wider text-sm ${subtext}`}>
              Today's Spend
            </h3>
            <span className={`material-symbols-outlined ${subtext}`}>
              today
            </span>
          </div>
          <div className="flex items-end gap-2">
            <h2 className={`text-4xl font-black ${heading}`}>
              Rs. {todaySpent}
            </h2>
            <span className={`font-medium mb-1 ${subtext}`}>
              / {dailyBudgetGoal}
            </span>
          </div>
          <div className={`w-full rounded-full h-3 mt-2 overflow-hidden ${progressBg}`}>
            <div
              className={`h-full rounded-full transition-all ${getProgressColor(dailyPercent)}`}
              style={{ width: `${dailyPercent}%` }}
            ></div>
          </div>
        </div>

        <div className={`rounded-3xl p-6 border flex flex-col gap-4 ${card}`}>
          <div className="flex justify-between items-center">
            <h3 className={`font-bold uppercase tracking-wider text-sm ${subtext}`}>
              This Month
            </h3>
            <span className={`material-symbols-outlined ${subtext}`}>
              calendar_month
            </span>
          </div>
          <div className="flex items-end gap-2">
            <h2 className={`text-4xl font-black ${heading}`}>
              Rs. {monthSpent}
            </h2>
            <span className={`font-medium mb-1 ${subtext}`}>
              / {monthlyBudgetGoal}
            </span>
          </div>
          <div className={`w-full rounded-full h-3 mt-2 overflow-hidden ${progressBg}`}>
            <div
              className={`h-full rounded-full transition-all ${getProgressColor(monthlyPercent)}`}
              style={{ width: `${monthlyPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 7-Day Spending Trend */}
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
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "#F3F4F6" }}
              />
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

      {/* Recent Expenses */}
      <section className={`rounded-3xl p-6 border ${card}`}>
        <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${heading}`}>
          <span className="material-symbols-outlined text-green-600">
            receipt_long
          </span>
          Recent Expenses
        </h3>
        {logs.length === 0 ? (
          <div className={`text-center p-8 font-medium ${subtext}`}>
            No expenses tracked yet.
          </div>
        ) : (
          <ul className={`divide-y ${isDark ? "divide-neutral-800" : "divide-neutral-100"}`}>
            {logs.slice(0, 5).map((log) => (
              <li
                key={log._id}
                className="py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? "bg-neutral-800 text-neutral-400" : "bg-neutral-50 text-neutral-500"}`}>
                    <span className="material-symbols-outlined">
                      restaurant
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className={`font-bold text-lg ${heading}`}>
                      {log.food_name}
                    </span>
                    <span className={`text-xs font-bold ${subtext}`}>
                      {new Date(log.date).toLocaleDateString()} • {log.quantity}
                      x
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-bold text-lg block ${heading}`}>
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

      {/* ========== BUDGET HISTORY SECTION ========== */}
      <section className="flex flex-col gap-6">
        {/* Section Header */}
        <div className="flex items-center gap-3 px-1">
          <span className={`material-symbols-outlined text-2xl ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>
            history
          </span>
          <h2 className={`text-2xl font-extrabold ${heading}`}>Budget History</h2>
        </div>

        {/* Month Navigator */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateMonth(-1)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDark ? "bg-neutral-800 text-neutral-400 hover:bg-indigo-900/40 hover:text-indigo-400" : "bg-neutral-100 text-neutral-600 hover:bg-indigo-100 hover:text-indigo-600"}`}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>

            <div className="text-center">
              <h3 className={`text-xl font-extrabold ${heading}`}>
                {formatMonthLabel(historyMonth)}
              </h3>
              <p className={`text-sm font-medium mt-0.5 ${subtext}`}>
                {isCurrentMonth ? "Current month" : "Past month"}
              </p>
            </div>

            <button
              onClick={() => navigateMonth(1)}
              disabled={isCurrentMonth}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                isCurrentMonth
                  ? isDark ? "bg-neutral-800 text-neutral-600 cursor-not-allowed" : "bg-neutral-50 text-neutral-300 cursor-not-allowed"
                  : isDark ? "bg-neutral-800 text-neutral-400 hover:bg-indigo-900/40 hover:text-indigo-400" : "bg-neutral-100 text-neutral-600 hover:bg-indigo-100 hover:text-indigo-600"
              }`}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Loading */}
        {isLoadingHistory && (
          <div className={`flex items-center justify-center p-10 rounded-3xl border ${card}`}>
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <span className="text-sm text-neutral-500 font-medium">Loading budget data...</span>
            </div>
          </div>
        )}

        {/* History Content */}
        {!isLoadingHistory && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`rounded-2xl p-4 border text-center ${card}`}>
                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${subtext}`}>Total Spent</p>
                <p className={`text-2xl font-extrabold ${heading}`}>Rs. {Math.round(historyTotalSpent)}</p>
              </div>
              <div className={`rounded-2xl p-4 border text-center ${card}`}>
                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${subtext}`}>Budget</p>
                <p className={`text-2xl font-extrabold ${heading}`}>Rs. {monthlyBudgetGoal}</p>
              </div>
              <div className={`rounded-2xl p-4 border text-center ${card}`}>
                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${subtext}`}>Daily Avg</p>
                <p className={`text-2xl font-extrabold ${historyDailyAvg > dailyBudgetGoal ? "text-red-500" : "text-green-600"}`}>
                  Rs. {historyDailyAvg}
                </p>
              </div>
              <div className={`rounded-2xl p-4 border text-center ${card}`}>
                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${subtext}`}>Total Calories</p>
                <p className="text-2xl font-extrabold text-orange-500">{Math.round(historyTotalCalories)}</p>
              </div>
            </div>

            {/* Budget vs Spent Progress */}
            {(() => {
              const histPercent = Math.min((historyTotalSpent / Math.max(monthlyBudgetGoal, 1)) * 100, 100);
              const overBudget = historyTotalSpent > monthlyBudgetGoal;
              return (
                <div className={`rounded-3xl p-6 border ${card}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm font-bold ${subtext}`}>
                      {overBudget ? "⚠️ Over Budget!" : `${Math.round(histPercent)}% of monthly budget used`}
                    </span>
                    <span className={`text-sm font-extrabold ${overBudget ? "text-red-500" : "text-green-600"}`}>
                      {overBudget
                        ? `+Rs. ${Math.round(historyTotalSpent - monthlyBudgetGoal)} over`
                        : `Rs. ${Math.round(monthlyBudgetGoal - historyTotalSpent)} remaining`}
                    </span>
                  </div>
                  <div className={`w-full rounded-full h-4 overflow-hidden ${progressBg}`}>
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${overBudget ? "bg-red-500" : "bg-indigo-500"}`}
                      style={{ width: `${histPercent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })()}

            {/* Daily Breakdown Chart */}
            {historyLogs.length > 0 && (
              <section className={`rounded-3xl p-6 border flex flex-col gap-4 ${card}`}>
                <h3 className={`text-lg font-bold flex items-center gap-2 ${heading}`}>
                  <span className={`material-symbols-outlined ${isDark ? "text-indigo-400" : "text-indigo-500"}`}>
                    insert_chart
                  </span>
                  Daily Breakdown — {formatMonthLabel(historyMonth)}
                </h3>
                <div className="w-full h-56 md:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={historyChartData}
                      margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
                    >
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#9CA3AF", fontSize: 10, fontWeight: "bold" }}
                        interval={window.innerWidth < 640 ? 2 : 1}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#9CA3AF", fontSize: 11, fontWeight: "bold" }}
                      />
                      <Tooltip
                        content={<HistoryTooltip />}
                        cursor={{ fill: "#EEF2FF" }}
                      />
                      <Bar dataKey="spent" radius={[4, 4, 4, 4]}>
                        {historyChartData.map((entry, index) => (
                          <Cell
                            key={`hist-cell-${index}`}
                            fill={entry.spent > dailyBudgetGoal ? "#EF4444" : "#6366F1"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="flex items-center gap-6 justify-center text-xs font-bold text-neutral-400">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-indigo-500"></div>
                    Within budget
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-red-500"></div>
                    Over daily limit
                  </div>
                </div>
              </section>
            )}

            {/* History Expense List */}
            {historyLogs.length === 0 ? (
              <div className={`text-center p-10 rounded-3xl border ${card}`}>
                <span className={`material-symbols-outlined text-5xl block mb-3 ${isDark ? "text-neutral-600" : "text-neutral-300"}`}>
                  money_off
                </span>
                <p className={`font-medium ${subtext}`}>
                  No expenses recorded for {formatMonthLabel(historyMonth)}.
                </p>
              </div>
            ) : (
              <section className={`rounded-3xl p-6 border ${card}`}>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${heading}`}>
                  <span className={`material-symbols-outlined ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>
                    list_alt
                  </span>
                  All Expenses — {formatMonthLabel(historyMonth)}
                  <span className={`ml-auto text-sm font-bold ${subtext}`}>
                    {historyLogs.length} item{historyLogs.length !== 1 ? "s" : ""}
                  </span>
                </h3>
                <ul className={`divide-y ${isDark ? "divide-neutral-800" : "divide-neutral-100"}`}>
                  {(showAllExpenses ? historyLogs : historyLogs.slice(0, 8)).map((log) => (
                    <li
                      key={log._id}
                      className="py-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? "bg-indigo-900/30 text-indigo-400" : "bg-indigo-50 text-indigo-400"}`}>
                          <span className="material-symbols-outlined text-lg">
                            restaurant
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-bold ${heading}`}>
                            {log.food_name}
                          </span>
                          <span className={`text-xs font-bold ${subtext}`}>
                            {new Date(log.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}{" "}
                            • {log.quantity}x
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold block ${heading}`}>
                          Rs. {log.cost}
                        </span>
                        <span className="text-xs font-bold text-orange-500">
                          {log.calories} kcal
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
                {historyLogs.length > 8 && !showAllExpenses && (
                  <button
                    onClick={() => setShowAllExpenses(true)}
                    className="w-full mt-4 py-3 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
                  >
                    Show all {historyLogs.length} expenses
                  </button>
                )}
                {showAllExpenses && historyLogs.length > 8 && (
                  <button
                    onClick={() => setShowAllExpenses(false)}
                    className="w-full mt-4 py-3 text-sm font-bold text-neutral-500 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
                  >
                    Show less
                  </button>
                )}
              </section>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default Budget;

