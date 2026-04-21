export interface CustomHealthTarget {
  nutrient: string;
  type: 'min' | 'max';
  value: number;
  label: string;
}

export interface ProfileData {
  name: string;
  age: number | "";
  gender: string;
  weight: number | "";
  height: number | "";
  activityLevel: string;
  dietType: string;
  monthlyBudget: number | "";
  healthGoals: {
    primaryGoal: string;
  };
  healthConditions: string[];
  profileImage?: string;
  nutrientGoals?: {
    customHealthTargets?: CustomHealthTarget[];
  };
}

export interface DailyRequirements {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
  sodium: number;
  iron: number;
  calcium: number;
  vitaminD: number;
  vitaminB12: number;
  vitaminC: number;
  vitaminA: number;
  potassium: number;
  magnesium: number;
  zinc: number;
  proteinRatio: number;
  carbRatio: number;
  fatRatio: number;
  bmr: number;
  tdee: number;
}

