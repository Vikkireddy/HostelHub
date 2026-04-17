import type { SubscriptionStatusResponse } from "@/lib/subscription/types";

export interface PlanComparisonRow {
  feature: string;
  basic: string;
  pro: string;
  enterprise: string;
}

export interface SubscriptionPageStatus
  extends Pick<
    SubscriptionStatusResponse,
    "hasActiveSubscription" | "expiresAt" | "bannerType" | "trialEndsAt" | "isTrial" | "planName"
  > {}
