"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useAuthStore } from "@/lib/AuthStore";
import { Box } from "@/components/ui/box";
import { SubscriptionGuard } from "@/components/subscription/SubscriptionGuard";
import { t } from "@/lib/i18n";

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Welcome back, Admin" },
  "/dashboard/students": { title: "Residents", subtitle: "Resident management" },
  "/dashboard/rooms": { title: "Rooms", subtitle: "Room allocation & status" },
  "/dashboard/payments": { title: "Payments", subtitle: "Payment tracking" },
  "/dashboard/expenses": { title: "Expenses", subtitle: "Admin expenses & profit tracking" },
  "/dashboard/staff": { title: "Staff", subtitle: "Staff records & salary expense links" },
  "/dashboard/users-roles": {
    title: "Users & Roles",
    subtitle: "Manage system users, roles and permissions",
  },
  "/dashboard/settings": { title: "Settings", subtitle: "Manage your account & preferences" },
  "/dashboard/subscription": { title: "Subscription", subtitle: "Pricing & plans" },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, _hasHydrated, setHasHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { title, subtitle } = useMemo(() => {
    if (pathname === "/dashboard/portfolio") {
      return { title: "", subtitle: "" };
    }
    if (pathname === "/dashboard/hostels/new") {
      return { title: t("MULTI_HOSTEL_ADD_HOSTEL"), subtitle: t("MULTI_HOSTEL_PAGE_SUBTITLE") };
    }
    if (pathname?.startsWith("/dashboard/hostels/")) {
      return { title: t("MULTI_HOSTEL_DETAIL_TITLE"), subtitle: t("MULTI_HOSTEL_DETAIL_SUBTITLE") };
    }
    return pageTitles[pathname] || { title: "Dashboard", subtitle: "" };
  }, [pathname]);

  useEffect(() => {
    const id = setTimeout(() => setHasHydrated(true), 0);
    return () => clearTimeout(id);
  }, [setHasHydrated]);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [_hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  if (!_hasHydrated || !isAuthenticated) {
    return null;
  }

  return (
    <SubscriptionGuard>
      <Box className="h-screen overflow-hidden flex bg-slate-50">
        <Sidebar mobileOpen={mobileSidebarOpen} onCloseMobile={() => setMobileSidebarOpen(false)} />
        <Box className="md:pl-64 flex-1 flex flex-col min-h-0 overflow-hidden">
          <Header title={title} subtitle={subtitle} onToggleMobileSidebar={() => setMobileSidebarOpen((s) => !s)} />
          <main className="flex-1 min-h-0 overflow-auto p-1 md:p-8">{children}</main>
        </Box>
      </Box>
    </SubscriptionGuard>
  );
}
