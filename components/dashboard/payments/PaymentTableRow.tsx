"use client";

import { Avatar, Box, Chip, IconButton, TableCell, TableRow, Typography } from "@mui/material";
import { History } from "lucide-react";
import { PaymentRowActions } from "./PaymentRowActions";
import { STATUS_CHIP_STYLES } from "./PaymentsTableConstants";
import type { PaymentTableRowComponentProps } from "@/components/dashboard/payments/payments.types";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";
}

export function PaymentTableRow({
  row,
  onMarkPaid,
  onViewDetails,
  onOpenHistory,
  onEditPayment,
  onSendReminder,
  onDelete,
  isMarkingPaid,
  markingPaidStudentId,
}: PaymentTableRowComponentProps) {
  const chipStyle = STATUS_CHIP_STYLES[row.status] ?? STATUS_CHIP_STYLES.pending;
  const initials = getInitials(row.studentName);
  const isOverdue = row.status === "overdue" || row.dueInfo.includes("overdue");
  const lastPaymentLabel = row.lastPaymentAt
    ? new Date(row.lastPaymentAt).toLocaleString()
    : "No payment yet";

  return (
    <TableRow
      hover
      sx={{
        "& .MuiTableCell-root": {
          borderBottom: "1px solid rgb(226 232 240)",
          color: "rgb(51 65 85)",
          height: "65px",
        },
      }}
    >
      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              fontSize: "0.875rem",
              backgroundColor: "rgb(30 41 59)",
            }}
          >
            {initials}
          </Avatar>
          <Typography sx={{ fontWeight: 500, color: "rgb(15 23 42)" }}>
            {row.studentName}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Typography variant="body2" sx={{ color: "rgb(100 116 139)" }}>
          {row.period}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography
          variant="body2"
          sx={{
            color: isOverdue ? "rgb(185 28 28)" : "rgb(22 101 52)",
          }}
        >
          {row.dueInfo}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {row.amountLabel}
        </Typography>
      </TableCell>
      <TableCell>
        <Chip
          label={row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          size="small"
          sx={{
            backgroundColor: chipStyle.bg,
            color: chipStyle.color,
            fontWeight: 500,
            fontSize: "0.75rem",
          }}
        />
      </TableCell>
      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => onOpenHistory(row)}
            aria-label={`View payment history for ${row.studentName}`}
            sx={{ color: "rgb(71 85 105)" }}
          >
            <History size={16} />
          </IconButton>
          <Typography variant="caption" sx={{ color: "rgb(100 116 139)" }}>
            {lastPaymentLabel}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <PaymentRowActions
          row={row}
          onMarkPaid={onMarkPaid}
          onViewDetails={onViewDetails}
          onEditPayment={onEditPayment}
          onSendReminder={onSendReminder}
          onDelete={onDelete}
          isMarkingPaid={isMarkingPaid}
          markingPaidStudentId={markingPaidStudentId}
        />
      </TableCell>
    </TableRow>
  );
}
