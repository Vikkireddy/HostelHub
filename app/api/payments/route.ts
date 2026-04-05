import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
import { requireSubscription } from "@/lib/subscription/RequireSubscription";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

import {
  getDueDate,
  getDaysInfo,
  updateOverduePayments,
  hasPartialPaymentColumns,
  ensureBillsForStudents,
} from "@/lib/PaymentUtils";
export { dynamic } from "@/lib/forceDynamicRoute";

export async function GET(request: NextRequest) {
  try {
    const subErr = await requireSubscription(request);
    if (subErr) return subErr;

    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json([], { status: 200 });
    }

    await updateOverduePayments(hostelId);

    let rows: unknown;
    try {
      [rows] = await pool.execute(
        `SELECT p.*, s.name as student_name, s.join_date as student_join_date,
          (
            SELECT MAX(pt.recorded_at)
            FROM payment_transactions pt
            WHERE pt.student_id = p.student_id
          ) as last_payment_at
         FROM payments p 
         JOIN students s ON p.student_id = s.id 
         WHERE (p.hostel_id = ? OR s.hostel_id = ?)
         ORDER BY p.year DESC, FIELD(p.month, 'January','February','March','April','May','June','July','August','September','October','November','December') DESC, p.created_at DESC LIMIT 100`,
        [hostelId, hostelId]
      );
    } catch (error) {
      const err = error as { code?: string };
      if (err.code !== "ER_NO_SUCH_TABLE") throw error;
      [rows] = await pool.execute(
        `SELECT p.*, s.name as student_name, s.join_date as student_join_date, p.paid_at as last_payment_at
         FROM payments p 
         JOIN students s ON p.student_id = s.id 
         WHERE (p.hostel_id = ? OR s.hostel_id = ?)
         ORDER BY p.year DESC, FIELD(p.month, 'January','February','March','April','May','June','July','August','September','October','November','December') DESC, p.created_at DESC LIMIT 100`,
        [hostelId, hostelId]
      );
    }

    const result = (rows as Array<Record<string, unknown>>).map((row) => {
      const status = row.status as string;
      const month = row.month as string;
      const year = Number(row.year);
      const joinDate = row.student_join_date as string | null;
      const amountDue = Number(row.amount_due ?? row.amount ?? 0);
      const amountPaid = Number(row.amount_paid ?? 0);
      const balance = amountDue - amountPaid;

      let daysInfo: { days: number; label: string } | null = null;

      if (status !== "paid") {
        const dueDate = getDueDate(month, year, joinDate);
        daysInfo = getDaysInfo(dueDate);
      }

      return {
        ...row,
        amount_due: amountDue,
        amount_paid: amountPaid,
        balance,
        days_left: daysInfo?.label ?? null,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

/**
 * Records a payment and allocates it to the oldest pending dues first (FIFO).
 * - Deducts from oldest month first
 * - Marks month as Paid when fully settled
 * - Carries remaining amount to next month
 * - Stores payment date/time in payment_transactions
 */
export async function POST(request: Request) {
  try {
    const subErr = await requireSubscription(request);
    if (subErr) return subErr;
    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { student_id, amount, month, year } = body;

    if (!student_id || amount == null || amount === "" || !month || !year) {
      return NextResponse.json(
        { error: "Student, amount, month, and year are required" },
        { status: 400 }
      );
    }

    const monthName = MONTHS.includes(month) ? month : MONTHS[Number(month) - 1] || month;
    const paymentAmount = Number(amount);
    const studentId = Number(student_id);
    const yearNum = Number(year);
    const hasNewColumns = await hasPartialPaymentColumns();

    const [studentRows] = await pool.execute(
      `SELECT s.id, s.join_date, r.rent as room_rent FROM students s
       LEFT JOIN rooms r ON s.room_id = r.id WHERE s.id = ? AND s.hostel_id = ?`,
      [studentId, hostelId]
    );
    const student = (studentRows as Array<Record<string, unknown>>)[0];
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 400 });
    }

    const roomRent = Number(student.room_rent ?? 0);

    // Legacy schema: no partial payment support - UPDATE existing row to avoid duplicates
    if (!hasNewColumns) {
      const [existingRows] = await pool.execute(
        `SELECT id, amount FROM payments WHERE student_id = ? AND month = ? AND year = ? LIMIT 1`,
        [studentId, monthName, yearNum]
      );
      const existing = (existingRows as Array<Record<string, unknown>>)[0];
      if (existing) {
        const amountDue = Number(existing.amount ?? 0);
        if (paymentAmount < amountDue) {
          return NextResponse.json(
            {
              error:
                "Partial payments require the database migration. Run: node scripts/run-migrate-payments-partial.js",
            },
            { status: 400 }
          );
        }
        await pool.execute(
          `UPDATE payments SET status = 'paid', paid_at = NOW() WHERE id = ?`,
          [existing.id]
        );
        await updateOverduePayments(hostelId);
        const [updatedRows] = await pool.execute(`SELECT * FROM payments WHERE id = ?`, [
          existing.id,
        ]);
        const updated = (updatedRows as Array<Record<string, unknown>>)[0];
        return NextResponse.json({
          id: updated.id,
          student_id: studentId,
          amount: paymentAmount,
          amount_due: Number(updated.amount),
          amount_paid: Number(updated.amount),
          month: updated.month,
          year: updated.year,
          status: updated.status,
          paid_at: updated.paid_at,
          message: `Payment of ₹${paymentAmount.toLocaleString()} recorded.`,
        });
      }
      const [insertResult] = await pool.execute(
        `INSERT INTO payments (student_id, amount, month, year, status, paid_at)
         VALUES (?, ?, ?, ?, 'paid', NOW())`,
        [studentId, paymentAmount, monthName, yearNum]
      );
      const paymentId = (insertResult as { insertId: number }).insertId;
      await updateOverduePayments(hostelId);
      const [updatedRows] = await pool.execute(`SELECT * FROM payments WHERE id = ?`, [
        paymentId,
      ]);
      const updated = (updatedRows as Array<Record<string, unknown>>)[0];
      return NextResponse.json({
        id: updated.id,
        student_id: studentId,
        amount: paymentAmount,
        amount_due: Number(updated.amount),
        amount_paid: Number(updated.amount),
        month: updated.month,
        year: updated.year,
        status: updated.status,
        paid_at: updated.paid_at,
        message: `Payment of ₹${paymentAmount.toLocaleString()} recorded.`,
      });
    }

    // Ensure bills exist for student
    await ensureBillsForStudents(hostelId);

    // Get unpaid rows for student, ordered by oldest first (year ASC, month ASC)
    const [unpaidRows] = await pool.execute(
      `SELECT id, month, year, amount, amount_due, amount_paid 
       FROM payments 
       WHERE student_id = ? AND COALESCE(amount_paid, 0) < COALESCE(amount_due, amount)
       ORDER BY year ASC, FIELD(month, 'January','February','March','April','May','June','July','August','September','October','November','December') ASC`,
      [studentId]
    );

    const unpaid = unpaidRows as Array<Record<string, unknown>>;

    if (unpaid.length === 0) {
      return NextResponse.json(
        { error: "No pending dues for this student. All bills are cleared." },
        { status: 400 }
      );
    }

    const recordedAt = new Date();
    let remaining = paymentAmount;
    const updatedIds: number[] = [];

    // Allocate payment to oldest pending dues first (FIFO)
    for (const row of unpaid) {
      if (remaining <= 0) break;

      const id = Number(row.id);
      const amountDue = Number(row.amount_due ?? row.amount ?? 0);
      const amountPaid = Number(row.amount_paid ?? 0);
      const balance = amountDue - amountPaid;

      if (balance <= 0) continue;

      const toApply = Math.min(remaining, balance);
      const newAmountPaid = amountPaid + toApply;
      remaining -= toApply;

      const isFullyPaid = newAmountPaid >= amountDue;

      await pool.execute(
        `UPDATE payments SET amount_paid = ?, status = ?, paid_at = ? WHERE id = ?`,
        [newAmountPaid, isFullyPaid ? "paid" : "pending", isFullyPaid ? recordedAt : null, id]
      );
      updatedIds.push(id);
    }

    // Log payment transaction (date/time)
    try {
      await pool.execute(
        `INSERT INTO payment_transactions (student_id, amount, recorded_at) VALUES (?, ?, ?)`,
        [studentId, paymentAmount, recordedAt]
      );
    } catch {
      // Table may not exist if migration not run
    }

    await updateOverduePayments(hostelId);

    // Return summary - fetch updated payments for response
    const [summaryRows] = await pool.execute(
      `SELECT p.*, s.name as student_name FROM payments p 
       JOIN students s ON p.student_id = s.id 
       WHERE p.student_id = ? 
       ORDER BY p.year ASC, FIELD(p.month, 'January','February','March','April','May','June','July','August','September','October','November','December') ASC`,
      [studentId]
    );

    const totalDue = (summaryRows as Array<Record<string, unknown>>).reduce(
      (sum, r) =>
        sum +
        Math.max(
          0,
          Number(r.amount_due ?? r.amount ?? 0) - Number(r.amount_paid ?? 0)
        ),
      0
    );

    return NextResponse.json({
      success: true,
      amount: paymentAmount,
      recorded_at: recordedAt,
      updated_payment_ids: updatedIds,
      total_outstanding: totalDue,
      message: `Payment of ₹${paymentAmount.toLocaleString()} recorded. Outstanding: ₹${totalDue.toLocaleString()}`,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to record payment" },
      { status: 500 }
    );
  }
}
