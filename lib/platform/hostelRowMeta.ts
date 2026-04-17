/** Super-admin table: derive subscription display + filter buckets from API row. */

export type HostelSubscriptionRow = {
  subscriptionStatus: string | null;
  planId: string | null;
  planName: string | null;
  subscriptionExpiresAt: string | Date | null;
  subscriptionTrialEndsAt: string | Date | null;
  subscriptionGracePeriodEndsAt: string | Date | null;
};

export type AccessFilterBucket =
  | "none"
  | "payment_failed"
  | "trial"
  | "paid"
  | "grace"
  | "lapsed";

function parseDate(v: string | Date | null | undefined): Date | null {
  if (v == null) return null;
  const d = v instanceof Date ? v : new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function getHostelSubscriptionMeta(h: HostelSubscriptionRow): {
  hasDashboardAccess: boolean;
  badgeLabel: string;
  planLine: string;
  detailLine: string | null;
  filterBucket: AccessFilterBucket;
} {
  const now = new Date();
  const status = h.subscriptionStatus;

  const planLine =
    h.planName && h.planId ? `${h.planName} (${h.planId})` : h.planName || h.planId || "—";

  if (!status) {
    return {
      hasDashboardAccess: false,
      badgeLabel: "No subscription",
      planLine,
      detailLine: null,
      filterBucket: "none",
    };
  }

  const expiresAt = parseDate(h.subscriptionExpiresAt);
  const trialEndsAt = parseDate(h.subscriptionTrialEndsAt);
  const graceEndsAt = parseDate(h.subscriptionGracePeriodEndsAt);

  const isExpired = expiresAt ? now > expiresAt : false;
  const isInGracePeriod =
    status === "grace_period" && graceEndsAt ? now <= graceEndsAt : false;
  const isTrial = status === "trial";
  const isTrialExpired = isTrial && trialEndsAt ? now > trialEndsAt : false;
  const isPaymentFailed = status === "payment_failed";
  const isCancelled = status === "cancelled";
  const isExpiredStatus = status === "expired";

  const hasActiveSubscription =
    (status === "active" && !isExpired) ||
    (status === "trial" && !isTrialExpired) ||
    (isInGracePeriod && status === "grace_period");

  const hasDashboardAccess = hasActiveSubscription && !isPaymentFailed;

  let filterBucket: AccessFilterBucket = "lapsed";
  if (isPaymentFailed) filterBucket = "payment_failed";
  else if (status === "grace_period" && isInGracePeriod) filterBucket = "grace";
  else if (status === "trial" && !isTrialExpired) filterBucket = "trial";
  else if (status === "active" && !isExpired) filterBucket = "paid";
  else if (!hasDashboardAccess) filterBucket = "lapsed";

  let badgeLabel = "Inactive";
  if (isPaymentFailed) badgeLabel = "Payment failed";
  else if (!hasDashboardAccess) {
    if (isTrialExpired) badgeLabel = "Trial ended";
    else if (isExpired || isCancelled || isExpiredStatus) badgeLabel = "Expired / inactive";
    else if (status === "grace_period" && !isInGracePeriod) badgeLabel = "Grace ended";
    else badgeLabel = "No access";
  } else if (status === "trial") badgeLabel = "Free trial";
  else if (status === "grace_period") badgeLabel = "Grace period";
  else if (status === "active") badgeLabel = "Paid active";

  let detailLine: string | null = null;
  if (hasDashboardAccess) {
    if (status === "trial" && trialEndsAt) {
      detailLine = `Trial until ${trialEndsAt.toLocaleDateString(undefined, { dateStyle: "medium" })}`;
    } else if (status === "active" && expiresAt) {
      detailLine = `Renews ${expiresAt.toLocaleDateString(undefined, { dateStyle: "medium" })}`;
    } else if (status === "grace_period" && graceEndsAt) {
      detailLine = `Grace until ${graceEndsAt.toLocaleDateString(undefined, { dateStyle: "medium" })}`;
    }
  }

  return {
    hasDashboardAccess,
    badgeLabel,
    planLine,
    detailLine,
    filterBucket,
  };
}
