import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import API from "../utils/axios";

interface Food {
  _id: string;
  food_name: string;
  calories: number;
  price: number;
  image?: string;
  category?: string;
}

interface Props {
  onLog: (food: any, quantity: number) => void;
}

const RecommendationsWidget: React.FC<Props> = ({ onLog }) => {
  const [recommendations, setRecommendations] = useState<Food[]>([]);
  const [mealType, setMealType] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await API.get("/api/recommendations");
        if (res.data && res.data.success) {
          setRecommendations(res.data.recommendations || []);
          setMealType(res.data.mealType || "");
        }
      } catch (err) {
        console.error("Failed to load recommendations", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  const card = "bg-white border-neutral-200 hover:shadow-md";

  if (loading) {
    return (
      <div className="w-full flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`min-w-[240px] h-32 rounded-xl border animate-pulse flex flex-col p-4 justify-between ${"bg-white border-neutral-200"}`}
          >
            <div className={`h-4 w-3/4 rounded ${"bg-neutral-200"}`}></div>
            <div className="flex gap-2">
              <div className={`h-3 w-12 rounded ${"bg-neutral-200"}`}></div>
              <div className={`h-3 w-12 rounded ${"bg-neutral-200"}`}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className={`text-xl font-bold mb-4 ${"text-neutral-900"}`}>
        Good{" "}
        {mealType === "Breakfast"
          ? "Morning"
          : mealType === "Lunch"
            ? "Afternoon"
            : "Evening"}
        ! Here are some {mealType.toLowerCase()} ideas within your budget:
      </h3>
      <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
        {recommendations.slice(0, 3).map((food) => (
          <div
            key={food._id}
            className={`min-w-[240px] flex-none rounded-xl border p-4 flex flex-col justify-between transition-shadow shadow-sm ${card}`}
          >
            <div className="flex gap-3 mb-3">
              {food.image ? (
                <img
                  src={food.image}
                  alt={food.food_name}
                  className={`w-12 h-12 rounded-lg object-cover border flex-shrink-0 ${"border-neutral-100"}`}
                />
              ) : (
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${"bg-green-50 text-green-600"}`}
                >
                  <span className="material-symbols-outlined mb-1">
                    restaurant
                  </span>
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <h4
                  className={`font-bold truncate text-lg ${"text-neutral-800"}`}
                >
                  {food.food_name}
                </h4>
                <div className="flex gap-2 text-xs font-bold mt-1">
                  <span className="text-orange-500">{food.calories} kcal</span>
                  <span className="text-green-600">Rs. {food.price}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                onLog(food, 1);
                toast.success(`Logged ${food.food_name}`);
              }}
              className="w-full py-2 flex items-center justify-center gap-2 rounded-lg font-bold text-sm bg-green-600 hover:bg-green-700 text-white transition-colors"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Log this
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationsWidget;
