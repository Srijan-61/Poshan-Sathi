export interface Log {
  _id: string;
  food_name: string;
  calories: number;
  cost: number;
  quantity: number;
  date: string;
}

export interface BudgetProps {
  monthlyBudgetGoal: number;
}
