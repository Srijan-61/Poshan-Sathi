
import { useTheme } from "../../context/ThemeContext";
import type { Food } from "./types";
import { PAGE_SIZE } from "./consts";

interface Props {
  food: Food;
  index: number;
  onSelect: (food: Food) => void;
  onLogQuick: (food: Food) => void;
}

export default function FoodCard({ food, index, onSelect, onLogQuick }: Props) {
  const { isDark } = useTheme();

  return (
    <div
      onClick={() => onSelect(food)}
      className={`p-4 rounded-2xl border shadow-sm hover:-translate-y-0.5 transition-all duration-300 flex justify-between items-center group cursor-pointer ${
        isDark 
          ? "bg-neutral-900 border-neutral-800 hover:shadow-neutral-900/50" 
          : "bg-white border-neutral-100 hover:shadow-lg"
      }`}
      style={{ animationDelay: `${(index % PAGE_SIZE) * 40}ms` }}
    >
      <div className="flex items-center gap-4">
        {food.image ? (
          <img
            src={food.image}
            alt={food.food_name}
            className={`w-14 h-14 rounded-2xl object-cover flex-shrink-0 border ${
              isDark ? "border-neutral-700" : "border-neutral-100"
            }`}
            loading="lazy"
          />
        ) : (
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
            isDark ? "bg-green-900/20 text-green-400" : "bg-green-50 text-green-600"
          }`}>
            <span className="material-symbols-outlined text-2xl">
              local_dining
            </span>
          </div>
        )}

        <div>
          <h3 className={`font-bold text-lg transition-colors ${
            isDark ? "text-neutral-200 group-hover:text-green-400" : "text-neutral-800 group-hover:text-green-700"
          }`}>
            {food.food_name}
          </h3>
          <div className="flex gap-3 text-sm font-bold mt-1">
            <span className="text-orange-500">{food.calories} kcal</span>
            <span className={isDark ? "text-neutral-600" : "text-neutral-300"}>•</span>
            <span className="text-green-600">Rs. {food.price}</span>
          </div>
          {(food.protein || food.carbs || food.fats) && (
            <div className="flex gap-2 mt-1.5">
              {food.protein != null && (
                <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${
                  isDark ? "bg-blue-900/20 text-blue-400" : "bg-blue-50 text-blue-600"
                }`}>
                  P: {food.protein}g
                </span>
              )}
              {food.carbs != null && (
                <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${
                  isDark ? "bg-amber-900/20 text-amber-400" : "bg-amber-50 text-amber-600"
                }`}>
                  C: {food.carbs}g
                </span>
              )}
              {food.fats != null && (
                <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${
                  isDark ? "bg-rose-900/20 text-rose-400" : "bg-rose-50 text-rose-600"
                }`}>
                  F: {food.fats}g
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onLogQuick(food);
        }}
        className={`w-10 h-10 rounded-full flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-sm flex-shrink-0 ${
          isDark ? "bg-neutral-800 text-green-400" : "bg-neutral-50 text-green-600"
        }`}
        title="Log this food"
      >
        <span className="material-symbols-outlined">add</span>
      </button>
    </div>
  );
}
