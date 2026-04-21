import React from "react";
import { NavLink } from "react-router-dom";
import { useScrollDirection } from "../../hooks/useScrollDirection";

const MobileNav: React.FC = () => {
  const scrollDirection = useScrollDirection();
  
  const userInfoStr = localStorage.getItem("userInfo");
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
  
  // Reordered: Home, Log, Cook, Food Library, Budget (Profile removed, now in Top Header)
  const baseNavItems = [
    { name: "Home", path: "/", icon: "home" },
    { name: "Log", path: "/history", icon: "history" },
    { name: "Cook", path: "/cook", icon: "restaurant" },
    { name: "Food Library", path: "/menu", icon: "menu_book" },
    { name: "Budget", path: "/budget", icon: "account_balance_wallet" },
  ];

  // Admins see the admin panel, Profile is purely in MobileHeader now
  const navItems = userInfo?.role === 'admin'
    ? [
        { name: "Admin", path: "/admin", icon: "admin_panel_settings" },
        ...baseNavItems
      ]
    : baseNavItems;

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 md:hidden z-50 transition-transform duration-300 ease-in-out border-t border-neutral-200/50 pb-safe ${
        scrollDirection === "down" 
          ? "translate-y-full" 
          : "translate-y-0"
      }`}
    >
      <div className="glass-mobile-nav flex justify-around items-center h-16 px-2 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 relative ${
                isActive ? "text-green-600" : "text-neutral-400 hover:text-green-500"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined text-2xl transition-all duration-300"
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                    transform: isActive ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  {item.icon}
                </span>
                <span
                  className={`text-[10px] font-bold tracking-tight transition-all duration-300 ${
                    isActive ? "opacity-100" : "opacity-70"
                  }`}
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

