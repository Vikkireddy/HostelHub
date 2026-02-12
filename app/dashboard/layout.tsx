"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useAuthStore } from "@/lib/auth-store";

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Welcome back, Admin" },
  "/dashboard/students": { title: "Students", subtitle: "Student management" },
  "/dashboard/rooms": { title: "Rooms", subtitle: "Room allocation & status" },
  "/dashboard/payments": { title: "Payments", subtitle: "Payment tracking" },
  "/dashboard/complaints": { title: "Complaints", subtitle: "Complaint management" },
  "/dashboard/food-menu": { title: "Food Menu", subtitle: "Weekly meal schedule" },
  "/dashboard/change-password": { title: "Change Password", subtitle: "Update your password" },
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="pl-64">
        <Header title={title} subtitle={subtitle} />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
