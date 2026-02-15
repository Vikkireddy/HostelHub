"use client";

import {
  Paper,
  Table,
  TableBody,
  TableContainer,
  TablePagination,
} from "@mui/material";
import { PAGINATION_SX } from "@/components/dashboard/dashboard-table.constants";
import { Receipt } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PaymentTableHeader } from "./PaymentTableHeader";
import { PaymentTableRow } from "./PaymentTableRow";
import { useTablePagination } from "@/components/dashboard/useTablePagination";
import type { PaymentTableRowProps } from "@/components/dashboard/payments/payments.types";

interface PaymentsTableProps {
  rows: PaymentTableRowProps[];
  onMarkPaid: (studentId: number) => void;
  onViewDetails: (row: PaymentTableRowProps) => void;
  onEditPayment?: (row: PaymentTableRowProps) => void;
  onSendReminder?: (row: PaymentTableRowProps) => void;
  onDelete?: (row: PaymentTableRowProps) => void;
  isMarkingPaid?: boolean;
  markingPaidStudentId?: number;
}

export function PaymentsTable({
  rows,
  onMarkPaid,
  onViewDetails,
  onEditPayment,
  onSendReminder,
  onDelete,
  isMarkingPaid,
  markingPaidStudentId,
}: PaymentsTableProps) {
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage, paginate } =
    useTablePagination(10);

  const paginatedRows = paginate(rows);

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No payments found"
        message="Payment records will appear here once payments are recorded"
        className="min-h-[280px]"
      />
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid rgb(226 232 240)",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <TableContainer sx={{ maxHeight: "calc(100vh - 380px)", minHeight: 280 }}>
        <Table stickyHeader size="small">
          <PaymentTableHeader />
          <TableBody>
            {paginatedRows.map((row) => (
              <PaymentTableRow
                key={row.id}
                row={row}
                onMarkPaid={onMarkPaid}
                onViewDetails={onViewDetails}
                onEditPayment={onEditPayment}
                onSendReminder={onSendReminder}
                onDelete={onDelete}
                isMarkingPaid={isMarkingPaid}
                markingPaidStudentId={markingPaidStudentId}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 20, 30, 40, 50]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={PAGINATION_SX}
      />
    </Paper>
  );
}
