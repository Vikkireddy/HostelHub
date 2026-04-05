import type { SubscriptionPlan } from "./types";

export const SUBSCRIPTION_PAGE_PATH = "/dashboard/subscription";

/** Turn on when Enterprise checkout / contact flow is ready */
export const ENTERPRISE_SUBSCRIPTION_ENABLED = false;

/** Set to true to bypass subscription check (for testing only - revert before deploy) */
// export const BYPASS_SUBSCRIPTION_CHECK = true;

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Basic",
    price_monthly: 149,
    max_students: 14,
    features: ["Up to 14 members", "Room Management", "Payment Tracking"],
  },
  {
    id: "pro",
    name: "Pro",
    price_monthly: 299,
    max_students: 34,
    features: [
      "Up to 34 members",
      "Reports & Analytics",
      "Expense & profit tracking",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price_monthly: 799,
    max_students: null,
    features: ["Unlimited members", "Multi Hostel", "Priority Support"],
  },
];

export const API_SUBSCRIPTION_ERROR_CODE = "SUBSCRIPTION_REQUIRED";
export const API_SUBSCRIPTION_ERROR_STATUS = 402;

export function isPlanAvailableForPurchase(planId: string): boolean {
  if (planId === "enterprise" && !ENTERPRISE_SUBSCRIPTION_ENABLED) return false;
  return SUBSCRIPTION_PLANS.some((p) => p.id === planId);
}
