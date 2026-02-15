"use client";

import { useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { StatCard } from "./stat-card";
import { PendingBillsModal } from "@/components/dashboard/pending-bills-modal";
import { STAT_CARD_CONFIG } from "./dashboard.constants";
import type { StatsGridProps } from "./dashboard.types";
import { t, type EnKeys } from "@/lib/i18n";

export function StatsGrid({ stats, pendingBillsList = [] }: StatsGridProps) {
  const [pendingBillsModalOpen, setPendingBillsModalOpen] = useState(false);

  const renderSubtitle = (config: (typeof STAT_CARD_CONFIG)[number]) => {
    const { subtitle } = config;
    if (subtitle.type === "plusTwo") {
      return (
        <Typography className="flex items-center gap-1 text-xs text-green-600">
          <ArrowUpRight className="h-3 w-3" />
          {t("PLUS_TWO_THIS_MONTH")}
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
    return null;
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {STAT_CARD_CONFIG.map((config) => (
          <StatCard
            key={config.id}
            title={t(config.titleKey as EnKeys)}
            value={stats?.[config.valueKey] ?? 0}
            subtitle={renderSubtitle(config)}
            icon={config.icon}
            iconBgClass={config.iconBgClass}
            iconColorClass={config.iconColorClass}
            action={
              config.hasAction &&
              stats?.pendingBills > 0 && (
                <Button
                  variant="link"
                  className="mt-2 h-auto p-0 text-sm text-link hover:underline"
                  onClick={() => setPendingBillsModalOpen(true)}
                >
                  {t("VIEW_ALL")}
                </Button>
              )
            }
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
