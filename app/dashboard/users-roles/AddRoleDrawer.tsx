"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModalWithHeaderFooter } from "@/components/ui/ModalWithHeaderFooter";
import { t } from "@/lib/i18n";
import { defaultEmptyMatrix, normalizePermissionsFromDb, type PermissionsMatrix } from "@/lib/permissionMatrix";
import { PermissionMatrixEditor } from "./PermissionMatrixEditor";
import type { AddRoleDrawerProps } from "./types";

export const AddRoleDrawer = ({ open, onOpenChange, editSnapshot, onSave, saving }: AddRoleDrawerProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [matrix, setMatrix] = useState<PermissionsMatrix>(() => defaultEmptyMatrix());

  const isEdit = editSnapshot != null;

  useEffect(() => {
    if (!open) {
      setName("");
      setDescription("");
      setMatrix(defaultEmptyMatrix());
      return;
    }
    if (editSnapshot) {
      setName(editSnapshot.name);
      setDescription(editSnapshot.description);
      setMatrix(normalizePermissionsFromDb(editSnapshot.permissions));
    } else {
      setName("");
      setDescription("");
      setMatrix(defaultEmptyMatrix());
    }
  }, [open, editSnapshot]);

  const close = () => onOpenChange(false);

  const handleSubmit = async () => {
    await onSave({ name: name.trim(), description: description.trim(), permissions: matrix });
  };

  return (
    <ModalWithHeaderFooter
      open={open}
      onOpenChange={onOpenChange}

      isBackdropCloseEnabled
      isShutterEnabled
      maxWidth="full"
      className="w-[100vw] sm:max-w-[560px] md:max-w-[640px] lg:max-w-[720px]"
      headerTitle={isEdit ? t("USERS_ROLES_DRAWER_EDIT_ROLE_TITLE") : t("USERS_ROLES_DRAWER_ADD_ROLE_TITLE")}
      headerDescription={
        isEdit ? t("USERS_ROLES_DRAWER_EDIT_ROLE_SUBTITLE") : t("USERS_ROLES_DRAWER_ADD_ROLE_SUBTITLE")
      }
      bodyClassName="space-y-4"
      footerComponent={
        <>
          <Button type="button" variant="outline" onClick={close} disabled={saving}>
            {t("CANCEL")}
          </Button>
          <Button type="button" onClick={() => void handleSubmit()} disabled={saving || !name.trim()}>
            {saving ? t("USERS_ROLES_SAVING") : isEdit ? t("USERS_ROLES_UPDATE_ROLE") : t("USERS_ROLES_SAVE_ROLE")}
          </Button>
        </>
      }
    >
      <div className="space-y-2">
        <Label>{t("USERS_ROLES_FIELD_ROLE_NAME")} *</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("USERS_ROLES_FIELD_ROLE_NAME")} />
      </div>
      <div className="space-y-2">
        <Label>{t("USERS_ROLES_FIELD_DESCRIPTION")}</Label>
        <textarea
          className="flex min-h-[88px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("USERS_ROLES_FIELD_DESCRIPTION")}
        />
      </div>
      <div className="space-y-2">
        <Label>{t("USERS_ROLES_COL_PERMISSIONS")}</Label>
        <PermissionMatrixEditor value={matrix} onChange={setMatrix} />
      </div>
    </ModalWithHeaderFooter>
  );
};
