import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getPlatformStatsSecret } from "@/lib/platform/constants";
import { authorizePlatformRequest } from "@/lib/platformAuth";
import { getPendingDuesSql } from "@/lib/PaymentUtils";
export { dynamic } from "@/lib/forceDynamicRoute";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
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

  const { id } = await params;
  const hostelId = Number(id);
  if (!Number.isFinite(hostelId) || hostelId <= 0) {
    return NextResponse.json({ error: "Invalid hostel id" }, { status: 400 });
  }

  try {
    const [hostelRows] = await pool.execute(
      `SELECT id, name, city, state FROM hostels WHERE id = ? LIMIT 1`,
      [hostelId]
    );
    const hostel = (hostelRows as Array<Record<string, unknown>>)[0];
    if (!hostel) {
      return NextResponse.json({ error: "Hostel not found" }, { status: 404 });
    }

    const [roomRows] = await pool.execute(
      `SELECT
        COUNT(*) AS totalRooms,
        COALESCE(SUM(COALESCE(capacity, 0)), 0) AS totalBeds
      FROM rooms
      WHERE hostel_id = ?`,
      [hostelId]
    );

    const [studentRows] = await pool.execute(
      `SELECT COUNT(*) AS totalStudents
       FROM students
       WHERE hostel_id = ? AND status = 'present'`,
      [hostelId]
    );

    const occupiedBeds = Number((studentRows as Array<Record<string, unknown>>)[0]?.totalStudents ?? 0);
    const totalBeds = Number((roomRows as Array<Record<string, unknown>>)[0]?.totalBeds ?? 0);
    const availableBeds = Math.max(0, totalBeds - occupiedBeds);
    const totalRooms = Number((roomRows as Array<Record<string, unknown>>)[0]?.totalRooms ?? 0);

    const { revenueSelect, pendingBillsSelect, unpaidWhereNoAlias } = await getPendingDuesSql();

    const now = new Date();
    const currentYear = now.getFullYear();
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const currentMonthName = monthNames[now.getMonth()];

    const [revenueRows] = await pool.execute(
      `SELECT COALESCE(${revenueSelect}, 0) AS revenue
       FROM payments
       WHERE status = 'paid' AND month = ? AND year = ? AND (hostel_id = ? OR hostel_id IS NULL)`,
      [currentMonthName, currentYear, hostelId]
    );
    const monthlyRevenue = Number((revenueRows as Array<Record<string, unknown>>)[0]?.revenue ?? 0);

    const [pendingRows] = await pool.execute(
      `SELECT ${pendingBillsSelect}
       FROM payments
       WHERE ${unpaidWhereNoAlias} AND (hostel_id = ? OR hostel_id IS NULL)`,
      [hostelId]
    );
    const pendingDues = Number((pendingRows as Array<Record<string, unknown>>)[0]?.total ?? 0);

    return NextResponse.json({
      hostel: {
        id: Number(hostel.id),
        name: String(hostel.name ?? ""),
        city: hostel.city == null ? null : String(hostel.city),
        state: hostel.state == null ? null : String(hostel.state),
      },
      metrics: {
        totalRooms,
        totalBeds,
        occupiedBeds,
        availableBeds,
        totalStudents: occupiedBeds,
        monthlyRevenue,
        pendingDues,
      },
      period: {
        month: currentMonthName,
        year: currentYear,
      },
    });
  } catch (error) {
    console.error("Platform hostel overview error:", error);
    return NextResponse.json({ error: "Failed to fetch hostel overview" }, { status: 500 });
  }
}
