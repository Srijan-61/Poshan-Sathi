import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";

interface ProfileData {
  name: string;
  age: number | "";
  gender: string;
  weight: number | "";
  height: number | "";
  activityLevel: string;
  dietType: string;
  monthlyBudget: number | "";
  healthGoals: {
    primaryGoal: string;
  };
  healthConditions: string[];
  profileImage?: string;
}

interface DailyRequirements {
  calories: number;
  bmr: number;
  tdee: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
  sodium: number;
  iron: number;
  calcium: number;
  vitaminD: number;
  vitaminB12: number;
  vitaminC: number;
  vitaminA: number;
  potassium: number;
  magnesium: number;
  zinc: number;
  proteinRatio: number;
  carbRatio: number;
  fatRatio: number;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    age: "",
    gender: "male",
    weight: "",
    height: "",
    activityLevel: "moderatelyActive",
    dietType: "nonVegetarian",
    monthlyBudget: "",
    healthGoals: { primaryGoal: "maintainWeight" },
    healthConditions: [],
  });

  const [requirements, setRequirements] = useState<DailyRequirements | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        if (!userInfo.token) return;

        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };
        const { data } = await axios.get("/api/profile", config);

        if (data.profile) {
          setProfile((prev) => ({ ...prev, ...data.profile }));
        }
        if (data.dailyRequirements) {
          setRequirements(data.dailyRequirements);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "primaryGoal") {
      setProfile({
        ...profile,
        healthGoals: { ...profile.healthGoals, primaryGoal: value },
      });
    } else if (name === "healthConditions") {
      setProfile({ ...profile, healthConditions: [value] });
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      const { data } = await axios.put("/api/profile", { profile }, config);

      if (data.dailyRequirements) {
        setRequirements(data.dailyRequirements);
      }
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    await uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      const { data } = await axios.put("/api/profile/upload-image", formData, config);

      setProfile((prev) => ({ ...prev, profileImage: data.profileImage }));
      
      const updatedUserInfo = { ...userInfo, profileImage: data.profileImage };
      localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));

      toast.success("Profile image updated!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload image.");
      setImagePreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  // --- Theme-aware class helpers ---
  const t = {
    page: isDark ? "bg-neutral-950" : "",
    card: isDark
      ? "bg-neutral-900 border-neutral-800 shadow-none"
      : "bg-white border-neutral-100 shadow-sm",
    heading: isDark ? "text-white" : "text-neutral-900",
    subtext: isDark ? "text-neutral-400" : "text-neutral-500",
    label: isDark ? "text-neutral-400" : "text-neutral-500",
    input: isDark
      ? "bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500 focus:border-blue-400"
      : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-blue-500",
    select: isDark
      ? "bg-neutral-800 border-neutral-700 text-white"
      : "bg-neutral-50 border-neutral-200 text-neutral-900",
    avatarBg: isDark ? "bg-neutral-800 text-neutral-500" : "bg-neutral-100 text-neutral-400",
    tagBlueBg: isDark ? "bg-blue-900/40 text-blue-300" : "bg-blue-50 text-blue-600",
    tagGreenBg: isDark ? "bg-green-900/40 text-green-300" : "bg-green-50 text-green-600",
    saveBtn: isDark
      ? "bg-green-500 hover:bg-green-400 text-neutral-950"
      : "bg-green-600 hover:bg-green-700 text-white",
  };

  if (isLoading) {
    return (
      <div className={`text-center p-10 ${t.subtext}`}>Loading profile...</div>
    );
  }

  return (
    <div
      className={`flex flex-col gap-6 pb-24 md:pb-6 pt-2 animate-in fade-in slide-in-from-bottom-4 transition-colors duration-300`}
    >
      {/* Page Header */}
      <section className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className={`text-3xl font-extrabold tracking-tight ${t.heading}`}>
            Your Profile
          </h1>
          <p className={`font-medium ${t.subtext}`}>
            Update your metrics to recalculate your daily nutrition needs.
          </p>
        </div>
      </section>

      {/* Profile Header with Avatar Upload */}
      <section
        className={`flex flex-col items-center md:flex-row gap-6 rounded-3xl p-6 border transition-colors duration-300 ${t.card}`}
      >
        <div className="relative group">
          <div className={`w-32 h-32 rounded-full overflow-hidden border-4 ${isDark ? "border-neutral-800" : "border-neutral-50"} shadow-md ${isUploading ? 'opacity-50' : 'opacity-100'} transition-opacity`}>
            {imagePreview || profile.profileImage ? (
              <img 
                src={imagePreview || profile.profileImage} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${t.avatarBg}`}>
                <span className="material-symbols-outlined text-5xl">person</span>
              </div>
            )}
            
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          <label 
            htmlFor="profile-image-upload" 
            className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-colors border-2 border-white"
          >
            <span className="material-symbols-outlined text-sm">photo_camera</span>
            <input 
              id="profile-image-upload" 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageChange}
              disabled={isUploading}
            />
          </label>
        </div>

        <div className="flex flex-col text-center md:text-left">
          <h2 className={`text-2xl font-bold ${t.heading}`}>{profile.name || "User Name"}</h2>
          <p className={`font-medium capitalize ${t.subtext}`}>{profile.gender} • {profile.age} years old</p>
          <div className="flex gap-2 mt-2 justify-center md:justify-start">
            <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${t.tagBlueBg}`}>
              {profile.healthGoals.primaryGoal.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${t.tagGreenBg}`}>
              {profile.dietType}
            </span>
          </div>
        </div>
      </section>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Personal Details Card */}
        <div className={`rounded-3xl p-6 border transition-colors duration-300 flex flex-col gap-4 ${t.card}`}>
          <h3 className={`font-bold text-lg flex items-center gap-2 mb-2 ${t.heading}`}>
            <span className="material-symbols-outlined text-blue-500">
              person
            </span>
            Personal Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className={`text-xs font-bold uppercase tracking-wider ${t.label}`}>
                Name
              </label>
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
              <label className={`text-xs font-bold uppercase tracking-wider ${t.label}`}>
                Age
              </label>
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
              <label className={`text-xs font-bold uppercase tracking-wider ${t.label}`}>
                Gender
              </label>
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
            <span className="material-symbols-outlined text-orange-500">
              monitor_weight
            </span>
            Body Metrics & Goals
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className={`text-xs font-bold uppercase tracking-wider ${t.label}`}>
                Weight (kg)
              </label>
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
              <label className={`text-xs font-bold uppercase tracking-wider ${t.label}`}>
                Height (cm)
              </label>
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
              <label className={`text-xs font-bold uppercase tracking-wider ${t.label}`}>
                Primary Goal
              </label>
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
              <label className={`text-xs font-bold uppercase tracking-wider ${t.label}`}>
                Activity Level
              </label>
              <select
                name="activityLevel"
                value={profile.activityLevel}
                onChange={handleChange}
                className={`border rounded-xl p-3 font-medium focus:outline-none transition-colors ${t.select}`}
              >
                <option value="sedentary">
                  Sedentary (Little/No Exercise)
                </option>
                <option value="lightlyActive">
                  Lightly Active (1-3 days/week)
                </option>
                <option value="moderatelyActive">
                  Moderately Active (3-5 days/week)
                </option>
                <option value="veryActive">Very Active (6-7 days/week)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Health & Diet Card */}
        <div className={`rounded-3xl p-6 border transition-colors duration-300 flex flex-col gap-4 ${t.card}`}>
          <h3 className={`font-bold text-lg flex items-center gap-2 mb-2 ${t.heading}`}>
            <span className="material-symbols-outlined text-green-500">
              health_and_safety
            </span>
            Health & Diet
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className={`text-xs font-bold uppercase tracking-wider ${t.label}`}>
                Diet Type
              </label>
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
              <label className={`text-xs font-bold uppercase tracking-wider ${t.label}`}>
                Health Condition
              </label>
              <select
                name="healthConditions"
                value={profile.healthConditions[0] || "none"}
                onChange={handleChange}
                className={`border rounded-xl p-3 font-medium focus:outline-none transition-colors ${t.select}`}
              >
                <option value="none">None</option>
                <option value="diabetes">Diabetes / Pre-Diabetes</option>
                <option value="hypertension">
                  Hypertension (Blood Pressure)
                </option>
                <option value="anemia">Anemia (Iron Deficiency)</option>
                <option value="kidneyDisease">Kidney Disease</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className={`w-full font-bold py-4 rounded-xl shadow-md transition-colors disabled:opacity-50 ${t.saveBtn}`}
        >
          {isSaving
            ? "Saving & Recalculating..."
            : "Save Profile & Update Targets"}
        </button>
      </form>

      {/* Auto-Calculated Targets Display — LIGHT MODE */}
      {requirements && (
        <section className={`rounded-3xl p-6 border transition-colors duration-300 mt-4 ${t.card}`}>
          <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${t.heading}`}>
            <span className="material-symbols-outlined text-green-500">calculate</span>
            Your Daily Targets
          </h3>

          {/* Energy Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className={`flex flex-col items-center p-4 rounded-2xl ${isDark ? "bg-neutral-800" : "bg-neutral-50 border border-neutral-100"}`}>
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>BMR</span>
              <span className={`text-2xl font-black ${t.heading}`}>{requirements.bmr}</span>
              <span className={`text-xs ${t.subtext}`}>kcal</span>
            </div>
            <div className={`flex flex-col items-center p-4 rounded-2xl border ${isDark ? "bg-green-900/20 border-green-700/40" : "bg-green-50 border-green-200"}`}>
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-green-400" : "text-green-600"}`}>Daily Calories</span>
              <span className={`text-3xl font-black ${isDark ? "text-green-300" : "text-green-700"}`}>{requirements.calories}</span>
              <span className={`text-xs ${isDark ? "text-green-500/70" : "text-green-500"}`}>kcal/day</span>
            </div>
            <div className={`flex flex-col items-center p-4 rounded-2xl ${isDark ? "bg-neutral-800" : "bg-neutral-50 border border-neutral-100"}`}>
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>TDEE</span>
              <span className={`text-2xl font-black ${t.heading}`}>{requirements.tdee}</span>
              <span className={`text-xs ${t.subtext}`}>kcal</span>
            </div>
          </div>

          {/* Macronutrients */}
          <h4 className={`text-sm font-bold uppercase tracking-wider mb-3 ${t.label}`}>Macronutrients</h4>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className={`flex flex-col gap-1 p-3 rounded-2xl text-center ${isDark ? "bg-blue-900/20 border border-blue-800/30" : "bg-blue-50 border border-blue-100"}`}>
              <span className={`font-bold text-xs uppercase ${isDark ? "text-blue-400" : "text-blue-600"}`}>Protein</span>
              <span className={`font-bold text-xl ${t.heading}`}>{requirements.protein}g</span>
              <span className={`text-xs ${t.subtext}`}>{requirements.proteinRatio}%</span>
            </div>
            <div className={`flex flex-col gap-1 p-3 rounded-2xl text-center ${isDark ? "bg-orange-900/20 border border-orange-800/30" : "bg-orange-50 border border-orange-100"}`}>
              <span className={`font-bold text-xs uppercase ${isDark ? "text-orange-400" : "text-orange-600"}`}>Carbs</span>
              <span className={`font-bold text-xl ${t.heading}`}>{requirements.carbs}g</span>
              <span className={`text-xs ${t.subtext}`}>{requirements.carbRatio}%</span>
            </div>
            <div className={`flex flex-col gap-1 p-3 rounded-2xl text-center ${isDark ? "bg-green-900/20 border border-green-800/30" : "bg-green-50 border border-green-100"}`}>
              <span className={`font-bold text-xs uppercase ${isDark ? "text-green-400" : "text-green-600"}`}>Fats</span>
              <span className={`font-bold text-xl ${t.heading}`}>{requirements.fats}g</span>
              <span className={`text-xs ${t.subtext}`}>{requirements.fatRatio}%</span>
            </div>
          </div>

          {/* Micronutrients */}
          <h4 className={`text-sm font-bold uppercase tracking-wider mb-3 ${t.label}`}>Micronutrients</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "Iron", value: requirements.iron, unit: "mg", color: isDark ? "text-rose-400" : "text-rose-600", bg: isDark ? "bg-rose-900/15" : "bg-rose-50" },
              { label: "Calcium", value: requirements.calcium, unit: "mg", color: isDark ? "text-sky-400" : "text-sky-600", bg: isDark ? "bg-sky-900/15" : "bg-sky-50" },
              { label: "Vitamin C", value: requirements.vitaminC, unit: "mg", color: isDark ? "text-lime-400" : "text-lime-600", bg: isDark ? "bg-lime-900/15" : "bg-lime-50" },
              { label: "Fiber", value: requirements.fiber, unit: "g", color: isDark ? "text-amber-400" : "text-amber-600", bg: isDark ? "bg-amber-900/15" : "bg-amber-50" },
              { label: "Sugar (max)", value: requirements.sugar, unit: "g", color: isDark ? "text-pink-400" : "text-pink-600", bg: isDark ? "bg-pink-900/15" : "bg-pink-50" },
              { label: "Sodium (max)", value: requirements.sodium, unit: "mg", color: isDark ? "text-red-400" : "text-red-600", bg: isDark ? "bg-red-900/15" : "bg-red-50" },
            ].map((nutrient) => (
              <div key={nutrient.label} className={`flex flex-col p-3 rounded-xl ${nutrient.bg}`}>
                <span className={`${nutrient.color} font-bold text-[10px] uppercase tracking-wider`}>{nutrient.label}</span>
                <span className={`font-bold text-base ${t.heading}`}>
                  {nutrient.value}
                  <span className={`text-xs ml-1 ${t.subtext}`}>{nutrient.unit}</span>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Profile;
