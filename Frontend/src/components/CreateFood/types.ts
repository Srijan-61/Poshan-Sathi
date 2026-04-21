export type IngredientSource = "local" | "edamam" | "recipe";

export interface Ingredient {
  _id: string;
  name: string;
  calories: number;
  price: number;
  type: "raw" | "cooked";
  source?: IngredientSource;
  edamamFoodId?: string;
  protein?: number;
  carbs?: number;
  fats?: number;
  micros?: {
    iron?: number;
    calcium?: number;
    vitaminC?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
  owner?: string | null;
  ingredients?: any[];
  category?: string;
}

export interface AddedItem {
  ingredient: Ingredient;
  qty: number;
  cals: number;
  cost: number;
  /** Nepali/voice alias that matched this ingredient, shown in brackets */
  matchedAlias?: string;
}

export interface Props {
  onFoodCreated: () => void;
}
