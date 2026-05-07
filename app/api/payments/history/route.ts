import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
import { hasPartialPaymentColumns, hasPaymentReferenceColumns } from "@/lib/PaymentUtils";
import { requireSubscription } from "@/lib/subscription/RequireSubscription";
import { assertDashboardPermission } from "@/lib/dashboardPermission.server";
import { ensureStudentMonthlyRentColumn } from "@/lib/ensureStudentMonthlyRentColumn";
export { dynamic } from "@/lib/forceDynamicRoute";

export async function GET(request: NextRequest) {
  try {
    const subErr = await requireSubscription(request);
    if (subErr) return subErr;

    const denied = await assertDashboardPermission(request, "payments", "view");
    if (denied) return denied;

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

    await ensureStudentMonthlyRentColumn();

    const [studentRows] = await pool.execute(
      `SELECT s.id, s.name, COALESCE(s.monthly_rent, 0) as monthly_rent
       FROM students s
       WHERE s.id = ? AND (s.hostel_id = ? OR s.hostel_id IS NULL) LIMIT 1`,
      [studentId, hostelId]
    );
    const student = (studentRows as Array<{ id: number; name: string; monthly_rent: number }>)[0];
    if (!student) {
      return NextResponse.json({ error: "Resident not found" }, { status: 404 });
    }

    const hasRefCols = await hasPaymentReferenceColumns();
    const refSelect = hasRefCols ? ", payment_mode, payment_reference" : "";

    let historyRows: Array<Record<string, unknown>> = [];
    try {
      const [rows] = await pool.execute(
        `SELECT id, amount, recorded_at${refSelect}, 'Payment recorded' as note
         FROM payment_transactions
         WHERE student_id = ?
         ORDER BY recorded_at DESC`,
        [studentId]
      );
      historyRows = rows as Array<Record<string, unknown>>;
    } catch (error) {
      const err = error as { code?: string };
      if (err.code !== "ER_NO_SUCH_TABLE") throw error;
    }
    if (historyRows.length === 0) {
      // Backward compatibility for older paid rows created before payment_transactions.
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
      payment_mode:
        hasRefCols && row.payment_mode != null && String(row.payment_mode).trim() !== ""
          ? String(row.payment_mode)
          : null,
      payment_reference:
        hasRefCols && row.payment_reference != null && String(row.payment_reference).trim() !== ""
          ? String(row.payment_reference)
          : null,
      status:
        Number(row.amount ?? 0) > 0 && Number(row.amount ?? 0) < Number(student.monthly_rent ?? 0)
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
      monthly_rent: Number(student.monthly_rent ?? 0),
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
