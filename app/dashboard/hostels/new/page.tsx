"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useAuthStore } from "@/lib/AuthStore";
import { t } from "@/lib/i18n";

const HOSTEL_TYPES = ["boys", "girls", "coed", "pg", "other"] as const;

export default function NewHostelPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    buildingName: "",
    hostelType: "",
    address: "",
    areaLocality: "",
    city: "",
    state: "",
    pincode: "",
    contactPhone: "",
    totalFloors: "",
    totalRooms: "",
    roomNumbers: "",
    amenities: "",
    description: "",
    isActive: true,
  });

  if (!user?.isOwner || user.managementMode !== "multi") {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Forbidden</Typography>
      </Box>
    );
  }

  const submit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const email = user.email?.trim().toLowerCase();
      const res = await fetch("/api/hostels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(email ? { "X-Admin-Email": email } : {}),
        },
        body: JSON.stringify({
          name: form.name.trim(),
          buildingName: form.buildingName.trim() || undefined,
          hostelType: form.hostelType || undefined,
          address: form.address.trim() || undefined,
          areaLocality: form.areaLocality.trim() || undefined,
          city: form.city.trim() || undefined,
          state: form.state.trim() || undefined,
          pincode: form.pincode.trim() || undefined,
          contactPhone: form.contactPhone.trim() || undefined,
          totalFloors: form.totalFloors ? Number(form.totalFloors) : null,
          totalRooms: form.totalRooms ? Number(form.totalRooms) : null,
          roomNumbers: form.roomNumbers.trim() || undefined,
          amenities: form.amenities.trim() || undefined,
          description: form.description.trim() || undefined,
          isActive: form.isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error();
      const hostels = (data.hostels ?? []) as { id: number; name: string; city: string | null; state: string | null }[];
      updateUser({
        hostelId: data.hostelId ?? user.hostelId,
        accessibleHostels: hostels.map((h) => ({
          id: h.id,
          name: h.name,
          city: h.city,
          state: h.state,
        })),
        managementMode: "multi",
      });
      router.push("/dashboard/portfolio");
    } catch {
      // noop
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 720, mx: "auto" }}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        {t("MULTI_HOSTEL_ADD_HOSTEL")}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {t("MULTI_HOSTEL_PAGE_SUBTITLE")}
      </Typography>

      <Stack spacing={2}>
        <TextField
          required
          label={t("MULTI_ONBOARDING_HOSTEL_NAME")}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <TextField
          label={t("MULTI_ONBOARDING_BUILDING_NAME")}
          value={form.buildingName}
          onChange={(e) => setForm((f) => ({ ...f, buildingName: e.target.value }))}
        />
        <TextField
          select
          label={t("MULTI_ONBOARDING_HOSTEL_TYPE")}
          value={form.hostelType}
          onChange={(e) => setForm((f) => ({ ...f, hostelType: e.target.value }))}
          InputLabelProps={{ shrink: true }}
        >
          <MenuItem value="">{t("MULTI_ONBOARDING_SELECT_TYPE")}</MenuItem>
          {HOSTEL_TYPES.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label={t("MULTI_ONBOARDING_ADDRESS")}
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
        />
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            fullWidth
            label={t("MULTI_ONBOARDING_AREA")}
            value={form.areaLocality}
            onChange={(e) => setForm((f) => ({ ...f, areaLocality: e.target.value }))}
          />
          <TextField
            fullWidth
            label={t("MULTI_ONBOARDING_CITY")}
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          />
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            fullWidth
            label={t("MULTI_ONBOARDING_STATE")}
            value={form.state}
            onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
          />
          <TextField
            fullWidth
            label={t("MULTI_ONBOARDING_PINCODE")}
            value={form.pincode}
            onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))}
          />
        </Stack>
        <TextField
          label={t("MULTI_ONBOARDING_CONTACT")}
          value={form.contactPhone}
          onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
        />
        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button variant="text" onClick={() => router.push("/dashboard/portfolio")}>
            {t("MULTI_ONBOARDING_BACK")}
          </Button>
          <Button variant="contained" disabled={saving || !form.name.trim()} onClick={() => void submit()}>
            {t("MULTI_ONBOARDING_SAVE")}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
