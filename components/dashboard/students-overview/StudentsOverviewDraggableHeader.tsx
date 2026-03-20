"use client";

import { Button, TableCell } from "@mui/material";
import { GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box } from "@/components/ui/box";
import { HEADER_CELL_SX } from "@/components/dashboard/DashboardTableConstants";
import type { ColumnId } from "./StudentsOverviewConstants";

interface StudentsOverviewDraggableHeaderProps {
  id: ColumnId;
  label: string;
}

export function StudentsOverviewDraggableHeader({ id, label }: StudentsOverviewDraggableHeaderProps) {
  const { attributes, isDragging, listeners, setNodeRef, transform } = useSortable({ id });

  const style: React.CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    transform: CSS.Translate.toString(transform),
    whiteSpace: "nowrap",
  };

  return (
    <TableCell ref={setNodeRef} style={style} sx={HEADER_CELL_SX}>
      <Box className="flex gap-2 ">
        <Button
          type="button"
          variant="text"
          size="small"
          sx={{
            minWidth: "auto",
            p: 0.5,
            cursor: "grab",
            touchAction: "none",
            "&:hover": { bgcolor: "action.hover" },
            "&:active": { cursor: "grabbing" },
          }}
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4 text-slate-500" />
        </Button>
        {label}
      </Box>
    </TableCell>
  );
}
