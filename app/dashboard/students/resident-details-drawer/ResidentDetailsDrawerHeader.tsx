"use client";

import { Box, IconButton, Typography } from "@mui/material";
import { X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { t } from "@/lib/i18n";
import type { Student } from "../students.types";
import { initials } from "./residentDetailsDrawerUtils";

type ResidentDetailsDrawerHeaderProps = {
  student: Student;
  avatarUrl: string | null;
  onClose: () => void;
};

export const ResidentDetailsDrawerHeader = ({
  student,
  avatarUrl,
  onClose,
}: ResidentDetailsDrawerHeaderProps) => (
  <Box sx={{ flexShrink: 0, p: 2.5, borderBottom: "1px solid rgb(226 232 240)" }}>
    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
        <Avatar className="h-12 w-12 shrink-0">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
          <AvatarFallback>{initials(student.name)}</AvatarFallback>
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: "1.125rem", lineHeight: 1.2 }} noWrap>
            {student.name}
          </Typography>
          <Typography variant="body2" sx={{ color: "rgb(100 116 139)", mt: 0.25 }} noWrap>
            {student.room_number ? `${t("ROOM")} ${student.room_number}` : "—"}
            {student.course ? ` · ${student.course}` : ""}
          </Typography>
          <Typography variant="body2" sx={{ color: "rgb(100 116 139)", mt: 0.5 }} noWrap>
            {student.phone || "—"} · {student.email || "—"}
          </Typography>
        </Box>
      </Box>
      <IconButton size="small" onClick={onClose} aria-label={t("RESIDENT_DETAILS_CLOSE")}>
        <X size={20} />
      </IconButton>
    </Box>
  </Box>
);
