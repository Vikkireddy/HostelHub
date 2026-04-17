"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Box, Button, Card, Grid, Stack, Typography } from "@mui/material";
import { t } from "@/lib/i18n";
import { PlatformSummaryCards } from "./components/PlatformSummaryCards";
import { HostelsTablePanel } from "./components/HostelsTablePanel";
import { HostelOverviewPanel } from "./components/HostelOverviewPanel";
import { matchesAccessFilter } from "./components/platformDashboard.utils";
import type { AccessFilter, HostelOverviewPayload, PlanFilter, StatsPayload } from "./components/types";

export default function PlatformDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<StatsPayload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [accessFilter, setAccessFilter] = useState<AccessFilter>("all");
  const [planFilter, setPlanFilter] = useState<PlanFilter>("all");
  const [selectedHostelId, setSelectedHostelId] = useState<number | null>(null);
  const [overview, setOverview] = useState<HostelOverviewPayload | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState("");

  const load = useCallback(async () => {
    setError("");
    const res = await fetch("/api/platform/stats", { credentials: "include" });
    if (res.status === 401) {
      setLoading(false);
      router.replace("/platform/login");
      return;
    }
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(typeof json?.error === "string" ? json.error : t("PLATFORM_LOAD_ERROR"));
      setLoading(false);
      return;
    }
    setData(json as StatsPayload);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const logout = async () => {
    await fetch("/api/platform/logout", { method: "POST", credentials: "include" });
    router.replace("/platform/login");
    router.refresh();
  };

  const filteredHostels = useMemo(() => {
    const rows = data?.hostels ?? [];
    return rows.filter((h) => {
      if (planFilter !== "all" && (h.planId ?? "") !== planFilter) return false;
      return matchesAccessFilter(h, accessFilter);
    });
  }, [data?.hostels, accessFilter, planFilter]);

  useEffect(() => {
    if (!data?.hostels.length) {
      setSelectedHostelId(null);
      return;
    }
    if (selectedHostelId && data.hostels.some((h) => h.id === selectedHostelId)) return;
    setSelectedHostelId(data.hostels[0].id);
  }, [data?.hostels, selectedHostelId]);

  useEffect(() => {
    if (!filteredHostels.length) return;
    if (selectedHostelId && filteredHostels.some((h) => h.id === selectedHostelId)) return;
    setSelectedHostelId(filteredHostels[0].id);
  }, [filteredHostels, selectedHostelId]);

  useEffect(() => {
    if (!selectedHostelId) {
      setOverview(null);
      return;
    }
    let cancelled = false;
    const fetchOverview = async () => {
      setOverviewLoading(true);
      setOverviewError("");
      const res = await fetch(`/api/platform/hostels/${selectedHostelId}/overview`, {
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (cancelled) return;
      if (!res.ok) {
        setOverview(null);
        setOverviewError(typeof json?.error === "string" ? json.error : t("PLATFORM_OVERVIEW_ERROR"));
        setOverviewLoading(false);
        return;
      }
      setOverview(json as HostelOverviewPayload);
      setOverviewLoading(false);
    };
    fetchOverview();
    return () => {
      cancelled = true;
    };
  }, [selectedHostelId]);

  if (loading && !data) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: "rgb(2,6,23)" }}>
        <Typography sx={{ color: "rgb(148,163,184)" }}>{t("PLATFORM_LOADING_DATA")}</Typography>
      </Box>
    );
  }

  if (error && !data) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: "rgb(2,6,23)", px: 2 }}>
        <Stack spacing={2} alignItems="center">
          <Typography sx={{ color: "rgb(252,165,165)" }}>{error}</Typography>
          <Button variant="outlined" onClick={load}>
            {t("PLATFORM_RETRY")}
          </Button>
          <Button component={Link} href="/platform/login" variant="text">
            {t("PLATFORM_SIGN_IN_AGAIN")}
          </Button>
        </Stack>
      </Box>
    );
  }

  const s = data!.summary;
  const sub = data!.subscriptionByStatus;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "rgb(2,6,23)", px: { xs: 2, md: 3 }, py: 4 }}>
      <Box sx={{ mx: "auto", maxWidth: 1400 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ sm: "center" }}
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography variant="h4" sx={{ color: "white", fontWeight: 700 }}>
              {t("PLATFORM_OVERVIEW_TITLE")}
            </Typography>
            <Typography variant="body2" sx={{ color: "rgb(148,163,184)" }}>
              {t("PLATFORM_OVERVIEW_SUBTITLE")}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button component={Link} href="/" variant="outlined">
              {t("PLATFORM_HOME")}
            </Button>
            <Button variant="outlined" onClick={logout} startIcon={<LogOut size={16} />}>
              {t("PLATFORM_SIGN_OUT")}
            </Button>
          </Stack>
        </Stack>

        <PlatformSummaryCards summary={s} />

        {Object.keys(sub).length > 0 && (
          <Card sx={{ mb: 3, bgcolor: "rgba(15,23,42,0.65)", border: "1px solid rgba(100,116,139,0.35)" }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ color: "rgb(226,232,240)", mb: 1 }}>
                {t("PLATFORM_SUBSCRIPTIONS_BY_STATUS")}
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {Object.entries(sub).map(([status, count]) => (
                  <Typography
                    key={status}
                    variant="caption"
                    sx={{
                      color: "rgb(226,232,240)",
                      border: "1px solid rgba(100,116,139,0.45)",
                      bgcolor: "rgba(2,6,23,0.65)",
                      borderRadius: 1,
                      px: 1,
                      py: 0.5,
                    }}
                  >
                    {status}: <strong>{count}</strong>
                  </Typography>
                ))}
              </Stack>
            </Box>
          </Card>
        )}

        {data?.note && (
          <Typography variant="caption" sx={{ display: "block", color: "rgb(100,116,139)", mb: 2 }}>
            {data.note}
          </Typography>
        )}

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <HostelsTablePanel
              hostels={data?.hostels ?? []}
              filteredHostels={filteredHostels}
              selectedHostelId={selectedHostelId}
              accessFilter={accessFilter}
              planFilter={planFilter}
              onAccessFilterChange={setAccessFilter}
              onPlanFilterChange={setPlanFilter}
              onSelectHostel={setSelectedHostelId}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <HostelOverviewPanel overview={overview} loading={overviewLoading} error={overviewError} />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
