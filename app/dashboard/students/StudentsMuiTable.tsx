"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import type { StudentsMuiTableProps } from "./students.types";

export function StudentsMuiTable<T>({ columns, data, getRowId }: StudentsMuiTableProps<T>) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  return (
    <div className="space-y-2">
      <TableContainer sx={{ maxHeight: "calc(100vh - 320px)", minHeight: 280 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => {
                const headerContent =
                  typeof col.header === "string"
                    ? col.header
                    : String((col as { id?: string }).id ?? (col as { accessorKey?: string }).accessorKey ?? "");
                return (
                  <TableCell
                    key={String((col as { id?: string }).id ?? (col as { accessorKey?: string }).accessorKey)}
                    sx={{
                      fontWeight: 600,
                      color: "rgb(15 23 42)",
                      backgroundColor: "rgb(248 250 252)",
                      borderBottom: "1px solid rgb(226 232 240)",
                    }}
                  >
                    {headerContent}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
            <TableBody>
              {paginatedData.map((row) => (
                <TableRow
                  key={getRowId(row)}
                  hover
                  sx={{
                    "& .MuiTableCell-root": {
                      borderBottom: "1px solid rgb(226 232 240)",
                      color: "rgb(51 65 85)",
                    },
                  }}
                >
                  {columns.map((col) => {
                    const colId = (col as { id?: string }).id ?? (col as { accessorKey?: string }).accessorKey;
                    const cellDef = col.cell;
                    const cellContent =
                      typeof cellDef === "function"
                        ? (cellDef as (info: { row: { original: T } }) => React.ReactNode)({ row: { original: row } } as never)
                        : (row as Record<string, unknown>)[String(colId)] ?? "-";
                    const safeContent =
                      cellContent == null ||
                      (typeof cellContent === "object" && !Array.isArray(cellContent) && !React.isValidElement(cellContent));
                    const displayValue: React.ReactNode = safeContent ? "-" : (cellContent as React.ReactNode);
                    return (
                      <TableCell key={String(colId)}>
                        {displayValue}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 20, 30, 40, 50]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
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
