"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/AuthStore";
import { fetchWithHostel } from "@/lib/ApiClient";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Box } from "@/components/ui/box";
import { ModalWithHeaderFooter } from "@/components/ui/ModalWithHeaderFooter";
import { AlertCircle } from "lucide-react";
import { t } from "@/lib/i18n";
import { formatDateOnlyLocal, sqlDateOnlyToYmd } from "@/lib/dateOnly";
import type { StudentCheckoutModalProps } from "./students.types";

export function StudentCheckoutModal({
  open,
  onOpenChange,
  student,
  onConfirm,
  isPending,
}: StudentCheckoutModalProps) {
  const [pendingAmount, setPendingAmount] = useState(0);
  const hostelId = useAuthStore((s) => s.user?.hostelId ?? null);

  useEffect(() => {
    if (!open || !student) return;
    fetchWithHostel(`/api/students/${student.id}/pending-dues`, hostelId)
      .then((r) => r.json())
      .then((data) => setPendingAmount(data?.amount ?? 0))
      .catch(() => setPendingAmount(0));
  }, [open, student, hostelId]);

  if (!student) return null;

  const joinDate = sqlDateOnlyToYmd(student.join_date) || "-";
  const checkoutDate = formatDateOnlyLocal(new Date());

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
          <Button variant="destructive" onClick={() => onConfirm(student)} disabled={isPending}>
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
