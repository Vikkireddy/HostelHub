"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Box, Typography } from "@mui/material";
import { useAuthStore } from "@/lib/AuthStore";
import { t } from "@/lib/i18n";
import { useSettingsStore } from "@/lib/SettingsStore";
import { AddHostelModal } from "@/components/multi-hostel/AddHostelModal";
import { HostelPortfolioCarousel } from "@/components/multi-hostel/HostelPortfolioCarousel";
import type { PortfolioHostelCardData } from "@/components/multi-hostel/PortfolioHostelCard";
import { MultiHostelKpiGrid } from "@/components/multi-hostel/MultiHostelKpiGrid";
import {
  HostelManagementDialogs,
  type EditHostelFormValues,
} from "@/components/multi-hostel/HostelManagementDialogs";
import { MultiHostelOverviewSkeleton } from "@/components/skeletons";

type PortfolioSummary = {
  success: boolean;
  kpis: {
    totalHostels: number;
    totalResidents: number;
    totalRooms: number;
    occupiedRooms: number;
    vacantRooms: number;
    pendingPayments: number;
    monthlyRevenue: number;
    monthlyExpenses: number;
  };
  hostels: PortfolioHostelCardData[];
};

async function fetchPortfolioSummary(): Promise<PortfolioSummary> {
  const email = useAuthStore.getState().user?.email?.trim().toLowerCase();
  const res = await fetch("/api/portfolio/summary", {
    headers: email ? { "X-Admin-Email": email } : {},
  });
  const body = (await res.json()) as PortfolioSummary;
  if (!res.ok) {
    throw new Error((body as unknown as { error?: string }).error || "Failed");
  }
  return body;
}

export function MultiHostelOverview() {
  const user = useAuthStore((s) => s.user);
  const hostelId = user?.hostelId ?? null;
  const paymentTrackingEnabled = useSettingsStore((s) => s.getPaymentTrackingEnabled(hostelId));
  const [addHostelOpen, setAddHostelOpen] = useState(false);
  const [editHostel, setEditHostel] = useState<PortfolioHostelCardData | null>(null);
  const [deleteHostel, setDeleteHostel] = useState<PortfolioHostelCardData | null>(null);
  const [editForm, setEditForm] = useState<EditHostelFormValues>({
    name: "",
    city: "",
    state: "",
    isActive: true,
  });

  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["portfolio-summary", user?.email],
    queryFn: fetchPortfolioSummary,
    enabled: Boolean(user?.email) && user?.managementMode === "multi",
  });

  const email = user?.email?.trim().toLowerCase();

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editHostel || !email) throw new Error("Missing context");
      const res = await fetch(`/api/hostels/${editHostel.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-Admin-Email": email },
        body: JSON.stringify({
          name: editForm.name,
          city: editForm.city,
          state: editForm.state,
          isActive: editForm.isActive,
        }),
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: async () => {
      setEditHostel(null);
      await queryClient.invalidateQueries({ queryKey: ["portfolio-summary"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!deleteHostel || !email) throw new Error("Missing context");
      const res = await fetch(`/api/hostels/${deleteHostel.id}`, {
        method: "DELETE",
        headers: { "X-Admin-Email": email },
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: async () => {
      setDeleteHostel(null);
      await queryClient.invalidateQueries({ queryKey: ["portfolio-summary"] });
    },
  });

  if (isLoading) {
    return (
      <Box sx={{ maxWidth: 1400, mx: "auto" }}>
        <MultiHostelOverviewSkeleton />
      </Box>
    );
  }

  if (error || !data?.success) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{t("MULTI_HOSTEL_FAILED")}</Typography>
      </Box>
    );
  }

  const { kpis, hostels } = data;

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto" }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={800}>
          {t("MULTI_HOSTEL_PAGE_TITLE")}
        </Typography>
        <Typography color="text.secondary">{t("MULTI_HOSTEL_PAGE_SUBTITLE")}</Typography>
      </Box>

      <MultiHostelKpiGrid
        kpis={kpis}
        hostels={hostels}
        paymentTrackingEnabled={paymentTrackingEnabled}
      />

      <HostelPortfolioCarousel
        hostels={hostels}
        onAddHostel={() => setAddHostelOpen(true)}
        onEdit={(hostel) => {
          setEditHostel(hostel);
          setEditForm({
            name: hostel.name,
            city: hostel.city ?? "",
            state: hostel.state ?? "",
            isActive: hostel.isActive,
          });
        }}
        onDelete={setDeleteHostel}
      />

      <AddHostelModal open={addHostelOpen} onClose={() => setAddHostelOpen(false)} />

      <HostelManagementDialogs
        editHostel={editHostel}
        deleteHostel={deleteHostel}
        editForm={editForm}
        setEditForm={setEditForm}
        onCloseEdit={() => setEditHostel(null)}
        onCloseDelete={() => setDeleteHostel(null)}
        onSubmitEdit={() => updateMutation.mutate()}
        onSubmitDelete={() => deleteMutation.mutate()}
      />
    </Box>
  );
}
