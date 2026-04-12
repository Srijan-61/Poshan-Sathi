import React from "react";
import { Image as ImageIcon, Link as LinkIcon, Loader2 } from "lucide-react";
import type { IngredientFormState } from "./types";

interface IngredientModalProps {
  isIngredientModalOpen: boolean;
  setIsIngredientModalOpen: (isOpen: boolean) => void;
  ingredientForm: IngredientFormState;
  setIngredientForm: React.Dispatch<React.SetStateAction<IngredientFormState>>;
  handleIngredientSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  ingredientImageMode: "upload" | "url";
  setIngredientImageMode: (mode: "upload" | "url") => void;
  setIngredientImageFile: (file: File | null) => void;
}

export default function IngredientModal({
  isIngredientModalOpen,
  setIsIngredientModalOpen,
  ingredientForm,
  setIngredientForm,
  handleIngredientSubmit,
  isSubmitting,
  ingredientImageMode,
  setIngredientImageMode,
  setIngredientImageFile
}: IngredientModalProps) {
  if (!isIngredientModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-neutral-100 sticky top-0 bg-white z-10 flex justify-between items-center">
          <h2 className="text-xl font-bold text-neutral-900">Add Ingredient</h2>
          <button onClick={() => setIsIngredientModalOpen(false)} className="text-neutral-400 hover:bg-neutral-100 p-2 rounded-full transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <form onSubmit={handleIngredientSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Ingredient Name *</label>
            <input required type="text" value={ingredientForm.name} onChange={e => setIngredientForm({...ingredientForm, name: e.target.value})} className="w-full rounded-lg border border-neutral-200 bg-neutral-50/50 py-2.5 px-4 focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] outline-none transition-all font-medium" placeholder="e.g. Raw Rice" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Calories (per 100g) *</label>
            <input required type="number" min="0" value={ingredientForm.caloriesPer100g} onChange={e => setIngredientForm({...ingredientForm, caloriesPer100g: e.target.value})} className="w-full rounded-lg border border-neutral-200 bg-neutral-50/50 py-2.5 px-4 focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] outline-none transition-all font-medium" />
          </div>

          <div className="grid grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Proteins *</label>
              <input required type="number" min="0" step="0.1" value={ingredientForm.proteinPer100g} onChange={e => setIngredientForm({...ingredientForm, proteinPer100g: e.target.value})} className="w-full rounded-lg border border-neutral-200 bg-neutral-50/50 py-2.5 px-4 focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] outline-none transition-all font-medium" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Carbs *</label>
              <input required type="number" min="0" step="0.1" value={ingredientForm.carbsPer100g} onChange={e => setIngredientForm({...ingredientForm, carbsPer100g: e.target.value})} className="w-full rounded-lg border border-neutral-200 bg-neutral-50/50 py-2.5 px-4 focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] outline-none transition-all font-medium" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Fats *</label>
              <input required type="number" min="0" step="0.1" value={ingredientForm.fatPer100g} onChange={e => setIngredientForm({...ingredientForm, fatPer100g: e.target.value})} className="w-full rounded-lg border border-neutral-200 bg-neutral-50/50 py-2.5 px-4 focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] outline-none transition-all font-medium" />
            </div>
          </div>
          
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-semibold text-neutral-700">Ingredient Image (Cloudinary or URL)</label>
            <div className="flex bg-neutral-50 border border-neutral-200 p-1 rounded-xl w-fit">
              <button type="button" onClick={() => setIngredientImageMode("upload")} className={`px-4 py-1.5 text-xs font-bold rounded-lg flex items-center space-x-2 transition-all ${ingredientImageMode === "upload" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}><ImageIcon size={14} /> <span>Upload File</span></button>
              <button type="button" onClick={() => setIngredientImageMode("url")} className={`px-4 py-1.5 text-xs font-bold rounded-lg flex items-center space-x-2 transition-all ${ingredientImageMode === "url" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}><LinkIcon size={14} /> <span>Direct Link</span></button>
            </div>

            {ingredientImageMode === "upload" ? (
              <input type="file" accept="image/*" onChange={e => setIngredientImageFile(e.target.files?.[0] || null)} className="w-full mt-2 text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#eefaf4] file:text-[#00a86b] hover:file:bg-[#e2f7eb] cursor-pointer" />
            ) : (
              <div className="flex mt-2">
                 <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-neutral-200 bg-neutral-50 text-neutral-500 text-sm"><LinkIcon size={14} /></span>
                 <input type="text" value={ingredientForm.imageUrl} onChange={(e) => setIngredientForm({...ingredientForm, imageUrl: e.target.value})} className="flex-1 px-3 py-2 border border-neutral-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] transition-all" placeholder="https://res.cloudinary.com/..." />
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-neutral-100 flex justify-end gap-3">
            <button type="button" onClick={() => setIsIngredientModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-bold text-white bg-[#00a86b] rounded-lg hover:bg-[#00905a] disabled:opacity-50 flex items-center gap-2 shadow-sm transition-colors">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />} Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
