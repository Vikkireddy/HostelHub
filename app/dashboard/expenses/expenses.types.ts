export interface Expense {
  id: number;
  amount: number;
  category: string;
  description: string | null;
  expense_date: string | null;
  created_at: string;
}

export interface ExpenseFormValues {
  amount: string;
  category: string;
  description: string;
  expense_date: string;
}
