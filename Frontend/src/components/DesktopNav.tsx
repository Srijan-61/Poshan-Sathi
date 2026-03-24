import React from "react";
import { Link, useLocation } from "react-router-dom";

const DesktopNav: React.FC = () => {
  const location = useLocation();

  // Helper to style active links
  const getLinkClass = (path: string) => {
    const baseClass =
      "text-sm font-semibold transition-colors px-3 py-2 rounded-lg ";
    const activeClass = "text-green-700 bg-green-50";
    const inactiveClass = "text-gray-600 hover:text-green-700 hover:bg-gray-50";

    return location.pathname === path
      ? baseClass + activeClass
      : baseClass + inactiveClass;
  };

  return (
    <nav className="hidden md:flex w-full bg-white border-b border-gray-100 px-8 py-3 justify-between items-center sticky top-0 z-50">
      {/* Left: Brand / Logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 group-hover:bg-green-600 group-hover:text-white transition-colors">
          <span className="material-symbols-outlined">eco</span>
        </div>
        <span className="font-extrabold text-xl text-gray-800 tracking-tight">
          Poshan Sathi
        </span>
      </Link>

      {/* Center: Navigation Links */}
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

      {/* Right: Profile & Actions */}
      <div className="flex items-center gap-4">
        <Link
          to="/profile"
          className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-100 cursor-pointer hover:border-green-500 transition-colors block"
        >
          <img
            src="https://ui-avatars.com/api/?name=Srijan+Bhandari&background=f0fdf4&color=15803d"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </Link>
      </div>
    </nav>
  );
};

export default DesktopNav;
