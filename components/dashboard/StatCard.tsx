import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Box } from "@/components/ui/box";
import type { StatCardProps } from "./dashboard.types";

export function StatCard({ title, value, subtitle, icon: Icon, iconBgClass, iconColorClass, action }: StatCardProps) {
  return (
    <Card className="rounded-xl border-slate-200 shadow-sm">
      <CardContent className="flex items-center justify-between p-6">
        <Box>
          <Typography className="text-2xl font-bold text-slate-900">{value}</Typography>
          <Typography variant="muted">{title}</Typography>
          {subtitle}
          {action}
        </Box>
        <Box className={`flex h-12 w-12 items-center justify-center rounded-lg ${iconBgClass}`}>
          <Icon className={`h-6 w-6 ${iconColorClass}`} />
        </Box>
      </CardContent>
    </Card>
  );
}
