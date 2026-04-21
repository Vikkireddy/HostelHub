import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
import { requireSubscription } from "@/lib/subscription/RequireSubscription";
import { assertDashboardPermission } from "@/lib/dashboardPermission.server";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

import {
  getDueDate,
  getDaysInfo,
  updateOverduePayments,
  hasPartialPaymentColumns,
  hasPaymentReferenceColumns,
  hasPaymentBillProofOnPayments,
  ensureBillsForStudents,
} from "@/lib/PaymentUtils";
export { dynamic } from "@/lib/forceDynamicRoute";

type PaymentProof = { mode: "cash" | "online" | null; reference: string | null };

async function assertPaymentReferenceAllowed(
  hostelId: number,
  body: Record<string, unknown>,
  hasRefCols: boolean
): Promise<
  { ok: true; proof: PaymentProof } | { ok: false; status: number; error: string }
> {
  const mode = body.payment_mode;
  const refTrim =
    typeof body.payment_reference === "string" ? body.payment_reference.trim() : "";

  const usesNewPaymentProof = mode === "cash" || mode === "online";

  if (!usesNewPaymentProof) {
    return { ok: true, proof: { mode: null, reference: null } };
  }

  if (!hasRefCols) {
    return {
      ok: false,
      status: 400,
        error:
        "Recording bill numbers and UTRs requires a database update. Run: node scripts/run-migrate-payment-transaction-reference.js (adds columns on payment_transactions and payments).",
    };
  }

  if (!refTrim) {
    return {
      ok: false,
      status: 400,
      error:
        mode === "cash"
          ? "Bill number is required for cash payments."
          : "UTR number is required for online payments.",
    };
  }

  const [dupRows] = await pool.execute(
    `SELECT pt.id
     FROM payment_transactions pt
     INNER JOIN students s ON s.id = pt.student_id
     WHERE s.hostel_id = ?
       AND LOWER(TRIM(pt.payment_reference)) = LOWER(?)
     LIMIT 1`,
    [hostelId, refTrim]
  );
  if ((dupRows as unknown[]).length > 0) {
    return {
      ok: false,
      status: 409,
      error:
        mode === "cash"
          ? "This bill number is already used for another payment in your hostel."
          : "This UTR number is already used for another payment in your hostel.",
    };
  }

  return { ok: true, proof: { mode: mode as "cash" | "online", reference: refTrim } };
}

async function insertPaymentTransactionRow(
  studentId: number,
  paymentAmount: number,
  recordedAt: Date,
  proof: PaymentProof,
  hasRefCols: boolean
): Promise<void> {
  if (hasRefCols && proof.mode && proof.reference) {
    await pool.execute(
      `INSERT INTO payment_transactions (student_id, amount, recorded_at, payment_mode, payment_reference) VALUES (?, ?, ?, ?, ?)`,
      [studentId, paymentAmount, recordedAt, proof.mode, proof.reference]
    );
    return;
  }
  try {
    await pool.execute(
      `INSERT INTO payment_transactions (student_id, amount, recorded_at) VALUES (?, ?, ?)`,
      [studentId, paymentAmount, recordedAt]
    );
  } catch {
    // Older DB without payment_transactions table
  }
}

export async function GET(request: NextRequest) {
  try {
    const subErr = await requireSubscription(request);
    if (subErr) return subErr;

    const denied = await assertDashboardPermission(request, "payments", "view");
    if (denied) return denied;

    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json([], { status: 200 });
    }

    await updateOverduePayments(hostelId);

    const hasRefCols = await hasPaymentReferenceColumns();
    const hasBillCols = await hasPaymentBillProofOnPayments();
    const txnBillModeSub = `(
            SELECT pt.payment_mode FROM payment_transactions pt
            WHERE pt.student_id = p.student_id
              AND p.status = 'paid'
              AND p.paid_at IS NOT NULL
              AND pt.payment_reference IS NOT NULL AND CHAR_LENGTH(TRIM(pt.payment_reference)) > 0
              AND ABS(TIMESTAMPDIFF(SECOND, pt.recorded_at, p.paid_at)) <= 604800
            ORDER BY ABS(TIMESTAMPDIFF(SECOND, pt.recorded_at, p.paid_at)) ASC, pt.id DESC
            LIMIT 1)`;
    const txnBillRefSub = `(
            SELECT pt.payment_reference FROM payment_transactions pt
            WHERE pt.student_id = p.student_id
              AND p.status = 'paid'
              AND p.paid_at IS NOT NULL
              AND pt.payment_reference IS NOT NULL AND CHAR_LENGTH(TRIM(pt.payment_reference)) > 0
              AND ABS(TIMESTAMPDIFF(SECOND, pt.recorded_at, p.paid_at)) <= 604800
            ORDER BY ABS(TIMESTAMPDIFF(SECOND, pt.recorded_at, p.paid_at)) ASC, pt.id DESC
            LIMIT 1)`;
    let billProofSelect = "";
    if (hasBillCols && hasRefCols) {
      billProofSelect = `,
          COALESCE(p.bill_payment_mode, ${txnBillModeSub}) AS bill_payment_mode,
          COALESCE(p.bill_payment_reference, ${txnBillRefSub}) AS bill_payment_reference`;
    } else if (hasBillCols) {
      billProofSelect = `,
          p.bill_payment_mode, p.bill_payment_reference`;
    } else if (hasRefCols) {
      billProofSelect = `,
          ${txnBillModeSub} AS bill_payment_mode,
          ${txnBillRefSub} AS bill_payment_reference`;
    }

    let rows: unknown;
    try {
      [rows] = await pool.execute(
        `SELECT p.*, s.name as student_name, s.join_date as student_join_date,
          (
            SELECT MAX(pt.recorded_at)
            FROM payment_transactions pt
            WHERE pt.student_id = p.student_id
          ) as last_payment_at
          ${billProofSelect}
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

    const resultRows = rows as Array<Record<string, unknown>>;
    const latestBillByStudent = new Map<number, { mode: string; ref: string }>();
    if (hasRefCols && resultRows.length > 0) {
      const studentIds = [
        ...new Set(
          resultRows
            .map((r) => Number(r.student_id ?? 0))
            .filter((id) => Number.isFinite(id) && id > 0)
        ),
      ];
      if (studentIds.length > 0) {
        try {
          const placeholders = studentIds.map(() => "?").join(",");
          const [txRows] = await pool.execute(
            `SELECT pt.student_id, pt.payment_mode, pt.payment_reference, pt.recorded_at, pt.id
             FROM payment_transactions pt
             WHERE pt.student_id IN (${placeholders})
               AND pt.payment_reference IS NOT NULL AND CHAR_LENGTH(TRIM(pt.payment_reference)) > 0
             ORDER BY pt.student_id ASC, pt.recorded_at DESC, pt.id DESC`,
            studentIds
          );
          for (const tr of txRows as Array<Record<string, unknown>>) {
            const sid = Number(tr.student_id ?? 0);
            if (!sid || latestBillByStudent.has(sid)) continue;
            const ref = String(tr.payment_reference ?? "").trim();
            if (!ref) continue;
            latestBillByStudent.set(sid, {
              mode: String(tr.payment_mode ?? "").trim(),
              ref,
            });
          }
        } catch {
          // payment_transactions missing or unreadable; list still works without last-ref fallback
        }
      }
    }

    const result = resultRows.map((row) => {
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

      let billMode = row.bill_payment_mode as string | null | undefined;
      let billRef = row.bill_payment_reference as string | null | undefined;
      if (hasRefCols && !String(billRef ?? "").trim()) {
        const last = latestBillByStudent.get(Number(row.student_id ?? 0));
        if (last?.ref) {
          billMode = last.mode || billMode || null;
          billRef = last.ref;
        }
      }

      return {
        ...row,
        ...(hasRefCols
          ? { bill_payment_mode: billMode ?? null, bill_payment_reference: billRef ?? null }
          : {}),
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
export async function POST(request: NextRequest) {
  try {
    const subErr = await requireSubscription(request);
    if (subErr) return subErr;

    const denied = await assertDashboardPermission(request, "payments", "add");
    if (denied) return denied;

    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { student_id, amount, month, year } = body;

    if (!student_id || amount == null || amount === "" || !month || !year) {
      return NextResponse.json(
        { error: "Resident selection, amount, month, and year are required" },
        { status: 400 }
      );
    }

    const hasRefCols = await hasPaymentReferenceColumns();
    const refAssert = await assertPaymentReferenceAllowed(hostelId, body, hasRefCols);
    if (!refAssert.ok) {
      return NextResponse.json({ error: refAssert.error }, { status: refAssert.status });
    }
    const paymentProof = refAssert.proof;

    const monthName = MONTHS.includes(month) ? month : MONTHS[Number(month) - 1] || month;
    const paymentAmount = Number(amount);
    const studentId = Number(student_id);
    const yearNum = Number(year);
    const hasNewColumns = await hasPartialPaymentColumns();
    const hasBillCols = await hasPaymentBillProofOnPayments();

    const [studentRows] = await pool.execute(
      `SELECT s.id, s.join_date, r.rent as room_rent FROM students s
       LEFT JOIN rooms r ON s.room_id = r.id WHERE s.id = ? AND s.hostel_id = ?`,
      [studentId, hostelId]
    );
    const student = (studentRows as Array<Record<string, unknown>>)[0];
    if (!student) {
      return NextResponse.json({ error: "Resident not found" }, { status: 400 });
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
        const recordedAtLegacy = new Date();
        const proofMode = paymentProof.mode;
        const proofRef = paymentProof.reference;
        if (hasBillCols && proofMode && proofRef) {
          await pool.execute(
            `UPDATE payments SET status = 'paid', paid_at = ?, bill_payment_mode = ?, bill_payment_reference = ? WHERE id = ?`,
            [recordedAtLegacy, proofMode, proofRef, existing.id]
          );
        } else {
          await pool.execute(
            `UPDATE payments SET status = 'paid', paid_at = ? WHERE id = ?`,
            [recordedAtLegacy, existing.id]
          );
        }
        await insertPaymentTransactionRow(
          studentId,
          paymentAmount,
          recordedAtLegacy,
          paymentProof,
          hasRefCols
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
      const recordedAtLegacyInsert = new Date();
      const proofModeIns = paymentProof.mode;
      const proofRefIns = paymentProof.reference;
      let paymentId: number;
      if (hasBillCols && proofModeIns && proofRefIns) {
        const [insertResult] = await pool.execute(
          `INSERT INTO payments (student_id, amount, month, year, status, paid_at, bill_payment_mode, bill_payment_reference)
           VALUES (?, ?, ?, ?, 'paid', ?, ?, ?)`,
          [
            studentId,
            paymentAmount,
            monthName,
            yearNum,
            recordedAtLegacyInsert,
            proofModeIns,
            proofRefIns,
          ]
        );
        paymentId = (insertResult as { insertId: number }).insertId;
      } else {
        const [insertResult] = await pool.execute(
          `INSERT INTO payments (student_id, amount, month, year, status, paid_at)
           VALUES (?, ?, ?, ?, 'paid', ?)`,
          [studentId, paymentAmount, monthName, yearNum, recordedAtLegacyInsert]
        );
        paymentId = (insertResult as { insertId: number }).insertId;
      }
      await insertPaymentTransactionRow(
        studentId,
        paymentAmount,
        recordedAtLegacyInsert,
        paymentProof,
        hasRefCols
      );
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
        { error: "No pending dues for this resident. All bills are cleared." },
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
      const proofMode = paymentProof.mode;
      const proofRef = paymentProof.reference;
      const writeBillOnRow =
        hasBillCols && hasRefCols && isFullyPaid && Boolean(proofMode && proofRef);

      if (writeBillOnRow) {
        await pool.execute(
          `UPDATE payments SET amount_paid = ?, status = 'paid', paid_at = ?, bill_payment_mode = ?, bill_payment_reference = ? WHERE id = ?`,
          [newAmountPaid, recordedAt, proofMode, proofRef, id]
        );
      } else {
        await pool.execute(
          `UPDATE payments SET amount_paid = ?, status = ?, paid_at = ? WHERE id = ?`,
          [newAmountPaid, isFullyPaid ? "paid" : "pending", isFullyPaid ? recordedAt : null, id]
        );
      }
      updatedIds.push(id);
    }

    // Log payment transaction (date/time, optional bill / UTR)
    await insertPaymentTransactionRow(
      studentId,
      paymentAmount,
      recordedAt,
      paymentProof,
      hasRefCols
    );

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
