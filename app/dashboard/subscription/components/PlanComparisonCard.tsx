import { Box, Typography } from "@mui/material";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";
import type { PlanComparisonRow } from "./types";

interface PlanComparisonCardProps {
  rows: PlanComparisonRow[];
}

export function PlanComparisonCard({ rows }: PlanComparisonCardProps) {
  return (
    <Card className="mx-auto mt-16 max-w-6xl overflow-hidden border-slate-200 bg-white shadow-sm">
      <CardHeader className="space-y-1 border-b border-slate-200 bg-white pb-4">
        <Typography component="h2" className="text-xl font-bold text-slate-900">
          {t("SUBSCRIPTION_COMPARISON_TITLE")}
        </Typography>
        <Typography className="text-sm text-slate-600">{t("SUBSCRIPTION_COMPARISON_SUBTITLE")}</Typography>
      </CardHeader>
      <CardContent className="p-0">
        <Box>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
                <TableHead className="w-[40%] text-slate-900">{t("SUBSCRIPTION_TABLE_FEATURE")}</TableHead>
                <TableHead className="text-center text-slate-900">{t("SUBSCRIPTION_TABLE_BASE")}</TableHead>
                <TableHead className="text-center text-slate-900">{t("SUBSCRIPTION_TABLE_PRO")}</TableHead>
                <TableHead className="text-center text-slate-900">{t("SUBSCRIPTION_TABLE_PRO_PLUS")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow
                  key={row.feature}
                  className={cn(
                    "border-slate-200",
                    i % 2 === 1 ? "bg-slate-50/80 hover:bg-slate-50/80" : "hover:bg-white"
                  )}
                >
                  <TableCell className="font-medium text-slate-800">{row.feature}</TableCell>
                  <TableCell className="text-center text-slate-700">{row.basic}</TableCell>
                  <TableCell className="text-center text-slate-700">{row.pro}</TableCell>
                  <TableCell className="text-center text-slate-700">{row.enterprise}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </CardContent>
    </Card>
  );
}
