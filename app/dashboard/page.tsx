"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box } from "@/components/ui/box";
import { useAuthStore } from "@/lib/auth-store";
import { fetchWithHostel } from "@/lib/api-client";
import { Typography } from "@/components/ui/typography";
import {
  StatsGrid,
  RevenueChart,
  RoomDistributionChart,
  RecentPayments,
  StudentsOverview,
} from "@/components/dashboard";
import type { DashboardStatsProps } from "@/components/dashboard";
import { DashboardSkeleton } from "@/components/skeletons";
import { t } from "@/lib/i18n";
import { useSearchStore } from "@/lib/search-store";

export default function DashboardPage() {
  const { query } = useSearchStore();
  const hostelId = useAuthStore((s) => s.user?.hostelId ?? null);
  const { data, isLoading, error } = useQuery<DashboardStatsProps>({
    queryKey: ["dashboard-stats", hostelId],
    queryFn: () =>
      fetchWithHostel("/api/dashboard/stats", hostelId).then((r) => r.json()),
  });

  const students = data?.students ?? [];
  const payments = data?.payments ?? [];
  const q = query.trim().toLowerCase();
  const filteredStudents = useMemo(
    () =>
      !q
        ? students
        : students.filter(
            (s: { name?: string; room?: string; course?: string; phone?: string }) =>
              (s.name ?? "").toLowerCase().includes(q) ||
              (s.room ?? "").toLowerCase().includes(q) ||
              (s.course ?? "").toLowerCase().includes(q) ||
              (s.phone ?? "").toLowerCase().includes(q)
          ),
    [students, query]
  );
  const filteredPayments = useMemo(
    () =>
      !q
        ? payments
        : payments.filter(
            (p: { student?: string }) =>
              (p.student ?? "").toLowerCase().includes(q)
          ),
    [payments, query]
  );

  if (isLoading) return <DashboardSkeleton />;
  if (error || !data) return <Box className="p-8 text-red-600">{t("FAILED_TO_LOAD_DASHBOARD")}</Box>;

  const { revenue, roomDistribution, stats, pendingBillsList = [] } = data;

  return (
    <Box className="space-y-8">
  
      <StatsGrid stats={stats} pendingBillsList={pendingBillsList} />

      <Box className="grid gap-6 lg:grid-cols-2">
        <RevenueChart revenue={revenue} />
        <RoomDistributionChart roomDistribution={roomDistribution} />
      </Box>

      <Box className="grid gap-6 lg:grid-cols-2">
        <RecentPayments payments={filteredPayments} />
      </Box>

      <StudentsOverview students={filteredStudents} />
    </Box>
  );
}
