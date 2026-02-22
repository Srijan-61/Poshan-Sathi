import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

interface Props {
  onLogin: (userData: any) => void;
}

const RegisterPage: React.FC<Props> = ({ onLogin }) => {
  // 1. CHANGED: name to username
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [healthCondition, setHealthCondition] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setError("You must agree to the Terms of Service.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // 2. CHANGED: Sending username, and mapping healthcondition to lowercase c
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          username,
          email,
          password,
          healthcondition: healthCondition,
        },
      );

      // Save user info and token to local storage
      localStorage.setItem("userInfo", JSON.stringify(data));
      onLogin(data);
      navigate("/"); // Redirect to dashboard
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-[#fcfcfc] text-[#141414] font-sans overflow-x-hidden absolute top-0 left-0 right-0 bottom-0 z-50">
      {/* Left Column: Visual Hero */}
      <div className="lg:w-5/12 xl:w-4/12 bg-white border-r border-[#e5e5e5] flex flex-col relative overflow-hidden order-first">
        <div className="p-8 lg:p-12 flex flex-col h-full z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-[#059669] text-white rounded-xl flex items-center justify-center shadow-lg shadow-[#059669]/20">
              <span className="material-symbols-outlined text-[28px]">eco</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Poshan Sathi</h1>
          </div>

          <div className="flex flex-col gap-6 mb-12">
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-[1.15]">
              Nutrition made <br />
              <span className="text-[#059669]">simple & accessible.</span>
            </h2>
            <p className="text-neutral-600 text-lg leading-relaxed max-w-md">
              Speak your meals, track your health, and get personalized advice
              designed for everyone.
            </p>
          </div>

          <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden mb-8 shadow-sm border border-[#e5e5e5] group">
            <img
              alt="Fresh healthy vegetables and fruits"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent"></div>
            <div className="absolute bottom-4 left-4 text-white font-medium flex items-center gap-2">
              <span className="material-symbols-outlined">mic</span>
              <span>Voice-enabled logging</span>
            </div>
          </div>

          <div className="grid gap-3 mt-auto">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-[#e8f0fe]/30 border border-transparent">
              <span className="material-symbols-outlined text-blue-700">
                account_balance_wallet
              </span>
              <div>
                <h3 className="font-bold text-sm text-blue-950">
                  Budget Diets
                </h3>
                <p className="text-sm text-blue-800/80">
                  Affordable meal plans tailored to your wallet.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl bg-[#fce8e6]/40 border border-transparent">
              <span className="material-symbols-outlined text-red-700">
                medical_services
              </span>
              <div>
                <h3 className="font-bold text-sm text-red-950">
                  Health Alerts
                </h3>
                <p className="text-sm text-red-800/80">
                  Safety warnings for Anemia & Diabetes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div className="flex-1 flex flex-col relative bg-[#fcfcfc]">
        {/* Top Right Actions */}

        <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-20 overflow-y-auto">
          <div className="w-full max-w-xl flex flex-col gap-8 mt-12 lg:mt-0">
            <div className="flex flex-col gap-2 text-center sm:text-left">
              <h2 className="text-3xl font-bold text-[#141414] tracking-tight">
                Create your Account
              </h2>
              <p className="text-neutral-500">
                Start your journey to better health today.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="flex flex-col gap-5">
              <div className="grid gap-5">
                {/* Full Name Field */}
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-[#141414]">
                    Full Name
                  </span>
                  <div className="relative flex items-center">
                    <input
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full h-12 pl-4 pr-12 rounded-lg bg-white border border-[#e5e5e5] focus:border-[#059669] focus:ring-1 focus:ring-[#059669] outline-none transition-all placeholder:text-neutral-400"
                      placeholder="Enter your full name"
                      type="text"
                    />
                    <div className="absolute right-3 text-neutral-400 pointer-events-none flex items-center">
                      <span className="material-symbols-outlined">person</span>
                    </div>
                  </div>
                </label>

                {/* Email Field */}
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-[#141414]">
                    Email Address
                  </span>
                  <div className="relative flex items-center">
                    <input
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-12 pl-4 pr-12 rounded-lg bg-white border border-[#e5e5e5] focus:border-[#059669] focus:ring-1 focus:ring-[#059669] outline-none transition-all placeholder:text-neutral-400"
                      placeholder="name@example.com"
                      type="email"
                    />
                    <div className="absolute right-3 text-neutral-400 pointer-events-none flex items-center">
                      <span className="material-symbols-outlined">mail</span>
                    </div>
                  </div>
                </label>
              </div>

              {/* Password Field */}
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-[#141414]">
                  Password
                </span>
                <div className="relative flex items-center">
                  <input
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 pl-4 pr-12 rounded-lg bg-white border border-[#e5e5e5] focus:border-[#059669] focus:ring-1 focus:ring-[#059669] outline-none transition-all placeholder:text-neutral-400"
                    placeholder="Create a strong password"
                    type={showPassword ? "text" : "password"}
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-neutral-400 hover:text-[#059669] transition-colors flex items-center"
                    type="button"
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </label>

              {/* Health Condition Dropdown */}
              <label className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#141414]">
                    Health Condition (Optional)
                  </span>
                </div>
                <div className="relative flex items-center">
                  <select
                    value={healthCondition}
                    onChange={(e) => setHealthCondition(e.target.value)}
                    className="w-full h-12 pl-4 pr-12 rounded-lg bg-white border border-[#e5e5e5] focus:border-[#059669] focus:ring-1 focus:ring-[#059669] outline-none transition-all text-neutral-600 appearance-none cursor-pointer"
                  >
                    <option value="none">None</option>
                    <option value="anemia">Anemia (Iron Deficiency)</option>
                    <option value="diabetes">Diabetes (Blood Sugar)</option>
                  </select>
                  <div className="absolute right-3 text-neutral-400 pointer-events-none flex items-center">
                    <span className="material-symbols-outlined">
                      expand_more
                    </span>
                  </div>
                </div>
              </label>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-3 mt-2 cursor-pointer">
                <input
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 rounded border-[#e5e5e5] bg-white text-[#059669] focus:ring-[#059669]"
                  type="checkbox"
                />
                <span className="text-sm text-neutral-600 leading-normal">
                  I agree to Poshan Sathi's{" "}
                  <a
                    className="font-bold text-[#059669] hover:text-[#047857] underline decoration-2 underline-offset-2"
                    href="#"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    className="font-bold text-[#059669] hover:text-[#047857] underline decoration-2 underline-offset-2"
                    href="#"
                  >
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>

              <div className="flex flex-col gap-4 mt-2">
                <button
                  disabled={isLoading}
                  className="w-full h-12 bg-[#059669] hover:bg-[#047857] text-white rounded-lg font-bold text-base transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#059669]/20 disabled:opacity-70"
                  type="submit"
                >
                  {isLoading ? (
                    <span>Registering...</span>
                  ) : (
                    <>
                      <span>Register Now</span>
                      <span className="material-symbols-outlined text-[20px]">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>
                <p className="text-center text-sm text-neutral-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-bold text-[#059669] hover:text-[#047857] hover:underline"
                  >
                    Log in here
                  </Link>
                </p>
              </div>
            </form>

            <div className="flex items-center justify-center gap-6 mt-4 pt-6 border-t border-dashed border-[#e5e5e5] opacity-70">
              <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
                <span className="material-symbols-outlined text-[18px]">
                  verified_user
                </span>
                <span>Secure Data</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
                <span className="material-symbols-outlined text-[18px]">
                  health_and_safety
                </span>
                <span>Verified Advice</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
