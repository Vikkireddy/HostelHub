"use client";

import { Divider } from "@mui/material";
import { TabsContent } from "@/components/ui/tabs";
import { t } from "@/lib/i18n";
import { sqlDateOnlyToYmd } from "@/lib/dateOnly";
import type { Student } from "../students.types";
import { normalizeResidentKind } from "@/lib/residentType.constants";
import { RESIDENT_KIND_LABEL } from "../residentTypeUi";
import { ResidentDetailsInfoRow } from "./ResidentDetailsInfoRow";
import { formatAmount } from "./residentDetailsDrawerUtils";

type ResidentDetailsDrawerOverviewTabProps = { student: Student };

export const ResidentDetailsDrawerOverviewTab = ({ student }: ResidentDetailsDrawerOverviewTabProps) => (
  <TabsContent value="overview" className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto px-3">
    <ResidentDetailsInfoRow
      label={t("RESIDENT_DETAILS_RESIDENT_TYPE_LINE")}
      value={t(RESIDENT_KIND_LABEL[normalizeResidentKind(student.resident_type)])}
    />
    <ResidentDetailsInfoRow
      label={t("RESIDENT_DETAILS_ROOM_BRANCH")}
      value={`${student.room_number ?? "—"}${student.course ? ` — ${student.course}` : ""}`}
    />
    <ResidentDetailsInfoRow
      label={t("RESIDENT_DETAILS_JOINED")}
      value={sqlDateOnlyToYmd(student.join_date) || "—"}
    />
    <ResidentDetailsInfoRow
      label={t("RESIDENT_DETAILS_PLANNED_VACATE")}
      value={sqlDateOnlyToYmd(student.planned_vacate_date) || "—"}
    />
    <ResidentDetailsInfoRow
      label={t("RESIDENT_SECURITY_DEPOSIT_FIELD")}
      value={
        student.security_deposit_amount == null ||
        student.security_deposit_amount === "" ||
        Number(student.security_deposit_amount) === 0
          ? "—"
          : formatAmount(Number(student.security_deposit_amount))
      }
    />
    <ResidentDetailsInfoRow label={t("PHONE")} value={student.phone || "—"} />
    <ResidentDetailsInfoRow label="Email" value={student.email || "—"} />
    <ResidentDetailsInfoRow
      label={t("RESIDENT_DETAILS_ID_PROOF")}
      value={`${student.id_proof_type || "—"} · ${student.id_proof_number || "—"}`}
    />
    <ResidentDetailsInfoRow label={t("RESIDENT_DETAILS_ADDRESS")} value={student.address || "—"} multiline />
    <Divider sx={{ my: 1 }} />
    <ResidentDetailsInfoRow label={t("RESIDENT_DETAILS_PAYMENT_STATUS")} value={student.payment_status ?? "—"} />
    <ResidentDetailsInfoRow label={t("RESIDENT_DETAILS_PENDING_DUES")} value={formatAmount(student.pending_dues)} />
  </TabsContent>
);
