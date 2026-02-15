"use client";

import { TableCell, TableHead, TableRow } from "@mui/material";
import { HEADER_CELL_SX } from "@/components/dashboard/dashboard-table.constants";
import { TABLE_COLUMNS } from "./payments-table.constants";

export function PaymentTableHeader() {
  return (
    <TableHead>
      <TableRow>
        {TABLE_COLUMNS.map((label) => (
          <TableCell key={label} sx={HEADER_CELL_SX}>
            {label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
