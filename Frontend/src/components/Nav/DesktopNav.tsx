import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const DesktopNav: React.FC = () => {
  const location = useLocation();
  const { isDark, toggleDark } = useTheme();

  const getLinkClass = (path: string) => {
    const baseClass =
      "text-sm font-semibold transition-colors px-3 py-2 rounded-lg ";
    const activeClass = isDark
      ? "text-green-400 bg-green-900/30"
      : "text-green-700 bg-green-50";
    const inactiveClass = isDark
      ? "text-neutral-400 hover:text-green-400 hover:bg-neutral-800"
      : "text-neutral-600 hover:text-green-700 hover:bg-neutral-50";

    return location.pathname === path
      ? baseClass + activeClass
      : baseClass + inactiveClass;
  };

  const userInfoStr = localStorage.getItem("userInfo");
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
  const userName = userInfo?.name || "User";
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    userName,
  )}&background=${isDark ? "1f2937" : "f0fdf4"}&color=${isDark ? "86efac" : "15803d"}`;

  return (
    <nav className={`hidden md:flex w-full border-b px-8 py-3 justify-between items-center sticky top-0 z-50 transition-colors duration-300 ${
      isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
    }`}>
      {/* Left: Brand / Logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <span className={`font-extrabold text-xl tracking-tight ${isDark ? "text-white" : "text-neutral-800"}`}>
          Poshan Sathi
        </span>
      </Link>

      {/* Center: Navigation Links */}
      {userInfo?.role !== 'admin' && (
        <div className="flex gap-2">
          <Link to="/" className={getLinkClass("/")}>
            Dashboard
          </Link>
          <Link to="/history" className={getLinkClass("/history")}>
            Food Log
          </Link>
          <Link to="/menu" className={getLinkClass("/menu")}>
            Recipes
          </Link>
          <Link to="/cook" className={getLinkClass("/cook")}>
            Cook
          </Link>
          <Link to="/budget" className={getLinkClass("/budget")}>
            Budget
          </Link>
        </div>
      )}

      {/* Right: Dark Mode Toggle + Profile */}
      <div className="flex items-center gap-3">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDark}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
            isDark
              ? "bg-neutral-800 text-yellow-300 hover:bg-neutral-700"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          }`}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          <span className="material-symbols-outlined text-lg">
            {isDark ? "light_mode" : "dark_mode"}
          </span>
        </button>

        {/* Profile dropdown */}
        <div className="relative group">
          <div className="flex items-center gap-4 cursor-pointer">
            <div className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-colors ${
              isDark ? "border-neutral-700 group-hover:border-green-400" : "border-neutral-100 group-hover:border-green-500"
            }`}>
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-in-out z-50">
            <div className={`w-48 border rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] py-2 ${
              isDark ? "bg-neutral-800 border-neutral-700" : "bg-white border-neutral-100"
            }`}>
               {userInfo?.role !== 'admin' && (
                <Link
                  to="/profile"
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                    isDark ? "text-neutral-300 hover:bg-neutral-700 hover:text-green-400" : "text-neutral-700 hover:bg-green-50 hover:text-green-700"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    person
                  </span>
                  Profile
                </Link>
              )}
              {userInfo?.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                    isDark ? "text-neutral-300 hover:bg-neutral-700 hover:text-green-400" : "text-neutral-700 hover:bg-green-50 hover:text-green-700"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    admin_panel_settings
                  </span>
                  Admin Panel
                </Link>
              )}
              <button
                onClick={() => {
                  localStorage.removeItem("userInfo");
                  window.location.href = "/login";
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
              >
                <span className="material-symbols-outlined text-[20px]">
                  logout
                </span>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DesktopNav;
