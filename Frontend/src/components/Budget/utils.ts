export const toMonthKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

export const formatMonthLabel = (monthKey: string): string => {
  const [y, m] = monthKey.split("-");
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

export const getProgressColor = (percent: number) => {
  if (percent >= 90) return "bg-red-500";
  if (percent >= 75) return "bg-orange-500";
  return "bg-green-500";
};
