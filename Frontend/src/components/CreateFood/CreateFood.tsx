import React, { useState, useEffect, useRef } from "react";
import { isAxiosError } from "axios";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

import type { Ingredient, AddedItem, Props } from "./types";
import CreateFoodHeader from "./CreateFoodHeader";
import IngredientSearch from "./IngredientSearch";
import AddedIngredientsList from "./AddedIngredientsList";
import RecipeSummary from "./RecipeSummary";
import RecipeDetailsForm from "./RecipeDetailsForm";
import VoiceTraining from "./VoiceTraining";

const CreateFood: React.FC<Props> = ({ onFoodCreated }) => {
  const { isDark } = useTheme();

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
  const [qty, setQty] = useState<number>(100);
  const [addedList, setAddedList] = useState<AddedItem[]>([]);

  const [textAliases, setTextAliases] = useState<string[]>(["", "", ""]);
  const [voiceAliases, setVoiceAliases] = useState<string[]>(["", "", ""]);
  const [activeMicIndex, setActiveMicIndex] = useState<number | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Theme helpers
  const card = isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100";

  useEffect(() => {
    const loadCookedFoods = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        if (!userInfo.token) return;

        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };

        const foodRes = await axios.get("/api/foods", config);

        const existingFoods = foodRes.data.map((f: any) => ({
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
        }));

        setCookedFoodOptions(existingFoods);
      } catch (err) {
        console.error("Failed to load foods");
      }
    };
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
    recognition.lang = "ne-NP";
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

  const totalProtein = addedList.reduce((sum, item) => sum + calculateMacro(item, "protein"), 0);
  const totalCarbs = addedList.reduce((sum, item) => sum + calculateMacro(item, "carbs"), 0);
  const totalFats = addedList.reduce((sum, item) => sum + calculateMacro(item, "fats"), 0);
  const totalIron = addedList.reduce((sum, item) => sum + calculateMacro(item, "iron"), 0);
  const totalCalcium = addedList.reduce((sum, item) => sum + calculateMacro(item, "calcium"), 0);
  const totalVitaminC = addedList.reduce((sum, item) => sum + calculateMacro(item, "vitaminC"), 0);
  const totalFiber = addedList.reduce((sum, item) => sum + calculateMacro(item, "fiber"), 0);
  const totalSugar = addedList.reduce((sum, item) => sum + calculateMacro(item, "sugar"), 0);
  const totalSodium = addedList.reduce((sum, item) => sum + calculateMacro(item, "sodium"), 0);

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
        keywords: keywords,
        micros: {
          iron: totalIron,
          calcium: totalCalcium,
          vitaminC: totalVitaminC,
          fiber: totalFiber,
          sugar: totalSugar,
          sodium: totalSodium,
        },
      };

      await axios.post("/api/foods/custom", newFood, config);

      toast.success(`✅ Recipe Saved!`);
      onFoodCreated();
      navigate("/menu");
    } catch (err) {
      console.error("Failed to save food", err);
      toast.error("Failed to save food. Check console for details.");
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-20 md:pb-0">
      <CreateFoodHeader />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT: Search & Add */}
        <div className="space-y-6">
          <div className={`rounded-2xl p-6 md:p-8 border shadow-sm ${card}`}>
            <h3 className={`text-xl font-bold mb-6 ${isDark ? "text-white" : "text-neutral-900"}`}>
              1. Build Your Plate
            </h3>

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
        </div>

        {/* RIGHT: Details & Voice */}
        <form onSubmit={saveRecipe} className="space-y-6">
          <div className={`rounded-2xl border p-6 shadow-sm md:p-8 ${card}`}>
            <RecipeSummary 
              totalCalories={totalCalories}
              totalPrice={totalPrice}
            />

            <h3 className={`mb-5 mt-8 text-xl font-bold ${isDark ? "text-white" : "text-neutral-900"}`}>
              2. Details & Voice Mapping
            </h3>

            <RecipeDetailsForm 
              recipeName={recipeName}
              setRecipeName={setRecipeName}
              category={category}
              setCategory={setCategory}
            />

            <VoiceTraining 
              textAliases={textAliases}
              updateTextAlias={updateTextAlias}
              voiceAliases={voiceAliases}
              activeMicIndex={activeMicIndex}
              recordAlias={recordAlias}
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={addedList.length === 0}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-5 text-lg font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-green-700 hover:shadow-xl active:translate-y-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-neutral-400 disabled:opacity-60 disabled:shadow-none"
            >
              <span className="material-symbols-outlined text-2xl">restaurant</span>
              Save Custom Food
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFood;
