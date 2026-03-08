import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";

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
function App() {
  const [user, setUser] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [foods, setFoods] = useState<any[]>([]);
  const [budget] = useState<number>(5000); // Set your daily budget here

  // Check for logged-in user on initial load
  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

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

      setFoods(fRes.data);
      setLogs(lRes.data);
    } catch (err: any) {
      console.error(
        "Backend Error fetching data:",
        err.response?.data?.message || err.message,
      );

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
    } catch (err: any) {
      console.error(
        "Error logging food:",
        err.response?.data?.message || err.message,
      );
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
    } catch (err: any) {
      console.error(
        "Error deleting log:",
        err.response?.data?.message || err.message,
      );
    }
  };

  // Wrapper to protect routes from unauthenticated users
  const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
    if (!user) return <Navigate to="/login" />;
    return children;
  };

  return (
    <BrowserRouter>
      {/* Show Desktop Nav only if logged in */}
      {user && <DesktopNav />}

      <div className={`min-h-screen bg-gray-50 ${user ? "pb-20 md:pb-0" : ""}`}>
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <Routes>
            {/* Public Auth Routes */}
            <Route
              path="/login"
              element={<LoginPage onLogin={(data) => setUser(data)} />}
            />
            <Route
              path="/register"
              element={<RegisterPage onLogin={(data) => setUser(data)} />}
            />

            {/* Protected Routes  */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard logs={logs} budget={budget} />
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
                  <Budget />
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
