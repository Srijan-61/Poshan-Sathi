import React from "react";
import toast from "react-hot-toast";
import { useTheme } from "../../context/ThemeContext";
import type { Food } from "./types";

interface QuickAddProps {
  quickAddItems: { name: string; img: string }[];
  foods: Food[];
  onLog: (food: Food, qty: number) => void;
}

export default function QuickAdd({
  quickAddItems,
  foods,
  onLog
}: QuickAddProps) {
  const { isDark } = useTheme();
  const heading = isDark ? "text-white" : "text-neutral-900";

  return (
    <section className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between px-2">
        <h3 className={`font-bold text-xl ${heading}`}>Quick Add</h3>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {quickAddItems.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              const foundFood = foods.find(
                (f) =>
                  f.food_name.toLowerCase() === item.name.toLowerCase(),
              );
              if (foundFood) onLog(foundFood, 1);
              else
                toast.error(
                  `${item.name} not found in database. Add it via Cook tab first!`,
                );
            }}
            className={`flex flex-col items-center gap-3 group p-4 rounded-3xl border transition-all ${
              isDark
                ? "bg-neutral-900 border-neutral-800 hover:border-green-700 hover:shadow-neutral-900/30"
                : "bg-white border-neutral-100 hover:border-green-200 hover:shadow-md"
            }`}
          >
            <div className={`w-16 h-16 rounded-full overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-300 border-2 border-transparent group-hover:border-green-500`}>
              <img
                alt={item.name}
                className="w-full h-full object-cover"
                src={item.img}
              />
            </div>
            <span className={`text-sm font-bold group-hover:text-green-600 ${isDark ? "text-neutral-300" : "text-neutral-700"}`}>
              {item.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
