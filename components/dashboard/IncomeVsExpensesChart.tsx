"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Box } from "@/components/ui/box";
import { t } from "@/lib/i18n";

/**
 * Income vs Expenses chart - monthly financial performance.
 * Income: paid payments only. Expenses: admin_expenses. Profit: Income - Expenses.
 * @see /docs/finance.md
 */
export type IncomeVsExpensesDataPoint = {
  month: string;
  income: number;
  expenses: number;
  profit: number;
};

interface IncomeVsExpensesChartProps {
  data?: IncomeVsExpensesDataPoint[];
}

const INCOME_COLOR = "#42B2D7";
const EXPENSES_COLOR = "#f97316";
const PROFIT_COLOR = "#22c55e";

export function IncomeVsExpensesChart({ data = [] }: IncomeVsExpensesChartProps) {
  const chartData = data.length > 0 ? data : [
    { month: "Jan", income: 0, expenses: 0, profit: 0 },
    { month: "Feb", income: 0, expenses: 0, profit: 0 },
    { month: "Mar", income: 0, expenses: 0, profit: 0 },
  ];

  const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;

  return (
    <Card className="rounded-xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-slate-900">
          {t("INCOME_VS_EXPENSES")}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Box className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Legend wrapperStyle={{ paddingTop: 16 }} />
              <Line
                type="monotone"
                dataKey="income"
                name={t("INCOME")}
                stroke={INCOME_COLOR}
                strokeWidth={2}
                dot={{ fill: INCOME_COLOR, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                name={t("EXPENSES")}
                stroke={EXPENSES_COLOR}
                strokeWidth={2}
                dot={{ fill: EXPENSES_COLOR, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="profit"
                name={t("PROFIT")}
                stroke={PROFIT_COLOR}
                strokeWidth={2}
                dot={{ fill: PROFIT_COLOR, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* Summary legend with totals for charted period */}
        {chartData.length > 0 && (
          <Box className="mt-4 flex flex-wrap gap-4 border-t border-slate-100 pt-4">
            <Box className="flex items-center gap-2">
              <Box className="h-3 w-3 rounded-sm" style={{ backgroundColor: INCOME_COLOR }} />
              <span className="text-sm text-slate-600">
                {t("INCOME")} {formatCurrency(chartData.reduce((s, d) => s + d.income, 0))}
              </span>
            </Box>
            <Box className="flex items-center gap-2">
              <Box className="h-3 w-3 rounded-sm" style={{ backgroundColor: EXPENSES_COLOR }} />
              <span className="text-sm text-slate-600">
                {t("EXPENSES")} {formatCurrency(chartData.reduce((s, d) => s + d.expenses, 0))}
              </span>
            </Box>
            <Box className="flex items-center gap-2">
              <Box className="h-3 w-3 rounded-sm" style={{ backgroundColor: PROFIT_COLOR }} />
              <span className="text-sm text-slate-600">
                {t("PROFIT")} {formatCurrency(chartData.reduce((s, d) => s + d.profit, 0))}
              </span>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
