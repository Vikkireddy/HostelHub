"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusChip } from "@/components/ui/status-chip";
import { Typography } from "@/components/ui/typography";
import { Box } from "@/components/ui/box";
import type { PaymentItemProps } from "./dashboard.types";

export function PaymentItem({ payment }: PaymentItemProps) {
  const status = payment.status as "paid" | "pending" | "overdue";
  const daysLeft = payment.days_left as string | null;
  const student = payment.student as string;  const month = payment.month as string;
  const amount = payment.amount as number;
  const amountFormatted = amount.toLocaleString();
  const studentName = student.split(" ").map((n) => n[0]).join("");
  return (
    <Box className="flex items-center justify-between">
      <Box className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="text-xs">
            {studentName}
          </AvatarFallback>
        </Avatar>
        <Box>
          <Typography className="font-medium text-slate-900">{student}</Typography>
          <Typography variant="caption">{month}</Typography>
        </Box>
      </Box>
      <Box className="flex items-center gap-2">
        {daysLeft && (
          <span
            className={`text-xs font-medium ${
              status === "overdue" ? "text-red-600" : "text-slate-500"
            }`}
          >
            {daysLeft}
          </span>
        )}
        <span className="font-medium text-slate-900">₹{amountFormatted}</span>
        <StatusChip status={status} />
      </Box>
    </Box>
  );
}
