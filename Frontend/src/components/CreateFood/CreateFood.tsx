import React, { useState, useEffect, useRef } from "react";
import { isAxiosError } from "axios";
import axios from "../../utils/axios";
import toast from "react-hot-toast";

import type { Ingredient, AddedItem, Props } from "./types";
import CreateFoodHeader from "./CreateFoodHeader";
import IngredientSearch from "./IngredientSearch";
import AddedIngredientsList from "./AddedIngredientsList";
import RecipeSummary from "./RecipeSummary";
import RecipeDetailsForm from "./RecipeDetailsForm";
import VoiceTraining from "./VoiceTraining";

const CreateFood: React.FC<Props> = ({ onFoodCreated }) => {
  /** Saved foods from our DB (shown as "cooked" / recipe rows in search). */
  const [cookedFoodOptions, setCookedFoodOptions] = useState<Ingredient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Ingredient[]>([]);
  const [selectedItem, setSelectedItem] = useState<Ingredient | null>(null);
  /** When true, backend also queries Edamam even if local already has ≥3 matches. */
  const [forceGlobal, setForceGlobal] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const [recipeName, setRecipeName] = useState("");
  const [category, setCategory] = useState("Meals");
  const [customPrice, setCustomPrice] = useState<number | "">("");
  const [qty, setQty] = useState<number>(100);
  const [addedList, setAddedList] = useState<AddedItem[]>([]);

  const [textAliases, setTextAliases] = useState<string[]>(["", "", ""]);
  const [voiceAliases, setVoiceAliases] = useState<string[]>(["", "", ""]);
  const [activeMicIndex, setActiveMicIndex] = useState<number | null>(null);
  /** Raw Devanagari transcript from the last voice recognition event */
  const [recognizedVoiceText, setRecognizedVoiceText] = useState<string>("");
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [myCustomFoods, setMyCustomFoods] = useState<Ingredient[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Theme helpers
  // Standardized on Light Mode only designs
  const card = "bg-white border-neutral-100";

  const loadCookedFoods = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      if (!userInfo.token) return;

      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };

      const foodRes = await axios.get("/api/foods", config);
      const data = Array.isArray(foodRes.data)
        ? foodRes.data
        : foodRes.data.foods || [];

      const allFoods = data.map((f: any) => ({
        _id: f._id,
        name: f.food_name,
        price: f.price,
        calories: f.calories,
        type: "cooked" as const,
        source: "recipe" as const,
        protein: f.protein,
        carbs: f.carbs,
        fats: f.fats,
        micros: f.micros,
        owner: f.owner,
        ingredients: f.ingredients,
        category: f.category,
      }));

      setCookedFoodOptions(allFoods);

      // Filter for foods owned by this user
      const myId = userInfo._id || userInfo.id;
      const myFoods = allFoods.filter((f: any) => f.owner === myId);
      setMyCustomFoods(myFoods);
    } catch (err) {
      console.error("Failed to load foods");
    }
  };

  useEffect(() => {
    loadCookedFoods();
  }, []);

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

  useEffect(() => {
    setForceGlobal(false);
  }, [searchTerm]);

  useEffect(() => {
    const q = searchTerm.trim();
    if (q === "") {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    const ac = new AbortController();
    const t = window.setTimeout(async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        if (!userInfo.token) return;

        setSearchLoading(true);
        const res = await axios.get("/api/ingredients/search-nutrition", {
          params: {
            q,
            includeGlobal: forceGlobal ? "true" : "false",
          },
          signal: ac.signal,
        });

        const rows: Ingredient[] = Array.isArray(res.data?.data)
          ? res.data.data
          : [];

        const qLower = q.toLowerCase();
        const cookedMatches = cookedFoodOptions
          .filter((opt) => opt.name.toLowerCase().includes(qLower))
          .slice(0, 5)
          .map((opt) => ({ ...opt, source: "recipe" as const }));

        // Backend already returns locals before Edamam; append saved recipes after.
        setSearchResults([...rows, ...cookedMatches].slice(0, 20));
      } catch (err: unknown) {
        if (isAxiosError(err) && err.code === "ERR_CANCELED") return;
        console.error("Ingredient search failed", err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(t);
      ac.abort();
    };
  }, [searchTerm, cookedFoodOptions, forceGlobal]);

  const recordAlias = (index: number) => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return toast.error("Use Chrome for Voice Features");

    const recognition = new SpeechRecognition();
    recognition.lang = "ne-NP"; // Nepali — outputs Devanagari script
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setActiveMicIndex(index);
      setRecognizedVoiceText("");
    };
    recognition.onend = () => setActiveMicIndex(null);

    recognition.onresult = (event: any) => {
      // Keep raw Devanagari transcript — do NOT lowercase (Devanagari has no case)
      const transcript = event.results[0][0].transcript.trim();
      // Strip only Latin punctuation; preserve Devanagari characters fully
      const cleanText = transcript
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
        .trim();

      setRecognizedVoiceText(cleanText);

      const newVoiceAliases = [...voiceAliases];
      newVoiceAliases[index] = cleanText;
      setVoiceAliases(newVoiceAliases);

      toast.success(`🎤 Recognized: ${cleanText}`);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "no-speech") {
        toast.error("No speech detected. Try again.");
      } else {
        toast.error(`Voice error: ${event.error}`);
      }
    };

    recognition.start();
  };

  const updateTextAlias = (index: number, val: string) => {
    const newAliases = [...textAliases];
    newAliases[index] = val;
    setTextAliases(newAliases);
  };

  const selectItem = (item: Ingredient) => {
    setSelectedItem(item);
    setSearchTerm(item.name);
    setSearchResults([]);
    if (item.type === "cooked") {
      setQty(1);
    } else {
      setQty(100);
    }
  };

  const addItemToRecipe = () => {
    if (!selectedItem) return;
    const ratio = selectedItem.type === "raw" ? qty / 100 : qty;
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

  const handleEdit = (food: Ingredient) => {
    setEditingFoodId(food._id);
    setRecipeName(food.name);
    setCategory(food.category || "Meals");
    setCustomPrice(food.price);

    if (food.ingredients && food.ingredients.length > 0) {
      setAddedList(food.ingredients);
    } else {
      // Fallback for older foods without ingredients array
      setAddedList([
        {
          ingredient: food,
          qty: 1,
          cals: food.calories,
          cost: food.price,
        },
      ]);
    }

    // Scroll to top of build section
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.success(`Editing: ${food.name}`);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      await axios.delete(`/api/foods/custom/${id}`, config);
      toast.success("Food deleted");

      // Refresh lists
      const filteredCooked = cookedFoodOptions.filter((f) => f._id !== id);
      setCookedFoodOptions(filteredCooked);
      setMyCustomFoods(myCustomFoods.filter((f) => f._id !== id));

      if (editingFoodId === id) cancelEdit();
    } catch (err) {
      toast.error("Failed to delete food");
    }
  };

  const resetForm = () => {
    setEditingFoodId(null);
    setRecipeName("");
    setCategory("Meals");
    setCustomPrice("");
    setAddedList([]);
    setSearchTerm("");
    setSelectedItem(null);
    setQty(100);
    setTextAliases(["", "", ""]);
    setVoiceAliases(["", "", ""]);
    setRecognizedVoiceText("");
  };

  const cancelEdit = () => {
    resetForm();
  };

  const totalCalories = addedList.reduce((sum, item) => sum + item.cals, 0);
  const totalPrice = addedList.reduce((sum, item) => sum + item.cost, 0);

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
    const ratio = item.ingredient.type === "raw" ? item.qty / 100 : item.qty;
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

  const saveRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addedList.length === 0)
      return toast.error("Please add at least one ingredient!");
    if (!recipeName.trim()) return toast.error("Please give your food a name!");

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      const keywords = [recipeName.toLowerCase()];
      addedList.forEach((i) => keywords.push(i.ingredient.name.toLowerCase()));
      textAliases.forEach((a) => {
        if (a.trim()) {
          keywords.push(a.trim());
          const lower = a.trim().toLowerCase();
          if (lower !== a.trim() && !keywords.includes(lower))
            keywords.push(lower);
        }
      });
      voiceAliases.forEach((a) => {
        if (a.trim()) {
          keywords.push(a.trim());
        }
      });

      const newFood = {
        food_name: recipeName,
        calories: totalCalories,
        price: customPrice !== "" ? customPrice : totalPrice,
        protein: totalProtein,
        carbs: totalCarbs,
        fats: totalFats,
        category: category,
        keywords: keywords,
        ingredients: addedList,
        micros: {
          iron: totalIron,
          calcium: totalCalcium,
          vitaminC: totalVitaminC,
          fiber: totalFiber,
          sugar: totalSugar,
          sodium: totalSodium,
        },
      };

      if (editingFoodId) {
        await axios.put(`/api/foods/custom/${editingFoodId}`, newFood, config);
        toast.success(`✅ Recipe Updated!`);
      } else {
        await axios.post("/api/foods/custom", newFood, config);
        toast.success(`✅ Recipe Saved!`);
      }

      resetForm();
      if (onFoodCreated) onFoodCreated();
      loadCookedFoods(); // Refresh the list at the bottom
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Failed to save food", err);
      toast.error("Failed to save food. Check console for details.");
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-24 md:pb-12 max-w-3xl mx-auto">
      <CreateFoodHeader />

      <div className="flex flex-col gap-10">
        {/* SECTION 1: Build Your Plate */}
        <div className={`rounded-3xl p-6 md:p-10 border shadow-sm ${card}`}>
          <div className="flex items-center gap-3 mb-8">
            <span className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-black text-lg">
              1
            </span>
            <h3 className="text-2xl font-black text-neutral-900 tracking-tight">
              Build Your Plate
            </h3>
          </div>

          <IngredientSearch
            dropdownRef={dropdownRef}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchResults={searchResults}
            searchLoading={searchLoading}
            forceGlobal={forceGlobal}
            setForceGlobal={setForceGlobal}
            qty={qty}
            setQty={setQty}
            selectedItem={selectedItem}
            selectItem={selectItem}
            addItemToRecipe={addItemToRecipe}
          />

          <AddedIngredientsList
            addedList={addedList}
            setAddedList={setAddedList}
          />
        </div>

        {/* SECTION 2: Details & Voice Mapping */}
        <form onSubmit={saveRecipe} className="flex flex-col gap-10">
          <div className={`rounded-3xl border p-6 shadow-sm md:p-10 ${card}`}>
            <div className="flex items-center gap-3 mb-10">
              <span className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-black text-lg">
                2
              </span>
              <h3 className="text-2xl font-black text-neutral-900 tracking-tight">
                Details & Voice Mapping
              </h3>
            </div>

            {/* Health & Cost Summaries - Moved to Top of Form 2 as per request */}
            <div className="mb-10">
              <RecipeSummary
                totalCalories={totalCalories}
                totalPrice={totalPrice}
              />
            </div>

            <div className="space-y-10">
              <RecipeDetailsForm
                recipeName={recipeName}
                setRecipeName={setRecipeName}
                category={category}
                setCategory={setCategory}
                customPrice={customPrice}
                setCustomPrice={setCustomPrice}
              />

              <div className="pt-6 border-t border-neutral-50">
                <VoiceTraining
                  textAliases={textAliases}
                  updateTextAlias={updateTextAlias}
                  voiceAliases={voiceAliases}
                  activeMicIndex={activeMicIndex}
                  recordAlias={recordAlias}
                  recognizedVoiceText={recognizedVoiceText}
                />
              </div>
            </div>

            {/* Submit Button - Now full-width at the bottom of the card */}
            <div className="flex flex-col gap-4 mt-12">
              <button
                type="submit"
                disabled={addedList.length === 0}
                className={`flex w-full items-center justify-center gap-3 rounded-2xl py-6 text-xl px-8 font-black text-white shadow-lg transition-all active:scale-[0.98] disabled:bg-neutral-300 disabled:shadow-none disabled:cursor-not-allowed group ${
                  editingFoodId
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">
                  {editingFoodId ? "edit" : "restaurant"}
                </span>
                {editingFoodId ? "Update Custom Food" : "Save Custom Food"}
              </button>

              {editingFoodId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-lg px-8 font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-all"
                >
                  Cancel Editing
                </button>
              )}
            </div>
          </div>
        </form>

        {/* SECTION 3: My Custom Foods */}
        {myCustomFoods.length > 0 && (
          <div
            className={`rounded-3xl p-6 md:p-10 border shadow-sm mb-12 ${card}`}
          >
            <div className="flex items-center gap-3 mb-8">
              <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-lg">
                3
              </span>
              <h3 className="text-2xl font-black text-neutral-900 tracking-tight">
                My Custom Foods
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myCustomFoods.map((food) => (
                <div
                  key={food._id}
                  className="p-5 rounded-2xl border border-neutral-100 bg-neutral-50/50 flex flex-col gap-3 group hover:border-blue-200 hover:bg-white transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg text-neutral-900">
                        {food.name}
                      </h4>
                      <p className="text-sm text-neutral-500">
                        {food.calories} kcal • NPR {food.price}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(food)}
                        className="p-2 rounded-xl bg-white border border-neutral-200 text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all"
                        title="Edit Recipe"
                      >
                        <span className="material-symbols-outlined text-xl">
                          edit
                        </span>
                      </button>
                      <button
                        onClick={() => handleDelete(food._id, food.name)}
                        className="p-2 rounded-xl bg-white border border-neutral-200 text-red-600 hover:bg-red-50 hover:border-red-200 transition-all"
                        title="Delete Food"
                      >
                        <span className="material-symbols-outlined text-xl">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateFood;
