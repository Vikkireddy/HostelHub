import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
import { getPendingDuesSql } from "@/lib/PaymentUtils";
import { requireSubscription } from "@/lib/subscription/RequireSubscription";
export { dynamic } from "@/lib/forceDynamicRoute";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const subErr = await requireSubscription(request);
    if (subErr) return subErr;

    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json({ amount: 0, hasPending: false });
    }

    const { id } = await params;
    const studentId = Number(id);
    if (!id || isNaN(studentId)) {
      return NextResponse.json({ error: "Invalid resident ID" }, { status: 400 });
    }

    const [studentCheck] = await pool.execute(
      "SELECT id FROM students WHERE id = ? AND hostel_id = ?",
      [studentId, hostelId]
    );
    if ((studentCheck as unknown[]).length === 0) {
      return NextResponse.json({ amount: 0, hasPending: false });
    }

    const { sumSelect, unpaidWhere } = await getPendingDuesSql();
    const [rows] = await pool.execute(
      `SELECT ${sumSelect} as total FROM payments p 
       WHERE p.student_id = ? AND ${unpaidWhere}`,
      [studentId]
    );
    const result = (rows as Array<Record<string, unknown>>)[0];
    const total = Number(result?.total ?? 0);

    return NextResponse.json({
      amount: total,
      hasPending: total > 0,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending dues" },
      { status: 500 }
    );
  }
}
