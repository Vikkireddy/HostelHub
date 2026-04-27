"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Box, Button, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/AuthStore";
import { fetchWithHostel } from "@/lib/ApiClient";
import { t } from "@/lib/i18n";
import type { DashboardStatsProps } from "@/components/dashboard";

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2, height: "100%" }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
}

export default function HostelDetailDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const hostelId = Number(params.hostelId);

  const allowed = useMemo(() => {
    if (!Number.isFinite(hostelId)) return false;
    if (user?.managementMode === "multi" && user?.accessibleHostels?.some((h) => h.id === hostelId)) return true;
    return user?.hostelId === hostelId;
  }, [hostelId, user?.accessibleHostels, user?.hostelId, user?.managementMode]);

  const { data, isLoading, error } = useQuery<DashboardStatsProps>({
    queryKey: ["dashboard-stats", hostelId],
    queryFn: () => fetchWithHostel("/api/dashboard/stats", hostelId).then((r) => r.json()),
    enabled: allowed && Number.isFinite(hostelId),
  });

  if (!Number.isFinite(hostelId) || !allowed) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Not found</Typography>
        <Button sx={{ mt: 2 }} component={Link} href="/dashboard/portfolio" variant="outlined">
          {t("MULTI_HOSTEL_DETAIL_BACK")}
        </Button>
      </Box>
    );
  }

  const stats = data?.stats;

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ArrowLeft className="h-4 w-4" />}
          component={Link}
          href="/dashboard/portfolio"
        >
          {t("MULTI_HOSTEL_DETAIL_BACK")}
        </Button>
        <Button
          size="small"
          variant="text"
          onClick={() => {
            updateUser({ hostelId });
            router.push("/dashboard");
          }}
        >
          {t("DASHBOARD")}
        </Button>
      </Stack>

      <Typography variant="h4" fontWeight={800} gutterBottom>
        {t("MULTI_HOSTEL_DETAIL_TITLE")}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {t("MULTI_HOSTEL_DETAIL_SUBTITLE")}
      </Typography>

      {isLoading ? (
        <Typography color="text.secondary">{t("MULTI_HOSTEL_LOADING")}</Typography>
      ) : error || !data ? (
        <Typography color="error">{t("FAILED_TO_LOAD_DASHBOARD")}</Typography>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <SectionCard title={t("TOTAL_STUDENTS")}>
                <Typography variant="h4">{stats?.totalStudents ?? 0}</Typography>
              </SectionCard>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <SectionCard title={t("AVAILABLE_ROOMS")}>
                <Typography variant="h4">{stats?.availableRooms ?? 0}</Typography>
              </SectionCard>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <SectionCard title={t("PENDING_BILLS")}>
                <Typography variant="h4">{stats?.pendingBills ?? 0}</Typography>
              </SectionCard>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <SectionCard title={t("MULTI_HOSTEL_DETAIL_SECTION_OCCUPANCY")}>
                <Typography color="text.secondary">{t("MULTI_HOSTEL_DETAIL_EMPTY_CHART")}</Typography>
              </SectionCard>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <SectionCard title={t("MULTI_HOSTEL_DETAIL_SECTION_INCOME")}>
                <Typography color="text.secondary">{t("MULTI_HOSTEL_DETAIL_EMPTY_CHART")}</Typography>
              </SectionCard>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <SectionCard title={t("MULTI_HOSTEL_DETAIL_SECTION_PENDING")}>
                <Typography color="text.secondary">{t("MULTI_HOSTEL_DETAIL_EMPTY_LIST")}</Typography>
              </SectionCard>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <SectionCard title={t("MULTI_HOSTEL_DETAIL_SECTION_ROOMS")}>
                <Typography variant="body2">
                  {t("TOTAL_STUDENTS")}: {stats?.totalStudents ?? 0} — {t("AVAILABLE_ROOMS")}: {stats?.availableRooms ?? 0}
                </Typography>
              </SectionCard>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <SectionCard title={t("MULTI_HOSTEL_DETAIL_SECTION_RECENT")}>
                <Typography color="text.secondary">{t("MULTI_HOSTEL_DETAIL_EMPTY_LIST")}</Typography>
              </SectionCard>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <SectionCard title={t("MULTI_HOSTEL_DETAIL_SECTION_VACATING")}>
                <Typography color="text.secondary">{t("MULTI_HOSTEL_DETAIL_EMPTY_LIST")}</Typography>
              </SectionCard>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}
