"use client";

import { Box, Stack, TextField, Typography } from "@mui/material";
import { Radio } from "@/components/ui/radio";
import { t } from "@/lib/i18n";
import { HOSTEL_TYPE_OPTIONS, type HostelFormState } from "./types";

type AddHostelStepDetailsProps = {
  form: HostelFormState;
  onFormChange: (next: HostelFormState) => void;
};

export function AddHostelStepDetails({ form, onFormChange }: AddHostelStepDetailsProps) {
  return (
    <Stack spacing={2}>
      <Typography fontWeight={700}>Basic Information</Typography>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <TextField
          fullWidth
          required
          label={t("MULTI_ONBOARDING_HOSTEL_NAME")}
          value={form.name}
          onChange={(e) => onFormChange({ ...form, name: e.target.value })}
        />
        <TextField
          fullWidth
          label={t("MULTI_ONBOARDING_BUILDING_NAME")}
          value={form.buildingName}
          onChange={(e) => onFormChange({ ...form, buildingName: e.target.value })}
        />
        <TextField
          fullWidth
          select
          label={t("MULTI_ONBOARDING_HOSTEL_TYPE")}
          value={form.hostelType}
          onChange={(e) => onFormChange({ ...form, hostelType: e.target.value })}
          InputLabelProps={{ shrink: true }}
          SelectProps={{
            native: true,
          }}
        >
          <option value="">{t("MULTI_ONBOARDING_SELECT_TYPE")}</option>
          {HOSTEL_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </TextField>
      </Stack>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <TextField
          fullWidth
          label={t("MULTI_ONBOARDING_ADDRESS")}
          value={form.address}
          onChange={(e) => onFormChange({ ...form, address: e.target.value })}
        />
        <TextField
          fullWidth
          label={t("MULTI_ONBOARDING_AREA")}
          value={form.areaLocality}
          onChange={(e) => onFormChange({ ...form, areaLocality: e.target.value })}
        />
      </Stack>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <TextField
          fullWidth
          label={t("MULTI_ONBOARDING_CITY")}
          value={form.city}
          onChange={(e) => onFormChange({ ...form, city: e.target.value })}
        />
        <TextField
          fullWidth
          label={t("MULTI_ONBOARDING_STATE")}
          value={form.state}
          onChange={(e) => onFormChange({ ...form, state: e.target.value })}
        />
        <TextField
          fullWidth
          label={t("MULTI_ONBOARDING_PINCODE")}
          value={form.pincode}
          onChange={(e) => onFormChange({ ...form, pincode: e.target.value })}
        />
      </Stack>
      <TextField
        label={t("MULTI_ONBOARDING_CONTACT")}
        value={form.contactPhone}
        onChange={(e) => onFormChange({ ...form, contactPhone: e.target.value })}
      />
      <Box>
        <Typography fontWeight={700} sx={{ mb: 1 }}>
          {t("USERS_ROLES_FIELD_STATUS")}
        </Typography>
        <div className="flex gap-4 pt-1">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Radio
              name="hostel-status"
              value="active"
              checked={form.isActive}
              onChange={() => onFormChange({ ...form, isActive: true })}
            />
            {t("USERS_ROLES_STATUS_ACTIVE")}
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Radio
              name="hostel-status"
              value="inactive"
              checked={!form.isActive}
              onChange={() => onFormChange({ ...form, isActive: false })}
            />
            {t("USERS_ROLES_STATUS_INACTIVE")}
          </label>
        </div>
      </Box>
    </Stack>
  );
}
