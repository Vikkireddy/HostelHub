"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusChip } from "@/components/ui/StatusChip";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Typography } from "@/components/ui/typography";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import type { PendingBillsModalProps, PendingBillProps } from "./dashboard.types";
import { t } from "@/lib/i18n";


export function PendingBillsModal({ open, onOpenChange, pendingBillsList, totalDue }: PendingBillsModalProps) {
  const [infoDialogBill, setInfoDialogBill] = useState<PendingBillProps | null>(null);
  const amountFormatted = totalDue.toLocaleString();
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{t("PENDING_BILLS_MODAL_TITLE")}</DialogTitle>
            <DialogDescription>
              {t("PENDING_BILLS_DESCRIPTION", { amount: totalDue.toLocaleString() })}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 min-h-0 -mx-6 px-6">
            <Box className="space-y-3 pr-4">
              {pendingBillsList.map((bill) => (
                <Box
                  key={bill.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
                >
                  <Box className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-sm">
                        {(bill.student_name || "").split(" ").map((n) => n[0]).join("") || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <Box>
                      <Typography className="font-medium text-slate-900">{bill.student_name}</Typography>
                      <Typography variant="caption" className="text-slate-500">
                        {t("ROOM")} {bill.room_number} · {bill.phone}
                      </Typography>
                      <Typography variant="caption" className="text-slate-500">
                        {bill.year ? `${bill.month} ${bill.year}` : bill.month}
                      </Typography>
                    </Box>
                  </Box>
                  <Box className="flex items-center gap-3">
                    {bill.days_left && (
                      <Typography
                        variant="caption"
                        className={
                          bill.status === "overdue"
                            ? "font-medium text-red-600"
                            : "text-slate-500"
                        }
                      >
                        {bill.days_left}
                      </Typography>
                    )}
                    <Typography className="font-semibold text-slate-900">
                      ₹{amountFormatted}
                    </Typography>
                    {bill.monthBreakdown && bill.monthBreakdown.length > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                        onClick={() => setInfoDialogBill(bill)}
                        title={t("VIEW_BREAKDOWN")}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    )}
                    <StatusChip status={bill.status as "pending" | "overdue"} />
                  </Box>
                </Box>
              ))}
            </Box>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={!!infoDialogBill} onOpenChange={(open) => !open && setInfoDialogBill(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("PAYMENT_BREAKDOWN")}</DialogTitle>
            <DialogDescription>
              {infoDialogBill ? (
                <>{t("DUE_OVERDUE_AMOUNT_BY_MONTH", { studentName: infoDialogBill.student_name })}</>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          {infoDialogBill && infoDialogBill.monthBreakdown && infoDialogBill.monthBreakdown.length > 0 && (
            <Box className="space-y-4">
              <Box className="rounded-lg border border-slate-200 bg-slate-50/50">
                <Box className="border-b border-slate-200 px-4 py-2">
                  <Typography variant="caption" className="text-slate-500 uppercase tracking-wide">
                    Month
                  </Typography>
                </Box>
                {infoDialogBill.monthBreakdown.map((row, i) => (
                  <Box
                    key={`${row.month}-${row.year}-${i}`}
                    className="flex items-center justify-between border-b border-slate-100 px-4 py-3 last:border-b-0"
                  >
                    <Typography className="text-sm font-medium text-slate-800">
                      {row.month} {row.year}
                    </Typography>
                    <Box className="flex items-center gap-2">
                      <Typography
                        className={`text-sm font-semibold ${
                          row.status === "overdue" ? "text-red-600" : "text-amber-600"
                        }`}
                      >
                        ₹{row.amount.toLocaleString()}
                      </Typography>
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${
                          row.status === "overdue"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {row.status === "overdue" ? t("OVERDUE") : t("PENDING")}
                      </span>
                    </Box>
                  </Box>
                ))}
              </Box>
              <Box className="flex items-center justify-between rounded-lg bg-slate-900 px-4 py-3 text-white">
                <Typography className="font-semibold">{t("TOTAL_DUE")}</Typography>
                <Typography className="text-lg font-bold">
                  ₹{infoDialogBill.amount.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
