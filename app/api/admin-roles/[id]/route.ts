import type { RowDataPacket } from "mysql2/promise";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { ensureAdminRolesSchema } from "@/lib/ensureAdminRolesSchema";
import {
  canManageUsersAndRoles,
  getHostelAndAdmin,
  loadAdminForHostel,
} from "@/lib/adminAccess.server";
import { parsePermissionsMatrix } from "@/lib/permissionMatrix";
import { assertDashboardPermission } from "@/lib/dashboardPermission.server";
export { dynamic } from "@/lib/forceDynamicRoute";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureAdminRolesSchema();
    const ctx = await getHostelAndAdmin(request);
    if ("error" in ctx) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status });
    }
    const { hostelId, email } = ctx;

    const deniedUpdate = await assertDashboardPermission(request, "users_roles", "edit");
    if (deniedUpdate) return deniedUpdate;

    const adminRow = await loadAdminForHostel(email, hostelId);
    if (!canManageUsersAndRoles(adminRow)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: rawId } = await params;
    const roleId = Number(rawId);
    if (!Number.isFinite(roleId) || roleId <= 0) {
      return NextResponse.json({ error: "Invalid role id" }, { status: 400 });
    }

    const [existing] = await pool.execute(
      `SELECT id FROM admin_roles WHERE id = ? AND hostel_id = ? LIMIT 1`,
      [roleId, hostelId]
    );
    if ((existing as unknown[]).length === 0) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    const body = await request.json();
    const name = String(body?.name ?? "").trim();
    const description = String(body?.description ?? "").trim();
    const permissions = parsePermissionsMatrix(body?.permissions);

    if (!name) {
      return NextResponse.json({ error: "Role name is required" }, { status: 400 });
    }

    await pool.execute(
      `UPDATE admin_roles SET name = ?, description = ?, permissions = ? WHERE id = ? AND hostel_id = ?`,
      [name, description || null, JSON.stringify(permissions), roleId, hostelId]
    );

    return NextResponse.json({ id: roleId, name, description, permissions });
  } catch (e: unknown) {
    const err = e as { errno?: number; code?: string };
    if (err.errno === 1062 || err.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "A role with this name already exists" }, { status: 409 });
    }
    console.error("admin-roles PATCH", e);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureAdminRolesSchema();
    const ctx = await getHostelAndAdmin(request);
    if ("error" in ctx) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status });
    }
    const { hostelId, email } = ctx;

    const deniedDelete = await assertDashboardPermission(request, "users_roles", "delete");
    if (deniedDelete) return deniedDelete;

    const adminRow = await loadAdminForHostel(email, hostelId);
    if (!canManageUsersAndRoles(adminRow)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: rawId } = await params;
    const roleId = Number(rawId);
    if (!Number.isFinite(roleId) || roleId <= 0) {
      return NextResponse.json({ error: "Invalid role id" }, { status: 400 });
    }

    const [existing] = await pool.execute(
      `SELECT id FROM admin_roles WHERE id = ? AND hostel_id = ? LIMIT 1`,
      [roleId, hostelId]
    );
    if ((existing as unknown[]).length === 0) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    const [countRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS n FROM admins WHERE role_id = ? AND hostel_id = ?`,
      [roleId, hostelId]
    );
    const assigned = Number((countRows as RowDataPacket[])[0]?.n ?? 0);
    if (assigned > 0) {
      return NextResponse.json(
        {
          error:
            assigned === 1
              ? "This role is assigned to 1 user. Reassign or remove them before deleting."
              : `This role is assigned to ${assigned} users. Reassign or remove them before deleting.`,
        },
        { status: 400 }
      );
    }

    await pool.execute(`DELETE FROM admin_roles WHERE id = ? AND hostel_id = ?`, [roleId, hostelId]);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("admin-roles DELETE", e);
    return NextResponse.json({ error: "Failed to delete role" }, { status: 500 });
  }
}
