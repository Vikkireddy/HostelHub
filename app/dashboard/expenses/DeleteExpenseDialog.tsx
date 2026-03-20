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
import { t } from "@/lib/i18n";
import type { Expense } from "./expenses.types";
import { TrashIcon, XIcon } from "lucide-react";

interface DeleteExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
  onConfirm: () => void;
  isPending: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | "10xl";
}


export function DeleteExpenseDialog({
  open,
  onOpenChange,
  expense,
  onConfirm,
  isPending,
  maxWidth = "md",
}: DeleteExpenseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} >
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Delete Expense</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this expense?
            {expense && (
              <> ₹{Number(expense.amount).toLocaleString()} ({expense.category})</>
            )}
            {" "}This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            size="sm"
            icon={<XIcon className="h-4 w-4" />}
          >
            {t("CANCEL")}
          </Button>
          <Button
            icon={<TrashIcon className="h-4 w-4" />}
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
            size="sm"
           
            className="bg-red-500 hover:bg-red-600"
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
