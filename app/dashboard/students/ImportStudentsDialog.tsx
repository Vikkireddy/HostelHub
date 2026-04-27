"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Box } from "@/components/ui/box";
import { ModalWithHeaderFooter } from "@/components/ui/ModalWithHeaderFooter";
import { Upload, Download, FileDown } from "lucide-react";
import { t } from "@/lib/i18n";
import { fetchWithHostel } from "@/lib/ApiClient";
import { csvTextToStudentRows } from "./studentCsv.utils";
import { toast } from "sonner";

const SAMPLE_TEMPLATE_HREF = "/templates/students-import-sample.csv";

export type ImportStudentsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hostelId: number | null;
  onImported: () => void;
};

export const ImportStudentsDialog = ({
  open,
  onOpenChange,
  hostelId,
  onImported,
}: ImportStudentsDialogProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [pendingRows, setPendingRows] = useState<ReturnType<typeof csvTextToStudentRows>["rows"]>([]);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const resetState = () => {
    setFileName(null);
    setParseErrors([]);
    setRowCount(0);
    setPendingRows([]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFile = async (file: File | null) => {
    setParseErrors([]);
    setPendingRows([]);
    setRowCount(0);
    setFileName(null);
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setParseErrors([t("STUDENT_IMPORT_CSV_ONLY")]);
      return;
    }
    setFileName(file.name);
    const text = await file.text();
    const { rows, errors } = csvTextToStudentRows(text);
    if (errors.length > 0) {
      setParseErrors(errors);
      return;
    }
    setPendingRows(rows);
    setRowCount(rows.length);
  };

  const handleImport = async () => {
    if (!hostelId || pendingRows.length === 0) return;
    setImporting(true);
    try {
      const res = await fetchWithHostel("/api/students/import", hostelId, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: pendingRows }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || t("STUDENT_IMPORT_FAILED"));
        return;
      }
      const { created, failed, failures } = json as {
        created: number;
        failed: number;
        failures: { line: number; message: string }[];
      };
      if (created > 0) {
        toast.success(t("STUDENT_IMPORT_SUCCESS", { count: created }));
      }
      if (failed > 0) {
        const description = failures
          .slice(0, 6)
          .map((f) => `${t("STUDENT_IMPORT_ROW")} ${f.line}: ${f.message}`)
          .join("\n");
        toast.error(t("STUDENT_IMPORT_SOME_FAILED", { failed }), {
          description: failures.length > 6 ? `${description}\n…` : description || undefined,
        });
      }
      if (created > 0) {
        onImported();
      } else if (failed === 0) {
        toast.message(t("STUDENT_IMPORT_NOTHING"));
      }
      resetState();
      onOpenChange(false);
    } catch {
      toast.error(t("STUDENT_IMPORT_FAILED"));
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadCurrent = async () => {
    if (!hostelId) return;
    setExporting(true);
    try {
      const res = await fetchWithHostel("/api/students/export", hostelId, {
        method: "GET",
        headers: {
          Accept: "text/csv",
        },
      });
      if (!res.ok) {
        let msg = t("STUDENT_EXPORT_FAILED");
        try {
          const json = (await res.json()) as { error?: string };
          msg = json.error || msg;
        } catch {
        }
        toast.error(msg);
        return;
      }
      const fileBytes = await res.arrayBuffer();
      const blob = new Blob([fileBytes], {
        type: "text/csv;charset=utf-8;",
      });
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `students-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
      toast.success(t("STUDENT_EXPORT_SUCCESS"));
    } catch {
      toast.error(t("STUDENT_EXPORT_FAILED"));
    } finally {
      setExporting(false);
    }
  };

  return (
    <ModalWithHeaderFooter
      open={open}
      onOpenChange={(o) => {
        if (!o) resetState();
        onOpenChange(o);
      }}
      maxWidth="lg"
      headerTitle={t("STUDENT_IMPORT_TITLE")}
      headerDescription={t("STUDENT_IMPORT_DESCRIPTION")}
      children={
        <Box className="space-y-4">
          <Box className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" asChild>
              <a href={SAMPLE_TEMPLATE_HREF} download>
                <Download className="mr-2 h-4 w-4" />
                {t("STUDENT_IMPORT_DOWNLOAD_TEMPLATE")}
              </a>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadCurrent}
              disabled={!hostelId || exporting}
            >
              <FileDown className="mr-2 h-4 w-4" />
              {exporting ? t("STUDENT_EXPORT_DOWNLOADING") : t("STUDENT_EXPORT_CURRENT")}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              {t("STUDENT_IMPORT_CHOOSE_FILE")}
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
          </Box>

          {fileName && (
            <Typography variant="caption" className="text-slate-600">
              {t("STUDENT_IMPORT_SELECTED_FILE")}: {fileName}
            </Typography>
          )}

          {parseErrors.length > 0 && (
            <Box className="rounded-md border border-red-200 bg-red-50 p-3">
              {parseErrors.map((err) => (
                <Typography key={err} variant="caption" className="block text-red-800">
                  {err}
                </Typography>
              ))}
            </Box>
          )}

          {rowCount > 0 && parseErrors.length === 0 && (
            <Typography variant="caption" className="text-slate-700">
              {t("STUDENT_IMPORT_READY", { count: rowCount })}
            </Typography>
          )}

          <Typography variant="caption" className="text-muted-foreground">
            {t("STUDENT_IMPORT_HINT")}
          </Typography>
        </Box>
      }
      footerComponent={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("CANCEL")}
          </Button>
          <Button
            type="button"
            disabled={importing || pendingRows.length === 0 || !hostelId}
            onClick={handleImport}
          >
            {importing ? t("STUDENT_IMPORT_IMPORTING") : t("STUDENT_IMPORT_RUN")}
          </Button>
        </>
      }
    />
  );
};
