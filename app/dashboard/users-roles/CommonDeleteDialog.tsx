"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ModalWithHeaderFooter } from "@/components/ui/ModalWithHeaderFooter";
import { t } from "@/lib/i18n";

export type CommonDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description: ReactNode;
  onConfirm: () => void;
  isPending: boolean;
};

export function CommonDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  isPending,
}: CommonDeleteDialogProps) {
  return (
    <ModalWithHeaderFooter
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="md"
      headerTitle={title}
      headerDescription={description}
      isBackdropCloseEnabled={false}
      footerComponent={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            {t("USERS_ROLES_DELETE_USER_CANCEL")}
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending ? t("USERS_ROLES_DELETE_USER_DELETING") : t("USERS_ROLES_DELETE_USER_CONFIRM")}
          </Button>
        </>
      }
    />
  );
}
