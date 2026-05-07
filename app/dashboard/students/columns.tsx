"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Box } from "@/components/ui/box";
import { LogOut, Pencil, Trash2, MoreHorizontal, Eye } from "lucide-react";
import { t } from "@/lib/i18n";
import { sqlDateOnlyToYmd } from "@/lib/dateOnly";
import { IconButton, Menu, MenuItem } from "@mui/material";
import type { InactiveStudent, Student } from "./students.types";
import { suppressStudentTableRowClick } from "./rowClickGuard";

function ActionsMenu({
  student,
  onViewDetails,
  onEdit,
  onCheckOut,
  onDelete,
  hasPendingDues,
  deletable,
  canEdit,
  canCheckOut,
  canDeletePerm,
}: {
  student: Student;
  onViewDetails?: (s: Student) => void;
  onEdit: (s: Student) => void;
  onCheckOut: (s: Student) => void;
  onDelete: (s: Student) => void;
  hasPendingDues: boolean;
  deletable: boolean;
  canEdit: boolean;
  canCheckOut: boolean;
  canDeletePerm: boolean;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleEdit = () => {
    suppressStudentTableRowClick();
    onEdit(student);
    handleClose();
  };

  const handleViewDetails = () => {
    suppressStudentTableRowClick();
    onViewDetails?.(student);
    handleClose();
  };

  const handleCheckOut = () => {
    suppressStudentTableRowClick();
    if (!hasPendingDues) onCheckOut(student);
    handleClose();
  };

  const handleDelete = () => {
    suppressStudentTableRowClick();
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
        onClose={() => {
          suppressStudentTableRowClick();
          handleClose();
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {onViewDetails && (
          <MenuItem onClick={handleViewDetails} sx={{ gap: 1 }}>
            <Eye className="h-4 w-4" />
            {t("RESIDENT_DETAILS_VIEW")}
          </MenuItem>
        )}
        <MenuItem
          onClick={handleEdit}
          disabled={!canEdit}
          sx={{ gap: 1 }}
          title={!canEdit ? "You don't have permission to edit residents" : undefined}
        >
          <Pencil className="h-4 w-4" />
          Edit
        </MenuItem>
        <MenuItem
          onClick={handleCheckOut}
          disabled={hasPendingDues || !canCheckOut}
          sx={{ gap: 1 }}
          title={
            !canCheckOut
              ? "You don't have permission to check out residents"
              : hasPendingDues
                ? t("CHECKOUT_DISABLED_DUES")
                : undefined
          }
        >
          <LogOut className="h-4 w-4" />
          {t("CHECK_OUT")}
        </MenuItem>
        <MenuItem
          onClick={handleDelete}
          disabled={!deletable || !canDeletePerm}
          sx={{ gap: 1 }}
          title={
            !canDeletePerm
              ? "You don't have permission to delete residents"
              : !deletable
                ? "Cannot delete resident with payment history"
                : undefined
          }
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
  canDelete: (student: Student) => boolean,
  onViewDetails: ((student: Student) => void) | undefined,
  caps: { canEdit: boolean; canCheckOut: boolean; canDelete: boolean }
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
  {
    accessorKey: "gender",
    header: "Gender",
    id: "gender",
    cell: ({ row }) => row.original.gender || "-",
  },
  { accessorKey: "email", header: "Email", id: "email", cell: ({ row }) => row.original.email || "-" },
  {
    accessorKey: "phone",
    header: "Phone",
    id: "phone",
    cell: ({ row }) => row.original.phone || "-",
  },
  {
    accessorKey: "emergency_contact_phone",
    header: "Emergency",
    id: "emergency_contact_phone",
    cell: ({ row }) => row.original.emergency_contact_phone || "-",
  },
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
    cell: ({ row }) => sqlDateOnlyToYmd(row.original.join_date) || "-",
  },
  {
    accessorKey: "security_deposit_amount",
    header: () => t("RESIDENT_SECURITY_DEPOSIT_TABLE"),
    id: "security_deposit_amount",
    cell: ({ row }) => {
      const v = row.original.security_deposit_amount;
      const n = v == null || v === "" ? 0 : Number(v);
      if (!Number.isFinite(n) || n <= 0) return "—";
      return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
    },
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
          onViewDetails={onViewDetails}
          onEdit={onEdit}
          onCheckOut={onCheckOut}
          onDelete={onDelete}
          hasPendingDues={hasPendingDues}
          deletable={deletable}
          canEdit={caps.canEdit}
          canCheckOut={caps.canCheckOut}
          canDeletePerm={caps.canDelete}
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
  {
    accessorKey: "gender",
    header: "Gender",
    id: "gender",
    cell: ({ row }) => (
      <span className="text-slate-600">{row.original.gender || "-"}</span>
    ),
  },
  { accessorKey: "email", header: "Email", id: "email", cell: ({ row }) => <span className="text-slate-600">{row.original.email || "-"}</span> },
  {
    accessorKey: "phone",
    header: "Phone",
    id: "phone",
    cell: ({ row }) => <span className="text-slate-600">{row.original.phone || "-"}</span>,
  },
  {
    accessorKey: "emergency_contact_phone",
    header: "Emergency",
    id: "emergency_contact_phone",
    cell: ({ row }) => (
      <span className="text-slate-600">{row.original.emergency_contact_phone || "-"}</span>
    ),
  },
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
        {sqlDateOnlyToYmd(row.original.join_date) || "-"}
      </span>
    ),
  },
  {
    accessorKey: "left_date",
    header: t("LEFT_DATE"),
    id: "left_date",
    cell: ({ row }) => (
      <span className="text-slate-600">
        {sqlDateOnlyToYmd(row.original.left_date) || "-"}
      </span>
    ),
  },
  {
    accessorKey: "security_deposit_amount",
    header: t("INACTIVE_DEPOSIT_SETTLED"),
    id: "inactive_deposit_total",
    cell: ({ row }) => {
      const v = row.original.security_deposit_amount;
      const n = v == null || v === "" ? 0 : Number(v);
      if (!Number.isFinite(n) || n <= 0) return <span className="text-slate-600">—</span>;
      return (
        <span className="text-slate-600">
          ₹{n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
        </span>
      );
    },
  },
  {
    accessorKey: "security_deposit_deduction",
    header: t("INACTIVE_DEPOSIT_DEDUCTION"),
    id: "inactive_deposit_deduction",
    cell: ({ row }) => {
      const v = row.original.security_deposit_deduction;
      const n = v == null || v === "" ? 0 : Number(v);
      if (!Number.isFinite(n) || n <= 0) return <span className="text-slate-600">—</span>;
      return (
        <span className="text-slate-600">
          ₹{n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
        </span>
      );
    },
  },
  {
    accessorKey: "security_deposit_refund",
    header: t("INACTIVE_DEPOSIT_REFUNDED"),
    id: "inactive_deposit_refund",
    cell: ({ row }) => {
      const v = row.original.security_deposit_refund;
      if (v == null || v === "") return <span className="text-slate-600">—</span>;
      const n = Number(v);
      if (!Number.isFinite(n)) return <span className="text-slate-600">—</span>;
      return (
        <span className="text-slate-600">
          ₹{n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
        </span>
      );
    },
  },
];
