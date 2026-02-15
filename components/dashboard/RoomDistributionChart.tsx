"use client";

import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Box } from "@/components/ui/box";
import { EmptyState } from "@/components/ui/empty-state";
import type { RoomDistributionChartProps } from "./dashboard.types";
import { t } from "@/lib/i18n";

export function RoomDistributionChart({ roomDistribution }: RoomDistributionChartProps) {
  const hasRoomDistribution =
    roomDistribution?.length > 0 && roomDistribution.some((r) => r.value > 0);

  return (
    <Card className="rounded-xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-slate-900">{t("ROOM_DISTRIBUTION")}</CardTitle>
      </CardHeader>
      <CardContent>
        {hasRoomDistribution ? (
          <Box className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roomDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                >
                  {roomDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <EmptyState
            icon={PieChartIcon}
            title={t("NO_ROOM_DISTRIBUTION_FOUND")}
            message={t("ROOM_DISTRIBUTION_EMPTY_MESSAGE")}
            className="h-[300px]"
          />
        )}
      </CardContent>
    </Card>
  );
}
