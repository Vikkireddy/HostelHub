"use client";

import { useState } from "react";
import { Box, IconButton, Menu, MenuItem } from "@mui/material";
import { Check, Eye, MoreHorizontal, Pencil, Bell, Trash2 } from "lucide-react";
import { t } from "@/lib/i18n";
import type { PaymentTableRowProps } from "@/components/dashboard/payments/payments.types";

interface PaymentRowActionsProps {
  row: PaymentTableRowProps;
  onMarkPaid: (studentId: number) => void;
  onViewDetails: (row: PaymentTableRowProps) => void;
  onEditPayment?: (row: PaymentTableRowProps) => void;
  onSendReminder?: (row: PaymentTableRowProps) => void;
  onDelete?: (row: PaymentTableRowProps) => void;
  isMarkingPaid?: boolean;
  markingPaidStudentId?: number;
}

export function PaymentRowActions({
  row,
  onMarkPaid,
  onViewDetails,
  onEditPayment,
  onSendReminder,
  onDelete,
  isMarkingPaid,
  markingPaidStudentId,
}: PaymentRowActionsProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const isPaid = row.status === "paid";
  const isMarking = isMarkingPaid && markingPaidStudentId === row.studentId;

  const runAndClose = (fn: () => void) => {
    fn();
    handleMenuClose();
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      {!isPaid && (
        <Box
          component="button"
          onClick={() => onMarkPaid(row.studentId)}
          disabled={isMarking}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            border: "none",
            backgroundColor: "rgb(16 185 129)",
            color: "white",
            fontSize: "0.8125rem",
            fontWeight: 600,
            cursor: isMarking ? "not-allowed" : "pointer",
            opacity: isMarking ? 0.7 : 1,
            "&:hover": isMarking ? {} : { backgroundColor: "rgb(5 150 105)" },
          }}
        >
          <Check size={14} />
          {t("MARK_AS_PAID")}
        </Box>
      )}
      <IconButton
        size="small"
        onClick={handleMenuClick}
        aria-label="Actions"
        sx={{ color: "rgb(100 116 139)" }}
      >
        <MoreHorizontal size={18} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={() => runAndClose(() => onViewDetails(row))} sx={{ gap: 1 }}>
          <Eye size={16} />
          View Details
        </MenuItem>
        {onEditPayment && (
          <MenuItem onClick={() => runAndClose(() => onEditPayment(row))} sx={{ gap: 1 }}>
            <Pencil size={16} />
            Edit Payment
          </MenuItem>
        )}
        {onSendReminder && !isPaid && (
          <MenuItem onClick={() => runAndClose(() => onSendReminder(row))} sx={{ gap: 1 }}>
            <Bell size={16} />
            Send Reminder
          </MenuItem>
        )}
        {onDelete && (
          <MenuItem
            onClick={() => runAndClose(() => onDelete(row))}
            sx={{ gap: 1, color: "rgb(185 28 28)" }}
          >
            <Trash2 size={16} />
            Delete
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
}
