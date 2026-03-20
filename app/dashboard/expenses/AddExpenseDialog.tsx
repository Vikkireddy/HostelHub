"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dropdown } from "@/components/ui/dropdown";
import { DatePicker } from "@/components/ui/DatePicker";
import { Typography } from "@/components/ui/typography";
import { Box } from "@/components/ui/box";
import { t } from "@/lib/i18n";
import { EXPENSE_CATEGORIES } from "./expenses.constants";
import type { ExpenseFormValues } from "./expenses.types";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: ExpenseFormValues;
  onFormChange: (updater: (prev: ExpenseFormValues) => ExpenseFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  error?: Error | null;
}

export function AddExpenseDialog({
  open,
  onOpenChange,
  form,
  onFormChange,
  onSubmit,
  isPending,
  error,
}: AddExpenseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>
            Record admin expenses to track costs and calculate profit.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <Typography variant="error">{error.message}</Typography>
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
            />
          </Box>
          <Box className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Dropdown
              value={form.category}
              onValueChange={(v) => onFormChange((p) => ({ ...p, category: v }))}
              options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }))}
              placeholder="Select category"
            />
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("CANCEL")}
            </Button>
            <Button
              type="submit"
              disabled={isPending || !form.amount || !form.category}
            >
              {isPending ? "Adding..." : "Add Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
