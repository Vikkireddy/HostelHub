"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useAuthStore } from "@/lib/AuthStore";
import { Box } from "@/components/ui/box";
import { SubscriptionGuard } from "@/components/subscription/SubscriptionGuard";

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Welcome back, Admin" },
  "/dashboard/students": { title: "Students", subtitle: "Student management" },
  "/dashboard/rooms": { title: "Rooms", subtitle: "Room allocation & status" },
  "/dashboard/payments": { title: "Payments", subtitle: "Payment tracking" },
  "/dashboard/expenses": { title: "Expenses", subtitle: "Admin expenses & profit tracking" },
  "/dashboard/settings": { title: "Settings", subtitle: "Manage your account & preferences" },
  "/dashboard/subscription": { title: "Dashboard", subtitle: "Upgrade your plan" },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, _hasHydrated, setHasHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const { title, subtitle } = pageTitles[pathname] || { title: "Dashboard", subtitle: "" };

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
        <Sidebar />
        <Box className="pl-64 flex-1 flex flex-col min-h-0 overflow-hidden">
          <Header title={title} subtitle={subtitle} />
          <main className="flex-1 min-h-0 overflow-auto p-8">{children}</main>
        </Box>
      </Box>
    </SubscriptionGuard>
  );
}
