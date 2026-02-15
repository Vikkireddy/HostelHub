"use client";

import { useState } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StudentsOverviewTable } from "./students-overview/StudentsOverviewTable";
import { COLUMN_CONFIG, type ColumnId } from "./students-overview/students-overview.constants";
import type { StudentsOverviewProps } from "./dashboard.types";
import { t } from "@/lib/i18n";

export function StudentsOverview({ students }: StudentsOverviewProps) {
  const [columnOrder, setColumnOrder] = useState<ColumnId[]>(() =>
    COLUMN_CONFIG.map((c) => c.id)
  );

  return (
    <Card className="rounded-xl border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-slate-900">{t("STUDENTS_OVERVIEW")}</CardTitle>
        <Link href="/dashboard/students" className="text-sm text-link hover:underline">
          {t("MANAGE")}
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {students.length === 0 ? (
          <EmptyState
            icon={Users}
            title={t("NO_STUDENTS_FOUND")}
            message={t("STUDENTS_EMPTY_MESSAGE")}
            className="min-h-[250px]"
          />
        ) : (
          <StudentsOverviewTable
            students={students}
            columnOrder={columnOrder}
            onColumnOrderChange={setColumnOrder}
          />
        )}
      </CardContent>
    </Card>
  );
}
