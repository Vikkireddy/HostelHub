"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Box } from "@/components/ui/box";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/AuthStore";
import { hasDashboardPermission } from "@/lib/dashboardPermissionClient";
import { PaymentsSkeleton } from "@/components/skeletons";
import { useSettingsStore } from "@/lib/SettingsStore";
import {
  usePaymentsData,
  getDefaultMonthYear,
  type PaymentTableRowProps,
} from "@/components/dashboard/payments";
import { SelectHostelPrompt } from "@/components/multi-hostel/SelectHostelPrompt";

const PaymentStatsGrid = dynamic(() =>
  import("@/components/dashboard/payments").then((m) => m.PaymentStatsGrid)
);
const PaymentFiltersBar = dynamic(() =>
  import("@/components/dashboard/payments").then((m) => m.PaymentFiltersBar)
);
const PaymentsTable = dynamic(() =>
  import("@/components/dashboard/payments").then((m) => m.PaymentsTable)
);
const RecordPaymentDialog = dynamic(() =>
  import("@/components/dashboard/payments").then((m) => m.RecordPaymentDialog)
);
const PaymentBreakdownDialog = dynamic(() =>
  import("@/components/dashboard/payments").then((m) => m.PaymentBreakdownDialog)
);
const PaymentHistoryDialog = dynamic(() =>
  import("@/components/dashboard/payments").then((m) => m.PaymentHistoryDialog)
);

export default function PaymentsPage() {
  const user = useAuthStore((s) => s.user);
  const hostelId = user?.hostelId ?? null;
  const paymentTrackingEnabled = useSettingsStore((s) => s.getPaymentTrackingEnabled(hostelId));
  const canPaymentsView = hasDashboardPermission(user, "payments", "view");
  const canPaymentsAdd = hasDashboardPermission(user, "payments", "add");
  const canPaymentsEdit = hasDashboardPermission(user, "payments", "edit");

  if (!hostelId) {
    return <SelectHostelPrompt moduleLabel="Payments" />;
  }
  if (!paymentTrackingEnabled) {
    return <SelectHostelPrompt moduleLabel="Payments" />;
  }

  const [historyStudent, setHistoryStudent] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const {
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
    recordPaymentSubmitError,
    openPayNow,
    handleSubmit,
  } = usePaymentsData();

  const handleViewDetails = (row: PaymentTableRowProps) => {
    if (row.type === "unpaid") {
      const group = groupedUnpaid.find((g) => g.student_id === row.studentId);
      if (group) setInfoDialogGroup(group);
    } else {
      toast.info("No breakdown available for paid payments");
    }
  };

  const handleEditPayment = (row: PaymentTableRowProps) => {
    if (row.type === "unpaid") {
      const first = row.monthBreakdown?.[0];
      setForm({
        student_id: String(row.studentId),
        amount: String(row.totalBalance ?? row.amount),
        month: first?.month ?? getDefaultMonthYear().month,
        year: String(first?.year ?? new Date().getFullYear()),
        payment_mode: "online",
        payment_reference: "",
      });
      setModalOpen(true);
    } else {
      toast.info("Edit paid payments by recording a new payment");
    }
  };

  const handleSendReminder = (row: PaymentTableRowProps) => {
    toast.success(`Reminder sent to ${row.studentName}`);
  };

  const handleDelete = (_row: PaymentTableRowProps) => {
    toast.info("Delete payment is not available. Contact admin for corrections.");
  };

  const handleOpenHistory = (row: PaymentTableRowProps) => {
    setHistoryStudent({ id: row.studentId, name: row.studentName });
  };

  if (isLoading) return <PaymentsSkeleton />;
  if (error) return <Box className="p-8 text-red-600">Failed to load payments</Box>;

  return (
    <Box className="space-y-8">
      <PaymentStatsGrid
        stats={paymentStats}
        onViewCollected={() => setStatusFilter("paid")}
        onViewPending={() => setStatusFilter("pending")}
        onViewOverdue={() => setStatusFilter("overdue")}
      />

      <PaymentFiltersBar
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRecordPayment={() => setModalOpen(true)}
        canRecordPayment={canPaymentsAdd}
      />

      <PaymentsTable
        rows={tableRows}
        onMarkPaid={(studentId) => bulkMarkPaid.mutate(studentId)}
        onViewDetails={handleViewDetails}
        onOpenHistory={handleOpenHistory}
        onEditPayment={canPaymentsAdd ? handleEditPayment : undefined}
        onSendReminder={handleSendReminder}
        onDelete={handleDelete}
        isMarkingPaid={bulkMarkPaid.isPending}
        markingPaidStudentId={bulkMarkPaid.variables}
        canMarkPaid={canPaymentsEdit}
        canOpenPaymentHistory={canPaymentsView}
      />

      <RecordPaymentDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        form={form}
        onFormChange={setForm}
        onSubmit={handleSubmit}
        studentsWithDues={studentsWithDues}
        isPending={recordPayment.isPending}
        submitError={recordPaymentSubmitError}
        canSubmit={canPaymentsAdd}
      />

      <PaymentBreakdownDialog
        open={!!infoDialogGroup}
        onOpenChange={(open) => !open && setInfoDialogGroup(null)}
        group={infoDialogGroup}
        onPayNow={openPayNow}
        payNowDisabled={!canPaymentsAdd}
      />

      <PaymentHistoryDialog
        open={!!historyStudent}
        onOpenChange={(open) => !open && setHistoryStudent(null)}
        studentId={historyStudent?.id ?? null}
        studentName={historyStudent?.name}
      />
    </Box>
  );
}
