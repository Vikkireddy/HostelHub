import type { ReactNode } from "react";
import { BedDouble, Building2, DoorOpen, IndianRupee, Users } from "lucide-react";
import { Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import { t } from "@/lib/i18n";
import { formatMoney } from "./platformDashboard.utils";
import type { HostelOverviewPayload } from "./types";

type Props = {
  overview: HostelOverviewPayload | null;
  loading: boolean;
  error: string;
};

export function HostelOverviewPanel({ overview, loading, error }: Props) {
  return (
    <Card sx={{ bgcolor: "rgba(15,23,42,0.65)", border: "1px solid rgba(100,116,139,0.35)", height: "100%" }}>
      <CardContent>
        <Typography variant="h6" sx={{ color: "white" }}>
          {t("PLATFORM_SELECTED_HOSTEL_OVERVIEW")}
        </Typography>
        {loading ? (
          <Typography sx={{ mt: 2, color: "rgb(148,163,184)" }}>{t("PLATFORM_LOADING_OVERVIEW")}</Typography>
        ) : error ? (
          <Typography sx={{ mt: 2, color: "rgb(252,165,165)" }}>{error}</Typography>
        ) : overview ? (
          <>
            <Typography sx={{ mt: 1.5, color: "white", fontWeight: 700, fontSize: 20 }}>
              {overview.hostel.name}
            </Typography>
            <Typography variant="caption" sx={{ color: "rgb(148,163,184)" }}>
              {[overview.hostel.city, overview.hostel.state].filter(Boolean).join(", ") ||
                t("PLATFORM_LOCATION_UNAVAILABLE")}
            </Typography>

            <Grid container spacing={1.5} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <MetricTile icon={<DoorOpen size={16} color="#c4b5fd" />} label={t("PLATFORM_TOTAL_ROOMS")} value={String(overview.metrics.totalRooms)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <MetricTile icon={<BedDouble size={16} color="#7dd3fc" />} label={t("PLATFORM_TOTAL_BEDS")} value={String(overview.metrics.totalBeds)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <MetricTile icon={<Users size={16} color="#86efac" />} label={t("PLATFORM_OCCUPIED_BEDS")} value={String(overview.metrics.occupiedBeds)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <MetricTile icon={<Building2 size={16} color="#67e8f9" />} label={t("PLATFORM_AVAILABLE_BEDS")} value={String(overview.metrics.availableBeds)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <MetricTile icon={<Users size={16} color="#fcd34d" />} label={t("PLATFORM_TOTAL_STUDENTS")} value={String(overview.metrics.totalStudents)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <MetricTile
                  icon={<IndianRupee size={16} color="#86efac" />}
                  label={t("PLATFORM_REVENUE_MONTH", { month: overview.period.month })}
                  value={formatMoney(overview.metrics.monthlyRevenue)}
                />
              </Grid>
            </Grid>
          </>
        ) : (
          <Typography sx={{ mt: 2, color: "rgb(148,163,184)" }}>{t("PLATFORM_SELECT_HOSTEL_PROMPT")}</Typography>
        )}
      </CardContent>
    </Card>
  );
}

function MetricTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <Box sx={{ p: 1.5, border: "1px solid rgba(71,85,105,0.55)", borderRadius: 2, bgcolor: "rgba(2,6,23,0.5)" }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
        {icon}
        <Typography variant="caption" sx={{ color: "rgb(148,163,184)" }}>
          {label}
        </Typography>
      </Stack>
      <Typography sx={{ color: "white", fontWeight: 700 }}>{value}</Typography>
    </Box>
  );
}
