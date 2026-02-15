"use client";

import { Box } from "@/components/ui/box";
import { toast } from "sonner";
import { PaymentsSkeleton } from "@/components/skeletons";
import {
  PaymentStatsGrid,
  PaymentFiltersBar,
  PaymentsTable,
  RecordPaymentDialog,
  PaymentBreakdownDialog,
  usePaymentsData,
  getDefaultMonthYear,
  type PaymentTableRowProps,
} from "@/components/dashboard/payments";

export default function PaymentsPage() {
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
      />

      <PaymentsTable
        rows={tableRows}
        onMarkPaid={(studentId) => bulkMarkPaid.mutate(studentId)}
        onViewDetails={handleViewDetails}
        onEditPayment={handleEditPayment}
        onSendReminder={handleSendReminder}
        onDelete={handleDelete}
        isMarkingPaid={bulkMarkPaid.isPending}
        markingPaidStudentId={bulkMarkPaid.variables}
      />

      <RecordPaymentDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        form={form}
        onFormChange={setForm}
        onSubmit={handleSubmit}
        studentsWithDues={studentsWithDues}
        isPending={recordPayment.isPending}
        error={recordPayment.error}
      />

      <PaymentBreakdownDialog
        open={!!infoDialogGroup}
        onOpenChange={(open) => !open && setInfoDialogGroup(null)}
        group={infoDialogGroup}
        onPayNow={openPayNow}
      />
    </Box>
  );
}
