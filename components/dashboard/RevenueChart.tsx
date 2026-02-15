"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Box } from "@/components/ui/box";
import { EmptyState } from "@/components/ui/empty-state";
import type { RevenueChartProps } from "./dashboard.types";
import { t } from "@/lib/i18n";

export function RevenueChart({ revenue }: RevenueChartProps) {
  const hasRevenueData = revenue?.length > 0 && revenue.some((r) => r.revenue > 0);

  return (
    <Card className="rounded-xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-slate-900">{t("REVENUE_OVERVIEW")}</CardTitle>
      </CardHeader>
      <CardContent>
        {hasRevenueData ? (
          <Box className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="revenue" fill="#42B2D7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <EmptyState
            icon={BarChart2}
            title={t("NO_REVENUE_DATA_FOUND")}
            message={t("REVENUE_EMPTY_MESSAGE")}
            className="h-[300px]"
          />
        )}
      </CardContent>
    </Card>
  );
}
