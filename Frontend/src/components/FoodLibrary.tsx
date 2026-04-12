import React, { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import API from "../utils/axios";
import { useTheme } from "../context/ThemeContext";

// --- TYPES ---
interface Food {
  _id: string;
  food_name: string;
  calories: number;
  price: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  category?: string;
  image?: string;
  micros?: {
    iron?: number;
    calcium?: number;
    vitamin_c?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
}

interface Props {
  onLog: (food: Food, quantity: number) => void;
}

const PAGE_SIZE = 12;

// --- Debounce Hook ---
const useDebounce = (value: string, delay: number) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

const FoodLibrary: React.FC<Props> = ({ onLog }) => {
  const { isDark } = useTheme();
  const [foods, setFoods] = useState<Food[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [logQty, setLogQty] = useState(1);

  // Theme helpers
  const card = isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100";
  const heading = isDark ? "text-white" : "text-neutral-900";
  const subtext = isDark ? "text-neutral-400" : "text-neutral-500";

  const debouncedSearch = useDebounce(searchTerm, 400);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  const categories = ["All", "Meals", "Snacks", "Drinks", "Fruits"];

  // --- Fetch Foods ---
  const fetchFoods = useCallback(
    async (pageNum: number, append: boolean = false) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: PAGE_SIZE.toString(),
        });
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (activeCategory !== "All") params.set("category", activeCategory);

        const res = await API.get(`/api/foods?${params.toString()}`);
        const data = res.data;

        const list = Array.isArray(data?.foods)
          ? data.foods
          : Array.isArray(data)
            ? data
            : [];

        if (append) {
          setFoods((prev) => [
            ...(Array.isArray(prev) ? prev : []),
            ...list,
          ]);
        } else {
          setFoods(list);
        }
        setPage(typeof data?.page === "number" ? data.page : pageNum);
        setTotalPages(
          typeof data?.totalPages === "number" && data.totalPages >= 1
            ? data.totalPages
            : 1,
        );
        setTotalCount(typeof data?.totalCount === "number" ? data.totalCount : list.length);
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load foods";
        toast.error(typeof msg === "string" ? msg : "Failed to load foods");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [debouncedSearch, activeCategory],
  );

  // Reset and fetch when search/category changes
  useEffect(() => {
    // Skip very first render flicker — fetch once on mount
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
    }
    setPage(1);
    fetchFoods(1, false);
  }, [debouncedSearch, activeCategory, fetchFoods]);

  // --- Infinite Scroll via IntersectionObserver ---
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && !isLoadingMore && page < totalPages) {
          fetchFoods(page + 1, true);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [page, totalPages, isLoading, isLoadingMore, fetchFoods]);

  // --- Skeleton Loader ---
  const SkeletonCard = () => (
    <div className={`rounded-2xl border p-4 animate-pulse ${card}`}>
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl flex-shrink-0 ${isDark ? "bg-neutral-800" : "bg-neutral-200"}`}></div>
        <div className="flex-1 space-y-2">
          <div className={`h-4 rounded w-3/4 ${isDark ? "bg-neutral-800" : "bg-neutral-200"}`}></div>
          <div className={`h-3 rounded w-1/2 ${isDark ? "bg-neutral-700" : "bg-neutral-100"}`}></div>
        </div>
        <div className={`w-10 h-10 rounded-full ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`}></div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 pb-20 md:pb-0">
      {/* Header */}
      <section className="flex flex-col gap-2 pt-2">
        <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${heading}`}>
          Food Library
        </h1>
        <p className={`text-lg font-medium ${subtext}`}>
          Browse, search & log from{" "}
          <span className="text-green-600 font-bold">{totalCount}</span> foods.
        </p>
      </section>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
          <span className="material-symbols-outlined">search</span>
        </div>
        <input
          id="food-library-search"
          type="text"
          className={`w-full pl-12 pr-12 py-4 border rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all shadow-sm text-lg ${isDark ? "bg-neutral-900 border-neutral-700 text-white placeholder-neutral-500" : "bg-white border-neutral-200 text-neutral-900 placeholder-neutral-400"}`}
          placeholder="Search for Dal Bhat, Momo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* Clear icon */}
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-6 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all duration-200 ${
              activeCategory === category
                ? "bg-green-600 text-white shadow-md shadow-green-600/30 scale-105"
                : isDark
                  ? "bg-neutral-900 border border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:border-green-700"
                  : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:border-green-300"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Result Count Bar */}
      {!isLoading && (
        <div className="flex items-center justify-between px-1">
          <span className={`text-sm font-medium ${subtext}`}>
            {totalCount === 0
              ? "No foods found"
              : `Showing ${foods.length} of ${totalCount} food${totalCount !== 1 ? "s" : ""}`}
          </span>
          {totalPages > 1 && (
            <span className={`text-xs font-medium ${subtext}`}>
              Page {page} of {totalPages}
            </span>
          )}
        </div>
      )}

      {/* Food Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Initial Loading */}
        {isLoading && foods.length === 0 && (
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </>
        )}

        {/* Empty: Database empty */}
        {!isLoading && totalCount === 0 && !debouncedSearch && activeCategory === "All" && (
          <div className={`col-span-full p-10 flex flex-col items-center justify-center text-center rounded-2xl border border-dashed ${card}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-orange-400 mb-4 ${isDark ? "bg-orange-900/20" : "bg-orange-50"}`}>
              <span className="material-symbols-outlined text-3xl">warning</span>
            </div>
            <h4 className={`text-lg font-bold ${isDark ? "text-neutral-300" : "text-neutral-700"}`}>
              No foods found in database
            </h4>
            <p className={`text-sm mt-2 max-w-[250px] ${subtext}`}>
              You need to add some foods to your database first! Go to the 'Cook' tab.
            </p>
          </div>
        )}

        {/* Empty: Search/Filter returned nothing */}
        {!isLoading && totalCount === 0 && (debouncedSearch || activeCategory !== "All") && (
          <div className={`col-span-full text-center p-10 rounded-2xl border ${card}`}>
            <span className={`material-symbols-outlined text-5xl block mb-3 ${isDark ? "text-neutral-600" : "text-neutral-300"}`}>
              search_off
            </span>
            <p className={`font-medium ${subtext}`}>
              No foods match{" "}
              {debouncedSearch && (
                <span className={`font-bold ${heading}`}>"{debouncedSearch}"</span>
              )}
              {debouncedSearch && activeCategory !== "All" && " in "}
              {activeCategory !== "All" && (
                <span className="font-bold text-green-600">{activeCategory}</span>
              )}
              .
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setActiveCategory("All");
              }}
              className="mt-4 text-sm font-bold text-green-600 hover:text-green-700 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Food Cards */}
        {foods.map((food, index) => (
          <div
            key={food._id}
            onClick={() => {
              setSelectedFood(food);
              setLogQty(1);
            }}
            className={`p-4 rounded-2xl border shadow-sm hover:-translate-y-0.5 transition-all duration-300 flex justify-between items-center group cursor-pointer ${isDark ? "bg-neutral-900 border-neutral-800 hover:shadow-neutral-900/50" : "bg-white border-neutral-100 hover:shadow-lg"}`}
            style={{ animationDelay: `${(index % PAGE_SIZE) * 40}ms` }}
          >
            <div className="flex items-center gap-4">
              {/* Image */}
              {food.image ? (
                <img
                  src={food.image}
                  alt={food.food_name}
                  className={`w-14 h-14 rounded-2xl object-cover flex-shrink-0 border ${isDark ? "border-neutral-700" : "border-neutral-100"}`}
                  loading="lazy"
                />
              ) : (
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${isDark ? "bg-green-900/20 text-green-400" : "bg-green-50 text-green-600"}`}>
                  <span className="material-symbols-outlined text-2xl">
                    local_dining
                  </span>
                </div>
              )}

              <div>
                <h3 className={`font-bold text-lg transition-colors ${isDark ? "text-neutral-200 group-hover:text-green-400" : "text-neutral-800 group-hover:text-green-700"}`}>
                  {food.food_name}
                </h3>
                <div className="flex gap-3 text-sm font-bold mt-1">
                  <span className="text-orange-500">{food.calories} kcal</span>
                  <span className={isDark ? "text-neutral-600" : "text-neutral-300"}>•</span>
                  <span className="text-green-600">Rs. {food.price}</span>
                </div>
                {/* Macro Preview */}
                {(food.protein || food.carbs || food.fats) && (
                  <div className="flex gap-2 mt-1.5">
                    {food.protein != null && (
                      <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${isDark ? "bg-blue-900/20 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
                        P: {food.protein}g
                      </span>
                    )}
                    {food.carbs != null && (
                      <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${isDark ? "bg-amber-900/20 text-amber-400" : "bg-amber-50 text-amber-600"}`}>
                        C: {food.carbs}g
                      </span>
                    )}
                    {food.fats != null && (
                      <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${isDark ? "bg-rose-900/20 text-rose-400" : "bg-rose-50 text-rose-600"}`}>
                        F: {food.fats}g
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Add */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLog(food, 1);
                toast.success(`Logged 1 portion of ${food.food_name}`);
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-sm flex-shrink-0 ${isDark ? "bg-neutral-800 text-green-400" : "bg-neutral-50 text-green-600"}`}
              title="Log this food"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
        ))}

        {/* Loading More Indicator */}
        {isLoadingMore && (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={`loading-more-${i}`} />
            ))}
          </>
        )}
      </div>

      {/* Intersection Observer Sentinel */}
      {page < totalPages && !isLoading && (
        <div ref={sentinelRef} className="h-4" />
      )}

      {/* End of list indicator */}
      {!isLoading && foods.length > 0 && page >= totalPages && (
        <div className="text-center py-6">
          <span className="text-sm text-neutral-400 font-medium">
            ✓ You've reached the end — {totalCount} food{totalCount !== 1 ? "s" : ""} total
          </span>
        </div>
      )}

      {/* ===== Food Detail Modal ===== */}
      {selectedFood && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setSelectedFood(null)}
        >
          <div
            className={`rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-[fadeScaleIn_0.2s_ease-out] ${isDark ? "bg-neutral-900" : "bg-white"}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Header */}
            {selectedFood.image ? (
              <div className="relative h-48 overflow-hidden rounded-t-3xl">
                <img
                  src={selectedFood.image}
                  alt={selectedFood.food_name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <button
                  onClick={() => setSelectedFood(null)}
                  className="absolute top-4 right-4 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-neutral-700 hover:bg-white transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
                <div className="absolute bottom-4 left-6">
                  <h2 className="text-2xl font-extrabold text-white drop-shadow-lg">
                    {selectedFood.food_name}
                  </h2>
                  {selectedFood.category && (
                    <span className="text-xs font-bold text-white/80 bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-sm">
                      {selectedFood.category}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative p-6 pb-2 flex items-center justify-between">
                <div>
                  <h2 className={`text-2xl font-extrabold ${heading}`}>
                    {selectedFood.food_name}
                  </h2>
                  {selectedFood.category && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md mt-1 inline-block ${isDark ? "text-green-400 bg-green-900/30" : "text-green-600 bg-green-50"}`}>
                      {selectedFood.category}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedFood(null)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isDark ? "bg-neutral-800 text-neutral-400 hover:bg-neutral-700" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`}
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
            )}

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Cal + Price */}
              <div className="flex gap-4">
                <div className={`flex-1 rounded-2xl p-4 text-center ${isDark ? "bg-orange-900/20" : "bg-orange-50"}`}>
                  <span className={`text-2xl font-extrabold ${isDark ? "text-orange-400" : "text-orange-600"}`}>
                    {selectedFood.calories}
                  </span>
                  <p className="text-xs font-bold text-orange-400 mt-1">kcal</p>
                </div>
                <div className={`flex-1 rounded-2xl p-4 text-center ${isDark ? "bg-green-900/20" : "bg-green-50"}`}>
                  <span className={`text-2xl font-extrabold ${isDark ? "text-green-400" : "text-green-600"}`}>
                    Rs. {selectedFood.price}
                  </span>
                  <p className="text-xs font-bold text-green-400 mt-1">Price</p>
                </div>
              </div>

              {/* Macros */}
              {(selectedFood.protein != null || selectedFood.carbs != null || selectedFood.fats != null) && (
                <div>
                  <h4 className={`text-sm font-bold mb-3 ${subtext}`}>MACRONUTRIENTS</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className={`rounded-xl p-3 text-center ${isDark ? "bg-blue-900/20" : "bg-blue-50"}`}>
                      <span className={`text-lg font-extrabold ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                        {selectedFood.protein ?? 0}g
                      </span>
                      <p className="text-xs font-bold text-blue-400 mt-0.5">Protein</p>
                    </div>
                    <div className={`rounded-xl p-3 text-center ${isDark ? "bg-amber-900/20" : "bg-amber-50"}`}>
                      <span className={`text-lg font-extrabold ${isDark ? "text-amber-400" : "text-amber-600"}`}>
                        {selectedFood.carbs ?? 0}g
                      </span>
                      <p className="text-xs font-bold text-amber-400 mt-0.5">Carbs</p>
                    </div>
                    <div className={`rounded-xl p-3 text-center ${isDark ? "bg-rose-900/20" : "bg-rose-50"}`}>
                      <span className={`text-lg font-extrabold ${isDark ? "text-rose-400" : "text-rose-600"}`}>
                        {selectedFood.fats ?? 0}g
                      </span>
                      <p className="text-xs font-bold text-rose-400 mt-0.5">Fats</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Micros */}
              {selectedFood.micros && Object.values(selectedFood.micros).some((v) => v && v > 0) && (
                <div>
                  <h4 className={`text-sm font-bold mb-3 ${subtext}`}>MICRONUTRIENTS</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: "iron", label: "Iron", unit: "mg", icon: "🩸" },
                      { key: "calcium", label: "Calcium", unit: "mg", icon: "🦴" },
                      { key: "vitamin_c", label: "Vitamin C", unit: "mg", icon: "🍊" },
                      { key: "fiber", label: "Fiber", unit: "g", icon: "🌾" },
                      { key: "sugar", label: "Sugar", unit: "g", icon: "🍬" },
                      { key: "sodium", label: "Sodium", unit: "mg", icon: "🧂" },
                    ]
                      .filter((m) => (selectedFood.micros as any)?.[m.key] > 0)
                      .map((m) => (
                        <div
                          key={m.key}
                          className={`flex items-center gap-2 rounded-xl px-3 py-2.5 ${isDark ? "bg-neutral-800" : "bg-neutral-50"}`}
                        >
                          <span className="text-lg">{m.icon}</span>
                          <div>
                            <span className={`font-bold text-sm ${isDark ? "text-neutral-200" : "text-neutral-800"}`}>
                              {(selectedFood.micros as any)[m.key]} {m.unit}
                            </span>
                            <p className={`text-xs font-medium ${subtext}`}>{m.label}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector + Log Button */}
              <div className="flex items-center gap-4 pt-2">
                <div className={`flex items-center rounded-xl overflow-hidden ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`}>
                  <button
                    onClick={() => setLogQty((q) => Math.max(1, q - 1))}
                    className={`w-10 h-10 flex items-center justify-center transition-colors font-bold text-lg ${isDark ? "text-neutral-400 hover:bg-neutral-700" : "text-neutral-600 hover:bg-neutral-200"}`}
                  >
                    −
                  </button>
                  <span className={`w-10 text-center font-extrabold text-lg ${heading}`}>
                    {logQty}
                  </span>
                  <button
                    onClick={() => setLogQty((q) => q + 1)}
                    className={`w-10 h-10 flex items-center justify-center transition-colors font-bold text-lg ${isDark ? "text-neutral-400 hover:bg-neutral-700" : "text-neutral-600 hover:bg-neutral-200"}`}
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => {
                    onLog(selectedFood, logQty);
                    toast.success(`Logged ${logQty}x ${selectedFood.food_name}`);
                    setSelectedFood(null);
                  }}
                  className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 active:scale-[0.98] transition-all shadow-md shadow-green-600/25 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-xl">add</span>
                  Log {logQty} portion{logQty > 1 ? "s" : ""} •{" "}
                  {selectedFood.calories * logQty} kcal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inline keyframe for modal animation */}
      <style>{`
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default FoodLibrary;
