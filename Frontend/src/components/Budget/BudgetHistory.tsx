import React from "react";
import { useTheme } from "../../context/ThemeContext";
import type { Log } from "./types";
import { formatMonthLabel } from "./utils";
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
  historyMonth: string;
  navigateMonth: (direction: number) => void;
  isCurrentMonth: boolean;
  isLoadingHistory: boolean;
  historyTotalSpent: number;
  monthlyBudgetGoal: number;
  historyDailyAvg: number;
  dailyBudgetGoal: number;
  historyTotalCalories: number;
  historyChartData: { name: string; spent: number }[];
  historyLogs: Log[];
  showAllExpenses: boolean;
  setShowAllExpenses: (v: boolean) => void;
}

const HistoryTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-lg border border-neutral-100 text-sm font-bold">
        <p className="text-neutral-500 mb-1">Day {label}</p>
        <p className="text-neutral-900">
          Spent: <span className="text-indigo-600">Rs. {payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function BudgetHistory({
  historyMonth,
  navigateMonth,
  isCurrentMonth,
  isLoadingHistory,
  historyTotalSpent,
  monthlyBudgetGoal,
  historyDailyAvg,
  dailyBudgetGoal,
  historyTotalCalories,
  historyChartData,
  historyLogs,
  showAllExpenses,
  setShowAllExpenses,
}: Props) {
  const { isDark } = useTheme();

  const card = isDark ? "bg-neutral-900 border-neutral-800 shadow-none" : "bg-white border-neutral-100 shadow-sm";
  const heading = isDark ? "text-white" : "text-neutral-900";
  const subtext = isDark ? "text-neutral-400" : "text-neutral-500";
  const progressBg = isDark ? "bg-neutral-800" : "bg-neutral-100";

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center gap-3 px-1">
        <span className={`material-symbols-outlined text-2xl ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>
          history
        </span>
        <h2 className={`text-2xl font-extrabold ${heading}`}>Budget History</h2>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateMonth(-1)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              isDark 
                ? "bg-neutral-800 text-neutral-400 hover:bg-indigo-900/40 hover:text-indigo-400" 
                : "bg-neutral-100 text-neutral-600 hover:bg-indigo-100 hover:text-indigo-600"
            }`}
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

      {isLoadingHistory && (
        <div className={`flex items-center justify-center p-10 rounded-3xl border ${card}`}>
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <span className="text-sm text-neutral-500 font-medium">Loading budget data...</span>
          </div>
        </div>
      )}

      {!isLoadingHistory && (
        <>
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
                    <Tooltip content={<HistoryTooltip />} cursor={{ fill: "#EEF2FF" }} />
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
                  <li key={log._id} className="py-3 flex items-center justify-between">
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
  );
}
