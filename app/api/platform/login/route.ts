import { NextRequest, NextResponse } from "next/server";
import { getPlatformStatsSecret, PLATFORM_SESSION_COOKIE } from "@/lib/platform/constants";
import { safePasswordCompare, signPlatformSessionToken } from "@/lib/platformAuth";

export async function POST(request: NextRequest) {
  const secret = getPlatformStatsSecret();
  const envEmail = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  const envPassword = process.env.SUPER_ADMIN_PASSWORD ?? "";

  if (!secret || !envEmail || !envPassword) {
    return NextResponse.json(
      {
        error: "Super admin is not configured",
        hint: "Set PLATFORM_STATS_SECRET, SUPER_ADMIN_EMAIL, and SUPER_ADMIN_PASSWORD in .env, then restart.",
      },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const email = String(body?.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(body?.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (email !== envEmail || !safePasswordCompare(password, envPassword)) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = await signPlatformSessionToken(secret);
    const res = NextResponse.json({ success: true });
    res.cookies.set(PLATFORM_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
