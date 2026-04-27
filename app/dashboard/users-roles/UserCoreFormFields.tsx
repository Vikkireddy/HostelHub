"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Radio } from "@/components/ui/radio";
import { t } from "@/lib/i18n";

type RoleItem = { id: number; name: string };

type Props = {
  name: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  roleId: number;
  isActive: boolean;
  roles: RoleItem[];
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onRoleIdChange: (value: number) => void;
  onIsActiveChange: (value: boolean) => void;
  showStatus?: boolean;
  requiredAsteriskClassName?: string;
  className?: string;
};

export function UserCoreFormFields({
  name,
  phone,
  email,
  password,
  confirmPassword,
  roleId,
  isActive,
  roles,
  onNameChange,
  onPhoneChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onRoleIdChange,
  onIsActiveChange,
  showStatus = true,
  requiredAsteriskClassName,
  className,
}: Props) {
  const requiredMark = (
    <span className={requiredAsteriskClassName ?? ""} aria-hidden>
      *
    </span>
  );

  return (
    <div className={className}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>
            {t("USERS_ROLES_FIELD_NAME")} {requiredMark}
          </Label>
          <Input value={name} onChange={(e) => onNameChange(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>
            {t("USERS_ROLES_FIELD_EMAIL")} {requiredMark}
          </Label>
          <Input value={email} onChange={(e) => onEmailChange(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>
            {t("USERS_ROLES_FIELD_PHONE")} {requiredMark}
          </Label>
          <Input value={phone} onChange={(e) => onPhoneChange(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>
            {t("USERS_ROLES_FIELD_ROLE")} {requiredMark}
          </Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={roleId || ""}
            onChange={(e) => onRoleIdChange(Number(e.target.value) || 0)}
          >
            <option value="">{t("USERS_ROLES_SELECT_ROLE")}</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>
            {t("USERS_ROLES_FIELD_PASSWORD")} {requiredMark}
          </Label>
          <Input type="password" value={password} onChange={(e) => onPasswordChange(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>
            {t("USERS_ROLES_FIELD_CONFIRM_PASSWORD")} {requiredMark}
          </Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
          />
        </div>
      </div>
      {showStatus && (
        <div className="mt-4 space-y-2">
          <Label>{t("USERS_ROLES_FIELD_STATUS")} *</Label>
          <div className="flex gap-4 pt-1">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Radio name="user-status-common" value="active" checked={isActive} onChange={() => onIsActiveChange(true)} />
              {t("USERS_ROLES_STATUS_ACTIVE")}
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Radio
                name="user-status-common"
                value="inactive"
                checked={!isActive}
                onChange={() => onIsActiveChange(false)}
              />
              {t("USERS_ROLES_STATUS_INACTIVE")}
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
