import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { formatDisplayDate, toLocalDateString, formatTime } from "./utils";
import type { Log } from "./types";

interface PreviousLogsProps {
  selectedDate: string;
  setSelectedDate: (v: string) => void;
  historyLogs: Log[];
  setHistoryLogs: (logs: Log[]) => void;
  isLoadingHistory: boolean;
  historyError: string;
  historyTotalCalories: number;
  historyTotalCost: number;
  getFoodImage: (name: string) => string | undefined;
}

export default function PreviousLogs({
  selectedDate,
  setSelectedDate,
  historyLogs,
  setHistoryLogs,
  isLoadingHistory,
  historyError,
  historyTotalCalories,
  historyTotalCost,
  getFoodImage
}: PreviousLogsProps) {
  const { isDark } = useTheme();

  const card = isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100";
  const heading = isDark ? "text-white" : "text-neutral-900";
  const subtext = isDark ? "text-neutral-400" : "text-neutral-500";
  const inputCls = isDark
    ? "bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500"
    : "bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400";

  const getQuickDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return toLocalDateString(d);
  };

  return (
    <section className="flex flex-col gap-6 w-full mt-2">
      <div className="flex items-center gap-3 px-2">
        <span className={`material-symbols-outlined text-2xl ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>
          calendar_month
        </span>
        <h3 className={`font-bold text-xl ${heading}`}>View Previous Logs</h3>
      </div>

      <div className={`rounded-[2rem] p-6 md:p-8 border shadow-sm ${card}`}>
        <p className={`text-sm font-medium mb-4 ${subtext}`}>
          Select a date to view your food log history
        </p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Yesterday", days: 1 },
              { label: "2 days ago", days: 2 },
              { label: "3 days ago", days: 3 },
              { label: "1 week ago", days: 7 },
            ].map((shortcut) => {
              const dateVal = getQuickDate(shortcut.days);
              const isActive = selectedDate === dateVal;
              return (
                <button
                  key={shortcut.days}
                  onClick={() => setSelectedDate(isActive ? "" : dateVal)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200
                    ${isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                      : isDark
                        ? "bg-neutral-800 text-neutral-400 hover:bg-indigo-900/40 hover:text-indigo-400"
                        : "bg-neutral-100 text-neutral-600 hover:bg-indigo-50 hover:text-indigo-600"
                    }
                  `}
                >
                  {shortcut.label}
                </button>
              );
            })}
          </div>

          <div className="relative">
            <input
              id="history-date-picker"
              type="date"
              value={selectedDate}
              max={toLocalDateString(new Date())}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={`border rounded-xl py-2.5 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all cursor-pointer ${inputCls}`}
            />
          </div>

          {selectedDate && (
            <button
              onClick={() => {
                setSelectedDate("");
                setHistoryLogs([]);
              }}
              className={`text-sm font-bold transition-colors flex items-center gap-1 ${isDark ? "text-neutral-500 hover:text-red-400" : "text-neutral-400 hover:text-red-500"}`}
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
              Clear
            </button>
          )}
        </div>
      </div>

      {selectedDate && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-2">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? "bg-indigo-900/30" : "bg-indigo-100"}`}>
                <span className={`material-symbols-outlined ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>event</span>
              </div>
              <div>
                <h4 className={`font-bold ${heading}`}>{formatDisplayDate(selectedDate)}</h4>
                <p className={`text-sm ${subtext}`}>
                  {historyLogs.length} meal{historyLogs.length !== 1 ? "s" : ""} logged
                </p>
              </div>
            </div>

            {historyLogs.length > 0 && (
              <div className="flex items-center gap-4">
                <div className={`px-4 py-2 rounded-lg ${isDark ? "bg-orange-900/20" : "bg-orange-50"}`}>
                  <span className={`text-sm font-bold ${isDark ? "text-orange-400" : "text-orange-600"}`}>
                    {Math.round(historyTotalCalories)} kcal
                  </span>
                </div>
                <div className={`px-4 py-2 rounded-lg ${isDark ? "bg-green-900/20" : "bg-green-50"}`}>
                  <span className={`text-sm font-bold ${isDark ? "text-green-400" : "text-green-600"}`}>
                    Rs. {Math.round(historyTotalCost)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {isLoadingHistory && (
            <div className={`flex items-center justify-center p-10 rounded-[1.5rem] border shadow-sm ${card}`}>
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <span className={`text-sm font-medium ${subtext}`}>Loading logs...</span>
              </div>
            </div>
          )}

          {historyError && !isLoadingHistory && (
            <div className={`text-center p-8 rounded-[1.5rem] border font-medium ${isDark ? "bg-red-900/20 border-red-800 text-red-400" : "bg-red-50 border-red-100 text-red-600"}`}>
              {historyError}
            </div>
          )}

          {!isLoadingHistory && !historyError && historyLogs.length === 0 && (
            <div className={`text-center p-10 rounded-[1.5rem] border shadow-sm ${card}`}>
              <span className={`material-symbols-outlined text-5xl block mb-3 ${isDark ? "text-neutral-600" : "text-neutral-300"}`}>
                no_meals
              </span>
              <p className={`font-medium ${subtext}`}>No meals were logged on this date.</p>
            </div>
          )}

          {!isLoadingHistory && !historyError && historyLogs.length > 0 && (
            <div className="relative flex flex-col gap-4">
              <div className={`absolute top-6 bottom-6 left-[2.5rem] w-px border-l border-dashed hidden md:block ${isDark ? "border-indigo-800" : "border-indigo-200"}`}></div>

              {historyLogs.map((log) => (
                <div
                  key={log._id}
                  className="relative flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center"
                >
                  <div className="z-10 shrink-0 mx-auto md:mx-0">
                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full p-0.5 border shadow-sm flex items-center justify-center ${isDark ? "bg-neutral-900 border-indigo-800" : "bg-white border-indigo-100"}`}>
                      {getFoodImage(log.food_name) ? (
                        <img src={getFoodImage(log.food_name)} className="w-full h-full rounded-full object-cover" alt={log.food_name} />
                      ) : (
                        <div className={`w-full h-full rounded-full flex items-center justify-center ${isDark ? "bg-indigo-900/30 text-indigo-400" : "bg-indigo-50 text-indigo-400"}`}>
                          <span className="material-symbols-outlined text-2xl">
                            set_meal
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`flex-1 w-full rounded-2xl p-5 border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 ${card}`}>
                    <div className="flex flex-col gap-1 w-full sm:w-auto text-center sm:text-left">
                      <h4 className={`font-bold ${heading}`}>
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

                    <div className="flex items-center gap-6 w-full sm:w-auto justify-center sm:justify-end">
                      <div className="text-right">
                        <span className="font-bold text-orange-500 block">
                          {log.calories} kcal
                        </span>
                        <span className="text-sm font-bold text-green-600">
                          Rs. {log.cost}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
