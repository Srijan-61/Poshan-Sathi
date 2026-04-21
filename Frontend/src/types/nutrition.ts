export interface AnalyticsTargets {
  dailyBudget: number;
  monthlyBudget: number;
  dailyRequirements: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    iron: number;
    calcium: number;
    vitaminC: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
}

export const DEFAULT_TARGETS: AnalyticsTargets = {
  dailyBudget: 0,
  monthlyBudget: 0,
  dailyRequirements: {
    calories: 2000,
    protein: 60,
    carbs: 275,
    fats: 70,
    iron: 15,
    calcium: 1000,
    vitaminC: 90,
    fiber: 30,
    sugar: 50,
    sodium: 2300,
  },
};
