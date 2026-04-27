"use client";

import { t } from "@/lib/i18n";
import type { DeleteRoleDialogProps } from "./types";
import { CommonDeleteDialog } from "./CommonDeleteDialog";

export function DeleteRoleDialog({ open, onOpenChange, role, onConfirm, isPending }: DeleteRoleDialogProps) {
  return (
    <CommonDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("USERS_ROLES_DELETE_ROLE_TITLE")}
      description={t("USERS_ROLES_DELETE_ROLE_DESCRIPTION", {
        name: role?.name ?? "",
      })}
      onConfirm={onConfirm}
      isPending={isPending}
    />
  );
}
