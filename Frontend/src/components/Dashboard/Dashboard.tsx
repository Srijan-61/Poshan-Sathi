import React from "react";

import HealthTargetsCard from "./HealthTargetsCard";

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
  user: any;
  logs: Log[];
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

const Dashboard: React.FC<Props> = ({ user, logs, goals}) => {
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

  const calPercent = Math.min(
    (totals.calories / Math.max(goals.calories, 1)) * 100,
    100,
  );
  const carbPercent = Math.min(
    (totals.carbs / Math.max(goals.carbs, 1)) * 100,
    100,
  );
  const proPercent = Math.min(
    (totals.protein / Math.max(goals.protein, 1)) * 100,
    100,
  );
  const fatPercent = Math.min(
    (totals.fats / Math.max(goals.fats, 1)) * 100,
    100,
  );

  // Theme helpers — clean, neutral base
  const card = "bg-white border-neutral-200 shadow-sm";
  const heading = "text-neutral-900";
  const subtext = "text-neutral-500";
  const progressBg = "bg-neutral-100";

  return (
    <div className="flex flex-col gap-8 pb-20 md:pb-0">
      {/* Greeting Section */}
      <section className="flex flex-col gap-2 pt-2">
        <h1
          className={`text-3xl md:text-4xl font-extrabold leading-tight tracking-tight ${heading}`}
        >
          Namaste, Srijan!
        </h1>
        <p className={`text-lg font-medium ${subtext}`}>
          Let's hit your health and budget goals today.
        </p>
      </section>

      {/* Top Cards: Calories & Budget */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calories Card */}
        <div
          className={`rounded-xl p-6 border border-l-4 border-l-orange-500 ${card} transition-shadow`}
        >
          <div className="flex justify-between items-start mb-5">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-orange-500 text-2xl">
                local_fire_department
              </span>
              <p
                className={`text-[10px] font-bold uppercase tracking-wider ${subtext}`}
              >
                Calories Consumed
              </p>
            </div>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${subtext}`}
            >
              Daily Goal
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <p className="text-orange-500 text-4xl font-extrabold tracking-tight tabular-nums">
              {Math.round(totals.calories)}
            </p>
            <p className={`text-lg font-medium ${subtext}`}>
              / {goals.calories} kcal
            </p>
          </div>
          <div className={`w-full rounded-full h-2 mb-2 ${progressBg}`}>
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${calPercent}%` }}
            ></div>
          </div>
          <p className={`text-xs font-medium ${subtext}`}>
            {Math.round(calPercent)}% of your daily intake reached
          </p>
        </div>

        {/* Budget Card — Today's Spend */}
        <div
          className={`rounded-xl p-6 border border-l-4 border-l-emerald-500 ${card} transition-shadow`}
        >
          <div className="flex justify-between items-start mb-5">
            <div className="flex items-center gap-3">
              <span className="text-emerald-500 text-2xl font-extrabold">
                रु
              </span>
              <p
                className={`text-[10px] font-bold uppercase tracking-wider ${subtext}`}
              >
                Today's Spend
              </p>
            </div>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${subtext}`}
            >
              Daily
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <p className="text-emerald-500 text-4xl font-extrabold tracking-tight tabular-nums">
              Rs. {Math.round(totals.cost)}
            </p>
          </div>
          <p
            className={`font-medium text-xs flex items-center gap-1.5 ${subtext}`}
          >
            <span className="material-symbols-outlined text-sm text-emerald-500">
              receipt_long
            </span>
            {logs.length} meal{logs.length !== 1 ? "s" : ""} logged today
          </p>
        </div>
      </section>

      <HealthTargetsCard user={user} todayLogs={logs} goals={goals} />

      {/* Nutrient Breakdown */}
      <section className={`rounded-xl border overflow-hidden ${card}`}>
        <div
          className={`px-6 py-5 flex justify-between items-center border-b ${"border-neutral-200"}`}
        >
          <div>
            <h3 className={`text-xl md:text-2xl font-bold ${heading}`}>
              Nutrient Breakdown
            </h3>
            <p className={`text-xs font-medium mt-0.5 ${subtext}`}>
              Daily detailed analysis
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl md:text-3xl font-extrabold text-emerald-500 tabular-nums">
              Rs. {totals.cost}
            </p>
            <p
              className={`text-[10px] font-bold uppercase tracking-wider ${subtext}`}
            >
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
                <div
                  className={`absolute inset-2 rounded-full flex flex-col items-center justify-center z-10 shadow-inner ${"bg-white"}`}
                >
                  <span className="material-symbols-outlined text-orange-500 text-3xl mb-1">
                    local_fire_department
                  </span>
                  <span
                    className={`text-4xl font-extrabold leading-none tabular-nums ${heading}`}
                  >
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
              <h4
                className={`text-[10px] font-bold uppercase tracking-wider ${subtext}`}
              >
                Macronutrients
              </h4>

              {/* Carbs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-xl text-orange-500">
                      grain
                    </span>
                    <span className={`font-bold text-sm ${"text-neutral-700"}`}>
                      Carbohydrates
                    </span>
                  </div>
                  <span className={`font-extrabold tabular-nums ${heading}`}>
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
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-xl text-blue-500">
                      fitness_center
                    </span>
                    <span className={`font-bold text-sm ${"text-neutral-700"}`}>
                      Protein
                    </span>
                  </div>
                  <span className={`font-extrabold tabular-nums ${heading}`}>
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
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-xl text-emerald-500">
                      opacity
                    </span>
                    <span className={`font-bold text-sm ${"text-neutral-700"}`}>
                      Fats
                    </span>
                  </div>
                  <span className={`font-extrabold tabular-nums ${heading}`}>
                    {Math.round(totals.fats)}g
                  </span>
                </div>
                <div className={`w-full rounded-full h-2 ${progressBg}`}>
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${fatPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className={`border-t my-6 ${"border-neutral-100"}`}></div>

          {/* Micros Grid */}
          <div>
            <h4
              className={`text-[10px] font-bold uppercase tracking-wider mb-4 ${subtext}`}
            >
              Micronutrients & Others
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                {
                  label: "Iron",
                  value: totals.iron.toFixed(1),
                  unit: "mg",
                  color: "border-l-red-400",
                },
                {
                  label: "Calcium",
                  value: totals.calcium.toFixed(0),
                  unit: "mg",
                  color: "border-l-sky-400",
                },
                {
                  label: "Vitamin C",
                  value: totals.vitaminC.toFixed(0),
                  unit: "mg",
                  color: "border-l-amber-400",
                },
                {
                  label: "Fiber",
                  value: totals.fiber.toFixed(1),
                  unit: "g",
                  color: "border-l-lime-400",
                },
                {
                  label: "Sugar",
                  value: totals.sugar.toFixed(1),
                  unit: "g",
                  color: "border-l-pink-400",
                },
                {
                  label: "Sodium",
                  value: totals.sodium.toFixed(0),
                  unit: "mg",
                  color: "border-l-violet-400",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`p-4 rounded-lg border border-l-4 ${item.color} ${"bg-white border-neutral-200"} shadow-sm`}
                >
                  <p
                    className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${subtext}`}
                  >
                    {item.label}
                  </p>
                  <p
                    className={`text-xl font-extrabold tabular-nums ${heading}`}
                  >
                    {item.value}
                    <span className={`text-xs font-bold ml-0.5 ${subtext}`}>
                      {item.unit}
                    </span>
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
