import React from "react";
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
  const isCustom = !!selectedFood.owner;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={() => setSelectedFood(null)}
      >
        <div
          className="rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-[fadeScaleIn_0.2s_ease-out] bg-white"
          onClick={(e) => e.stopPropagation()}
        >
          {selectedFood.image ? (
            <div className="relative h-48 overflow-hidden rounded-t-3xl">
              <img
                src={selectedFood.image}
                alt={selectedFood.food_name || selectedFood.name}
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
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-extrabold text-white drop-shadow-lg">
                    {selectedFood.food_name || selectedFood.name}
                  </h2>
                  {isCustom && (
                    <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-sm border border-white/30">
                      Custom
                    </span>
                  )}
                </div>
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
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-extrabold text-neutral-900">
                    {selectedFood.food_name || selectedFood.name}
                  </h2>
                  {isCustom && (
                    <span className="px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-wider border border-purple-100">
                      Custom
                    </span>
                  )}
                </div>
                {selectedFood.category && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md mt-1 inline-block border text-emerald-600 border-neutral-200">
                    {selectedFood.category}
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedFood(null)}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
          )}

          <div className="p-6 space-y-5">
            <div className="flex gap-4">
              <div className="flex-1 rounded-lg border border-l-4 border-l-orange-500 p-4 text-center bg-white border-neutral-200 shadow-sm">
                <span className="text-2xl font-extrabold tabular-nums text-orange-500">
                  {selectedFood.calories}
                </span>
                <p className="text-[10px] font-bold uppercase tracking-wider mt-1 text-neutral-500">kcal</p>
              </div>
              <div className="flex-1 rounded-lg border border-l-4 border-l-emerald-500 p-4 text-center bg-white border-neutral-200 shadow-sm">
                <span className="text-2xl font-extrabold tabular-nums text-emerald-500">
                  Rs. {selectedFood.price}
                </span>
                <p className="text-[10px] font-bold uppercase tracking-wider mt-1 text-neutral-500">Price</p>
              </div>
            </div>

            {(selectedFood.protein != null || selectedFood.carbs != null || selectedFood.fats != null) && (
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider mb-3 text-neutral-500">MACRONUTRIENTS</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-l-4 border-l-blue-500 p-3 text-center bg-white border-neutral-200 shadow-sm">
                    <span className="text-lg font-extrabold tabular-nums text-blue-500">
                      {selectedFood.protein ?? 0}g
                    </span>
                    <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5 text-neutral-500">Protein</p>
                  </div>
                  <div className="rounded-lg border border-l-4 border-l-amber-500 p-3 text-center bg-white border-neutral-200 shadow-sm">
                    <span className="text-lg font-extrabold tabular-nums text-amber-500">
                      {selectedFood.carbs ?? 0}g
                    </span>
                    <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5 text-neutral-500">Carbs</p>
                  </div>
                  <div className="rounded-lg border border-l-4 border-l-rose-500 p-3 text-center bg-white border-neutral-200 shadow-sm">
                    <span className="text-lg font-extrabold tabular-nums text-rose-500">
                      {selectedFood.fats ?? 0}g
                    </span>
                    <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5 text-neutral-500">Fats</p>
                  </div>
                </div>
              </div>
            )}

            {selectedFood.micros && Object.values(selectedFood.micros).some((v) => v && v > 0) && (
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider mb-3 text-neutral-500">MICRONUTRIENTS</h4>
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
                        className="flex items-center gap-2 rounded-lg border px-3 py-2.5 bg-white border-neutral-200 shadow-sm"
                      >
                        <div>
                          <span className="font-extrabold text-sm tabular-nums text-neutral-800">
                            {(selectedFood.micros as any)[m.key]} {m.unit}
                          </span>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">{m.label}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center rounded-xl overflow-hidden bg-neutral-100">
                <button
                  onClick={() => setLogQty((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center transition-colors font-bold text-lg text-neutral-600 hover:bg-neutral-200"
                >
                  −
                </button>
                <span className="w-10 text-center font-extrabold text-lg text-neutral-900">
                  {logQty}
                </span>
                <button
                  onClick={() => setLogQty((q) => q + 1)}
                  className="w-10 h-10 flex items-center justify-center transition-colors font-bold text-lg text-neutral-600 hover:bg-neutral-200"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => {
                  onLog(selectedFood, logQty);
                  const foodName = selectedFood.food_name || selectedFood.name;
                  toast.success(`Logged ${logQty}x ${foodName}`);
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
