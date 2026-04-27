"use client";

import { t } from "@/lib/i18n";
import type { DeleteUserDialogProps } from "./types";
import { CommonDeleteDialog } from "./CommonDeleteDialog";

export function DeleteUserDialog({ open, onOpenChange, user, onConfirm, isPending }: DeleteUserDialogProps) {
  return (
    <CommonDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("USERS_ROLES_DELETE_USER_TITLE")}
      description={t("USERS_ROLES_DELETE_USER_DESCRIPTION", {
        name: user?.name ?? "",
        email: user?.email ?? "",
      })}
      onConfirm={onConfirm}
      isPending={isPending}
    />
  );
}
