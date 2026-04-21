"use client";

import { Box, Chip, Typography } from "@mui/material";
import { FileText } from "lucide-react";
import { TabsContent } from "@/components/ui/tabs";
import { t } from "@/lib/i18n";
import type { PaymentHistoryResponse } from "./residentDetailsDrawerUtils";
import { formatAmount, paymentRefLabel, toDateTime } from "./residentDetailsDrawerUtils";

type ResidentDetailsDrawerPaymentsTabProps = {
  paymentData: PaymentHistoryResponse | undefined;
  payLoading: boolean;
};

export const ResidentDetailsDrawerPaymentsTab = ({
  paymentData,
  payLoading,
}: ResidentDetailsDrawerPaymentsTabProps) => (
  <TabsContent value="payments" className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
    {payLoading && (
      <Typography variant="body2" sx={{ color: "rgb(100 116 139)" }}>
        {t("PAYMENT_HISTORY_LOADING")}
      </Typography>
    )}
    {!payLoading && paymentData && (
      <>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1.5,
            p: 1.5,
            borderRadius: 2,
            bgcolor: "rgb(248 250 252)",
            border: "1px solid rgb(226 232 240)",
          }}
        >
          <Typography variant="body2" sx={{ color: "rgb(51 65 85)" }}>
            {t("PAYMENT_HISTORY_TOTAL_COLLECTED")}:{" "}
            <Box component="span" sx={{ fontWeight: 700 }}>
              {formatAmount(paymentData.total_paid)}
            </Box>
          </Typography>
          <Typography variant="body2" sx={{ color: "rgb(51 65 85)" }}>
            {t("PAYMENT_HISTORY_PENDING")}:{" "}
            <Box component="span" sx={{ fontWeight: 700, color: "rgb(180 83 9)" }}>
              {formatAmount(paymentData.pending_due)}
            </Box>
          </Typography>
        </Box>
        <Box sx={{ pr: 0.5 }}>
          {(paymentData.history ?? []).map((item) => (
            <Box key={item.id} sx={{ py: 1.25, borderBottom: "1px solid rgb(226 232 240)" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box>
                  <Typography sx={{ fontWeight: 700, color: "rgb(22 163 74)", fontSize: "1.25rem" }}>
                    {formatAmount(item.amount)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgb(71 85 105)", mt: 0.25 }}>
                    {toDateTime(item.recorded_at)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgb(100 116 139)", mt: 0.5, display: "flex", gap: 0.5 }}>
                    <FileText size={14} />
                    {item.note ?? t("PAYMENT_HISTORY_RECORDED")}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgb(71 85 105)", mt: 0.5 }}>
                    <Box component="span" sx={{ fontWeight: 600, color: "rgb(100 116 139)" }}>
                      {t("PAYMENT_HISTORY_BILL_UTR")}:{" "}
                    </Box>
                    {paymentRefLabel(item)}
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
                    bgcolor: item.status === "partial" ? "rgb(254 243 199)" : "rgb(220 252 231)",
                    color: item.status === "partial" ? "rgb(180 83 9)" : "rgb(22 101 52)",
                    fontWeight: 600,
                  }}
                />
              </Box>
            </Box>
          ))}
          {(paymentData.history?.length ?? 0) === 0 && (
            <Typography variant="body2" sx={{ color: "rgb(100 116 139)", py: 2 }}>
              {t("PAYMENT_HISTORY_NO_DATA")}
            </Typography>
          )}
        </Box>
      </>
    )}
  </TabsContent>
);
