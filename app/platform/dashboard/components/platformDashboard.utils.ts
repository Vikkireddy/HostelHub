import { getHostelSubscriptionMeta } from "@/lib/platform/hostelRowMeta";
import type { AccessFilter, HostelRow } from "./types";

export function formatDate(iso: string | null | undefined) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatMoney(v: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(v || 0);
}

export function subscriptionChipColor(
  meta: ReturnType<typeof getHostelSubscriptionMeta>
): "success" | "warning" | "error" | "default" | "info" {
  if (meta.hasDashboardAccess) {
    if (meta.badgeLabel === "Free trial") return "info";
    if (meta.badgeLabel === "Grace period") return "warning";
    return "success";
  }
  if (meta.badgeLabel === "Payment failed") return "error";
  return "default";
}

export function matchesAccessFilter(h: HostelRow, accessFilter: AccessFilter) {
  const meta = getHostelSubscriptionMeta(h);
  if (accessFilter === "all") return true;
  if (accessFilter === "has_access") return meta.hasDashboardAccess;
  if (accessFilter === "trial") return meta.filterBucket === "trial";
  if (accessFilter === "paid") return meta.filterBucket === "paid";
  if (accessFilter === "grace") return meta.filterBucket === "grace";
  if (accessFilter === "payment_failed") return meta.filterBucket === "payment_failed";
  if (accessFilter === "no_subscription") return meta.filterBucket === "none";
  if (accessFilter === "lapsed") return !meta.hasDashboardAccess && meta.filterBucket !== "payment_failed";
  return true;
}
