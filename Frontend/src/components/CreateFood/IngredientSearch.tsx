import React from "react";
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
 
  const heading = "text-neutral-900";
  const subtext = "text-neutral-500";
  const inputCls = "bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400";

  return (
    <div className="flex flex-wrap gap-3 mb-8 items-stretch" ref={dropdownRef}>
      {/* Search Input Container - Must be Relative for Absolute Dropdown */}
      <div className="flex-1 min-w-[260px] relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
          <span className="material-symbols-outlined text-xl">search</span>
        </div>
        <input
          className={`w-full border rounded-2xl py-4 pl-12 pr-4 text-lg font-bold focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all shadow-sm ${inputCls}`}
          placeholder="Search ingredients (e.g. Rice, Dal)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoComplete="off"
        />

        {/* FLOATING DROPDOWN - FIXED WITH Z-50 AND SOLID BG */}
        {(searchResults.length > 0 || searchLoading) && searchTerm.trim() !== "" && (
          <div
            className="absolute top-full left-0 right-0 z-50 mt-3 flex max-h-80 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] animate-in fade-in slide-in-from-top-2 duration-200"
          >
            {forceGlobal && (
              <div className="shrink-0 border-b border-sky-100 bg-sky-50 px-4 py-2 text-center text-[10px] font-black uppercase tracking-widest text-sky-700">
                🌐 Searching Global Database (Edamam)
              </div>
            )}
            
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain divide-y divide-neutral-100">
              {searchLoading && (
                <div className="px-5 py-6 flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className={`text-sm font-bold ${subtext}`}>Finding ingredients...</span>
                </div>
              )}
              
              {!searchLoading && searchResults.length === 0 && (
                <div className="px-5 py-6 text-sm font-bold text-neutral-400">
                  No results found for "{searchTerm}"
                </div>
              )}

              {searchResults.map((item) => (
                <div
                  key={`${item.source ?? "unknown"}-${item._id}`}
                  onClick={() => selectItem(item)}
                  className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 transition-all hover:bg-neutral-50 active:bg-neutral-100"
                >
                  <div className="flex flex-col min-w-0">
                    <span className={`truncate text-base font-bold ${heading}`}>
                      {item.name}
                    </span>
                    <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">
                      {Math.round(item.calories)} kcal / {item.type === "raw" ? "100g" : "unit"}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {item.source === "local" && (
                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter text-emerald-700 border border-emerald-100">
                        Local
                      </span>
                    )}
                    {item.source === "edamam" && (
                      <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter text-sky-700 border border-sky-100">
                        Global
                      </span>
                    )}
                    {item.source === "recipe" && (
                      <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter text-amber-900 border border-amber-100">
                        Recipe
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {!forceGlobal && !searchLoading && searchTerm.trim() !== "" && (
              <div className="shrink-0 border-t border-neutral-100 p-3 bg-neutral-50/50">
                <button
                  type="button"
                  onClick={() => setForceGlobal(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white border border-neutral-200 px-4 py-3 text-xs font-black uppercase tracking-widest text-neutral-600 shadow-sm transition-all hover:bg-white hover:border-sky-300 hover:text-sky-600 active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-[18px]">public</span>
                  Expand search to Global
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quantity Selector */}
      <div className="flex items-center gap-1 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 shadow-sm">
        <input
          type="number"
          value={isNaN(qty) ? "" : qty}
          onChange={(e) => setQty(parseFloat(e.target.value))}
          className={`w-16 bg-transparent py-4 text-center text-xl font-black outline-none ${heading}`}
        />
        <span className={`pr-1 text-xs font-black uppercase tracking-widest ${subtext}`}>
          {selectedItem?.type === "cooked" ? "unit" : "g"}
        </span>
      </div>

      {/* Add Button */}
      <button
        type="button"
        onClick={addItemToRecipe}
        disabled={!selectedItem}
        className="flex min-h-[3.5rem] min-w-[3.5rem] items-center justify-center rounded-2xl bg-green-600 px-6 font-black text-white shadow-lg shadow-green-600/20 transition-all hover:bg-green-700 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:shadow-none disabled:cursor-not-allowed"
      >
        <span className="material-symbols-outlined text-2xl">add</span>
      </button>
    </div>
  );
}
