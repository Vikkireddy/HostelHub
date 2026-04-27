"use client";

import { Button } from "@/components/ui/button";
import { ModalWithHeaderFooter } from "@/components/ui/ModalWithHeaderFooter";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n";

type ResidentDetailsDrawerAddDocumentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addLabel: string;
  onAddLabelChange: (value: string) => void;
  addFile: File | null;
  onAddFileChange: (file: File | null) => void;
  onSubmit: () => void;
  uploadPending: boolean;
};

export const ResidentDetailsDrawerAddDocumentDialog = ({
  open,
  onOpenChange,
  addLabel,
  onAddLabelChange,
  addFile,
  onAddFileChange,
  onSubmit,
  uploadPending,
}: ResidentDetailsDrawerAddDocumentDialogProps) => (
  <ModalWithHeaderFooter
    open={open}
    onOpenChange={onOpenChange}
    maxWidth="md"
    headerTitle={t("RESIDENT_DOCS_ADD_TITLE")}
    children={
      <div className="space-y-3 py-2">
        <Input
          placeholder={t("RESIDENT_DOCS_LABEL_PLACEHOLDER")}
          value={addLabel}
          onChange={(e) => onAddLabelChange(e.target.value)}
        />
        <Input
          type="file"
          accept=".pdf,image/jpeg,image/png,image/webp,application/pdf"
          onChange={(e) => onAddFileChange(e.target.files?.[0] ?? null)}
        />
      </div>
    }
    footerComponent={
      <>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          {t("CANCEL")}
        </Button>
        <Button type="button" onClick={onSubmit} disabled={uploadPending}>
          {uploadPending ? t("RESIDENT_DOCS_UPLOADING") : t("RESIDENT_DOCS_ADD")}
        </Button>
      </>
    }
  />
);
