import React, { useState } from "react";
import axios from "../../utils/axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setIsLoading(true);

    try {
      await axios.patch(`/api/auth/reset-password/${token}`, { password });
      setIsSuccess(true);
      toast.success("Password reset successfully!");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Reset failed. The link may have expired."
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

        <div className="relative z-10 w-full h-full flex flex-col justify-end p-16 text-white">
          <div className="space-y-4 max-w-md">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-4xl">
                password
              </span>
              <span className="text-sm font-bold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                Secure Reset
              </span>
            </div>
            <h2 className="text-5xl font-extrabold leading-tight tracking-tight">
              Set your new password.
            </h2>
            <p className="text-lg text-neutral-200 font-medium leading-relaxed">
              Choose a strong password with at least 6 characters to keep your
              nutrition data safe.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-[#f4f9f4] relative">
        <header className="w-full flex items-center justify-between px-6 py-6 lg:px-12">
          <div className="flex items-center gap-3 text-[#141414]">
            <h2 className="text-lg font-bold leading-tight tracking-tight">
              Poshan Sathi
            </h2>
          </div>
        </header>

        <div className="flex-1 flex flex-col justify-center px-6 lg:px-20 xl:px-32">
          <div className="max-w-[480px] w-full mx-auto pb-10">
            {!isSuccess ? (
              <>
                {/* Page Heading */}
                <div className="mb-10">
                  <h1 className="text-[#141414] text-4xl font-black leading-tight tracking-tight mb-3">
                    Reset Password
                  </h1>
                  <p className="text-neutral-500 text-base font-medium leading-normal">
                    Enter your new password below. Make it at least 6 characters
                    long.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {/* New Password */}
                  <label className="flex flex-col gap-2">
                    <span className="text-[#141414] text-sm font-bold leading-normal">
                      New Password
                    </span>
                    <div className="flex w-full items-center rounded-xl bg-white border border-[#dbdbdb] focus-within:border-[#141414] focus-within:ring-1 focus-within:ring-[#141414] transition-all overflow-hidden h-14">
                      <div className="flex items-center justify-center pl-4 text-neutral-400">
                        <span className="material-symbols-outlined">lock</span>
                      </div>
                      <input
                        id="reset-password-new"
                        className="flex-1 w-full h-full bg-transparent border-none focus:ring-0 text-[#141414] placeholder:text-neutral-400 px-3 text-base font-medium outline-none"
                        placeholder="Enter new password"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
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

                  {/* Confirm Password */}
                  <label className="flex flex-col gap-2">
                    <span className="text-[#141414] text-sm font-bold leading-normal">
                      Confirm Password
                    </span>
                    <div className="flex w-full items-center rounded-xl bg-white border border-[#dbdbdb] focus-within:border-[#141414] focus-within:ring-1 focus-within:ring-[#141414] transition-all overflow-hidden h-14">
                      <div className="flex items-center justify-center pl-4 text-neutral-400">
                        <span className="material-symbols-outlined">
                          lock_clock
                        </span>
                      </div>
                      <input
                        id="reset-password-confirm"
                        className="flex-1 w-full h-full bg-transparent border-none focus:ring-0 text-[#141414] placeholder:text-neutral-400 px-3 text-base font-medium outline-none"
                        placeholder="Re-enter your password"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </label>

                  <button
                    id="reset-password-submit"
                    type="submit"
                    disabled={isLoading}
                    className="mt-4 flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-4 bg-[#141414] text-white hover:bg-neutral-800 transition-colors shadow-lg shadow-neutral-200 text-base font-bold leading-normal disabled:opacity-70"
                  >
                    {isLoading ? (
                      <span className="animate-pulse">Resetting...</span>
                    ) : (
                      <>
                        <span className="mr-2">Set New Password</span>
                        <span className="material-symbols-outlined text-sm">
                          check_circle
                        </span>
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* Success State */
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-green-600 text-4xl">
                    check_circle
                  </span>
                </div>
                <h1 className="text-[#141414] text-3xl font-black leading-tight tracking-tight mb-3">
                  Password Reset!
                </h1>
                <p className="text-neutral-500 text-base font-medium leading-normal max-w-sm mx-auto">
                  Your password has been successfully updated. You can now log
                  in with your new credentials.
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="mt-8 flex w-full max-w-xs mx-auto cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-4 bg-[#141414] text-white hover:bg-neutral-800 transition-colors shadow-lg text-base font-bold"
                >
                  <span className="mr-2">Go to Login</span>
                  <span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </button>
              </div>
            )}

            {/* Back to Login */}
            {!isSuccess && (
              <div className="mt-8 pt-6 border-t border-dashed border-neutral-200 text-center">
                <p className="text-neutral-500 text-base font-medium">
                  Remember your password?{" "}
                  <Link
                    to="/login"
                    className="text-[#141414] font-bold hover:underline decoration-2 underline-offset-4"
                  >
                    Back to Login
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:hidden h-2 bg-gradient-to-r from-green-400 to-emerald-600 mt-auto"></div>
      </div>
    </div>
  );
};

export default ResetPassword;
