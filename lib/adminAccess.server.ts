import type { NextRequest } from "next/server";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
import { ensureMultiHostelSchema } from "@/lib/ensureMultiHostelSchema";

export const getAdminEmailFromRequest = (request: NextRequest): string | null => {
  const v = request.headers.get("x-admin-email")?.trim().toLowerCase();
  return v || null;
};

export type AdminAccessRow = {
  id: number;
  email: string;
  name: string;
  hostel_id: number | null;
  is_owner: number | boolean;
  is_active: number | boolean;
  role_id: number | null;
  management_mode?: string | null;
};

export type AccessibleHostelRow = {
  id: number;
  name: string;
  city: string | null;
  state: string | null;
  is_active_hostel: number;
};

export const loadAdminForHostel = async (
  email: string,
  hostelId: number
): Promise<AdminAccessRow | null> => {
  await ensureMultiHostelSchema();
  const [rows] = await pool.execute(
    `SELECT a.id, a.email, a.name, a.hostel_id, a.is_owner, a.is_active, a.role_id, a.management_mode
     FROM admins a
     WHERE LOWER(a.email) = LOWER(?)
       AND (
         a.hostel_id = ?
         OR EXISTS (
           SELECT 1 FROM admin_hostels ah
           WHERE ah.admin_id = a.id AND ah.hostel_id = ?
         )
       )
     LIMIT 1`,
    [email, hostelId, hostelId]
  );
  const list = rows as AdminAccessRow[];
  return list[0] ?? null;
};

/** Owner / staff row by email (first match — emails are unique per account). */
export const loadAdminByEmail = async (email: string): Promise<AdminAccessRow | null> => {
  await ensureMultiHostelSchema();
  const [rows] = await pool.execute(
    `SELECT id, email, name, hostel_id, is_owner, is_active, role_id, management_mode
     FROM admins
     WHERE LOWER(email) = LOWER(?)
     LIMIT 1`,
    [email]
  );
  const list = rows as AdminAccessRow[];
  return list[0] ?? null;
};

export const listAccessibleHostelsForAdmin = async (
  adminId: number
): Promise<AccessibleHostelRow[]> => {
  await ensureMultiHostelSchema();
  const [rows] = await pool.execute(
    `SELECT h.id, h.name, h.city, h.state, COALESCE(h.is_active_hostel, 1) AS is_active_hostel
     FROM hostels h
     INNER JOIN (
       SELECT hostel_id AS hid FROM admins WHERE id = ? AND hostel_id IS NOT NULL
       UNION
       SELECT hostel_id AS hid FROM admin_hostels WHERE admin_id = ?
     ) x ON x.hid = h.id
     ORDER BY h.name ASC`,
    [adminId, adminId]
  );
  return rows as AccessibleHostelRow[];
};

/** Hostel primary account (signup owner) — only this user may create roles and staff admins. */
export const canManageUsersAndRoles = (row: AdminAccessRow | null): boolean => {
  if (!row) return false;
  const active = row.is_active === true || row.is_active === 1;
  if (!active) return false;
  const owner = row.is_owner === true || row.is_owner === 1;
  if (!owner) return false;
  if (row.hostel_id != null) return true;
  const mode = (row.management_mode ?? "single").toLowerCase();
  return mode === "multi";
};

export const getHostelAndAdmin = async (
  request: NextRequest
): Promise<{ hostelId: number; email: string } | { error: string; status: number }> => {
  const hostelId = getHostelIdFromRequest(request);
  if (hostelId == null) {
    return { error: "Hostel context required", status: 401 };
  }
  const email = getAdminEmailFromRequest(request);
  if (!email) {
    return { error: "Admin identity required", status: 401 };
  }
  return { hostelId, email };
};

export type UsersRolesRequestContext =
  | { mode: "hostel"; hostelId: number; email: string }
  | { mode: "portfolio"; email: string; ownerAdminId: number };

/**
 * Resolves hostel-scoped vs portfolio (no X-Hostel-Id) context for Users & Roles.
 * Portfolio mode is only allowed for accounts that may manage users/roles without a selected hostel (multi-hostel owner).
 */
export async function resolveUsersRolesRequestContext(
  request: NextRequest
): Promise<UsersRolesRequestContext | { error: string; status: number }> {
  const email = getAdminEmailFromRequest(request);
  if (!email) {
    return { error: "Admin identity required", status: 401 };
  }
  const rawHostelId = getHostelIdFromRequest(request);
  if (rawHostelId != null) {
    return { mode: "hostel", hostelId: rawHostelId, email };
  }
  const row = await loadAdminByEmail(email);
  if (!row || !canManageUsersAndRoles(row)) {
    return { error: "Forbidden", status: 403 };
  }
  return { mode: "portfolio", email, ownerAdminId: row.id };
}

/** Hostel ids the portfolio owner may manage (primary + admin_hostels). */
export async function getAccessibleHostelIdsForOwner(ownerAdminId: number): Promise<number[]> {
  await ensureMultiHostelSchema();
  const [rows] = await pool.execute(
    `SELECT DISTINCT x.hid AS id FROM (
       SELECT hostel_id AS hid FROM admin_hostels WHERE admin_id = ?
       UNION
       SELECT hostel_id AS hid FROM admins WHERE id = ? AND hostel_id IS NOT NULL
     ) x
     WHERE x.hid IS NOT NULL`,
    [ownerAdminId, ownerAdminId]
  );
  return (rows as { id: number }[]).map((r) => Number(r.id));
}

/** Admin row visible to a portfolio owner on Users & Roles (no selected hostel). */
export async function findAdminVisibleToPortfolioOwner(
  ownerAdminId: number,
  targetAdminId: number
): Promise<{
  id: number;
  is_owner: number | boolean;
  role_id: number | null;
  hostel_id: number | null;
} | null> {
  const accessible = await getAccessibleHostelIdsForOwner(ownerAdminId);
  const parts: string[] = ["a.id = ?"];
  const innerParams: unknown[] = [ownerAdminId];
  if (accessible.length > 0) {
    parts.push(`a.hostel_id IN (${accessible.map(() => "?").join(",")})`);
    innerParams.push(...accessible);
  }
  parts.push(`(
    a.hostel_id IS NULL AND COALESCE(a.is_owner, 0) = 0 AND a.role_id IN (
      SELECT r2.id FROM admin_roles r2
      WHERE r2.hostel_id IS NULL AND r2.scope_owner_admin_id = ?
    )
  )`);
  innerParams.push(ownerAdminId);
  const [rows] = await pool.execute(
    `SELECT a.id, a.is_owner, a.role_id, a.hostel_id FROM admins a
     WHERE a.id = ? AND (${parts.join(" OR ")}) LIMIT 1`,
    [targetAdminId, ...innerParams]
  );
  const list = rows as Array<{
    id: number;
    is_owner: number | boolean;
    role_id: number | null;
    hostel_id: number | null;
  }>;
  return list[0] ?? null;
}
