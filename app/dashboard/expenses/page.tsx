"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Box } from "@/components/ui/box";
import { EmptyState } from "@/components/ui/EmptyState";
import { useSubscriptionStore } from "@/lib/SubscriptionStore";
import { planHasAdvancedFeatures } from "@/lib/subscription/planFeatures";
import { useAuthStore } from "@/lib/AuthStore";
import { useExpensesData, type Expense } from "./index";

const ExpensesFiltersBar = dynamic(() =>
  import("./ExpensesFiltersBar").then((m) => m.ExpensesFiltersBar)
);
const ExpensesTable = dynamic(() =>
  import("./ExpensesTable").then((m) => m.ExpensesTable)
);
const AddExpenseDialog = dynamic(() =>
  import("./AddExpenseDialog").then((m) => m.AddExpenseDialog)
);
const DeleteExpenseDialog = dynamic(() =>
  import("./DeleteExpenseDialog").then((m) => m.DeleteExpenseDialog)
);

export default function ExpensesPage() {
  const hostelId = useAuthStore((s) => s.user?.hostelId ?? null);
  const subStatus = useSubscriptionStore((s) => s.status);
  const canQueryExpenses =
    subStatus != null && planHasAdvancedFeatures(subStatus.planId);

  const {
    expenses,
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
  } = useExpensesData({ queryEnabled: canQueryExpenses });

  if (hostelId && subStatus == null) {
    return (
      <Box className="flex items-center justify-center p-16">
        <Typography variant="muted">Loading…</Typography>
      </Box>
    );
  }

  if (subStatus?.planId != null && !planHasAdvancedFeatures(subStatus.planId)) {
    return (
      <Box className="mx-auto max-w-lg rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
        <Typography className="text-lg font-semibold text-slate-900">
          Expense &amp; profit tracking is on Pro
        </Typography>
        <Typography className="mt-2 text-sm text-slate-600">
          Your Base plan covers students, rooms, and payments. Upgrade to Pro for admin expenses,
          profit insights, and full dashboard analytics.
        </Typography>
        <Link
          href="/dashboard/subscription"
          className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          View plans
        </Link>
      </Box>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.category) return;
    createExpense.mutate(form);
  };

  const handleDeleteClick = (expense: Expense) => {
    setExpenseToDelete(expense);
    setDeleteModalOpen(true);
  };

  if (isLoading) {
    return (
      <Box className="flex items-center justify-center p-16">
        <Typography variant="muted">Loading expenses...</Typography>
      </Box>
    );
  }
  if (error) {
    return (
      <Box className="p-8 text-red-600">
        {error instanceof Error ? error.message : "Failed to load expenses"}
      </Box>
    );
  }

  return (
    <Box className="space-y-6">
      <Card className="rounded-xl border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <Box>
            <CardTitle className="text-slate-900">Admin Expenses</CardTitle>
            <CardDescription className="mt-1">
              Track expenses to see profit/loss. This transforms your system into a Hostel ERP.
            </CardDescription>
          </Box>
          <ExpensesFiltersBar
            filterMonth={filterMonth}
            setFilterMonth={setFilterMonth}
            filterYear={filterYear}
            setFilterYear={setFilterYear}
            onAddExpense={() => setAddModalOpen(true)}
          />
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <Box className="flex flex-col items-center justify-center gap-4 py-12">
              <EmptyState
                icon={Wallet}
                title="No expenses recorded"
                message="Add expenses to track costs and calculate profit. This helps you understand your hostel's financial health."
              />
            </Box>
          ) : (
            <ExpensesTable
              expenses={expenses}
              totalAmount={totalAmount}
              onDelete={handleDeleteClick}
              isDeleting={deleteExpense.isPending}
            />
          )}
        </CardContent>
      </Card>

      <DeleteExpenseDialog
        open={deleteModalOpen}
        onOpenChange={(open) => {
          setDeleteModalOpen(open);
          if (!open) setExpenseToDelete(null);
        }}
        expense={expenseToDelete}
        maxWidth="xl"
        onConfirm={() => expenseToDelete && deleteExpense.mutate(expenseToDelete.id)}
        isPending={deleteExpense.isPending}
      />

      <AddExpenseDialog
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        form={form}
        onFormChange={setForm}
        onSubmit={handleSubmit}
        isPending={createExpense.isPending}
        error={createExpense.error}
      />
    </Box>
  );
}
