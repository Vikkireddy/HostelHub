import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
import { requireSubscription } from "@/lib/subscription/RequireSubscription";
export { dynamic } from "@/lib/forceDynamicRoute";

const ENSURE_STUDENTS_LEFT_TABLE = `
  CREATE TABLE IF NOT EXISTS students_left (
    id INT AUTO_INCREMENT PRIMARY KEY,
    original_student_id INT NOT NULL,
    hostel_id INT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
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

    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const studentId = Number(id);
    if (!id || isNaN(studentId)) {
      return NextResponse.json({ error: "Invalid student ID" }, { status: 400 });
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
        { error: "Student not found or already left" },
        { status: 404 }
      );
    }

    const leftDate = new Date().toISOString().slice(0, 10);

    await pool.execute(ENSURE_STUDENTS_LEFT_TABLE);

    await pool.execute(
      `INSERT INTO students_left (
        original_student_id, hostel_id, name, email, phone, room_number, course,
        join_date, left_date, id_proof_type, id_proof_number, address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        hostelId,
        student.name,
        student.email ?? null,
        student.phone,
        student.room_number ?? null,
        student.course ?? null,
        student.join_date ?? null,
        leftDate,
        student.id_proof_type ?? null,
        student.id_proof_number ?? null,
        student.address ?? null,
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
      message: "Student marked as left",
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to mark student as left" },
      { status: 500 }
    );
  }
}
