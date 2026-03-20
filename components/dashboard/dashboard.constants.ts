import type { LucideIcon } from "lucide-react";
import { Users, Building2, Receipt, Wallet } from "lucide-react";
import type { EnKeys } from "@/lib/i18n";
import type { DashboardStatsSummaryProps } from "./dashboard.types";

export const RECENT_ITEMS_DISPLAY_LIMIT = 4;

export type StatCardSubtitleConfig =
  | { type: "studentsAddedDiff"; diffKey: keyof DashboardStatsSummaryProps }
  | { type: "occupied"; countKey: keyof DashboardStatsSummaryProps }
  | { type: "dueAmount"; amountKey: keyof DashboardStatsSummaryProps }
  | { type: "profit"; profitKey: keyof DashboardStatsSummaryProps };

export type StatCardConfig = {
  id: string;
  titleKey: EnKeys;
  valueKey: keyof DashboardStatsSummaryProps;
  subtitle: StatCardSubtitleConfig;
  icon: LucideIcon;
  iconBgClass: string;
  iconColorClass: string;
  hasAction?: boolean;
  actionHref?: string;
};

export const STAT_CARD_CONFIG = [
  {
    id: "totalStudents",
    titleKey: "TOTAL_STUDENTS" as const,
    valueKey: "totalStudents",
    subtitle: { type: "studentsAddedDiff", diffKey: "studentsAddedDiff" },
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
  {
    id: "adminExpenses",
    titleKey: "ADMIN_EXPENSES" as const,
    valueKey: "totalExpensesThisMonth",
    subtitle: { type: "profit", profitKey: "profitThisMonth" },
    icon: Wallet,
    iconBgClass: "bg-violet-100",
    iconColorClass: "text-violet-600",
    hasAction: true,
    actionHref: "/dashboard/expenses",
  },
] satisfies StatCardConfig[];
