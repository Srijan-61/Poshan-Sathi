import React from "react";
import { useTheme } from "../../context/ThemeContext";
import RecommendationsWidget from "../RecommendationsWidget";

// --- Types ---
interface Log {
  _id: string;
  food_name: string;
  calories: number;
  cost: number;
  quantity: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  micros?: {
    iron?: number;
    calcium?: number;
    vitaminC?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
}

interface Props {
  logs: Log[];
  budget: number;
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    iron: number;
    calcium: number;
    vitaminC: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
  onLog: (food: any, quantity: number) => void;
}

const Dashboard: React.FC<Props> = ({ logs, budget, goals, onLog }) => {
  const { isDark } = useTheme();

  const totals = logs.reduce(
    (acc, log) => ({
      calories: acc.calories + log.calories,
      cost: acc.cost + log.cost,
      protein: acc.protein + (log.protein || log.calories * 0.03),
      carbs: acc.carbs + (log.carbs || log.calories * 0.12),
      fats: acc.fats + (log.fats || log.calories * 0.04),
      iron: acc.iron + (log.micros?.iron || 0),
      calcium: acc.calcium + (log.micros?.calcium || 0),
      vitaminC: acc.vitaminC + (log.micros?.vitaminC || 0),
      fiber: acc.fiber + (log.micros?.fiber || 0),
      sugar: acc.sugar + (log.micros?.sugar || 0),
      sodium: acc.sodium + (log.micros?.sodium || 0),
    }),
    {
      calories: 0,
      cost: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      iron: 0,
      calcium: 0,
      vitaminC: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    },
  );

  const remainingBudget = budget - totals.cost;

  const calPercent = Math.min((totals.calories / Math.max(goals.calories, 1)) * 100, 100);
  const costPercent = Math.min((totals.cost / Math.max(budget, 1)) * 100, 100);
  const carbPercent = Math.min((totals.carbs / Math.max(goals.carbs, 1)) * 100, 100);
  const proPercent = Math.min((totals.protein / Math.max(goals.protein, 1)) * 100, 100);
  const fatPercent = Math.min((totals.fats / Math.max(goals.fats, 1)) * 100, 100);

  // Theme helpers
  const card = isDark
    ? "bg-neutral-900 border-neutral-800 shadow-none"
    : "bg-white border-neutral-200 shadow-sm";
  const cardHover = isDark ? "hover:shadow-neutral-900/50" : "hover:shadow-md";
  const heading = isDark ? "text-white" : "text-neutral-900";
  const subtext = isDark ? "text-neutral-400" : "text-neutral-500";
  const progressBg = isDark ? "bg-neutral-800" : "bg-neutral-100";
  const microCard = isDark
    ? "bg-neutral-800 border-neutral-700"
    : "bg-neutral-50 border-neutral-200";

  return (
    <div className="flex flex-col gap-8 pb-20 md:pb-0">
      {/* Greeting Section */}
      <section className="flex flex-col gap-2 pt-2">
        <h1 className={`text-3xl md:text-4xl font-extrabold leading-tight tracking-tight ${heading}`}>
          Namaste, Srijan!
        </h1>
        <p className={`text-lg font-medium ${subtext}`}>
          Let's hit your health and budget goals today.
        </p>
      </section>

      <RecommendationsWidget onLog={onLog} />

      {/* Top Cards: Calories & Budget */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calories Card */}
        <div className={`rounded-xl p-6 border ${card} ${cardHover} transition-shadow relative overflow-hidden group`}>
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-8xl text-orange-500">
              local_fire_department
            </span>
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? "bg-orange-900/30 text-orange-400" : "bg-orange-50 text-orange-500"}`}>
                <span className="material-symbols-outlined">
                  local_fire_department
                </span>
              </div>
              <p className={`text-base font-bold ${heading}`}>
                Calories Consumed
              </p>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded ${isDark ? "bg-orange-900/30 text-orange-400" : "bg-orange-50 text-orange-600"}`}>
              Daily Goal
            </span>
          </div>
          <div className="relative z-10">
            <div className="flex items-baseline gap-2 mb-2">
              <p className="text-orange-500 text-4xl font-extrabold tracking-tight">
                {Math.round(totals.calories)}
              </p>
              <p className={`text-xl font-medium ${subtext}`}>
                / {goals.calories} kcal
              </p>
            </div>
            <div className={`w-full rounded-full h-3 mb-2 ${progressBg}`}>
              <div
                className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${calPercent}%` }}
              ></div>
            </div>
            <p className={`text-sm font-medium ${subtext}`}>
              {Math.round(calPercent)}% of your daily intake reached
            </p>
          </div>
        </div>

        {/* Budget Card */}
        <div className={`rounded-xl p-6 border ${card} ${cardHover} transition-shadow relative overflow-hidden group`}>
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-8xl text-green-600">
              account_balance_wallet
            </span>
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? "bg-green-900/30 text-green-400" : "bg-green-50 text-green-600"}`}>
                <span className="material-symbols-outlined">
                  account_balance_wallet
                </span>
              </div>
              <p className={`text-base font-bold ${heading}`}>
                Money Remaining
              </p>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded ${isDark ? "bg-green-900/30 text-green-400" : "bg-green-50 text-green-600"}`}>
              Daily Limit
            </span>
          </div>
          <div className="relative z-10">
            <div className="flex items-baseline gap-2 mb-2">
              <p
                className={`text-4xl font-extrabold tracking-tight ${remainingBudget < 0 ? "text-red-500" : "text-green-600"}`}
              >
                Rs. {Math.max(0, remainingBudget)}
              </p>
            </div>
            <div className={`w-full rounded-full h-3 mb-2 flex justify-start ${progressBg}`}>
              <div
                className={`h-3 rounded-full transition-all duration-500 ${remainingBudget < 0 ? "bg-red-500" : "bg-green-500"}`}
                style={{ width: `${costPercent}%` }}
              ></div>
            </div>
            <p
              className={`font-medium text-sm flex items-center gap-1 ${remainingBudget < 0 ? "text-red-500" : "text-green-600"}`}
            >
              <span className="material-symbols-outlined text-sm">
                {remainingBudget < 0 ? "warning" : "check_circle"}
              </span>
              {remainingBudget < 0 ? "Over budget!" : "On Track with budget"}
            </p>
          </div>
        </div>
      </section>

      {/* Nutrient Breakdown */}
      <section className={`rounded-2xl border overflow-hidden mb-8 ${card}`}>
        <div className={`p-6 flex justify-between items-center border-b ${
          isDark ? "bg-neutral-800 border-neutral-700" : "bg-neutral-50 border-neutral-200"
        }`}>
          <div>
            <h3 className={`text-xl md:text-2xl font-bold ${heading}`}>
              Nutrient Breakdown
            </h3>
            <p className={`text-sm font-medium ${subtext}`}>
              Daily detailed analysis
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl md:text-3xl font-bold text-green-600">
              Rs. {totals.cost}
            </p>
            <p className={`text-xs font-bold uppercase tracking-wide ${subtext}`}>
              Total Cost
            </p>
          </div>
        </div>
        <div className="p-6 md:p-8 space-y-8">
          <div className="flex flex-col lg:flex-row gap-10 items-center lg:items-start">
            {/* Visual Gauge */}
            <div className="flex-shrink-0 relative flex items-center justify-center">
              <div
                className="relative w-48 h-48 rounded-full"
                style={{
                  background: `conic-gradient(#f97316 0% ${carbPercent}%, #16a34a ${carbPercent}% ${carbPercent + fatPercent}%, #3b82f6 ${carbPercent + fatPercent}% 100%)`,
                }}
              >
                <div className={`absolute inset-2 rounded-full flex flex-col items-center justify-center z-10 shadow-inner ${
                  isDark ? "bg-neutral-900" : "bg-white"
                }`}>
                  <span className="material-symbols-outlined text-orange-500 text-3xl mb-1">
                    local_fire_department
                  </span>
                  <span className={`text-4xl font-extrabold leading-none ${heading}`}>
                    {Math.round(totals.calories)}
                  </span>
                  <span className={`text-sm font-medium mt-1 ${subtext}`}>
                    kcal
                  </span>
                </div>
              </div>
            </div>

            {/* Macros Bars */}
            <div className="flex-1 w-full flex flex-col justify-center space-y-6">
              <h4 className={`text-lg font-bold mb-2 ${heading}`}>
                Macronutrients
              </h4>

              {/* Carbs */}
              <div className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg border ${isDark ? "bg-orange-900/20 text-orange-400 border-orange-800/30" : "bg-orange-50 text-orange-500 border-orange-100"}`}>
                      <span className="material-symbols-outlined text-xl">
                        grain
                      </span>
                    </div>
                    <span className={`font-bold ${isDark ? "text-neutral-300" : "text-neutral-700"}`}>
                      Carbohydrates
                    </span>
                  </div>
                  <span className={`font-bold ${heading}`}>
                    {Math.round(totals.carbs)}g
                  </span>
                </div>
                <div className={`w-full rounded-full h-2 ${progressBg}`}>
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all"
                    style={{ width: `${carbPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Protein */}
              <div className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg border ${isDark ? "bg-blue-900/20 text-blue-400 border-blue-800/30" : "bg-blue-50 text-blue-500 border-blue-100"}`}>
                      <span className="material-symbols-outlined text-xl">
                        fitness_center
                      </span>
                    </div>
                    <span className={`font-bold ${isDark ? "text-neutral-300" : "text-neutral-700"}`}>Protein</span>
                  </div>
                  <span className={`font-bold ${heading}`}>
                    {Math.round(totals.protein)}g
                  </span>
                </div>
                <div className={`w-full rounded-full h-2 ${progressBg}`}>
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${proPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Fats */}
              <div className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg border ${isDark ? "bg-green-900/20 text-green-400 border-green-800/30" : "bg-green-50 text-green-600 border-green-100"}`}>
                      <span className="material-symbols-outlined text-xl">
                        opacity
                      </span>
                    </div>
                    <span className={`font-bold ${isDark ? "text-neutral-300" : "text-neutral-700"}`}>Fats</span>
                  </div>
                  <span className={`font-bold ${heading}`}>
                    {Math.round(totals.fats)}g
                  </span>
                </div>
                <div className={`w-full rounded-full h-2 ${progressBg}`}>
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${fatPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className={`border-t my-6 ${isDark ? "border-neutral-800" : "border-neutral-100"}`}></div>

          {/* Micros Grid */}
          <div>
            <h4 className={`text-lg font-bold mb-4 ${heading}`}>
              Micronutrients & Others
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Iron", value: totals.iron.toFixed(1), unit: "mg" },
                { label: "Calcium", value: totals.calcium.toFixed(0), unit: "mg" },
                { label: "Vitamin C", value: totals.vitaminC.toFixed(0), unit: "mg" },
                { label: "Fiber", value: totals.fiber.toFixed(1), unit: "g" },
                { label: "Sugar", value: totals.sugar.toFixed(1), unit: "g" },
                { label: "Sodium", value: totals.sodium.toFixed(0), unit: "mg" },
              ].map((item) => (
                <div key={item.label} className={`p-4 rounded-xl border ${microCard}`}>
                  <p className={`text-xs font-bold uppercase mb-1 ${subtext}`}>
                    {item.label}
                  </p>
                  <p className={`text-xl font-extrabold ${heading}`}>
                    {item.value}{item.unit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
