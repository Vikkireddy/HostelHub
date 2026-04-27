import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
const MOBILE_REGEX = /^[0-9]{10}$/;

function mapAdminRows(rows: Array<Record<string, unknown>>) {
  return rows.map((r) => ({
    id: Number(r.id),
    name: String(r.name ?? ""),
    email: String(r.email ?? ""),
    phone: r.phone != null ? String(r.phone) : "",
    is_active: r.is_active === true || r.is_active === 1,
    is_owner: r.is_owner === true || r.is_owner === 1,
    role_id: r.role_id != null ? Number(r.role_id) : null,
    role_name: r.role_name != null ? String(r.role_name) : "",
    hostel_id: r.hostel_id != null && Number.isFinite(Number(r.hostel_id)) ? Number(r.hostel_id) : null,
    hostel_name: r.hostel_name != null ? String(r.hostel_name) : "",
    permissions_override: r.permissions_override ?? null,
  }));
}

export async function GET(request: NextRequest) {
  try {
    await ensureAdminRolesSchema();
    const gate = await getUsersRolesContextOrDenied(request, "view");
    if (gate instanceof NextResponse) return gate;
    const { ctx } = gate;

    if (ctx.mode === "hostel") {
      const { hostelId } = ctx;
      const [rows] = await pool.execute(
        `SELECT a.id, a.name, a.email, a.mobile AS phone, a.is_active, a.is_owner, a.role_id,
          a.hostel_id,
          a.permissions_override,
          r.name AS role_name, h.name AS hostel_name
         FROM admins a
         LEFT JOIN admin_roles r ON r.id = a.role_id
         LEFT JOIN hostels h ON h.id = a.hostel_id
         WHERE a.hostel_id = ?
         ORDER BY a.id ASC`,
        [hostelId]
      );
      return NextResponse.json({ users: mapAdminRows(rows as Array<Record<string, unknown>>) });
    }

    const ownerId = ctx.ownerAdminId;
    const accessible = await getAccessibleHostelIdsForOwner(ownerId);
    const parts: string[] = ["a.id = ?"];
    const params: unknown[] = [ownerId];
    if (accessible.length > 0) {
      parts.push(`a.hostel_id IN (${accessible.map(() => "?").join(",")})`);
      params.push(...accessible);
    }
    parts.push(`(
      a.hostel_id IS NULL AND COALESCE(a.is_owner, 0) = 0 AND a.role_id IN (
        SELECT r2.id FROM admin_roles r2
        WHERE r2.hostel_id IS NULL AND r2.scope_owner_admin_id = ?
      )
    )`);
    params.push(ownerId);

    const [rows] = await pool.execute(
      `SELECT a.id, a.name, a.email, a.mobile AS phone, a.is_active, a.is_owner, a.role_id,
        a.hostel_id,
        a.permissions_override,
        r.name AS role_name, h.name AS hostel_name
       FROM admins a
       LEFT JOIN admin_roles r ON r.id = a.role_id
       LEFT JOIN hostels h ON h.id = a.hostel_id
       WHERE ${parts.join(" OR ")}
       ORDER BY a.id ASC`,
      params
    );

    return NextResponse.json({ users: mapAdminRows(rows as Array<Record<string, unknown>>) });
  } catch (e) {
    console.error("admins GET", e);
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
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
    const phoneRaw = String(body?.phone ?? "").trim();
    const emailNew = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");
    const confirmPassword = String(body?.confirmPassword ?? "");
    const roleId = Number(body?.roleId);
    const isActive = body?.isActive !== false;
    const override = body?.permissionsOverride;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!MOBILE_REGEX.test(phoneRaw)) {
      return NextResponse.json({ error: "Phone must be 10 digits" }, { status: 400 });
    }
    if (!EMAIL_REGEX.test(emailNew)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
    if (!PASSWORD_REGEX.test(password)) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character",
        },
        { status: 400 }
      );
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }
    if (!Number.isFinite(roleId) || roleId <= 0) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    if (ctx.mode === "hostel") {
      const { hostelId, email } = ctx;

      const adminRow = await loadAdminForHostel(email, hostelId);
      if (!canManageUsersAndRoles(adminRow)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const [roleRows] = await pool.execute(
        `SELECT id FROM admin_roles WHERE id = ? AND hostel_id = ?`,
        [roleId, hostelId]
      );
      if ((roleRows as unknown[]).length === 0) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }

      const [emailDup] = await pool.execute(`SELECT id FROM admins WHERE LOWER(email) = ?`, [
        emailNew,
      ]);
      if ((emailDup as unknown[]).length > 0) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 }
        );
      }

      const [mobileDup] = await pool.execute(`SELECT id FROM admins WHERE mobile = ?`, [phoneRaw]);
      if ((mobileDup as unknown[]).length > 0) {
        return NextResponse.json(
          { error: "An account with this mobile number already exists" },
          { status: 409 }
        );
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const overrideJson =
        override && typeof override === "object"
          ? JSON.stringify(parsePermissionsMatrix(override))
          : null;

      const actor = await loadAdminForHostel(email, hostelId);
      const managementMode = String(actor?.management_mode ?? "single").toLowerCase() === "multi" ? "multi" : "single";

      const [ins] = await pool.execute(
        `INSERT INTO admins (hostel_id, email, mobile, password_hash, name, is_owner, is_active, role_id, permissions_override, management_mode)
         VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`,
        [hostelId, emailNew, phoneRaw, passwordHash, name, isActive ? 1 : 0, roleId, overrideJson, managementMode]
      );
      const insertId = (ins as { insertId?: number }).insertId;
      return NextResponse.json({ id: insertId, email: emailNew, name });
    }

    const ownerId = ctx.ownerAdminId;
    const actor = await loadAdminByEmail(ctx.email);
    if (!actor || !canManageUsersAndRoles(actor)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const rawAssign = body?.assignHostelId;
    let assignHostelId: number | null = null;
    if (rawAssign != null && rawAssign !== "") {
      assignHostelId = Number(rawAssign);
      if (!Number.isFinite(assignHostelId) || assignHostelId <= 0) {
        return NextResponse.json({ error: "Invalid hostel assignment" }, { status: 400 });
      }
      const accessible = await getAccessibleHostelIdsForOwner(ownerId);
      if (!accessible.includes(assignHostelId)) {
        return NextResponse.json({ error: "Invalid hostel assignment" }, { status: 400 });
      }
    }

    let roleOk = false;
    if (assignHostelId == null) {
      const [rr] = await pool.execute(
        `SELECT id FROM admin_roles WHERE id = ? AND hostel_id IS NULL AND scope_owner_admin_id = ?`,
        [roleId, ownerId]
      );
      roleOk = (rr as unknown[]).length > 0;
    } else {
      const [rr] = await pool.execute(
        `SELECT id FROM admin_roles WHERE id = ? AND (
           (hostel_id = ? AND hostel_id IS NOT NULL)
           OR (hostel_id IS NULL AND scope_owner_admin_id = ?)
         )`,
        [roleId, assignHostelId, ownerId]
      );
      roleOk = (rr as unknown[]).length > 0;
    }
    if (!roleOk) {
      return NextResponse.json({ error: "Invalid role for this assignment" }, { status: 400 });
    }

    const [emailDup] = await pool.execute(`SELECT id FROM admins WHERE LOWER(email) = ?`, [emailNew]);
    if ((emailDup as unknown[]).length > 0) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const [mobileDup] = await pool.execute(`SELECT id FROM admins WHERE mobile = ?`, [phoneRaw]);
    if ((mobileDup as unknown[]).length > 0) {
      return NextResponse.json(
        { error: "An account with this mobile number already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const overrideJson =
      override && typeof override === "object"
        ? JSON.stringify(parsePermissionsMatrix(override))
        : null;

    const managementMode = String(actor.management_mode ?? "single").toLowerCase() === "multi" ? "multi" : "single";

    const [ins] = await pool.execute(
      `INSERT INTO admins (hostel_id, email, mobile, password_hash, name, is_owner, is_active, role_id, permissions_override, management_mode)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`,
      [
        assignHostelId,
        emailNew,
        phoneRaw,
        passwordHash,
        name,
        isActive ? 1 : 0,
        roleId,
        overrideJson,
        managementMode,
      ]
    );
    const insertId = (ins as { insertId?: number }).insertId;

    return NextResponse.json({ id: insertId, email: emailNew, name });
  } catch (e) {
    console.error("admins POST", e);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
