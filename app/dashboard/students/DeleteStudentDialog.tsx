"use client";

import { Button } from "@/components/ui/button";
import { ModalWithHeaderFooter } from "@/components/ui/ModalWithHeaderFooter";
import type { DeleteStudentDialogProps } from "./students.types";

export function DeleteStudentDialog({
  open,
  onOpenChange,
  student,
  onConfirm,
  isPending,
}: DeleteStudentDialogProps) {
  return (
    <ModalWithHeaderFooter
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="md"
      headerTitle="Delete Resident"
      headerDescription={`Are you sure you want to permanently delete ${student?.name ?? ""}? This cannot be undone.`}
      footerComponent={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </>
      }
    />
  );
}
