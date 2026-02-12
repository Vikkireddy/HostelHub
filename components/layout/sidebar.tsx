"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BedDouble,
  CreditCard,
  ClipboardList,
  UtensilsCrossed,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/students", label: "Students", icon: Users },
  { href: "/dashboard/rooms", label: "Rooms", icon: BedDouble },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/complaints", label: "Complaints", icon: ClipboardList },
  { href: "/dashboard/food-menu", label: "Food Menu", icon: UtensilsCrossed },
  { href: "/dashboard/change-password", label: "Change Password", icon: Lock },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-primary text-white">
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500">
          <BedDouble className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="font-semibold">HostelHub</p>
          <p className="text-xs text-slate-400">Management System</p>
        </div>
      </div>
      <nav className="space-y-1 p-4">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Menu
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/15 text-primary-foreground"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
