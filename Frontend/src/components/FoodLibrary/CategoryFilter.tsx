import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { CATEGORIES } from "./consts";

interface Props {
  activeCategory: string;
  setActiveCategory: (v: string) => void;
}

export default function CategoryFilter({ activeCategory, setActiveCategory }: Props) {
  const { isDark } = useTheme();

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
      {CATEGORIES.map((category) => (
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
  );
}
