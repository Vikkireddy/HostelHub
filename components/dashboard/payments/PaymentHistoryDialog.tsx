"use client";

import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Divider,
  Chip,
  Typography,
} from "@mui/material";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, FileText, X } from "lucide-react";
import { useAuthStore } from "@/lib/AuthStore";
import { fetchWithHostel } from "@/lib/ApiClient";
import type { PaymentHistoryItemProps } from "@/components/dashboard/payments/payments.types";
import { formatBillOrUtrLabel } from "@/components/dashboard/payments/payments.constants";
import { t } from "@/lib/i18n";

interface PaymentHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: number | null;
  studentName?: string;
}

type PaymentHistoryResponse = {
  student_id: number;
  student_name: string;
  room_rent: number;
  total_paid: number;
  pending_due: number;
  last_payment_at: string | null;
  history: PaymentHistoryItemProps[];
};

function formatAmount(v: number | null | undefined) {
  return `₹${Number(v ?? 0).toLocaleString()}`;
}

function toDateTime(v?: string | null) {
  if (!v) return "-";
  return new Date(v).toLocaleString();
}

function historyRefLabel(item: PaymentHistoryItemProps): string {
  return formatBillOrUtrLabel(item.payment_mode, item.payment_reference) ?? t("PAYMENT_HISTORY_NO_REF");
}

function getInitials(name: string) {
  return (name || "S")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function PaymentHistoryDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
}: PaymentHistoryDialogProps) {
  const hostelId = useAuthStore((s) => s.user?.hostelId ?? null);
  const pdfReceiptRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, error } = useQuery<PaymentHistoryResponse>({
    queryKey: ["payment-history", hostelId, studentId],
    enabled: open && !!studentId,
    queryFn: async () => {
      const res = await fetchWithHostel(
        `/api/payments/history?student_id=${studentId}`,
        hostelId
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || t("PAYMENT_HISTORY_LOAD_FAILED"));
      }
      return res.json();
    },
  });

  const exportReceipt = async () => {
    if (!data || !pdfReceiptRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");
    const canvas = await html2canvas(pdfReceiptRef.current, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
    });

    const imageData = canvas.toDataURL("image/png");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = doc.internal.pageSize.getHeight();
    const margin = 24;
    const usableWidth = pdfWidth - margin * 2;
    const renderedHeight = (canvas.height * usableWidth) / canvas.width;

    if (renderedHeight <= pdfHeight - margin * 2) {
      doc.addImage(imageData, "PNG", margin, margin, usableWidth, renderedHeight);
    } else {
      let remainingHeight = renderedHeight;
      let sourceY = 0;
      const pageContentHeight = pdfHeight - margin * 2;
      const pageCanvasHeight = (pageContentHeight * canvas.width) / usableWidth;

      while (remainingHeight > 0) {
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = Math.min(pageCanvasHeight, canvas.height - sourceY);
        const ctx = pageCanvas.getContext("2d");
        if (!ctx) break;
        ctx.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          pageCanvas.height,
          0,
          0,
          canvas.width,
          pageCanvas.height
        );
        const pageData = pageCanvas.toDataURL("image/png");
        const pageHeight = (pageCanvas.height * usableWidth) / pageCanvas.width;
        doc.addImage(pageData, "PNG", margin, margin, usableWidth, pageHeight);
        remainingHeight -= pageHeight;
        sourceY += pageCanvas.height;
        if (remainingHeight > 0) doc.addPage();
      }
    }
    const filename = `${data.student_name.replace(/\s+/g, "-").toLowerCase()}-payment-history.pdf`;
    doc.save(filename);
  };

  return (
    <Dialog
      open={open}
      onClose={() => onOpenChange(false)}
      maxWidth="md"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 3,
          border: "1px solid rgb(226 232 240)",
        },
      }}
    >
      <DialogContent sx={{ px: 3, pt: 2.5, pb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar sx={{ bgcolor: "rgb(226 232 240)", color: "rgb(30 41 59)" }}>
              {getInitials(studentName || data?.student_name || t("PAYMENT_HISTORY_STUDENT_FALLBACK"))}
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: "1.8rem", fontWeight: 700, lineHeight: 1 }}>
                {studentName || data?.student_name || t("PAYMENT_HISTORY_STUDENT_FALLBACK")}
              </Typography>
              <Typography variant="body2" sx={{ color: "rgb(100 116 139)" }}>
                {t("PAYMENT_HISTORY")}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => onOpenChange(false)} aria-label={t("PAYMENT_HISTORY_CLOSE")}>
            <X size={20} />
          </IconButton>
        </Box>

        {isLoading && <Typography variant="body2">{t("PAYMENT_HISTORY_LOADING")}</Typography>}
        {error && (
          <Typography variant="body2" sx={{ color: "rgb(185 28 28)" }}>
            {(error as Error).message}
          </Typography>
        )}

        {!isLoading && !error && (
          <>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
                px: 2,
                py: 1.5,
                borderRadius: 2,
                backgroundColor: "rgb(248 250 252)",
                border: "1px solid rgb(226 232 240)",
              }}
            >
              <Box>
                <Typography sx={{ color: "rgb(51 65 85)", fontWeight: 500 }}>
                  {t("PAYMENT_HISTORY_LAST_PAYMENT")}:{" "}
                  <Box component="span" sx={{ fontWeight: 700, color: "rgb(30 41 59)" }}>
                    {data?.history?.[0] ? formatAmount(data.history[0].amount) : "-"}
                  </Box>{" "}
                  - {toDateTime(data?.last_payment_at)}
                </Typography>
                <Typography sx={{ color: "rgb(51 65 85)", mt: 0.75 }}>
                  {t("PAYMENT_HISTORY_TOTAL_COLLECTED")}:{" "}
                  <Box component="span" sx={{ fontWeight: 700, color: "rgb(30 41 59)" }}>
                    {formatAmount(data?.total_paid)}
                  </Box>
                </Typography>
              </Box>
              <Box sx={{ borderLeft: "1px solid rgb(226 232 240)", pl: 2 }}>
                <Typography sx={{ color: "rgb(51 65 85)", fontWeight: 600 }}>
                  {t("PAYMENT_HISTORY_TOTAL")}{" "}
                  <Chip
                    label={t("PAYMENT_HISTORY_CURRENT_DUE")}
                    size="small"
                    sx={{
                      height: 20,
                      ml: 0.5,
                      bgcolor: "rgb(255 247 237)",
                      color: "rgb(180 83 9)",
                      fontWeight: 700,
                      fontSize: "0.65rem",
                    }}
                  />
                </Typography>
                <Typography sx={{ mt: 0.75, color: "rgb(51 65 85)" }}>
                  {t("PAYMENT_HISTORY_PENDING")}:{" "}
                  <Box component="span" sx={{ fontWeight: 700, color: "rgb(180 83 9)" }}>
                    {formatAmount(data?.pending_due)}
                  </Box>
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 2, maxHeight: 320, overflowY: "auto", pr: 0.5 }}>
              {(data?.history ?? []).map((item) => (
                <Box key={item.id} sx={{ py: 1.25, position: "relative", pl: 4 }}>
                  <CheckCircle2
                    size={18}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 16,
                      color: "rgb(34 197 94)",
                    }}
                  />
                  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: "rgb(22 163 74)", fontSize: "1.75rem", lineHeight: 1.1 }}>
                        {formatAmount(item.amount)}
                      </Typography>
                      <Typography sx={{ color: "rgb(71 85 105)", mt: 0.3 }}>
                        {toDateTime(item.recorded_at)}
                      </Typography>
                      <Typography sx={{ color: "rgb(100 116 139)", mt: 0.6, display: "flex", alignItems: "center", gap: 0.6 }}>
                        <FileText size={14} />
                        {item.note ?? t("PAYMENT_HISTORY_RECORDED")}
                      </Typography>
                      <Typography sx={{ color: "rgb(71 85 105)", mt: 0.5, fontSize: "0.8125rem" }}>
                        <Box component="span" sx={{ fontWeight: 600, color: "rgb(100 116 139)" }}>
                          {t("PAYMENT_HISTORY_BILL_UTR")}:{" "}
                        </Box>
                        {historyRefLabel(item)}
                      </Typography>
                    </Box>
                    <Chip
                      label={
                        item.status === "partial"
                          ? t("PAYMENT_HISTORY_STATUS_PARTIAL")
                          : t("PAYMENT_HISTORY_STATUS_PAID")
                      }
                      size="small"
                      sx={{
                        bgcolor:
                          item.status === "partial"
                            ? "rgb(254 243 199)"
                            : "rgb(220 252 231)",
                        color:
                          item.status === "partial"
                            ? "rgb(180 83 9)"
                            : "rgb(22 101 52)",
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                  <Divider sx={{ mt: 1.25 }} />
                </Box>
              ))}

              {(data?.history?.length ?? 0) === 0 && (
                <Typography variant="body2" sx={{ color: "rgb(100 116 139)", py: 2 }}>
                  {t("PAYMENT_HISTORY_NO_DATA")}
                </Typography>
              )}
            </Box>

            <Box sx={{ mt: 1.5, display: "flex", justifyContent: "space-between" }}>
              <Typography variant="h6" sx={{ color: "rgb(30 41 59)", fontWeight: 600 }}>
                {t("PAYMENT_HISTORY_TOTAL_COLLECTED")}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "rgb(15 23 42)" }}>
                {formatAmount(data?.total_paid)}
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, pt: 0.5 }}>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          {t("PAYMENT_HISTORY_CLOSE")}
        </Button>
        <Button onClick={exportReceipt} disabled={!data || (data.history?.length ?? 0) === 0}>
          <Download size={16} />
          <Box component="span" sx={{ ml: 0.75 }}>
            {t("PAYMENT_HISTORY_DOWNLOAD_RECEIPT")}
          </Box>
        </Button>
      </DialogActions>

      {data && (
        <Box
          ref={pdfReceiptRef}
          sx={{
            position: "fixed",
            left: "-99999px",
            top: 0,
            width: 900,
            bgcolor: "#fff",
            color: "rgb(30 41 59)",
            p: 4,
            border: "1px solid rgb(226 232 240)",
            borderRadius: 2,
            fontFamily: "Inter, Arial, sans-serif",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "999px",
                bgcolor: "rgb(226 232 240)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
              }}
            >
              {getInitials(data.student_name)}
            </Box>
            <Box>
              <Box sx={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{data.student_name}</Box>
              <Box sx={{ fontSize: 16, color: "rgb(100 116 139)" }}>{t("PAYMENT_HISTORY")}</Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 2,
              px: 2,
              py: 1.5,
              borderRadius: 2,
              backgroundColor: "rgb(248 250 252)",
              border: "1px solid rgb(226 232 240)",
              mb: 2,
            }}
          >
            <Box>
              <Box sx={{ color: "rgb(51 65 85)", fontWeight: 500 }}>
                {t("PAYMENT_HISTORY_LAST_PAYMENT")}:{" "}
                <b>{data.history?.[0] ? formatAmount(data.history[0].amount) : "-"}</b> -{" "}
                {toDateTime(data.last_payment_at)}
              </Box>
              <Box sx={{ color: "rgb(51 65 85)", mt: 0.75 }}>
                {t("PAYMENT_HISTORY_TOTAL_COLLECTED")}: <b>{formatAmount(data.total_paid)}</b>
              </Box>
            </Box>
            <Box sx={{ borderLeft: "1px solid rgb(226 232 240)", pl: 2 }}>
              <Box sx={{ color: "rgb(51 65 85)", fontWeight: 600 }}>
                {t("PAYMENT_HISTORY_TOTAL")}{" "}
                <span style={{ color: "rgb(180 83 9)" }}>{t("PAYMENT_HISTORY_CURRENT_DUE")}</span>
              </Box>
              <Box sx={{ mt: 0.75, color: "rgb(51 65 85)" }}>
                {t("PAYMENT_HISTORY_PENDING")}:{" "}
                <b style={{ color: "rgb(180 83 9)" }}>{formatAmount(data.pending_due)}</b>
              </Box>
            </Box>
          </Box>

          <Box>
            {data.history.map((item) => (
              <Box key={item.id} sx={{ py: 1.25, borderBottom: "1px solid rgb(226 232 240)" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Box sx={{ fontSize: 30, fontWeight: 700, color: "rgb(22 163 74)", lineHeight: 1.1 }}>
                      {formatAmount(item.amount)}
                    </Box>
                    <Box sx={{ color: "rgb(71 85 105)", mt: 0.3 }}>{toDateTime(item.recorded_at)}</Box>
                    <Box sx={{ color: "rgb(100 116 139)", mt: 0.6 }}>
                      {item.note ?? t("PAYMENT_HISTORY_RECORDED")}
                    </Box>
                    <Box sx={{ color: "rgb(71 85 105)", mt: 0.45, fontSize: 13 }}>
                      <b style={{ color: "rgb(100 116 139)" }}>{t("PAYMENT_HISTORY_BILL_UTR")}:</b>{" "}
                      {historyRefLabel(item)}
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 999,
                      bgcolor: item.status === "partial" ? "rgb(254 243 199)" : "rgb(220 252 231)",
                      color: item.status === "partial" ? "rgb(180 83 9)" : "rgb(22 101 52)",
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                  >
                    {item.status === "partial"
                      ? t("PAYMENT_HISTORY_STATUS_PARTIAL")
                      : t("PAYMENT_HISTORY_STATUS_PAID")}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>

          <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box sx={{ fontSize: 30, fontWeight: 700 }}>{t("PAYMENT_HISTORY_TOTAL_COLLECTED")}:</Box>
            <Box sx={{ fontSize: 34, fontWeight: 700 }}>{formatAmount(data.total_paid)}</Box>
          </Box>
        </Box>
      )}
    </Dialog>
  );
}
