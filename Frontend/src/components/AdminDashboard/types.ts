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
  calories: number | string;
  protein: number | string;
  carbs: number | string;
  fats: number | string;
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
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
  imageUrl: string;
}
