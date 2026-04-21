
import type { Ingredient } from "./types";

interface IngredientsTableProps {
  ingredientsList: Ingredient[];
  searchQuery: string;
  currentPage: number;
  itemsPerPage: number;
  onEdit: (ingredient: Ingredient) => void;
  deleteIngredient: (id: string) => void;
}

export default function IngredientsTable({
  ingredientsList,
  searchQuery,
  currentPage,
  itemsPerPage,
  onEdit,
  deleteIngredient
}: IngredientsTableProps) {
  return (
    <div className="w-full">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-neutral-100 bg-white/50">
            <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider w-[40%]">Ingredient</th>
            <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider w-[20%]">Calories (100g)</th>
            <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider text-right w-[40%]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {ingredientsList
            .filter(i => (i.name || "").toLowerCase().includes(searchQuery.toLowerCase()))
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((i) => (
            <tr key={i._id} className="hover:bg-neutral-50/50 transition-colors group">
              <td className="px-6 py-4">
                <p className="font-bold text-neutral-900 group-hover:text-[#00a86b] transition-colors">{i.name}</p>
                <p className="text-xs text-neutral-500">P: {i.protein} / C: {i.carbs} / F: {i.fats}</p>
              </td>
              <td className="px-6 py-4 text-sm font-bold text-neutral-800">
                {i.calories}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onEdit(i)} className="text-neutral-400 hover:text-neutral-900 transition-colors">
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 5-3-3H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2Z"></path><path d="M8 18h1"></path><path d="M18.4 9.6a2 2 0 1 1 3 3L17 17l-4 1 1-4Z"></path></svg>
                  </button>
                  <button onClick={() => deleteIngredient(i._id)} className="text-neutral-400 hover:text-red-500 transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
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
