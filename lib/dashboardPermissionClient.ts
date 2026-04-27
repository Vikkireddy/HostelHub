import type { AuthUser } from "@/lib/AuthStore";
import type { CrudFlags, PermissionModuleKey, PermissionsMatrix } from "@/lib/permissionMatrix";

/** Sessions from before permissions were added have no matrix — keep prior behaviour (full UI). */
const hasPermissionsPayload = (user: AuthUser): user is AuthUser & { permissions: PermissionsMatrix } =>
  user.permissions != null && typeof user.permissions === "object";

/** Owner on multi-hostel dashboard with "All Hostels" — no single `hostelId` in session yet. */
const isMultiOwnerAllHostelsView = (user: AuthUser | null): boolean =>
  Boolean(
    user?.isOwner &&
      user.managementMode === "multi" &&
      user.hostelId == null
  );

export const hasDashboardPermission = (
  user: AuthUser | null,
  module: PermissionModuleKey,
  operation: keyof CrudFlags
): boolean => {
  if (!user) return false;
  if (isMultiOwnerAllHostelsView(user)) return true;
  if (!user.hostelId) return false;
  if (user.isOwner) return true;
  if (!hasPermissionsPayload(user)) return true;
  return Boolean(user.permissions[module]?.[operation]);
};

/** For nav: at least one actionable permission, or view, for a module. */
export const canSeeModuleNav = (user: AuthUser | null, module: PermissionModuleKey): boolean => {
  if (!user) return false;
  if (isMultiOwnerAllHostelsView(user)) return true;
  if (!user.hostelId) return false;
  if (user.isOwner) return true;
  if (!hasPermissionsPayload(user)) return true;
  const c = user.permissions[module];
  if (!c) return false;
  return c.view || c.add || c.edit || c.delete;
};
