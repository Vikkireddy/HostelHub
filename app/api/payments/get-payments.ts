import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
import { requireSubscription } from "@/lib/subscription/RequireSubscription";
import { assertDashboardPermission } from "@/lib/dashboardPermission.server";
import {
  getDueDate,
  getDaysInfo,
  updateOverduePayments,
  hasPaymentReferenceColumns,
  hasPaymentBillProofOnPayments,
} from "@/lib/PaymentUtils";
import { MONTH_FIELD_DESC_SQL } from "./constants";

export async function handleGetPayments(request: NextRequest) {
  try {
    const subErr = await requireSubscription(request);
    if (subErr) return subErr;

    const denied = await assertDashboardPermission(request, "payments", "view");
    if (denied) return denied;

    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) return NextResponse.json([], { status: 200 });

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
      LIMIT 1
    )`;
    const txnBillRefSub = `(
      SELECT pt.payment_reference FROM payment_transactions pt
      WHERE pt.student_id = p.student_id
        AND p.status = 'paid'
        AND p.paid_at IS NOT NULL
        AND pt.payment_reference IS NOT NULL AND CHAR_LENGTH(TRIM(pt.payment_reference)) > 0
        AND ABS(TIMESTAMPDIFF(SECOND, pt.recorded_at, p.paid_at)) <= 604800
      ORDER BY ABS(TIMESTAMPDIFF(SECOND, pt.recorded_at, p.paid_at)) ASC, pt.id DESC
      LIMIT 1
    )`;

    const billProofSelect = getBillProofSelect(hasBillCols, hasRefCols, txnBillModeSub, txnBillRefSub);
    const rows = await fetchPaymentRows(hostelId, billProofSelect);
    const resultRows = rows as Array<Record<string, unknown>>;
    const latestBillByStudent = await fetchLatestBillByStudent(resultRows, hasRefCols);

    const result = resultRows.map((row) => {
      const status = String(row.status ?? "");
      const month = String(row.month ?? "");
      const year = Number(row.year ?? 0);
      const joinDate = (row.student_join_date as string | null) ?? null;
      const amountDue = Number(row.amount_due ?? row.amount ?? 0);
      const amountPaid = Number(row.amount_paid ?? 0);
      const balance = amountDue - amountPaid;
      const daysInfo =
        status !== "paid" ? getDaysInfo(getDueDate(month, year, joinDate)) : null;

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
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}

function getBillProofSelect(
  hasBillCols: boolean,
  hasRefCols: boolean,
  txnBillModeSub: string,
  txnBillRefSub: string
) {
  if (hasBillCols && hasRefCols) {
    return `,
      COALESCE(p.bill_payment_mode, ${txnBillModeSub}) AS bill_payment_mode,
      COALESCE(p.bill_payment_reference, ${txnBillRefSub}) AS bill_payment_reference`;
  }
  if (hasBillCols) return ", p.bill_payment_mode, p.bill_payment_reference";
  if (hasRefCols) {
    return `,
      ${txnBillModeSub} AS bill_payment_mode,
      ${txnBillRefSub} AS bill_payment_reference`;
  }
  return "";
}

async function fetchPaymentRows(hostelId: number, billProofSelect: string) {
  try {
    const [rows] = await pool.execute(
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
       ORDER BY p.year DESC, ${MONTH_FIELD_DESC_SQL}, p.created_at DESC LIMIT 100`,
      [hostelId, hostelId]
    );
    return rows;
  } catch (error) {
    const err = error as { code?: string };
    if (err.code !== "ER_NO_SUCH_TABLE") throw error;
    const [rows] = await pool.execute(
      `SELECT p.*, s.name as student_name, s.join_date as student_join_date, p.paid_at as last_payment_at
       FROM payments p 
       JOIN students s ON p.student_id = s.id 
       WHERE (p.hostel_id = ? OR s.hostel_id = ?)
       ORDER BY p.year DESC, ${MONTH_FIELD_DESC_SQL}, p.created_at DESC LIMIT 100`,
      [hostelId, hostelId]
    );
    return rows;
  }
}

async function fetchLatestBillByStudent(
  resultRows: Array<Record<string, unknown>>,
  hasRefCols: boolean
) {
  const latestBillByStudent = new Map<number, { mode: string; ref: string }>();
  if (!hasRefCols || resultRows.length === 0) return latestBillByStudent;

  const studentIds = [
    ...new Set(
      resultRows
        .map((r) => Number(r.student_id ?? 0))
        .filter((id) => Number.isFinite(id) && id > 0)
    ),
  ];
  if (studentIds.length === 0) return latestBillByStudent;

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
    // payment_transactions missing or unreadable; list still works.
  }

  return latestBillByStudent;
}
