import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import API from "../../utils/axios";
import RecommendationsWidget from "../RecommendationsWidget";

import type { Log, Props } from "./types";
import { levenshtein, toLocalDateString } from "./utils";
import LoggingControls from "./LoggingControls";
import QuickAdd from "./QuickAdd";
import TodaysMeals from "./TodaysMeals";
import PreviousLogs from "./PreviousLogs";

const DailyLogs: React.FC<Props> = ({ logs, foods, onLog, onDelete, onUpdateQuantity }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState("");

  const [selectedDate, setSelectedDate] = useState("");
  const [historyLogs, setHistoryLogs] = useState<Log[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const totalCalories = logs.reduce((sum, log) => sum + log.calories, 0);
  const dailyGoal = 2000;

  const historyTotalCalories = historyLogs.reduce((sum, log) => sum + log.calories, 0);
  const historyTotalCost = historyLogs.reduce((sum, log) => sum + log.cost, 0);

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
  }, [selectedDate, logs]);

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

      const accuracy = matchedTokensCount / foodTokens.length;
      const finalScore = accuracy + foodTokens.length * 0.1;

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

  return (
    <div className="flex flex-col items-center pb-20 md:pb-0">
      <main className="w-full py-4 flex flex-col gap-10">
        <LoggingControls 
          isListening={isListening}
          handleVoiceLogClick={handleVoiceLogClick}
          feedback={feedback}
          dropdownRef={dropdownRef}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isDropdownOpen={isDropdownOpen}
          setIsDropdownOpen={setIsDropdownOpen}
          searchResults={searchResults}
          onLog={onLog}
        />

        <RecommendationsWidget onLog={onLog} />

        <QuickAdd 
          quickAddItems={quickAddItems}
          foods={foods}
          onLog={onLog}
        />

        <TodaysMeals 
          logs={logs}
          totalCalories={totalCalories}
          dailyGoal={dailyGoal}
          getFoodImage={getFoodImage}
          onDelete={onDelete}
          onUpdateQuantity={onUpdateQuantity}
        />

        <PreviousLogs 
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          historyLogs={historyLogs}
          setHistoryLogs={setHistoryLogs}
          isLoadingHistory={isLoadingHistory}
          historyError={historyError}
          historyTotalCalories={historyTotalCalories}
          historyTotalCost={historyTotalCost}
          getFoodImage={getFoodImage}
        />
      </main>
    </div>
  );
};

export default DailyLogs;
