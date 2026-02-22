import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// --- TYPES ---
interface Food {
  _id: string;
  food_name: string;
  calories: number;
  price: number;
}

interface Log {
  _id: string;
  food_name: string;
  calories: number;
  cost: number;
  quantity: number;
  createdAt?: string;
}

interface Props {
  logs: Log[];
  foods: Food[]; // The database for voice & search matching
  onLog: (food: any, qty: number) => void;
  onDelete: (id: string) => void;
}

// --- LEVENSHTEIN DISTANCE (For Typo Tolerance) ---
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
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost, // substitution
      );
    }
  }
  return matrix[a.length][b.length];
};

// Global type for Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const DailyLogs: React.FC<Props> = ({ logs, foods, onLog, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Day Totals
  const totalCalories = logs.reduce((sum, log) => sum + log.calories, 0);
  const dailyGoal = 2000;

  const formatTime = (dateString?: string) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Close dropdown when clicking outside
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

  // Filter foods for the manual search dropdown
  const searchResults =
    foods?.filter((food) =>
      food.food_name.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  // --- VOICE LOGGING LOGIC ---
  const handleVoiceLogClick = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition)
      return alert(
        "Your browser doesn't support speech recognition. Please use Chrome.",
      );

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
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
    // 1. DICTIONARY NORMALIZATION
    let text = rawText;
    const corrections: { [key: string]: string } = {
      daal: "dal",
      dhal: "dal",
      bhat: "bhat",
      baat: "bhat",
      bhaat: "bhat",
      jol: "jhol",
      jhoul: "jhol",
      cauli: "kauli",
      gobi: "kauli",
      alu: "aloo",
      aalu: "aloo",
      buff: "buffalo",
      baf: "buffalo",
    };

    Object.keys(corrections).forEach((typo) => {
      text = text.replace(new RegExp(`\\b${typo}\\b`, "g"), corrections[typo]);
    });

    // 2. EXTRACT QUANTITY
    let qty = 1;
    const words = text.split(" ");
    const numMap: any = {
      one: 1,
      two: 2,
      three: 3,
      ek: 1,
      dui: 2,
      tin: 3,
      a: 1,
    };

    words.forEach((w) => {
      if (!isNaN(parseInt(w))) qty = parseInt(w);
      if (numMap[w]) qty = numMap[w];
    });

    // 3. INTELLIGENT MATCHING ENGINE
    let bestMatch: Food | null = null;
    let bestScore = -1;

    // Safety check in case foods haven't loaded
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
      let finalScore = accuracy + foodTokens.length * 0.1; // Specificity boost

      if (finalScore > bestScore && accuracy >= 0.5) {
        bestScore = finalScore;
        bestMatch = food;
      }
    });

    // 4. RESULT
    if (bestMatch) {
      onLog(bestMatch, qty);
      setFeedback(`✅ Logged: ${qty}x ${bestMatch.food_name}`);
      setTimeout(() => setFeedback(""), 3000);
    } else {
      setFeedback(`❌ No match found for "${text}"`);
      setTimeout(() => setFeedback(""), 4000);
    }
  };

  const quickAddItems = [
    {
      name: "Dal Bhat",
      img: "https://ui-avatars.com/api/?name=Dal+Bhat&background=f0fdf4&color=15803d",
    },
    {
      name: "Roti",
      img: "https://ui-avatars.com/api/?name=Roti&background=fffbeb&color=b45309",
    },
    {
      name: "Apple",
      img: "https://ui-avatars.com/api/?name=Apple&background=fef2f2&color=b91c1c",
    },
    {
      name: "Water",
      img: "https://ui-avatars.com/api/?name=Water&background=eff6ff&color=1d4ed8",
    },
  ];

  return (
    <div className="flex flex-col items-center pb-20 md:pb-0">
      <main className="w-full py-4 flex flex-col gap-10">
        {/* Top Logging Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Voice Log Button */}
          <div
            onClick={!isListening ? handleVoiceLogClick : undefined}
            className={`rounded-[2rem] p-10 border shadow-sm transition-all duration-300 flex flex-col items-center justify-center text-center gap-6 h-full min-h-[300px] cursor-pointer group hover:-translate-y-1
              ${isListening ? "bg-green-50 border-green-200" : "bg-white border-gray-100 hover:shadow-lg"}
            `}
          >
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300
              ${isListening ? "bg-green-500 text-white animate-pulse" : "bg-green-50 text-green-600 group-hover:scale-110"}
            `}
            >
              <span className="material-symbols-outlined text-[3rem]">mic</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-gray-900 text-2xl font-bold">
                {isListening ? "Listening..." : "Voice Log"}
              </h3>
              <p
                className={`font-medium ${feedback.includes("❌") ? "text-red-500" : feedback.includes("✅") ? "text-green-600" : "text-gray-500"}`}
              >
                {feedback || 'Tap and say "I had a bowl of rice and dal"'}
              </p>
            </div>
          </div>

          {/* Manual Log Search with Dropdown */}
          <div className="bg-white rounded-[2rem] p-10 border border-gray-100 shadow-sm transition-all duration-300 flex flex-col h-full min-h-[300px] justify-between relative">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-600">
                <span className="material-symbols-outlined text-2xl">
                  keyboard
                </span>
              </div>
              <div>
                <h3 className="text-gray-900 text-2xl font-bold">Manual Log</h3>
                <p className="text-gray-400 text-sm font-medium">
                  Search database
                </p>
              </div>
            </div>

            <div className="mt-8 relative w-full" ref={dropdownRef}>
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400">
                <span className="material-symbols-outlined">search</span>
              </div>

              <input
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-14 pr-4 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                placeholder="Search food (e.g. Momo)..."
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

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden max-h-64 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    <ul className="divide-y divide-gray-100">
                      {searchResults.map((food) => (
                        <li
                          key={food._id}
                          className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => {
                            onLog(food, 1);
                            setSearchTerm("");
                            setIsDropdownOpen(false);
                          }}
                        >
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900">
                              {food.food_name}
                            </span>
                            <span className="text-sm text-gray-500">
                              {food.calories} kcal • Rs. {food.price}
                            </span>
                          </div>
                          <button className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-sm">
                              add
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No foods found for "{searchTerm}".
                      <br />
                      <span className="text-xs text-gray-400 mt-1 block">
                        Try adding it in the Cook tab.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Quick Add Section */}
        <section className="flex flex-col gap-6 w-full">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-gray-900 font-bold text-xl">Quick Add</h3>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {quickAddItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  // Find the food in DB to log it via Quick Add
                  const foundFood = foods.find(
                    (f) =>
                      f.food_name.toLowerCase() === item.name.toLowerCase(),
                  );
                  if (foundFood) onLog(foundFood, 1);
                  else
                    alert(
                      `${item.name} not found in database. Add it via Cook tab first!`,
                    );
                }}
                className="flex flex-col items-center gap-3 group p-4 rounded-3xl bg-white border border-gray-100 hover:border-green-200 hover:shadow-md transition-all"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-300 border-2 border-transparent group-hover:border-green-500">
                  <img
                    alt={item.name}
                    className="w-full h-full object-cover"
                    src={item.img}
                  />
                </div>
                <span className="text-sm font-bold text-gray-700 group-hover:text-green-600">
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Timeline: Today's Meals */}
        <section className="flex flex-col gap-8 w-full mt-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3 text-gray-900 font-bold text-xl">
              <span className="material-symbols-outlined text-green-600 text-2xl">
                history
              </span>
              <h3>Today's Meals</h3>
            </div>
            <div className="bg-gray-100 px-4 py-2 rounded-lg text-sm font-bold text-gray-600">
              {Math.round(totalCalories)} / {dailyGoal} kcal
            </div>
          </div>

          <div className="relative flex flex-col gap-6">
            <div className="absolute top-8 bottom-8 left-[3.25rem] w-px border-l border-dashed border-gray-300 hidden md:block"></div>

            {logs.length === 0 ? (
              <div className="text-center p-10 text-gray-500 bg-white rounded-[1.5rem] border border-gray-100 shadow-sm">
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
                    <div className="w-20 h-20 md:w-[6.5rem] md:h-[6.5rem] rounded-full p-1 bg-white border border-gray-200 shadow-sm flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-green-50 flex items-center justify-center text-green-600">
                        <span className="material-symbols-outlined text-4xl">
                          set_meal
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 w-full bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col gap-2 w-full sm:w-auto text-center sm:text-left">
                      <h4 className="font-bold text-lg text-gray-900">
                        {log.food_name}
                      </h4>
                      <div className="flex items-center justify-center sm:justify-start gap-3 text-sm">
                        <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs font-bold">
                          Qty: {log.quantity}
                        </span>
                        <span className="text-gray-400 font-medium">
                          • {formatTime(log.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 sm:gap-8 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-gray-100 pt-4 sm:pt-0">
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
                        className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 text-xs font-bold transition-colors bg-gray-50 p-2 rounded-lg"
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
      </main>
    </div>
  );
};

export default DailyLogs;
