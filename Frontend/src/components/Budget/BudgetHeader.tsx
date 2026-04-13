
import { useTheme } from "../../context/ThemeContext";

export default function BudgetHeader() {
  const { isDark } = useTheme();
  
  const heading = isDark ? "text-white" : "text-neutral-900";
  const subtext = isDark ? "text-neutral-400" : "text-neutral-500";

  return (
    <section className="flex flex-col gap-2">
      <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${heading}`}>
        Budget Analytics
      </h1>
      <p className={`text-lg font-medium ${subtext}`}>
        Track your expenses and get smart meal recommendations.
      </p>
    </section>
  );
}
