import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { ensureAdminRolesSchema } from "@/lib/ensureAdminRolesSchema";
import {
  canManageUsersAndRoles,
  getAccessibleHostelIdsForOwner,
  loadAdminByEmail,
  loadAdminForHostel,
} from "@/lib/adminAccess.server";
import { normalizePermissionsFromDb, parsePermissionsMatrix } from "@/lib/permissionMatrix";
import { getUsersRolesContextOrDenied } from "@/lib/dashboardPermission.server";
export { dynamic } from "@/lib/forceDynamicRoute";

export async function GET(request: NextRequest) {
  try {
    await ensureAdminRolesSchema();
    const gate = await getUsersRolesContextOrDenied(request, "view");
    if (gate instanceof NextResponse) return gate;
    const { ctx } = gate;

    if (ctx.mode === "hostel") {
      const { hostelId } = ctx;
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
    }

    const ownerId = ctx.ownerAdminId;
    const accessible = await getAccessibleHostelIdsForOwner(ownerId);
    const parts: string[] = ["(r.hostel_id IS NULL AND r.scope_owner_admin_id = ?)"];
    const params: unknown[] = [ownerId];
    if (accessible.length > 0) {
      parts.push(`r.hostel_id IN (${accessible.map(() => "?").join(",")})`);
      params.push(...accessible);
    }
    const where = parts.join(" OR ");

    const [rows] = await pool.execute(
      `SELECT r.id, r.name, r.description, r.permissions, r.created_at, r.hostel_id,
        (
          SELECT COUNT(*) FROM admins a
          WHERE a.role_id = r.id AND (
            (r.hostel_id IS NOT NULL AND a.hostel_id = r.hostel_id)
            OR (r.hostel_id IS NULL AND a.hostel_id IS NULL)
          )
        ) AS user_count
       FROM admin_roles r
       WHERE ${where}
       ORDER BY r.name ASC`,
      params
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
    const gate = await getUsersRolesContextOrDenied(request, "add");
    if (gate instanceof NextResponse) return gate;
    const { ctx } = gate;

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

      const [ownRows] = await pool.execute(
        `SELECT MIN(id) AS oid FROM admins WHERE hostel_id = ? AND COALESCE(is_owner, 0) = 1`,
        [hostelId]
      );
      const scopeOwner =
        ((ownRows as Array<{ oid: number | null }>)[0]?.oid as number | null | undefined) ?? null;

      const [result] = await pool.execute(
        `INSERT INTO admin_roles (hostel_id, scope_owner_admin_id, name, description, permissions)
         VALUES (?, ?, ?, ?, ?)`,
        [hostelId, scopeOwner, name, description || null, JSON.stringify(permissions)]
      );
      const insertId = (result as { insertId?: number }).insertId;
      return NextResponse.json({
        id: insertId,
        name,
        description,
        permissions,
      });
    }

    const ownerId = ctx.ownerAdminId;
    const actor = await loadAdminByEmail(ctx.email);
    if (!actor || !canManageUsersAndRoles(actor)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [dup] = await pool.execute(
      `SELECT id FROM admin_roles WHERE hostel_id IS NULL AND scope_owner_admin_id = ? AND LOWER(name) = LOWER(?) LIMIT 1`,
      [ownerId, name]
    );
    if ((dup as unknown[]).length > 0) {
      return NextResponse.json({ error: "A role with this name already exists" }, { status: 409 });
    }

    const [result] = await pool.execute(
      `INSERT INTO admin_roles (hostel_id, scope_owner_admin_id, name, description, permissions)
       VALUES (NULL, ?, ?, ?, ?)`,
      [ownerId, name, description || null, JSON.stringify(permissions)]
    );
    const insertId = (result as { insertId?: number }).insertId;
    return NextResponse.json({
      id: insertId,
      name,
      description,
      permissions,
    });
  } catch (e: unknown) {
    const err = e as { errno?: number; code?: string };
    if (err.errno === 1062 || err.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "A role with this name already exists" }, { status: 409 });
    }
    console.error("admin-roles POST", e);
    return NextResponse.json({ error: "Failed to create role" }, { status: 500 });
  }
}
