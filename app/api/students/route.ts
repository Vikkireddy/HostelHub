import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.execute(
      "SELECT s.*, r.number as room_number FROM students s LEFT JOIN rooms r ON s.room_id = r.id WHERE s.status = 'present'"
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, room_id, course, join_date } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone are required" },
        { status: 400 }
      );
    }

    if (room_id) {
      const [roomRows] = await pool.execute(
        `SELECT r.*, COALESCE(occ.occupancy, 0) as occupancy FROM rooms r
         LEFT JOIN (SELECT room_id, COUNT(*) as occupancy FROM students WHERE status = 'present' GROUP BY room_id) occ ON r.id = occ.room_id
         WHERE r.id = ?`,
        [Number(room_id)]
      );
      const room = (roomRows as Array<Record<string, unknown>>)[0];
      if (!room) {
        return NextResponse.json({ error: "Room not found" }, { status: 400 });
      }
      if (room.status === "maintenance") {
        return NextResponse.json({ error: "Cannot assign to a room under maintenance" }, { status: 400 });
      }
      const occupancy = Number(room.occupancy ?? 0);
      const capacity = Number(room.capacity ?? 0);
      if (occupancy >= capacity) {
        return NextResponse.json({ error: "Room is full" }, { status: 400 });
      }
    }

    const [result] = await pool.execute(
      `INSERT INTO students (name, email, phone, room_id, course, join_date, status)
       VALUES (?, ?, ?, ?, ?, ?, 'present')`,
      [
        name,
        email || null,
        phone,
        room_id ? Number(room_id) : null,
        course || null,
        join_date || null,
      ]
    );

    const insertResult = result as { insertId?: number };
    const id = insertResult.insertId;

    if (room_id) {
      await pool.execute(
        `UPDATE rooms r
         LEFT JOIN (SELECT room_id, COUNT(*) as cnt FROM students WHERE status = 'present' GROUP BY room_id) occ ON r.id = occ.room_id
         SET r.status = 'full'
         WHERE r.id = ? AND COALESCE(occ.cnt, 0) >= r.capacity`,
        [Number(room_id)]
      );
    }

    return NextResponse.json({
      id,
      name,
      email: email || null,
      phone,
      room_id: room_id ? Number(room_id) : null,
      course: course || null,
      join_date: join_date || null,
      status: "present",
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    );
  }
}
