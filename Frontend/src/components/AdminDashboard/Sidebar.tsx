
import { Users, Database, Carrot, LogOut, Leaf } from "lucide-react";
import type { TabType } from "./types";

interface SidebarProps {
  user: any;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  setCurrentPage: (page: number) => void;
  setSearchQuery: (query: string) => void;
  handleLogout: () => void;
}

export default function Sidebar({
  user,
  activeTab,
  setActiveTab,
  setCurrentPage,
  setSearchQuery,
  handleLogout
}: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-neutral-200/60 flex flex-col justify-between shrink-0 h-full">
      <div>
        {/* Logo */}
        <div className="h-20 flex items-center px-6">
          <div className="flex bg-[#00a86b] text-white p-1.5 rounded-lg mr-3">
            <Leaf size={20} fill="currentColor" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight">Poshan Sathi</h1>
            <span className="text-xs text-[#00a86b] font-semibold space-x-1">Admin Console</span>
          </div>
        </div>

        {/* Nav Menu */}
        <nav className="mt-4 px-4 space-y-1">
          <button 
            onClick={() => { setActiveTab("users"); setCurrentPage(1); setSearchQuery(""); }}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${activeTab === "users" ? "text-[#00a86b] bg-[#eefaf4]" : "text-neutral-500 hover:bg-neutral-50"}`}
          >
            <Users size={18} />
            <span>Users</span>
          </button>
          <button 
            onClick={() => { setActiveTab("foods"); setCurrentPage(1); setSearchQuery(""); }}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${activeTab === "foods" ? "text-[#00a86b] bg-[#eefaf4]" : "text-neutral-500 hover:bg-neutral-50"}`}
          >
            <Database size={18} />
            <span>Food Database</span>
          </button>
          <button 
            onClick={() => { setActiveTab("ingredients"); setCurrentPage(1); setSearchQuery(""); }}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${activeTab === "ingredients" ? "text-[#00a86b] bg-[#eefaf4]" : "text-neutral-500 hover:bg-neutral-50"}`}
          >
            <Carrot size={18} />
            <span>Ingredients</span>
          </button>
        </nav>
      </div>

      {/* Footer Profile */}
      <div className="p-4 border-t border-neutral-200/60">
        <div 
          onClick={handleLogout}
          className="flex items-center justify-between p-2 hover:bg-neutral-50 rounded-xl transition-colors cursor-pointer group"
        >
          <div className="flex items-center space-x-3">
            <img src={`https://ui-avatars.com/api/?name=${user?.name || "Admin"}&background=111827&color=fff`} alt={user?.name || "Admin"} className="w-10 h-10 rounded-full" />
            <div>
              <p className="text-sm font-semibold">{user?.name || "Admin"}</p>
              <p className="text-xs text-neutral-400">Super Admin</p>
            </div>
          </div>
          <div className="text-neutral-400 group-hover:text-red-500 p-1.5 transition-colors">
            <LogOut size={16} />
          </div>
        </div>
      </div>
    </aside>
  );
}
