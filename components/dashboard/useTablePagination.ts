"use client";

import { useState, useCallback } from "react";

export function useTablePagination(initialRowsPerPage = 10) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const handleChangePage = useCallback((_: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  }, []);

  const paginate = useCallback(
    <T>(items: T[]): T[] => {
      return items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    },
    [page, rowsPerPage]
  );

  return {
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    paginate,
  };
}
