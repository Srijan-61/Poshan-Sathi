import React from "react";
import { Image as ImageIcon } from "lucide-react";
import type { Food } from "./types";

interface FoodsTableProps {
  foodsList: Food[];
  searchQuery: string;
  currentPage: number;
  itemsPerPage: number;
  handleOpenFoodModal: (food: Food) => void;
  deleteFood: (id: string) => void;
}

export default function FoodsTable({
  foodsList,
  searchQuery,
  currentPage,
  itemsPerPage,
  handleOpenFoodModal,
  deleteFood
}: FoodsTableProps) {
  return (
    <div className="w-full">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-neutral-100 bg-white/50">
            <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider w-[40%]">Food Item</th>
            <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider w-[20%]">Category</th>
            <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider w-[20%]">Calories</th>
            <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider text-right w-[20%]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {foodsList
            .filter(f => (f.food_name || f.name || "").toLowerCase().includes(searchQuery.toLowerCase()))
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((f) => (
            <tr key={f._id} className="hover:bg-neutral-50/50 transition-colors group">
              <td className="px-6 py-4">
                <div className="flex items-center space-x-4">
                  {f.image ? (
                    <img src={f.image} className="w-10 h-10 rounded-md object-cover border border-neutral-100" alt={f.food_name || f.name} />
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-neutral-50 flex items-center justify-center text-neutral-400 border border-neutral-100">
                      <ImageIcon size={16} />
                    </div>
                  )}
                  <div className="min-w-0 flex items-center h-10">
                    <p className="font-bold text-neutral-900 group-hover:text-[#00a86b] transition-colors truncate">{f.food_name || f.name}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-neutral-100 text-neutral-600 uppercase">
                  {f.category}
                </span>
              </td>
              <td className="px-6 py-4 text-sm font-bold text-neutral-800">
                {f.calories}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end space-x-2">
                  <button onClick={() => handleOpenFoodModal(f)} className="p-2 text-neutral-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                  </button>
                  <button onClick={() => deleteFood(f._id)} className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
