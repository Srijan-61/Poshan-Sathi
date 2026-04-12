export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Food {
  _id: string;
  food_name?: string;
  name?: string;
  category: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  price?: number;
  image?: string;
  keywords?: string[] | string;
  micros?: {
    iron: number;
    calcium: number;
    vitamin_c: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
}

export interface Ingredient {
  _id: string;
  name: string;
  caloriesPer100g: number | string;
  proteinPer100g: number | string;
  carbsPer100g: number | string;
  fatPer100g: number | string;
  image?: string;
}

export type TabType = "users" | "foods" | "ingredients";

export interface FoodFormState {
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  price: number;
  category: string;
  imageUrl: string;
  keywords: string;
  micronutrients: {
    iron: number;
    calcium: number;
    vitamin_c: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
}

export interface IngredientFormState {
  name: string;
  caloriesPer100g: string;
  proteinPer100g: string;
  carbsPer100g: string;
  fatPer100g: string;
  imageUrl: string;
}
