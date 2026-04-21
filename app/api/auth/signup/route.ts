import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { ensureAdminRolesSchema } from "@/lib/ensureAdminRolesSchema";
export { dynamic } from "@/lib/forceDynamicRoute";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
const MOBILE_REGEX = /^[0-9]{10}$/;

// Simple in-memory rate limit: IP -> { count, resetAt }
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 5; // 5 attempts per hour per IP

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry) return true;
  if (now > entry.resetAt) {
    rateLimit.delete(ip);
    return true;
  }
  return entry.count < RATE_LIMIT_MAX;
}

function incrementRateLimit(ip: string): void {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { success: false, message: "Too many sign-up attempts. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const {
      hostelName,
      ownerName,
      email,
      mobile,
      address,
      city,
      state,
      pincode,
      password,
      acceptTerms,
    } = body;

    // Server-side validation
    if (!hostelName?.trim()) {
      return NextResponse.json(
        { success: false, message: "Hostel name is required" },
        { status: 400 }
      );
    }
    if (!ownerName?.trim()) {
      return NextResponse.json(
        { success: false, message: "Owner/Admin name is required" },
        { status: 400 }
      );
    }
    if (!email?.trim()) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }
    if (!mobile?.trim()) {
      return NextResponse.json(
        { success: false, message: "Mobile number is required" },
        { status: 400 }
      );
    }
    if (!MOBILE_REGEX.test(mobile.trim())) {
      return NextResponse.json(
        { success: false, message: "Mobile number must be 10 digits" },
        { status: 400 }
      );
    }
    if (!password) {
      return NextResponse.json(
        { success: false, message: "Password is required" },
        { status: 400 }
      );
    }
    if (!PASSWORD_REGEX.test(password)) {
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

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedMobile = mobile.trim();

    // Check email uniqueness
    const [emailRows] = await pool.execute(
      "SELECT id FROM admins WHERE LOWER(email) = ?",
      [trimmedEmail]
    );
    if ((emailRows as unknown[]).length > 0) {
      incrementRateLimit(ip);
      return NextResponse.json(
        { success: false, message: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Check mobile uniqueness
    const [mobileRows] = await pool.execute("SELECT id FROM admins WHERE mobile = ?", [
      trimmedMobile,
    ]);
    if ((mobileRows as unknown[]).length > 0) {
      incrementRateLimit(ip);
      return NextResponse.json(
        { success: false, message: "An account with this mobile number already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await ensureAdminRolesSchema();

    await pool.execute(
      `INSERT INTO hostels (name, address, city, state, pincode)
       VALUES (?, ?, ?, ?, ?)`,
      [
        hostelName.trim(),
        address?.trim() || null,
        city?.trim() || null,
        state?.trim() || null,
        pincode?.trim() || null,
      ]
    );

    const [hostelResult] = await pool.execute("SELECT LAST_INSERT_ID() as id");
    const hostelId = (hostelResult as { id: number }[])[0]?.id;

    if (!hostelId) {
      return NextResponse.json(
        { success: false, message: "Failed to create hostel" },
        { status: 500 }
      );
    }

    await pool.execute(
      `INSERT INTO admins (hostel_id, email, mobile, password_hash, name, is_owner, is_active)
       VALUES (?, ?, ?, ?, ?, 1, 1)`,
      [hostelId, trimmedEmail, trimmedMobile, passwordHash, ownerName.trim()]
    );

    return NextResponse.json({
      success: true,
      message: "Account created successfully. You can now sign in.",
    });
  } catch (error) {
    console.error("Sign-up error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
