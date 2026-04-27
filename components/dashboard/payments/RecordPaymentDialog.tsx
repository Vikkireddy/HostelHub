"use client";

import { Input } from "@/components/ui/input";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { Dropdown } from "@/components/ui/dropdown";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Box } from "@/components/ui/box";
import { Radio } from "@/components/ui/radio";
import { ModalWithHeaderFooter } from "@/components/ui/ModalWithHeaderFooter";
import type {
  RecordPaymentFormProps,
  StudentWithDuesProps,
} from "@/components/dashboard/payments/payments.types";
import { MONTHS } from "./payments.constants";
import { cn } from "@/lib/utils";

const RECORD_PAYMENT_FORM_ID = "record-payment-form";

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: RecordPaymentFormProps;
  onFormChange: (form: RecordPaymentFormProps) => void;
  onSubmit: (e: React.FormEvent) => void;
  studentsWithDues: StudentWithDuesProps[];
  isPending: boolean;
  submitError?: string | null;
  canSubmit?: boolean;
}

export function RecordPaymentDialog({
  open,
  onOpenChange,
  form,
  onFormChange,
  onSubmit,
  studentsWithDues,
  isPending,
  submitError,
  canSubmit = true,
}: RecordPaymentDialogProps) {
  const isDisabled = isPending || studentsWithDues.length === 0 || !canSubmit;

  const handleFieldChange = (field: keyof RecordPaymentFormProps, value: string) => {
    onFormChange({ ...form, [field]: value });
  };

  const handleStudentChange = (value: string) => {
    const student = studentsWithDues.find((s) => String(s.id) === value);

    onFormChange({
      ...form,
      student_id: value,
      amount: student?.room_rent ? String(student.room_rent) : "",
      payment_reference: "",
    });
  };

  return (
    <ModalWithHeaderFooter
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="lg"
      headerTitle="Record Payment"
      children={
        <form id={RECORD_PAYMENT_FORM_ID} onSubmit={onSubmit} className="space-y-4">
          {submitError && <Typography variant="error">{submitError}</Typography>}

          <div className="space-y-4">
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

            <Box className="space-y-2">
              <RequiredLabel htmlFor="record-amount">Amount (₹)</RequiredLabel>
              <Input
                id="record-amount"
                min={1}
                value={form.amount}
                onChange={(e) => handleFieldChange("amount", e.target.value)}
                placeholder="e.g. 5000"
                required
              />
            </Box>

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

            <Box className="space-y-2">
              <RequiredLabel htmlFor="record-year">Year</RequiredLabel>
              <Input
                id="record-year"
                min={2020}
                max={2030}
                value={form.year}
                onChange={(e) => handleFieldChange("year", e.target.value)}
                placeholder="e.g. 2025"
                required
              />
            </Box>

            <Box className="space-y-2">
              <RequiredLabel>Mode of Payment</RequiredLabel>
              <div className="flex flex-wrap gap-6 pt-1" role="radiogroup" aria-label="Mode of payment">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <Radio
                    name="record-payment-mode"
                    value="cash"
                    checked={form.payment_mode === "cash"}
                    onChange={() =>
                      onFormChange({
                        ...form,
                        payment_mode: "cash",
                        payment_reference: "",
                      })
                    }
                  />
                  Cash
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <Radio
                    name="record-payment-mode"
                    value="online"
                    checked={form.payment_mode === "online"}
                    onChange={() =>
                      onFormChange({
                        ...form,
                        payment_mode: "online",
                        payment_reference: "",
                      })
                    }
                  />
                  Online
                </label>
              </div>
            </Box>

            {form.payment_mode === "cash" ? (
              <Box className="space-y-2">
                <RequiredLabel htmlFor="record-bill">Bill Number</RequiredLabel>
                <Input
                  id="record-bill"
                  value={form.payment_reference}
                  onChange={(e) => handleFieldChange("payment_reference", e.target.value)}
                  placeholder="Enter bill number"
                  autoComplete="off"
                  className={cn(submitError && "border-red-500 focus-visible:ring-red-500")}
                  required
                />
              </Box>
            ) : (
              <Box className="space-y-2">
                <RequiredLabel htmlFor="record-utr">UTR Number</RequiredLabel>
                <Input
                  id="record-utr"
                  value={form.payment_reference}
                  onChange={(e) => handleFieldChange("payment_reference", e.target.value)}
                  placeholder="Enter UTR number"
                  autoComplete="off"
                  className={cn(submitError && "border-red-500 focus-visible:ring-red-500")}
                  required
                />
              </Box>
            )}
          </div>
        </form>
      }
      footerComponent={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form={RECORD_PAYMENT_FORM_ID}
            disabled={isDisabled}
            title={!canSubmit ? "You don't have permission to record payments" : undefined}
          >
            {isPending ? "Saving..." : "Record Payment"}
          </Button>
        </>
      }
    />
  );
}
