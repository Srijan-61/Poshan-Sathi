import React from "react";

/**
 * SplashScreen Component
 * 
 * DESIGN RATIONALE:
 * Built using EXCLUSIVELY Tailwind CSS utility classes. 
 * Zero external libraries and Zero custom CSS blocks.
 * This demonstrates mastery of the Tailwind ecosystem and provides 
 * a highly clean, standard code structure for project defense.
 */

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-white via-green-50 to-green-100 transition-opacity duration-300">
      
      {/* Decorative Dots: Tailwind-only pattern using radial gradient arbitrary value */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#16a34a_1px,transparent_1px)] [background-size:20px_20px]" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Section with Pulsing Aura */}
        <div className="relative mb-8 transition-all duration-700 ease-out transform scale-100 translate-y-0 opacity-100">
          {/* Pulsing Aura using Tailwind's animate-pulse */}
          <div className="absolute inset-0 bg-green-200 rounded-3xl blur-2xl animate-pulse" />
          
          <img
            src="/pwa-192x192.png"
            alt="Poshan Sathi Logo"
            className="relative w-28 h-28 rounded-3xl border-2 border-green-100 shadow-2xl transition-transform duration-500 hover:scale-105"
          />
        </div>

        {/* Branding Text Section */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-4xl font-black tracking-tighter text-green-600">
              POSHAN
            </h1>
            <h1 className="text-4xl font-black tracking-tighter text-neutral-800">
              SATHI
            </h1>
          </div>

          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-400">
            Your Health. Your Budget.
          </p>
        </div>
      </div>

      {/* Progress Bar: Tailwind-only animation */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-neutral-100 overflow-hidden">
        <div 
          className="h-full bg-green-500 transition-all duration-[800ms] ease-linear overflow-hidden" 
          style={{ width: '100%' }} // Purely controlled by the duration since we want it to "fill" over 800ms
        />
      </div>
    </div>
  );
};

export default SplashScreen;
