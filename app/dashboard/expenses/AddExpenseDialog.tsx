"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dropdown } from "@/components/ui/dropdown";
import { DatePicker } from "@/components/ui/DatePicker";
import { Typography } from "@/components/ui/typography";
import { Box } from "@/components/ui/box";
import { ModalWithHeaderFooter } from "@/components/ui/ModalWithHeaderFooter";
import { t } from "@/lib/i18n";
import { EXPENSE_CATEGORIES, STAFF_SALARY_CATEGORY } from "./expenses.constants";
import type { ExpenseFormValues } from "./expenses.types";
import type { StaffOptionForExpense } from "./useExpensesData";

const ADD_EXPENSE_FORM_ID = "add-expense-form";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: ExpenseFormValues;
  onFormChange: (updater: (prev: ExpenseFormValues) => ExpenseFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  error?: Error | null;
  staffMembers: StaffOptionForExpense[];
  isLoadingStaff?: boolean;
}

export function AddExpenseDialog({
  open,
  onOpenChange,
  form,
  onFormChange,
  onSubmit,
  isPending,
  error,
  staffMembers,
  isLoadingStaff = false,
}: AddExpenseDialogProps) {
  const isStaffSalary = form.category === STAFF_SALARY_CATEGORY;
  const staffOptions = staffMembers.map((s) => ({
    value: String(s.id),
    label: `${s.name} (₹${Number(s.monthly_salary).toLocaleString("en-IN")}/mo)`,
  }));

  const submitDisabled =
    isPending ||
    !form.amount?.trim() ||
    !form.category ||
    (isStaffSalary && (!form.staff_member_id?.trim() || staffMembers.length === 0));

  return (
    <ModalWithHeaderFooter
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="md"
      headerTitle="Add Expense"
      headerDescription="Record admin expenses to track costs and calculate profit."
      children={
        <form id={ADD_EXPENSE_FORM_ID} onSubmit={onSubmit} className="space-y-4">
          {error && <Typography variant="error">{error.message}</Typography>}
          <Box className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Dropdown
              id="category"
              value={form.category || undefined}
              onValueChange={(v) =>
                onFormChange((p) => {
                  if (v === STAFF_SALARY_CATEGORY) {
                    return { ...p, category: v, staff_member_id: "", amount: "" };
                  }
                  return { ...p, category: v, staff_member_id: "" };
                })
              }
              options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }))}
              placeholder="Select category"
            />
          </Box>

          {isStaffSalary && (
            <Box className="space-y-2">
              <Label htmlFor="expense-staff">Staff member *</Label>
              {isLoadingStaff ? (
                <Typography variant="muted" className="text-sm">
                  Loading staff…
                </Typography>
              ) : staffMembers.length === 0 ? (
                <Typography variant="muted" className="text-sm">
                  No active staff yet.{" "}
                  <Link href="/dashboard/staff" className="font-medium text-link hover:underline">
                    Add staff
                  </Link>{" "}
                  first, then pick them here—the amount defaults to their monthly salary.
                </Typography>
              ) : (
                <Dropdown
                  id="expense-staff"
                  value={form.staff_member_id || undefined}
                  onValueChange={(id) => {
                    const staff = staffMembers.find((s) => String(s.id) === id);
                    onFormChange((p) => ({
                      ...p,
                      staff_member_id: id,
                      amount: staff != null ? String(staff.monthly_salary) : p.amount,
                    }));
                  }}
                  options={staffOptions}
                  placeholder="Select staff member"
                />
              )}
            </Box>
          )}

          <Box className="space-y-2">
            <Label htmlFor="amount">Amount (₹) *</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={form.amount}
              onChange={(e) => onFormChange((p) => ({ ...p, amount: e.target.value }))}
              disabled={isStaffSalary && !form.staff_member_id}
            />
            {isStaffSalary && form.staff_member_id ? (
              <Typography variant="muted" className="text-xs">
                Pre-filled from salary; you can adjust if this payout differs.
              </Typography>
            ) : null}
          </Box>

          <Box className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              placeholder="e.g. Electricity bill"
              value={form.description}
              onChange={(e) => onFormChange((p) => ({ ...p, description: e.target.value }))}
            />
          </Box>
          <DatePicker
            id="expense_date"
            value={form.expense_date ?? ""}
            onChange={(v) => onFormChange((p) => ({ ...p, expense_date: v }))}
            label={<Label htmlFor="expense_date">Date</Label>}
          />
        </form>
      }
      footerComponent={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("CANCEL")}
          </Button>
          <Button type="submit" form={ADD_EXPENSE_FORM_ID} disabled={submitDisabled}>
            {isPending ? "Adding..." : "Add Expense"}
          </Button>
        </>
      }
    />
  );
}
