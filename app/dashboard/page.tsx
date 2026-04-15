"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { Box } from "@/components/ui/box";
import { useAuthStore } from "@/lib/AuthStore";
import { fetchWithHostel } from "@/lib/ApiClient";
import type { DashboardStatsProps } from "@/components/dashboard";
import { DashboardSkeleton } from "@/components/skeletons";
import { t } from "@/lib/i18n";
import { useSearchStore } from "@/lib/SearchStore";
import { useSubscriptionStore } from "@/lib/SubscriptionStore";
import { PlanExpiryBanner } from "@/components/subscription/PlanExpiryBanner";
import { Typography } from "@/components/ui/typography";

const StatsGrid = dynamic(() =>
  import("@/components/dashboard").then((m) => m.StatsGrid)
);
const RevenueChart = dynamic(() =>
  import("@/components/dashboard").then((m) => m.RevenueChart)
);
const RoomDistributionChart = dynamic(() =>
  import("@/components/dashboard").then((m) => m.RoomDistributionChart)
);
const RecentPayments = dynamic(() =>
  import("@/components/dashboard").then((m) => m.RecentPayments)
);
const PlannedVacatesCard = dynamic(() =>
  import("@/components/dashboard").then((m) => m.PlannedVacatesCard)
);
const IncomeVsExpensesChart = dynamic(() =>
  import("@/components/dashboard").then((m) => m.IncomeVsExpensesChart)
);

/** Show a dashboard alert when this many seats or fewer remain (not at zero yet). */
const STUDENT_CAPACITY_NEAR_THRESHOLD = 5;

export default function DashboardPage() {
  const query = useSearchStore((s) => s.query);
  const hostelId = useAuthStore((s) => s.user?.hostelId ?? null);
  const subscriptionStatus = useSubscriptionStore((s) => s.status);

  const { data, isLoading, error } = useQuery<DashboardStatsProps>({
    queryKey: ["dashboard-stats", hostelId],
    queryFn: () =>
      fetchWithHostel("/api/dashboard/stats", hostelId).then((r) => r.json()),
    enabled: Boolean(hostelId),
  });

  const students = data?.students ?? [];
  const payments = data?.payments ?? [];
  const plannedVacatesRaw = data?.plannedVacates ?? [];
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
    [students, q]
  );
  const filteredPayments = useMemo(
    () =>
      !q
        ? payments
        : payments.filter(
            (p: { student?: string }) =>
              (p.student ?? "").toLowerCase().includes(q)
          ),
    [payments, q]
  );
  const filteredPlannedVacates = useMemo(
    () =>
      !q
        ? plannedVacatesRaw
        : plannedVacatesRaw.filter(
            (v: { studentName?: string; room?: string; plannedVacateDate?: string }) =>
              (v.studentName ?? "").toLowerCase().includes(q) ||
              (v.room ?? "").toLowerCase().includes(q) ||
              (v.plannedVacateDate ?? "").toLowerCase().includes(q)
          ),
    [plannedVacatesRaw, q]
  );

  if (isLoading) return <DashboardSkeleton />;
  if (error || !data) return <Box className="p-8 text-red-600">{t("FAILED_TO_LOAD_DASHBOARD")}</Box>;

  const {
    revenue,
    roomDistribution,
    incomeVsExpenses = [],
    stats,
    pendingBillsList = [],
    planCapabilities,
    studentCapacity,
  } = data;
  const advancedAnalytics = planCapabilities?.advancedAnalytics === true;

  const atStudentCap = studentCapacity != null && studentCapacity.remaining === 0;
  const nearingStudentCap =
    studentCapacity != null &&
    studentCapacity.remaining > 0 &&
    studentCapacity.remaining <= STUDENT_CAPACITY_NEAR_THRESHOLD;

  return (
    <Box className="space-y-8">
      <PlanExpiryBanner status={subscriptionStatus} />

      {atStudentCap && studentCapacity && (
        <Box
          className="flex gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
          role="status"
        >
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-700" aria-hidden />
          <Box className="min-w-0">
            <Typography className="text-sm font-semibold text-red-900">
              Student limit reached
            </Typography>
            <Typography className="mt-1 text-sm text-red-800">
              You are using all {studentCapacity.max} student slots on your current plan (
              {studentCapacity.current} of {studentCapacity.max}). Upgrade your plan to add more
              students.
            </Typography>
            <Link
              href="/dashboard/subscription"
              className="mt-2 inline-block text-sm font-medium text-red-900 underline underline-offset-2 hover:text-red-950"
            >
              View plans and upgrade
            </Link>
          </Box>
        </Box>
      )}

      {nearingStudentCap && studentCapacity && !atStudentCap && (
        <Box
          className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"
          role="status"
        >
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-800" aria-hidden />
          <Box className="min-w-0">
            <Typography className="text-sm font-semibold text-amber-950">
              Approaching your student limit
            </Typography>
            <Typography className="mt-1 text-sm text-amber-900">
              You can add{" "}
              <strong>
                {studentCapacity.remaining}{" "}
                more {studentCapacity.remaining === 1 ? "student" : "students"}
              </strong>{" "}
              on your current plan ({studentCapacity.current} of {studentCapacity.max} in use). After
              that, you will need to upgrade to add more.
            </Typography>
            <Link
              href="/dashboard/subscription"
              className="mt-2 inline-block text-sm font-medium text-amber-950 underline underline-offset-2 hover:text-amber-900"
            >
              Upgrade for more capacity
            </Link>
          </Box>
        </Box>
      )}

      <StatsGrid
        stats={stats}
        pendingBillsList={pendingBillsList}
        showExpenseMetrics={advancedAnalytics}
      />

      {advancedAnalytics && (
        <Box className="grid gap-6 lg:grid-cols-2">
          <RevenueChart revenue={revenue} />
          <RoomDistributionChart roomDistribution={roomDistribution} />
        </Box>
      )}

      <Box className="grid gap-6 lg:grid-cols-2">
        <RecentPayments payments={filteredPayments} />
        <PlannedVacatesCard items={filteredPlannedVacates} />
      </Box>

      {advancedAnalytics ? (
        <IncomeVsExpensesChart data={incomeVsExpenses} />
      ) : (
        <Box className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 p-6">
          <Typography className="text-sm font-semibold text-slate-800">
            Pro: Reports &amp; expense insights
          </Typography>
          <Typography className="mt-2 text-sm text-slate-600">
            Revenue charts, room mix, income vs expenses, and admin expense tracking unlock on the
            Pro plan.
          </Typography>
          <Link
            href="/dashboard/subscription"
            className="mt-4 inline-block text-sm font-medium text-primary underline-offset-2 hover:underline"
          >
            View plans
          </Link>
        </Box>
      )}

      {/* <StudentsOverview students={filteredStudents} /> */}
    </Box>
  );
}
