import React from "react";
import { useTheme } from "../../context/ThemeContext";
import type { Food } from "./types";
import FoodCard from "./FoodCard";

interface Props {
  isLoading: boolean;
  isLoadingMore: boolean;
  foods: Food[];
  totalCount: number;
  debouncedSearch: string;
  activeCategory: string;
  setSearchTerm: (v: string) => void;
  setActiveCategory: (v: string) => void;
  onSelectFood: (food: Food) => void;
  onLogQuick: (food: Food) => void;
}

export default function FoodGrid({
  isLoading,
  isLoadingMore,
  foods,
  totalCount,
  debouncedSearch,
  activeCategory,
  setSearchTerm,
  setActiveCategory,
  onSelectFood,
  onLogQuick,
}: Props) {
  const { isDark } = useTheme();
  
  const card = isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100";
  const heading = isDark ? "text-white" : "text-neutral-900";
  const subtext = isDark ? "text-neutral-400" : "text-neutral-500";

  const SkeletonCard = () => (
    <div className={`rounded-2xl border p-4 animate-pulse ${card}`}>
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl flex-shrink-0 ${isDark ? "bg-neutral-800" : "bg-neutral-200"}`}></div>
        <div className="flex-1 space-y-2">
          <div className={`h-4 rounded w-3/4 ${isDark ? "bg-neutral-800" : "bg-neutral-200"}`}></div>
          <div className={`h-3 rounded w-1/2 ${isDark ? "bg-neutral-700" : "bg-neutral-100"}`}></div>
        </div>
        <div className={`w-10 h-10 rounded-full ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`}></div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {isLoading && foods.length === 0 && (
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </>
      )}

      {!isLoading && totalCount === 0 && !debouncedSearch && activeCategory === "All" && (
        <div className={`col-span-full p-10 flex flex-col items-center justify-center text-center rounded-2xl border border-dashed ${card}`}>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-orange-400 mb-4 ${isDark ? "bg-orange-900/20" : "bg-orange-50"}`}>
            <span className="material-symbols-outlined text-3xl">warning</span>
          </div>
          <h4 className={`text-lg font-bold ${isDark ? "text-neutral-300" : "text-neutral-700"}`}>
            No foods found in database
          </h4>
          <p className={`text-sm mt-2 max-w-[250px] ${subtext}`}>
            You need to add some foods to your database first! Go to the 'Cook' tab.
          </p>
        </div>
      )}

      {!isLoading && totalCount === 0 && (debouncedSearch || activeCategory !== "All") && (
        <div className={`col-span-full text-center p-10 rounded-2xl border ${card}`}>
          <span className={`material-symbols-outlined text-5xl block mb-3 ${isDark ? "text-neutral-600" : "text-neutral-300"}`}>
            search_off
          </span>
          <p className={`font-medium ${subtext}`}>
            No foods match{" "}
            {debouncedSearch && (
              <span className={`font-bold ${heading}`}>"{debouncedSearch}"</span>
            )}
            {debouncedSearch && activeCategory !== "All" && " in "}
            {activeCategory !== "All" && (
              <span className="font-bold text-green-600">{activeCategory}</span>
            )}
            .
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setActiveCategory("All");
            }}
            className="mt-4 text-sm font-bold text-green-600 hover:text-green-700 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}

      {foods.map((food, index) => (
        <FoodCard
          key={food._id}
          food={food}
          index={index}
          onSelect={onSelectFood}
          onLogQuick={onLogQuick}
        />
      ))}

      {isLoadingMore && (
        <>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={`loading-more-${i}`} />
          ))}
        </>
      )}
    </div>
  );
}
