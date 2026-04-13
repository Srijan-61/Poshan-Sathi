import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { formatTime } from "./utils";
import type { Log } from "./types";

interface TodaysMealsProps {
  logs: Log[];
  totalCalories: number;
  dailyGoal: number;
  getFoodImage: (name: string) => string | undefined;
  onDelete: (id: string) => void;
}

export default function TodaysMeals({
  logs,
  totalCalories,
  dailyGoal,
  getFoodImage,
  onDelete
}: TodaysMealsProps) {
  const { isDark } = useTheme();

  const card = isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100";
  const heading = isDark ? "text-white" : "text-neutral-900";
  const subtext = isDark ? "text-neutral-400" : "text-neutral-500";

  return (
    <section className="flex flex-col gap-8 w-full mt-4">
      <div className="flex items-center justify-between px-2">
        <div className={`flex items-center gap-3 font-bold text-xl ${heading}`}>
          <span className="material-symbols-outlined text-green-600 text-2xl">
            history
          </span>
          <h3>Today's Meals</h3>
        </div>
        <div className={`px-4 py-2 rounded-lg text-sm font-bold ${isDark ? "bg-neutral-800 text-neutral-300" : "bg-neutral-100 text-neutral-600"}`}>
          {Math.round(totalCalories)} / {dailyGoal} kcal
        </div>
      </div>

      <div className="relative flex flex-col gap-6">
        <div className={`absolute top-8 bottom-8 left-[3.25rem] w-px border-l border-dashed hidden md:block ${isDark ? "border-neutral-700" : "border-neutral-300"}`}></div>

        {logs.length === 0 ? (
          <div className={`text-center p-10 rounded-[1.5rem] border shadow-sm ${card} ${subtext}`}>
            No meals logged today. Use the voice or manual log above to get
            started!
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log._id}
              className="relative flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center group"
            >
              <div className="z-10 shrink-0 mx-auto md:mx-0">
                <div className={`w-20 h-20 md:w-[6.5rem] md:h-[6.5rem] rounded-full p-1 border shadow-sm flex items-center justify-center ${isDark ? "bg-neutral-900 border-neutral-700" : "bg-white border-neutral-200"}`}>
                  {getFoodImage(log.food_name) ? (
                    <img src={getFoodImage(log.food_name)} className="w-full h-full rounded-full object-cover" alt={log.food_name} />
                  ) : (
                    <div className={`w-full h-full rounded-full flex items-center justify-center ${isDark ? "bg-green-900/20 text-green-400" : "bg-green-50 text-green-600"}`}>
                      <span className="material-symbols-outlined text-4xl">
                        set_meal
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className={`flex-1 w-full rounded-[1.5rem] p-6 border shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center justify-between gap-4 ${card}`}>
                <div className="flex flex-col gap-2 w-full sm:w-auto text-center sm:text-left">
                  <h4 className={`font-bold text-lg ${heading}`}>
                    {log.food_name}
                  </h4>
                  <div className="flex items-center justify-center sm:justify-start gap-3 text-sm">
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${isDark ? "bg-neutral-800 text-neutral-300" : "bg-neutral-100 text-neutral-600"}`}>
                      Qty: {log.quantity}
                    </span>
                    <span className={`font-medium ${subtext}`}>
                      • {formatTime(log.date || log.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 sm:gap-8 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0" style={{ borderColor: isDark ? "#1f2937" : "#f3f4f6" }}>
                  <div className="text-right">
                    <span className="font-bold text-orange-500 text-lg block">
                      {log.calories} kcal
                    </span>
                    <span className="text-sm font-bold text-green-600">
                      Rs. {log.cost}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(log._id);
                    }}
                    className={`flex items-center gap-1.5 text-xs font-bold transition-colors p-2 rounded-lg ${
                      isDark ? "text-neutral-500 hover:text-red-400 bg-neutral-800" : "text-neutral-400 hover:text-red-500 bg-neutral-50"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      delete
                    </span>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
