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
  error?: Error | null;
};

export type { 
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