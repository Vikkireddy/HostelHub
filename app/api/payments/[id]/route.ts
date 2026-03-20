import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
import { hasPartialPaymentColumns } from "@/lib/PaymentUtils";
import { requireSubscription } from "@/lib/subscription/RequireSubscription";

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
    const paymentId = Number(id);
    if (!id || isNaN(paymentId)) {
      return NextResponse.json({ error: "Invalid payment ID" }, { status: 400 });
    }

    const [paymentRows] = await pool.execute(
      "SELECT id FROM payments WHERE id = ? AND (hostel_id = ? OR hostel_id IS NULL)",
      [paymentId, hostelId]
    );
    if ((paymentRows as unknown[]).length === 0) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !["paid", "pending", "overdue"].includes(status)) {
      return NextResponse.json(
        { error: "Valid status (paid, pending, overdue) is required" },
        { status: 400 }
      );
    }

    const paidAt = status === "paid" ? new Date() : null;
    const hasNewColumns = await hasPartialPaymentColumns();

    if (status === "paid" && hasNewColumns) {
      await pool.execute(
        `UPDATE payments SET status = 'paid', paid_at = ?, amount_paid = COALESCE(amount_due, amount) WHERE id = ? AND (hostel_id = ? OR hostel_id IS NULL)`,
        [paidAt, paymentId, hostelId]
      );
    } else {
      await pool.execute(
        `UPDATE payments SET status = ?, paid_at = ? WHERE id = ? AND (hostel_id = ? OR hostel_id IS NULL)`,
        [status, paidAt, paymentId, hostelId]
      );
    }

    return NextResponse.json({
      success: true,
      status,
      paid_at: paidAt,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to update payment" },
      { status: 500 }
    );
  }
}
