import React from "react";
import { useTheme } from "../../context/ThemeContext";
import type { AddedItem } from "./types";

interface AddedIngredientsListProps {
  addedList: AddedItem[];
  setAddedList: (list: AddedItem[]) => void;
}

export default function AddedIngredientsList({
  addedList,
  setAddedList
}: AddedIngredientsListProps) {
  const { isDark } = useTheme();
  const heading = isDark ? "text-white" : "text-neutral-900";
  const subtext = isDark ? "text-neutral-400" : "text-neutral-500";

  return (
    <div className="mt-8">
      <h4 className={`mb-4 text-sm font-bold uppercase tracking-wide ${subtext}`}>
        Current Recipe
      </h4>
      {addedList.length === 0 ? (
        <div
          className={`flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-14 text-center ${
            isDark
              ? "border-neutral-600/80 bg-neutral-800/30 text-neutral-500"
              : "border-neutral-200 bg-neutral-50/50 text-neutral-400"
          }`}
        >
          <span
            className={`material-symbols-outlined text-5xl opacity-80 ${isDark ? "text-green-500/70" : "text-green-600/60"}`}
            aria-hidden
          >
            soup_kitchen
          </span>
          <p className="max-w-xs text-sm font-medium leading-relaxed">
            Your pot is empty. Add ingredients from the search above.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {addedList.map((item, index) => (
            <li
              key={index}
              className={`flex items-stretch gap-3 rounded-2xl border p-3 shadow-sm transition-shadow ${
                isDark
                  ? "border-neutral-700 bg-gradient-to-br from-neutral-800 to-neutral-900/90 shadow-black/20"
                  : "border-neutral-100 bg-gradient-to-br from-white to-neutral-50/80 shadow-neutral-200/50"
              }`}
            >
              <div
                className={`flex min-w-[4.25rem] flex-col items-center justify-center rounded-xl border px-2 py-2 text-center ${
                  isDark
                    ? "border-green-800/50 bg-green-950/40 text-green-400"
                    : "border-green-200 bg-green-50 text-green-800"
                }`}
              >
                <span className="text-lg font-extrabold leading-none tabular-nums">
                  {item.qty}
                </span>
                <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wider opacity-90">
                  {item.ingredient.type === "cooked" ? "unit" : "g"}
                </span>
              </div>
              <div className="min-w-0 flex-1 flex flex-col justify-center">
                <p className={`truncate text-base font-bold ${heading}`}>{item.ingredient.name}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end justify-between gap-2 pl-1">
                <p
                  className={`text-sm font-extrabold tabular-nums ${
                    isDark ? "text-orange-400" : "text-orange-600"
                  }`}
                >
                  {item.cals}{" "}
                  <span className="text-xs font-bold opacity-80">kcal</span>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const newList = [...addedList];
                    newList.splice(index, 1);
                    setAddedList(newList);
                  }}
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                    isDark
                      ? "text-neutral-500 hover:bg-red-950/50 hover:text-red-400"
                      : "text-neutral-400 hover:bg-red-50 hover:text-red-600"
                  }`}
                  aria-label="Remove ingredient"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
