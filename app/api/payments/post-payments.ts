import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
import { requireSubscription } from "@/lib/subscription/RequireSubscription";
import { assertDashboardPermission } from "@/lib/dashboardPermission.server";
import {
  updateOverduePayments,
  hasPartialPaymentColumns,
  hasPaymentReferenceColumns,
  hasPaymentBillProofOnPayments,
  ensureBillsForStudents,
} from "@/lib/PaymentUtils";
import { MONTHS, MONTH_FIELD_ASC_SQL } from "./constants";
import {
  assertPaymentReferenceAllowed,
  insertPaymentTransactionRow,
} from "./payment-proof";

export async function handlePostPayments(request: NextRequest) {
  try {
    const subErr = await requireSubscription(request);
    if (subErr) return subErr;

    const denied = await assertDashboardPermission(request, "payments", "add");
    if (denied) return denied;

    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
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

    const monthName = MONTHS.includes(month as (typeof MONTHS)[number])
      ? (month as string)
      : MONTHS[Number(month) - 1] || String(month);
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

    if (!hasNewColumns) {
      return handleLegacyPaymentPath({
        studentId,
        paymentAmount,
        monthName,
        yearNum,
        hasBillCols,
        hasRefCols,
        paymentProof,
        hostelId,
      });
    }

    return handlePartialAllocationPath({
      studentId,
      paymentAmount,
      hasBillCols,
      hasRefCols,
      paymentProof,
      hostelId,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
  }
}

async function handleLegacyPaymentPath(input: {
  studentId: number;
  paymentAmount: number;
  monthName: string;
  yearNum: number;
  hasBillCols: boolean;
  hasRefCols: boolean;
  paymentProof: { mode: "cash" | "online" | null; reference: string | null };
  hostelId: number;
}) {
  const {
    studentId,
    paymentAmount,
    monthName,
    yearNum,
    hasBillCols,
    hasRefCols,
    paymentProof,
    hostelId,
  } = input;

  const [existingRows] = await pool.execute(
    "SELECT id, amount FROM payments WHERE student_id = ? AND month = ? AND year = ? LIMIT 1",
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

    const recordedAt = new Date();
    if (hasBillCols && paymentProof.mode && paymentProof.reference) {
      await pool.execute(
        "UPDATE payments SET status = 'paid', paid_at = ?, bill_payment_mode = ?, bill_payment_reference = ? WHERE id = ?",
        [recordedAt, paymentProof.mode, paymentProof.reference, existing.id]
      );
    } else {
      await pool.execute("UPDATE payments SET status = 'paid', paid_at = ? WHERE id = ?", [
        recordedAt,
        existing.id,
      ]);
    }

    await insertPaymentTransactionRow(
      studentId,
      paymentAmount,
      recordedAt,
      paymentProof,
      hasRefCols
    );
    await updateOverduePayments(hostelId);
    return responseForPaymentId(Number(existing.id), studentId, paymentAmount);
  }

  const recordedAt = new Date();
  let paymentId: number;
  if (hasBillCols && paymentProof.mode && paymentProof.reference) {
    const [insertResult] = await pool.execute(
      `INSERT INTO payments (student_id, amount, month, year, status, paid_at, bill_payment_mode, bill_payment_reference)
       VALUES (?, ?, ?, ?, 'paid', ?, ?, ?)`,
      [
        studentId,
        paymentAmount,
        monthName,
        yearNum,
        recordedAt,
        paymentProof.mode,
        paymentProof.reference,
      ]
    );
    paymentId = (insertResult as { insertId: number }).insertId;
  } else {
    const [insertResult] = await pool.execute(
      `INSERT INTO payments (student_id, amount, month, year, status, paid_at)
       VALUES (?, ?, ?, ?, 'paid', ?)`,
      [studentId, paymentAmount, monthName, yearNum, recordedAt]
    );
    paymentId = (insertResult as { insertId: number }).insertId;
  }

  await insertPaymentTransactionRow(studentId, paymentAmount, recordedAt, paymentProof, hasRefCols);
  await updateOverduePayments(hostelId);
  return responseForPaymentId(paymentId, studentId, paymentAmount);
}

async function responseForPaymentId(paymentId: number, studentId: number, paymentAmount: number) {
  const [updatedRows] = await pool.execute("SELECT * FROM payments WHERE id = ?", [paymentId]);
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

async function handlePartialAllocationPath(input: {
  studentId: number;
  paymentAmount: number;
  hasBillCols: boolean;
  hasRefCols: boolean;
  paymentProof: { mode: "cash" | "online" | null; reference: string | null };
  hostelId: number;
}) {
  const { studentId, paymentAmount, hasBillCols, hasRefCols, paymentProof, hostelId } = input;

  await ensureBillsForStudents(hostelId);

  const [unpaidRows] = await pool.execute(
    `SELECT id, month, year, amount, amount_due, amount_paid 
     FROM payments 
     WHERE student_id = ? AND COALESCE(amount_paid, 0) < COALESCE(amount_due, amount)
     ORDER BY year ASC, ${MONTH_FIELD_ASC_SQL}`,
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
    const writeBillOnRow =
      hasBillCols &&
      hasRefCols &&
      isFullyPaid &&
      Boolean(paymentProof.mode && paymentProof.reference);

    if (writeBillOnRow) {
      await pool.execute(
        "UPDATE payments SET amount_paid = ?, status = 'paid', paid_at = ?, bill_payment_mode = ?, bill_payment_reference = ? WHERE id = ?",
        [newAmountPaid, recordedAt, paymentProof.mode, paymentProof.reference, id]
      );
    } else {
      await pool.execute("UPDATE payments SET amount_paid = ?, status = ?, paid_at = ? WHERE id = ?", [
        newAmountPaid,
        isFullyPaid ? "paid" : "pending",
        isFullyPaid ? recordedAt : null,
        id,
      ]);
    }

    updatedIds.push(id);
  }

  await insertPaymentTransactionRow(studentId, paymentAmount, recordedAt, paymentProof, hasRefCols);
  await updateOverduePayments(hostelId);

  const [summaryRows] = await pool.execute(
    `SELECT p.*, s.name as student_name FROM payments p 
     JOIN students s ON p.student_id = s.id 
     WHERE p.student_id = ? 
     ORDER BY p.year ASC, FIELD(p.month, 'January','February','March','April','May','June','July','August','September','October','November','December') ASC`,
    [studentId]
  );

  const totalDue = (summaryRows as Array<Record<string, unknown>>).reduce(
    (sum, r) => sum + Math.max(0, Number(r.amount_due ?? r.amount ?? 0) - Number(r.amount_paid ?? 0)),
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
}
