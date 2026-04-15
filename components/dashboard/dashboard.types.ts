import type { LucideIcon } from "lucide-react";

type MonthBreakdownItem = {
  month: string;
  year: number;
  amount: number;
  status: string;
};

type PendingBillProps = {
  id: number;
  student_id: number;
  student_name: string;
  phone: string;
  room_number: string;
  amount: number;
  month: string;
  year: number;
  status: string;
  days_left?: string | null;
  monthBreakdown?: MonthBreakdownItem[];
};

type StudentProps = {
  id: string | number;
  name: string;
  room: string;
  course: string;
  joinDate: string;
  phone: string;
};

type PlannedVacateItemProps = {
  id: string | number;
  studentName: string;
  room: string;
  /** ISO date string YYYY-MM-DD */
  plannedVacateDate: string;
};

type PaymentProps = {
  id: string | number;
  student: string;
  month: string;
  amount: number;
  status: string;
  days_left?: string | null;
};

type RevenueDataProps = {
  month: string;
  revenue: number;
};

type RoomDistributionDataProps = {
  name: string;
  value: number;
  color: string;
};

type DashboardStatsSummaryProps = {
  totalStudents: number;
  availableRooms: number;
  occupiedRooms: number;
  maintenanceRooms: number;
  pendingBills: number;
  pendingBillsAmount: number;
  totalExpensesThisMonth?: number;
  monthlyRevenueThisMonth?: number;
  profitThisMonth?: number;
  /** Difference in students added: current month - last month */
  studentsAddedDiff?: number;
};

type IncomeVsExpensesDataPoint = {
  month: string;
  income: number;
  expenses: number;
  profit: number;
};

type StudentCapacityProps = {
  max: number;
  current: number;
  remaining: number;
};

type DashboardStatsProps = {
  students: StudentProps[];
  payments: PaymentProps[];
  revenue: RevenueDataProps[];
  roomDistribution: RoomDistributionDataProps[];
  incomeVsExpenses?: IncomeVsExpensesDataPoint[];
  stats: DashboardStatsSummaryProps;
  pendingBillsList?: PendingBillProps[];
  /** Present students with a planned vacate date on or after today */
  plannedVacates?: PlannedVacateItemProps[];
  planCapabilities?: { advancedAnalytics: boolean };
  /** Present when the plan has a student cap (Basic / Pro) */
  studentCapacity?: StudentCapacityProps | null;
};

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: React.ReactNode;
  icon: LucideIcon;
  iconBgClass: string;
  iconColorClass: string;
  action?: React.ReactNode;
};

type StatsGridProps = {
  stats: DashboardStatsSummaryProps;
  pendingBillsList?: PendingBillProps[];
  /** When false, hides admin expenses / profit card (Basic plan) */
  showExpenseMetrics?: boolean;
};

type PendingBillsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingBillsList: PendingBillProps[];
  totalDue: number;
};

type RevenueChartProps = {
  revenue: RevenueDataProps[];
};

type RoomDistributionChartProps = {
  roomDistribution: RoomDistributionDataProps[];
};

type PaymentItemProps = {
  payment: PaymentProps;
};

type RecentPaymentsProps = {
  payments: PaymentProps[];
};

type PlannedVacateRowProps = {
  item: PlannedVacateItemProps;
};

type PlannedVacatesCardProps = {
  items: PlannedVacateItemProps[];
};

type StudentsOverviewProps = {
  students: StudentProps[];
  headerAction?: React.ReactNode;
};

export type {
  PendingBillProps,
  StudentProps,
  PaymentProps,
  PaymentItemProps,
  RevenueDataProps,
  RoomDistributionDataProps,
  IncomeVsExpensesDataPoint,
  DashboardStatsSummaryProps,
  DashboardStatsProps,
  StatCardProps,
  StatsGridProps,
  PendingBillsModalProps,
  RevenueChartProps,
  RoomDistributionChartProps,
  RecentPaymentsProps,
  PlannedVacateItemProps,
  PlannedVacateRowProps,
  PlannedVacatesCardProps,
  StudentsOverviewProps,
  StudentCapacityProps,
};
