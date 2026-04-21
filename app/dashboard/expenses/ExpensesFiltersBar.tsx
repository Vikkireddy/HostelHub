"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { Box } from "@/components/ui/box";
import { MONTHS } from "./expenses.constants";

interface ExpensesFiltersBarProps {
  filterMonth: string;
  setFilterMonth: (v: string) => void;
  filterYear: string;
  setFilterYear: (v: string) => void;
  onAddExpense: () => void;
  canAddExpense?: boolean;
}

const YEARS = [
  new Date().getFullYear(),
  new Date().getFullYear() - 1,
  new Date().getFullYear() - 2,
];

const MONTH_OPTIONS = MONTHS.map((m, i) => ({ value: String(i + 1), label: m }));
const YEAR_OPTIONS = YEARS.map((y) => ({ value: String(y), label: String(y) }));

export function ExpensesFiltersBar({
  filterMonth,
  setFilterMonth,
  filterYear,
  setFilterYear,
  onAddExpense,
  canAddExpense = true,
}: ExpensesFiltersBarProps) {
  return (
    <Box className="flex items-center gap-3">
      <Box className="flex items-center gap-2">
        <Dropdown
          value={filterMonth}
          onValueChange={setFilterMonth}
          options={MONTH_OPTIONS}
          placeholder="Month"
          triggerClassName="w-[130px]"
        />
        <Dropdown
          value={filterYear}
          onValueChange={setFilterYear}
          options={YEAR_OPTIONS}
          placeholder="Year"
          triggerClassName="w-[100px]"
        />
      </Box>
      <Button
        size="sm"
        icon={<Plus className="h-4 w-4" />}
        disabled={!canAddExpense}
        title={!canAddExpense ? "You don't have permission to add expenses" : undefined}
        onClick={onAddExpense}
      >
        Add Expense
      </Button>
    </Box>
  );
}
