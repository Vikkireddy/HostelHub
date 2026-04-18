"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/AuthStore";
import { fetchWithHostel } from "@/lib/ApiClient";
import { initialExpenseForm } from "./expenses.constants";
import type { Expense, ExpenseFormValues } from "./expenses.types";

export type StaffOptionForExpense = {
  id: number;
  name: string;
  monthly_salary: number;
};

type UseExpensesDataOptions = {
  queryEnabled?: boolean;
};

export function useExpensesData(options?: UseExpensesDataOptions) {
  const queryEnabled = options?.queryEnabled !== false;
  const queryClient = useQueryClient();
  const hostelId = useAuthStore((s) => s.user?.hostelId ?? null);
  const now = new Date();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [form, setForm] = useState<ExpenseFormValues>(initialExpenseForm);
  const [filterMonth, setFilterMonth] = useState(String(now.getMonth() + 1));
  const [filterYear, setFilterYear] = useState(String(now.getFullYear()));

  const { data: expenses = [], isLoading, error } = useQuery<Expense[]>({
    queryKey: ["expenses", hostelId, filterMonth, filterYear],
    queryFn: () =>
      fetchWithHostel(
        `/api/expenses?month=${filterMonth}&year=${filterYear}`,
        hostelId
      ).then((r) => r.json()),
    enabled: Boolean(hostelId) && queryEnabled,
  });

  const { data: staffForExpenses = [], isLoading: isLoadingStaffForExpense } =
    useQuery<StaffOptionForExpense[]>({
      queryKey: ["staff-members", hostelId],
      queryFn: () => fetchWithHostel("/api/staff", hostelId).then((r) => r.json()),
      enabled: Boolean(hostelId) && queryEnabled,
    });

  const createExpense = useMutation({
    mutationFn: async (data: ExpenseFormValues) => {
      const res = await fetchWithHostel("/api/expenses", hostelId, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(data.amount),
          category: data.category,
          description: data.description || null,
          expense_date: data.expense_date || undefined,
          staff_member_id:
            data.staff_member_id.trim() !== "" ? Number(data.staff_member_id) : null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err.detail || err.error || "Failed to add expense";
        throw new Error(msg);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setForm(initialExpenseForm);
      setAddModalOpen(false);
    },
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetchWithHostel(`/api/expenses/${id}`, hostelId, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete expense");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setDeleteModalOpen(false);
      setExpenseToDelete(null);
    },
  });

  const totalAmount = useMemo(
    () => (Array.isArray(expenses) ? expenses : []).reduce((sum, e) => sum + (e.amount ?? 0), 0),
    [expenses]
  );

  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  return {
    expenses: safeExpenses,
    staffForExpenses: Array.isArray(staffForExpenses) ? staffForExpenses : [],
    isLoadingStaffForExpense,
    isLoading,
    error,
    totalAmount,
    filterMonth,
    setFilterMonth,
    filterYear,
    setFilterYear,
    form,
    setForm,
    addModalOpen,
    setAddModalOpen,
    deleteModalOpen,
    setDeleteModalOpen,
    expenseToDelete,
    setExpenseToDelete,
    createExpense,
    deleteExpense,
  };
}
