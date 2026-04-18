"use client";

import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { Dropdown } from "@/components/ui/dropdown";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Box } from "@/components/ui/box";
import type {
  RecordPaymentFormProps,
  StudentWithDuesProps,
} from "@/components/dashboard/payments/payments.types";
import { MONTHS } from "./payments.constants";

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: RecordPaymentFormProps;
  onFormChange: (form: RecordPaymentFormProps) => void;
  onSubmit: (e: React.FormEvent) => void;
  studentsWithDues: StudentWithDuesProps[];
  isPending: boolean;
  error?: Error | null;
}

export function RecordPaymentDialog({
  open,
  onOpenChange,
  form,
  onFormChange,
  onSubmit,
  studentsWithDues,
  isPending,
  error,
}: RecordPaymentDialogProps) {
  const selectedStudent = useMemo(
    () => studentsWithDues.find((s) => String(s.id) === form.student_id),
    [studentsWithDues, form.student_id]
  );

  const isDisabled = isPending || studentsWithDues.length === 0;

  const handleFieldChange = (field: keyof RecordPaymentFormProps, value: string) => {
    onFormChange({ ...form, [field]: value });
  };

  const handleStudentChange = (value: string) => {
    const student = studentsWithDues.find((s) => String(s.id) === value);

    onFormChange({
      ...form,
      student_id: value,
      amount: student?.room_rent ? String(student.room_rent) : "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a rent payment for a resident. Select resident, amount, and billing period.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {error && <Typography variant="error">{error.message}</Typography>}

          {studentsWithDues.length === 0 && (
            <Typography variant="caption" className="block">
              All residents have cleared their dues. No payment to record.
            </Typography>
          )}

          <div className="space-y-4">
            {/* Resident select (form field remains student_id) */}
            <Box className="space-y-2">
              <RequiredLabel htmlFor="record-student">Resident</RequiredLabel>
              <Dropdown
                id="record-student"
                value={form.student_id}
                onValueChange={handleStudentChange}
                options={studentsWithDues.map((s) => ({
                  value: String(s.id),
                  label: `${s.name}${s.room_rent > 0 ? ` (₹${s.room_rent.toLocaleString()}/mo)` : ""}`,
                }))}
                placeholder="Select resident"
                disabled={studentsWithDues.length === 0}
              />
            </Box>

            {/* Amount */}
            <Box className="space-y-2">
              <RequiredLabel htmlFor="record-amount">Amount (₹)</RequiredLabel>
              <Input
                id="record-amount"
                min={1}
                value={form.amount}
                onChange={(e) =>
                  handleFieldChange("amount", e.target.value)
                }
                placeholder="e.g. 5000"
                required
              />
            </Box>

            {/* Month */}
            <Box className="space-y-2">
              <RequiredLabel htmlFor="record-month">Month</RequiredLabel>
              <Dropdown
                id="record-month"
                value={form.month}
                onValueChange={(v) => handleFieldChange("month", v)}
                options={MONTHS.map((m) => ({ value: m, label: m }))}
                placeholder="Select month"
              />
            </Box>

            {/* Year */}
            <Box className="space-y-2">
              <RequiredLabel htmlFor="record-year">Year</RequiredLabel>
              <Input
                id="record-year"
                min={2020}
                max={2030}
                value={form.year}
                onChange={(e) =>
                  handleFieldChange("year", e.target.value)
                }
                placeholder="e.g. 2025"
                required
              />
            </Box>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isDisabled}>
              {isPending ? "Saving..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
