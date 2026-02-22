import React from "react";

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
}

// --- STANDARD DAILY GOALS ---
const GOALS = {
  calories: 2000,
  protein: 60,
  carbs: 275,
  fats: 70,
  iron: 15,
  calcium: 1000,
  vitaminC: 90,
  fiber: 30,
  sugar: 50,
  sodium: 2300,
};

const Dashboard: React.FC<Props> = ({ logs, budget }) => {
  // 1. Calculate Totals from Logs
  const totals = logs.reduce(
    (acc, log) => ({
      calories: acc.calories + log.calories,
      cost: acc.cost + log.cost,
      protein: acc.protein + (log.protein || log.calories * 0.03), // Estimations if missing
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

  // Percentages for the progress bars
  const calPercent = Math.min((totals.calories / GOALS.calories) * 100, 100);
  const costPercent = Math.min((totals.cost / budget) * 100, 100);
  const carbPercent = Math.min((totals.carbs / GOALS.carbs) * 100, 100);
  const proPercent = Math.min((totals.protein / GOALS.protein) * 100, 100);
  const fatPercent = Math.min((totals.fats / GOALS.fats) * 100, 100);

  return (
    <div className="flex flex-col gap-8">
      {/* Greeting Section */}
      <section className="flex flex-col gap-2 pt-2">
        <h1 className="text-gray-900 text-3xl md:text-4xl font-extrabold leading-tight tracking-tight">
          Namaste, Srijan! 
        </h1>
        <p className="text-gray-500 text-lg font-medium">
          Let's hit your health and budget goals today.
        </p>
      </section>

      {/* Top Cards: Calories & Budget */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calories Card */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-8xl text-orange-500">
              local_fire_department
            </span>
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg text-orange-500">
                <span className="material-symbols-outlined">
                  local_fire_department
                </span>
              </div>
              <p className="text-gray-900 text-base font-bold">
                Calories Consumed
              </p>
            </div>
            <span className="bg-orange-50 text-orange-600 text-xs font-bold px-2 py-1 rounded">
              Daily Goal
            </span>
          </div>
          <div className="relative z-10">
            <div className="flex items-baseline gap-2 mb-2">
              <p className="text-orange-500 text-4xl font-extrabold tracking-tight">
                {Math.round(totals.calories)}
              </p>
              <p className="text-gray-400 text-xl font-medium">
                / {GOALS.calories} kcal
              </p>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
              <div
                className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${calPercent}%` }}
              ></div>
            </div>
            <p className="text-gray-500 text-sm font-medium">
              {Math.round(calPercent)}% of your daily intake reached
            </p>
          </div>
        </div>

        {/* Budget Card */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-8xl text-green-600">
              account_balance_wallet
            </span>
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg text-green-600">
                <span className="material-symbols-outlined">
                  account_balance_wallet
                </span>
              </div>
              <p className="text-gray-900 text-base font-bold">
                Money Remaining
              </p>
            </div>
            <span className="bg-green-50 text-green-600 text-xs font-bold px-2 py-1 rounded">
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
            <div className="w-full bg-gray-100 rounded-full h-3 mb-2 flex justify-start">
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
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="bg-gray-50 p-6 flex justify-between items-center border-b border-gray-200">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">
              Nutrient Breakdown
            </h3>
            <p className="text-gray-500 text-sm font-medium">
              Daily detailed analysis
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl md:text-3xl font-bold text-green-600">
              Rs. {totals.cost}
            </p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
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
                <div className="absolute inset-2 bg-white rounded-full flex flex-col items-center justify-center z-10 shadow-inner">
                  <span className="material-symbols-outlined text-orange-500 text-3xl mb-1">
                    local_fire_department
                  </span>
                  <span className="text-4xl font-extrabold text-gray-900 leading-none">
                    {Math.round(totals.calories)}
                  </span>
                  <span className="text-sm font-medium text-gray-400 mt-1">
                    kcal
                  </span>
                </div>
              </div>
            </div>

            {/* Macros Bars */}
            <div className="flex-1 w-full flex flex-col justify-center space-y-6">
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                Macronutrients
              </h4>

              {/* Carbs */}
              <div className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-50 p-2 rounded-lg text-orange-500 border border-orange-100">
                      <span className="material-symbols-outlined text-xl">
                        grain
                      </span>
                    </div>
                    <span className="font-bold text-gray-700">
                      Carbohydrates
                    </span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {Math.round(totals.carbs)}g
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
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
                    <div className="bg-blue-50 p-2 rounded-lg text-blue-500 border border-blue-100">
                      <span className="material-symbols-outlined text-xl">
                        fitness_center
                      </span>
                    </div>
                    <span className="font-bold text-gray-700">Protein</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {Math.round(totals.protein)}g
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
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
                    <div className="bg-green-50 p-2 rounded-lg text-green-600 border border-green-100">
                      <span className="material-symbols-outlined text-xl">
                        opacity
                      </span>
                    </div>
                    <span className="font-bold text-gray-700">Fats</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {Math.round(totals.fats)}g
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${fatPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 my-6"></div>

          {/* Micros Grid */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-4">
              Micronutrients & Others
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                  Iron
                </p>
                <p className="text-xl font-extrabold text-gray-900">
                  {totals.iron.toFixed(1)}mg
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                  Calcium
                </p>
                <p className="text-xl font-extrabold text-gray-900">
                  {totals.calcium.toFixed(0)}mg
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                  Vitamin C
                </p>
                <p className="text-xl font-extrabold text-gray-900">
                  {totals.vitaminC.toFixed(0)}mg
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                  Fiber
                </p>
                <p className="text-xl font-extrabold text-gray-900">
                  {totals.fiber.toFixed(1)}g
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                  Sugar
                </p>
                <p className="text-xl font-extrabold text-gray-900">
                  {totals.sugar.toFixed(1)}g
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                  Sodium
                </p>
                <p className="text-xl font-extrabold text-gray-900">
                  {totals.sodium.toFixed(0)}mg
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
