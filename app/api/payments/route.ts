import { NextResponse } from "next/server";
import pool from "@/lib/db";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export async function GET() {
  try {
    const [rows] = await pool.execute(
      `SELECT p.*, s.name as student_name FROM payments p 
       JOIN students s ON p.student_id = s.id 
       ORDER BY p.created_at DESC LIMIT 100`
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { student_id, amount, month, year, status } = body;

    if (!student_id || amount == null || amount === "" || !month || !year) {
      return NextResponse.json(
        { error: "Student, amount, month, and year are required" },
        { status: 400 }
      );
    }

    const monthName = MONTHS.includes(month) ? month : MONTHS[Number(month) - 1] || month;
    const paymentStatus = (status && ["paid", "pending", "overdue"].includes(status)) ? status : "paid";
    const paidAt = paymentStatus === "paid" ? new Date() : null;

    const [result] = await pool.execute(
      `INSERT INTO payments (student_id, amount, month, year, status, paid_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        Number(student_id),
        Number(amount),
        monthName,
        Number(year),
        paymentStatus,
        paidAt,
      ]
    );

    const insertResult = result as { insertId?: number };
    const id = insertResult.insertId;

    return NextResponse.json({
      id,
      student_id: Number(student_id),
      amount: Number(amount),
      month: monthName,
      year: Number(year),
      status: paymentStatus,
      paid_at: paidAt,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to record payment" },
      { status: 500 }
    );
  }
}
