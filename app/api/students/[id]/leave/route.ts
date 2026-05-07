import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
import { requireSubscription } from "@/lib/subscription/RequireSubscription";
import { ensureStudentsLeftGenderColumn } from "@/lib/ensureGenderColumns";
import { ensureStudentOptionalPhoneAndEmergency } from "@/lib/ensureStudentContactColumns";
import { ensureStudentsLeftResidentTypeColumns } from "@/lib/ensureResidentTypeColumns";
import { ensureStudentSecurityDepositColumns } from "@/lib/ensureStudentSecurityDepositColumns";
import { assertDashboardPermission } from "@/lib/dashboardPermission.server";
export { dynamic } from "@/lib/forceDynamicRoute";

const ENSURE_STUDENTS_LEFT_TABLE = `
  CREATE TABLE IF NOT EXISTS students_left (
    id INT AUTO_INCREMENT PRIMARY KEY,
    original_student_id INT NOT NULL,
    hostel_id INT NULL,
    name VARCHAR(255) NOT NULL,
    gender VARCHAR(20) NULL,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    emergency_contact_phone VARCHAR(20) NULL,
    room_number VARCHAR(20),
    course VARCHAR(255),
    join_date DATE,
    left_date DATE NOT NULL,
    id_proof_type VARCHAR(50),
    id_proof_number VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

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

    const [studentRows] = await pool.execute(
      `SELECT s.*, r.number as room_number FROM students s 
       LEFT JOIN rooms r ON s.room_id = r.id 
       WHERE s.id = ? AND s.status = 'present' AND s.hostel_id = ?`,
      [studentId, hostelId]
    );
    const students = studentRows as Array<Record<string, unknown>>;
    const student = students[0];
    if (!student) {
      return NextResponse.json(
        { error: "Resident not found or already left" },
        { status: 404 }
      );
    }

    const leftDate = new Date().toISOString().slice(0, 10);

    let securityDepositDeduction = 0;
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      try {
        const body = (await request.json()) as { security_deposit_deduction?: unknown };
        const d = body?.security_deposit_deduction;
        if (d !== undefined && d !== null && String(d).trim() !== "") {
          securityDepositDeduction =
            typeof d === "number" ? d : Number(String(d).replace(/,/g, "").trim());
        }
      } catch {
        securityDepositDeduction = 0;
      }
    }

    if (!Number.isFinite(securityDepositDeduction) || securityDepositDeduction < 0) {
      return NextResponse.json(
        { error: "Deduction / maintenance charges must be a valid non-negative amount." },
        { status: 400 }
      );
    }

    await pool.execute(ENSURE_STUDENTS_LEFT_TABLE);
    await ensureStudentsLeftGenderColumn();
    await ensureStudentOptionalPhoneAndEmergency();
    await ensureStudentsLeftResidentTypeColumns();
    await ensureStudentSecurityDepositColumns();

    const totalDeposit =
      Math.round(Number(student.security_deposit_amount ?? 0) * 100) / 100;
    if (securityDepositDeduction - totalDeposit > 0.001) {
      return NextResponse.json(
        { error: "Deduction cannot exceed the recorded advance / security deposit." },
        { status: 400 }
      );
    }
    const refundAmount = Math.round((totalDeposit - securityDepositDeduction) * 100) / 100;

    const residentType =
      student.resident_type != null && String(student.resident_type).trim() !== ""
        ? String(student.resident_type).trim()
        : "student";
    const detailsVal = student.resident_type_details;
    const detailsJson =
      detailsVal == null
        ? null
        : typeof detailsVal === "string"
          ? detailsVal
          : JSON.stringify(detailsVal);

    await pool.execute(
      `INSERT INTO students_left (
        original_student_id, hostel_id, name, gender, email, phone, emergency_contact_phone, room_number, course,
        join_date, left_date, id_proof_type, id_proof_number, address, resident_type, resident_type_details,
        security_deposit_amount, security_deposit_deduction, security_deposit_refund
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        hostelId,
        student.name,
        student.gender != null && String(student.gender).trim() !== ""
          ? String(student.gender).trim()
          : null,
        student.email ?? null,
        student.phone,
        student.emergency_contact_phone != null &&
        String(student.emergency_contact_phone).trim() !== ""
          ? String(student.emergency_contact_phone).trim()
          : null,
        student.room_number ?? null,
        student.course ?? null,
        student.join_date ?? null,
        leftDate,
        student.id_proof_type ?? null,
        student.id_proof_number ?? null,
        student.address ?? null,
        residentType,
        detailsJson,
        totalDeposit,
        securityDepositDeduction,
        refundAmount,
      ]
    );

    await pool.execute(
      `UPDATE students SET room_id = NULL, status = 'left' WHERE id = ?`,
      [studentId]
    );

    const roomId = student.room_id as number | null;
    if (roomId) {
      await pool.execute(
        `UPDATE rooms r
         LEFT JOIN (SELECT room_id, COUNT(*) as cnt FROM students WHERE status = 'present' GROUP BY room_id) occ ON r.id = occ.room_id
         SET r.status = CASE WHEN COALESCE(occ.cnt, 0) >= r.capacity THEN 'full' ELSE 'available' END
         WHERE r.id = ?`,
        [roomId]
      );
    }

    return NextResponse.json({
      success: true,
      message: "Resident marked as left",
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to mark resident as left" },
      { status: 500 }
    );
  }
}
