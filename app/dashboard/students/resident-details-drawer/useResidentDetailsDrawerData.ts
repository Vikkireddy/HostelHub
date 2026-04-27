"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithHostel } from "@/lib/ApiClient";
import { useAuthStore } from "@/lib/AuthStore";
import { t } from "@/lib/i18n";
import {
  STUDENT_DOC_ALLOWED_MIME,
  STUDENT_DOC_MAX_BYTES,
} from "@/lib/studentDocumentConstants";
import { toast } from "sonner";
import type { Student, StudentDocumentRow } from "../students.types";
import type { PaymentHistoryResponse } from "./residentDetailsDrawerUtils";
import { openDocumentBlob } from "./residentDetailsDrawerUtils";

export const useResidentDetailsDrawerData = (
  open: boolean,
  student: Student | null
) => {
  const queryClient = useQueryClient();
  const hostelId = useAuthStore((s) => s.user?.hostelId ?? null);
  const studentId = student ? Number(student.id) : NaN;

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addLabel, setAddLabel] = useState("");
  const [addFile, setAddFile] = useState<File | null>(null);

  const { data: documents = [], isLoading: docsLoading } = useQuery({
    queryKey: ["student-documents", hostelId, studentId],
    enabled: open && Number.isFinite(studentId) && hostelId != null,
    queryFn: async () => {
      const res = await fetchWithHostel(`/api/students/${studentId}/documents`, hostelId);
      const j = (await res.json()) as { documents?: StudentDocumentRow[]; error?: string };
      if (!res.ok) throw new Error(j.error || t("RESIDENT_DOCS_LOAD_FAILED"));
      const list = Array.isArray(j.documents) ? j.documents : [];
      return list.filter((d) => String(d.category).toLowerCase() !== "agreement");
    },
  });

  const profileDoc = useMemo(
    () => documents.find((d) => d.category === "profile_photo"),
    [documents]
  );

  useEffect(() => {
    if (!open || hostelId == null || !Number.isFinite(studentId) || !profileDoc) {
      setAvatarUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const blob = await openDocumentBlob(hostelId, studentId, profileDoc.id, false);
        if (cancelled) return;
        const nextUrl = URL.createObjectURL(blob);
        setAvatarUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return nextUrl;
        });
      } catch {
        if (!cancelled) {
          setAvatarUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return null;
          });
        }
      }
    })();
    return () => {
      cancelled = true;
      setAvatarUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [open, hostelId, studentId, profileDoc?.id]);

  const { data: paymentData, isLoading: payLoading } = useQuery({
    queryKey: ["payment-history", hostelId, studentId],
    enabled: open && Number.isFinite(studentId) && hostelId != null,
    queryFn: async () => {
      const res = await fetchWithHostel(
        `/api/payments/history?student_id=${studentId}`,
        hostelId
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || t("PAYMENT_HISTORY_LOAD_FAILED"));
      }
      return (await res.json()) as PaymentHistoryResponse;
    },
  });

  const deleteDoc = useMutation({
    mutationFn: async (documentId: number) => {
      const res = await fetchWithHostel(
        `/api/students/${studentId}/documents/${documentId}`,
        hostelId,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error || t("RESIDENT_DOCS_ACTION_FAILED"));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-documents", hostelId, studentId] });
    },
  });

  const uploadDoc = useMutation({
    mutationFn: async (payload: { file: File; category: string; label?: string }) => {
      const fd = new FormData();
      fd.set("file", payload.file);
      fd.set("category", payload.category);
      if (payload.label?.trim()) fd.set("label", payload.label.trim());
      const res = await fetchWithHostel(`/api/students/${studentId}/documents`, hostelId, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error || t("RESIDENT_DOCS_ACTION_FAILED"));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-documents", hostelId, studentId] });
      setAddOpen(false);
      setAddLabel("");
      setAddFile(null);
    },
  });

  const handleViewOrDownload = useCallback(
    async (doc: StudentDocumentRow, download: boolean) => {
      try {
        const blob = await openDocumentBlob(hostelId, studentId, doc.id, download);
        const url = URL.createObjectURL(blob);
        if (download) {
          const a = document.createElement("a");
          a.href = url;
          a.download = doc.file_name || "document";
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 2000);
        } else {
          window.open(url, "_blank", "noopener,noreferrer");
          setTimeout(() => URL.revokeObjectURL(url), 120_000);
        }
      } catch (e) {
        toast.error((e as Error).message);
      }
    },
    [hostelId, studentId]
  );

  const handleAddSubmit = useCallback(() => {
    if (!addFile) {
      toast.error(t("RESIDENT_DOCS_PICK_FILE"));
      return;
    }
    if (addFile.size > STUDENT_DOC_MAX_BYTES) {
      toast.error(t("RESIDENT_DOC_FILE_TOO_LARGE"));
      return;
    }
    const mime = (addFile.type || "").toLowerCase();
    if (mime && !STUDENT_DOC_ALLOWED_MIME.has(mime)) {
      toast.error(t("RESIDENT_DOC_FILE_TYPE_INVALID"));
      return;
    }
    const label = addLabel.trim() || addFile.name || t("RESIDENT_DOCS_ADD_TITLE");
    uploadDoc.mutate(
      { file: addFile, category: "other", label },
      {
        onError: (e) => toast.error((e as Error).message),
      }
    );
  }, [addFile, addLabel, uploadDoc]);

  const handleDeleteDoc = useCallback(
    (doc: StudentDocumentRow) => {
      if (typeof window !== "undefined" && window.confirm(t("RESIDENT_DOCS_DELETE_CONFIRM"))) {
        deleteDoc.mutate(doc.id, {
          onError: (e) => toast.error((e as Error).message),
        });
      }
    },
    [deleteDoc]
  );

  return {
    hostelId,
    studentId,
    avatarUrl,
    documents,
    docsLoading,
    paymentData,
    payLoading,
    deletePending: deleteDoc.isPending,
    uploadPending: uploadDoc.isPending,
    addOpen,
    setAddOpen,
    addLabel,
    setAddLabel,
    addFile,
    setAddFile,
    handleViewOrDownload,
    handleAddSubmit,
    handleDeleteDoc,
  };
};
