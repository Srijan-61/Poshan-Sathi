import { getProgressColor } from "./utils";

interface Props {
  todaySpent: number;
  monthSpent: number;
  monthlyBudgetGoal: number;
  monthlyPercent: number;
}

export default function FinancialSummary({
  todaySpent,
  monthSpent,
  monthlyBudgetGoal,
  monthlyPercent,
}: Props) {
  const cardBase = "bg-white border-neutral-200 shadow-sm";
  const heading = "text-neutral-900";
  const subtext = "text-neutral-500";
  const progressBg = "bg-neutral-100";

  const hasBudget = monthlyBudgetGoal > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Today's Spend */}
      <div className={`rounded-xl p-6 border border-l-4 border-l-emerald-500 flex flex-col gap-3 ${cardBase}`}>
        <div className="flex justify-between items-center">
          <p className={`text-[10px] font-bold uppercase tracking-wider ${subtext}`}>
            Today's Spend
          </p>
          <span className="text-emerald-500 text-xl font-extrabold">रु</span>
        </div>
        <h2 className="text-4xl font-extrabold tabular-nums text-emerald-500">
          Rs. {todaySpent}
        </h2>
      </div>

      {/* This Month */}
      <div className={`rounded-xl p-6 border border-l-4 border-l-indigo-500 flex flex-col gap-3 ${cardBase}`}>
        <div className="flex justify-between items-center">
          <p className={`text-[10px] font-bold uppercase tracking-wider ${subtext}`}>
            This Month
          </p>
          <span className="text-indigo-500 text-xl font-extrabold">रु</span>
        </div>
        <div className="flex items-baseline gap-2">
          <h2 className={`text-4xl font-extrabold tabular-nums ${heading}`}>Rs. {monthSpent}</h2>
          {hasBudget && (
            <span className={`font-medium text-sm ${subtext}`}>
              / {monthlyBudgetGoal}
            </span>
          )}
        </div>
        {hasBudget && (
          <div className={`w-full rounded-full h-2 overflow-hidden ${progressBg}`}>
            <div
              className={`h-full rounded-full transition-all ${getProgressColor(monthlyPercent)}`}
              style={{ width: `${monthlyPercent}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}
