"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { StatCard } from "./StatCard";
import { PendingBillsModal } from "@/components/dashboard/PendingBillsModal";
import { STAT_CARD_CONFIG } from "./dashboard.constants";
import type { StatsGridProps } from "./dashboard.types";
import { t, type EnKeys } from "@/lib/i18n";

export function StatsGrid({
  stats,
  pendingBillsList = [],
  showExpenseMetrics = true,
  showPaymentMetrics = true,
}: StatsGridProps) {
  const [pendingBillsModalOpen, setPendingBillsModalOpen] = useState(false);

  const renderSubtitle = (config: (typeof STAT_CARD_CONFIG)[number]) => {
    const { subtitle } = config;
    if (subtitle.type === "studentsAddedDiff") {
      const diff = stats?.[subtitle.diffKey] ?? 0;
      const count = Math.abs(Number(diff));
      if (diff > 0) {
        return (
          <Typography className="flex items-center gap-1 text-xs text-green-600">
            <ArrowUpRight className="h-3 w-3" />
            {t("STUDENTS_PLUS_THIS_MONTH", { count })}
          </Typography>
        );
      }
      if (diff < 0) {
        return (
          <Typography className="flex items-center gap-1 text-xs text-red-600">
            <ArrowDownRight className="h-3 w-3" />
            {t("STUDENTS_MINUS_THIS_MONTH", { count })}
          </Typography>
        );
      }
      return (
        <Typography className="text-xs text-muted-foreground">
          {t("STUDENTS_SAME_AS_LAST_MONTH")}
        </Typography>
      );
    }
    if (subtitle.type === "occupied") {
      const count = stats?.[subtitle.countKey] ?? 0;
      return (
        <Typography className="text-xs text-red-600">
          {count} {t("OCCUPIED")}
        </Typography>
      );
    }
    if (subtitle.type === "dueAmount") {
      const amount = stats?.[subtitle.amountKey] ?? 0;
      return (
        <Typography className="flex items-center gap-1 text-xs text-red-600">
          <ArrowDownRight className="h-3 w-3" />₹{Number(amount).toLocaleString()} {t("DUE_AMOUNT")}
        </Typography>
      );
    }
    if (subtitle.type === "profit") {
      const profit = Number(stats?.[subtitle.profitKey] ?? 0);
      const isProfit = profit >= 0;
      return (
        <Typography
          className={`flex items-center gap-1 text-xs ${isProfit ? "text-green-600" : "text-red-600"}`}
        >
          {isProfit ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {isProfit ? t("PROFIT") : t("LOSS")}: ₹{Math.abs(profit).toLocaleString()}
        </Typography>
      );
    }
    return null;
  };

  const getValue = (config: (typeof STAT_CARD_CONFIG)[number]) => {
    const raw = stats?.[config.valueKey] ?? 0;
    if (config.id === "adminExpenses") {
      return `₹${Number(raw).toLocaleString()}`;
    }
    return raw;
  };

  const renderAction = (config: (typeof STAT_CARD_CONFIG)[number]) => {
    if (!config.hasAction) return null;
    if (config.id === "pendingBills" && (stats?.pendingBills ?? 0) > 0) {
      return (
        <Button
          variant="link"
          className="mt-2 h-auto p-0 text-sm text-link hover:underline"
          onClick={() => setPendingBillsModalOpen(true)}
        >
          {t("VIEW_ALL")}
        </Button>
      );
    }
    if (config.id === "adminExpenses" && config.actionHref) {
      return (
        <Link
          href={config.actionHref}
          className="mt-2 inline-block text-sm font-medium text-link hover:underline"
        >
          {t("VIEW_ALL")}
        </Link>
      );
    }
    return null;
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {STAT_CARD_CONFIG.filter(
          (config) =>
            (showExpenseMetrics || config.id !== "adminExpenses") &&
            (showPaymentMetrics || config.id !== "pendingBills")
        ).map((config) => (
          <StatCard
            key={config.id}
            title={t(config.titleKey as EnKeys)}
            value={getValue(config)}
            subtitle={renderSubtitle(config)}
            icon={config.icon}
            iconBgClass={config.iconBgClass}
            iconColorClass={config.iconColorClass}
            action={renderAction(config)}
          />
        ))}
      </div>
      <PendingBillsModal
        open={pendingBillsModalOpen}
        onOpenChange={setPendingBillsModalOpen}
        pendingBillsList={pendingBillsList}
        totalDue={stats?.pendingBillsAmount ?? 0}
      />
    </>
  );
}
