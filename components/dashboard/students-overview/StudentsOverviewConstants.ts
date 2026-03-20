import { t } from "@/lib/i18n";

export type ColumnId = "name" | "room" | "course" | "joinDate" | "phone";

export const COLUMN_CONFIG: { id: ColumnId; label: string }[] = [
  { id: "name", label: t("NAME") },
  { id: "room", label: t("ROOM_LABEL") },
  { id: "course", label: t("COURSE") },
  { id: "joinDate", label: t("JOIN_DATE") },
  { id: "phone", label: t("PHONE") },
];
