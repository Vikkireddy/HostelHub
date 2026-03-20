import type { ExpenseFormValues } from "./expenses.types";

export const EXPENSE_CATEGORIES = [
  "Utilities",
  "Maintenance",
  "Staff Salary",
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
};
