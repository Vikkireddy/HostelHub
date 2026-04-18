"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Typography } from "@/components/ui/typography";
import { Box } from "@/components/ui/box";
import type { Expense } from "./expenses.types";

interface ExpensesTableProps {
  expenses: Expense[];
  totalAmount: number;
  onDelete: (expense: Expense) => void;
  isDeleting: boolean;
}

export function ExpensesTable({
  expenses,
  totalAmount,
  onDelete,
  isDeleting,
}: ExpensesTableProps) {
  return (
    <>
      <Box className="mb-4 flex justify-end">
        <Typography className="font-semibold text-slate-700">
          Total: ₹{totalAmount.toLocaleString()}
        </Typography>
      </Box>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Staff</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[60px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((exp) => (
            <TableRow key={exp.id}>
              <TableCell>
                {exp.expense_date
                  ? new Date(exp.expense_date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "-"}
              </TableCell>
              <TableCell>{exp.category}</TableCell>
              <TableCell className="max-w-[140px] truncate text-slate-600">
                {exp.staff_name?.trim() || "-"}
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {exp.description || "-"}
              </TableCell>
              <TableCell className="text-right font-medium">
                ₹{Number(exp.amount).toLocaleString()}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => onDelete(exp)}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
