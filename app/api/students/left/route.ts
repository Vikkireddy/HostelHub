import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
import { requireSubscription } from "@/lib/subscription/RequireSubscription";

const CREATE_TABLE_IF_NOT_EXISTS = `
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

export async function GET(request: NextRequest) {
  try {
    const subErr = await requireSubscription(request);
    if (subErr) return subErr;

    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json([], { status: 200 });
    }

    await pool.execute(CREATE_TABLE_IF_NOT_EXISTS);

    const [rows] = await pool.execute(
      `SELECT * FROM students_left WHERE hostel_id = ? ORDER BY left_date DESC, created_at DESC`,
      [hostelId]
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch exited students" },
      { status: 500 }
    );
  }
}
