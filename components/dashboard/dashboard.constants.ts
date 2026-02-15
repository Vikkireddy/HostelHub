import type { LucideIcon } from "lucide-react";
import { Users, Building2, Receipt } from "lucide-react";
import type { EnKeys } from "@/lib/i18n";
import type { DashboardStatsSummaryProps } from "./dashboard.types";

export const RECENT_ITEMS_DISPLAY_LIMIT = 4;

export type StatCardSubtitleConfig =
  | { type: "plusTwo" }
  | { type: "occupied"; countKey: keyof DashboardStatsSummaryProps }
  | { type: "dueAmount"; amountKey: keyof DashboardStatsSummaryProps };

export type StatCardConfig = {
  id: string;
  titleKey: EnKeys;
  valueKey: keyof DashboardStatsSummaryProps;
  subtitle: StatCardSubtitleConfig;
  icon: LucideIcon;
  iconBgClass: string;
  iconColorClass: string;
  hasAction?: boolean;
};

export const STAT_CARD_CONFIG = [
  {
    id: "totalStudents",
    titleKey: "TOTAL_STUDENTS" as const,
    valueKey: "totalStudents",
    subtitle: { type: "plusTwo" },
    icon: Users,
    iconBgClass: "bg-blue-100",
    iconColorClass: "text-blue-600",
  },
  {
    id: "availableRooms",
    titleKey: "AVAILABLE_ROOMS" as const,
    valueKey: "availableRooms",
    subtitle: { type: "occupied", countKey: "occupiedRooms" },
    icon: Building2,
    iconBgClass: "bg-emerald-100",
    iconColorClass: "text-emerald-600",
  },
  {
    id: "pendingBills",
    titleKey: "PENDING_BILLS" as const,
    valueKey: "pendingBills",
    subtitle: { type: "dueAmount", amountKey: "pendingBillsAmount" },
    icon: Receipt,
    iconBgClass: "bg-orange-100",
    iconColorClass: "text-orange-600",
    hasAction: true,
  },
] satisfies StatCardConfig[];
