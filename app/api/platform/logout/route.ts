import { NextResponse } from "next/server";
import { PLATFORM_SESSION_COOKIE } from "@/lib/platform/constants";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(PLATFORM_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
