import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.execute(
      `SELECT c.*, s.name as student_name, r.number as room_number 
       FROM complaints c 
       LEFT JOIN students s ON c.student_id = s.id 
       LEFT JOIN rooms r ON c.room_id = r.id 
       ORDER BY c.created_at DESC`
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch complaints" },
      { status: 500 }
    );
  }
}
