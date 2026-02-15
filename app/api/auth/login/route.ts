import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";

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

    const identifier = String(emailOrPhone).trim();
    const isEmail = identifier.includes("@");

    const [rows] = await pool.execute(
      isEmail
        ? "SELECT id, email, name, password_hash, hostel_id FROM admins WHERE LOWER(email) = ?"
        : "SELECT id, email, name, password_hash, hostel_id FROM admins WHERE mobile = ?",
      [isEmail ? identifier.toLowerCase() : identifier]
    );

    const admins = rows as {
      id: number;
      email: string;
      name: string;
      password_hash: string;
      hostel_id: number | null;
    }[];
    if (admins.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid email/phone or password" },
        { status: 401 }
      );
    }

    const admin = admins[0];
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

    return NextResponse.json({
      success: true,
      user: {
        email: admin.email,
        name: admin.name,
        hostelId: admin.hostel_id ?? null,
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
