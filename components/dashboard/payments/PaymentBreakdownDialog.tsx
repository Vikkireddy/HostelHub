"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
} from "@mui/material";
import { Banknote } from "lucide-react";
import type { GroupedUnpaidProps } from "@/components/dashboard/payments/payments.types";

interface PaymentBreakdownDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: GroupedUnpaidProps | null;
  onPayNow: (group: GroupedUnpaidProps) => void;
}

const dialogSx = {
  "& .MuiDialog-paper": {
    borderRadius: 2,
    border: "1px solid rgb(226 232 240)",
    maxWidth: 448,
  },
  "& .MuiDialogTitle-root": {
    fontSize: "1.125rem",
    fontWeight: 600,
    color: "rgb(15 23 42)",
  },
  "& .MuiDialogContent-root": {
    pt: 1,
    color: "rgb(51 65 85)",
  },
};

export function PaymentBreakdownDialog({
  open,
  onOpenChange,
  group,
  onPayNow,
}: PaymentBreakdownDialogProps) {
  if (!group) return null;

  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} sx={dialogSx}>
      <DialogTitle>Payment Breakdown</DialogTitle>
      <DialogContent>
        <p className="text-sm text-slate-500 mb-4">
          Due/overdue amount by month for {group.student_name}
        </p>
        <Box
          sx={{
            borderRadius: "0.5rem",
            border: "1px solid rgb(226 232 240)",
            backgroundColor: "rgb(248 250 252)",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              borderBottom: "1px solid rgb(226 232 240)",
              px: 2,
              py: 1.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "rgb(100 116 139)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Month
            </Typography>
          </Box>
          {group.monthBreakdown.map((row, i) => (
            <Box
              key={`${row.month}-${row.year}-${i}`}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid rgb(241 245 249)",
                px: 2,
                py: 1.5,
                "&:last-of-type": { borderBottom: "none" },
              }}
            >
              <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: "rgb(30 41 59)" }}>
                {row.month} {row.year}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: row.status === "overdue" ? "rgb(185 28 28)" : "rgb(180 83 9)",
                  }}
                >
                  ₹{row.amount.toLocaleString()}
                </Typography>
                <Box
                  component="span"
                  sx={{
                    px: 1,
                    py: 0.25,
                    borderRadius: "0.25rem",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    ...(row.status === "overdue"
                      ? { backgroundColor: "rgb(254 226 226)", color: "rgb(185 28 28)" }
                      : { backgroundColor: "rgb(254 243 199)", color: "rgb(180 83 9)" }),
                  }}
                >
                  {row.status === "overdue" ? "Overdue" : "Pending"}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: "0.5rem",
            backgroundColor: "rgb(30 41 59)",
            color: "white",
            px: 2,
            py: 1.5,
            mt: 2,
          }}
        >
          <Typography sx={{ fontWeight: 600 }}>Total Due</Typography>
          <Typography sx={{ fontSize: "1.125rem", fontWeight: 700 }}>
            ₹{group.totalBalance.toLocaleString()}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2, pt: 1 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<Banknote size={16} />}
            onClick={() => onPayNow(group)}
            sx={{
              backgroundColor: "rgb(16 185 129)",
              "&:hover": { backgroundColor: "rgb(5 150 105)" },
            }}
          >
            Pay Now
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
