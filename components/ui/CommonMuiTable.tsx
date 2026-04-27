"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";

export type CommonMuiTableColumn<T> = {
  key: string;
  header: ReactNode;
  render: (row: T, rowIndex: number) => ReactNode;
  align?: "left" | "right" | "center";
};

type CommonMuiTableProps<T> = {
  columns: CommonMuiTableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  isRowClickSuppressed?: () => boolean;
  tableContainerSx?: Record<string, unknown>;
  rowsPerPageOptions?: number[];
  initialRowsPerPage?: number;
};

export function CommonMuiTable<T>({
  columns,
  data,
  getRowId,
  onRowClick,
  isRowClickSuppressed,
  tableContainerSx,
  rowsPerPageOptions = [10, 20, 30, 40, 50],
  initialRowsPerPage = 10,
}: CommonMuiTableProps<T>) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div className="space-y-2">
      <TableContainer sx={{ maxHeight: "calc(100vh - 320px)", minHeight: 280, ...tableContainerSx }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  align={col.align ?? "left"}
                  sx={{
                    fontWeight: 600,
                    color: "rgb(15 23 42)",
                    backgroundColor: "rgb(248 250 252)",
                    borderBottom: "1px solid rgb(226 232 240)",
                  }}
                >
                  {col.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, idx) => (
              <TableRow
                key={getRowId(row)}
                hover
                onClick={
                  onRowClick
                    ? () => {
                        if (isRowClickSuppressed?.()) return;
                        onRowClick(row);
                      }
                    : undefined
                }
                sx={{
                  cursor: onRowClick ? "pointer" : undefined,
                  "& .MuiTableCell-root": {
                    borderBottom: "1px solid rgb(226 232 240)",
                    color: "rgb(51 65 85)",
                  },
                }}
              >
                {columns.map((col) => (
                  <TableCell key={col.key} align={col.align ?? "left"}>
                    {col.render(row, page * rowsPerPage + idx)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        sx={{
          borderTop: "1px solid rgb(226 232 240)",
          ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
            fontSize: "0.875rem",
          },
        }}
      />
    </div>
  );
}
