import { Box, Typography } from "@mui/material";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import type { SubscriptionPageStatus } from "./types";

interface SubscriptionStatusCardsProps {
  status: SubscriptionPageStatus | null;
  showExpiredBanner: boolean;
  trialActive: boolean;
  paidActive: boolean;
  formatDate: (iso: string | null) => string | null;
  onViewPlans: () => void;
}

function getExpiredMessage(status: SubscriptionPageStatus): string {
  if (status.bannerType === "subscription_required") {
    return t("SUBSCRIPTION_BANNER_REQUIRED");
  }
  if (status.bannerType === "subscription_expired" && status.expiresAt) {
    const expiredOn = new Date(status.expiresAt).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return t("SUBSCRIPTION_BANNER_EXPIRED", { date: expiredOn });
  }
  if (status.bannerType === "payment_failed") {
    return t("SUBSCRIPTION_BANNER_PAYMENT_FAILED");
  }
  if (status.bannerType === "trial_expired") {
    return t("SUBSCRIPTION_BANNER_TRIAL_EXPIRED");
  }
  return t("SUBSCRIPTION_BANNER_FALLBACK");
}

export function SubscriptionStatusCards({
  status,
  showExpiredBanner,
  trialActive,
  paidActive,
  formatDate,
  onViewPlans,
}: SubscriptionStatusCardsProps) {
  if (!status) return null;

  return (
    <Box className="mx-auto mt-12 max-w-6xl space-y-4">
      {showExpiredBanner && (
        <Card className="border-red-200 bg-red-50 shadow-none">
          <CardContent className="flex flex-col gap-4 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
            <Typography className="text-sm text-red-800">{getExpiredMessage(status)}</Typography>
            {status.bannerType !== "subscription_required" && (
              <Button size="sm" variant="outline" className="shrink-0" onClick={onViewPlans}>
                {t("SUBSCRIPTION_VIEW_PLANS")}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {status.hasActiveSubscription && !showExpiredBanner && trialActive && status.trialEndsAt && (
        <Card className="border-emerald-200 bg-emerald-50 shadow-none">
          <CardContent className="px-4 py-3 sm:p-4">
            <Typography className="text-sm text-emerald-900">
              {t("SUBSCRIPTION_TRIAL_ACTIVE", { date: formatDate(status.trialEndsAt) ?? "" })}
            </Typography>
          </CardContent>
        </Card>
      )}

      {status.hasActiveSubscription && !showExpiredBanner && paidActive && status.expiresAt && (
        <Card className="border-emerald-200 bg-emerald-50 shadow-none">
          <CardContent className="px-4 py-3 sm:p-4">
            <Typography className="text-sm text-emerald-800">
              {t("SUBSCRIPTION_PAID_ACTIVE", {
                plan: status.planName ? ` (${status.planName})` : "",
                date: formatDate(status.expiresAt) ?? "",
              })}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
