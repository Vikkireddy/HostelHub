"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Box } from "@/components/ui/box";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { SUBSCRIPTION_PAGE_PATH } from "@/lib/subscription/constants";
import type { SubscriptionBannerType } from "@/lib/subscription/types";

interface SubscriptionBannerProps {
  bannerType: SubscriptionBannerType;
  expiresAt?: string | null;
  onDismiss?: () => void;
  isDismissed?: boolean;
}

const BANNER_CONFIG: Record<
  SubscriptionBannerType,
  { message: string; cta: string; variant: "error" | "warning" }
> = {
  subscription_required: {
    message: "Please choose a subscription plan to continue using HostelHub.",
    cta: "Choose Plan",
    variant: "error",
  },
  subscription_expired: {
    message: "Your subscription expired. Please renew to continue using HostelHub.",
    cta: "Renew Now",
    variant: "error",
  },
  grace_period: {
    message: "Your subscription is about to expire. Please renew to avoid service interruption.",
    cta: "Renew Now",
    variant: "warning",
  },
  trial_expired: {
    message: "Your trial has ended. Please choose a plan to continue using HostelHub.",
    cta: "Choose Plan",
    variant: "error",
  },
  payment_failed: {
    message: "Your subscription payment failed. Please update your payment method to renew.",
    cta: "Retry Payment",
    variant: "error",
  },
  feature_locked: {
    message: "This feature requires a higher plan. Upgrade to continue.",
    cta: "Upgrade",
    variant: "warning",
  },
  admin_renewal_required: {
    message: "Please contact your account admin to renew the subscription.",
    cta: "Contact Admin",
    variant: "warning",
  },
};

export function SubscriptionBanner({
  bannerType,
  expiresAt,
  onDismiss,
  isDismissed,
}: SubscriptionBannerProps) {
  if (isDismissed) return null;

  const config = BANNER_CONFIG[bannerType];
  const isError = config.variant === "error";

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  let message = config.message;
  if (bannerType === "subscription_expired" && expiresAt) {
    message = `Your subscription expired on ${formatDate(expiresAt)}. Please renew to continue using HostelHub.`;
  }

  return (
    <Box
      className={`
        flex items-center justify-between gap-4 rounded-lg px-4 py-3
        ${isError ? "bg-red-50 border border-red-200" : "bg-amber-50 border border-amber-200"}
      `}
    >
      <Box className="flex items-center gap-3 min-w-0">
        <AlertTriangle
          className={`h-5 w-5 shrink-0 ${isError ? "text-red-600" : "text-amber-600"}`}
        />
        <Typography
          className={`text-sm ${isError ? "text-red-800" : "text-amber-800"}`}
        >
          {message}
        </Typography>
      </Box>
      <Box className="flex shrink-0 items-center gap-2">
        {bannerType !== "admin_renewal_required" && (
          <Button asChild size="sm">
            <Link href={SUBSCRIPTION_PAGE_PATH}>{config.cta}</Link>
          </Button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-slate-500 hover:text-slate-700 text-sm underline"
          >
            Dismiss
          </button>
        )}
      </Box>
    </Box>
  );
}
