import React from "react";
import { useTheme } from "../../context/ThemeContext";
import type { Food } from "./types";
import toast from "react-hot-toast";

interface Props {
  selectedFood: Food;
  setSelectedFood: (f: Food | null) => void;
  logQty: number;
  setLogQty: React.Dispatch<React.SetStateAction<number>>;
  onLog: (food: Food, quantity: number) => void;
}

export default function FoodDetailModal({
  selectedFood,
  setSelectedFood,
  logQty,
  setLogQty,
  onLog
}: Props) {
  const { isDark } = useTheme();
  const heading = isDark ? "text-white" : "text-neutral-900";
  const subtext = isDark ? "text-neutral-400" : "text-neutral-500";

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={() => setSelectedFood(null)}
      >
        <div
          className={`rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-[fadeScaleIn_0.2s_ease-out] ${isDark ? "bg-neutral-900" : "bg-white"}`}
          onClick={(e) => e.stopPropagation()}
        >
          {selectedFood.image ? (
            <div className="relative h-48 overflow-hidden rounded-t-3xl">
              <img
                src={selectedFood.image}
                alt={selectedFood.food_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <button
                onClick={() => setSelectedFood(null)}
                className="absolute top-4 right-4 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-neutral-700 hover:bg-white transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
              <div className="absolute bottom-4 left-6">
                <h2 className="text-2xl font-extrabold text-white drop-shadow-lg">
                  {selectedFood.food_name}
                </h2>
                {selectedFood.category && (
                  <span className="text-xs font-bold text-white/80 bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-sm">
                    {selectedFood.category}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="relative p-6 pb-2 flex items-center justify-between">
              <div>
                <h2 className={`text-2xl font-extrabold ${heading}`}>
                  {selectedFood.food_name}
                </h2>
                {selectedFood.category && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md mt-1 inline-block ${isDark ? "text-green-400 bg-green-900/30" : "text-green-600 bg-green-50"}`}>
                    {selectedFood.category}
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedFood(null)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isDark ? "bg-neutral-800 text-neutral-400 hover:bg-neutral-700" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`}
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
          )}

          <div className="p-6 space-y-5">
            <div className="flex gap-4">
              <div className={`flex-1 rounded-2xl p-4 text-center ${isDark ? "bg-orange-900/20" : "bg-orange-50"}`}>
                <span className={`text-2xl font-extrabold ${isDark ? "text-orange-400" : "text-orange-600"}`}>
                  {selectedFood.calories}
                </span>
                <p className="text-xs font-bold text-orange-400 mt-1">kcal</p>
              </div>
              <div className={`flex-1 rounded-2xl p-4 text-center ${isDark ? "bg-green-900/20" : "bg-green-50"}`}>
                <span className={`text-2xl font-extrabold ${isDark ? "text-green-400" : "text-green-600"}`}>
                  Rs. {selectedFood.price}
                </span>
                <p className="text-xs font-bold text-green-400 mt-1">Price</p>
              </div>
            </div>

            {(selectedFood.protein != null || selectedFood.carbs != null || selectedFood.fats != null) && (
              <div>
                <h4 className={`text-sm font-bold mb-3 ${subtext}`}>MACRONUTRIENTS</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className={`rounded-xl p-3 text-center ${isDark ? "bg-blue-900/20" : "bg-blue-50"}`}>
                    <span className={`text-lg font-extrabold ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                      {selectedFood.protein ?? 0}g
                    </span>
                    <p className="text-xs font-bold text-blue-400 mt-0.5">Protein</p>
                  </div>
                  <div className={`rounded-xl p-3 text-center ${isDark ? "bg-amber-900/20" : "bg-amber-50"}`}>
                    <span className={`text-lg font-extrabold ${isDark ? "text-amber-400" : "text-amber-600"}`}>
                      {selectedFood.carbs ?? 0}g
                    </span>
                    <p className="text-xs font-bold text-amber-400 mt-0.5">Carbs</p>
                  </div>
                  <div className={`rounded-xl p-3 text-center ${isDark ? "bg-rose-900/20" : "bg-rose-50"}`}>
                    <span className={`text-lg font-extrabold ${isDark ? "text-rose-400" : "text-rose-600"}`}>
                      {selectedFood.fats ?? 0}g
                    </span>
                    <p className="text-xs font-bold text-rose-400 mt-0.5">Fats</p>
                  </div>
                </div>
              </div>
            )}

            {selectedFood.micros && Object.values(selectedFood.micros).some((v) => v && v > 0) && (
              <div>
                <h4 className={`text-sm font-bold mb-3 ${subtext}`}>MICRONUTRIENTS</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "iron", label: "Iron", unit: "mg" },
                    { key: "calcium", label: "Calcium", unit: "mg" },
                    { key: "vitamin_c", label: "Vitamin C", unit: "mg" },
                    { key: "fiber", label: "Fiber", unit: "g" },
                    { key: "sugar", label: "Sugar", unit: "g" },
                    { key: "sodium", label: "Sodium", unit: "mg" },
                  ]
                    .filter((m) => (selectedFood.micros as any)?.[m.key] > 0)
                    .map((m) => (
                      <div
                        key={m.key}
                        className={`flex items-center gap-2 rounded-xl px-3 py-2.5 ${isDark ? "bg-neutral-800" : "bg-neutral-50"}`}
                      >
                        <div>
                          <span className={`font-bold text-sm ${isDark ? "text-neutral-200" : "text-neutral-800"}`}>
                            {(selectedFood.micros as any)[m.key]} {m.unit}
                          </span>
                          <p className={`text-xs font-medium ${subtext}`}>{m.label}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 pt-2">
              <div className={`flex items-center rounded-xl overflow-hidden ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`}>
                <button
                  onClick={() => setLogQty((q) => Math.max(1, q - 1))}
                  className={`w-10 h-10 flex items-center justify-center transition-colors font-bold text-lg ${isDark ? "text-neutral-400 hover:bg-neutral-700" : "text-neutral-600 hover:bg-neutral-200"}`}
                >
                  −
                </button>
                <span className={`w-10 text-center font-extrabold text-lg ${heading}`}>
                  {logQty}
                </span>
                <button
                  onClick={() => setLogQty((q) => q + 1)}
                  className={`w-10 h-10 flex items-center justify-center transition-colors font-bold text-lg ${isDark ? "text-neutral-400 hover:bg-neutral-700" : "text-neutral-600 hover:bg-neutral-200"}`}
                >
                  +
                </button>
              </div>
              <button
                onClick={() => {
                  onLog(selectedFood, logQty);
                  toast.success(`Logged ${logQty}x ${selectedFood.food_name}`);
                  setSelectedFood(null);
                }}
                className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 active:scale-[0.98] transition-all shadow-md shadow-green-600/25 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-xl">add</span>
                Log {logQty} portion{logQty > 1 ? "s" : ""} •{" "}
                {selectedFood.calories * logQty} kcal
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
