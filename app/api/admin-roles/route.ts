import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { ensureAdminRolesSchema } from "@/lib/ensureAdminRolesSchema";
import {
  canManageUsersAndRoles,
  getHostelAndAdmin,
  loadAdminForHostel,
} from "@/lib/adminAccess.server";
import { normalizePermissionsFromDb, parsePermissionsMatrix } from "@/lib/permissionMatrix";
import { assertDashboardPermission } from "@/lib/dashboardPermission.server";
export { dynamic } from "@/lib/forceDynamicRoute";

export async function GET(request: NextRequest) {
  try {
    await ensureAdminRolesSchema();
    const ctx = await getHostelAndAdmin(request);
    if ("error" in ctx) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status });
    }
    const { hostelId } = ctx;

    const deniedList = await assertDashboardPermission(request, "users_roles", "view");
    if (deniedList) return deniedList;

    const [rows] = await pool.execute(
      `SELECT r.id, r.name, r.description, r.permissions, r.created_at,
        (SELECT COUNT(*) FROM admins a WHERE a.role_id = r.id AND a.hostel_id = r.hostel_id) AS user_count
       FROM admin_roles r
       WHERE r.hostel_id = ?
       ORDER BY r.name ASC`,
      [hostelId]
    );

    const list = (rows as Array<Record<string, unknown>>).map((r) => ({
      id: Number(r.id),
      name: String(r.name ?? ""),
      description: r.description != null ? String(r.description) : "",
      permissions: normalizePermissionsFromDb(r.permissions),
      user_count: Number(r.user_count ?? 0),
      created_at: String(r.created_at ?? ""),
    }));

    return NextResponse.json({ roles: list });
  } catch (e) {
    console.error("admin-roles GET", e);
    return NextResponse.json({ error: "Failed to load roles" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureAdminRolesSchema();
    const ctx = await getHostelAndAdmin(request);
    if ("error" in ctx) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status });
    }
    const { hostelId, email } = ctx;

    const deniedCreate = await assertDashboardPermission(request, "users_roles", "add");
    if (deniedCreate) return deniedCreate;

    const adminRow = await loadAdminForHostel(email, hostelId);
    if (!canManageUsersAndRoles(adminRow)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const name = String(body?.name ?? "").trim();
    const description = String(body?.description ?? "").trim();
    const permissions = parsePermissionsMatrix(body?.permissions);

    if (!name) {
      return NextResponse.json({ error: "Role name is required" }, { status: 400 });
    }

    const [result] = await pool.execute(
      `INSERT INTO admin_roles (hostel_id, name, description, permissions)
       VALUES (?, ?, ?, ?)`,
      [hostelId, name, description || null, JSON.stringify(permissions)]
    );
    const insertId = (result as { insertId?: number }).insertId;
    return NextResponse.json({
      id: insertId,
      name,
      description,
      permissions,
    });
  } catch (e: unknown) {
    const err = e as { errno?: number; code?: string; message?: string };
    if (err.errno === 1062 || err.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "A role with this name already exists" }, { status: 409 });
    }
    console.error("admin-roles POST", e);
    return NextResponse.json({ error: "Failed to create role" }, { status: 500 });
  }
}
