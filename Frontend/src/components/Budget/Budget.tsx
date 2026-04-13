import React, { useState, useEffect } from "react";
import axios from "../../utils/axios";
import type { Log, BudgetProps } from "./types";
import { toMonthKey } from "./utils";
import BudgetHeader from "./BudgetHeader";
import FinancialSummary from "./FinancialSummary";
import WeeklyTrendChart from "./WeeklyTrendChart";
import RecentExpenses from "./RecentExpenses";
import BudgetHistory from "./BudgetHistory";

const Budget: React.FC<BudgetProps> = ({ dailyBudgetGoal, monthlyBudgetGoal }) => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Budget History State ---
  const [historyMonth, setHistoryMonth] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return toMonthKey(d);
  });
  const [historyLogs, setHistoryLogs] = useState<Log[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showAllExpenses, setShowAllExpenses] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await axios.get("/api/logs?range=month");
        setLogs(data);
      } catch (err) {
        console.error("Failed to fetch logs", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // --- Fetch history month logs ---
  useEffect(() => {
    if (!historyMonth) return;
    const currentMonthKey = toMonthKey(new Date());
    if (historyMonth === currentMonthKey) {
      setHistoryLogs(logs);
      return;
    }

    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const { data } = await axios.get(`/api/logs?month=${historyMonth}`);
        setHistoryLogs(data);
      } catch (err) {
        console.error("Failed to fetch budget history", err);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [historyMonth, logs]);

  // --- Date Math ---
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const dailyLogs = logs.filter((log) => new Date(log.date) >= startOfToday);
  const monthlyLogs = logs.filter((log) => new Date(log.date) >= startOfMonth);

  const todaySpent = dailyLogs.reduce((sum, log) => sum + log.cost, 0);
  const monthSpent = monthlyLogs.reduce((sum, log) => sum + log.cost, 0);

  const dailyPercent = Math.min((todaySpent / Math.max(dailyBudgetGoal, 1)) * 100, 100);
  const monthlyPercent = Math.min((monthSpent / Math.max(monthlyBudgetGoal, 1)) * 100, 100);

  // --- 7-Day Chart Data ---
  const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);

    const nextDay = new Date(d);
    nextDay.setDate(nextDay.getDate() + 1);

    const spentThisDay = logs
      .filter((log) => {
        const logDate = new Date(log.date);
        return logDate >= d && logDate < nextDay;
      })
      .reduce((sum, log) => sum + log.cost, 0);

    return {
      name: d.toLocaleDateString("en-US", { weekday: "short" }),
      spent: spentThisDay,
    };
  });

  // --- History Month Chart Data ---
  const getHistoryChartData = () => {
    const [y, m] = historyMonth.split("-").map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();

    return Array.from({ length: daysInMonth }).map((_, i) => {
      const day = i + 1;
      const dayStart = new Date(y, m - 1, day, 0, 0, 0, 0);
      const dayEnd = new Date(y, m - 1, day, 23, 59, 59, 999);

      const spentThisDay = historyLogs
        .filter((log) => {
          const logDate = new Date(log.date);
          return logDate >= dayStart && logDate <= dayEnd;
        })
        .reduce((sum, log) => sum + log.cost, 0);

      return { name: String(day), spent: Math.round(spentThisDay) };
    });
  };

  const historyChartData = getHistoryChartData();
  const historyTotalSpent = historyLogs.reduce((sum, log) => sum + log.cost, 0);
  const historyTotalCalories = historyLogs.reduce((sum, log) => sum + log.calories, 0);
  const historyDaysWithData = new Set(historyLogs.map((log) => new Date(log.date).getDate())).size;
  const historyDailyAvg = historyDaysWithData > 0 ? Math.round(historyTotalSpent / historyDaysWithData) : 0;

  // --- Month Navigation ---
  const navigateMonth = (direction: number) => {
    const [y, m] = historyMonth.split("-").map(Number);
    const d = new Date(y, m - 1 + direction, 1);
    // Don't go into the future
    if (d > new Date()) return;
    setHistoryMonth(toMonthKey(d));
    setShowAllExpenses(false);
  };

  const isCurrentMonth = historyMonth === toMonthKey(new Date());

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-green-600">
        <span className="material-symbols-outlined animate-spin text-4xl">
          autorenew
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-24 md:pb-6 animate-in fade-in slide-in-from-bottom-4 pt-2">
      <BudgetHeader />

      <FinancialSummary
        todaySpent={todaySpent}
        dailyBudgetGoal={dailyBudgetGoal}
        dailyPercent={dailyPercent}
        monthSpent={monthSpent}
        monthlyBudgetGoal={monthlyBudgetGoal}
        monthlyPercent={monthlyPercent}
      />

      <WeeklyTrendChart
        last7DaysData={last7DaysData}
        dailyBudgetGoal={dailyBudgetGoal}
      />

      <RecentExpenses logs={logs} />

      <BudgetHistory
        historyMonth={historyMonth}
        navigateMonth={navigateMonth}
        isCurrentMonth={isCurrentMonth}
        isLoadingHistory={isLoadingHistory}
        historyTotalSpent={historyTotalSpent}
        monthlyBudgetGoal={monthlyBudgetGoal}
        historyDailyAvg={historyDailyAvg}
        dailyBudgetGoal={dailyBudgetGoal}
        historyTotalCalories={historyTotalCalories}
        historyChartData={historyChartData}
        historyLogs={historyLogs}
        showAllExpenses={showAllExpenses}
        setShowAllExpenses={setShowAllExpenses}
      />
    </div>
  );
};

export default Budget;
