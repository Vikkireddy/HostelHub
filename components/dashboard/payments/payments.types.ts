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
  paymentIds?: (string | number)[];
  totalBalance?: number;
  monthBreakdown?: Array<{ month: string; year: number; amount: number; status: string }>;
};

export type { 
    PaymentStatusFilterProps,
    PaymentProps,
    MonthBreakdownItemProps,
    GroupedUnpaidProps,
    StudentWithDuesProps,
    RecordPaymentFormProps, 
    PaymentStatsProps, 
    PaymentTableRowProps 
  };