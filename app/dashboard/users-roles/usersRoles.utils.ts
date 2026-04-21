import { t } from "@/lib/i18n";
import {
  countModulesWithAnyPermission,
  isFullAccessMatrix,
  type PermissionsMatrix,
} from "@/lib/permissionMatrix";

const ROLE_BADGE_CLASSES = [
  "bg-blue-100 text-blue-800 border-blue-200",
  "bg-violet-100 text-violet-800 border-violet-200",
  "bg-amber-100 text-amber-900 border-amber-200",
  "bg-emerald-100 text-emerald-900 border-emerald-200",
  "bg-slate-100 text-slate-800 border-slate-200",
  "bg-rose-100 text-rose-900 border-rose-200",
];

export const initials = (name: string) =>
  (name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const roleBadgeClass = (label: string) => {
  let h = 0;
  for (let i = 0; i < label.length; i++) h = (h + label.charCodeAt(i) * 31) % 1009;
  return ROLE_BADGE_CLASSES[h % ROLE_BADGE_CLASSES.length];
};

export const permissionMatrixSummary = (m: PermissionsMatrix) => {
  if (isFullAccessMatrix(m)) return t("USERS_ROLES_PERMS_ALL_MODULES");
  const n = countModulesWithAnyPermission(m);
  return t("USERS_ROLES_PERMS_N_MODULES", { n });
};
