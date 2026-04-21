import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { ensureAdminRolesSchema } from "@/lib/ensureAdminRolesSchema";
import { fullAccessMatrix, mergeEffectivePermissionMatrix } from "@/lib/permissionMatrix";

/** Match signup storage: 10 digits; accept +91 / leading 0 / spaces from the login field. */
function normalizeLoginIdentifier(raw: string): { email: string | null; mobile: string | null } {
  const trimmed = raw.trim();
  if (trimmed.includes("@")) {
    return { email: trimmed.toLowerCase(), mobile: null };
  }
  const digits = trimmed.replace(/\D/g, "");
  let mobile: string | null = null;
  if (digits.length === 12 && digits.startsWith("91")) {
    mobile = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    mobile = digits.slice(1);
  } else if (digits.length === 10) {
    mobile = digits;
  } else if (digits.length > 0) {
    mobile = digits;
  }
  return { email: null, mobile };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailOrPhone, password } = body;

    if (!emailOrPhone || !password) {
      return NextResponse.json(
        { success: false, message: "Email/phone and password are required" },
        { status: 400 }
      );
    }

    const { email, mobile } = normalizeLoginIdentifier(String(emailOrPhone));
    const isEmail = email !== null;

    if (!isEmail && (!mobile || mobile.length !== 10)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid email or 10-digit mobile number" },
        { status: 400 }
      );
    }

    await ensureAdminRolesSchema();

    const [rows] = await pool.execute(
      isEmail
        ? `SELECT a.id, a.email, a.name, a.password_hash, a.hostel_id,
            COALESCE(a.is_active, 1) AS is_active,
            COALESCE(a.is_owner, 0) AS is_owner,
            a.role_id,
            a.permissions_override,
            r.name AS role_name,
            r.permissions AS role_permissions
           FROM admins a
           LEFT JOIN admin_roles r ON r.id = a.role_id
           WHERE LOWER(a.email) = ?`
        : `SELECT a.id, a.email, a.name, a.password_hash, a.hostel_id,
            COALESCE(a.is_active, 1) AS is_active,
            COALESCE(a.is_owner, 0) AS is_owner,
            a.role_id,
            a.permissions_override,
            r.name AS role_name,
            r.permissions AS role_permissions
           FROM admins a
           LEFT JOIN admin_roles r ON r.id = a.role_id
           WHERE a.mobile = ?`,
      [isEmail ? email! : mobile!]
    );

    const admins = rows as {
      id: number;
      email: string;
      name: string;
      password_hash: string;
      hostel_id: number | null;
      is_active: number | boolean;
      is_owner: number | boolean;
      role_id: number | null;
      role_name: string | null;
      permissions_override: unknown;
      role_permissions: unknown;
    }[];
    if (admins.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid email/phone or password" },
        { status: 401 }
      );
    }

    const admin = admins[0];
    const isActive = admin.is_active === true || admin.is_active === 1;
    if (!isActive) {
      return NextResponse.json(
        { success: false, message: "This account has been deactivated. Contact your hostel owner." },
        { status: 401 }
      );
    }

    const isPlaceholder = admin.password_hash === "$2a$10$placeholder";
    const isValid = isPlaceholder
      ? password === "admin123" && admin.email === "admin@hostel.com"
      : await bcrypt.compare(password, admin.password_hash);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid email/phone or password" },
        { status: 401 }
      );
    }

    const isOwner = admin.is_owner === true || admin.is_owner === 1;
    const canManageUsersAndRoles = Boolean(isOwner && admin.hostel_id != null);
    const legacyFullAccess = !isOwner && admin.role_id == null;
    const permissions =
      isOwner || legacyFullAccess
        ? fullAccessMatrix()
        : mergeEffectivePermissionMatrix(admin.role_permissions, admin.permissions_override);

    return NextResponse.json({
      success: true,
      user: {
        email: admin.email,
        name: admin.name,
        hostelId: admin.hostel_id ?? null,
        adminId: admin.id,
        isOwner,
        canManageUsersAndRoles,
        roleId: admin.role_id ?? null,
        roleName: admin.role_name ?? null,
        permissions,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
