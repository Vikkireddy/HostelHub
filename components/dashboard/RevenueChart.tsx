"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Box } from "@/components/ui/box";
import type { RevenueChartProps } from "./dashboard.types";
import { t } from "@/lib/i18n";

export function RevenueChart({ revenue = [] }: RevenueChartProps) {
  // Convert Monthly Revenue → Quarterly Revenue
  const quarterlyData = React.useMemo(() => {
    const quarters = [
      { quarter: "Q1", months: ["Jan", "Feb", "Mar"] },
      { quarter: "Q2", months: ["Apr", "May", "Jun"] },
      { quarter: "Q3", months: ["Jul", "Aug", "Sep"] },
      { quarter: "Q4", months: ["Oct", "Nov", "Dec"] },
    ];

    return quarters.map((q) => {
      const total = revenue
        .filter((r) => q.months.includes(r.month))
        .reduce((sum, r) => sum + (r.revenue || 0), 0);

      return {
        quarter: q.quarter,
        revenue: total,
      };
    });
  }, [revenue]);

  return (
    <Card className="rounded-xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-slate-900">
          {t("REVENUE_OVERVIEW")}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Box className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={quarterlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              
              <XAxis dataKey="quarter" stroke="#64748b" />
              
              <YAxis stroke="#64748b" />
              
              <Tooltip
                formatter={(value: number) =>
                  `₹ ${value.toLocaleString()}`
                }
                cursor={false}
              />

              <Bar
                dataKey="revenue"
                fill="#42B2D7"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}