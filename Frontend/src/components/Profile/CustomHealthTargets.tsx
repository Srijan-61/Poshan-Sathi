
import { useState } from "react";
import type { CustomHealthTarget } from "./types";

// All nutrients available on the dashboard for monitoring
const AVAILABLE_NUTRIENTS = [
  { key: "sugar", label: "Sugar", unit: "g", defaultType: "max" as const, defaultValue: 30 },
  { key: "sodium", label: "Sodium", unit: "mg", defaultType: "max" as const, defaultValue: 1500 },
  { key: "iron", label: "Iron", unit: "mg", defaultType: "min" as const, defaultValue: 20 },
  { key: "calcium", label: "Calcium", unit: "mg", defaultType: "min" as const, defaultValue: 1000 },
  { key: "fiber", label: "Fiber", unit: "g", defaultType: "min" as const, defaultValue: 25 },
  { key: "protein", label: "Protein", unit: "g", defaultType: "min" as const, defaultValue: 60 },
  { key: "carbs", label: "Carbohydrates", unit: "g", defaultType: "max" as const, defaultValue: 275 },
  { key: "fats", label: "Fats", unit: "g", defaultType: "max" as const, defaultValue: 70 },
  { key: "vitaminC", label: "Vitamin C", unit: "mg", defaultType: "min" as const, defaultValue: 90 },
  { key: "potassium", label: "Potassium", unit: "mg", defaultType: "min" as const, defaultValue: 3500 },
  { key: "magnesium", label: "Magnesium", unit: "mg", defaultType: "min" as const, defaultValue: 400 },
  { key: "zinc", label: "Zinc", unit: "mg", defaultType: "min" as const, defaultValue: 11 },
];

interface Props {
  targets: CustomHealthTarget[];
  onChange: (targets: CustomHealthTarget[]) => void;
}

export default function CustomHealthTargets({ targets, onChange }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [newNutrient, setNewNutrient] = useState(AVAILABLE_NUTRIENTS[0].key);
  const [newType, setNewType] = useState<"min" | "max">("max");
  const [newValue, setNewValue] = useState<number | "">(30);
  const [newLabel, setNewLabel] = useState("");

  const t = {
    card: "bg-white border-neutral-100 shadow-sm",
    heading: "text-neutral-900",
    label: "text-neutral-500",
    input: "bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-blue-500",
    select: "bg-neutral-50 border-neutral-200 text-neutral-900",
  };

  const getNutrientInfo = (key: string) =>
    AVAILABLE_NUTRIENTS.find((n) => n.key === key);

  // When user selects a nutrient from the dropdown, pre-fill sensible defaults
  const handleNutrientSelect = (nutrientKey: string) => {
    setNewNutrient(nutrientKey);
    const info = getNutrientInfo(nutrientKey);
    if (info) {
      setNewType(info.defaultType);
      setNewValue(info.defaultValue);
    }
  };

  const handleAdd = () => {
    if (!newValue || Number(newValue) <= 0) return;

    const info = getNutrientInfo(newNutrient);
    const entry: CustomHealthTarget = {
      nutrient: newNutrient,
      type: newType,
      value: Number(newValue),
      label: newLabel || `${info?.label || newNutrient} (${newType === "max" ? "Maximum" : "Minimum"})`,
    };

    onChange([...targets, entry]);
    setIsAdding(false);
    setNewLabel("");
    setNewValue(30);
  };

  const handleRemove = (index: number) => {
    const updated = targets.filter((_, i) => i !== index);
    onChange(updated);
  };

  const getAccentColor = (type: "min" | "max") =>
    type === "max" ? "border-l-rose-500" : "border-l-emerald-500";

  const getBadgeColor = (type: "min" | "max") =>
    type === "max"
      ? "bg-rose-100 text-rose-700"
      : "bg-emerald-100 text-emerald-700";

  return (
    <div className={`rounded-3xl p-6 border transition-colors duration-300 flex flex-col gap-4 ${t.card}`}>
      <div className="flex items-center justify-between">
        <h3 className={`font-bold text-lg flex items-center gap-2 ${t.heading}`}>
          <span className="material-symbols-outlined text-rose-500">
            monitor_heart
          </span>
          Custom Health Targets
        </h3>
        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            Add Target
          </button>
        )}
      </div>

      <p className={`text-xs ${t.label} -mt-2`}>
        Set custom min/max nutrient limits to monitor on your dashboard. Useful for managing conditions like diabetes, hypertension, anemia, etc.
      </p>

      {/* Existing Targets List */}
      {targets.length > 0 && (
        <div className="flex flex-col gap-3">
          {targets.map((target, index) => {
            const info = getNutrientInfo(target.nutrient);
            return (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-xl border border-l-4 ${getAccentColor(target.type)} bg-white border-neutral-200 shadow-sm transition-all hover:shadow-md`}
              >
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getBadgeColor(target.type)}`}>
                        {target.type === "max" ? "MAX" : "MIN"}
                      </span>
                      <span className="font-bold text-sm text-neutral-800">
                        {info?.label || target.nutrient}
                      </span>
                    </div>
                    {target.label && (
                      <p className="text-xs text-neutral-400">{target.label}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-black text-neutral-900 tabular-nums">
                    {target.value}
                    <span className="text-xs font-bold text-neutral-500 ml-0.5">
                      {info?.unit || ""}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="text-neutral-400 hover:text-rose-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {targets.length === 0 && !isAdding && (
        <div className="text-center py-6 text-neutral-400">
          <span className="material-symbols-outlined text-4xl mb-2 block">
            tune
          </span>
          <p className="text-sm font-medium">No custom targets set</p>
          <p className="text-xs mt-1">Click "Add Target" to monitor a nutrient</p>
        </div>
      )}

      {/* Add New Target Form */}
      {isAdding && (
        <div className="border border-blue-200 bg-blue-50/50 rounded-2xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
          <h4 className="text-sm font-bold text-blue-700 flex items-center gap-1">
            <span className="material-symbols-outlined text-base">add_circle</span>
            New Health Target
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Nutrient Select */}
            <div className="flex flex-col gap-1">
              <label className={`text-xs font-bold uppercase tracking-wider ${t.label}`}>
                Nutrient
              </label>
              <select
                value={newNutrient}
                onChange={(e) => handleNutrientSelect(e.target.value)}
                className={`border rounded-xl p-3 font-medium focus:outline-none transition-colors ${t.select}`}
              >
                {AVAILABLE_NUTRIENTS.map((n) => (
                  <option key={n.key} value={n.key}>
                    {n.label} ({n.unit})
                  </option>
                ))}
              </select>
            </div>

            {/* Min/Max Select */}
            <div className="flex flex-col gap-1">
              <label className={`text-xs font-bold uppercase tracking-wider ${t.label}`}>
                Limit Type
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as "min" | "max")}
                className={`border rounded-xl p-3 font-medium focus:outline-none transition-colors ${t.select}`}
              >
                <option value="max">Maximum (Do not exceed)</option>
                <option value="min">Minimum (Must reach)</option>
              </select>
            </div>

            {/* Value Input */}
            <div className="flex flex-col gap-1">
              <label className={`text-xs font-bold uppercase tracking-wider ${t.label}`}>
                Target Value ({getNutrientInfo(newNutrient)?.unit || ""})
              </label>
              <input
                type="number"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value ? Number(e.target.value) : "")}
                min={0}
                className={`border rounded-xl p-3 font-medium focus:outline-none transition-colors ${t.input}`}
                placeholder="Enter value..."
              />
            </div>

            {/* Label Input (optional) */}
            <div className="flex flex-col gap-1">
              <label className={`text-xs font-bold uppercase tracking-wider ${t.label}`}>
                Label <span className="text-neutral-300">(optional)</span>
              </label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className={`border rounded-xl p-3 font-medium focus:outline-none transition-colors ${t.input}`}
                placeholder="e.g. Diabetes, Anemia..."
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Add Target
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-5 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-bold py-3 rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
