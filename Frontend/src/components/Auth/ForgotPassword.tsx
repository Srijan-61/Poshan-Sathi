import React, { useState } from "react";
import axios from "../../utils/axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post("/api/auth/forgot-password", { email });
      setIsSubmitted(true);
      toast.success("Reset link sent! Check your email.");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Something went wrong. Please try again."
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
              <span className="material-symbols-outlined text-4xl">lock_reset</span>
              <span className="text-sm font-bold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                Account Recovery
              </span>
            </div>
            <h2 className="text-5xl font-extrabold leading-tight tracking-tight">
              Don't worry, it happens to the best of us.
            </h2>
            <p className="text-lg text-neutral-200 font-medium leading-relaxed">
              Enter your email and we'll send you a secure link to reset your
              password in minutes.
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
            {!isSubmitted ? (
              <>
                {/* Page Heading */}
                <div className="mb-10">
                  <h1 className="text-[#141414] text-4xl font-black leading-tight tracking-tight mb-3">
                    Forgot Password?
                  </h1>
                  <p className="text-neutral-500 text-base font-medium leading-normal">
                    Enter the email address linked to your account and we'll
                    send you a password reset link.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <label className="flex flex-col gap-2">
                    <span className="text-[#141414] text-sm font-bold leading-normal">
                      Email Address
                    </span>
                    <div className="flex w-full items-center rounded-xl bg-white border border-[#dbdbdb] focus-within:border-[#141414] focus-within:ring-1 focus-within:ring-[#141414] transition-all overflow-hidden h-14">
                      <div className="flex items-center justify-center pl-4 text-neutral-400">
                        <span className="material-symbols-outlined">mail</span>
                      </div>
                      <input
                        id="forgot-password-email"
                        className="flex-1 w-full h-full bg-transparent border-none focus:ring-0 text-[#141414] placeholder:text-neutral-400 px-3 text-base font-medium outline-none"
                        placeholder="Enter your email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </label>

                  <button
                    id="forgot-password-submit"
                    type="submit"
                    disabled={isLoading}
                    className="mt-4 flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-4 bg-[#141414] text-white hover:bg-neutral-800 transition-colors shadow-lg shadow-neutral-200 text-base font-bold leading-normal disabled:opacity-70"
                  >
                    {isLoading ? (
                      <span className="animate-pulse">Sending link...</span>
                    ) : (
                      <>
                        <span className="mr-2">Send Reset Link</span>
                        <span className="material-symbols-outlined text-sm">
                          send
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
                    mark_email_read
                  </span>
                </div>
                <h1 className="text-[#141414] text-3xl font-black leading-tight tracking-tight mb-3">
                  Check your email
                </h1>
                <p className="text-neutral-500 text-base font-medium leading-normal max-w-sm mx-auto">
                  We've sent a password reset link to{" "}
                  <strong className="text-[#141414]">{email}</strong>. The link
                  will expire in 10 minutes.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="mt-6 text-sm text-neutral-500 hover:text-[#141414] transition-colors underline underline-offset-4 font-medium"
                >
                  Didn't receive it? Send again
                </button>
              </div>
            )}

            {/* Back to Login */}
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
          </div>
        </div>

        <div className="lg:hidden h-2 bg-gradient-to-r from-green-400 to-emerald-600 mt-auto"></div>
      </div>
    </div>
  );
};

export default ForgotPassword;
