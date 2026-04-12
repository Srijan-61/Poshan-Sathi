import React from "react";
import { X, Image as ImageIcon, Link as LinkIcon, Loader2 } from "lucide-react";
import type { FoodFormState } from "./types";

interface FoodModalProps {
  isFoodModalOpen: boolean;
  setIsFoodModalOpen: (isOpen: boolean) => void;
  editingFoodId: string | null;
  foodForm: FoodFormState;
  setFoodForm: React.Dispatch<React.SetStateAction<FoodFormState>>;
  handleFoodSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  foodImageMode: "upload" | "url";
  setFoodImageMode: (mode: "upload" | "url") => void;
  setFoodImageFile: (file: File | null) => void;
}

export default function FoodModal({
  isFoodModalOpen,
  setIsFoodModalOpen,
  editingFoodId,
  foodForm,
  setFoodForm,
  handleFoodSubmit,
  isSubmitting,
  foodImageMode,
  setFoodImageMode,
  setFoodImageFile
}: FoodModalProps) {
  if (!isFoodModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
          <div>
            <h3 className="text-xl font-bold">{editingFoodId ? 'Edit Food Profile' : 'Add New Food'}</h3>
            <p className="text-sm text-neutral-500 mt-1">Configure macros, micros, and dietary categorization.</p>
          </div>
          <button 
            onClick={() => setIsFoodModalOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="foodForm" onSubmit={handleFoodSubmit} className="space-y-8">
            
            {/* 1. Basic Information */}
            <div>
              <h4 className="flex items-center text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-[#00a86b]/10 text-[#00a86b] flex items-center justify-center mr-2 text-xs">1</span> Basic Info
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-neutral-700">Food Name</label>
                  <input required type="text" value={foodForm.food_name} onChange={(e) => setFoodForm({...foodForm, food_name: e.target.value})} className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] transition-all" placeholder="e.g. Chicken Dal Bhat" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700">Category</label>
                  <select required value={foodForm.category} onChange={(e) => setFoodForm({...foodForm, category: e.target.value})} className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] transition-all">
                    <option value="Meal">Meal (Bhat, Roti, Thali)</option>
                    <option value="Snack">Snack (Momo, Chowmein)</option>
                    <option value="Curry">Curry / Soup (Tarkari, Dal)</option>
                    <option value="Breakfast">Breakfast / Sweet</option>
                    <option value="Staple">Staple</option>
                    <option value="Fruit">Fruit</option>
                    <option value="Vegetable">Vegetable</option>
                    <option value="Beverage">Beverage</option>
                    <option value="Select">Other Component</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700">Estimated Price (NPR)</label>
                  <input required type="number" min="0" value={foodForm.price} onChange={(e) => setFoodForm({...foodForm, price: Number(e.target.value)})} className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] transition-all" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-neutral-700">Food Image (Cloudinary or URL)</label>
                  <div className="flex bg-neutral-50 border border-neutral-200 p-1 rounded-xl mb-3 w-fit">
                    <button type="button" onClick={() => setFoodImageMode("upload")} className={`px-4 py-1.5 text-xs font-bold rounded-lg flex items-center space-x-2 transition-all ${foodImageMode === "upload" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}><ImageIcon size={14} /> <span>Upload File</span></button>
                    <button type="button" onClick={() => setFoodImageMode("url")} className={`px-4 py-1.5 text-xs font-bold rounded-lg flex items-center space-x-2 transition-all ${foodImageMode === "url" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}><LinkIcon size={14} /> <span>Direct Link</span></button>
                  </div>

                  {foodImageMode === "upload" ? (
                    <input type="file" accept="image/*" onChange={e => setFoodImageFile(e.target.files?.[0] || null)} className="w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#eefaf4] file:text-[#00a86b] hover:file:bg-[#e2f7eb] cursor-pointer" />
                  ) : (
                    <div className="flex">
                       <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-neutral-200 bg-neutral-50 text-neutral-500 text-sm"><LinkIcon size={14} /></span>
                       <input type="text" value={foodForm.imageUrl} onChange={(e) => setFoodForm({...foodForm, imageUrl: e.target.value})} className="flex-1 px-3 py-2 border border-neutral-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] transition-all" placeholder="https://res.cloudinary.com/..." />
                    </div>
                  )}
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-neutral-700">Keywords (Comma Separated)</label>
                  <input type="text" value={foodForm.keywords} onChange={(e) => setFoodForm({...foodForm, keywords: e.target.value})} className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] transition-all" placeholder="e.g. khasi, thali, spicy, momo" />
                </div>
              </div>
            </div>

            {/* 2. Macronutrients */}
            <div>
              <h4 className="flex items-center text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-[#00a86b]/10 text-[#00a86b] flex items-center justify-center mr-2 text-xs">2</span> Macronutrients
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700">Calories</label>
                  <div className="relative"><input required type="number" step="any" min="0" value={foodForm.calories} onChange={(e) => setFoodForm({...foodForm, calories: Number(e.target.value)})} className="w-full pl-3 pr-8 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] transition-all" /><span className="absolute right-3 top-2.5 text-xs text-neutral-400">kcal</span></div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700">Protein</label>
                  <div className="relative"><input required type="number" step="any" min="0" value={foodForm.protein} onChange={(e) => setFoodForm({...foodForm, protein: Number(e.target.value)})} className="w-full pl-3 pr-8 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] transition-all" /><span className="absolute right-3 top-2.5 text-xs text-neutral-400">g</span></div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700">Carbs</label>
                  <div className="relative"><input required type="number" step="any" min="0" value={foodForm.carbs} onChange={(e) => setFoodForm({...foodForm, carbs: Number(e.target.value)})} className="w-full pl-3 pr-8 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] transition-all" /><span className="absolute right-3 top-2.5 text-xs text-neutral-400">g</span></div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700">Fats</label>
                  <div className="relative"><input required type="number" step="any" min="0" value={foodForm.fats} onChange={(e) => setFoodForm({...foodForm, fats: Number(e.target.value)})} className="w-full pl-3 pr-8 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] transition-all" /><span className="absolute right-3 top-2.5 text-xs text-neutral-400">g</span></div>
                </div>
              </div>
            </div>

            {/* 3. Micronutrients */}
            <div>
              <h4 className="flex items-center text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-[#00a86b]/10 text-[#00a86b] flex items-center justify-center mr-2 text-xs">3</span> Micronutrients
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700">Iron <span className="text-[10px] text-neutral-400 font-normal ml-1">(mg)</span></label>
                  <input type="number" step="any" value={foodForm.micronutrients.iron} onChange={(e) => setFoodForm({...foodForm, micronutrients: {...foodForm.micronutrients, iron: Number(e.target.value)}})} className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700">Calcium <span className="text-[10px] text-neutral-400 font-normal ml-1">(mg)</span></label>
                  <input type="number" step="any" value={foodForm.micronutrients.calcium} onChange={(e) => setFoodForm({...foodForm, micronutrients: {...foodForm.micronutrients, calcium: Number(e.target.value)}})} className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700">Vitamin C <span className="text-[10px] text-neutral-400 font-normal ml-1">(mg)</span></label>
                  <input type="number" step="any" value={foodForm.micronutrients.vitamin_c} onChange={(e) => setFoodForm({...foodForm, micronutrients: {...foodForm.micronutrients, vitamin_c: Number(e.target.value)}})} className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700">Fiber <span className="text-[10px] text-neutral-400 font-normal ml-1">(g)</span></label>
                  <input type="number" step="any" value={foodForm.micronutrients.fiber} onChange={(e) => setFoodForm({...foodForm, micronutrients: {...foodForm.micronutrients, fiber: Number(e.target.value)}})} className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700">Sugar <span className="text-[10px] text-neutral-400 font-normal ml-1">(g)</span></label>
                  <input type="number" step="any" value={foodForm.micronutrients.sugar} onChange={(e) => setFoodForm({...foodForm, micronutrients: {...foodForm.micronutrients, sugar: Number(e.target.value)}})} className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700">Sodium <span className="text-[10px] text-neutral-400 font-normal ml-1">(mg)</span></label>
                  <input type="number" step="any" value={foodForm.micronutrients.sodium} onChange={(e) => setFoodForm({...foodForm, micronutrients: {...foodForm.micronutrients, sodium: Number(e.target.value)}})} className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] transition-all" />
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Modal Footer Controls */}
        <div className="border-t border-neutral-100 p-6 bg-neutral-50 flex items-center justify-end space-x-3 shrink-0">
          <button 
            onClick={() => setIsFoodModalOpen(false)}
            type="button" 
            className="px-5 py-2.5 rounded-xl font-medium text-neutral-600 hover:bg-neutral-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            disabled={isSubmitting}
            form="foodForm"
            type="submit" 
            className="px-6 py-2.5 bg-[#00a86b] hover:bg-[#00905a] text-white rounded-xl shadow-sm shadow-[#00a86b]/20 transition-all font-medium flex items-center space-x-2 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            <span>{editingFoodId ? 'Save Changes' : 'Publish Food'}</span>
          </button>
        </div>
        
      </div>
    </div>
  );
}
