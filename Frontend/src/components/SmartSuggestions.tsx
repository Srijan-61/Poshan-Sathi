import React, { useState, useEffect } from "react";
import axios from "axios";

interface SuggestionData {
  remainingBudget: number;
  remainingCalories: number;
  insights: any[];
}

const SmartSuggestions: React.FC = () => {
  const [data, setData] = useState<SuggestionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        if (!userInfo.token) return;

        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };
        const response = await axios.get("/api/foods/recommendations", config);

        setData(response.data);
      } catch (err) {
        console.error("Failed to load smart suggestions", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center p-4 text-gray-500">
        Analyzing nutrition goals...
      </div>
    );
  }

  // Safety check to prevent white-screen crashes
  if (!data || !data.insights || data.insights.length === 0) {
    return (
      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 text-center">
        <span className="material-symbols-outlined text-gray-400 text-4xl mb-2">
          check_circle
        </span>
        <h3 className="text-gray-900 font-bold mb-1">Nutrition on Track!</h3>
        <p className="text-gray-500 text-sm">
          You are hitting your goals perfectly today.
        </p>
      </div>
    );
  }

  return (
    <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-2">
        <span className="material-symbols-outlined text-indigo-500">
          psychology
        </span>
        Smart Recommendations
      </h3>

      <div className="flex flex-col gap-4">
        {data.insights.map((insight) => (
          <div
            key={insight.id}
            className={`rounded-2xl p-4 border flex flex-col gap-3 ${insight.colorClass}`}
          >
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-2xl">
                {insight.icon}
              </span>
              <div>
                <h4 className="font-bold text-lg leading-tight">
                  {insight.title}
                </h4>
                <p className="text-sm mt-1 opacity-90 leading-snug">
                  {insight.message}
                </p>
              </div>
            </div>

            {insight.suggestions && insight.suggestions.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1 mt-2 scrollbar-hide">
                {insight.suggestions.map((food: any) => (
                  <div
                    key={food._id}
                    className="bg-white/80 rounded-xl p-2 min-w-[120px] shadow-sm"
                  >
                    <span className="font-bold text-gray-900 text-sm block truncate">
                      {food.food_name}
                    </span>
                    <div className="flex justify-between items-center w-full mt-1">
                      <span className="text-xs font-bold text-green-700">
                        Rs. {food.price}
                      </span>
                      <span className="text-xs text-gray-500">
                        {food.calories} kcal
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default SmartSuggestions;
