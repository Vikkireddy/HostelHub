"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useAuthStore } from "@/lib/auth-store";
import { Box } from "@/components/ui/box";

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Welcome back, Admin" },
  "/dashboard/students": { title: "Students", subtitle: "Student management" },
  "/dashboard/rooms": { title: "Rooms", subtitle: "Room allocation & status" },
  "/dashboard/payments": { title: "Payments", subtitle: "Payment tracking" },
  "/dashboard/settings": { title: "Settings", subtitle: "Manage your account & preferences" },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const { title, subtitle } = pageTitles[pathname] || { title: "Dashboard", subtitle: "" };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box className="h-screen overflow-hidden flex bg-slate-50">
      <Sidebar />
      <Box className="pl-64 flex-1 flex flex-col min-h-0 overflow-hidden">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 min-h-0 overflow-auto p-8">{children}</main>
      </Box>
    </Box>
  );
}
