import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
import { VALID_AC_TYPES, DEFAULT_AC_TYPE } from "@/app/dashboard/rooms/rooms.constants";
import { requireSubscription } from "@/lib/subscription/RequireSubscription";
import { assertDashboardPermission } from "@/lib/dashboardPermission.server";
export { dynamic } from "@/lib/forceDynamicRoute";

export async function GET(request: NextRequest) {
  try {
    const subErr = await requireSubscription(request);
    if (subErr) return subErr;

    const denied = await assertDashboardPermission(request, "rooms", "view");
    if (denied) return denied;

    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json([], { status: 200 });
    }

    const [rows] = await pool.execute(
      `SELECT r.*, COALESCE(occ.occupancy, 0) as occupancy FROM rooms r
       LEFT JOIN (SELECT room_id, COUNT(*) as occupancy FROM students WHERE status = 'present' GROUP BY room_id) occ ON r.id = occ.room_id
       WHERE r.hostel_id = ?
       ORDER BY r.number`,
      [hostelId]
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const subErr = await requireSubscription(request);
    if (subErr) return subErr;

    const denied = await assertDashboardPermission(request, "rooms", "add");
    if (denied) return denied;

    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { number, floor, type, ac_type = DEFAULT_AC_TYPE, capacity, rent, status = "available" } = body;

    if (!number || floor == null || !type || capacity == null || rent == null) {
      return NextResponse.json(
        { error: "Missing required fields: number, floor, type, capacity, rent" },
        { status: 400 }
      );
    }

    const validTypes = ["Single", "Double", "Triple"];
    const validStatuses = ["available", "full", "maintenance"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Type must be Single, Double, or Triple" }, { status: 400 });
    }
    if (ac_type && !(VALID_AC_TYPES as readonly string[]).includes(ac_type)) {
      return NextResponse.json({ error: "AC type must be AC or Non-AC" }, { status: 400 });
    }
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    let result: unknown;
    try {
      [result] = await pool.execute(
        `INSERT INTO rooms (hostel_id, number, floor, type, ac_type, capacity, rent, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [hostelId, String(number).trim(), Number(floor), type, ac_type, Number(capacity), Number(rent), status]
      );
    } catch (insertErr) {
      const mysqlErr = insertErr as { code?: string; errno?: number };
      if (mysqlErr.code === "ER_BAD_FIELD_ERROR" || mysqlErr.errno === 1054) {
        [result] = await pool.execute(
          `INSERT INTO rooms (hostel_id, number, floor, type, capacity, rent, status)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [hostelId, String(number).trim(), Number(floor), type, Number(capacity), Number(rent), status]
        );
      } else {
        throw insertErr;
      }
    }

    const insertId = (result as { insertId: number }).insertId;
    const [rows] = await pool.execute(
      `SELECT r.*, COALESCE(occ.occupancy, 0) as occupancy FROM rooms r
       LEFT JOIN (SELECT room_id, COUNT(*) as occupancy FROM students WHERE status = 'present' GROUP BY room_id) occ ON r.id = occ.room_id
       WHERE r.id = ?`,
      [insertId]
    );
    const room = (rows as Array<Record<string, unknown>>)[0];
    return NextResponse.json(room);
  } catch (error) {
    console.error("Database error:", error);
    const err = error as { code?: string };
    if (err.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "Room number already exists" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}
