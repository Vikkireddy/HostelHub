"use client";

import { TableCell } from "@mui/material";
import { GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box } from "@/components/ui/box";
import { HEADER_CELL_SX } from "@/components/dashboard/dashboard-table.constants";
import type { ColumnId } from "./students-overview.constants";

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
      <Box className="flex items-center gap-2 justify-center">
        <button
          type="button"
          className="cursor-grab touch-none rounded p-1 hover:bg-slate-200 active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4 text-slate-500" />
        </button>
        {label}
      </Box>
    </TableCell>
  );
}
