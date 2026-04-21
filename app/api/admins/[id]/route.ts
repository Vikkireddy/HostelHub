import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { ensureAdminRolesSchema } from "@/lib/ensureAdminRolesSchema";
import {
  canManageUsersAndRoles,
  getHostelAndAdmin,
  loadAdminForHostel,
} from "@/lib/adminAccess.server";
import { assertDashboardPermission } from "@/lib/dashboardPermission.server";
import { parsePermissionsMatrix } from "@/lib/permissionMatrix";
import bcrypt from "bcryptjs";
export { dynamic } from "@/lib/forceDynamicRoute";

const MOBILE_REGEX = /^[0-9]{10}$/;
const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

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

    const denied = await assertDashboardPermission(request, "users_roles", "edit");
    if (denied) return denied;

    const actor = await loadAdminForHostel(email, hostelId);
    if (!canManageUsersAndRoles(actor)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: rawId } = await params;
    const targetId = Number(rawId);
    if (!Number.isFinite(targetId) || targetId <= 0) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const [targetRows] = await pool.execute(
      `SELECT id, is_owner, role_id FROM admins WHERE id = ? AND hostel_id = ? LIMIT 1`,
      [targetId, hostelId]
    );
    const targets = targetRows as Array<{ id: number; is_owner: number | boolean; role_id: number | null }>;
    const target = targets[0];
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const targetIsOwner = target.is_owner === true || target.is_owner === 1;

    const body = await request.json();
    const name = String(body?.name ?? "").trim();
    const phoneRaw = String(body?.phone ?? "").trim();
    const roleId = Number(body?.roleId);
    const isActive = body?.isActive !== false;
    const overrideRaw = body?.permissionsOverride;
    const password = String(body?.password ?? "");
    const confirmPassword = String(body?.confirmPassword ?? "");

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!MOBILE_REGEX.test(phoneRaw)) {
      return NextResponse.json({ error: "Phone must be 10 digits" }, { status: 400 });
    }

    if (!targetIsOwner) {
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
    }

    let passwordHash: string | null = null;
    if (password || confirmPassword) {
      if (!password || !confirmPassword) {
        return NextResponse.json(
          { error: "Enter both new password and confirmation, or leave both blank" },
          { status: 400 }
        );
      }
      if (password !== confirmPassword) {
        return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
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
      passwordHash = await bcrypt.hash(password, 10);
    }

    if (targetIsOwner) {
      if (passwordHash) {
        await pool.execute(
          `UPDATE admins SET name = ?, mobile = ?, is_active = ?, password_hash = ? WHERE id = ? AND hostel_id = ?`,
          [name, phoneRaw, isActive ? 1 : 0, passwordHash, targetId, hostelId]
        );
      } else {
        await pool.execute(
          `UPDATE admins SET name = ?, mobile = ?, is_active = ? WHERE id = ? AND hostel_id = ?`,
          [name, phoneRaw, isActive ? 1 : 0, targetId, hostelId]
        );
      }
    } else {
      const overrideJson =
        overrideRaw === null
          ? null
          : typeof overrideRaw === "object" && !Array.isArray(overrideRaw)
            ? JSON.stringify(parsePermissionsMatrix(overrideRaw))
            : null;

      if (passwordHash) {
        await pool.execute(
          `UPDATE admins SET name = ?, mobile = ?, is_active = ?, role_id = ?, permissions_override = ?, password_hash = ?
           WHERE id = ? AND hostel_id = ?`,
          [name, phoneRaw, isActive ? 1 : 0, roleId, overrideJson, passwordHash, targetId, hostelId]
        );
      } else {
        await pool.execute(
          `UPDATE admins SET name = ?, mobile = ?, is_active = ?, role_id = ?, permissions_override = ?
           WHERE id = ? AND hostel_id = ?`,
          [name, phoneRaw, isActive ? 1 : 0, roleId, overrideJson, targetId, hostelId]
        );
      }
    }

    return NextResponse.json({ success: true, id: targetId });
  } catch (e) {
    console.error("admins PATCH", e);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
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

    const denied = await assertDashboardPermission(request, "users_roles", "delete");
    if (denied) return denied;

    const actor = await loadAdminForHostel(email, hostelId);
    if (!canManageUsersAndRoles(actor)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: rawId } = await params;
    const targetId = Number(rawId);
    if (!Number.isFinite(targetId) || targetId <= 0) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    if (actor?.id === targetId) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    const [rows] = await pool.execute(
      `SELECT id, is_owner FROM admins WHERE id = ? AND hostel_id = ? LIMIT 1`,
      [targetId, hostelId]
    );
    const list = rows as Array<{ id: number; is_owner: number | boolean }>;
    const target = list[0];
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const isOwner = target.is_owner === true || target.is_owner === 1;
    if (isOwner) {
      return NextResponse.json({ error: "The hostel owner account cannot be deleted" }, { status: 400 });
    }

    await pool.execute(`DELETE FROM admins WHERE id = ? AND hostel_id = ?`, [targetId, hostelId]);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("admins DELETE", e);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
