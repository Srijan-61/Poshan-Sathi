export interface Food {
  _id: string;
  food_name: string;
  calories: number;
  price: number;
  image?: string;
}

export interface Log {
  _id: string;
  food_name: string;
  calories: number;
  cost: number;
  quantity: number;
  createdAt?: string;
  date?: string;
}

export interface Props {
  logs: Log[];
  foods: Food[];
  onLog: (food: any, qty: number) => void;
  onDelete: (id: string) => void;
}
