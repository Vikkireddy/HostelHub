import type { SubscriptionPlan } from "./types";

export const SUBSCRIPTION_PAGE_PATH = "/dashboard/subscription";

export const DEFAULT_TRIAL_PLAN_ID = "basic";


export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Base",
    tagline: "Up to 50 residents",
    description:
      "Best for small hostels moving day-to-day operations online—residents, rooms, and rent in one place.",
    price_monthly: 399,
    max_students: 50,
    features: [
      "Resident records with room assignment & ID proof fields",
      "Room occupancy, maintenance status, and allocation",
      "Rent schedules, receipts, pending dues, and overdue tracking",
      "CSV import & export for residents",
      "Dashboard overview: occupancy, revenue totals, recent payments",
      "Password reset and operational email flows",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Up to 100 residents",
    description:
      "For growing hostels that need cashflow clarity—charts, admin expenses, and planned move-outs on the dashboard.",
    price_monthly: 699,
    max_students: 100,
    features: [
      "Everything in Base",
      "Income vs expenses chart and monthly profit view",
      "Revenue & room-mix charts on the dashboard",
      "Planned vacate dates surfaced on the dashboard",
      "Admin expense ledger (categories, monthly rollups)",
      "Full analytics on dashboard stats API",
    ],
  },
  {
    id: "enterprise",
    name: "Pro Plus",
    tagline: "Unlimited residents",
    description:
      "For larger hostels and groups preparing for multi-branch operations—no resident cap, same Pro analytics.",
    price_monthly: 999,
    max_students: null,
    features: [
      "Everything in Pro",
      "Unlimited active residents (no seat cap)",
      "Highest priority support channel",
      "Multi-hostel / platform roadmap alignment (Super Admin layer)",
      "Best for chains coordinating finance and occupancy centrally",
    ],
  },
];

/** Comparison matrix for pricing UI (also documents product gates). */
export const PLAN_COMPARISON_ROWS: {
  feature: string;
  basic: string;
  pro: string;
  enterprise: string;
}[] = [
  { feature: "Resident limit", basic: "50", pro: "100", enterprise: "Unlimited" },
  { feature: "Room management", basic: "Yes", pro: "Yes", enterprise: "Yes" },
  { feature: "Payment & dues tracking", basic: "Yes", pro: "Yes", enterprise: "Yes" },
  { feature: "CSV resident import / export", basic: "Yes", pro: "Yes", enterprise: "Yes" },
  { feature: "Dashboard revenue & occupancy overview", basic: "Yes", pro: "Yes", enterprise: "Yes" },
  { feature: "Income vs expenses & profit", basic: "No", pro: "Yes", enterprise: "Yes" },
  { feature: "Charts (revenue, room mix)", basic: "No", pro: "Yes", enterprise: "Yes" },
  { feature: "Planned vacate tracking (dashboard)", basic: "No", pro: "Yes", enterprise: "Yes" },
  { feature: "Admin expenses module", basic: "No", pro: "Yes", enterprise: "Yes" },
  { feature: "Super Admin / multi-hostel platform", basic: "No", pro: "No", enterprise: "Yes" },
  { feature: "Priority support", basic: "No", pro: "Yes", enterprise: "Yes" },
];

export const SUBSCRIPTION_PLAN_IDS = new Set(SUBSCRIPTION_PLANS.map((p) => p.id));

export const API_SUBSCRIPTION_ERROR_CODE = "SUBSCRIPTION_REQUIRED";
export const API_SUBSCRIPTION_ERROR_STATUS = 402;

export function isPlanAvailableForPurchase(planId: string): boolean {
  return SUBSCRIPTION_PLANS.some((p) => p.id === planId);
}
