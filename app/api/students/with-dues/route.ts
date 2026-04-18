import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
import { updateOverduePayments, ensureBillsForStudents, getPendingDuesSql } from "@/lib/PaymentUtils";
import { requireSubscription } from "@/lib/subscription/RequireSubscription";
export { dynamic } from "@/lib/forceDynamicRoute";

/**
 * Returns only students with pending/outstanding balances (for payment dropdown).
 * Includes room_rent for auto-filling payment amount.
 */
export async function GET(request: NextRequest) {
  try {
    const subErr = await requireSubscription(request);
    if (subErr) return subErr;

    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json([], { status: 200 });
    }

    await ensureBillsForStudents(hostelId);
    await updateOverduePayments(hostelId);
    const { sumSelect, unpaidWhere } = await getPendingDuesSql();

    const [rows] = await pool.execute(
      `SELECT s.id, s.name, s.room_id, r.number as room_number, r.rent as room_rent,
        COALESCE((SELECT ${sumSelect} FROM payments p 
          WHERE p.student_id = s.id AND ${unpaidWhere}), 0) as pending_dues
       FROM students s 
       LEFT JOIN rooms r ON s.room_id = r.id 
       WHERE s.status = 'present' AND s.hostel_id = ?
       HAVING pending_dues > 0
       ORDER BY s.name`,
      [hostelId]
    );

    const students = (rows as Array<Record<string, unknown>>).map((s) => ({
      id: s.id,
      name: s.name,
      room_id: s.room_id,
      room_number: s.room_number,
      room_rent: Number(s.room_rent ?? 0),
      pending_dues: Number(s.pending_dues ?? 0),
    }));

    return NextResponse.json(students);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch residents with dues" },
      { status: 500 }
    );
  }
}
