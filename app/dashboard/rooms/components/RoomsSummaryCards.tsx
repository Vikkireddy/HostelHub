import { ReactNode } from "react";
import { BedDouble, DoorOpen, Users, Wrench } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Box } from "@/components/ui/box";

function SummaryStatCard({
  icon,
  iconClassName,
  iconContainerClassName,
  value,
  label,
}: {
  icon: ReactNode;
  iconClassName: string;
  iconContainerClassName: string;
  value: number;
  label: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <Box
          className={`flex h-12 w-12 items-center justify-center rounded-lg ${iconContainerClassName}`}
        >
          <Box className={iconClassName}>{icon}</Box>
        </Box>
        <Box>
          <Typography className="text-2xl font-bold">{value}</Typography>
          <Typography variant="muted">{label}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export function RoomsSummaryCards({
  totalRooms,
  available,
  occupied,
  maintenance,
}: {
  totalRooms: number;
  available: number;
  occupied: number;
  maintenance: number;
}) {
  return (
    <Box className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <SummaryStatCard
        icon={<BedDouble className="h-6 w-6" />}
        iconClassName="text-blue-600"
        iconContainerClassName="bg-blue-100"
        value={totalRooms}
        label="Total Rooms"
      />
      <SummaryStatCard
        icon={<DoorOpen className="h-6 w-6" />}
        iconClassName="text-green-600"
        iconContainerClassName="bg-green-100"
        value={available}
        label="Available"
      />
      <SummaryStatCard
        icon={<Users className="h-6 w-6" />}
        iconClassName="text-amber-600"
        iconContainerClassName="bg-amber-100"
        value={occupied}
        label="Occupied"
      />
      <SummaryStatCard
        icon={<Wrench className="h-6 w-6" />}
        iconClassName="text-orange-600"
        iconContainerClassName="bg-orange-100"
        value={maintenance}
        label="Maintenance"
      />
    </Box>
  );
}
