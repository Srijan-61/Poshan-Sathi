import React from "react";
import { Link, useLocation } from "react-router-dom";

const DesktopNav: React.FC = () => {
  const location = useLocation();
  const getLinkClass = (path: string) => {
    const baseClass = "text-sm font-semibold transition-colors px-3 py-2 rounded-lg ";
    const activeClass = "text-green-700 bg-green-50";
    const inactiveClass = "text-neutral-600 hover:text-green-700 hover:bg-neutral-50";

    return location.pathname === path
      ? baseClass + activeClass
      : baseClass + inactiveClass;
  };

  const userInfoStr = localStorage.getItem("userInfo");
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
  const userName = userInfo?.name || "User";
  
  // High priority: Use the uploaded profile image if available
  // Fallback: Use UI Avatars based on the user's name
  const avatarUrl = userInfo?.profileImage 
    ? userInfo.profileImage 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=f0fdf4&color=15803d`;

  return (
    <nav className="hidden md:block w-full border-b sticky top-0 z-50 glass-nav border-neutral-100/50">
      <div className="max-w-7xl mx-auto flex w-full px-8 py-3 justify-between items-center">
        {/* Left: Brand / Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="font-extrabold text-xl tracking-tight text-neutral-800">
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
              Food Library
            </Link>
            <Link to="/cook" className={getLinkClass("/cook")}>
              Cook
            </Link>
            <Link to="/budget" className={getLinkClass("/budget")}>
              Budget
            </Link>
          </div>
        )}

        {/* Right: Profile */}
        <div className="flex items-center gap-3">
          {/* Profile dropdown */}
          <div className="relative group">
            <div className="flex items-center gap-4 cursor-pointer">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-neutral-100 group-hover:border-green-500 transition-colors">
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-in-out z-50">
              <div className="w-48 border rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] py-2 bg-white border-neutral-100">
                {userInfo?.role !== 'admin' && (
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors text-neutral-700 hover:bg-green-50 hover:text-green-700"
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
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors text-neutral-700 hover:bg-green-50 hover:text-green-700"
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
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
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
      </div>
    </nav>
  );
};

export default DesktopNav;
