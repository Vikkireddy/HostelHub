import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";
import { getPlatformStatsSecret, PLATFORM_SESSION_COOKIE } from "@/lib/platform/constants";

export async function middleware(request: NextRequest) {
  const secret = getPlatformStatsSecret();
  if (!secret) {
    return NextResponse.redirect(new URL("/platform/login?reason=config", request.url));
  }

  const token = request.cookies.get(PLATFORM_SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/platform/login", request.url));
  }

  try {
    const key = new TextEncoder().encode(secret);
    const { payload } = await jose.jwtVerify(token, key);
    if (payload.role !== "platform_admin") {
      return NextResponse.redirect(new URL("/platform/login", request.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/platform/login", request.url));
  }
}

export const config = {
  matcher: ["/platform/dashboard/:path*"],
};
