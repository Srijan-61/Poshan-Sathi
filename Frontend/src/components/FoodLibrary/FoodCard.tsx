import type { Food } from "./types";
import { PAGE_SIZE } from "./consts";

interface Props {
  food: Food;
  index: number;
  onSelect: (food: Food) => void;
  onLogQuick: (food: Food) => void;
}

export default function FoodCard({ food, index, onSelect, onLogQuick }: Props) {
  // Check if food is user-created (has an owner)
  const isCustom = !!food.owner;

  return (
    <div
      onClick={() => onSelect(food)}
      className="p-4 rounded-xl border border-neutral-100 bg-white shadow-sm hover:-translate-y-0.5 transition-all duration-300 flex justify-between items-center group cursor-pointer hover:shadow-lg"
      style={{ animationDelay: `${(index % PAGE_SIZE) * 40}ms` }}
    >
      <div className="flex items-center gap-4">
        {food.image ? (
          <img
            src={food.image}
            alt={food.food_name}
            className="w-14 h-14 rounded-2xl object-cover flex-shrink-0 border border-neutral-100"
            loading="lazy"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-neutral-50 text-emerald-500">
            <span className="material-symbols-outlined text-2xl">
              local_dining
            </span>
          </div>
        )}

        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg transition-colors text-neutral-800 group-hover:text-green-700">
              {food.food_name || food.name}
            </h3>
            {isCustom && (
              <span className="px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-wider border border-purple-100">
                Custom
              </span>
            )}
          </div>
          
          <div className="flex gap-3 text-sm font-bold mt-1">
            <span className="text-orange-500">{food.calories} kcal</span>
            <span className="text-neutral-300">•</span>
            <span className="text-green-600">Rs. {food.price}</span>
          </div>
          {(food.protein || food.carbs || food.fats) && (
            <div className="flex gap-2 mt-1.5">
              {food.protein != null && (
                <span className="text-xs px-2 py-0.5 rounded-md font-bold border border-neutral-200 text-blue-500">
                  P: {food.protein}g
                </span>
              )}
              {food.carbs != null && (
                <span className="text-xs px-2 py-0.5 rounded-md font-bold border border-neutral-200 text-amber-500">
                  C: {food.carbs}g
                </span>
              )}
              {food.fats != null && (
                <span className="text-xs px-2 py-0.5 rounded-md font-bold border border-neutral-200 text-rose-500">
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
        className="w-10 h-10 rounded-full flex items-center justify-center bg-neutral-50 text-green-600 hover:bg-green-600 hover:text-white transition-all shadow-sm flex-shrink-0"
        title="Log this food"
      >
        <span className="material-symbols-outlined">add</span>
      </button>
    </div>
  );
}
