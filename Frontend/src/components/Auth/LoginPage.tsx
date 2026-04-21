import React, { useState } from "react";
import axios from "../../utils/axios";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

interface Props {
  onLogin: (userData: any) => void;
}

const LoginPage: React.FC<Props> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Send login request to the backend
      const { data: response } = await axios.post("/api/auth/login", {
        email,
        password,
      });

      // Backend returns { success, data: { user: { _id, name, email, role }, token } }
      // Flatten so role & token are top-level for AuthGuard compatibility
      const { user: userObj, token } = response.data;
      const userData = { ...userObj, token };
      localStorage.setItem("userInfo", JSON.stringify(userData));
      onLogin(userData);
      toast.success("Login successful!");

      // Route admin users directly to admin dashboard
      if (userData.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-[#f4f9f4] font-sans antialiased absolute top-0 left-0 right-0 bottom-0 z-50">
      {/* Left Column: Visual Hero (Hidden on Mobile) */}
      <div className="hidden lg:flex w-full lg:w-1/2 relative bg-neutral-200 overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop")',
          }}
        ></div>
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

        <div className="relative z-10 w-full h-full flex flex-col justify-end p-16 text-white">
          <div className="space-y-4 max-w-md">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-4xl">mic</span>
              <span className="text-sm font-bold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                Voice Enabled
              </span>
            </div>
            <h2 className="text-5xl font-extrabold leading-tight tracking-tight">
              Nutrition made simple for everyone.
            </h2>
            <p className="text-lg text-neutral-200 font-medium leading-relaxed">
              Log your daily meals with simple voice commands and get
              personalized diet advice in your language.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-[#f4f9f4] relative">
        {/* Top Navigation: Logo & Language */}
        <header className="w-full flex items-center justify-between px-6 py-6 lg:px-12">
          <div className="flex items-center gap-3 text-[#141414]">
            <h2 className="text-lg font-bold leading-tight tracking-tight">
              Poshan Sathi
            </h2>
          </div>

          {/* Language Switcher (Segmented Button) */}
        </header>

        {/* Main Form Content */}
        <div className="flex-1 flex flex-col justify-center px-6 lg:px-20 xl:px-32">
          <div className="max-w-[480px] w-full mx-auto pb-10">
            {/* Page Heading */}
            <div className="mb-10">
              <h1 className="text-[#141414] text-4xl font-black leading-tight tracking-tight mb-3">
                Namaste
              </h1>
              <p className="text-neutral-500 text-base font-medium leading-normal">
                Welcome back. Please enter your details to access your nutrition
                tracker.
              </p>
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              {/* Email Field */}
              <label className="flex flex-col gap-2">
                <span className="text-[#141414] text-sm font-bold leading-normal">
                  Email Address
                </span>
                <div className="flex w-full items-center rounded-xl bg-white border border-[#dbdbdb] focus-within:border-[#141414] focus-within:ring-1 focus-within:ring-[#141414] transition-all overflow-hidden h-14">
                  <div className="flex items-center justify-center pl-4 text-neutral-400">
                    <span className="material-symbols-outlined">mail</span>
                  </div>
                  <input
                    className="flex-1 w-full h-full bg-transparent border-none focus:ring-0 text-[#141414] placeholder:text-neutral-400 px-3 text-base font-medium outline-none"
                    placeholder="Enter your email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </label>

              {/* Password Field */}
              <label className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#141414] text-sm font-bold leading-normal">
                    Password
                  </span>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-neutral-400 hover:text-[#141414] transition-colors font-medium"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="flex w-full items-center rounded-xl bg-white border border-[#dbdbdb] focus-within:border-[#141414] focus-within:ring-1 focus-within:ring-[#141414] transition-all overflow-hidden h-14">
                  <div className="flex items-center justify-center pl-4 text-neutral-400">
                    <span className="material-symbols-outlined">lock</span>
                  </div>
                  <input
                    className="flex-1 w-full h-full bg-transparent border-none focus:ring-0 text-[#141414] placeholder:text-neutral-400 px-3 text-base font-medium outline-none"
                    placeholder="Enter your password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="pr-4 text-neutral-400 hover:text-[#141414] transition-colors focus:outline-none flex items-center justify-center"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </label>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-4 flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-4 bg-[#141414] text-white hover:bg-neutral-800 transition-colors shadow-lg shadow-neutral-200 text-base font-bold leading-normal disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="animate-pulse">Logging in...</span>
                ) : (
                  <>
                    <span className="mr-2">Log In</span>
                    <span className="material-symbols-outlined text-sm">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-8 pt-6 border-t border-dashed border-neutral-200 text-center">
              <p className="text-neutral-500 text-base font-medium">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-[#141414] font-bold hover:underline decoration-2 underline-offset-4"
                >
                  Register for free
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Mobile visual cue */}
        <div className="lg:hidden h-2 bg-gradient-to-r from-green-400 to-emerald-600 mt-auto"></div>
      </div>
    </div>
  );
};

export default LoginPage;
