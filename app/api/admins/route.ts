import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { ensureAdminRolesSchema } from "@/lib/ensureAdminRolesSchema";
import {
  canManageUsersAndRoles,
  getHostelAndAdmin,
  loadAdminForHostel,
} from "@/lib/adminAccess.server";
import { parsePermissionsMatrix } from "@/lib/permissionMatrix";
import { assertDashboardPermission } from "@/lib/dashboardPermission.server";
export { dynamic } from "@/lib/forceDynamicRoute";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
const MOBILE_REGEX = /^[0-9]{10}$/;

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
      `SELECT a.id, a.name, a.email, a.mobile AS phone, a.is_active, a.is_owner, a.role_id,
        a.permissions_override,
        r.name AS role_name, h.name AS hostel_name
       FROM admins a
       LEFT JOIN admin_roles r ON r.id = a.role_id
       LEFT JOIN hostels h ON h.id = a.hostel_id
       WHERE a.hostel_id = ?
       ORDER BY a.id ASC`,
      [hostelId]
    );

    const users = (rows as Array<Record<string, unknown>>).map((r) => ({
      id: Number(r.id),
      name: String(r.name ?? ""),
      email: String(r.email ?? ""),
      phone: r.phone != null ? String(r.phone) : "",
      is_active: r.is_active === true || r.is_active === 1,
      is_owner: r.is_owner === true || r.is_owner === 1,
      role_id: r.role_id != null ? Number(r.role_id) : null,
      role_name: r.role_name != null ? String(r.role_name) : "",
      hostel_name: r.hostel_name != null ? String(r.hostel_name) : "",
      permissions_override: r.permissions_override ?? null,
    }));

    return NextResponse.json({ users });
  } catch (e) {
    console.error("admins GET", e);
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
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

    const [ins] = await pool.execute(
      `INSERT INTO admins (hostel_id, email, mobile, password_hash, name, is_owner, is_active, role_id, permissions_override)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)`,
      [hostelId, emailNew, phoneRaw, passwordHash, name, isActive ? 1 : 0, roleId, overrideJson]
    );
    const insertId = (ins as { insertId?: number }).insertId;

    return NextResponse.json({ id: insertId, email: emailNew, name });
  } catch (e) {
    console.error("admins POST", e);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
