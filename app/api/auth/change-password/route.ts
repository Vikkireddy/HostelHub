import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentPassword, newPassword, currentEmail } = body;

    if (!currentEmail || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Current password, new password, and email are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const [rows] = await pool.execute(
      "SELECT id, email, password_hash FROM admins WHERE LOWER(email) = ?",
      [String(currentEmail).toLowerCase()]
    );

    const admins = rows as { id: number; email: string; password_hash: string }[];
    if (admins.length === 0) {
      return NextResponse.json(
        { success: false, message: "Account not found" },
        { status: 404 }
      );
    }

    const admin = admins[0];
    const isPlaceholder = admin.password_hash === "$2a$10$placeholder";
    const isCurrentValid = isPlaceholder
      ? currentPassword === "admin123" && admin.email === "admin@hostel.com"
      : await bcrypt.compare(currentPassword, admin.password_hash);

    if (!isCurrentValid) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect" },
        { status: 401 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.execute(
      "UPDATE admins SET password_hash = ? WHERE id = ?",
      [passwordHash, admin.id]
    );

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update password" },
      { status: 500 }
    );
  }
}
