import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAdminEmailFromRequest } from "@/lib/adminAccess.server";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
import {
  fullAccessMatrix,
  mergeEffectivePermissionMatrix,
  type CrudFlags,
  type PermissionModuleKey,
  type PermissionsMatrix,
} from "@/lib/permissionMatrix";

type AdminPermRow = {
  is_owner: number | boolean;
  is_active: number | boolean;
  role_id: number | null;
  permissions_override: unknown;
  role_permissions: unknown;
};

export const loadAdminPermissionRow = async (
  email: string,
  hostelId: number
): Promise<AdminPermRow | null> => {
  const [rows] = await pool.execute(
    `SELECT COALESCE(a.is_owner, 0) AS is_owner,
            COALESCE(a.is_active, 1) AS is_active,
            a.role_id,
            a.permissions_override,
            r.permissions AS role_permissions
     FROM admins a
     LEFT JOIN admin_roles r ON r.id = a.role_id
     WHERE LOWER(a.email) = LOWER(?) AND a.hostel_id = ?`,
    [email, hostelId]
  );
  const list = rows as AdminPermRow[];
  return list[0] ?? null;
};

/** Owner, or legacy admin with no role assigned — full access (matches pre-RBAC behaviour). */
export const hasFullPermissionBypass = (row: AdminPermRow | null): boolean => {
  if (!row) return false;
  const isOwner = row.is_owner === true || row.is_owner === 1;
  if (isOwner) return true;
  const noRole = row.role_id == null;
  return noRole;
};

export const effectivePermissionsForRow = (row: AdminPermRow | null): PermissionsMatrix => {
  if (!row || hasFullPermissionBypass(row)) return fullAccessMatrix();
  return mergeEffectivePermissionMatrix(row.role_permissions, row.permissions_override);
};

export const adminMay = async (
  email: string,
  hostelId: number,
  module: PermissionModuleKey,
  operation: keyof CrudFlags
): Promise<boolean> => {
  const row = await loadAdminPermissionRow(email, hostelId);
  if (!row) return false;
  const active = row.is_active === true || row.is_active === 1;
  if (!active) return false;
  if (hasFullPermissionBypass(row)) return true;
  const eff = effectivePermissionsForRow(row);
  return Boolean(eff[module]?.[operation]);
};

/**
 * Returns a 403/401 NextResponse if denied, otherwise null (caller continues).
 * When `hostelId` header is missing, returns null (routes that treat missing tenant as empty data).
 */
export const assertDashboardPermission = async (
  request: NextRequest,
  module: PermissionModuleKey,
  operation: keyof CrudFlags
): Promise<NextResponse | null> => {
  const hostelId = getHostelIdFromRequest(request);
  if (hostelId == null) return null;

  const email = getAdminEmailFromRequest(request);
  if (!email) {
    return NextResponse.json({ error: "Admin identity required" }, { status: 401 });
  }

  const ok = await adminMay(email, hostelId, module, operation);
  if (!ok) {
    return NextResponse.json({ error: "Forbidden", module, operation }, { status: 403 });
  }
  return null;
};
