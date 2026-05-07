import {
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { getHostelSubscriptionMeta } from "@/lib/platform/hostelRowMeta";
import { t } from "@/lib/i18n";
import { formatDate, subscriptionChipColor } from "./platformDashboard.utils";
import type { AccessFilter, HostelRow, PlanFilter } from "./types";

type Props = {
  hostels: HostelRow[];
  filteredHostels: HostelRow[];
  selectedHostelId: number | null;
  accessFilter: AccessFilter;
  planFilter: PlanFilter;
  onAccessFilterChange: (v: AccessFilter) => void;
  onPlanFilterChange: (v: PlanFilter) => void;
  onSelectHostel: (id: number) => void;
};

export function HostelsTablePanel({
  hostels,
  filteredHostels,
  selectedHostelId,
  accessFilter,
  planFilter,
  onAccessFilterChange,
  onPlanFilterChange,
  onSelectHostel,
}: Props) {
  return (
    <Card sx={{ bgcolor: "rgba(15,23,42,0.65)", border: "1px solid rgba(100,116,139,0.35)", height: "100%" }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ p: 2, borderBottom: "1px solid rgba(100,116,139,0.3)" }}>
          <Typography variant="h6" sx={{ color: "white" }}>
            {t("PLATFORM_HOSTELS")}
          </Typography>
          <Typography variant="caption" sx={{ color: "rgb(148,163,184)" }}>
            {t("PLATFORM_SELECT_HOSTEL_SUBTITLE")}
          </Typography>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mt: 2 }} alignItems={{ md: "end" }}>
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel sx={{ color: "rgb(148,163,184)" }}>{t("PLATFORM_SUBSCRIPTION_FILTER")}</InputLabel>
              <Select
                value={accessFilter}
                label={t("PLATFORM_SUBSCRIPTION_FILTER")}
                onChange={(e) => onAccessFilterChange(e.target.value as AccessFilter)}
                sx={{ color: "white" }}
              >
                <MenuItem value="all">{t("PLATFORM_FILTER_ALL")}</MenuItem>
                <MenuItem value="has_access">{t("PLATFORM_FILTER_HAS_ACCESS")}</MenuItem>
                <MenuItem value="trial">{t("PLATFORM_FILTER_TRIAL")}</MenuItem>
                <MenuItem value="paid">{t("PLATFORM_FILTER_PAID")}</MenuItem>
                <MenuItem value="grace">{t("PLATFORM_FILTER_GRACE")}</MenuItem>
                <MenuItem value="lapsed">{t("PLATFORM_FILTER_LAPSED")}</MenuItem>
                <MenuItem value="payment_failed">{t("PLATFORM_FILTER_PAYMENT_FAILED")}</MenuItem>
                <MenuItem value="no_subscription">{t("PLATFORM_FILTER_NO_SUBSCRIPTION")}</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel sx={{ color: "rgb(148,163,184)" }}>{t("PLATFORM_PLAN_FILTER")}</InputLabel>
              <Select
                value={planFilter}
                label={t("PLATFORM_PLAN_FILTER")}
                onChange={(e) => onPlanFilterChange(e.target.value as PlanFilter)}
                sx={{ color: "white" }}
              >
                <MenuItem value="all">{t("PLATFORM_FILTER_ALL_PLANS")}</MenuItem>
                <MenuItem value="basic">{t("PLATFORM_FILTER_PLAN_BASIC")}</MenuItem>
                <MenuItem value="pro">{t("PLATFORM_FILTER_PLAN_PRO")}</MenuItem>
                <MenuItem value="enterprise">{t("PLATFORM_FILTER_PLAN_ENTERPRISE")}</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="caption" sx={{ color: "rgb(148,163,184)" }}>
              {t("PLATFORM_SHOWING_COUNT", { filtered: filteredHostels.length, total: hostels.length })}
            </Typography>
          </Stack>
        </Box>

        <Box sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: "rgb(148,163,184)" }}>ID</TableCell>
                <TableCell sx={{ color: "rgb(148,163,184)" }}>{t("PLATFORM_HOSTEL")}</TableCell>
                <TableCell sx={{ color: "rgb(148,163,184)" }}>{t("PLATFORM_PRIMARY_ADMIN")}</TableCell>
                <TableCell sx={{ color: "rgb(148,163,184)" }}>{t("PLATFORM_HOSTEL_STATUS")}</TableCell>
                <TableCell sx={{ color: "rgb(148,163,184)" }}>{t("PLATFORM_CREATED")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {hostels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ color: "rgb(148,163,184)", py: 4 }}>
                    {t("PLATFORM_NO_HOSTELS")}
                  </TableCell>
                </TableRow>
              ) : filteredHostels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ color: "rgb(148,163,184)", py: 4 }}>
                    {t("PLATFORM_NO_HOSTELS_MATCHING_FILTERS")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredHostels.map((h) => {
                  const meta = getHostelSubscriptionMeta(h);
                  const active = selectedHostelId === h.id;
                  return (
                    <TableRow
                      key={h.id}
                      hover
                      onClick={() => onSelectHostel(h.id)}
                      sx={{
                        cursor: "pointer",
                        bgcolor: active ? "rgba(30,41,59,0.8)" : "transparent",
                        "& .MuiTableCell-root": { color: "rgb(226,232,240)", borderColor: "rgba(71,85,105,0.5)" },
                      }}
                    >
                      <TableCell>{h.id}</TableCell>
                      <TableCell>
                        <Typography sx={{ color: "white", fontWeight: 600 }}>{h.name}</Typography>
                        <Typography variant="caption" sx={{ color: "rgb(148,163,184)" }}>
                          {[h.city, h.state].filter(Boolean).join(", ") || "-"}
                          {h.pincode ? ` ${h.pincode}` : ""}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography>{h.adminName || "-"}</Typography>
                        <Typography variant="caption" sx={{ color: "rgb(148,163,184)", display: "block" }}>
                          {h.adminEmail || "-"}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "rgb(148,163,184)", display: "block" }}>
                          {h.adminMobile?.trim() ? h.adminMobile.trim() : "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" color={subscriptionChipColor(meta)} label={meta.badgeLabel} />
                        <Typography variant="caption" display="block" sx={{ color: "rgb(148,163,184)", mt: 0.5 }}>
                          {meta.planLine}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(h.createdAt)}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Box>
      </CardContent>
    </Card>
  );
}
