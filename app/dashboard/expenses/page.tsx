"use client";

import dynamic from "next/dynamic";
import { Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Box } from "@/components/ui/box";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuthStore } from "@/lib/AuthStore";
import { hasDashboardPermission } from "@/lib/dashboardPermissionClient";
import { useExpensesData, type Expense, STAFF_SALARY_CATEGORY } from "./index";
import { SelectHostelPrompt } from "@/components/multi-hostel/SelectHostelPrompt";

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
  const user = useAuthStore((s) => s.user);
  const hostelId = user?.hostelId ?? null;
  const canExpensesAdd = hasDashboardPermission(user, "expenses", "add");
  const canExpensesDelete = hasDashboardPermission(user, "expenses", "delete");

  const {
    expenses,
    staffForExpenses,
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
  } = useExpensesData();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount?.trim() || !form.category) return;
    if (form.category === STAFF_SALARY_CATEGORY && !form.staff_member_id?.trim()) return;
    createExpense.mutate(form);
  };

  const handleDeleteClick = (expense: Expense) => {
    setExpenseToDelete(expense);
    setDeleteModalOpen(true);
  };

  if (!hostelId) {
    return <SelectHostelPrompt moduleLabel="Expenses" />;
  }

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
            canAddExpense={canExpensesAdd}
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
              canDeleteExpense={canExpensesDelete}
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
        staffMembers={staffForExpenses}
        isLoadingStaff={isLoadingStaffForExpense}
      />
    </Box>
  );
}
