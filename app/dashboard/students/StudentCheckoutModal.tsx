"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/lib/AuthStore";
import { fetchWithHostel } from "@/lib/ApiClient";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Box } from "@/components/ui/box";
import { Input } from "@/components/ui/input";
import { ModalWithHeaderFooter } from "@/components/ui/ModalWithHeaderFooter";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle } from "lucide-react";
import { t } from "@/lib/i18n";
import { formatDateOnlyLocal, sqlDateOnlyToYmd } from "@/lib/dateOnly";
import { parseDepositDeductionInput } from "./students.constants";
import type { StudentCheckoutModalProps } from "./students.types";

function formatInr(n: number) {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function StudentCheckoutModal({
  open,
  onOpenChange,
  student,
  onConfirm,
  isPending,
}: StudentCheckoutModalProps) {
  const [pendingAmount, setPendingAmount] = useState(0);
  const [deductionInput, setDeductionInput] = useState("0");
  const [depositConfirmed, setDepositConfirmed] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const hostelId = useAuthStore((s) => s.user?.hostelId ?? null);

  useEffect(() => {
    if (!open || !student) return;
    fetchWithHostel(`/api/students/${student.id}/pending-dues`, hostelId)
      .then((r) => r.json())
      .then((data) => setPendingAmount(data?.amount ?? 0))
      .catch(() => setPendingAmount(0));
  }, [open, student, hostelId]);

  useEffect(() => {
    if (!open || !student) return;
    setDeductionInput("0");
    setDepositConfirmed(false);
    setLocalError(null);
  }, [open, student?.id]);

  const totalDeposit = useMemo(() => {
    if (!student) return 0;
    const v = student.security_deposit_amount;
    const n = v == null || v === "" ? 0 : Number(v);
    return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
  }, [student]);

  const previewDeduction = useMemo(() => {
    const parsed = parseDepositDeductionInput(deductionInput, totalDeposit);
    return parsed.ok ? parsed.value : null;
  }, [deductionInput, totalDeposit]);

  const previewRefund =
    previewDeduction != null ? Math.round((totalDeposit - previewDeduction) * 100) / 100 : null;

  if (!student) return null;

  const joinDate = sqlDateOnlyToYmd(student.join_date) || "-";
  const checkoutDate = formatDateOnlyLocal(new Date());

  const hasDeposit = totalDeposit > 0;
  const canClickConfirm = !hasDeposit || depositConfirmed;

  const handleConfirm = () => {
    setLocalError(null);
    if (hasDeposit && !depositConfirmed) {
      setLocalError(t("CHECKOUT_DEPOSIT_ACK_REQUIRED"));
      return;
    }
    const deductionParsed = parseDepositDeductionInput(deductionInput, totalDeposit);
    if (!deductionParsed.ok) {
      setLocalError(deductionParsed.error);
      return;
    }
    onConfirm(student, { securityDepositDeduction: deductionParsed.value });
  };

  return (
    <ModalWithHeaderFooter
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="md"
      headerTitle={
        <span className="flex items-center gap-2">
          <Box className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
            <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Box>
          {t("STUDENT_CHECKOUT")}
        </span>
      }
      children={
        <Box className="space-y-4">
          <Typography className="text-slate-600">{t("CHECKOUT_CONFIRM_MESSAGE")}</Typography>

          <Box className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <Box className="flex justify-between text-sm">
              <Typography variant="muted">{t("STUDENT_LABEL")}</Typography>
              <Typography className="font-medium text-slate-900">{student.name}</Typography>
            </Box>
            <Box className="flex justify-between text-sm">
              <Typography variant="muted">{t("ROOM_LABEL")}</Typography>
              <Typography className="font-medium text-slate-900">{student.room_number || "-"}</Typography>
            </Box>
            <Box className="flex justify-between text-sm">
              <Typography variant="muted">{t("JOINED")}</Typography>
              <Typography className="font-medium text-slate-900">{joinDate}</Typography>
            </Box>
            <Box className="flex justify-between text-sm">
              <Typography variant="muted">{t("CHECKOUT_DATE")}</Typography>
              <Typography className="font-medium text-slate-900">{checkoutDate}</Typography>
            </Box>
          </Box>

          <Box className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
            <Typography className="text-sm font-semibold text-slate-900">
              {t("CHECKOUT_DEPOSIT_SECTION_TITLE")}
            </Typography>
            {!hasDeposit ? (
              <Typography variant="muted" className="text-sm">
                {t("CHECKOUT_DEPOSIT_NONE")}
              </Typography>
            ) : (
              <>
                <Box className="flex justify-between text-sm">
                  <Typography variant="muted">{t("CHECKOUT_DEPOSIT_TOTAL")}</Typography>
                  <Typography className="font-medium text-slate-900">{formatInr(totalDeposit)}</Typography>
                </Box>
                <Box className="space-y-1">
                  <Typography variant="muted" className="text-xs">
                    {t("CHECKOUT_DEPOSIT_DEDUCTION")}
                  </Typography>
                  <Input
                    value={deductionInput}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^\d.,]/g, "");
                      setDeductionInput(v);
                      setLocalError(null);
                    }}
                    placeholder="0"
                    inputMode="decimal"
                    className="max-w-[200px]"
                    autoComplete="off"
                  />
                </Box>
                <Box className="flex justify-between border-t border-slate-100 pt-2 text-sm">
                  <Typography className="font-medium text-slate-900">
                    {t("CHECKOUT_DEPOSIT_REFUND")}
                  </Typography>
                  <Typography className="text-base font-semibold text-slate-900">
                    {previewRefund != null ? formatInr(previewRefund) : "—"}
                  </Typography>
                </Box>
                <Typography variant="muted" className="text-xs">
                  {t("CHECKOUT_DEPOSIT_REFUND_HELP")}
                </Typography>
                <label className="flex cursor-pointer items-start gap-2 pt-1">
                  <Checkbox
                    checked={depositConfirmed}
                    onChange={(e) => {
                      setDepositConfirmed(e.target.checked);
                      setLocalError(null);
                    }}
                    className="mt-0.5"
                  />
                  <span className="text-sm text-slate-700">{t("CHECKOUT_DEPOSIT_CONFIRM_CHECKBOX")}</span>
                </label>
              </>
            )}
          </Box>

          {localError && (
            <Box className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
              <Typography className="text-sm text-amber-900">{localError}</Typography>
            </Box>
          )}

          {pendingAmount > 0 && (
            <Box className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <Typography className="text-sm text-red-800">
                {t("PENDING_DUES_WARNING", { amount: pendingAmount.toLocaleString() })}
              </Typography>
            </Box>
          )}
        </Box>
      }
      footerComponent={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            {t("CANCEL")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending || pendingAmount > 0 || !canClickConfirm}
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
            {t("CONFIRM_CHECKOUT")}
          </Button>
        </>
      }
    />
  );
}
