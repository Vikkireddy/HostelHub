"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Typography } from "@/components/ui/typography";
import { Box } from "@/components/ui/box";
import type { PlannedVacateRowProps } from "./dashboard.types";
import { t } from "@/lib/i18n";

const formatVacateDate = (ymd: string) => {
  const d = new Date(`${ymd}T12:00:00`);
  if (Number.isNaN(d.getTime())) return ymd;
  return d.toLocaleDateString(undefined, { dateStyle: "medium" });
};

export const PlannedVacateItem = ({ item }: PlannedVacateRowProps) => {
  const { studentName, room, plannedVacateDate } = item;
  const initials = studentName
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Box className="flex items-center justify-between gap-3 mt-4">
      <Box className="flex min-w-0 items-center gap-3">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarFallback className="text-xs">{initials || "?"}</AvatarFallback>
        </Avatar>
        <Box className="min-w-0">
          <Typography className="truncate font-medium text-slate-900">{studentName}</Typography>
          <Typography variant="caption" className="text-slate-600">
            {t("ROOM_LABEL")} {room}
          </Typography>
        </Box>
      </Box>
      <Box className="shrink-0 text-right">
        <Typography variant="caption" className="block text-slate-500">
          {t("PLANNED_VACATES_VACATE_ON")}
        </Typography>
        <Typography className="text-sm font-semibold text-slate-900">
          {formatVacateDate(plannedVacateDate)}
        </Typography>
      </Box>
    </Box>
  );
};
