"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Box } from "@/components/ui/box";
import { LogOut, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { t } from "@/lib/i18n";
import { IconButton, Menu, MenuItem } from "@mui/material";

export interface Student {
  id: string | number;
  name: string;
  email?: string;
  room_number?: string;
  room_id?: number;
  course?: string;
  join_date?: string;
  phone: string;
  id_proof_type?: string;
  id_proof_number?: string;
  address?: string;
  pending_dues?: number;
  payment_status?: "Overdue" | "No Due Amount" | "Pending";
  payment_count?: number;
}

export interface InactiveStudent extends Student {
  left_date?: string;
}

function ActionsMenu({
  student,
  onEdit,
  onCheckOut,
  onDelete,
  hasPendingDues,
  deletable,
}: {
  student: Student;
  onEdit: (s: Student) => void;
  onCheckOut: (s: Student) => void;
  onDelete: (s: Student) => void;
  hasPendingDues: boolean;
  deletable: boolean;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleEdit = () => {
    onEdit(student);
    handleClose();
  };

  const handleCheckOut = () => {
    if (!hasPendingDues) onCheckOut(student);
    handleClose();
  };

  const handleDelete = () => {
    if (deletable) onDelete(student);
    handleClose();
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={handleClick}
        aria-label="Actions"
        sx={{ color: "rgb(100 116 139)" }}
      >
        <MoreHorizontal className="h-5 w-5" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleEdit} sx={{ gap: 1 }}>
          <Pencil className="h-4 w-4" />
          Edit
        </MenuItem>
        <MenuItem
          onClick={handleCheckOut}
          disabled={hasPendingDues}
          sx={{ gap: 1 }}
          title={hasPendingDues ? t("CHECKOUT_DISABLED_DUES") : undefined}
        >
          <LogOut className="h-4 w-4" />
          {t("CHECK_OUT")}
        </MenuItem>
        <MenuItem
          onClick={handleDelete}
          disabled={!deletable}
          sx={{ gap: 1 }}
          title={!deletable ? "Cannot delete student with payment history" : undefined}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </MenuItem>
      </Menu>
    </>
  );
}

export const getStudentColumns = (
  onCheckOut: (student: Student) => void,
  onEdit: (student: Student) => void,
  onDelete: (student: Student) => void,
  canDelete: (student: Student) => boolean
): ColumnDef<Student>[] => [
  {
    accessorKey: "name",
    header: "Name",
    id: "name",
    cell: ({ row }) => (
      <Box className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="text-xs">
            {row.original.name.split(" ").map((n) => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium text-slate-900">{row.original.name}</span>
      </Box>
    ),
  },
  { accessorKey: "email", header: "Email", id: "email", cell: ({ row }) => row.original.email || "-" },
  { accessorKey: "phone", header: "Phone", id: "phone" },
  { accessorKey: "room_number", header: "Room", id: "room_number", cell: ({ row }) => row.original.room_number || "-" },
  { accessorKey: "course", header: "Course", id: "course", cell: ({ row }) => row.original.course || "-" },
  { accessorKey: "id_proof_type", header: "ID Proof", id: "id_proof_type", cell: ({ row }) => row.original.id_proof_type || "-" },
  { accessorKey: "id_proof_number", header: "ID Proof #", id: "id_proof_number", cell: ({ row }) => row.original.id_proof_number || "-" },
  {
    accessorKey: "address",
    header: "Address",
    id: "address",
    cell: ({ row }) => (
      <span className="max-w-[200px] truncate block" title={row.original.address || undefined}>
        {row.original.address || "-"}
      </span>
    ),
  },
  {
    accessorKey: "join_date",
    header: "Join Date",
    id: "join_date",
    cell: ({ row }) =>
      row.original.join_date ? new Date(row.original.join_date).toISOString().slice(0, 10) : "-",
  },
  {
    id: "actions",
    header: "",
    enableResizing: false,
    size: 60,
    minSize: 60,
    cell: ({ row }) => {
      const hasPendingDues = (row.original.pending_dues ?? 0) > 0;
      const deletable = canDelete(row.original);
      return (
        <ActionsMenu
          student={row.original}
          onEdit={onEdit}
          onCheckOut={onCheckOut}
          onDelete={onDelete}
          hasPendingDues={hasPendingDues}
          deletable={deletable}
        />
      );
    },
  },
];

export const getInactiveStudentColumns = (): ColumnDef<InactiveStudent>[] => [
  {
    accessorKey: "name",
    header: "Name",
    id: "name",
    cell: ({ row }) => (
      <Box className="flex items-center gap-3">
        <Avatar className="h-9 w-9 opacity-50 grayscale">
          <AvatarFallback className="text-xs bg-slate-200 text-slate-500">
            {row.original.name.split(" ").map((n) => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium text-slate-600">{row.original.name}</span>
      </Box>
    ),
  },
  { accessorKey: "email", header: "Email", id: "email", cell: ({ row }) => <span className="text-slate-600">{row.original.email || "-"}</span> },
  { accessorKey: "phone", header: "Phone", id: "phone", cell: ({ row }) => <span className="text-slate-600">{row.original.phone}</span> },
  { accessorKey: "room_number", header: "Room", id: "room_number", cell: ({ row }) => <span className="text-slate-600">{row.original.room_number || "-"}</span> },
  { accessorKey: "course", header: "Course", id: "course", cell: ({ row }) => <span className="text-slate-600">{row.original.course || "-"}</span> },
  { accessorKey: "id_proof_type", header: "ID Proof", id: "id_proof_type", cell: ({ row }) => <span className="text-slate-600">{row.original.id_proof_type || "-"}</span> },
  { accessorKey: "id_proof_number", header: "ID Proof #", id: "id_proof_number", cell: ({ row }) => <span className="text-slate-600">{row.original.id_proof_number || "-"}</span> },
  {
    accessorKey: "address",
    header: "Address",
    id: "address",
    cell: ({ row }) => (
      <span className="max-w-[200px] truncate block text-slate-600" title={row.original.address || undefined}>
        {row.original.address || "-"}
      </span>
    ),
  },
  {
    accessorKey: "join_date",
    header: "Join Date",
    id: "join_date",
    cell: ({ row }) => (
      <span className="text-slate-600">
        {row.original.join_date ? new Date(row.original.join_date).toISOString().slice(0, 10) : "-"}
      </span>
    ),
  },
  {
    accessorKey: "left_date",
    header: t("LEFT_DATE"),
    id: "left_date",
    cell: ({ row }) => (
      <span className="text-slate-600">
        {row.original.left_date ? new Date(row.original.left_date).toISOString().slice(0, 10) : "-"}
      </span>
    ),
  },
];
