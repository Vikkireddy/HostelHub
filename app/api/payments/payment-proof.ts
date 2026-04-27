import pool from "@/lib/db";

export type PaymentProof = {
  mode: "cash" | "online" | null;
  reference: string | null;
};

export async function assertPaymentReferenceAllowed(
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

export async function insertPaymentTransactionRow(
  studentId: number,
  paymentAmount: number,
  recordedAt: Date,
  proof: PaymentProof,
  hasRefCols: boolean
): Promise<void> {
  if (hasRefCols && proof.mode && proof.reference) {
    await pool.execute(
      "INSERT INTO payment_transactions (student_id, amount, recorded_at, payment_mode, payment_reference) VALUES (?, ?, ?, ?, ?)",
      [studentId, paymentAmount, recordedAt, proof.mode, proof.reference]
    );
    return;
  }

  try {
    await pool.execute(
      "INSERT INTO payment_transactions (student_id, amount, recorded_at) VALUES (?, ?, ?)",
      [studentId, paymentAmount, recordedAt]
    );
  } catch {
    // Older DB without payment_transactions table.
  }
}
