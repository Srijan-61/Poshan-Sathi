import React from "react";
import type { ProfileData } from "./types";

interface Props {
  profile: ProfileData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSave: (e: React.FormEvent) => void;
  isSaving: boolean;
}

export default function ProfileForm({ profile, handleChange, handleSave, isSaving }: Props) {
  const t = {
    card: "bg-white border-neutral-100 shadow-sm",
    heading: "text-neutral-900",
    label: "text-neutral-500",
    input: "bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-blue-500",
    select: "bg-neutral-50 border-neutral-200 text-neutral-900",
    saveBtn: "bg-green-600 hover:bg-green-700 text-white",
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      {/* Personal Details Card */}
      <div className={`rounded-3xl p-6 border transition-colors duration-300 flex flex-col gap-4 ${t.card}`}>
        <h3 className={`font-bold text-lg flex items-center gap-2 mb-2 ${t.heading}`}>
          <span className="material-symbols-outlined text-blue-500">person</span>
          Personal Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className={`text-xs font-bold uppercase tracking-wider ${t.label}`}>Name</label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              className={`border rounded-xl p-3 font-medium focus:outline-none transition-colors ${t.input}`}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={`text-xs font-bold uppercase tracking-wider ${t.label}`}>Age</label>
            <input
              type="number"
              name="age"
              value={profile.age}
              onChange={handleChange}
              className={`border rounded-xl p-3 font-medium focus:outline-none transition-colors ${t.input}`}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={`text-xs font-bold uppercase tracking-wider ${t.label}`}>Gender</label>
            <select
              name="gender"
              value={profile.gender}
              onChange={handleChange}
              className={`border rounded-xl p-3 font-medium focus:outline-none transition-colors ${t.select}`}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className={`text-xs font-bold uppercase tracking-wider ${t.label}`}>
              Monthly Budget (Rs)
            </label>
            <input
              type="number"
              name="monthlyBudget"
              value={profile.monthlyBudget}
              onChange={handleChange}
              className={`border rounded-xl p-3 font-medium focus:outline-none transition-colors ${t.input}`}
            />
          </div>
        </div>
      </div>

      {/* Body Metrics & Goals Card */}
      <div className={`rounded-3xl p-6 border transition-colors duration-300 flex flex-col gap-4 ${t.card}`}>
        <h3 className={`font-bold text-lg flex items-center gap-2 mb-2 ${t.heading}`}>
          <span className="material-symbols-outlined text-orange-500">monitor_weight</span>
          Body Metrics & Goals
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className={`text-xs font-bold uppercase tracking-wider ${t.label}`}>Weight (kg)</label>
            <input
              type="number"
              name="weight"
              value={profile.weight}
              onChange={handleChange}
              className={`border rounded-xl p-3 font-medium focus:outline-none transition-colors ${t.input}`}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={`text-xs font-bold uppercase tracking-wider ${t.label}`}>Height (cm)</label>
            <input
              type="number"
              name="height"
              value={profile.height}
              onChange={handleChange}
              className={`border rounded-xl p-3 font-medium focus:outline-none transition-colors ${t.input}`}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={`text-xs font-bold uppercase tracking-wider ${t.label}`}>Primary Goal</label>
            <select
              name="primaryGoal"
              value={profile.healthGoals.primaryGoal}
              onChange={handleChange}
              className={`border rounded-xl p-3 font-medium focus:outline-none transition-colors ${t.select}`}
            >
              <option value="weightLoss">Weight Loss</option>
              <option value="maintainWeight">Maintain Weight</option>
              <option value="muscleGain">Muscle Gain</option>
              <option value="weightGain">Weight Gain</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className={`text-xs font-bold uppercase tracking-wider ${t.label}`}>Activity Level</label>
            <select
              name="activityLevel"
              value={profile.activityLevel}
              onChange={handleChange}
              className={`border rounded-xl p-3 font-medium focus:outline-none transition-colors ${t.select}`}
            >
              <option value="sedentary">Sedentary (Little/No Exercise)</option>
              <option value="lightlyActive">Lightly Active (1-3 days/week)</option>
              <option value="moderatelyActive">Moderately Active (3-5 days/week)</option>
              <option value="veryActive">Very Active (6-7 days/week)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Health & Diet Card */}
      <div className={`rounded-3xl p-6 border transition-colors duration-300 flex flex-col gap-4 ${t.card}`}>
        <h3 className={`font-bold text-lg flex items-center gap-2 mb-2 ${t.heading}`}>
          <span className="material-symbols-outlined text-green-500">health_and_safety</span>
          Health & Diet
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className={`text-xs font-bold uppercase tracking-wider ${t.label}`}>Diet Type</label>
            <select
              name="dietType"
              value={profile.dietType}
              onChange={handleChange}
              className={`border rounded-xl p-3 font-medium focus:outline-none transition-colors ${t.select}`}
            >
              <option value="nonVegetarian">Non-Vegetarian</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="eggetarian">Eggetarian</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className={`text-xs font-bold uppercase tracking-wider ${t.label}`}>Health Condition</label>
            <select
              name="healthConditions"
              value={profile.healthConditions[0] || "none"}
              onChange={handleChange}
              className={`border rounded-xl p-3 font-medium focus:outline-none transition-colors ${t.select}`}
            >
              <option value="none">None</option>
              <option value="diabetes">Diabetes / Pre-Diabetes</option>
              <option value="hypertension">Hypertension (Blood Pressure)</option>
              <option value="anemia">Anemia (Iron Deficiency)</option>
              <option value="heartDisease">Heart Disease</option>
              <option value="cholesterol">High Cholesterol</option>
              <option value="kidneyDisease">Kidney Disease</option>
              <option value="gastritis">Gastritis</option>
            </select>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className={`w-full font-bold py-4 rounded-xl shadow-md transition-colors disabled:opacity-50 ${t.saveBtn}`}
      >
        {isSaving ? "Saving & Recalculating..." : "Save Profile & Update Targets"}
      </button>
    </form>
  );
}
