import React from "react";
import { Link } from "react-router-dom";
import { useScrollDirection } from "../../hooks/useScrollDirection";

const MobileHeader: React.FC = () => {
  const scrollDirection = useScrollDirection();

  const userInfoStr = localStorage.getItem("userInfo");
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
  const userName = userInfo?.name || "User";

  return (
    <header
      className={`fixed top-0 left-0 right-0 h-16 md:hidden z-[60] flex items-center justify-between px-6 glass-nav border-b border-neutral-200/30 transition-transform duration-300 ${
        scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <Link to="/" className="flex items-center gap-2">
        <span className="font-extrabold text-lg tracking-tight text-neutral-800">
          Poshan Sathi
        </span>
      </Link>

      <div className="flex items-center gap-4">
        {userInfo && (
          <Link
            to="/profile"
            className="w-8 h-8 rounded-full overflow-hidden border border-neutral-200"
          >
            <img
              src={
                userInfo.profileImage ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=f0fdf4&color=15803d`
              }
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </Link>
        )}
      </div>
    </header>
  );
};

export default MobileHeader;
