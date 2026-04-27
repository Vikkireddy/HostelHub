"use client";

import { Stack, Typography } from "@mui/material";
import { Building2 } from "lucide-react";
import { t } from "@/lib/i18n";
import type { AssignMode, ExistingUser, NewUserFormState, HostelFormState } from "./types";

type Props = {
  form: HostelFormState;
  assignMode: AssignMode;
  selectedExistingUser: ExistingUser | null;
  newUser: NewUserFormState;
};

export function AddHostelStepReview({ form, assignMode, selectedExistingUser, newUser }: Props) {
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Building2 size={18} />
        <Typography fontWeight={700}>{t("MULTI_ONBOARDING_REVIEW_HOSTEL")}</Typography>
      </Stack>
      <Typography>{form.name || "—"}</Typography>
      <Typography variant="body2" color="text.secondary">
        {[form.address, form.areaLocality, form.city, form.state, form.pincode].filter(Boolean).join(", ") || "—"}
      </Typography>
      <Typography fontWeight={700} sx={{ mt: 1 }}>
        {t("MULTI_ONBOARDING_STEP_ASSIGN")}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {assignMode === "skip"
          ? t("MULTI_ONBOARDING_ASSIGN_SKIP")
          : assignMode === "existing"
            ? selectedExistingUser
              ? `${selectedExistingUser.name} (${selectedExistingUser.email})`
              : t("MULTI_ASSIGN_NO_USER_SELECTED")
            : newUser.name
              ? `${newUser.name} (${newUser.email})`
              : t("MULTI_ASSIGN_NO_USER_DETAILS")}
      </Typography>
    </Stack>
  );
}
