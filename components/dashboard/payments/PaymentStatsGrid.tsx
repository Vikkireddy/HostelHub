"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Box } from "@/components/ui/box";
import { CircleDollarSign, AlertTriangle, AlertCircle, TrendingUp } from "lucide-react";
import type { PaymentStatsProps } from "@/components/dashboard/payments/payments.types";
import { t } from "@/lib/i18n";

interface PaymentStatsGridProps {
  stats: PaymentStatsProps;
  onViewCollected?: () => void;
  onViewPending?: () => void;
  onViewOverdue?: () => void;
}

function formatCurrency(amount: number) {
  return `₹ ${amount.toLocaleString("en-IN")}`;
}

const statConfig = [
  {
    id: "collected",
    value: (s: PaymentStatsProps) => formatCurrency(s.collected),
    label: t("COLLECTED_AMOUNT"),
    icon: CircleDollarSign,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    id: "pending",
    value: (s: PaymentStatsProps) => formatCurrency(s.pending),
    label: t("PENDING_AMOUNT"),
    icon: AlertTriangle,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    id: "overdue",
    value: (s: PaymentStatsProps) => String(s.overdueCount),
    label: t("OVERDUE_COUNT"),
    icon: AlertCircle,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  {
    id: "thisMonth",
    value: (s: PaymentStatsProps) => formatCurrency(s.thisMonth),
    label: t("THIS_MONTH"),
    icon: TrendingUp,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
];

export function PaymentStatsGrid({
  stats,
  onViewCollected,
  onViewPending,
  onViewOverdue,
}: PaymentStatsGridProps) {
  const handlers: Record<string, (() => void) | undefined> = {
    collected: onViewCollected,
    pending: onViewPending,
    overdue: onViewOverdue,
  };

  return (
    <Box className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statConfig.map((config) => {
        const Icon = config.icon;
        const handleClick = config.id !== "thisMonth" ? handlers[config.id] : undefined;

        return (
          <Card
            key={config.id}
            className={handleClick ? "cursor-pointer hover:bg-slate-50/80 transition-colors" : ""}
            onClick={() => handleClick?.()}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <Box
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${config.iconBg}`}
              >
                <Icon className={`h-6 w-6 ${config.iconColor}`} />
              </Box>
              <Box>
                <Typography className="text-2xl font-bold">{config.value(stats)}</Typography>
                <Typography variant="muted">{config.label}</Typography>
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}
