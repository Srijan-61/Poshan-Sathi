
import type { Log } from "./types";

interface Props {
  logs: Log[];
}

export default function RecentExpenses({ logs }: Props) {
  const card = "bg-white border-neutral-100 shadow-sm";
  const heading = "text-neutral-900";
  const subtext = "text-neutral-500";

  return (
    <section className={`rounded-3xl p-6 border ${card}`}>
      <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${heading}`}>
        <span className="material-symbols-outlined text-green-600">
          receipt_long
        </span>
        Recent Expenses
      </h3>
      
      {logs.length === 0 ? (
        <div className={`text-center p-8 font-medium ${subtext}`}>
          No expenses tracked yet.
        </div>
      ) : (
        <ul className={`divide-y ${"divide-neutral-100"}`}>
          {logs.slice(0, 5).map((log) => (
            <li
              key={log._id}
              className="py-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  "bg-neutral-50 text-neutral-500"
                }`}>
                  <span className="material-symbols-outlined">restaurant</span>
                </div>
                <div className="flex flex-col">
                  <span className={`font-bold text-lg ${heading}`}>
                    {log.food_name}
                  </span>
                  <span className={`text-xs font-bold ${subtext}`}>
                    {new Date(log.date).toLocaleDateString()} • {log.quantity}x
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className={`font-bold text-lg block ${heading}`}>
                  Rs. {log.cost}
                </span>
                <span className="text-xs font-bold text-orange-500">
                  {log.calories} kcal
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
