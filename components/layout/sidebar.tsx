"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BedDouble,
  CreditCard,
  Wallet,
  UserCog,
  Settings,
  Crown,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Typography } from "@/components/ui/typography";
import { Box } from "@/components/ui/box";
import { useSettingsStore } from "@/lib/SettingsStore";
import { useAuthStore } from "@/lib/AuthStore";
import type { PermissionModuleKey } from "@/lib/permissionMatrix";
import { canSeeModuleNav } from "@/lib/dashboardPermissionClient";

const DEFAULT_HOSTEL_LOGO_URL = "/img/logo-transparent.png";

const navItems: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  module: PermissionModuleKey;
}[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
  { href: "/dashboard/students", label: "Residents", icon: Users, module: "residents" },
  { href: "/dashboard/rooms", label: "Rooms", icon: BedDouble, module: "rooms" },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard, module: "payments" },
  { href: "/dashboard/expenses", label: "Expenses", icon: Wallet, module: "expenses" },
  { href: "/dashboard/staff", label: "Staff", icon: UserCog, module: "staff" },
  { href: "/dashboard/users-roles", label: "Users & Roles", icon: Shield, module: "users_roles" },
  { href: "/dashboard/subscription", label: "Subscription", icon: Crown, module: "subscription" },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, module: "settings" },
];

type SidebarProps = {
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hostelId = user?.hostelId ?? null;
  const paymentTrackingEnabled = useSettingsStore((s) => s.getPaymentTrackingEnabled(hostelId));
  const brandingByHostelId = useSettingsStore((s) => s.brandingByHostelId);
  const branding = hostelId != null ? brandingByHostelId[hostelId] : undefined;
  const hostelName = branding?.hostelName ?? "";
  const hostelLogoUrl = branding?.hostelLogoUrl ?? null;
  const displayName = hostelName?.trim() || "Admin HostelHub";
  const displayLogo = hostelLogoUrl?.trim() || DEFAULT_HOSTEL_LOGO_URL;

  const prefetchRoute = (href: string) => {
    router.prefetch(href);
  };

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onCloseMobile}
        />
      ) : null}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 bg-primary text-white transition-transform duration-200 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:z-40 md:translate-x-0"
        )}
      >
      <Link
        href="/"
        prefetch={false}
        className="flex h-16 items-center gap-2 border-b border-white/10 px-4 transition-colors hover:bg-white/5"
        title="Go to website home"
        onClick={onCloseMobile}
      >
        <Box className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-transparent">
          <img src={displayLogo} alt="" aria-hidden className="h-full w-full object-contain" />
        </Box>
        <Box className="min-w-0 flex-1">
          <Typography className="truncate font-semibold text-white">{displayName}</Typography>
          <Typography className="text-xs text-slate-400">Management System</Typography>
        </Box>
      </Link>
      <nav className="space-y-1 p-4">
        <Typography className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Menu
        </Typography>
        {navItems
          .filter((item) => canSeeModuleNav(user, item.module))
          .filter((item) => paymentTrackingEnabled || item.module !== "payments")
          .map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                onMouseEnter={() => prefetchRoute(item.href)}
                onFocus={() => prefetchRoute(item.href)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white/15 text-primary-foreground"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                )}
                onClick={onCloseMobile}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
      </nav>
      </aside>
    </>
  );
}
