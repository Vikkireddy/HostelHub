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
};

type DashboardStatsProps = {
  students: StudentProps[];
  payments: PaymentProps[];
  revenue: RevenueDataProps[];
  roomDistribution: RoomDistributionDataProps[];
  stats: DashboardStatsSummaryProps;
  pendingBillsList?: PendingBillProps[];
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

type StudentsOverviewProps = {
  students: StudentProps[];
};

export type {
  PendingBillProps,
  StudentProps,
  PaymentProps,
  PaymentItemProps,
  RevenueDataProps,
  RoomDistributionDataProps,
  DashboardStatsSummaryProps,
  DashboardStatsProps,
  StatCardProps,
  StatsGridProps,
  PendingBillsModalProps,
  RevenueChartProps,
  RoomDistributionChartProps,
  RecentPaymentsProps,
  StudentsOverviewProps,
};
