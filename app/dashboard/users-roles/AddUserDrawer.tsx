"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Radio } from "@/components/ui/radio";
import { ModalWithHeaderFooter } from "@/components/ui/ModalWithHeaderFooter";
import { t } from "@/lib/i18n";
import { toast } from "sonner";
import { Typography } from "@/components/ui/typography";
import {
  defaultEmptyMatrix,
  normalizePermissionsFromDb,
  type PermissionsMatrix,
} from "@/lib/permissionMatrix";
import { PermissionMatrixEditor } from "./PermissionMatrixEditor";
import type { AddUserDrawerProps } from "./types";
import { UserCoreFormFields } from "./UserCoreFormFields";

const RESET_USER_FORM = {
  name: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
  roleId: 0,
  isActive: true,
  showPwd: false,
  overrideMatrix: null as PermissionsMatrix | null,
  permsOpen: false,
  initialPermissionOverride: null as PermissionsMatrix | null,
};

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export const AddUserDrawer = ({
  open,
  onOpenChange,
  hostelName,
  roles,
  editUser,
  onSave,
  onUpdateUser,
  saving,
  portfolioContext = false,
  assignHostelOptions = [],
}: AddUserDrawerProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [roleId, setRoleId] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [permsOpen, setPermsOpen] = useState(false);
  const [overrideMatrix, setOverrideMatrix] = useState<PermissionsMatrix | null>(null);
  const [initialPermissionOverride, setInitialPermissionOverride] = useState<PermissionsMatrix | null>(null);
  const [assignHostelCreate, setAssignHostelCreate] = useState<number | null>(null);
  const [assignHostelEdit, setAssignHostelEdit] = useState<number | null>(null);

  const isEdit = editUser != null;
  const isOwnerEdit = Boolean(editUser?.is_owner);

  const resetFormState = () => {
    setName(RESET_USER_FORM.name);
    setPhone(RESET_USER_FORM.phone);
    setEmail(RESET_USER_FORM.email);
    setPassword(RESET_USER_FORM.password);
    setConfirmPassword(RESET_USER_FORM.confirmPassword);
    setRoleId(RESET_USER_FORM.roleId);
    setIsActive(RESET_USER_FORM.isActive);
    setShowPwd(RESET_USER_FORM.showPwd);
    setOverrideMatrix(RESET_USER_FORM.overrideMatrix);
    setPermsOpen(RESET_USER_FORM.permsOpen);
    setInitialPermissionOverride(RESET_USER_FORM.initialPermissionOverride);
    setAssignHostelCreate(null);
    setAssignHostelEdit(null);
  };

  useEffect(() => {
    if (!open) {
      resetFormState();
      return;
    }
    if (editUser) {
      setName(editUser.name);
      setPhone(editUser.phone);
      setEmail(editUser.email);
      setPassword("");
      setConfirmPassword("");
      setRoleId(editUser.role_id ?? 0);
      setIsActive(editUser.is_active);
      setShowPwd(false);
      setOverrideMatrix(null);
      setPermsOpen(false);
      setAssignHostelEdit(editUser.hostel_id ?? null);
      setInitialPermissionOverride(
        editUser.permissions_override != null
          ? normalizePermissionsFromDb(editUser.permissions_override)
          : null
      );
      return;
    }
    resetFormState();
  }, [open, editUser]);

  const close = () => onOpenChange(false);

  const selectedRole = roles.find((r) => r.id === roleId);

  const openConfigurePerms = () => {
    const base =
      isEdit && initialPermissionOverride != null
        ? initialPermissionOverride
        : selectedRole?.permissions ?? defaultEmptyMatrix();
    setOverrideMatrix(normalizePermissionsFromDb(base));
    setPermsOpen(true);
  };

  const handleRoleChange = (nextId: number) => {
    setRoleId(nextId);
    if (!isEdit) {
      setPermsOpen(false);
      setOverrideMatrix(null);
      return;
    }
    if (editUser && nextId !== (editUser.role_id ?? 0)) {
      setInitialPermissionOverride(null);
      setPermsOpen(false);
      setOverrideMatrix(null);
    }
  };

  const handleSubmit = async () => {
    if (isEdit && editUser) {
      if (password || confirmPassword) {
        if (password !== confirmPassword) {
          toast.error(t("SIGNUP_ERROR_PASSWORDS_MISMATCH"));
          return;
        }
      }
      const permissionsOverride = isOwnerEdit
        ? null
        : permsOpen && overrideMatrix
          ? overrideMatrix
          : initialPermissionOverride;
      await onUpdateUser({
        id: editUser.id,
        name: name.trim(),
        phone: phone.trim(),
        roleId: isOwnerEdit ? 0 : roleId,
        isActive,
        permissionsOverride,
        password: password.trim() || undefined,
        confirmPassword: confirmPassword.trim() || undefined,
        isOwnerTarget: isOwnerEdit,
        ...(portfolioContext && !isOwnerEdit ? { assignHostelId: assignHostelEdit } : {}),
      });
      return;
    }
    await onSave({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      password,
      confirmPassword,
      roleId,
      isActive,
      permissionsOverride: permsOpen && overrideMatrix ? overrideMatrix : null,
      ...(portfolioContext ? { assignHostelId: assignHostelCreate } : {}),
    });
  };

  const hasName = Boolean(name.trim());
  const hasPhone = Boolean(phone.trim());
  const hasEmail = Boolean(email.trim());
  const hasRole = Boolean(roleId);
  const hasPassword = Boolean(password);
  const hasConfirmPassword = Boolean(confirmPassword);
  const canSubmitCreate = hasName && hasPhone && hasEmail && hasRole && hasPassword;
  const canSubmitEditOwner = hasName && hasPhone;
  const canSubmitEditStaff = hasName && hasPhone && hasRole && (!hasPassword || hasConfirmPassword);
  const canSubmit = isEdit
    ? isOwnerEdit
      ? canSubmitEditOwner
      : canSubmitEditStaff
    : canSubmitCreate;

  const showHostelPickerCreate = portfolioContext && !isEdit && assignHostelOptions.length > 0;
  const showHostelPickerEdit = portfolioContext && isEdit && !isOwnerEdit && assignHostelOptions.length > 0;

  return (
    <ModalWithHeaderFooter
      open={open}
      onOpenChange={onOpenChange}
      isBackdropCloseEnabled
      isShutterEnabled
      maxWidth="full"
      className="w-[100vw] sm:max-w-[520px] md:max-w-[600px] lg:max-w-[640px]"
      headerTitle={isEdit ? t("USERS_ROLES_DRAWER_EDIT_USER_TITLE") : t("USERS_ROLES_DRAWER_ADD_USER_TITLE")}
      headerDescription={
        isEdit ? t("USERS_ROLES_DRAWER_EDIT_USER_SUBTITLE") : t("USERS_ROLES_DRAWER_ADD_USER_SUBTITLE")
      }
      bodyClassName="space-y-4"
      footerComponent={
        <>
          <Button type="button" variant="outline" onClick={close} disabled={saving}>
            {t("CANCEL")}
          </Button>
          <Button type="button" onClick={() => void handleSubmit()} disabled={saving || !canSubmit}>
            {saving ? t("USERS_ROLES_SAVING") : isEdit ? t("USERS_ROLES_UPDATE_USER") : t("USERS_ROLES_SAVE_USER")}
          </Button>
        </>
      }
    >
      {isEdit ? (
        <>
          <div className="space-y-2">
            <Label>{t("USERS_ROLES_FIELD_NAME")} *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("USERS_ROLES_PLACEHOLDER_NAME")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("USERS_ROLES_FIELD_PHONE")} *</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("USERS_ROLES_PLACEHOLDER_PHONE")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("USERS_ROLES_FIELD_EMAIL")}</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("USERS_ROLES_PLACEHOLDER_EMAIL")}
              readOnly
              disabled
              className="bg-slate-50"
            />
          </div>
        </>
      ) : (
        <>
          <UserCoreFormFields
            name={name}
            phone={phone}
            email={email}
            password={password}
            confirmPassword={confirmPassword}
            roleId={roleId}
            isActive={isActive}
            roles={roles.map((r) => ({ id: r.id, name: r.name }))}
            onNameChange={setName}
            onPhoneChange={setPhone}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onRoleIdChange={handleRoleChange}
            onIsActiveChange={setIsActive}
          />
          {showHostelPickerCreate ? (
            <div className="space-y-2">
              <Label>{t("USERS_ROLES_ASSIGN_HOSTEL_OPTIONAL")}</Label>
              <Typography variant="caption" className="block text-slate-600">
                {t("USERS_ROLES_ASSIGN_HOSTEL_HINT")}
              </Typography>
              <select
                className={selectClassName}
                value={assignHostelCreate === null ? "" : String(assignHostelCreate)}
                onChange={(e) => {
                  const v = e.target.value;
                  setAssignHostelCreate(v === "" ? null : Number(v));
                }}
              >
                <option value="">{t("USERS_ROLES_HOSTEL_UNASSIGNED")}</option>
                {assignHostelOptions.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </>
      )}
      {isEdit && (
        <>
          <div className="space-y-2">
            <Label>
              {t("USERS_ROLES_FIELD_PASSWORD")}
              {isEdit ? ` (${t("USERS_ROLES_PASSWORD_OPTIONAL")})` : " *"}
            </Label>
            <div className="relative">
              <Input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                placeholder={isEdit ? t("USERS_ROLES_PASSWORD_LEAVE_BLANK") : undefined}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
                onClick={() => setShowPwd((s) => !s)}
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>
              {t("USERS_ROLES_FIELD_CONFIRM_PASSWORD")}
              {isEdit ? ` (${t("USERS_ROLES_PASSWORD_OPTIONAL")})` : " *"}
            </Label>
            <Input
              type={showPwd ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={isEdit ? t("USERS_ROLES_PASSWORD_LEAVE_BLANK") : undefined}
            />
          </div>
        </>
      )}
      {isEdit && !isOwnerEdit && (
        <div className="space-y-2">
          <Label>{t("USERS_ROLES_FIELD_ROLE")} *</Label>
          <select
            className={selectClassName}
            value={roleId || ""}
            onChange={(e) => handleRoleChange(Number(e.target.value) || 0)}
          >
            <option value="">{t("USERS_ROLES_SELECT_ROLE")}</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      )}
      {isEdit && isOwnerEdit && (
        <div className="space-y-2">
          <Label>{t("USERS_ROLES_FIELD_ROLE")}</Label>
          <Input value={t("USERS_ROLES_ROLE_OWNER")} readOnly className="bg-slate-50" />
        </div>
      )}
      {isEdit && isOwnerEdit && (
        <div className="space-y-2">
          <Label>{t("USERS_ROLES_FIELD_ASSIGNED_HOSTEL")}</Label>
          <Input value={hostelName} readOnly className="bg-slate-50" />
        </div>
      )}
      {isEdit && !isOwnerEdit && showHostelPickerEdit ? (
        <div className="space-y-2">
          <Label>{t("USERS_ROLES_ASSIGN_HOSTEL_OPTIONAL")}</Label>
          <Typography variant="caption" className="block text-slate-600">
            {t("USERS_ROLES_ASSIGN_HOSTEL_HINT")}
          </Typography>
          <select
            className={selectClassName}
            value={assignHostelEdit === null ? "" : String(assignHostelEdit)}
            onChange={(e) => {
              const v = e.target.value;
              setAssignHostelEdit(v === "" ? null : Number(v));
            }}
          >
            <option value="">{t("USERS_ROLES_HOSTEL_UNASSIGNED")}</option>
            {assignHostelOptions.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      {isEdit && !isOwnerEdit && !showHostelPickerEdit ? (
        <div className="space-y-2">
          <Label>{t("USERS_ROLES_FIELD_ASSIGNED_HOSTEL")}</Label>
          <Input
            value={
              editUser?.hostel_name?.trim() ||
              (editUser?.hostel_id == null ? t("USERS_ROLES_HOSTEL_UNASSIGNED") : hostelName)
            }
            readOnly
            className="bg-slate-50"
          />
        </div>
      ) : null}
      {isEdit && !isOwnerEdit && (
        <div className="space-y-2">
          <Label>{t("USERS_ROLES_CONFIGURE_PERMISSIONS")}</Label>
          <Typography variant="caption" className="block">
            {t("USERS_ROLES_PERMISSIONS_HINT")}
          </Typography>
          <Button type="button" variant="outline" size="sm" onClick={openConfigurePerms} disabled={!roleId}>
            {t("USERS_ROLES_CONFIGURE_PERMISSIONS")}
          </Button>
          {permsOpen && overrideMatrix && (
            <div className="pt-2">
              <PermissionMatrixEditor value={overrideMatrix} onChange={setOverrideMatrix} />
            </div>
          )}
        </div>
      )}
      {isEdit && (
        <div className="space-y-2">
          <Label>{t("USERS_ROLES_FIELD_STATUS")} *</Label>
          <div className="flex gap-4 pt-1">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Radio name="user-status" value="active" checked={isActive} onChange={() => setIsActive(true)} />
              {t("USERS_ROLES_STATUS_ACTIVE")}
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Radio
                name="user-status"
                value="inactive"
                checked={!isActive}
                onChange={() => setIsActive(false)}
              />
              {t("USERS_ROLES_STATUS_INACTIVE")}
            </label>
          </div>
        </div>
      )}
    </ModalWithHeaderFooter>
  );
};
