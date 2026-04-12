import React from "react";
import { useTheme } from "../../context/ThemeContext";

interface RecipeSummaryProps {
  totalCalories: number;
  totalPrice: number;
}

export default function RecipeSummary({
  totalCalories,
  totalPrice
}: RecipeSummaryProps) {
  const { isDark } = useTheme();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
      <div
        className={`rounded-2xl border p-4 sm:p-5 ${
          isDark
            ? "border-orange-800/40 bg-gradient-to-br from-orange-950/80 via-orange-900/40 to-neutral-900"
            : "border-orange-100/80 bg-gradient-to-br from-orange-50 to-orange-100/90"
        }`}
      >
        <p
          className={`text-xs font-bold uppercase tracking-wide ${
            isDark ? "text-orange-300/90" : "text-orange-700"
          }`}
        >
          Total Calories
        </p>
        <p
          className={`mt-1 text-2xl font-extrabold tabular-nums sm:text-3xl ${
            isDark ? "text-orange-200" : "text-orange-700"
          }`}
        >
          {Math.round(totalCalories)}{" "}
          <span className="text-sm font-semibold opacity-90">kcal</span>
        </p>
      </div>
      <div
        className={`rounded-2xl border p-4 sm:p-5 ${
          isDark
            ? "border-emerald-800/40 bg-gradient-to-br from-emerald-950/70 via-emerald-900/35 to-neutral-900"
            : "border-emerald-100/80 bg-gradient-to-br from-emerald-50 to-green-50/90"
        }`}
      >
        <p
          className={`text-xs font-bold uppercase tracking-wide ${
            isDark ? "text-emerald-300/90" : "text-emerald-800"
          }`}
        >
          Estimated Cost
        </p>
        <p
          className={`mt-1 text-2xl font-extrabold tabular-nums sm:text-3xl ${
            isDark ? "text-emerald-200" : "text-emerald-800"
          }`}
        >
          <span className="text-sm font-semibold opacity-90">Rs.</span>{" "}
          {Math.round(totalPrice)}
        </p>
      </div>
    </div>
  );
}
