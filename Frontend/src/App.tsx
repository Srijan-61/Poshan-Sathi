import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";

import SplashScreen from "./components/SplashScreen";
import DesktopNav from "./components/DesktopNav";
import MobileNav from "./components/MobileNav";
import Dashboard from "./components/Dashboard";
import CreateFood from "./components/CreateFood";
import FoodLibrary from "./components/FoodLibrary";
import DailyLogs from "./components/DailyLogs";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import Budget from "./components/Budget";
import Profile from "./components/Profile";
import AdminDashboard from "./components/AdminDashboard";

import { ProtectedRoute, PublicRoute, AdminRoute } from "./components/AuthGuard";
import { useAppData } from "./hooks/useAppData";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Import all our state and custom API functions from the hook
  const { user, setUser, logs, foods, targets, fetchData, handleLog, handleDeleteLog } = useAppData();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <BrowserRouter>
      <AnimatePresence>
        {showSplash && <SplashScreen key="splash" />}
      </AnimatePresence>

      <div className={showSplash ? "hidden" : "block"}>
        <Toaster position="top-center" />
        
        {user && <DesktopNav />}

        <div className={`min-h-screen bg-gray-50 ${user ? "pb-20 md:pb-0" : ""}`}>
          <div className="max-w-4xl mx-auto p-4 md:p-8">
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<PublicRoute user={user}><LoginPage onLogin={setUser} /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute user={user}><RegisterPage onLogin={setUser} /></PublicRoute>} />

              {/* Protected Routes */}
              <Route path="/" element={<ProtectedRoute user={user}><Dashboard logs={logs} budget={targets.dailyBudget} goals={targets.dailyRequirements} /></ProtectedRoute>} />
              <Route path="/cook" element={<ProtectedRoute user={user}><CreateFood onFoodCreated={fetchData} /></ProtectedRoute>} />
              <Route path="/menu" element={<ProtectedRoute user={user}><FoodLibrary foods={foods} onLog={handleLog} /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute user={user}><DailyLogs logs={logs} foods={foods} onLog={handleLog} onDelete={handleDeleteLog} /></ProtectedRoute>} />
              <Route path="/budget" element={<ProtectedRoute user={user}><Budget dailyBudgetGoal={targets.dailyBudget} monthlyBudgetGoal={targets.monthlyBudget} /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute user={user}><Profile /></ProtectedRoute>} />

              {/* Secure Admin Route */}
              <Route path="/admin" element={<AdminRoute user={user}><AdminDashboard /></AdminRoute>} />
            </Routes>
          </div>
        </div>

        {user && (
          <div className="md:hidden">
            <MobileNav />
          </div>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
