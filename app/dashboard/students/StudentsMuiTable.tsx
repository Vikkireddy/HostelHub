"use client";

import React from "react";
import { CommonMuiTable, type CommonMuiTableColumn } from "@/components/ui/CommonMuiTable";
import type { StudentsMuiTableProps } from "./students.types";
import { isStudentTableRowClickSuppressed } from "./rowClickGuard";

export function StudentsMuiTable<T>({ columns, data, getRowId, onRowClick }: StudentsMuiTableProps<T>) {
  const mappedColumns: CommonMuiTableColumn<T>[] = columns.map((col) => {
    const colId = (col as { id?: string }).id ?? (col as { accessorKey?: string }).accessorKey ?? "";
    const headerContent =
      typeof col.header === "string"
        ? col.header
        : String((col as { id?: string }).id ?? (col as { accessorKey?: string }).accessorKey ?? "");

    return {
      key: String(colId),
      header: headerContent,
      render: (row: T) => {
        const cellDef = col.cell;
        const cellContent =
          typeof cellDef === "function"
            ? (cellDef as (info: { row: { original: T } }) => React.ReactNode)({ row: { original: row } } as never)
            : (row as Record<string, unknown>)[String(colId)] ?? "-";
        const safeContent =
          cellContent == null ||
          (typeof cellContent === "object" && !Array.isArray(cellContent) && !React.isValidElement(cellContent));
        return safeContent ? "-" : (cellContent as React.ReactNode);
      },
    };
  });

  return (
    <CommonMuiTable
      columns={mappedColumns}
      data={data}
      getRowId={getRowId}
      onRowClick={onRowClick}
      isRowClickSuppressed={isStudentTableRowClickSuppressed}
    />
  );
}
