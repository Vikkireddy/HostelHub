import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";

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
    const { emailOrPhone, newPassword } = body as {
      emailOrPhone?: string;
      newPassword?: string;
    };

    if (!emailOrPhone || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Email/phone and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "New password must be at least 6 characters" },
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

    const [rows] = await pool.execute(
      isEmail
        ? "SELECT id FROM admins WHERE LOWER(email) = ?"
        : "SELECT id FROM admins WHERE mobile = ?",
      [isEmail ? email! : mobile!]
    );

    const admins = rows as { id: number }[];
    if (admins.length === 0) {
      return NextResponse.json({ success: false, message: "Account not found" }, { status: 404 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.execute("UPDATE admins SET password_hash = ? WHERE id = ?", [
      passwordHash,
      admins[0].id,
    ]);

    return NextResponse.json({
      success: true,
      message: "Password reset successful. Please sign in with your new password.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reset password. Please try again." },
      { status: 500 }
    );
  }
}
