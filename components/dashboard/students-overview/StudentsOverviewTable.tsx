"use client";

import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { arrayMove, horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { useTablePagination } from "@/components/dashboard/useTablePagination";
import { PAGINATION_SX } from "@/components/dashboard/dashboard-table.constants";
import { StudentsOverviewDraggableHeader } from "./StudentsOverviewDraggableHeader";
import { StudentsOverviewTableRow } from "./StudentsOverviewTableRow";
import { COLUMN_CONFIG, type ColumnId } from "./students-overview.constants";
import type { StudentProps } from "@/components/dashboard/dashboard.types";

interface StudentsOverviewTableProps {
  students: StudentProps[];
  columnOrder: ColumnId[];
  onColumnOrderChange: React.Dispatch<React.SetStateAction<ColumnId[]>>;
}

export function StudentsOverviewTable({
  students,
  columnOrder,
  onColumnOrderChange,
}: StudentsOverviewTableProps) {
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage, paginate } =
    useTablePagination(10);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const orderedColumns = useMemo(
    () =>
      columnOrder
        .map((id) => COLUMN_CONFIG.find((c) => c.id === id))
        .filter(Boolean) as { id: ColumnId; label: string }[],
    [columnOrder]
  );

  const paginatedStudents = paginate(students);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      onColumnOrderChange((prev) => {
        const oldIndex = prev.indexOf(active.id as ColumnId);
        const newIndex = prev.indexOf(over.id as ColumnId);
        if (oldIndex === -1 || newIndex === -1) return prev;
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis]}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <TableContainer sx={{ maxHeight: 400 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                {orderedColumns.map((col) => (
                  <StudentsOverviewDraggableHeader
                    key={col.id}
                    id={col.id}
                    label={col.label}
                  />
                ))}
              </SortableContext>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedStudents.map((student) => (
              <StudentsOverviewTableRow
                key={student.id}
                student={student}
                orderedColumns={orderedColumns}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={students.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={PAGINATION_SX}
      />
    </DndContext>
  );
}
