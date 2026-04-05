import { createHash, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import * as jose from "jose";
import {
  getPlatformStatsSecret,
  PLATFORM_SESSION_COOKIE,
} from "@/lib/platform/constants";

export { PLATFORM_SESSION_COOKIE, getPlatformStatsSecret } from "@/lib/platform/constants";

/** Constant-time compare of UTF-8 passwords via SHA-256 digests. */
export function safePasswordCompare(plain: string, expected: string): boolean {
  try {
    const ha = createHash("sha256").update(plain, "utf8").digest();
    const hb = createHash("sha256").update(expected, "utf8").digest();
    return ha.length === hb.length && timingSafeEqual(ha, hb);
  } catch {
    return false;
  }
}

export async function signPlatformSessionToken(secret: string): Promise<string> {
  const key = new TextEncoder().encode(secret);
  return new jose.SignJWT({ role: "platform_admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(key);
}

export async function verifyPlatformSessionToken(
  token: string,
  secret: string
): Promise<boolean> {
  try {
    const key = new TextEncoder().encode(secret);
    const { payload } = await jose.jwtVerify(token, key);
    return payload.role === "platform_admin";
  } catch {
    return false;
  }
}

export async function authorizePlatformRequest(request: NextRequest): Promise<boolean> {
  const secret = getPlatformStatsSecret();
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : null;
  const headerSecret = request.headers.get("x-platform-stats-secret")?.trim();
  if (bearer === secret || headerSecret === secret) return true;

  const cookie = request.cookies.get(PLATFORM_SESSION_COOKIE)?.value;
  if (cookie) return verifyPlatformSessionToken(cookie, secret);
  return false;
}
