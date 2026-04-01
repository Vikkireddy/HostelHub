"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/AuthStore";
import { fetchWithHostel } from "@/lib/ApiClient";
import type {
  PaymentProps,
  PaymentStatusFilterProps,
  GroupedUnpaidProps,
  PaymentTableRowProps,
  PaymentStatsProps,
  RecordPaymentFormProps,
} from "@/components/dashboard/payments/payments.types";
import { MONTHS, getDefaultMonthYear } from "./payments.constants";

const initialForm: RecordPaymentFormProps = {
  student_id: "",
  amount: "",
  month: getDefaultMonthYear().month,
  year: getDefaultMonthYear().year,
};

function filterBySearch<
  T extends {
    student_name?: string;
    month?: string;
    year?: number;
    amount?: number;
    amount_due?: number;
    amount_paid?: number;
  }
>(items: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (p) =>
      (p.student_name ?? "").toLowerCase().includes(q) ||
      (p.month ?? "").toLowerCase().includes(q) ||
      String(p.year ?? "").includes(q) ||
      String(p.amount ?? "").includes(q) ||
      String(p.amount_due ?? "").includes(q) ||
      String(p.amount_paid ?? "").includes(q)
  );
}

/** Money actually received on a bill row (partial or full). Legacy: only `paid` rows count full `amount`. */
function amountReceivedTowardBill(p: PaymentProps): number {
  const paid = p.amount_paid;
  if (paid != null && !Number.isNaN(Number(paid))) {
    const n = Number(paid);
    if (n > 0) return n;
  }
  if (p.status === "paid") {
    return Number(p.amount_paid ?? p.amount ?? p.amount_due ?? 0);
  }
  return 0;
}

export function usePaymentsData() {
  const queryClient = useQueryClient();
  const hostelId = useAuthStore((s) => s.user?.hostelId ?? null);
  const [modalOpen, setModalOpen] = useState(false);
  const [infoDialogGroup, setInfoDialogGroup] = useState<GroupedUnpaidProps | null>(null);
  const [form, setForm] = useState<RecordPaymentFormProps>(initialForm);
  const [statusFilter, setStatusFilter] = useState<PaymentStatusFilterProps>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: payments = [], isLoading, error } = useQuery<PaymentProps[]>({
    queryKey: ["payments", hostelId],
    queryFn: () =>
      fetchWithHostel("/api/payments", hostelId).then((r) => r.json()),
    enabled: Boolean(hostelId),
  });

  const { data: studentsWithDues = [] } = useQuery({
    queryKey: ["students-with-dues", hostelId],
    queryFn: () =>
      fetchWithHostel("/api/students/with-dues", hostelId).then((r) => r.json()),
    enabled: Boolean(hostelId),
  });

  const bulkMarkPaid = useMutation({
    mutationFn: async (studentId: number) => {
      const res = await fetchWithHostel(
        "/api/payments/bulk-mark-paid",
        hostelId,
        {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to mark payments as paid");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["students-with-dues"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });

  const recordPayment = useMutation({
    mutationFn: async (data: RecordPaymentFormProps) => {
      const res = await fetchWithHostel("/api/payments", hostelId, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: Number(data.student_id),
          amount: Number(data.amount),
          month: data.month,
          year: Number(data.year),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to record payment");
      }
      return res.json();
    },
    onSuccess: async (data: { message?: string; amount?: number }) => {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["payments"] }),
        queryClient.refetchQueries({ queryKey: ["students"] }),
        queryClient.refetchQueries({ queryKey: ["dashboard-stats"] }),
      ]);
      setForm({
        ...initialForm,
        student_id: "",
        amount: "",
        month: getDefaultMonthYear().month,
        year: getDefaultMonthYear().year,
      });
      setModalOpen(false);
      const msg = data?.message ?? `Payment of ₹${(data?.amount ?? 0).toLocaleString()} recorded.`;
      toast.success(msg);
    },
  });

  const searchFiltered = useMemo(() => filterBySearch(payments, searchQuery), [payments, searchQuery]);
  const filteredPayments = useMemo(() => {
    let result = searchFiltered;
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }
    return result;
  }, [searchFiltered, statusFilter]);

  const unpaidPayments = filteredPayments.filter(
    (p) => p.status === "pending" || p.status === "overdue"
  );
  const paidPayments = filteredPayments.filter((p) => p.status === "paid");

  const paymentStats = useMemo((): PaymentStatsProps => {
    const now = new Date();
    const currentMonth = MONTHS[now.getMonth()];
    const currentYear = now.getFullYear();

    const collected = payments.reduce((sum, p) => sum + amountReceivedTowardBill(p), 0);

    const pending = payments
      .filter((p) => p.status === "pending")
      .reduce(
        (sum, p) =>
          sum +
          Number(
            p.balance ??
              Math.max(0, (p.amount_due ?? p.amount ?? 0) - (p.amount_paid ?? 0))
          ),
        0
      );

    const overdueCount = payments.filter((p) => p.status === "overdue").length;

    const thisMonth = payments
      .filter((p) => p.month === currentMonth && Number(p.year) === currentYear)
      .reduce((sum, p) => sum + amountReceivedTowardBill(p), 0);

    return { collected, pending, overdueCount, thisMonth };
  }, [payments]);

  const monthLabel = (p: PaymentProps) => `${p.month} ${p.year}`;

  const groupedUnpaid: GroupedUnpaidProps[] = useMemo(() => {
    const result: GroupedUnpaidProps[] = [];
    const byStudent = new Map<number, PaymentProps[]>();
    for (const p of unpaidPayments) {
      const sid = Number(p.student_id ?? 0);
      if (!sid) continue;
      if (!byStudent.has(sid)) byStudent.set(sid, []);
      byStudent.get(sid)!.push(p);
    }
    byStudent.forEach((items, studentId) => {
      const totalBalance = items.reduce(
        (sum, p) => sum + Number(p.balance ?? p.amount_due ?? p.amount ?? 0),
        0
      );
      const sorted = [...items].sort((a, b) => {
        const ya = Number(a.year);
        const yb = Number(b.year);
        if (ya !== yb) return ya - yb;
        const ma = (MONTHS as readonly string[]).indexOf(a.month);
        const mb = (MONTHS as readonly string[]).indexOf(b.month);
        return ma - mb;
      });
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const monthRange =
        first === last
          ? `${first.month} ${first.year}`
          : `${first.month} ${first.year} - ${last.month} ${last.year}`;
      const mostOverdue = items.find((p) => p.status === "overdue") ?? items[0];
      const monthBreakdown = sorted.map((p) => ({
        id: p.id,
        month: p.month,
        year: Number(p.year),
        amount: Number(p.balance ?? p.amount_due ?? p.amount ?? 0),
        status: p.status,
      }));
      result.push({
        student_id: studentId,
        student_name: first.student_name,
        totalBalance,
        paymentIds: items.map((p) => p.id),
        days_left: mostOverdue.days_left ?? null,
        monthRange,
        hasOverdue: items.some((p) => p.status === "overdue"),
        monthBreakdown,
        last_payment_at: first.last_payment_at ?? null,
      });
    });
    return result;
  }, [unpaidPayments]);

  const tableRows: PaymentTableRowProps[] = useMemo(() => {
    const rows: PaymentTableRowProps[] = [];
    groupedUnpaid.forEach((group) => {
      const dueInfo = group.days_left ?? `${group.totalBalance.toLocaleString()} due`;
      rows.push({
        id: `unpaid-${group.student_id}`,
        type: "unpaid",
        studentId: group.student_id,
        studentName: group.student_name,
        period: group.monthRange,
        dueInfo,
        amount: group.totalBalance,
        amountLabel: `₹${group.totalBalance.toLocaleString()} due`,
        status: group.hasOverdue ? "overdue" : "pending",
        lastPaymentAt: group.last_payment_at ?? null,
        paymentIds: group.paymentIds,
        totalBalance: group.totalBalance,
        monthBreakdown: group.monthBreakdown,
      });
    });
    paidPayments.forEach((payment) => {
      const paidAmount = Number(payment.amount_paid ?? payment.amount ?? 0);
      rows.push({
        id: payment.id,
        type: "paid",
        studentId: Number(payment.student_id ?? 0),
        studentName: payment.student_name,
        period: monthLabel(payment),
        dueInfo: "-",
        amount: paidAmount,
        amountLabel: `₹${paidAmount.toLocaleString()} paid`,
        status: "paid",
        lastPaymentAt: payment.last_payment_at ?? payment.paid_at ?? null,
      });
    });
    return rows;
  }, [groupedUnpaid, paidPayments]);

  const openPayNow = (group: GroupedUnpaidProps) => {
    const first = group.monthBreakdown[0];
    setForm({
      student_id: String(group.student_id),
      amount: String(group.totalBalance),
      month: first?.month ?? getDefaultMonthYear().month,
      year: String(first?.year ?? new Date().getFullYear()),
    });
    setInfoDialogGroup(null);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student_id || !form.amount || !form.month || !form.year) return;
    recordPayment.mutate(form);
  };

  return {
    payments,
    isLoading,
    error,
    studentsWithDues,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    modalOpen,
    setModalOpen,
    infoDialogGroup,
    setInfoDialogGroup,
    form,
    setForm,
    paymentStats,
    tableRows,
    groupedUnpaid,
    bulkMarkPaid,
    recordPayment,
    openPayNow,
    handleSubmit,
  };
}
