import React from "react";
import { Search, Filter } from "lucide-react";

interface TableControlsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
}

export default function TableControls({
  searchQuery,
  setSearchQuery,
  setCurrentPage
}: TableControlsProps) {
  return (
    <div className="flex items-center justify-between p-6 border-b border-neutral-100">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          placeholder="Search items by name..." 
          className="pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm w-72 focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] transition-all"
        />
      </div>
      <div className="flex gap-3">
        <button className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
          <Filter size={16} />
          <span>Filter</span>
        </button>
      </div>
    </div>
  );
}
