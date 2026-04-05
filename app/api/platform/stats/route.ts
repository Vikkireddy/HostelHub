import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getPlatformStatsSecret } from "@/lib/platform/constants";
import { authorizePlatformRequest } from "@/lib/platformAuth";

/**
 * Platform-owner metrics. Authorize with either:
 * - Header: Authorization: Bearer <PLATFORM_STATS_SECRET>
 * - Header: X-Platform-Stats-Secret: <PLATFORM_STATS_SECRET>
 * - Cookie: hh_platform_session (after POST /api/platform/login)
 */
export async function GET(request: NextRequest) {
  if (!getPlatformStatsSecret()) {
    return NextResponse.json(
      {
        error: "PLATFORM_STATS_SECRET is not set",
        hint: "Add PLATFORM_STATS_SECRET to .env, restart the server.",
      },
      { status: 503 }
    );
  }

  if (!(await authorizePlatformRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [hostelRows] = await pool.query("SELECT COUNT(*) AS c FROM hostels");
    const [adminRows] = await pool.query(
      "SELECT COUNT(*) AS c FROM admins WHERE hostel_id IS NOT NULL"
    );
    const [studentRows] = await pool.query("SELECT COUNT(*) AS c FROM students");
    const [roomRows] = await pool.query("SELECT COUNT(*) AS c FROM rooms");

    const [thisMonthHostels] = await pool.query(
      `SELECT COUNT(*) AS c FROM hostels
       WHERE DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')`
    );

    const [hostelsList] = await pool.query(
      `SELECT
         h.id,
         h.name,
         h.address,
         h.city,
         h.state,
         h.pincode,
         h.created_at AS createdAt,
         (SELECT a.email FROM admins a WHERE a.hostel_id = h.id ORDER BY a.id ASC LIMIT 1) AS adminEmail,
         (SELECT a.name FROM admins a WHERE a.hostel_id = h.id ORDER BY a.id ASC LIMIT 1) AS adminName
       FROM hostels h
       ORDER BY h.id DESC
       LIMIT 300`
    );

    let subscriptionByStatus: Record<string, number> = {};
    try {
      const [subRows] = await pool.query(
        `SELECT status, COUNT(*) AS c FROM hostel_subscriptions GROUP BY status`
      );
      for (const row of subRows as Array<{ status: string; c: number }>) {
        subscriptionByStatus[row.status] = Number(row.c ?? 0);
      }
    } catch {
      subscriptionByStatus = {};
    }

    const totalHostels = Number((hostelRows as Array<{ c: number }>)[0]?.c ?? 0);
    const adminsWithHostel = Number((adminRows as Array<{ c: number }>)[0]?.c ?? 0);
    const totalStudents = Number((studentRows as Array<{ c: number }>)[0]?.c ?? 0);
    const totalRooms = Number((roomRows as Array<{ c: number }>)[0]?.c ?? 0);
    const hostelsThisMonth = Number((thisMonthHostels as Array<{ c: number }>)[0]?.c ?? 0);

    return NextResponse.json({
      summary: {
        totalHostels,
        adminsWithHostel,
        totalStudents,
        totalRooms,
        hostelsThisMonth,
      },
      subscriptionByStatus,
      hostels: hostelsList,
      note: "totalHostels counts all rows in hostels (including any default hostel from migrations). New signups always add a hostel row.",
    });
  } catch (e) {
    console.error("Platform stats error:", e);
    return NextResponse.json({ error: "Failed to read stats" }, { status: 500 });
  }
}
