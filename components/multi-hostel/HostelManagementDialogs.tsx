"use client";

import type { Dispatch, SetStateAction } from "react";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { t } from "@/lib/i18n";
import { ModalWithHeaderFooter } from "@/components/ui/ModalWithHeaderFooter";
import { Radio } from "@/components/ui/radio";
import type { PortfolioHostelCardData } from "@/components/multi-hostel/PortfolioHostelCard";

export type EditHostelFormValues = {
  name: string;
  city: string;
  state: string;
  isActive: boolean;
};

type HostelManagementDialogsProps = {
  editHostel: PortfolioHostelCardData | null;
  deleteHostel: PortfolioHostelCardData | null;
  editForm: EditHostelFormValues;
  setEditForm: Dispatch<SetStateAction<EditHostelFormValues>>;
  onCloseEdit: () => void;
  onCloseDelete: () => void;
  onSubmitEdit: () => void;
  onSubmitDelete: () => void;
};

export function HostelManagementDialogs({
  editHostel,
  deleteHostel,
  editForm,
  setEditForm,
  onCloseEdit,
  onCloseDelete,
  onSubmitEdit,
  onSubmitDelete,
}: HostelManagementDialogsProps) {
  return (
    <>
      <ModalWithHeaderFooter
        open={editHostel != null}
        onOpenChange={(open) => {
          if (!open) onCloseEdit();
        }}
        headerTitle={t("MULTI_HOSTEL_EDIT_TITLE")}
        maxWidth="md"
        footerComponent={
          <>
            <Button variant="outlined" onClick={onCloseEdit}>
              {t("MULTI_CANCEL")}
            </Button>
            <Button variant="contained" onClick={onSubmitEdit} disabled={!editForm.name.trim()}>
              {t("MULTI_HOSTEL_ACTION_SAVE")}
            </Button>
          </>
        }
      >
        <Box sx={{ display: "grid", gap: 2, pt: 0.5 }}>
          <TextField
            label={t("MULTI_HOSTEL_FIELD_NAME")}
            value={editForm.name}
            onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
          />
          <TextField
            label={t("MULTI_HOSTEL_FIELD_CITY")}
            value={editForm.city}
            onChange={(e) => setEditForm((p) => ({ ...p, city: e.target.value }))}
          />
          <TextField
            label={t("MULTI_HOSTEL_FIELD_STATE")}
            value={editForm.state}
            onChange={(e) => setEditForm((p) => ({ ...p, state: e.target.value }))}
          />
          <Stack direction="row" spacing={3}>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Radio
                name="edit-hostel-status"
                value="active"
                checked={editForm.isActive}
                onChange={() => setEditForm((p) => ({ ...p, isActive: true }))}
              />
              {t("USERS_ROLES_STATUS_ACTIVE")}
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Radio
                name="edit-hostel-status"
                value="inactive"
                checked={!editForm.isActive}
                onChange={() => setEditForm((p) => ({ ...p, isActive: false }))}
              />
              {t("USERS_ROLES_STATUS_INACTIVE")}
            </label>
          </Stack>
        </Box>
      </ModalWithHeaderFooter>

      <ModalWithHeaderFooter
        open={deleteHostel != null}
        onOpenChange={(open) => {
          if (!open) onCloseDelete();
        }}
        headerTitle={t("MULTI_HOSTEL_DELETE_TITLE")}
        maxWidth="sm"
        footerComponent={
          <>
            <Button variant="text" onClick={onCloseDelete}>
              {t("MULTI_CANCEL")}
            </Button>
            <Button color="error" variant="contained" onClick={onSubmitDelete}>
              {t("MULTI_HOSTEL_ACTION_DELETE")}
            </Button>
          </>
        }
      >
        <Typography>
          {t("MULTI_HOSTEL_DELETE_CONFIRM")} <strong>{deleteHostel?.name ?? ""}</strong>?
        </Typography>
      </ModalWithHeaderFooter>
    </>
  );
}
