"use client";

import { type MouseEvent } from "react";
import {
  Box,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { SkipForward, UserPlus2, UserRoundSearch } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { t } from "@/lib/i18n";
import { UserCoreFormFields } from "@/app/dashboard/users-roles/UserCoreFormFields";
import type { AssignMode, ExistingUser, NewUserFormState, RoleOption } from "./types";

type Props = {
  assignMode: AssignMode;
  onAssignModeChange: (mode: AssignMode) => void;
  users: ExistingUser[];
  roles: RoleOption[];
  selectedExistingUserId: string;
  onSelectedExistingUserIdChange: (value: string) => void;
  newUser: NewUserFormState;
  onNewUserChange: (next: NewUserFormState) => void;
  skipConfirmed: boolean;
  onSkipConfirmedChange: (checked: boolean) => void;
};

export function AddHostelStepAssignUser({
  assignMode,
  onAssignModeChange,
  users,
  roles,
  selectedExistingUserId,
  onSelectedExistingUserIdChange,
  newUser,
  onNewUserChange,
  skipConfirmed,
  onSkipConfirmedChange,
}: Props) {
  return (
    <Stack spacing={2}>
      <Typography fontWeight={700}>{t("MULTI_ONBOARDING_STEP_ASSIGN")}</Typography>
      <ToggleButtonGroup
        exclusive
        value={assignMode}
        onChange={(_event: MouseEvent<HTMLElement>, v: AssignMode | null) => {
          if (v) onAssignModeChange(v);
        }}
        sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 1.5 }}
      >
        <ToggleButton value="create" sx={{ justifyContent: "flex-start", textTransform: "none", p: 1.5 }}>
          <Stack alignItems="flex-start" spacing={0.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <UserPlus2 size={16} />
              <Typography fontWeight={600}>{t("MULTI_ASSIGN_CREATE_USER")}</Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {t("MULTI_ASSIGN_CREATE_HELP")}
            </Typography>
          </Stack>
        </ToggleButton>
        <ToggleButton value="existing" sx={{ justifyContent: "flex-start", textTransform: "none", p: 1.5 }}>
          <Stack alignItems="flex-start" spacing={0.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <UserRoundSearch size={16} />
              <Typography fontWeight={600}>{t("MULTI_ASSIGN_SELECT_USER")}</Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {t("MULTI_ASSIGN_SELECT_HELP")}
            </Typography>
          </Stack>
        </ToggleButton>
        <ToggleButton value="skip" sx={{ justifyContent: "flex-start", textTransform: "none", p: 1.5 }}>
          <Stack alignItems="flex-start" spacing={0.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <SkipForward size={16} />
              <Typography fontWeight={600}>{t("MULTI_ONBOARDING_ASSIGN_SKIP")}</Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {t("MULTI_ASSIGN_SKIP_HELP")}
            </Typography>
          </Stack>
        </ToggleButton>
      </ToggleButtonGroup>

      {assignMode === "existing" && (
        <TextField
          select
          fullWidth
          required
          label={`${t("MULTI_ASSIGN_EXISTING_USER_LABEL")} *`}
          value={selectedExistingUserId}
          onChange={(e) => onSelectedExistingUserIdChange(e.target.value)}
        >
          <MenuItem value="">{t("MULTI_ASSIGN_SELECT_USER_PLACEHOLDER")}</MenuItem>
          {users.map((u) => (
            <MenuItem key={u.id} value={String(u.id)}>
              {u.name} ({u.email})
            </MenuItem>
          ))}
        </TextField>
      )}

      {assignMode === "create" && (
        <>
          <UserCoreFormFields
            className="rounded-md border border-slate-200 p-3"
            name={newUser.name}
            phone={newUser.phone}
            email={newUser.email}
            password={newUser.password}
            confirmPassword={newUser.confirmPassword}
            roleId={newUser.roleId}
            isActive={newUser.isActive}
            roles={roles.map((r) => ({ id: r.id, name: r.name }))}
            onNameChange={(value) => onNewUserChange({ ...newUser, name: value })}
            onPhoneChange={(value) => onNewUserChange({ ...newUser, phone: value })}
            onEmailChange={(value) => onNewUserChange({ ...newUser, email: value })}
            onPasswordChange={(value) => onNewUserChange({ ...newUser, password: value })}
            onConfirmPasswordChange={(value) => onNewUserChange({ ...newUser, confirmPassword: value })}
            onRoleIdChange={(value) => onNewUserChange({ ...newUser, roleId: value })}
            onIsActiveChange={(value) => onNewUserChange({ ...newUser, isActive: value })}
            showStatus={false}
            requiredAsteriskClassName="text-red-500"
          />
          {!roles.length && (
            <Typography variant="caption" color="text.secondary">
              {t("MULTI_ASSIGN_ROLE_HINT")}
            </Typography>
          )}
        </>
      )}

      {assignMode === "skip" && (
        <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1.5, p: 1.5 }}>
          <label className="flex items-start gap-2 text-sm text-muted-foreground">
            <Checkbox checked={skipConfirmed} onChange={(e) => onSkipConfirmedChange(e.target.checked)} />
            <span>
              I understand this hostel will be created without any assigned user, and user assignment can be done later
              from Users & Roles.
            </span>
          </label>
        </Box>
      )}
    </Stack>
  );
}
