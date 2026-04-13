import React from "react";
import { useTheme } from "../../context/ThemeContext";
import type { DailyRequirements } from "./types";

interface Props {
  requirements: DailyRequirements;
}

export default function DailyTargetsDisplay({ requirements }: Props) {
  const { isDark } = useTheme();

  const t = {
    card: isDark ? "bg-neutral-900 border-neutral-800 shadow-none" : "bg-white border-neutral-100 shadow-sm",
    heading: isDark ? "text-white" : "text-neutral-900",
    subtext: isDark ? "text-neutral-400" : "text-neutral-500",
    label: isDark ? "text-neutral-400" : "text-neutral-500",
  };

  return (
    <section className={`rounded-3xl p-6 border transition-colors duration-300 mt-4 ${t.card}`}>
      <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${t.heading}`}>
        <span className="material-symbols-outlined text-green-500">calculate</span>
        Your Daily Targets
      </h3>

      {/* Energy Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className={`flex flex-col items-center p-4 rounded-2xl ${isDark ? "bg-neutral-800" : "bg-neutral-50 border border-neutral-100"}`}>
          <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>BMR</span>
          <span className={`text-2xl font-black ${t.heading}`}>{requirements.bmr}</span>
          <span className={`text-xs ${t.subtext}`}>kcal</span>
        </div>
        <div className={`flex flex-col items-center p-4 rounded-2xl border ${isDark ? "bg-green-900/20 border-green-700/40" : "bg-green-50 border-green-200"}`}>
          <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-green-400" : "text-green-600"}`}>Daily Calories</span>
          <span className={`text-3xl font-black ${isDark ? "text-green-300" : "text-green-700"}`}>{requirements.calories}</span>
          <span className={`text-xs ${isDark ? "text-green-500/70" : "text-green-500"}`}>kcal/day</span>
        </div>
        <div className={`flex flex-col items-center p-4 rounded-2xl ${isDark ? "bg-neutral-800" : "bg-neutral-50 border border-neutral-100"}`}>
          <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>TDEE</span>
          <span className={`text-2xl font-black ${t.heading}`}>{requirements.tdee}</span>
          <span className={`text-xs ${t.subtext}`}>kcal</span>
        </div>
      </div>

      {/* Macronutrients */}
      <h4 className={`text-sm font-bold uppercase tracking-wider mb-3 ${t.label}`}>Macronutrients</h4>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className={`flex flex-col gap-1 p-3 rounded-2xl text-center ${isDark ? "bg-blue-900/20 border border-blue-800/30" : "bg-blue-50 border border-blue-100"}`}>
          <span className={`font-bold text-xs uppercase ${isDark ? "text-blue-400" : "text-blue-600"}`}>Protein</span>
          <span className={`font-bold text-xl ${t.heading}`}>{requirements.protein}g</span>
          <span className={`text-xs ${t.subtext}`}>{requirements.proteinRatio}%</span>
        </div>
        <div className={`flex flex-col gap-1 p-3 rounded-2xl text-center ${isDark ? "bg-orange-900/20 border border-orange-800/30" : "bg-orange-50 border border-orange-100"}`}>
          <span className={`font-bold text-xs uppercase ${isDark ? "text-orange-400" : "text-orange-600"}`}>Carbs</span>
          <span className={`font-bold text-xl ${t.heading}`}>{requirements.carbs}g</span>
          <span className={`text-xs ${t.subtext}`}>{requirements.carbRatio}%</span>
        </div>
        <div className={`flex flex-col gap-1 p-3 rounded-2xl text-center ${isDark ? "bg-green-900/20 border border-green-800/30" : "bg-green-50 border border-green-100"}`}>
          <span className={`font-bold text-xs uppercase ${isDark ? "text-green-400" : "text-green-600"}`}>Fats</span>
          <span className={`font-bold text-xl ${t.heading}`}>{requirements.fats}g</span>
          <span className={`text-xs ${t.subtext}`}>{requirements.fatRatio}%</span>
        </div>
      </div>

      {/* Micronutrients */}
      <h4 className={`text-sm font-bold uppercase tracking-wider mb-3 ${t.label}`}>Micronutrients</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: "Iron", value: requirements.iron, unit: "mg", color: isDark ? "text-rose-400" : "text-rose-600", bg: isDark ? "bg-rose-900/15" : "bg-rose-50" },
          { label: "Calcium", value: requirements.calcium, unit: "mg", color: isDark ? "text-sky-400" : "text-sky-600", bg: isDark ? "bg-sky-900/15" : "bg-sky-50" },
          { label: "Vitamin C", value: requirements.vitaminC, unit: "mg", color: isDark ? "text-lime-400" : "text-lime-600", bg: isDark ? "bg-lime-900/15" : "bg-lime-50" },
          { label: "Fiber", value: requirements.fiber, unit: "g", color: isDark ? "text-amber-400" : "text-amber-600", bg: isDark ? "bg-amber-900/15" : "bg-amber-50" },
          { label: "Sugar (max)", value: requirements.sugar, unit: "g", color: isDark ? "text-pink-400" : "text-pink-600", bg: isDark ? "bg-pink-900/15" : "bg-pink-50" },
          { label: "Sodium (max)", value: requirements.sodium, unit: "mg", color: isDark ? "text-red-400" : "text-red-600", bg: isDark ? "bg-red-900/15" : "bg-red-50" },
        ].map((nutrient) => (
          <div key={nutrient.label} className={`flex flex-col p-3 rounded-xl ${nutrient.bg}`}>
            <span className={`${nutrient.color} font-bold text-[10px] uppercase tracking-wider`}>{nutrient.label}</span>
            <span className={`font-bold text-base ${t.heading}`}>
              {nutrient.value}
              <span className={`text-xs ml-1 ${t.subtext}`}>{nutrient.unit}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
