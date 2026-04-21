interface RecipeDetailsFormProps {
  recipeName: string;
  setRecipeName: (name: string) => void;
  category: string;
  setCategory: (cat: string) => void;
  customPrice: number | "";
  setCustomPrice: (price: number | "") => void;
}

export default function RecipeDetailsForm({
  recipeName,
  setRecipeName,
  category,
  setCategory,
  customPrice,
  setCustomPrice,
}: RecipeDetailsFormProps) {
  const subtext = "text-neutral-500";
  const inputCls = "bg-neutral-50 border-neutral-100 text-neutral-900 placeholder-neutral-400";

  return (
    <div className="space-y-8">
      <div>
        <label className={`mb-3 block text-[11px] font-black uppercase tracking-widest ${subtext}`}>
          Food Name
        </label>
        <input
          type="text"
          required
          className={`w-full rounded-2xl border p-4 font-bold text-lg transition-all focus:border-green-500 focus:ring-4 focus:ring-green-500/10 focus:outline-none shadow-sm ${inputCls}`}
          placeholder="e.g. Srijan's Special Dal Bhat"
          value={recipeName}
          onChange={(e) => setRecipeName(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`mb-3 block text-[11px] font-black uppercase tracking-widest ${subtext}`}>
            Category
          </label>
          <div className="relative">
            <select
              className={`w-full appearance-none rounded-2xl border p-4 font-bold text-lg transition-all focus:border-green-500 focus:ring-4 focus:ring-green-500/10 focus:outline-none shadow-sm ${inputCls}`}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Meals">Meals</option>
              <option value="Snacks">Snacks</option>
              <option value="Drinks">Drinks</option>
              <option value="Desserts">Desserts</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
              <span className="material-symbols-outlined">expand_more</span>
            </div>
          </div>
        </div>

        <div>
          <label className={`mb-3 block text-[11px] font-black uppercase tracking-widest ${subtext}`}>
            Custom Sale Price (Rs.)
          </label>
          <input
            type="number"
            min="0"
            className={`w-full rounded-2xl border p-4 font-bold text-lg transition-all focus:border-green-500 focus:ring-4 focus:ring-green-500/10 focus:outline-none shadow-sm ${inputCls}`}
            placeholder="Auto-calculated if empty"
            value={customPrice}
            onChange={(e) => setCustomPrice(e.target.value ? Number(e.target.value) : "")}
          />
        </div>
      </div>
    </div>
  );
}
