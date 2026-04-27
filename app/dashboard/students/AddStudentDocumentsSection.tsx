"use client";

import { useCallback, useRef, useState } from "react";
import { Camera, FileUp } from "lucide-react";
import { Box } from "@/components/ui/box";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { STUDENT_DOC_ALLOWED_MIME, STUDENT_DOC_MAX_BYTES } from "@/lib/studentDocumentConstants";
import type { ResidentInitialDocuments } from "./students.types";

function validateFile(file: File): string | null {
  if (file.size > STUDENT_DOC_MAX_BYTES) {
    return t("RESIDENT_DOC_FILE_TOO_LARGE");
  }
  const mime = (file.type || "").toLowerCase();
  if (mime && !STUDENT_DOC_ALLOWED_MIME.has(mime)) {
    return t("RESIDENT_DOC_FILE_TYPE_INVALID");
  }
  return null;
}

type Slot = "profilePhoto" | "idProofFile";

export function AddStudentDocumentsSection({
  documents,
  onDocumentsChange,
}: {
  documents: ResidentInitialDocuments;
  onDocumentsChange: (next: ResidentInitialDocuments) => void;
}) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const idInputRef = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [idError, setIdError] = useState<string | null>(null);

  const setSlot = useCallback(
    (slot: Slot, file: File | null) => {
      onDocumentsChange({ ...documents, [slot]: file });
    },
    [documents, onDocumentsChange]
  );

  const onPick = (slot: Slot, fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;
    const err = validateFile(file);
    if (slot === "profilePhoto") {
      setPhotoError(err);
      if (err) return;
      setSlot("profilePhoto", file);
    } else {
      setIdError(err);
      if (err) return;
      setSlot("idProofFile", file);
    }
  };

  const dropHandlers = (slot: Slot) => ({
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onPick(slot, e.dataTransfer.files);
    },
  });

  return (
    <Box className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
      <Typography as="div" className="text-base font-semibold text-slate-900">
        {t("RESIDENT_DOC_SECTION_TITLE")}
      </Typography>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              onPick("profilePhoto", e.target.files);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            className={cn(
              "flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-white px-3 py-8 text-center text-sm text-slate-600 transition hover:border-slate-400 hover:bg-slate-50"
            )}
            {...dropHandlers("profilePhoto")}
            onClick={() => photoInputRef.current?.click()}
          >
            <Camera className="h-8 w-8 text-slate-400" />
            <span className="font-medium text-slate-800">{t("RESIDENT_DOC_UPLOAD_PHOTO")}</span>
            <span className="text-xs text-slate-500">{t("RESIDENT_DOC_PHOTO_HINT")}</span>
          </button>
          {photoError && (
            <Typography variant="error" className="mt-1 text-xs">
              {photoError}
            </Typography>
          )}
          {documents.profilePhoto && (
            <Typography variant="muted" className="mt-1 truncate text-xs">
              {documents.profilePhoto.name}
            </Typography>
          )}
        </div>
        <div>
          <input
            ref={idInputRef}
            type="file"
            accept=".pdf,image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={(e) => {
              onPick("idProofFile", e.target.files);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            className={cn(
              "flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-white px-3 py-8 text-center text-sm text-slate-600 transition hover:border-slate-400 hover:bg-slate-50"
            )}
            {...dropHandlers("idProofFile")}
            onClick={() => idInputRef.current?.click()}
          >
            <FileUp className="h-8 w-8 text-slate-400" />
            <span className="font-medium text-slate-800">{t("RESIDENT_DOC_UPLOAD_ID")}</span>
            <span className="text-xs text-slate-500">{t("RESIDENT_DOC_ID_HINT")}</span>
          </button>
          {idError && (
            <Typography variant="error" className="mt-1 text-xs">
              {idError}
            </Typography>
          )}
          {documents.idProofFile && (
            <Typography variant="muted" className="mt-1 truncate text-xs">
              {documents.idProofFile.name}
            </Typography>
          )}
        </div>
      </div>
      <Typography variant="muted" className="text-xs leading-relaxed text-slate-500">
        {t("RESIDENT_DOC_MODAL_FOOTNOTE")}
      </Typography>
    </Box>
  );
}
