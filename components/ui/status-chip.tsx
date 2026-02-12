import * as React from "react";
import { cn } from "@/lib/utils";

type StatusVariant = "error" | "warning" | "success";

const statusConfig: Record<string, StatusVariant> = {
  overdue: "error",
  pending: "warning",
  paid: "success",
  open: "error",
  "in-progress": "warning",
  resolved: "success",
  available: "success",
  full: "error",
  maintenance: "warning",
};

const variantStyles: Record<StatusVariant, string> = {
  error: "bg-red-100 text-red-700 ring-1 ring-red-200/50",
  warning: "bg-slate-100 text-slate-700 ring-1 ring-slate-200/50",
  success: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/50",
};

export interface StatusChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: string;
}

function StatusChip({ status, className, ...props }: StatusChipProps) {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, "-");
  const variant = statusConfig[normalizedStatus] ?? "warning";
  const displayText = status
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {displayText}
    </span>
  );
}

export { StatusChip };
