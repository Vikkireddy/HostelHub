import { t } from "@/lib/i18n";
import { fetchWithHostel } from "@/lib/ApiClient";
import { formatBillOrUtrLabel } from "@/components/dashboard/payments/payments.constants";

export const initials = (name: string) =>
  (name || "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const formatAmount = (v: number | null | undefined) =>
  `₹${Number(v ?? 0).toLocaleString()}`;

export type PaymentHistoryResponse = {
  student_id: number;
  student_name: string;
  room_rent: number;
  total_paid: number;
  pending_due: number;
  last_payment_at: string | null;
  history: {
    id: string | number;
    amount: number;
    recorded_at: string;
    status?: "paid" | "partial";
    note?: string | null;
    payment_mode?: string | null;
    payment_reference?: string | null;
  }[];
};

export const paymentRefLabel = (item: PaymentHistoryResponse["history"][0]) =>
  formatBillOrUtrLabel(item.payment_mode, item.payment_reference) ?? t("PAYMENT_HISTORY_NO_REF");

export const toDateTime = (v?: string | null) => {
  if (!v) return "-";
  return new Date(v).toLocaleString();
};

export const formatDocDate = (iso: string | null) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso.slice(0, 10) : d.toLocaleDateString();
};

export const openDocumentBlob = async (
  hostelId: number | null,
  studentId: number,
  documentId: number,
  download: boolean
) => {
  const q = download ? "?download=1" : "";
  const res = await fetchWithHostel(
    `/api/students/${studentId}/documents/${documentId}${q}`,
    hostelId
  );
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error((j as { error?: string }).error || t("RESIDENT_DOCS_ACTION_FAILED"));
  }
  return res.blob();
};
