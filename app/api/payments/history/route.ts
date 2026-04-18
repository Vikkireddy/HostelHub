import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
import { hasPartialPaymentColumns } from "@/lib/PaymentUtils";
import { requireSubscription } from "@/lib/subscription/RequireSubscription";
export { dynamic } from "@/lib/forceDynamicRoute";

export async function GET(request: NextRequest) {
  try {
    const subErr = await requireSubscription(request);
    if (subErr) return subErr;

    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentId = Number(request.nextUrl.searchParams.get("student_id"));
    if (!studentId || Number.isNaN(studentId)) {
      return NextResponse.json(
        { error: "A valid resident account is required" },
        { status: 400 }
      );
    }

    const [studentRows] = await pool.execute(
      `SELECT s.id, s.name, COALESCE(r.rent, 0) as room_rent
       FROM students s
       LEFT JOIN rooms r ON s.room_id = r.id
       WHERE s.id = ? AND (s.hostel_id = ? OR s.hostel_id IS NULL) LIMIT 1`,
      [studentId, hostelId]
    );
    const student = (studentRows as Array<{ id: number; name: string; room_rent: number }>)[0];
    if (!student) {
      return NextResponse.json({ error: "Resident not found" }, { status: 404 });
    }

    let historyRows: Array<Record<string, unknown>> = [];
    try {
      const [rows] = await pool.execute(
        `SELECT id, amount, recorded_at, 'Payment recorded' as note
         FROM payment_transactions
         WHERE student_id = ?
         ORDER BY recorded_at DESC`,
        [studentId]
      );
      historyRows = rows as Array<Record<string, unknown>>;
    } catch (error) {
      const err = error as { code?: string };
      if (err.code !== "ER_NO_SUCH_TABLE") throw error;
      const [rows] = await pool.execute(
        `SELECT id, amount, paid_at as recorded_at, 'Marked paid' as note
         FROM payments
         WHERE student_id = ? AND paid_at IS NOT NULL
         ORDER BY paid_at DESC`,
        [studentId]
      );
      historyRows = rows as Array<Record<string, unknown>>;
    }

    const history = historyRows.map((row) => ({
      id: Number(row.id ?? 0),
      amount: Number(row.amount ?? 0),
      recorded_at: String(row.recorded_at),
      status:
        Number(row.amount ?? 0) > 0 && Number(row.amount ?? 0) < Number(student.room_rent ?? 0)
          ? "partial"
          : "paid",
      note: String(row.note ?? "Payment recorded"),
    }));
    const totalPaid = history.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
    const lastPaymentAt = history[0]?.recorded_at ?? null;

    const hasPartialColumns = await hasPartialPaymentColumns();
    let pendingDue = 0;
    if (hasPartialColumns) {
      const [pendingRows] = await pool.execute(
        `SELECT COALESCE(SUM(GREATEST(COALESCE(amount_due, amount) - COALESCE(amount_paid, 0), 0)), 0) as pending_due
         FROM payments
         WHERE student_id = ? AND (hostel_id = ? OR hostel_id IS NULL)`,
        [studentId, hostelId]
      );
      pendingDue = Number((pendingRows as Array<{ pending_due?: number }>)[0]?.pending_due ?? 0);
    } else {
      const [pendingRows] = await pool.execute(
        `SELECT COALESCE(SUM(amount), 0) as pending_due
         FROM payments
         WHERE student_id = ? AND status IN ('pending', 'overdue') AND (hostel_id = ? OR hostel_id IS NULL)`,
        [studentId, hostelId]
      );
      pendingDue = Number((pendingRows as Array<{ pending_due?: number }>)[0]?.pending_due ?? 0);
    }

    return NextResponse.json({
      student_id: student.id,
      student_name: student.name,
      room_rent: Number(student.room_rent ?? 0),
      total_paid: totalPaid,
      pending_due: pendingDue,
      last_payment_at: lastPaymentAt,
      history,
    });
  } catch (error) {
    console.error("Payment history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment history" },
      { status: 500 }
    );
  }
}
