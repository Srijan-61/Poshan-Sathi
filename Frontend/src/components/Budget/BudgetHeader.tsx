

export default function BudgetHeader() {  
  const heading = "text-neutral-900";
  const subtext = "text-neutral-500";

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
