"use client";

import { Box, Typography } from "@mui/material";
import { Download, Eye, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { t } from "@/lib/i18n";
import type { StudentDocumentRow } from "../students.types";
import { formatDocDate } from "./residentDetailsDrawerUtils";

type ResidentDetailsDrawerDocumentsTabProps = {
  documents: StudentDocumentRow[];
  docsLoading: boolean;
  deletePending: boolean;
  onAddClick: () => void;
  onViewOrDownload: (doc: StudentDocumentRow, download: boolean) => void;
  onDeleteDoc: (doc: StudentDocumentRow) => void;
  canViewDocuments?: boolean;
  canAddDocuments?: boolean;
  canDeleteDocuments?: boolean;
};

export const ResidentDetailsDrawerDocumentsTab = ({
  documents,
  docsLoading,
  deletePending,
  onAddClick,
  onViewOrDownload,
  onDeleteDoc,
  canViewDocuments = true,
  canAddDocuments = true,
  canDeleteDocuments = true,
}: ResidentDetailsDrawerDocumentsTabProps) => (
  <TabsContent value="documents" className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto px-3">
    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={!canAddDocuments}
        title={!canAddDocuments ? "You don't have permission to add documents" : undefined}
        onClick={onAddClick}
      >
        <Plus className="mr-1.5 h-4 w-4" />
        {t("RESIDENT_DOCS_ADD")}
      </Button>
    </Box>
    {docsLoading && (
      <Typography variant="body2" sx={{ color: "rgb(100 116 139)" }}>
        {t("PAYMENT_HISTORY_LOADING")}
      </Typography>
    )}
    {!docsLoading && documents.length === 0 && (
      <Typography variant="body2" sx={{ color: "rgb(100 116 139)", py: 2 }}>
        {t("RESIDENT_DOCS_EMPTY")}
      </Typography>
    )}
    {!docsLoading &&
      documents.map((doc) => (
        <Box
          key={doc.id}
          sx={{
            p: 1.5,
            borderRadius: 2,
            border: "1px solid rgb(226 232 240)",
            bgcolor: "rgb(248 250 252)",
          }}
        >
          <Typography sx={{ fontWeight: 600, color: "rgb(30 41 59)" }}>{doc.label}</Typography>
          <Typography variant="caption" sx={{ color: "rgb(100 116 139)", display: "block", mt: 0.25 }}>
            {t("RESIDENT_DOCS_UPDATED")}: {formatDocDate(doc.created_at)}
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8"
              disabled={!canViewDocuments}
              title={!canViewDocuments ? "You don't have permission to view documents" : undefined}
              onClick={() => onViewOrDownload(doc, false)}
            >
              <Eye className="mr-1 h-3.5 w-3.5" />
              {t("RESIDENT_DOCS_VIEW")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8"
              disabled={!canViewDocuments}
              title={!canViewDocuments ? "You don't have permission to download documents" : undefined}
              onClick={() => onViewOrDownload(doc, true)}
            >
              <Download className="mr-1 h-3.5 w-3.5" />
              {t("RESIDENT_DOCS_DOWNLOAD")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 text-red-600 hover:text-red-700"
              disabled={deletePending || !canDeleteDocuments}
              title={!canDeleteDocuments ? "You don't have permission to delete documents" : undefined}
              onClick={() => onDeleteDoc(doc)}
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              {t("RESIDENT_DOCS_DELETE")}
            </Button>
          </Box>
        </Box>
      ))}
  </TabsContent>
);
