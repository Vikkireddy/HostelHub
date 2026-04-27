"use client";

import { Bed, CurrencyRupee, Groups, HomeWork, Payments, ReceiptLong } from "@mui/icons-material";
import { Grid } from "@mui/material";
import { t } from "@/lib/i18n";
import { PortfolioKpiCard } from "@/components/multi-hostel/PortfolioKpiCard";
import type { PortfolioHostelCardData } from "@/components/multi-hostel/PortfolioHostelCard";

type Kpis = {
  totalHostels: number;
  totalResidents: number;
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  pendingPayments: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
};

type MultiHostelKpiGridProps = {
  kpis: Kpis;
  hostels: PortfolioHostelCardData[];
  paymentTrackingEnabled?: boolean;
};

export function MultiHostelKpiGrid({
  kpis,
  hostels,
  paymentTrackingEnabled = true,
}: MultiHostelKpiGridProps) {
  const totalOccupancyPct =
    kpis.totalRooms > 0 ? Math.round((kpis.occupiedRooms / kpis.totalRooms) * 100) : 0;
  const activeCount = hostels.filter((h) => h.isActive).length;

  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <PortfolioKpiCard
          label={t("MULTI_HOSTEL_KPI_TOTAL_HOSTELS")}
          value={kpis.totalHostels}
          icon={<HomeWork fontSize="small" color="primary" />}
          accent="purple"
          sub={`${t("MULTI_HOSTEL_STATUS_ACTIVE")}: ${activeCount}`}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <PortfolioKpiCard
          label={t("MULTI_HOSTEL_KPI_RESIDENTS")}
          value={kpis.totalResidents}
          icon={<Groups fontSize="small" sx={{ color: "success.main" }} />}
          accent="green"
          sub={`${t("MULTI_HOSTEL_KPI_OCCUPIED")}: ${kpis.occupiedRooms}`}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <PortfolioKpiCard
          label={t("MULTI_HOSTEL_KPI_ROOMS")}
          value={kpis.totalRooms}
          icon={<Bed fontSize="small" sx={{ color: "warning.main" }} />}
          accent="amber"
          sub={`${totalOccupancyPct}% ${t("MULTI_HOSTEL_KPI_OCCUPANCY_SUFFIX")}`}
        />
      </Grid>
      {paymentTrackingEnabled ? (
        <>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <PortfolioKpiCard
              label={t("MULTI_HOSTEL_KPI_PENDING")}
              value={kpis.pendingPayments}
              icon={<Payments fontSize="small" sx={{ color: "primary.main" }} />}
              accent="blue"
              sub={`₹ ${kpis.pendingPayments * 1000}`}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <PortfolioKpiCard
              label={t("MULTI_HOSTEL_KPI_REVENUE")}
              value={`₹ ${kpis.monthlyRevenue}`}
              icon={<CurrencyRupee fontSize="small" sx={{ color: "success.main" }} />}
              accent="green"
              sub={
                kpis.monthlyRevenue > 0
                  ? t("MULTI_HOSTEL_KPI_REVENUE_TREND")
                  : t("MULTI_HOSTEL_KPI_REVENUE_EMPTY")
              }
            />
          </Grid>
        </>
      ) : null}
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <PortfolioKpiCard
          label={t("MULTI_HOSTEL_KPI_EXPENSES")}
          value={`₹ ${kpis.monthlyExpenses}`}
          icon={<ReceiptLong fontSize="small" sx={{ color: "error.main" }} />}
          accent="rose"
          sub={
            kpis.monthlyExpenses > 0
              ? t("MULTI_HOSTEL_KPI_EXPENSES_TREND")
              : t("MULTI_HOSTEL_KPI_EXPENSES_EMPTY")
          }
        />
      </Grid>
    </Grid>
  );
}
