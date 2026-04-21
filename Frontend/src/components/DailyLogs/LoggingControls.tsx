import React from "react";
import type { Food } from "./types";

interface LoggingControlsProps {
  isListening: boolean;
  handleVoiceLogClick: () => void;
  feedback: string;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (v: boolean) => void;
  searchResults: Food[];
  onLog: (food: Food, qty: number) => void;
}

export default function LoggingControls({
  isListening,
  handleVoiceLogClick,
  feedback,
  dropdownRef,
  searchTerm,
  setSearchTerm,
  isDropdownOpen,
  setIsDropdownOpen,
  searchResults,
  onLog
}: LoggingControlsProps) {
  const card = "bg-white border-neutral-100";
  const heading = "text-neutral-900";
  const subtext = "text-neutral-500";
  const inputCls = "bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400";

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {/* Voice Log */}
      <div
        onClick={!isListening ? handleVoiceLogClick : undefined}
        className={`rounded-[2rem] p-10 border shadow-sm transition-all duration-300 flex flex-col items-center justify-center text-center gap-6 h-full min-h-[300px] cursor-pointer group hover:-translate-y-1
          ${isListening
            ? "bg-green-50 border-green-200"
            : "bg-white border-neutral-100 hover:shadow-lg"
          }
        `}
      >
        <div
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300
          ${isListening
            ? "bg-green-500 text-white animate-pulse"
            : "bg-green-50 text-green-600 group-hover:scale-110"
          }
        `}
        >
          <span className="material-symbols-outlined text-[3rem]">mic</span>
        </div>
        <div className="space-y-2">
          <h3 className={`text-2xl font-bold ${heading}`}>
            {isListening ? "Listening..." : "Voice Log"}
          </h3>
          <p
            className={`font-medium ${feedback.includes("❌") ? "text-red-500" : feedback.includes("✅") ? "text-green-600" : subtext}`}
          >
            {feedback || 'Tap and say "I had a bowl of rice and dal"'}
          </p>
        </div>
      </div>

      {/* Manual Log */}
      <div className={`rounded-[2rem] p-10 border shadow-sm transition-all duration-300 flex flex-col h-full min-h-[300px] justify-between relative ${card}`}>
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${"bg-neutral-50 text-neutral-600"}`}>
            <span className="material-symbols-outlined text-2xl">
              keyboard
            </span>
          </div>
          <div>
            <h3 className={`text-2xl font-bold ${heading}`}>Manual Log</h3>
            <p className={`text-sm font-medium ${subtext}`}>
              Search database
            </p>
          </div>
        </div>

        <div className="mt-8 relative w-full" ref={dropdownRef}>
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-neutral-400">
            <span className="material-symbols-outlined">search</span>
          </div>

          <input
            className={`w-full border rounded-2xl py-4 pl-14 pr-4 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all ${inputCls}`}
            placeholder='Search food (e.g. Momo)...'
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsDropdownOpen(e.target.value.length > 0);
            }}
            onFocus={() => {
              if (searchTerm.length > 0) setIsDropdownOpen(true);
            }}
          />

          {isDropdownOpen && (
            <div className={`absolute z-50 w-full mt-2 border rounded-2xl shadow-xl overflow-hidden max-h-64 overflow-y-auto ${"bg-white border-neutral-200"}`}>
              {searchResults.length > 0 ? (
                <ul className={`divide-y ${"divide-neutral-100"}`}>
                  {searchResults.map((food) => (
                    <li
                      key={food._id}
                      className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${"hover:bg-neutral-50"}`}
                      onClick={() => {
                        onLog(food, 1);
                        setSearchTerm("");
                        setIsDropdownOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {food.image ? (
                          <img src={food.image} className={`w-10 h-10 rounded-full object-cover border ${"border-neutral-100"}`} alt={food.food_name} />
                        ) : (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${"bg-neutral-100 text-neutral-500"}`}>
                            <span className="material-symbols-outlined text-sm">local_dining</span>
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className={`font-bold ${heading}`}>
                            {food.food_name}
                          </span>
                          <span className={`text-sm ${subtext}`}>
                            {food.calories} kcal • Rs. {food.price}
                          </span>
                        </div>
                      </div>
                      <button className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${"bg-green-50 text-green-600 hover:bg-green-600 hover:text-white"}`}>
                        <span className="material-symbols-outlined text-sm">
                          add
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={`p-4 text-center text-sm ${subtext}`}>
                  No foods found for "{searchTerm}".
                  <br />
                  <span className={`text-xs mt-1 block ${subtext}`}>
                    Try adding it in the Cook tab.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
