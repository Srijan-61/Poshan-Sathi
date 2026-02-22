import React, { useState } from "react";

interface Food {
  _id: string;
  food_name: string;
  calories: number;
  price: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  category?: string;
  image_url?: string;
}

interface Props {
  foods: Food[];
  onLog: (food: Food, quantity: number) => void;
}

const FoodLibrary: React.FC<Props> = ({ foods, onLog }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Hardcoded categories for Nepali food
  const categories = ["All", "Meals", "Snacks", "Drinks", "Fruits"];

  // Filter the foods based on search text and category
  const filteredFoods = foods.filter((food) => {
    const matchesSearch = food.food_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || food.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <section className="flex flex-col gap-2 pt-2">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight">
          Food Library
        </h1>
        <p className="text-gray-500 text-lg font-medium">
          Search and log your meals.
        </p>
      </section>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
          <span className="material-symbols-outlined">search</span>
        </div>
        <input
          type="text"
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all shadow-sm text-lg"
          placeholder="Search for Dal Bhat, Momo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-6 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${
              activeCategory === category
                ? "bg-green-600 text-white shadow-md shadow-green-600/30"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Food Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        {foods.length === 0 ? (
          // Empty State (Database is empty)
          <div className="col-span-full p-10 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-gray-100 border-dashed">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-orange-400 mb-4">
              <span className="material-symbols-outlined text-3xl">
                warning
              </span>
            </div>
            <h4 className="text-lg font-bold text-gray-700">
              No foods found in database
            </h4>
            <p className="text-sm text-gray-400 mt-2 max-w-[250px]">
              You need to add some foods to your database first! Go to the
              'Cook' tab.
            </p>
          </div>
        ) : filteredFoods.length === 0 ? (
          // Empty State (Search returned nothing)
          <div className="col-span-full text-center p-8 text-gray-500">
            No foods match "{searchTerm}" in {activeCategory}.
          </div>
        ) : (
          // Display the mapped foods
          filteredFoods.map((food) => (
            <div
              key={food._id}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                {/* Fallback Icon if no image */}
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 flex-shrink-0">
                  <span className="material-symbols-outlined text-2xl">
                    local_dining
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 text-lg group-hover:text-green-700 transition-colors">
                    {food.food_name}
                  </h3>
                  <div className="flex gap-3 text-sm font-bold mt-1">
                    <span className="text-orange-500">
                      {food.calories} kcal
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-green-600">Rs. {food.price}</span>
                  </div>
                </div>
              </div>

              {/* Add Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLog(food, 1); // Logs 1 quantity of the food
                  // Optional: Add a toast notification here
                  alert(`Logged 1 portion of ${food.food_name}`);
                }}
                className="w-10 h-10 rounded-full bg-gray-50 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-sm"
                title="Log this food"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FoodLibrary;
