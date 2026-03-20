import type { SubscriptionPlan } from "./types";

export const SUBSCRIPTION_PAGE_PATH = "/dashboard/subscription";

/** Set to true to bypass subscription check (for testing only - revert before deploy) */
// export const BYPASS_SUBSCRIPTION_CHECK = true;

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Basic",
    price_monthly: 99,
    max_students: 50,
    features: ["Up to 50 Students", "Room Management", "Payment Tracking"],
  },
  {
    id: "pro",
    name: "Pro",
    price_monthly: 1999,
    max_students: 200,
    features: ["Up to 200 Students", "Reports & Analytics", "SMS Reminders"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price_monthly: 4999,
    max_students: null,
    features: ["Unlimited Students", "Multi Hostel", "Priority Support"],
  },
];

export const API_SUBSCRIPTION_ERROR_CODE = "SUBSCRIPTION_REQUIRED";
export const API_SUBSCRIPTION_ERROR_STATUS = 402;
