"use client";

import { TableCell, TableRow } from "@mui/material";
import { Box } from "@/components/ui/box";
import { ROW_CELL_SX } from "@/components/dashboard/dashboard-table.constants";
import type { StudentProps } from "@/components/dashboard/dashboard.types";
import type { ColumnId } from "./students-overview.constants";

interface StudentsOverviewTableRowProps {
  student: StudentProps;
  orderedColumns: { id: ColumnId; label: string }[];
}

export function StudentsOverviewTableRow({ student, orderedColumns }: StudentsOverviewTableRowProps) {
  const studentRecord = student as Record<string, string>;

  return (
    <TableRow
      hover
      sx={{
        "& .MuiTableCell-root": {
          ...ROW_CELL_SX,
          height: "50px",
        },
      }}
    >
      {orderedColumns.map((col) => (
        <TableCell key={col.id}>
          {col.id === "name" ? (
            <Box className="flex items-center gap-3">
              <span className="font-medium text-slate-900">{student.name}</span>
            </Box>
          ) : (
            studentRecord[col.id] ?? "-"
          )}
        </TableCell>
      ))}
    </TableRow>
  );
}
