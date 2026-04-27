"use client";

import { Card, CardContent, Typography } from "@mui/material";
import type { ReactNode } from "react";

type PortfolioKpiCardProps = {
  label: string;
  value: ReactNode;
  sub?: string;
  icon?: ReactNode;
  accent?: "blue" | "green" | "amber" | "purple" | "rose";
};

const ACCENT_STYLES: Record<NonNullable<PortfolioKpiCardProps["accent"]>, { bg: string; border: string }> = {
  blue: { bg: "#eff6ff", border: "#bfdbfe" },
  green: { bg: "#ecfdf5", border: "#a7f3d0" },
  amber: { bg: "#fffbeb", border: "#fde68a" },
  purple: { bg: "#f5f3ff", border: "#ddd6fe" },
  rose: { bg: "#fff1f2", border: "#fecdd3" },
};

export function PortfolioKpiCard({ label, value, sub, icon, accent = "blue" }: PortfolioKpiCardProps) {
  const tone = ACCENT_STYLES[accent];
  return (
    <Card variant="outlined" sx={{ borderRadius: 2, borderColor: "divider", boxShadow: "0 1px 2px rgba(15,23,42,0.06)" }}>
      <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
        <Typography variant="body2" color="text.secondary" sx={{ display: "block", mb: 1 }}>
          {label}
        </Typography>
        <Typography variant="h5" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          {icon ? (
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: tone.bg,
                border: `1px solid ${tone.border}`,
              }}
            >
              {icon}
            </span>
          ) : null}
          <span>{value}</span>
        </Typography>
        {sub ? (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
            {sub}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
}
