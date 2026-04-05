"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Box } from "@/components/ui/box";
import { Typography } from "@/components/ui/typography";
import type { SubscriptionStatusResponse } from "@/lib/subscription/types";
import { SUBSCRIPTION_PAGE_PATH } from "@/lib/subscription/constants";
import { buttonVariants } from "@/components/ui/button";

interface PlanExpiryBannerProps {
  status: SubscriptionStatusResponse | null;
}

function getDaysLeft(targetIso: string | null): number | null {
  if (!targetIso) return null;
  const target = new Date(targetIso).getTime();
  if (Number.isNaN(target)) return null;
  const now = Date.now();
  const diffMs = target - now;
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function PlanExpiryBanner({ status }: PlanExpiryBannerProps) {
  if (!status || !status.hasActiveSubscription) return null;

  const isTrial = status.status === "trial";
  const isActivePlan = status.status === "active";
  if (!isTrial && !isActivePlan) return null;

  const endDate = isTrial ? status.trialEndsAt : status.expiresAt;
  const daysLeft = getDaysLeft(endDate);
  if (daysLeft == null || daysLeft > 7) return null;

  const prefix = isTrial ? "Your trial" : "Your plan";
  const dayLabel = daysLeft === 1 ? "day" : "days";
  const message =
    daysLeft === 0
      ? `${prefix} expires today. Upgrade now to avoid interruption.`
      : `${prefix} expires in ${daysLeft} ${dayLabel}. Upgrade now to continue enjoying all features without interruption.`;

  return (
    <Box className="flex items-center justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
      <Box className="flex min-w-0 items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <Typography className="text-sm text-amber-900">{message}</Typography>
      </Box>
      <Link href={SUBSCRIPTION_PAGE_PATH} className={`${buttonVariants({ size: "sm" })} shrink-0`}>
        Upgrade Now
      </Link>
    </Box>
  );
}
