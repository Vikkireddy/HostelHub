"use client";

import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search } from "lucide-react";
import type { PaymentStatusFilterProps } from "@/components/dashboard/payments/payments.types";

interface PaymentFiltersBarProps {
  statusFilter: PaymentStatusFilterProps;
  onStatusFilterChange: (value: PaymentStatusFilterProps) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onRecordPayment: () => void;
}

export function PaymentFiltersBar({
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
  onRecordPayment,
}: PaymentFiltersBarProps) {
  return (
    <Box className="flex flex-wrap items-center gap-4 mb-6">
      <Tabs
        value={statusFilter}
        onValueChange={(v) => onStatusFilterChange(v as PaymentStatusFilterProps)}
      >
        <TabsList className="h-9 rounded-lg bg-slate-100 p-1 shrink-0">
          <TabsTrigger
            value="all"
            className="rounded-md px-4 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="rounded-md px-4 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Pending
          </TabsTrigger>
          <TabsTrigger
            value="overdue"
            className="rounded-md px-4 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Overdue
          </TabsTrigger>
          <TabsTrigger
            value="paid"
            className="rounded-md px-4 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Paid
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Box className="relative w-64 shrink-0">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search name, amount..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 rounded-lg border-slate-200 bg-white pl-9 text-sm"
        />
      </Box>

      <Button onClick={onRecordPayment} className="shrink-0 ml-auto">
        <Plus className="mr-2 h-4 w-4" />
        Record Payment
      </Button>
    </Box>
  );
}
