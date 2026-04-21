import { LucideIcon } from "lucide-react";
import type { FormEvent } from "react";

type PaymentStatusFilterProps = "all" | "pending" | "overdue" | "paid";

type PaymentProps = {
  id: string | number;
  student_id?: number;
  student_name: string;
  month: string;
  year: number;
  amount: number;
  amount_due?: number;
  amount_paid?: number;
  balance?: number;
  status: string;
  days_left?: string | null;
  paid_at?: string | null;
  last_payment_at?: string | null;
  /** Matched to the payment_transaction that settled this bill (same window as paid_at). */
  bill_payment_mode?: string | null;
  bill_payment_reference?: string | null;
};

type MonthBreakdownItemProps = {
  id: string | number;
  month: string;
  year: number;
  amount: number;
  status: string;
};

 type GroupedUnpaidProps = {
  student_id: number;
  student_name: string;
  totalBalance: number;
  paymentIds: (string | number)[];
  days_left: string | null;
  monthRange: string;
  hasOverdue: boolean;
  monthBreakdown: MonthBreakdownItemProps[];
  last_payment_at?: string | null;
  /** Latest bill/UTR from partial payments (same source as payment history). */
  billOrUtrLabel?: string | null;
};

 type StudentWithDuesProps = {
  id: string | number;
  name: string;
  room_rent: number;
  pending_dues: number;
};

 type RecordPaymentFormProps = {
  student_id: string;
  amount: string;
  month: string;
  year: string;
  payment_mode: "cash" | "online";
  payment_reference: string;
};

type PaymentStatsProps = {
  collected: number;
  pending: number;
  overdueCount: number;
  thisMonth: number;
};

type PaymentTableRowProps = {
  id: string | number;
  type: "unpaid" | "paid";
  studentId: number;
  studentName: string;
  period: string;
  dueInfo: string;
  amount: number;
  amountLabel: string;
  status: "pending" | "overdue" | "paid";
  lastPaymentAt?: string | null;
  /** Display e.g. "Bill · 123" / "UTR · …"; empty when unknown or not yet paid with proof. */
  billOrUtrLabel?: string | null;
  paymentIds?: (string | number)[];
  totalBalance?: number;
  monthBreakdown?: Array<{ month: string; year: number; amount: number; status: string }>;
};

type PaymentHistoryItemProps = {
  id: string | number;
  amount: number;
  recorded_at: string;
  status?: "paid" | "partial";
  period?: string | null;
  method?: string | null;
  note?: string | null;
  /** From payment_transactions when migrated (cash / online + bill or UTR). */
  payment_mode?: string | null;
  payment_reference?: string | null;
};

export type PaymentHistoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: number | null;
  studentName?: string;
};

export type PaymentBreakdownDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: GroupedUnpaidProps | null;
  onPayNow: (group: GroupedUnpaidProps) => void;
};

export type PaymentFiltersBarProps = {
  statusFilter: PaymentStatusFilterProps;
  onStatusFilterChange: (value: PaymentStatusFilterProps) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onRecordPayment: () => void;
  /** When false, "Record Payment" is disabled (requires `payments` add). */
  canRecordPayment?: boolean;
};

export type PaymentsTableProps = {
  rows: PaymentTableRowProps[];
  onMarkPaid: (studentId: number) => void;
  onViewDetails: (row: PaymentTableRowProps) => void;
  onOpenHistory: (row: PaymentTableRowProps) => void;
  onEditPayment?: (row: PaymentTableRowProps) => void;
  onSendReminder?: (row: PaymentTableRowProps) => void;
  onDelete?: (row: PaymentTableRowProps) => void;
  isMarkingPaid?: boolean;
  markingPaidStudentId?: number;
  /** When false, row "Mark as paid" is disabled (`payments` edit). */
  canMarkPaid?: boolean;
  /** When false, history icon is disabled (`payments` view). */
  canOpenPaymentHistory?: boolean;
};

  type PaymentTableRowComponentProps = {
  row: PaymentTableRowProps;
  onMarkPaid: (studentId: number) => void;
  onViewDetails: (row: PaymentTableRowProps) => void;
  onOpenHistory: (row: PaymentTableRowProps) => void;
  onEditPayment?: (row: PaymentTableRowProps) => void;
  onSendReminder?: (row: PaymentTableRowProps) => void;
  onDelete?: (row: PaymentTableRowProps) => void;
  isMarkingPaid?: boolean;
  markingPaidStudentId?: number;
  canMarkPaid?: boolean;
  canOpenPaymentHistory?: boolean;
};

export type PaymentRowActionsProps = {
  row: PaymentTableRowProps;
  onMarkPaid: (studentId: number) => void;
  onViewDetails: (row: PaymentTableRowProps) => void;
  onEditPayment?: (row: PaymentTableRowProps) => void;
  onSendReminder?: (row: PaymentTableRowProps) => void;
  onDelete?: (row: PaymentTableRowProps) => void;
  isMarkingPaid?: boolean;
  markingPaidStudentId?: number;
  canMarkPaid?: boolean;
};

export type PaymentStatsGridProps = {
  stats: PaymentStatsProps;
  onViewCollected?: () => void;
  onViewPending?: () => void;
  onViewOverdue?: () => void;
};

export type RecordPaymentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: RecordPaymentFormProps;
  onFormChange: (form: RecordPaymentFormProps) => void;
  onSubmit: (e: FormEvent) => void;
  studentsWithDues: StudentWithDuesProps[];
  isPending: boolean;
  submitError?: string | null;
  /** When false, submit is disabled (`payments` add). */
  canSubmit?: boolean;
};

 type ActionItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  disabled?: boolean;
  hidden?: boolean;
  title?: string;
  sx?: Record<string, string | number>;
};

export type { 
  ActionItem,
    PaymentStatusFilterProps,
    PaymentProps,
    MonthBreakdownItemProps,
    GroupedUnpaidProps,
    StudentWithDuesProps,
    RecordPaymentFormProps, 
    PaymentStatsProps, 
    PaymentTableRowProps,
    PaymentHistoryItemProps,
    PaymentTableRowComponentProps,
  };