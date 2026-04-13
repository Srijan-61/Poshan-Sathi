export interface Food {
  _id: string;
  food_name: string;
  calories: number;
  price: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  category?: string;
  image?: string;
  micros?: {
    iron?: number;
    calcium?: number;
    vitamin_c?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
}

export interface Props {
  onLog: (food: Food, quantity: number) => void;
}
