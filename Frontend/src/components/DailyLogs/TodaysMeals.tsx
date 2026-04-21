import { useState } from "react";

import type { Log } from "./types";
import { formatTime } from "./utils";

interface TodaysMealsProps {
  logs: Log[];
  totalCalories: number;
  dailyGoal: number;
  getFoodImage: (name: string) => string | undefined;
  onDelete: (id: string) => void;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
}

export default function TodaysMeals({
  logs,
  totalCalories,
  dailyGoal,
  getFoodImage,
  onDelete,
  onUpdateQuantity
}: TodaysMealsProps) {
  const card = "bg-white border-neutral-100";
  const heading = "text-neutral-900";
  const subtext = "text-neutral-500";

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState<number>(1);

  const startEditing = (log: Log) => {
    setEditingId(log._id);
    setEditQty(log.quantity);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditQty(1);
  };

  const confirmEdit = (id: string) => {
    if (editQty >= 1) {
      onUpdateQuantity(id, editQty);
    }
    setEditingId(null);
  };

  return (
    <section className="flex flex-col gap-8 w-full mt-4">
      <div className="flex items-center justify-between px-2">
        <div className={`flex items-center gap-3 font-bold text-xl ${heading}`}>
          <span className="material-symbols-outlined text-green-600 text-2xl">
            history
          </span>
          <h3>Today's Meals</h3>
        </div>
        <div className={`px-4 py-2 rounded-lg text-sm font-bold ${"bg-neutral-100 text-neutral-600"}`}>
          {Math.round(totalCalories)} / {dailyGoal} kcal
        </div>
      </div>

      <div className="relative flex flex-col gap-6">
        <div className={`absolute top-8 bottom-8 left-[3.25rem] w-px border-l border-dashed hidden md:block ${"border-neutral-300"}`}></div>

        {logs.length === 0 ? (
          <div className={`text-center p-10 rounded-[1.5rem] border shadow-sm ${card} ${subtext}`}>
            No meals logged today. Use the voice or manual log above to get
            started!
          </div>
        ) : (
          logs.map((log) => {
            const isEditing = editingId === log._id;

            return (
              <div
                key={log._id}
                className="relative flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center group"
              >
                <div className="z-10 shrink-0 mx-auto md:mx-0">
                  <div className={`w-20 h-20 md:w-[6.5rem] md:h-[6.5rem] rounded-full p-1 border shadow-sm flex items-center justify-center ${"bg-white border-neutral-200"}`}>
                    {getFoodImage(log.food_name) ? (
                      <img src={getFoodImage(log.food_name)} className="w-full h-full rounded-full object-cover" alt={log.food_name} />
                    ) : (
                      <div className={`w-full h-full rounded-full flex items-center justify-center ${"bg-green-50 text-green-600"}`}>
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
                      {isEditing ? (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setEditQty(Math.max(1, editQty - 1))}
                            className="w-7 h-7 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-700 font-bold transition-colors text-lg"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={editQty}
                            onChange={(e) => setEditQty(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-12 text-center rounded-lg border border-neutral-200 bg-white py-1 text-sm font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-green-400"
                          />
                          <button
                            onClick={() => setEditQty(editQty + 1)}
                            className="w-7 h-7 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-700 font-bold transition-colors text-lg"
                          >
                            +
                          </button>
                          <button
                            onClick={() => confirmEdit(log._id)}
                            className="ml-1 px-3 py-1 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-bold transition-colors flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">check</span>
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="px-3 py-1 rounded-lg bg-neutral-200 hover:bg-neutral-300 text-neutral-600 text-xs font-bold transition-colors flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(log)}
                          className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-neutral-100 text-neutral-600 hover:bg-green-50 hover:text-green-700 transition-colors cursor-pointer flex items-center gap-1"
                          title="Click to edit quantity"
                        >
                          Qty: {log.quantity}
                          <span className="material-symbols-outlined text-[14px] opacity-60">edit</span>
                        </button>
                      )}
                      <span className={`font-medium ${subtext}`}>
                        • {formatTime(log.date || log.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 sm:gap-8 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0" style={{ borderColor: "#f3f4f6" }}>
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
                        "text-neutral-400 hover:text-red-500 bg-neutral-50"
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
            );
          })
        )}
      </div>
    </section>
  );
}
