"use client";

import { Button } from "@/components/ui/button";
import { ModalWithHeaderFooter, type ModalWidth } from "@/components/ui/ModalWithHeaderFooter";
import { t } from "@/lib/i18n";
import type { Expense } from "./expenses.types";
import { TrashIcon, XIcon } from "lucide-react";

interface DeleteExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
  onConfirm: () => void;
  isPending: boolean;
  maxWidth?: ModalWidth;
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
    <ModalWithHeaderFooter
      open={open}
      onOpenChange={onOpenChange}
      maxWidth={maxWidth}
      headerTitle="Delete Expense"
      headerDescription={
        <>
          Are you sure you want to delete this expense?
          {expense && (
            <>
              {" "}
              ₹{Number(expense.amount).toLocaleString()} ({expense.category})
            </>
          )}
          {" "}
          This cannot be undone.
        </>
      }
      footerComponent={
        <>
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
        </>
      }
    />
  );
}
