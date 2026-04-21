interface RecipeSummaryProps {
  totalCalories: number;
  totalPrice: number;
}

export default function RecipeSummary({
  totalCalories,
  totalPrice
}: RecipeSummaryProps) {
  const subtext = "text-neutral-500";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-neutral-100 border-l-4 border-l-orange-500 p-6 bg-white shadow-sm ring-1 ring-black/[0.02]">
        <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${subtext}`}>
          Estimated Energy
        </p>
        <p className="text-3xl font-black tabular-nums text-orange-500 tracking-tight">
          {Math.round(totalCalories)}{" "}
          <span className="text-sm font-bold opacity-60">kcal</span>
        </p>
      </div>
      
      <div className="rounded-2xl border border-neutral-100 border-l-4 border-l-emerald-500 p-6 bg-white shadow-sm ring-1 ring-black/[0.02]">
        <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${subtext}`}>
          Total Market Cost
        </p>
        <p className="text-3xl font-black tabular-nums text-emerald-600 tracking-tight">
          <span className="text-sm font-bold opacity-60">Rs.</span>{" "}
          {Math.round(totalPrice)}
        </p>
      </div>
    </div>
  );
}
