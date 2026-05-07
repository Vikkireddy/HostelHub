import { Pencil, Trash2, Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/StatusChip";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Box } from "@/components/ui/box";
import { DEFAULT_AC_TYPE } from "../rooms.constants";
import { Room } from "./types";

export function RoomCard({
  room,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}: {
  room: Room;
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}) {
  const occupancyPercent = (room.occupancy / room.capacity) * 100;
  const progressVariant =
    room.status === "full"
      ? "danger"
      : room.status === "available" && room.occupancy > 0
      ? "warning"
      : "default";

  return (
    <Card className="group overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <Box className="flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-500" />
          <span className="font-medium">Room {room.number}</span>
        </Box>
        <Box className="flex items-center gap-2">
          <StatusChip status={room.status as "available" | "full" | "maintenance"} />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-700"
            onClick={() => onEdit(room)}
            disabled={!canEdit}
            title={
              !canEdit ? "You don't have permission to edit rooms" : "Edit room"
            }
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
            onClick={() => onDelete(room)}
            disabled={room.occupancy > 0 || !canDelete}
            title={
              !canDelete
                ? "You don't have permission to delete rooms"
                : room.occupancy > 0
                  ? "Cannot delete room with occupants"
                  : "Delete room"
            }
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </Box>
      </CardHeader>
      <CardContent className="space-y-4">
        <Typography variant="muted">Floor {room.floor}</Typography>
        <Box>
          <Typography className="text-sm">
            <span className="text-slate-500">Category:</span> {room.ac_type || DEFAULT_AC_TYPE}
          </Typography>
          <Typography className="text-sm">
            <span className="text-slate-500">Occupancy:</span> {room.occupancy}/{room.capacity}
          </Typography>
        </Box>
        <Progress value={occupancyPercent} variant={progressVariant} className="h-2" />
      </CardContent>
    </Card>
  );
}
