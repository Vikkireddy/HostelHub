import type { RowDataPacket } from "mysql2/promise";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { ensureAdminRolesSchema } from "@/lib/ensureAdminRolesSchema";
import {
  canManageUsersAndRoles,
  getAccessibleHostelIdsForOwner,
  loadAdminByEmail,
  loadAdminForHostel,
} from "@/lib/adminAccess.server";
import { parsePermissionsMatrix } from "@/lib/permissionMatrix";
import { getUsersRolesContextOrDenied } from "@/lib/dashboardPermission.server";
export { dynamic } from "@/lib/forceDynamicRoute";

async function findPortfolioRoleRow(ownerId: number, roleId: number): Promise<{ id: number; hostel_id: number | null } | null> {
  const accessible = await getAccessibleHostelIdsForOwner(ownerId);
  const parts: string[] = ["(r.hostel_id IS NULL AND r.scope_owner_admin_id = ?)"];
  const params: unknown[] = [ownerId];
  if (accessible.length > 0) {
    parts.push(`r.hostel_id IN (${accessible.map(() => "?").join(",")})`);
    params.push(...accessible);
  }
  const where = parts.join(" OR ");
  const [rows] = await pool.execute(
    `SELECT r.id, r.hostel_id FROM admin_roles r WHERE r.id = ? AND (${where}) LIMIT 1`,
    [roleId, ...params]
  );
  const list = rows as Array<{ id: number; hostel_id: number | null }>;
  return list[0] ?? null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureAdminRolesSchema();
    const gate = await getUsersRolesContextOrDenied(request, "edit");
    if (gate instanceof NextResponse) return gate;
    const { ctx } = gate;

    const { id: rawId } = await params;
    const roleId = Number(rawId);
    if (!Number.isFinite(roleId) || roleId <= 0) {
      return NextResponse.json({ error: "Invalid role id" }, { status: 400 });
    }

    const body = await request.json();
    const name = String(body?.name ?? "").trim();
    const description = String(body?.description ?? "").trim();
    const permissions = parsePermissionsMatrix(body?.permissions);

    if (!name) {
      return NextResponse.json({ error: "Role name is required" }, { status: 400 });
    }

    if (ctx.mode === "hostel") {
      const { hostelId, email } = ctx;
      const adminRow = await loadAdminForHostel(email, hostelId);
      if (!canManageUsersAndRoles(adminRow)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const [existing] = await pool.execute(
        `SELECT id FROM admin_roles WHERE id = ? AND hostel_id = ? LIMIT 1`,
        [roleId, hostelId]
      );
      if ((existing as unknown[]).length === 0) {
        return NextResponse.json({ error: "Role not found" }, { status: 404 });
      }

      await pool.execute(
        `UPDATE admin_roles SET name = ?, description = ?, permissions = ? WHERE id = ? AND hostel_id = ?`,
        [name, description || null, JSON.stringify(permissions), roleId, hostelId]
      );

      return NextResponse.json({ id: roleId, name, description, permissions });
    }

    const ownerId = ctx.ownerAdminId;
    const actor = await loadAdminByEmail(ctx.email);
    if (!actor || !canManageUsersAndRoles(actor)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const row = await findPortfolioRoleRow(ownerId, roleId);
    if (!row) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    if (row.hostel_id == null) {
      const [dup] = await pool.execute(
        `SELECT id FROM admin_roles WHERE id <> ? AND hostel_id IS NULL AND scope_owner_admin_id = ? AND LOWER(name) = LOWER(?) LIMIT 1`,
        [roleId, ownerId, name]
      );
      if ((dup as unknown[]).length > 0) {
        return NextResponse.json({ error: "A role with this name already exists" }, { status: 409 });
      }
    }

    await pool.execute(
      `UPDATE admin_roles SET name = ?, description = ?, permissions = ? WHERE id = ?`,
      [name, description || null, JSON.stringify(permissions), roleId]
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
    const gate = await getUsersRolesContextOrDenied(request, "delete");
    if (gate instanceof NextResponse) return gate;
    const { ctx } = gate;

    const { id: rawId } = await params;
    const roleId = Number(rawId);
    if (!Number.isFinite(roleId) || roleId <= 0) {
      return NextResponse.json({ error: "Invalid role id" }, { status: 400 });
    }

    if (ctx.mode === "hostel") {
      const { hostelId, email } = ctx;
      const adminRow = await loadAdminForHostel(email, hostelId);
      if (!canManageUsersAndRoles(adminRow)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
    }

    const ownerId = ctx.ownerAdminId;
    const actor = await loadAdminByEmail(ctx.email);
    if (!actor || !canManageUsersAndRoles(actor)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const row = await findPortfolioRoleRow(ownerId, roleId);
    if (!row) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    const countSql =
      row.hostel_id == null
        ? `SELECT COUNT(*) AS n FROM admins WHERE role_id = ? AND hostel_id IS NULL`
        : `SELECT COUNT(*) AS n FROM admins WHERE role_id = ? AND hostel_id = ?`;
    const countParams = row.hostel_id == null ? [roleId] : [roleId, row.hostel_id];
    const [countRows] = await pool.execute<RowDataPacket[]>(countSql, countParams);
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

    await pool.execute(`DELETE FROM admin_roles WHERE id = ?`, [roleId]);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("admin-roles DELETE", e);
    return NextResponse.json({ error: "Failed to delete role" }, { status: 500 });
  }
}
