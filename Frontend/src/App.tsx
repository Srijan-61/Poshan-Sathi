import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import SplashScreen from "./components/SplashScreen";
import DesktopNav from "./components/Nav/DesktopNav";
import MobileNav from "./components/Nav/MobileNav";
import MobileHeader from "./components/Nav/MobileHeader";
import Dashboard from "./components/Dashboard/Dashboard";
import CreateFood from "./components/CreateFood/CreateFood";
import FoodLibrary from "./components/FoodLibrary/FoodLibrary";
import DailyLogs from "./components/DailyLogs/DailyLogs";
import LoginPage from "./components/Auth/LoginPage";
import RegisterPage from "./components/Auth/RegisterPage";
import ForgotPassword from "./components/Auth/ForgotPassword";
import ResetPassword from "./components/Auth/ResetPassword";
import Budget from "./components/Budget/Budget";
import Profile from "./components/Profile/Profile";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";

import {
  ProtectedRoute,
  PublicRoute,
  AdminRoute,
} from "./components/Auth/AuthGuard";
import { useAppData } from "./hooks/useAppData";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Import all our state and custom API functions from the hook
  const {
    user,
    setUser,
    profile,
    logs,
    foods,
    targets,
    fetchData,
    handleLog,
    handleDeleteLog,
    handleUpdateLog,
  } = useAppData();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <BrowserRouter>
      {showSplash && <SplashScreen />}

      <div className={showSplash ? "hidden" : "block"}>
        <Toaster position="top-center" />

        <div className="flex flex-col min-h-screen">
          {user && <DesktopNav />}
          {user && <MobileHeader />}

          <div className={`flex-1 ${user ? "pt-16 md:pt-0 pb-20 md:pb-0" : ""}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
              <Routes>
                {/* Public Auth Routes */}
                <Route
                  path="/login"
                  element={
                    <PublicRoute user={user}>
                      <LoginPage onLogin={setUser} />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicRoute user={user}>
                      <RegisterPage onLogin={setUser} />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/forgot-password"
                  element={
                    <PublicRoute user={user}>
                      <ForgotPassword />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/reset-password/:token"
                  element={
                    <PublicRoute user={user}>
                      <ResetPassword />
                    </PublicRoute>
                  }
                />

                {/* Protected Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute user={user}>
                      <Dashboard
                        user={{ ...user, ...profile }}
                        logs={logs}
                        goals={targets.dailyRequirements}
                        onLog={handleLog}
                      />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cook"
                  element={
                    <ProtectedRoute user={user}>
                      <CreateFood onFoodCreated={fetchData} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/menu"
                  element={
                    <ProtectedRoute user={user}>
                      <FoodLibrary onLog={handleLog} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute user={user}>
                      <DailyLogs
                        logs={logs}
                        foods={foods}
                        onLog={handleLog}
                        onDelete={handleDeleteLog}
                        onUpdateQuantity={handleUpdateLog}
                      />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/budget"
                  element={
                    <ProtectedRoute user={user}>
                      <Budget monthlyBudgetGoal={targets.monthlyBudget} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute user={user}>
                      <Profile onProfileSaved={fetchData} />
                    </ProtectedRoute>
                  }
                />

                {/* Secure Admin Route */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute user={user}>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
              </Routes>
            </div>
          </div>

          {user && (
            <div className="md:hidden">
              <MobileNav />
            </div>
          )}
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
