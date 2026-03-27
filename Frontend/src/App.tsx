import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

// Navigation
import DesktopNav from "./components/DesktopNav";
import MobileNav from "./components/MobileNav";

// Pages
import Dashboard from "./components/Dashboard";
import CreateFood from "./components/CreateFood";
import FoodLibrary from "./components/FoodLibrary";
import DailyLogs from "./components/DailyLogs";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import Budget from "./components/Budget";
import Profile from "./components/Profile";

interface AnalyticsTargets {
  dailyBudget: number;
  monthlyBudget: number;
  dailyRequirements: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    iron: number;
    calcium: number;
    vitaminC: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
}

const DEFAULT_TARGETS: AnalyticsTargets = {
  dailyBudget: 500,
  monthlyBudget: 15000,
  dailyRequirements: {
    calories: 2000,
    protein: 60,
    carbs: 275,
    fats: 70,
    iron: 15,
    calcium: 1000,
    vitaminC: 90,
    fiber: 30,
    sugar: 50,
    sodium: 2300,
  },
};

function App() {
  const [user, setUser] = useState<any>(() => {
    const savedUser = localStorage.getItem("userInfo");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [logs, setLogs] = useState<any[]>([]);
  const [foods, setFoods] = useState<any[]>([]);
  const [targets, setTargets] = useState<AnalyticsTargets>(DEFAULT_TARGETS);

  // Fetch data ONLY when the user is logged in
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Data Fetching Logic (Secure)
  const fetchData = async () => {
    try {
      // Configure Axios to send the user's JWT token
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      // Fetch Foods and Logs from the backend
      const fRes = await axios.get("http://localhost:5000/api/foods", config);
      const lRes = await axios.get("http://localhost:5000/api/logs", config);
      const pRes = await axios.get("http://localhost:5000/api/profile", config);

      setFoods(fRes.data);
      setLogs(lRes.data);

      const profile = pRes.data?.profile || {};
      const reqs = pRes.data?.dailyRequirements || {};
      const monthlyBudget = Number(profile.monthlyBudget) || DEFAULT_TARGETS.monthlyBudget;
      const dailyBudget = Math.round(monthlyBudget / 30);

      setTargets({
        dailyBudget,
        monthlyBudget,
        dailyRequirements: {
          calories: Number(reqs.calories) || DEFAULT_TARGETS.dailyRequirements.calories,
          protein: Number(reqs.protein) || DEFAULT_TARGETS.dailyRequirements.protein,
          carbs: Number(reqs.carbs) || DEFAULT_TARGETS.dailyRequirements.carbs,
          fats: Number(reqs.fats) || DEFAULT_TARGETS.dailyRequirements.fats,
          iron: Number(reqs.iron) || DEFAULT_TARGETS.dailyRequirements.iron,
          calcium: Number(reqs.calcium) || DEFAULT_TARGETS.dailyRequirements.calcium,
          vitaminC: Number(reqs.vitaminC) || DEFAULT_TARGETS.dailyRequirements.vitaminC,
          fiber: Number(reqs.fiber) || DEFAULT_TARGETS.dailyRequirements.fiber,
          sugar: Number(reqs.sugar) || DEFAULT_TARGETS.dailyRequirements.sugar,
          sodium: Number(reqs.sodium) || DEFAULT_TARGETS.dailyRequirements.sodium,
        },
      });
    } catch (err: any) {
      console.error(
        "Backend Error fetching data:",
        err.response?.data?.message || err.message,
      );
      toast.error(err.response?.data?.message || "Failed to fetch data");

      // If the token is invalid or expired (401 Unauthorized), log the user out
      if (err.response?.status === 401) {
        localStorage.removeItem("userInfo");
        setUser(null);
      }
    }
  };

  // Logging a new meal
  const handleLog = async (food: any, qty: number = 1) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      await axios.post(
        "http://localhost:5000/api/logs",
        {
          food_name: food.food_name,
          quantity: qty,
          calories: food.calories * qty,
          cost: food.price * qty,
          protein: food.protein ? food.protein * qty : 0,
          carbs: food.carbs ? food.carbs * qty : 0,
          fats: food.fats ? food.fats * qty : 0,
          // NEW: Send the micros object to the backend!
          micros: {
            iron: food.micros?.iron ? food.micros.iron * qty : 0,
            calcium: food.micros?.calcium ? food.micros.calcium * qty : 0,
            vitaminC: food.micros?.vitaminC ? food.micros.vitaminC * qty : 0,
            fiber: food.micros?.fiber ? food.micros.fiber * qty : 0,
            sugar: food.micros?.sugar ? food.micros.sugar * qty : 0,
            sodium: food.micros?.sodium ? food.micros.sodium * qty : 0,
          },
        },
        config,
      );

      // Refresh the dashboard with the new log (select * from logs)
      fetchData();
      toast.success("Food logged successfully!");
    } catch (err: any) {
      console.error(
        "Error logging food:",
        err.response?.data?.message || err.message,
      );
      toast.error(err.response?.data?.message || "Failed to log food");
    }
  };

  // Deleting a meal log
  const handleDeleteLog = async (id: string) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      await axios.delete(`http://localhost:5000/api/logs/${id}`, config);

      // Refresh the dashboard after deletion
      fetchData();
      toast.success("Log deleted successfully!");
    } catch (err: any) {
      console.error(
        "Error deleting log:",
        err.response?.data?.message || err.message,
      );
      toast.error(err.response?.data?.message || "Failed to delete log");
    }
  };

  // Wrapper to protect routes from unauthenticated users
  const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
    if (!user) return <Navigate to="/login" />;
    return children;
  };

  // Wrapper to redirect authenticated users away from public routes
  const PublicRoute = ({ children }: { children: React.ReactElement }) => {
    if (user) return <Navigate to="/" />;
    return children;
  };

  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      {/* Show Desktop Nav only if logged in */}
      {user && <DesktopNav />}

      <div className={`min-h-screen bg-gray-50 ${user ? "pb-20 md:pb-0" : ""}`}>
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <Routes>
            {/* Public Auth Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage onLogin={(data) => setUser(data)} />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage onLogin={(data) => setUser(data)} />
                </PublicRoute>
              }
            />

            {/* Protected Routes  */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard
                    logs={logs}
                    budget={targets.dailyBudget}
                    goals={targets.dailyRequirements}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/cook"
              element={
                <ProtectedRoute>
                  <CreateFood onFoodCreated={fetchData} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/menu"
              element={
                <ProtectedRoute>
                  <FoodLibrary foods={foods} onLog={handleLog} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <DailyLogs
                    logs={logs}
                    foods={foods}
                    onLog={handleLog}
                    onDelete={handleDeleteLog}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/budget"
              element={
                <ProtectedRoute>
                  <Budget
                    dailyBudgetGoal={targets.dailyBudget}
                    monthlyBudgetGoal={targets.monthlyBudget}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>

        {/* Show Mobile Bottom Nav only if logged in */}
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
