import React from "react";
import { NavLink } from "react-router-dom";

const MobileNav: React.FC = () => {
  const navItems = [
    { name: "Home", path: "/", icon: "home" },
    { name: "Cook", path: "/cook", icon: "restaurant" },
    { name: "Menu", path: "/menu", icon: "menu_book" },
    { name: "Log", path: "/history", icon: "history" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
      <div className="flex justify-around items-center h-16 md:h-20 px-2 max-w-md mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200 ${
                isActive
                  ? "text-green-600"
                  : "text-gray-400 hover:text-green-500"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Using fontVariationSettings to toggle the filled state 
                  of the Material Symbols based on whether the route is active 
                */}
                <span
                  className="material-symbols-outlined text-2xl md:text-3xl transition-transform duration-200"
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                    transform: isActive ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  {item.icon}
                </span>
                <span
                  className={`text-[10px] md:text-xs font-bold tracking-wide ${isActive ? "opacity-100" : "opacity-70"}`}
                >
                  {item.name}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
