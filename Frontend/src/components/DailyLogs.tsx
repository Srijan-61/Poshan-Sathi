import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import API from "../utils/axios";
import { useTheme } from "../context/ThemeContext";
import RecommendationsWidget from "./RecommendationsWidget";

// --- TYPES ---
interface Food {
  _id: string;
  food_name: string;
  calories: number;
  price: number;
  image?: string;
}

interface Log {
  _id: string;
  food_name: string;
  calories: number;
  cost: number;
  quantity: number;
  createdAt?: string;
  date?: string;
}

interface Props {
  logs: Log[];
  foods: Food[];
  onLog: (food: any, qty: number) => void;
  onDelete: (id: string) => void;
}

// --- LEVENSHTEIN DISTANCE ---
const levenshtein = (a: string, b: string): number => {
  const matrix = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0),
  );
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  return matrix[a.length][b.length];
};

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const toLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (dateStr: string): string => {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const DailyLogs: React.FC<Props> = ({ logs, foods, onLog, onDelete }) => {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState("");

  const [selectedDate, setSelectedDate] = useState("");
  const [historyLogs, setHistoryLogs] = useState<Log[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Theme helpers
  const card = isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100";
  const heading = isDark ? "text-white" : "text-neutral-900";
  const subtext = isDark ? "text-neutral-400" : "text-neutral-500";
  const inputCls = isDark
    ? "bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500"
    : "bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400";

  const totalCalories = logs.reduce((sum, log) => sum + log.calories, 0);
  const dailyGoal = 2000;

  const historyTotalCalories = historyLogs.reduce((sum, log) => sum + log.calories, 0);
  const historyTotalCost = historyLogs.reduce((sum, log) => sum + log.cost, 0);

  const formatTime = (dateString?: string) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!selectedDate) {
      setHistoryLogs([]);
      return;
    }

    const today = toLocalDateString(new Date());
    if (selectedDate === today) {
      setHistoryLogs(logs);
      return;
    }

    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      setHistoryError("");
      try {
        const res = await API.get(`/api/logs?date=${selectedDate}`);
        setHistoryLogs(res.data);
      } catch (err: any) {
        setHistoryError("Failed to load logs for this date.");
        toast.error("Could not fetch logs for the selected date.");
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [selectedDate]);

  const searchResults =
    foods?.filter((food) =>
      food.food_name.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  const handleVoiceLogClick = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition)
      return toast.error(
        "Your browser doesn't support speech recognition. Please use Chrome.",
      );

    const recognition = new SpeechRecognition();
    recognition.lang = "ne-NP";
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setFeedback("Listening...");
    };

    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const raw = event.results[0][0].transcript;
      processCommand(raw.toLowerCase());
    };

    recognition.start();
  };

  const processCommand = (rawText: string) => {
    let text = rawText;
    const corrections: { [key: string]: string } = {
      daal: "dal", dhal: "dal", bhat: "bhat", baat: "bhat", bhaat: "bhat",
      jol: "jhol", jhoul: "jhol", cauli: "kauli", gobi: "kauli",
      alu: "aloo", aalu: "aloo", buff: "buffalo", baf: "buffalo",
    };

    Object.keys(corrections).forEach((typo) => {
      text = text.replace(new RegExp(`\\b${typo}\\b`, "g"), corrections[typo]);
    });

    let qty = 1;
    const words = text.split(" ");
    const numMap: any = { one: 1, two: 2, three: 3, ek: 1, dui: 2, tin: 3, a: 1 };

    words.forEach((w) => {
      if (!isNaN(parseInt(w))) qty = parseInt(w);
      if (numMap[w]) qty = numMap[w];
    });

    let bestMatch: any = null;
    let bestScore = -1;

    if (!foods || foods.length === 0) {
      setFeedback("❌ Error: Food database is empty or still loading.");
      setTimeout(() => setFeedback(""), 4000);
      return;
    }

    foods.forEach((food) => {
      const foodTokens = food.food_name.toLowerCase().split(" ");
      let matchedTokensCount = 0;

      foodTokens.forEach((token) => {
        const userSaidToken = words.some((userWord) => {
          return userWord === token || levenshtein(userWord, token) <= 1;
        });
        if (userSaidToken) matchedTokensCount++;
      });

      let accuracy = matchedTokensCount / foodTokens.length;
      let finalScore = accuracy + foodTokens.length * 0.1;

      if (finalScore > bestScore && accuracy >= 0.5) {
        bestScore = finalScore;
        bestMatch = food;
      }
    });

    if (bestMatch) {
      onLog(bestMatch, qty);
      setFeedback(`✅ Logged: ${qty}x ${bestMatch.food_name}`);
      setTimeout(() => setFeedback(""), 3000);
    } else {
      setFeedback(`❌ No match found for "${text}"`);
      setTimeout(() => setFeedback(""), 4000);
    }
  };

  const getFoodImage = (name: string) => {
    const matched = foods.find((f) => f.food_name === name);
    return matched?.image;
  };

  const recentFoods = logs
    .sort((a, b) => new Date(b.date || b.createdAt || 0).getTime() - new Date(a.date || a.createdAt || 0).getTime())
    .map((log) => log.food_name)
    .filter((value, index, self) => self.indexOf(value) === index)
    .slice(0, 6);

  let quickAddItems = recentFoods.map((name) => {
    const img = getFoodImage(name);
    return {
      name,
      img: img || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f0fdf4&color=15803d`,
    };
  });

  if (quickAddItems.length === 0) {
    quickAddItems = foods.slice(0, 6).map((f) => ({
      name: f.food_name,
      img: f.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(f.food_name)}&background=f0fdf4&color=15803d`,
    }));
  }

  const getQuickDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return toLocalDateString(d);
  };

  return (
    <div className="flex flex-col items-center pb-20 md:pb-0">
      <main className="w-full py-4 flex flex-col gap-10">
        {/* Top Logging Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Voice Log */}
          <div
            onClick={!isListening ? handleVoiceLogClick : undefined}
            className={`rounded-[2rem] p-10 border shadow-sm transition-all duration-300 flex flex-col items-center justify-center text-center gap-6 h-full min-h-[300px] cursor-pointer group hover:-translate-y-1
              ${isListening
                ? isDark ? "bg-green-900/20 border-green-800" : "bg-green-50 border-green-200"
                : isDark ? "bg-neutral-900 border-neutral-800 hover:shadow-neutral-900/50" : "bg-white border-neutral-100 hover:shadow-lg"
              }
            `}
          >
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300
              ${isListening
                ? "bg-green-500 text-white animate-pulse"
                : isDark ? "bg-green-900/30 text-green-400 group-hover:scale-110" : "bg-green-50 text-green-600 group-hover:scale-110"
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
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDark ? "bg-neutral-800 text-neutral-400" : "bg-neutral-50 text-neutral-600"}`}>
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
                <div className={`absolute z-50 w-full mt-2 border rounded-2xl shadow-xl overflow-hidden max-h-64 overflow-y-auto ${isDark ? "bg-neutral-800 border-neutral-700" : "bg-white border-neutral-200"}`}>
                  {searchResults.length > 0 ? (
                    <ul className={`divide-y ${isDark ? "divide-neutral-700" : "divide-neutral-100"}`}>
                      {searchResults.map((food) => (
                        <li
                          key={food._id}
                          className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${isDark ? "hover:bg-neutral-700" : "hover:bg-neutral-50"}`}
                          onClick={() => {
                            onLog(food, 1);
                            setSearchTerm("");
                            setIsDropdownOpen(false);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            {food.image ? (
                              <img src={food.image} className={`w-10 h-10 rounded-full object-cover border ${isDark ? "border-neutral-700" : "border-neutral-100"}`} alt={food.food_name} />
                            ) : (
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? "bg-neutral-700 text-neutral-400" : "bg-neutral-100 text-neutral-500"}`}>
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
                          <button className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDark ? "bg-green-900/30 text-green-400 hover:bg-green-600 hover:text-white" : "bg-green-50 text-green-600 hover:bg-green-600 hover:text-white"}`}>
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

        <RecommendationsWidget onLog={onLog} />

        {/* Quick Add */}
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

        {/* Today's Meals */}
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

        {/* View Previous Logs By Date */}
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
      </main>
    </div>
  );
};

export default DailyLogs;
