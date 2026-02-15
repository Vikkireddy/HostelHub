import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/get-hostel-id";
import { updateOverduePayments, ensureBillsForStudents, getPendingDuesSql } from "@/lib/payment-utils";

export async function GET(request: NextRequest) {
  try {
    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json([], { status: 200 });
    }

    await ensureBillsForStudents(hostelId);
    await updateOverduePayments(hostelId);
    const { sumSelect, unpaidWhere } = await getPendingDuesSql();
    const [rows] = await pool.execute(
      `SELECT s.*, r.number as room_number, r.rent as room_rent,
        COALESCE((SELECT ${sumSelect} FROM payments p 
          WHERE p.student_id = s.id AND ${unpaidWhere}), 0) as pending_dues,
        COALESCE((SELECT COUNT(*) FROM payments p 
          WHERE p.student_id = s.id AND ${unpaidWhere} AND p.status = 'overdue'), 0) as overdue_count,
        COALESCE((SELECT COUNT(*) FROM payments p WHERE p.student_id = s.id), 0) as payment_count
       FROM students s 
       LEFT JOIN rooms r ON s.room_id = r.id 
       WHERE s.status = 'present' AND s.hostel_id = ?
       ORDER BY s.name ASC`,
      [hostelId]
    );
    const students = (rows as Array<Record<string, unknown>>).map((s) => {
      const pendingDues = Number(s.pending_dues ?? 0);
      const overdueCount = Number(s.overdue_count ?? 0);
      const payment_status =
        pendingDues === 0 ? "No Due Amount" : overdueCount > 0 ? "Overdue" : "Pending";
      return {
        ...s,
        pending_dues: pendingDues,
        payment_status,
      };
    });
    return NextResponse.json(students);
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
    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, room_id, course, join_date, id_proof_type, id_proof_number, address } = body;

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
         WHERE r.id = ? AND r.hostel_id = ?`,
        [Number(room_id), hostelId]
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

    let insertResult: { insertId?: number };

    try {
      const [result] = await pool.execute(
        `INSERT INTO students (hostel_id, name, email, phone, room_id, course, join_date, id_proof_type, id_proof_number, address, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'present')`,
        [
          hostelId,
          name,
          email || null,
          phone,
          room_id ? Number(room_id) : null,
          course || null,
          join_date || null,
          id_proof_type || null,
          id_proof_number || null,
          address || null,
        ]
      );
      insertResult = result as { insertId?: number };
    } catch (insertError: unknown) {
      const err = insertError as { code?: string };
      if (err.code === "ER_BAD_FIELD_ERROR") {
        const [result] = await pool.execute(
          `INSERT INTO students (hostel_id, name, email, phone, room_id, course, join_date, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'present')`,
          [
            hostelId,
            name,
            email || null,
            phone,
            room_id ? Number(room_id) : null,
            course || null,
            join_date || null,
          ]
        );
        insertResult = result as { insertId?: number };
      } else {
        throw insertError;
      }
    }
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
