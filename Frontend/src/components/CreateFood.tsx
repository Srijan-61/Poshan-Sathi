import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// --- Types ---
interface Ingredient {
  _id: string;
  name: string;
  calories: number;
  price: number;
  type: "raw" | "cooked";
  protein?: number;
  carbs?: number;
  fats?: number;
  micros?: {
    iron?: number;
    calcium?: number;
    vitaminC?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
}

interface AddedItem {
  ingredient: Ingredient;
  quantity: number; // Raw = grams, Cooked = units
  cals: number;
  cost: number;
}

interface Props {
  onFoodCreated: () => void;
}

// Global type for Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const CreateFood: React.FC<Props> = ({ onFoodCreated }) => {
  // Data States
  const [allOptions, setAllOptions] = useState<Ingredient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Ingredient[]>([]);
  const [selectedItem, setSelectedItem] = useState<Ingredient | null>(null);

  // Recipe States
  const [recipeName, setRecipeName] = useState("");
  const [category, setCategory] = useState("Meals");
  const [qty, setQty] = useState<number>(100);
  const [addedList, setAddedList] = useState<AddedItem[]>([]);

  // Alias States
  const [textAliases, setTextAliases] = useState<string[]>(["", "", ""]);
  const [voiceAliases, setVoiceAliases] = useState<string[]>(["", "", ""]);
  const [activeMicIndex, setActiveMicIndex] = useState<number | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // 1. Fetch Ingredients and Existing Foods
  useEffect(() => {
    const loadData = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        if (!userInfo.token) return;

        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };

        const [ingRes, foodRes] = await Promise.all([
          axios.get("http://localhost:5000/api/ingredients", config),
          axios.get("http://localhost:5000/api/foods", config),
        ]);

        const rawIngredients = ingRes.data.map((i: any) => ({
          ...i,
          type: "raw",
        }));

        const existingFoods = foodRes.data.map((f: any) => ({
          _id: f._id,
          name: f.food_name,
          price: f.price,
          calories: f.calories,
          type: "cooked",
          protein: f.protein,
          carbs: f.carbs,
          fats: f.fats,
          micros: f.micros,
        }));

        setAllOptions([...rawIngredients, ...existingFoods]);
      } catch (err) {
        console.error("Failed to load ingredients");
      }
    };
    loadData();
  }, []);

  // 2. Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. Search Logic
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }
    const results = allOptions.filter((opt) =>
      opt.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setSearchResults(results.slice(0, 10)); // Limit to top 10 results
  }, [searchTerm, allOptions]);

  // 4. Voice Recording Logic
  const recordAlias = (index: number) => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Use Chrome for Voice Features");

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;

    recognition.onstart = () => setActiveMicIndex(index);
    recognition.onend = () => setActiveMicIndex(null);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      const cleanText = transcript.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");

      const newVoiceAliases = [...voiceAliases];
      newVoiceAliases[index] = cleanText;
      setVoiceAliases(newVoiceAliases);
    };

    recognition.start();
  };

  const updateTextAlias = (index: number, val: string) => {
    const newAliases = [...textAliases];
    newAliases[index] = val;
    setTextAliases(newAliases);
  };

  // 5. Select & Add Items
  const selectItem = (item: Ingredient) => {
    setSelectedItem(item);
    setSearchTerm(item.name);
    setSearchResults([]);

    // Smart Default Quantity: Cooked = 1 unit, Raw = 100g
    if (item.type === "cooked") {
      setQty(1);
    } else {
      setQty(100);
    }
  };

  const addItemToRecipe = () => {
    if (!selectedItem) return;

    // Logic: Raw = per 100g, Cooked = per 1 unit
    let ratio = selectedItem.type === "raw" ? qty / 100 : qty;

    setAddedList([
      ...addedList,
      {
        ingredient: selectedItem,
        qty: qty,
        cals: Math.round(selectedItem.calories * ratio),
        cost: Math.round(selectedItem.price * ratio),
      },
    ]);

    setSearchTerm("");
    setSelectedItem(null);
    setQty(100);
  };

  // 6. Calculate Totals Automatically
  const totalCalories = addedList.reduce((sum, item) => sum + item.cals, 0);
  const totalPrice = addedList.reduce((sum, item) => sum + item.cost, 0);

  // Ratios for macros based on raw vs cooked
  const calculateMacro = (
    item: AddedItem,
    macroName:
      | "protein"
      | "carbs"
      | "fats"
      | "iron"
      | "calcium"
      | "vitaminC"
      | "fiber"
      | "sugar"
      | "sodium",
  ) => {
    let ratio = item.ingredient.type === "raw" ? item.qty / 100 : item.qty;
    let baseValue = 0;

    if (
      macroName === "protein" ||
      macroName === "carbs" ||
      macroName === "fats"
    ) {
      baseValue = item.ingredient[macroName] || 0;
    } else {
      baseValue = item.ingredient.micros?.[macroName] || 0;
    }

    return baseValue * ratio;
  };

  const totalProtein = addedList.reduce(
    (sum, item) => sum + calculateMacro(item, "protein"),
    0,
  );
  const totalCarbs = addedList.reduce(
    (sum, item) => sum + calculateMacro(item, "carbs"),
    0,
  );
  const totalFats = addedList.reduce(
    (sum, item) => sum + calculateMacro(item, "fats"),
    0,
  );

  const totalIron = addedList.reduce(
    (sum, item) => sum + calculateMacro(item, "iron"),
    0,
  );
  const totalCalcium = addedList.reduce(
    (sum, item) => sum + calculateMacro(item, "calcium"),
    0,
  );
  const totalVitaminC = addedList.reduce(
    (sum, item) => sum + calculateMacro(item, "vitaminC"),
    0,
  );
  const totalFiber = addedList.reduce(
    (sum, item) => sum + calculateMacro(item, "fiber"),
    0,
  );
  const totalSugar = addedList.reduce(
    (sum, item) => sum + calculateMacro(item, "sugar"),
    0,
  );
  const totalSodium = addedList.reduce(
    (sum, item) => sum + calculateMacro(item, "sodium"),
    0,
  );

  // 7. Save Custom Food
  const saveRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addedList.length === 0)
      return alert("Please add at least one ingredient!");
    if (!recipeName.trim()) return alert("Please give your food a name!");

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      // Compile keywords for the backend search
      const keywords = [recipeName.toLowerCase()];
      addedList.forEach((i) => keywords.push(i.ingredient.name.toLowerCase()));
      textAliases.forEach((a) => {
        if (a.trim()) keywords.push(a.trim().toLowerCase());
      });
      voiceAliases.forEach((a) => {
        if (a.trim()) keywords.push(a.trim().toLowerCase());
      });

      const newFood = {
        food_name: recipeName,
        calories: totalCalories,
        price: totalPrice,
        protein: totalProtein,
        carbs: totalCarbs,
        fats: totalFats,
        category: category,
        keywords: keywords, // Sending compiled keywords
        micros: {
          iron: totalIron,
          calcium: totalCalcium,
          vitaminC: totalVitaminC,
          fiber: totalFiber,
          sugar: totalSugar,
          sodium: totalSodium,
        },
      };

      await axios.post(
        "http://localhost:5000/api/custom-food",
        newFood,
        config,
      );

      alert(`✅ Recipe Saved!`);
      onFoodCreated();
      navigate("/menu");
    } catch (err) {
      console.error("Failed to save food", err);
      alert("Failed to save food. Check console for details.");
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-20 md:pb-0">
      {/* Header */}
      <section className="flex flex-col gap-2 pt-2">
        <h1 className="text-gray-900 text-3xl md:text-4xl font-extrabold tracking-tight">
          Customize Food
        </h1>
        <p className="text-gray-500 text-lg font-medium">
          Create custom foods and map voice aliases to them.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: Search & Add Ingredients */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              1. Build Your Plate
            </h3>

            <div className="flex gap-2 mb-6" ref={dropdownRef}>
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                  placeholder="Search ingredients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl mt-1 z-10 max-h-60 overflow-y-auto">
                    {searchResults.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => selectItem(item)}
                        className="p-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-0 flex justify-between items-center"
                      >
                        <span className="font-bold text-gray-900">
                          {item.name}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full uppercase font-bold">
                          {item.type}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-2">
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(parseFloat(e.target.value))}
                  className="w-16 bg-transparent text-center font-bold text-gray-900 outline-none"
                />
                <span className="text-xs text-gray-500 font-bold pr-2 uppercase">
                  {selectedItem?.type === "cooked" ? "unit" : "g"}
                </span>
              </div>

              <button
                type="button"
                onClick={addItemToRecipe}
                disabled={!selectedItem}
                className="bg-green-600 disabled:bg-gray-300 text-white px-4 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center shadow-sm"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>

            {/* Added List */}
            <div className="mt-8">
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
                Current Recipe
              </h4>
              {addedList.length === 0 ? (
                <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm font-medium">
                  Your pot is empty! Add ingredients from the search above.
                </div>
              ) : (
                <ul className="space-y-3">
                  {addedList.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-auto px-2 h-10 bg-white rounded-lg flex items-center justify-center text-green-600 border border-gray-100 font-bold shadow-sm">
                          {item.qty}
                          {item.ingredient.type === "cooked" ? "x" : "g"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {item.ingredient.name}
                          </p>
                          <p className="text-xs font-bold text-orange-500">
                            {item.cals} kcal
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newList = [...addedList];
                          newList.splice(index, 1);
                          setAddedList(newList);
                        }}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          delete
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Details & Voice Mapping */}
        <form onSubmit={saveRecipe} className="space-y-6">
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              2. Details & Voice Mapping
            </h3>

            {/* Live Totals Display */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl">
                <p className="text-xs font-bold text-orange-600 uppercase tracking-wide">
                  Total Calories
                </p>
                <p className="text-2xl font-extrabold text-orange-600 mt-1">
                  {Math.round(totalCalories)}{" "}
                  <span className="text-sm font-medium">kcal</span>
                </p>
              </div>
              <div className="bg-green-50 border border-green-100 p-4 rounded-xl">
                <p className="text-xs font-bold text-green-700 uppercase tracking-wide">
                  Estimated Cost
                </p>
                <p className="text-2xl font-extrabold text-green-700 mt-1">
                  <span className="text-sm font-medium">Rs.</span>{" "}
                  {Math.round(totalPrice)}
                </p>
              </div>
            </div>

            {/* Form Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Food Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-gray-900"
                  placeholder="e.g. Srijan's Special Dal Bhat"
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Category
                </label>
                <select
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-gray-900 appearance-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Meals">Meals</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Drinks">Drinks</option>
                  <option value="Desserts">Desserts</option>
                </select>
              </div>
            </div>

            {/* --- CUSTOM ALIASES SECTION --- */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex justify-between items-end mb-4">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Voice Training
                </label>
                <span className="bg-orange-50 text-orange-500 text-xs font-bold px-2 py-1 rounded">
                  Recommended: 3+
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Text Aliases */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      keyboard
                    </span>{" "}
                    Type Nicknames
                  </label>
                  <div className="space-y-2">
                    {textAliases.map((alias, i) => (
                      <input
                        key={i}
                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:ring-2 focus:ring-green-500 outline-none"
                        placeholder={`Alias ${i + 1} (e.g. Gym Food)`}
                        value={alias}
                        onChange={(e) => updateTextAlias(i, e.target.value)}
                      />
                    ))}
                  </div>
                </div>

                {/* Voice Aliases */}
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <label className="text-xs font-bold text-green-700 uppercase tracking-wide mb-3 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      mic
                    </span>{" "}
                    Speak Nicknames
                  </label>
                  <div className="space-y-2">
                    {voiceAliases.map((alias, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          readOnly
                          className="w-full p-2.5 border border-green-200 rounded-lg text-sm font-bold bg-white text-gray-900"
                          placeholder={
                            activeMicIndex === i
                              ? "Listening..."
                              : "Tap mic to record ->"
                          }
                          value={alias}
                        />
                        <button
                          type="button"
                          onClick={() => recordAlias(i)}
                          className={`p-2.5 rounded-lg transition-colors flex items-center justify-center shadow-sm ${
                            activeMicIndex === i
                              ? "bg-red-500 text-white animate-pulse"
                              : "bg-white border border-green-200 text-green-600 hover:bg-green-100"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            mic
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={addedList.length === 0}
              className="w-full py-4 mt-8 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 shadow-md"
            >
              <span className="material-symbols-outlined">restaurant</span>
              Save Custom Food
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFood;
