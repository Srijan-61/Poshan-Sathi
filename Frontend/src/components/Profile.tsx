import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import toast from "react-hot-toast";

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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        if (!userInfo.token) return;

        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };
        // Assuming your backend route is set up at /api/profile
        const { data } = await axios.get("/api/profile", config);

        if (data.profile) {
          // Merge fetched data with defaults to prevent undefined inputs
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
      // Handle single select for health condition for simplicity
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

      setRequirements(data.dailyRequirements);
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

    // Instant local preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // Start upload
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
      
      // Update localStorage to keep profile image in sync if stored there
      const updatedUserInfo = { ...userInfo, profileImage: data.profileImage };
      localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));

      toast.success("Profile image updated!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload image.");
      setImagePreview(null); // Reset preview on error
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center p-10 text-gray-500">Loading profile...</div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-24 md:pb-6 pt-2 animate-in fade-in slide-in-from-bottom-4">
      <section className="flex flex-col gap-2">
        <h1 className="text-gray-900 text-3xl font-extrabold tracking-tight">
          Your Profile
        </h1>
        <p className="text-gray-500 font-medium">
          Update your metrics to recalulate your daily nutrition needs.
        </p>
      </section>

      {/* Profile Header with Avatar Upload */}
      <section className="flex flex-col items-center md:flex-row gap-6 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div className="relative group">
          <div className={`w-32 h-32 rounded-full overflow-hidden border-4 border-gray-50 shadow-md ${isUploading ? 'opacity-50' : 'opacity-100'} transition-opacity`}>
            {imagePreview || profile.profileImage ? (
              <img 
                src={imagePreview || profile.profileImage} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
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
          <h2 className="text-2xl font-bold text-gray-900">{profile.name || "User Name"}</h2>
          <p className="text-gray-500 font-medium capitalize">{profile.gender} • {profile.age} years old</p>
          <div className="flex gap-2 mt-2">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-wider">
              {profile.healthGoals.primaryGoal.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full uppercase tracking-wider">
              {profile.dietType}
            </span>
          </div>
        </div>
      </section>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Personal Details Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-blue-500">
              person
            </span>
            Personal Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-200 rounded-xl p-3 font-medium text-gray-900 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Age
              </label>
              <input
                type="number"
                name="age"
                value={profile.age}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-200 rounded-xl p-3 font-medium text-gray-900 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Gender
              </label>
              <select
                name="gender"
                value={profile.gender}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-200 rounded-xl p-3 font-medium text-gray-900 focus:outline-none focus:border-blue-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Monthly Budget (Rs)
              </label>
              <input
                type="number"
                name="monthlyBudget"
                value={profile.monthlyBudget}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-200 rounded-xl p-3 font-medium text-gray-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Body Metrics & Goals Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-orange-500">
              monitor_weight
            </span>
            Body Metrics & Goals
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={profile.weight}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-200 rounded-xl p-3 font-medium text-gray-900 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Height (cm)
              </label>
              <input
                type="number"
                name="height"
                value={profile.height}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-200 rounded-xl p-3 font-medium text-gray-900 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Primary Goal
              </label>
              <select
                name="primaryGoal"
                value={profile.healthGoals.primaryGoal}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-200 rounded-xl p-3 font-medium text-gray-900 focus:outline-none focus:border-blue-500"
              >
                <option value="weightLoss">Weight Loss</option>
                <option value="maintainWeight">Maintain Weight</option>
                <option value="muscleGain">Muscle Gain</option>
                <option value="weightGain">Weight Gain</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Activity Level
              </label>
              <select
                name="activityLevel"
                value={profile.activityLevel}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-200 rounded-xl p-3 font-medium text-gray-900 focus:outline-none focus:border-blue-500"
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
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-green-500">
              health_and_safety
            </span>
            Health & Diet
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Diet Type
              </label>
              <select
                name="dietType"
                value={profile.dietType}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-200 rounded-xl p-3 font-medium text-gray-900 focus:outline-none focus:border-blue-500"
              >
                <option value="nonVegetarian">Non-Vegetarian</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="eggetarian">Eggetarian</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Health Condition
              </label>
              <select
                name="healthConditions"
                value={profile.healthConditions[0] || "none"}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-200 rounded-xl p-3 font-medium text-gray-900 focus:outline-none focus:border-blue-500"
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
          className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-md hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {isSaving
            ? "Saving & Recalculating..."
            : "Save Profile & Update Targets"}
        </button>
      </form>

      {/* Auto-Calculated Targets Display */}
      {requirements && (
        <section className="bg-gray-900 rounded-3xl p-6 shadow-md text-white mt-4">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-green-400">
              auto_awesome
            </span>
            Your Daily Targets
          </h3>

          <div className="flex justify-between items-end mb-6 border-b border-gray-700 pb-6">
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">
                Daily Calories
              </span>
              <span className="text-4xl font-black text-white">
                {requirements.calories}
              </span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">
                TDEE
              </span>
              <span className="text-2xl font-bold text-gray-300">
                {requirements.tdee} kcal
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col gap-1 p-3 bg-gray-800 rounded-2xl">
              <span className="text-blue-400 font-bold text-xs uppercase">
                Protein
              </span>
              <span className="font-bold text-xl">{requirements.protein}g</span>
            </div>
            <div className="flex flex-col gap-1 p-3 bg-gray-800 rounded-2xl">
              <span className="text-orange-400 font-bold text-xs uppercase">
                Carbs
              </span>
              <span className="font-bold text-xl">{requirements.carbs}g</span>
            </div>
            <div className="flex flex-col gap-1 p-3 bg-gray-800 rounded-2xl">
              <span className="text-green-400 font-bold text-xs uppercase">
                Fats
              </span>
              <span className="font-bold text-xl">{requirements.fats}g</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Profile;
