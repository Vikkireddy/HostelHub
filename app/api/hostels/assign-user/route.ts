import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { ensureMultiHostelSchema } from "@/lib/ensureMultiHostelSchema";
import {
  getAdminEmailFromRequest,
  listAccessibleHostelsForAdmin,
  loadAdminByEmail,
} from "@/lib/adminAccess.server";
export { dynamic } from "@/lib/forceDynamicRoute";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
const MOBILE_REGEX = /^[0-9]{10}$/;

type AssignExistingPayload = {
  mode: "existing";
  hostelId: number;
  userId: number;
};

type CreateUserPayload = {
  mode: "create";
  hostelId: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  roleId: number;
  isActive: boolean;
};

export async function POST(request: NextRequest) {
  try {
    await ensureMultiHostelSchema();
    const email = getAdminEmailFromRequest(request);
    if (!email) {
      return NextResponse.json({ success: false, error: "Admin identity required" }, { status: 401 });
    }
    const actor = await loadAdminByEmail(email);
    if (!actor) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const isOwner = actor.is_owner === true || actor.is_owner === 1;
    const mode = String(actor.management_mode ?? "single").toLowerCase();
    if (!isOwner || mode !== "multi") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const payload = (await request.json()) as AssignExistingPayload | CreateUserPayload;
    const hostelId = Number(payload?.hostelId);
    if (!Number.isFinite(hostelId) || hostelId <= 0) {
      return NextResponse.json({ success: false, error: "Invalid hostel" }, { status: 400 });
    }
    const accessible = await listAccessibleHostelsForAdmin(actor.id);
    if (!accessible.some((h) => h.id === hostelId)) {
      return NextResponse.json({ success: false, error: "Hostel not accessible" }, { status: 403 });
    }

    if (payload.mode === "existing") {
      const userId = Number(payload.userId);
      if (!Number.isFinite(userId) || userId <= 0) {
        return NextResponse.json({ success: false, error: "Invalid user" }, { status: 400 });
      }
      const [rows] = await pool.execute(`SELECT id FROM admins WHERE id = ? LIMIT 1`, [userId]);
      if ((rows as unknown[]).length === 0) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
      }
      await pool.execute(`INSERT IGNORE INTO admin_hostels (admin_id, hostel_id) VALUES (?, ?)`, [userId, hostelId]);
      return NextResponse.json({ success: true });
    }

    if (payload.mode === "create") {
      const name = String(payload.name ?? "").trim();
      const emailNew = String(payload.email ?? "").trim().toLowerCase();
      const phone = String(payload.phone ?? "").trim();
      const password = String(payload.password ?? "");
      const confirmPassword = String(payload.confirmPassword ?? "");
      const roleId = Number(payload.roleId);
      const isActive = payload.isActive !== false;

      if (!name) {
        return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
      }
      if (!EMAIL_REGEX.test(emailNew)) {
        return NextResponse.json({ success: false, error: "Valid email is required" }, { status: 400 });
      }
      if (!MOBILE_REGEX.test(phone)) {
        return NextResponse.json({ success: false, error: "Phone must be 10 digits" }, { status: 400 });
      }
      if (!PASSWORD_REGEX.test(password)) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character",
          },
          { status: 400 }
        );
      }
      if (password !== confirmPassword) {
        return NextResponse.json({ success: false, error: "Passwords do not match" }, { status: 400 });
      }
      if (!Number.isFinite(roleId) || roleId <= 0) {
        return NextResponse.json({ success: false, error: "Role is required" }, { status: 400 });
      }

      const [roleRows] = await pool.execute(`SELECT id FROM admin_roles WHERE id = ? LIMIT 1`, [roleId]);
      if ((roleRows as unknown[]).length === 0) {
        return NextResponse.json({ success: false, error: "Role not found" }, { status: 400 });
      }

      const [emailDup] = await pool.execute(`SELECT id FROM admins WHERE LOWER(email) = ?`, [emailNew]);
      if ((emailDup as unknown[]).length > 0) {
        return NextResponse.json({ success: false, error: "An account with this email already exists" }, { status: 409 });
      }
      const [mobileDup] = await pool.execute(`SELECT id FROM admins WHERE mobile = ?`, [phone]);
      if ((mobileDup as unknown[]).length > 0) {
        return NextResponse.json(
          { success: false, error: "An account with this mobile number already exists" },
          { status: 409 }
        );
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const [ins] = await pool.execute(
        `INSERT INTO admins (hostel_id, email, mobile, password_hash, name, is_owner, is_active, role_id, management_mode)
         VALUES (?, ?, ?, ?, ?, 0, ?, ?, 'single')`,
        [hostelId, emailNew, phone, passwordHash, name, isActive ? 1 : 0, roleId]
      );
      const createdId = Number((ins as { insertId?: number }).insertId ?? 0);
      if (createdId > 0) {
        await pool.execute(`INSERT IGNORE INTO admin_hostels (admin_id, hostel_id) VALUES (?, ?)`, [createdId, hostelId]);
      }
      return NextResponse.json({ success: true, id: createdId });
    }

    return NextResponse.json({ success: false, error: "Invalid mode" }, { status: 400 });
  } catch (error) {
    console.error("assign-user error", error);
    return NextResponse.json({ success: false, error: "Failed to assign user" }, { status: 500 });
  }
}
