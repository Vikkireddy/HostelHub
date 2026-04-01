"use client";

import { useState } from "react";
import { Box, IconButton, Menu, MenuItem } from "@mui/material";
import { Check, Eye, MoreHorizontal, Pencil, Bell, Trash2 } from "lucide-react";
import { t } from "@/lib/i18n";
import type { ActionItem, PaymentTableRowProps } from "@/components/dashboard/payments/payments.types";

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



  const menuActions: ActionItem[] = [
    {
      key: "view",
      label: "View Details",
      icon: Eye,
      onClick: () => runAndClose(() => onViewDetails(row)),
      sx: { gap: 1 },
    },
    {
      key: "edit",
      label: "Edit Payment",
      icon: Pencil,
      onClick: onEditPayment ? () => runAndClose(() => onEditPayment(row)) : undefined,
      hidden: !onEditPayment,
      sx: { gap: 1 },
    },
    {
      key: "reminder",
      label: "Send Reminder",
      icon: Bell,
      disabled: true,
      hidden: !onSendReminder || isPaid,
      title: "Notifications are not implemented yet",
      sx: { gap: 1, opacity: 0.5, cursor: "not-allowed" },
    },
    {
      key: "delete",
      label: "Delete",
      icon: Trash2,
      onClick: onDelete ? () => runAndClose(() => onDelete(row)) : undefined,
      hidden: !onDelete,
      sx: { gap: 1, color: "rgb(185 28 28)" },
    },
  ];

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
        {menuActions
          .filter((action) => !action.hidden)
          .map((action) => {
            const Icon = action.icon;
            return (
              <MenuItem
                key={action.key}
                onClick={action.onClick}
                disabled={action.disabled}
                sx={action.sx}
                title={action.title}
              >
                <Icon size={16} />
                {action.label}
              </MenuItem>
            );
          })}
      </Menu>
    </Box>
  );
}
