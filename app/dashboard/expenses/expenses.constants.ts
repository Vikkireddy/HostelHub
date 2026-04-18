import type { ExpenseFormValues } from "./expenses.types";

/** Category value that requires linking an active staff member */
export const STAFF_SALARY_CATEGORY = "Staff Salary" as const;

export const EXPENSE_CATEGORIES = [
  "Utilities",
  "Maintenance",
  STAFF_SALARY_CATEGORY,
  "Security",
  "Cleaning",
  "Food & Catering",
  "Internet",
  "Miscellaneous",
] as const;

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

export const initialExpenseForm: ExpenseFormValues = {
  amount: "",
  category: "",
  description: "",
  expense_date: new Date().toISOString().slice(0, 10),
  staff_member_id: "",
};
