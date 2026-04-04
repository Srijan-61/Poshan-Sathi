import React, { useState } from "react";
import axios from "../utils/axios";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

interface RegisterPageProps {
  onLogin: (data: any) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onLogin }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State matching your Mongoose Schema
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    profile: {
      age: "" as number | "",
      gender: "male",
      weight: "" as number | "",
      height: "" as number | "",
      activityLevel: "moderatelyActive",
      dietType: "nonVegetarian",
      healthGoals: {
        primaryGoal: "maintainWeight",
      },
      healthConditions: ["none"],
    },
  });

  // Handlers
  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "primaryGoal") {
      setFormData({
        ...formData,
        profile: { ...formData.profile, healthGoals: { primaryGoal: value } },
      });
    } else {
      setFormData({
        ...formData,
        profile: { ...formData.profile, [name]: value },
      });
    }
  };

  // Validations
  const nextStep = () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all account details");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { age, weight, height } = formData.profile;
    if (!age || !weight || !height) {
      toast.error("Health metrics are mandatory for nutrition calculation");
      return;
    }

    setLoading(true);
    try {
      // 1. Force the metrics to be real Numbers before sending to MongoDB
      const payload = {
        ...formData,
        profile: {
          ...formData.profile,
          age: Number(age),
          weight: Number(weight),
          height: Number(height),
        },
      };

      // 2. Use the correct auth/register endpoint!
      const { data } = await axios.post("/api/auth/register", payload);

      toast.success("Account created! Welcome to Poshan Sathi.");
      localStorage.setItem("userInfo", JSON.stringify(data));
      onLogin(data);
    } catch (err: any) {
      // This will now show the exact error message from your backend if something else is wrong
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full bg-gray-50 font-sans absolute top-0 left-0 right-0 bottom-0 z-50">
      {/* Left Panel: Brand & Visuals */}
      <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <img
            alt="Healthy food background"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqfhDAbUmkOI832W5Njglu_x1hiCnkQNdaDm6MAHNvUfstELpYKKddXVKC9DjvW_MXFRlc83g2pJyvmtxPU9bK-xQ48M2vJO_Jh0Th2GsDG9ByKlKe7smClSHnvPDo-3x-mdO-__lndDz7EvZG9XYHtqM4vCzyXHZG6zMggYNdgoVmJ1PGWapxfuoYPG1OJZryuv2bE-qX2wjen-ccgdfc1J_Ddwcc4Cfn7hbocdLKe6jYFhr2m5tacf3T4Ca_ZJUjSjIAXDY1wfw"
          />
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent z-10"></div>
        <div className="relative z-20 flex flex-col justify-between p-12 h-full">
          <div>
            <span className="text-2xl font-extrabold tracking-tighter text-white flex items-center">
              Poshan Sathi
            </span>
          </div>
          <div className="space-y-6">
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight tracking-tight max-w-sm">
              Nutrition made simple & accessible.
            </h1>
            <p className="text-white/70 text-lg max-w-xs leading-relaxed">
              Precision data meets local Nepali cuisine for your wellness
              journey.
            </p>
          </div>
        </div>
      </section>

      {/* Right Panel: Form Content */}
      <section className="w-full lg:w-1/2 flex flex-col bg-white min-h-screen p-6 md:p-12 lg:p-20 overflow-y-auto">
        <div className="max-w-xl mx-auto w-full flex flex-col flex-grow">
          {/* Progress Header */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Step {step} of 2
              </span>
              <span className="text-xs font-bold text-green-600">
                {step === 1 ? "Account Info" : "Health Profile"}
              </span>
            </div>
            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full bg-green-600 rounded-full transition-all duration-500 ${
                  step === 1 ? "w-1/2" : "w-full"
                }`}
              ></div>
            </div>
          </div>

          {/* Form Heading */}
          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
              {step === 1 ? "Create an account" : "Tell us about yourself"}
            </h2>
            <p className="text-gray-500 leading-relaxed font-medium">
              {step === 1
                ? "Join Poshan Sathi to start tracking your health and budget today."
                : "These metrics are required to accurately calculate your daily calorie and macro goals."}
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
            {/* STEP 1: ACCOUNT DETAILS */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleAccountChange}
                    className="w-full h-14 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all outline-none font-medium"
                    placeholder="Srijan Bhandari"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleAccountChange}
                    className="w-full h-14 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all outline-none font-medium"
                    placeholder="srijan@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleAccountChange}
                    className="w-full h-14 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all outline-none font-medium"
                    placeholder="••••••••"
                  />
                </div>

                <div className="pt-6">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="w-full h-14 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all flex items-center justify-center gap-2 group"
                  >
                    Continue to Health Profile
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </button>
                  <p className="text-center text-gray-500 font-medium text-sm mt-6">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="text-green-600 font-bold hover:underline"
                    >
                      Log in here
                    </Link>
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2: HEALTH METRICS */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Age */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.profile.age}
                      onChange={handleProfileChange}
                      className="w-full h-14 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all outline-none font-medium"
                      placeholder="22"
                    />
                  </div>

                  {/* Gender (Custom Radio) */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Gender
                    </label>
                    <div className="flex gap-2">
                      <label className="flex-1">
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={formData.profile.gender === "male"}
                          onChange={handleProfileChange}
                          className="sr-only peer"
                        />
                        <div className="w-full h-14 flex items-center justify-center border border-gray-200 rounded-xl bg-gray-50 peer-checked:bg-green-50 peer-checked:border-green-600 peer-checked:text-green-700 cursor-pointer transition-all text-sm font-bold">
                          Male
                        </div>
                      </label>
                      <label className="flex-1">
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={formData.profile.gender === "female"}
                          onChange={handleProfileChange}
                          className="sr-only peer"
                        />
                        <div className="w-full h-14 flex items-center justify-center border border-gray-200 rounded-xl bg-gray-50 peer-checked:bg-green-50 peer-checked:border-green-600 peer-checked:text-green-700 cursor-pointer transition-all text-sm font-bold">
                          Female
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Weight */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Weight (kg)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="weight"
                        value={formData.profile.weight}
                        onChange={handleProfileChange}
                        className="w-full h-14 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all outline-none font-medium"
                        placeholder="70"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
                        kg
                      </span>
                    </div>
                  </div>

                  {/* Height */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Height (cm)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="height"
                        value={formData.profile.height}
                        onChange={handleProfileChange}
                        className="w-full h-14 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all outline-none font-medium"
                        placeholder="175"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
                        cm
                      </span>
                    </div>
                  </div>
                </div>

                {/* Activity Level */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Activity Level
                  </label>
                  <div className="relative">
                    <select
                      name="activityLevel"
                      value={formData.profile.activityLevel}
                      onChange={handleProfileChange}
                      className="w-full h-14 px-4 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all outline-none font-medium text-gray-900"
                    >
                      <option value="sedentary">
                        Sedentary (Office job, no exercise)
                      </option>
                      <option value="lightlyActive">
                        Lightly Active (1-3 days/week)
                      </option>
                      <option value="moderatelyActive">
                        Moderately Active (3-5 days/week)
                      </option>
                      <option value="veryActive">
                        Very Active (6-7 days/week)
                      </option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <span className="material-symbols-outlined text-gray-400">
                        expand_more
                      </span>
                    </div>
                  </div>
                </div>

                {/* Health Goal */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Primary Health Goal
                  </label>
                  <div className="relative">
                    <select
                      name="primaryGoal"
                      value={formData.profile.healthGoals.primaryGoal}
                      onChange={handleProfileChange}
                      className="w-full h-14 px-4 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all outline-none font-medium text-gray-900"
                    >
                      <option value="weightLoss">Weight Loss</option>
                      <option value="maintainWeight">Maintain Weight</option>
                      <option value="muscleGain">Muscle Gain</option>
                      <option value="weightGain">Weight Gain</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <span className="material-symbols-outlined text-gray-400">
                        expand_more
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-6 space-y-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 hover:bg-green-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 group"
                  >
                    {loading
                      ? "Calculating Profile..."
                      : "Complete Registration"}
                    {!loading && (
                      <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                        check_circle
                      </span>
                    )}
                  </button>
                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-green-600 transition-colors group"
                    >
                      <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">
                        arrow_back
                      </span>
                      Back to account details
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </section>
    </main>
  );
};

export default RegisterPage;
