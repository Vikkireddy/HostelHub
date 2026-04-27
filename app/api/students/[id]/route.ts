import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
import { updateOverduePayments, ensureBillsForStudents } from "@/lib/PaymentUtils";
import { requireSubscription } from "@/lib/subscription/RequireSubscription";
import { ensurePlannedVacateDateColumn } from "@/lib/ensurePlannedVacateDateColumn";
import { ensureStudentGenderColumn } from "@/lib/ensureGenderColumns";
import {
  normalizeGenderValue,
  normalizePhone,
  validatePhone,
  validateOptionalPhone,
} from "@/app/dashboard/students/students.constants";
import { ensureStudentOptionalPhoneAndEmergency } from "@/lib/ensureStudentContactColumns";
import { formatSqlDateOnlyForJson } from "@/lib/dateOnly";
import { ensureStudentsResidentTypeColumns } from "@/lib/ensureResidentTypeColumns";
import { assertDashboardPermission } from "@/lib/dashboardPermission.server";
import {
  emptyDetailsForKind,
  mergeDetailsForKind,
  normalizeResidentKind,
  parseJsonDetails,
  sanitizeDetailsForKind,
} from "@/lib/residentType.constants";
export { dynamic } from "@/lib/forceDynamicRoute";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const subErr = await requireSubscription(request);
    if (subErr) return subErr;

    const denied = await assertDashboardPermission(request, "residents", "delete");
    if (denied) return denied;

    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const studentId = Number(id);
    if (!id || isNaN(studentId)) {
      return NextResponse.json({ error: "Invalid resident ID" }, { status: 400 });
    }

    const [studentRows] = await pool.execute(
      "SELECT id, room_id, status FROM students WHERE id = ? AND hostel_id = ?",
      [studentId, hostelId]
    );
    const student = (studentRows as Array<Record<string, unknown>>)[0];
    if (!student) {
      return NextResponse.json({ error: "Resident not found" }, { status: 404 });
    }

    const [paymentRows] = await pool.execute(
      "SELECT COUNT(*) as cnt FROM payments WHERE student_id = ?",
      [studentId]
    );
    const count = Number((paymentRows as Array<Record<string, unknown>>)[0]?.cnt ?? 0);
    if (count > 0) {
      return NextResponse.json(
        { error: "Cannot delete resident with payment history. Use checkout instead." },
        { status: 400 }
      );
    }

    const roomId = student.room_id as number | null;
    await pool.execute("DELETE FROM students WHERE id = ?", [studentId]);

    if (roomId) {
      await pool.execute(
        `UPDATE rooms r
         LEFT JOIN (SELECT room_id, COUNT(*) as cnt FROM students WHERE status = 'present' GROUP BY room_id) occ ON r.id = occ.room_id
         SET r.status = CASE WHEN COALESCE(occ.cnt, 0) >= r.capacity THEN 'full' ELSE 'available' END
         WHERE r.id = ?`,
        [roomId]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to delete resident" },
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

    const denied = await assertDashboardPermission(request, "residents", "edit");
    if (denied) return denied;

    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const studentId = Number(id);
    if (!id || isNaN(studentId)) {
      return NextResponse.json({ error: "Invalid resident ID" }, { status: 400 });
    }

    await ensurePlannedVacateDateColumn();
    await ensureStudentGenderColumn();
    await ensureStudentsResidentTypeColumns();

    const body = await request.json();
    const {
      name,
      gender,
      email,
      phone,
      emergency_contact_phone,
      room_id,
      course,
      join_date,
      planned_vacate_date,
      id_proof_type,
      id_proof_number,
      address,
      resident_type,
      resident_type_details,
    } = body;
    const plannedVacateYmd =
      planned_vacate_date === null ||
      planned_vacate_date === undefined ||
      String(planned_vacate_date).trim() === ""
        ? null
        : String(planned_vacate_date).trim().slice(0, 10);

    const required = [
      ["name", name],
      ["gender", gender],
      ["email", email],
      ["phone", phone],
      ["room_id", room_id],
      ["course", course],
      ["join_date", join_date],
      ["id_proof_type", id_proof_type],
      ["id_proof_number", id_proof_number],
      ["address", address],
    ] as const;
    const missing = required.filter(([, v]) => v == null || String(v).trim() === "");
    if (missing.length > 0) {
      const fields = missing.map(([f]) => f).join(", ");
      return NextResponse.json(
        { error: `All fields are required. Missing: ${fields}` },
        { status: 400 }
      );
    }

    const genderNorm = normalizeGenderValue(gender);
    if (!genderNorm) {
      return NextResponse.json(
        { error: "Gender must be Male, Female, or Other." },
        { status: 400 }
      );
    }

    const phoneStr = typeof phone === "string" ? phone : "";
    const phoneErr = validatePhone(phoneStr);
    if (phoneErr) {
      return NextResponse.json({ error: phoneErr }, { status: 400 });
    }
    const emergStr =
      typeof emergency_contact_phone === "string" ? emergency_contact_phone : "";
    const emergErr = validateOptionalPhone(emergStr);
    if (emergErr) {
      return NextResponse.json({ error: emergErr }, { status: 400 });
    }
    const phoneForDb = normalizePhone(phoneStr);
    const emergDigits = normalizePhone(emergStr);
    const emergencyForDb = emergDigits.length === 10 ? emergDigits : null;

    await ensureStudentOptionalPhoneAndEmergency();

    const [existingRows] = await pool.execute(
      `SELECT s.*, r.number as room_number FROM students s 
       LEFT JOIN rooms r ON s.room_id = r.id 
       WHERE s.id = ? AND s.status = 'present' AND s.hostel_id = ?`,
      [studentId, hostelId]
    );
    const existing = (existingRows as Array<Record<string, unknown>>)[0];
    if (!existing) {
      return NextResponse.json(
        { error: "Resident not found or already left" },
        { status: 404 }
      );
    }

    const existingKind = normalizeResidentKind(existing.resident_type);
    const nextKind =
      resident_type !== undefined && resident_type !== null
        ? normalizeResidentKind(resident_type)
        : existingKind;
    let mergedDetails: Record<string, string>;
    if (resident_type_details !== undefined) {
      mergedDetails = sanitizeDetailsForKind(nextKind, resident_type_details);
    } else if (
      resident_type !== undefined &&
      resident_type !== null &&
      nextKind !== existingKind
    ) {
      mergedDetails = emptyDetailsForKind(nextKind);
    } else {
      mergedDetails = mergeDetailsForKind(
        nextKind,
        parseJsonDetails(existing.resident_type_details)
      );
    }
    const residentDetailsJson = JSON.stringify(mergedDetails);

    const oldRoomId = existing.room_id as number | null;
    const newRoomId = room_id != null && room_id !== "" ? Number(room_id) : null;

    if (newRoomId) {
      const [roomRows] = await pool.execute(
        `SELECT r.*, COALESCE(occ.occupancy, 0) as occupancy FROM rooms r
         LEFT JOIN (SELECT room_id, COUNT(*) as occupancy FROM students WHERE status = 'present' GROUP BY room_id) occ ON r.id = occ.room_id
         WHERE r.id = ? AND r.hostel_id = ?`,
        [newRoomId, hostelId]
      );
      const room = (roomRows as Array<Record<string, unknown>>)[0];
      if (!room) {
        return NextResponse.json({ error: "Room not found" }, { status: 400 });
      }
      if (room.status === "maintenance") {
        return NextResponse.json(
          { error: "Cannot assign to a room under maintenance" },
          { status: 400 }
        );
      }
      const occupancy = Number(room.occupancy ?? 0);
      const capacity = Number(room.capacity ?? 0);
      const isSameRoom = oldRoomId === newRoomId;
      if (!isSameRoom && occupancy >= capacity) {
        return NextResponse.json({ error: "Room is full" }, { status: 400 });
      }
    }

    await pool.execute(
      `UPDATE students SET 
        name = ?, gender = ?, email = ?, phone = ?, emergency_contact_phone = ?, room_id = ?, course = ?,
        join_date = ?, planned_vacate_date = ?, id_proof_type = ?, id_proof_number = ?, address = ?,
        resident_type = ?, resident_type_details = ?
       WHERE id = ?`,
      [
        name,
        genderNorm,
        email || null,
        phoneForDb,
        emergencyForDb,
        newRoomId,
        course || null,
        join_date || null,
        plannedVacateYmd,
        id_proof_type || null,
        id_proof_number || null,
        address || null,
        nextKind,
        residentDetailsJson,
        studentId,
      ]
    );

    const roomsToUpdate: number[] = [];
    if (oldRoomId && oldRoomId !== newRoomId) {
      roomsToUpdate.push(oldRoomId);
    }
    if (newRoomId && newRoomId !== oldRoomId) {
      roomsToUpdate.push(newRoomId);
    }

    for (const roomId of roomsToUpdate) {
      await pool.execute(
        `UPDATE rooms r
         LEFT JOIN (SELECT room_id, COUNT(*) as cnt FROM students WHERE status = 'present' GROUP BY room_id) occ ON r.id = occ.room_id
         SET r.status = CASE WHEN COALESCE(occ.cnt, 0) >= r.capacity THEN 'full' ELSE 'available' END
         WHERE r.id = ?`,
        [roomId]
      );
    }

    await ensureBillsForStudents(hostelId);
    await updateOverduePayments(hostelId);

    const [updatedRows] = await pool.execute(
      `SELECT s.*, r.number as room_number FROM students s 
       LEFT JOIN rooms r ON s.room_id = r.id 
       WHERE s.id = ?`,
      [studentId]
    );
    const updated = (updatedRows as Array<Record<string, unknown>>)[0];

    const outKind = normalizeResidentKind(updated.resident_type);
    return NextResponse.json({
      ...updated,
      join_date: formatSqlDateOnlyForJson(updated.join_date),
      planned_vacate_date: formatSqlDateOnlyForJson(updated.planned_vacate_date),
      resident_type: outKind,
      resident_type_details: mergeDetailsForKind(
        outKind,
        parseJsonDetails(updated.resident_type_details)
      ),
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to update resident" },
      { status: 500 }
    );
  }
}
