import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { getProgressColor } from "./utils";

interface Props {
  todaySpent: number;
  dailyBudgetGoal: number;
  dailyPercent: number;
  monthSpent: number;
  monthlyBudgetGoal: number;
  monthlyPercent: number;
}

export default function FinancialSummary({
  todaySpent,
  dailyBudgetGoal,
  dailyPercent,
  monthSpent,
  monthlyBudgetGoal,
  monthlyPercent,
}: Props) {
  const { isDark } = useTheme();

  const card = isDark ? "bg-neutral-900 border-neutral-800 shadow-none" : "bg-white border-neutral-100 shadow-sm";
  const heading = isDark ? "text-white" : "text-neutral-900";
  const subtext = isDark ? "text-neutral-400" : "text-neutral-500";
  const progressBg = isDark ? "bg-neutral-800" : "bg-neutral-100";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className={`rounded-3xl p-6 border flex flex-col gap-4 ${card}`}>
        <div className="flex justify-between items-center">
          <h3 className={`font-bold uppercase tracking-wider text-sm ${subtext}`}>
            Today's Spend
          </h3>
          <span className={`material-symbols-outlined ${subtext}`}>today</span>
        </div>
        <div className="flex items-end gap-2">
          <h2 className={`text-4xl font-black ${heading}`}>Rs. {todaySpent}</h2>
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
          <h2 className={`text-4xl font-black ${heading}`}>Rs. {monthSpent}</h2>
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
  );
}
