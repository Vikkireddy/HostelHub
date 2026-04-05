import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
import { hasPartialPaymentColumns } from "@/lib/PaymentUtils";
import { requireSubscription } from "@/lib/subscription/RequireSubscription";
export { dynamic } from "@/lib/forceDynamicRoute";

export async function POST(request: NextRequest) {
  try {
    const subErr = await requireSubscription(request);
    if (subErr) return subErr;

    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { payment_ids, student_id } = body;

    const hasNewColumns = await hasPartialPaymentColumns();
    const paidAt = new Date();

    if (student_id != null) {
      const studentId = Number(student_id);
      if (isNaN(studentId)) {
        return NextResponse.json({ error: "Invalid student_id" }, { status: 400 });
      }
      if (hasNewColumns) {
        await pool.execute(
          `UPDATE payments p JOIN students s ON p.student_id = s.id
           SET p.status = 'paid', p.paid_at = ?, p.amount_paid = COALESCE(p.amount_due, p.amount)
           WHERE p.student_id = ? AND p.status IN ('pending', 'overdue') AND s.hostel_id = ?`,
          [paidAt, studentId, hostelId]
        );
      } else {
        await pool.execute(
          `UPDATE payments p JOIN students s ON p.student_id = s.id
           SET p.status = 'paid', p.paid_at = ?
           WHERE p.student_id = ? AND p.status IN ('pending', 'overdue') AND s.hostel_id = ?`,
          [paidAt, studentId, hostelId]
        );
      }
    } else if (Array.isArray(payment_ids) && payment_ids.length > 0) {
      const ids = payment_ids.map((id: unknown) => Number(id)).filter((n) => !isNaN(n));
      if (ids.length === 0) {
        return NextResponse.json({ error: "No valid payment IDs" }, { status: 400 });
      }
      const placeholders = ids.map(() => "?").join(",");
      if (hasNewColumns) {
        await pool.execute(
          `UPDATE payments SET status = 'paid', paid_at = ?, amount_paid = COALESCE(amount_due, amount) WHERE id IN (${placeholders}) AND (hostel_id = ? OR hostel_id IS NULL)`,
          [paidAt, ...ids, hostelId]
        );
      } else {
        await pool.execute(
          `UPDATE payments SET status = 'paid', paid_at = ? WHERE id IN (${placeholders}) AND (hostel_id = ? OR hostel_id IS NULL)`,
          [paidAt, ...ids, hostelId]
        );
      }
    } else {
      return NextResponse.json(
        { error: "Either payment_ids array or student_id is required" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, paid_at: paidAt });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to mark payments as paid" },
      { status: 500 }
    );
  }
}
