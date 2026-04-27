import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { ensureAdminRolesSchema } from "@/lib/ensureAdminRolesSchema";
import { ensureMultiHostelSchema } from "@/lib/ensureMultiHostelSchema";
export { dynamic } from "@/lib/forceDynamicRoute";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
const MOBILE_REGEX = /^[0-9]{10}$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, mobile, password, acceptTerms } = body;

    if (!name?.trim()) {
      return NextResponse.json({ success: false, message: "Name is required" }, { status: 400 });
    }
    if (!email?.trim() || !EMAIL_REGEX.test(String(email).trim())) {
      return NextResponse.json({ success: false, message: "Valid email is required" }, { status: 400 });
    }
    if (!mobile?.trim() || !MOBILE_REGEX.test(String(mobile).trim())) {
      return NextResponse.json(
        { success: false, message: "Mobile number must be 10 digits" },
        { status: 400 }
      );
    }
    if (!password || !PASSWORD_REGEX.test(String(password))) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character",
        },
        { status: 400 }
      );
    }
    if (!acceptTerms) {
      return NextResponse.json(
        { success: false, message: "You must accept the Terms & Conditions" },
        { status: 400 }
      );
    }

    await ensureAdminRolesSchema();
    await ensureMultiHostelSchema();

    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedMobile = String(mobile).trim();

    const [emailRows] = await pool.execute("SELECT id FROM admins WHERE LOWER(email) = ?", [trimmedEmail]);
    if ((emailRows as unknown[]).length > 0) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const [mobileRows] = await pool.execute("SELECT id FROM admins WHERE mobile = ?", [trimmedMobile]);
    if ((mobileRows as unknown[]).length > 0) {
      return NextResponse.json(
        { success: false, message: "An account with this mobile number already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await pool.execute(
      `INSERT INTO admins (hostel_id, email, mobile, password_hash, name, is_owner, is_active, management_mode)
       VALUES (NULL, ?, ?, ?, ?, 1, 1, 'multi')`,
      [trimmedEmail, trimmedMobile, passwordHash, String(name).trim()]
    );

    return NextResponse.json({
      success: true,
      message: "Account created. Sign in to add your first hostel.",
    });
  } catch (error) {
    console.error("register-owner error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
