import React from "react";
import { useTheme } from "../../context/ThemeContext";

interface RecipeDetailsFormProps {
  recipeName: string;
  setRecipeName: (name: string) => void;
  category: string;
  setCategory: (cat: string) => void;
}

export default function RecipeDetailsForm({
  recipeName,
  setRecipeName,
  category,
  setCategory
}: RecipeDetailsFormProps) {
  const { isDark } = useTheme();
  const subtext = isDark ? "text-neutral-400" : "text-neutral-500";
  const inputCls = isDark
    ? "bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500"
    : "bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400";

  return (
    <div className="space-y-5">
      <div>
        <label className={`mb-2 block text-xs font-bold uppercase tracking-wide ${subtext}`}>
          Food Name
        </label>
        <input
          type="text"
          required
          className={`w-full rounded-xl border p-3.5 font-bold transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/30 focus:outline-none ${inputCls}`}
          placeholder="e.g. Srijan's Special Dal Bhat"
          value={recipeName}
          onChange={(e) => setRecipeName(e.target.value)}
        />
      </div>

      <div>
        <label className={`mb-2 block text-xs font-bold uppercase tracking-wide ${subtext}`}>
          Category
        </label>
        <select
          className={`w-full appearance-none rounded-xl border p-3.5 font-bold transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/30 focus:outline-none ${inputCls}`}
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
  );
}
