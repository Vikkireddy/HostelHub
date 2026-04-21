import type { NextRequest } from "next/server";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";

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
};

export const loadAdminForHostel = async (
  email: string,
  hostelId: number
): Promise<AdminAccessRow | null> => {
  const [rows] = await pool.execute(
    `SELECT id, email, name, hostel_id, is_owner, is_active, role_id
     FROM admins
     WHERE LOWER(email) = LOWER(?) AND hostel_id = ?`,
    [email, hostelId]
  );
  const list = rows as AdminAccessRow[];
  return list[0] ?? null;
};

/** Hostel primary account (signup owner) — only this user may create roles and staff admins. */
export const canManageUsersAndRoles = (row: AdminAccessRow | null): boolean => {
  if (!row) return false;
  const active = row.is_active === true || row.is_active === 1;
  if (!active) return false;
  return row.is_owner === true || row.is_owner === 1;
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
