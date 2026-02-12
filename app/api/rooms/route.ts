import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.execute(
      `SELECT r.*, COALESCE(occ.occupancy, 0) as occupancy FROM rooms r
       LEFT JOIN (SELECT room_id, COUNT(*) as occupancy FROM students WHERE status = 'present' GROUP BY room_id) occ ON r.id = occ.room_id
       ORDER BY r.number`
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
    const body = await request.json();
    const { number, floor, type, capacity, rent, status = "available" } = body;

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
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const [result] = await pool.execute(
      `INSERT INTO rooms (number, floor, type, capacity, rent, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [String(number).trim(), Number(floor), type, Number(capacity), Number(rent), status]
    );

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
