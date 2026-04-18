import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
import { VALID_AC_TYPES, DEFAULT_AC_TYPE } from "@/app/dashboard/rooms/rooms.constants";
import { requireSubscription } from "@/lib/subscription/RequireSubscription";
export { dynamic } from "@/lib/forceDynamicRoute";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const subErr = await requireSubscription(request);
    if (subErr) return subErr;

    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const roomId = Number(id);
    if (!id || isNaN(roomId)) {
      return NextResponse.json({ error: "Invalid room ID" }, { status: 400 });
    }

    const [rows] = await pool.execute(
      `SELECT r.*, COALESCE(occ.occupancy, 0) as occupancy FROM rooms r
       LEFT JOIN (SELECT room_id, COUNT(*) as occupancy FROM students WHERE status = 'present' GROUP BY room_id) occ ON r.id = occ.room_id
       WHERE r.id = ? AND r.hostel_id = ?`,
      [roomId, hostelId]
    );
    const room = (rows as Array<Record<string, unknown>>)[0];
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const occupancy = Number(room.occupancy ?? 0);
    if (occupancy > 0) {
      return NextResponse.json(
        { error: "Cannot delete room with occupants. Reassign or checkout residents first." },
        { status: 400 }
      );
    }

    await pool.execute("DELETE FROM rooms WHERE id = ?", [roomId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to delete room" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const subErr = await requireSubscription(request);
    if (subErr) return subErr;

    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const roomId = Number(id);
    if (!id || isNaN(roomId)) {
      return NextResponse.json({ error: "Invalid room ID" }, { status: 400 });
    }

    const body = await request.json();
    const { number, floor, type, ac_type, capacity, rent, status } = body;

    const [existingRows] = await pool.execute(
      `SELECT r.*, COALESCE(occ.occupancy, 0) as occupancy FROM rooms r
       LEFT JOIN (SELECT room_id, COUNT(*) as occupancy FROM students WHERE status = 'present' GROUP BY room_id) occ ON r.id = occ.room_id
       WHERE r.id = ? AND r.hostel_id = ?`,
      [roomId, hostelId]
    );
    const existing = (existingRows as Array<Record<string, unknown>>)[0];
    if (!existing) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const currentOccupancy = Number(existing.occupancy ?? 0);
    const newCapacity = capacity != null ? Number(capacity) : Number(existing.capacity);
    const newFloor = floor != null ? Number(floor) : Number(existing.floor);
    const newType = type || (existing.type as string);
    const newAcType = ac_type != null ? ac_type : (existing.ac_type as string) || DEFAULT_AC_TYPE;
    const newRent = rent != null ? Number(rent) : Number(existing.rent);
    const newStatus = status || (existing.status as string);
    const newNumber = number != null ? String(number).trim() : (existing.number as string);

    if (newCapacity < currentOccupancy) {
      return NextResponse.json(
        { error: `Cannot reduce capacity below current occupancy (${currentOccupancy})` },
        { status: 400 }
      );
    }

    const validTypes = ["Single", "Double", "Triple"];
    const validStatuses = ["available", "full", "maintenance"];
    if (newType && !validTypes.includes(newType)) {
      return NextResponse.json(
        { error: "Type must be Single, Double, or Triple" },
        { status: 400 }
      );
    }
    if (newAcType && !(VALID_AC_TYPES as readonly string[]).includes(newAcType)) {
      return NextResponse.json({ error: "AC type must be AC or Non-AC" }, { status: 400 });
    }
    if (newStatus && !validStatuses.includes(newStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    try {
      await pool.execute(
        `UPDATE rooms SET number = ?, floor = ?, type = ?, ac_type = ?, capacity = ?, rent = ?, status = ?
         WHERE id = ?`,
        [newNumber, newFloor, newType, newAcType, newCapacity, newRent, newStatus, roomId]
      );
    } catch (updateErr) {
      const mysqlErr = updateErr as { code?: string; errno?: number; message?: string };
      const isUnknownColumn =
        mysqlErr.code === "ER_BAD_FIELD_ERROR" ||
        mysqlErr.errno === 1054 ||
        (typeof mysqlErr.message === "string" &&
          (mysqlErr.message.includes("ac_type") || mysqlErr.message.includes("Unknown column")));
      if (isUnknownColumn) {
        await pool.execute(
          `UPDATE rooms SET number = ?, floor = ?, type = ?, capacity = ?, rent = ?, status = ?
           WHERE id = ?`,
          [newNumber, newFloor, newType, newCapacity, newRent, newStatus, roomId]
        );
      } else {
        throw updateErr;
      }
    }

    await pool.execute(
      `UPDATE rooms r
       LEFT JOIN (SELECT room_id, COUNT(*) as cnt FROM students WHERE status = 'present' GROUP BY room_id) occ ON r.id = occ.room_id
       SET r.status = CASE 
         WHEN r.status = 'maintenance' THEN 'maintenance'
         WHEN COALESCE(occ.cnt, 0) >= r.capacity THEN 'full' 
         ELSE 'available' 
       END
       WHERE r.id = ?`,
      [roomId]
    );

    const [updatedRows] = await pool.execute(
      `SELECT r.*, COALESCE(occ.occupancy, 0) as occupancy FROM rooms r
       LEFT JOIN (SELECT room_id, COUNT(*) as occupancy FROM students WHERE status = 'present' GROUP BY room_id) occ ON r.id = occ.room_id
       WHERE r.id = ?`,
      [roomId]
    );
    const updated = (updatedRows as Array<Record<string, unknown>>)[0];

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Database error:", error);
    const err = error as { code?: string };
    if (err.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "Room number already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update room" },
      { status: 500 }
    );
  }
}
