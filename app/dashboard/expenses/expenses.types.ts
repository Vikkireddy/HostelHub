export interface Expense {
  id: number;
  amount: number;
  category: string;
  description: string | null;
  expense_date: string | null;
  created_at: string;
  /** Present when DB migration linked staff to expense */
  staff_member_id?: number | null;
  staff_name?: string | null;
}

export interface ExpenseFormValues {
  amount: string;
  category: string;
  description: string;
  expense_date: string;
  /** Staff row id as string for select; empty when not Staff Salary */
  staff_member_id: string;
}
