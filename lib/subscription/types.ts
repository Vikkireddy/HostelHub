export type SubscriptionStatus =
  | "active"
  | "expired"
  | "cancelled"
  | "trial"
  | "grace_period"
  | "payment_failed";

export type SubscriptionBannerType =
  | "subscription_required" // First-time / no subscription
  | "subscription_expired"
  | "grace_period"
  | "trial_expired"
  | "payment_failed"
  | "feature_locked"
  | "admin_renewal_required";

export interface SubscriptionPlan {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price_monthly: number;
  max_students: number | null;
  features: string[];
}

export interface SubscriptionStatusResponse {
  hasActiveSubscription: boolean;
  status: SubscriptionStatus;
  planId: string | null;
  planName: string | null;
  expiresAt: string | null;
  gracePeriodEndsAt: string | null;
  trialEndsAt: string | null;
  isInGracePeriod: boolean;
  isTrial: boolean;
  isPaymentFailed: boolean;
  isOwner: boolean;
  bannerType: SubscriptionBannerType | null;
}
