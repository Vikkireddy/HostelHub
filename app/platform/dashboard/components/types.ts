export type HostelRow = {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  createdAt: string;
  adminEmail: string | null;
  adminName: string | null;
  adminMobile: string | null;
  subscriptionStatus: string | null;
  planId: string | null;
  planName: string | null;
  subscriptionExpiresAt: string | null;
  subscriptionTrialEndsAt: string | null;
  subscriptionGracePeriodEndsAt: string | null;
};

export type AccessFilter =
  | "all"
  | "has_access"
  | "trial"
  | "paid"
  | "grace"
  | "lapsed"
  | "payment_failed"
  | "no_subscription";

export type PlanFilter = "all" | "basic" | "pro" | "enterprise";

export type HostelOverviewPayload = {
  hostel: { id: number; name: string; city: string | null; state: string | null };
  metrics: {
    totalRooms: number;
    totalBeds: number;
    occupiedBeds: number;
    availableBeds: number;
    totalStudents: number;
    monthlyRevenue: number;
  };
  period: { month: string; year: number };
};

export type StatsPayload = {
  summary: {
    totalHostels: number;
    adminsWithHostel: number;
    totalStudents: number;
    totalRooms: number;
    hostelsThisMonth: number;
  };
  subscriptionByStatus: Record<string, number>;
  hostels: HostelRow[];
  note?: string;
};

export type SummaryKey = keyof StatsPayload["summary"];
