import React, { useState, useEffect } from "react";
import axios from "axios";

interface SuggestionData {
  remainingBudget: number;
  remainingCalories: number;
  suggestions: any[];
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
        const response = await axios.get(
          "http://localhost:5000/api/foods/recommendations",
          config,
        );

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
      <div className="bg-green-50 rounded-3xl p-6 border border-green-100 flex items-center justify-center h-40 animate-pulse text-green-600 font-bold">
        Analyzing your budget & health goals...
      </div>
    );
  }

  if (!data || data.suggestions.length === 0) {
    return (
      <div className="bg-gray-50 rounded-3xl p-6 border border-gray-200 text-center">
        <span className="material-symbols-outlined text-gray-400 text-4xl mb-2">
          account_balance_wallet
        </span>
        <h3 className="text-gray-900 font-bold mb-1">Budget Tight!</h3>
        <p className="text-gray-500 text-sm">
          You don't have enough remaining budget or calories for our usual
          recommendations today.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-3xl p-6 md:p-8 border border-green-100 shadow-sm relative overflow-hidden">
      {/* Background decoration */}
      <span className="material-symbols-outlined absolute -right-4 -top-4 text-[120px] text-green-500 opacity-5 rotate-12 pointer-events-none">
        psychology
      </span>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-green-600">
            auto_awesome
          </span>
          <h3 className="font-bold text-green-800 uppercase tracking-wide text-xs">
            Smart Companion
          </h3>
        </div>

        <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-2 leading-tight">
          You have{" "}
          <span className="text-green-600">
            Rs. {Math.max(0, data.remainingBudget)}
          </span>{" "}
          and{" "}
          <span className="text-orange-500">
            {Math.max(0, data.remainingCalories)} kcal
          </span>{" "}
          left today.
        </h2>
        <p className="text-gray-600 text-sm font-medium mb-6">
          Based on your wallet and health profile, here is what we recommend
          eating next:
        </p>

        <div className="flex flex-col gap-4">
          {data.suggestions.map((food, index) => (
            <div
              key={food._id}
              className="bg-white p-4 rounded-2xl border border-white shadow-sm hover:border-green-300 hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-black text-sm">
                  #{index + 1}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg group-hover:text-green-700 transition-colors">
                    {food.food_name}
                  </h4>
                  <div className="flex gap-3 text-xs font-bold mt-1">
                    <span className="text-green-600">Rs. {food.price}</span>
                    <span className="text-orange-500">
                      {food.calories} kcal
                    </span>
                    {food.score > 20 && (
                      <span className="text-blue-500 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">
                          health_and_safety
                        </span>
                        Health Match
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SmartSuggestions;
