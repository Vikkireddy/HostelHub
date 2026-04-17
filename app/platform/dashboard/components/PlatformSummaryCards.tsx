import type { LucideIcon } from "lucide-react";
import { Building2, DoorOpen, Users } from "lucide-react";
import { Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import { t } from "@/lib/i18n";
import type { StatsPayload, SummaryKey } from "./types";

const PLATFORM_SUMMARY_CARDS: {
  metricKey: SummaryKey;
  label: string;
  Icon: LucideIcon;
}[] = [
  { metricKey: "totalHostels", label: t("PLATFORM_TOTAL_HOSTELS"), Icon: Building2 },
  { metricKey: "totalStudents", label: t("PLATFORM_TOTAL_STUDENTS"), Icon: Users },
  { metricKey: "totalRooms", label: t("PLATFORM_TOTAL_ROOMS"), Icon: DoorOpen },
  { metricKey: "adminsWithHostel", label: t("PLATFORM_ADMINS_LINKED"), Icon: Users },
  { metricKey: "hostelsThisMonth", label: t("PLATFORM_NEW_HOSTELS_THIS_MONTH"), Icon: Building2 },
];

export function PlatformSummaryCards({ summary }: { summary: StatsPayload["summary"] }) {
  return (
    <Grid container spacing={2.5} sx={{ mb: 4 }}>
      {PLATFORM_SUMMARY_CARDS.map(({ metricKey, label, Icon }) => (
        <Grid key={metricKey} size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <Card sx={{ bgcolor: "rgba(15,23,42,0.7)", border: "1px solid rgba(100,116,139,0.35)" }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Icon size={18} color="#94a3b8" />
                <Typography variant="caption" sx={{ color: "rgb(148,163,184)" }}>
                  {label}
                </Typography>
              </Stack>
              <Typography variant="h5" sx={{ color: "white", fontWeight: 700 }}>
                {summary[metricKey]}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
