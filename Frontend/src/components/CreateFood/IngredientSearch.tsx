import React from "react";
import { useTheme } from "../../context/ThemeContext";
import type { Ingredient } from "./types";

interface IngredientSearchProps {
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: Ingredient[];
  searchLoading: boolean;
  forceGlobal: boolean;
  setForceGlobal: (val: boolean) => void;
  qty: number;
  setQty: (qty: number) => void;
  selectedItem: Ingredient | null;
  selectItem: (item: Ingredient) => void;
  addItemToRecipe: () => void;
}

export default function IngredientSearch({
  dropdownRef,
  searchTerm,
  setSearchTerm,
  searchResults,
  searchLoading,
  forceGlobal,
  setForceGlobal,
  qty,
  setQty,
  selectedItem,
  selectItem,
  addItemToRecipe
}: IngredientSearchProps) {
  const { isDark } = useTheme();
  const heading = isDark ? "text-white" : "text-neutral-900";
  const subtext = isDark ? "text-neutral-400" : "text-neutral-500";
  const inputCls = isDark
    ? "bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500"
    : "bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400";

  return (
    <div className="flex flex-wrap gap-2 mb-6 items-stretch" ref={dropdownRef}>
      <div className="flex-1 min-w-[200px] relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
          <span className="material-symbols-outlined text-xl">search</span>
        </div>
        <input
          className={`w-full border rounded-xl py-4 pl-12 pr-4 text-lg font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all ${inputCls}`}
          placeholder="Search ingredients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoComplete="off"
        />

        {(searchResults.length > 0 || searchLoading) && searchTerm.trim() !== "" && (
          <div
            className={`absolute top-full left-0 right-0 z-20 mt-2 flex max-h-72 flex-col overflow-hidden rounded-xl border shadow-2xl backdrop-blur-md ${
              isDark
                ? "border-neutral-600/80 bg-neutral-900/85"
                : "border-neutral-200/90 bg-white/90"
            }`}
          >
            {forceGlobal && (
              <div
                className={`shrink-0 border-b px-3 py-2 text-center text-xs font-semibold ${
                  isDark
                    ? "border-neutral-700 bg-neutral-800/90 text-sky-300"
                    : "border-sky-100 bg-sky-50/95 text-sky-800"
                }`}
              >
                Including global foods from Edamam
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {searchLoading && searchResults.length === 0 && (
                <div className={`px-4 py-4 text-sm font-medium ${subtext}`}>
                  Searching…
                </div>
              )}
              {searchResults.map((item) => (
                <div
                  key={`${item.source ?? "unknown"}-${item._id}`}
                  onClick={() => selectItem(item)}
                  className={`flex cursor-pointer items-center gap-3 border-b px-4 py-3 transition-colors last:border-b-0 ${
                    isDark
                      ? "border-neutral-700/80 hover:bg-neutral-700/90"
                      : "border-neutral-100 hover:bg-neutral-100"
                  }`}
                >
                  <span className={`min-w-0 flex-1 truncate text-base font-semibold ${heading}`}>
                    {item.name}
                  </span>
                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                    {item.source === "local" && (
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide ${
                          isDark
                            ? "bg-emerald-950/80 text-emerald-300 ring-1 ring-emerald-700/50"
                            : "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80"
                        }`}
                        title="From your Poshan Sathi database"
                      >
                        🇳🇵 Local
                      </span>
                    )}
                    {item.source === "edamam" && (
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide ${
                          isDark
                            ? "bg-sky-950/80 text-sky-300 ring-1 ring-sky-700/50"
                            : "bg-sky-50 text-sky-800 ring-1 ring-sky-200/80"
                        }`}
                        title="Edamam Food Database"
                      >
                        Global
                      </span>
                    )}
                    {item.source === "recipe" && (
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide ${
                          isDark
                            ? "bg-amber-950/70 text-amber-200 ring-1 ring-amber-800/50"
                            : "bg-amber-50 text-amber-900 ring-1 ring-amber-200/80"
                        }`}
                        title="Your saved custom food"
                      >
                        Recipe
                      </span>
                    )}
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isDark
                          ? "bg-neutral-800 text-neutral-400 ring-1 ring-neutral-600"
                          : "bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200"
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {!forceGlobal && searchTerm.trim() !== "" && (
              <div
                className={`sticky bottom-0 shrink-0 border-t p-2 backdrop-blur-md ${
                  isDark
                    ? "border-neutral-600 bg-neutral-900/95"
                    : "border-neutral-200 bg-white/95"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setForceGlobal(true)}
                  className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors ${
                    isDark
                      ? "bg-sky-950/80 text-sky-200 ring-1 ring-sky-700/60 hover:bg-sky-900/90"
                      : "bg-sky-50 text-sky-900 ring-1 ring-sky-200 hover:bg-sky-100"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">public</span>
                  Search global foods (Edamam)
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div
        className={`flex items-center gap-1 rounded-xl border px-3 ${
          isDark ? "bg-neutral-800 border-neutral-700" : "bg-neutral-50 border-neutral-200"
        }`}
      >
        <input
          type="number"
          value={isNaN(qty) ? "" : qty}
          onChange={(e) => setQty(parseFloat(e.target.value))}
          className={`w-16 bg-transparent py-4 text-center text-lg font-bold outline-none ${heading}`}
        />
        <span className={`pr-1 text-xs font-bold uppercase tracking-wide ${subtext}`}>
          {selectedItem?.type === "cooked" ? "unit" : "g"}
        </span>
      </div>

      <button
        type="button"
        onClick={addItemToRecipe}
        disabled={!selectedItem}
        className="flex min-h-[3.5rem] min-w-[3.5rem] items-center justify-center rounded-xl bg-green-600 px-4 font-bold text-white shadow-md transition-all hover:bg-green-700 disabled:bg-neutral-400 disabled:shadow-none"
      >
        <span className="material-symbols-outlined text-2xl">add</span>
      </button>
    </div>
  );
}
