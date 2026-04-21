
import type { DailyRequirements } from "./types";

interface Props {
  requirements: DailyRequirements;
  isAnemic?: boolean;
}

export default function DailyTargetsDisplay({ requirements, isAnemic }: Props) {
  const t = {
    card: "bg-white border-neutral-100 shadow-sm",
    heading: "text-neutral-900",
    subtext: "text-neutral-500",
    label: "text-neutral-500",
  };

  return (
    <section className={`rounded-3xl p-6 border transition-colors duration-300 mt-4 ${t.card}`}>
      <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${t.heading}`}>
        <span className="material-symbols-outlined text-green-500">calculate</span>
        Your Daily Targets
      </h3>

      {/* Energy Summary */}
      <div className="flex flex-col gap-4 mb-6">
        <div className={`flex flex-col items-center p-6 rounded-2xl border ${"bg-green-50 border-green-200"}`}>
          <span className={`text-xs font-bold uppercase tracking-wider ${"text-green-600"}`}>Daily Calorie Target</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-5xl font-black ${"text-green-700"}`}>{requirements.calories}</span>
            <span className={`text-sm font-bold uppercase ${"text-green-500"}`}>kcal/day</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-neutral-50 border border-neutral-100 p-4 rounded-2xl text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-1">BMR (Baseline)</span>
            <span className="text-xl font-bold text-neutral-700">{requirements.bmr} <span className="text-xs font-medium text-neutral-400">kcal</span></span>
          </div>
          <div className="bg-neutral-50 border border-neutral-100 p-4 rounded-2xl text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-1">TDEE (Daily Burn)</span>
            <span className="text-xl font-bold text-neutral-700">{requirements.tdee} <span className="text-xs font-medium text-neutral-400">kcal</span></span>
          </div>
        </div>
      </div>

      {/* Macronutrients */}
      <h4 className={`text-sm font-bold uppercase tracking-wider mb-3 ${t.label}`}>Macronutrients</h4>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className={`flex flex-col gap-1 p-3 rounded-2xl text-center ${"bg-blue-50 border border-blue-100"}`}>
          <span className={`font-bold text-xs uppercase ${"text-blue-600"}`}>Protein</span>
          <span className={`font-bold text-xl ${t.heading}`}>{requirements.protein}g</span>
          <span className={`text-xs ${t.subtext}`}>{requirements.proteinRatio}%</span>
        </div>
        <div className={`flex flex-col gap-1 p-3 rounded-2xl text-center ${"bg-orange-50 border border-orange-100"}`}>
          <span className={`font-bold text-xs uppercase ${"text-orange-600"}`}>Carbs</span>
          <span className={`font-bold text-xl ${t.heading}`}>{requirements.carbs}g</span>
          <span className={`text-xs ${t.subtext}`}>{requirements.carbRatio}%</span>
        </div>
        <div className={`flex flex-col gap-1 p-3 rounded-2xl text-center ${"bg-green-50 border border-green-100"}`}>
          <span className={`font-bold text-xs uppercase ${"text-green-600"}`}>Fats</span>
          <span className={`font-bold text-xl ${t.heading}`}>{requirements.fats}g</span>
          <span className={`text-xs ${t.subtext}`}>{requirements.fatRatio}%</span>
        </div>
      </div>

      {/* Micronutrients */}
      <h4 className={`text-sm font-bold uppercase tracking-wider mb-3 ${t.label}`}>Micronutrients</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: "Iron", value: requirements.iron, unit: "mg", color: "text-rose-600", bg: "bg-rose-50" },
          { label: "Calcium", value: requirements.calcium, unit: "mg", color: "text-sky-600", bg: "bg-sky-50" },
          { label: "Vitamin C", value: requirements.vitaminC, unit: "mg", color: "text-lime-600", bg: "bg-lime-50" },
          { label: "Fiber", value: requirements.fiber, unit: "g", color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Sugar (max)", value: requirements.sugar, unit: "g", color: "text-pink-600", bg: "bg-pink-50" },
          { label: "Sodium (max)", value: requirements.sodium, unit: "mg", color: "text-red-600", bg: "bg-red-50" },
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
      
      {isAnemic && (
        <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-sm text-amber-800 font-medium">
            <span className="font-bold flex items-center gap-1 mb-1">
              <span className="material-symbols-outlined text-sm">water_drop</span>
              Anemia Recommendation
            </span>
            Since you have indicated anemia, your daily iron target has been dynamically adjusted. Please consume iron-rich foods to reach your minimum target of {requirements.iron}mg.
          </p>
        </div>
      )}
    </section>
  );
}
