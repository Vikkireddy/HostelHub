import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
import { hasPaymentReferenceColumns } from "@/lib/PaymentUtils";
import { requireSubscription } from "@/lib/subscription/RequireSubscription";
import { assertDashboardPermission } from "@/lib/dashboardPermission.server";
export { dynamic } from "@/lib/forceDynamicRoute";

/**
 * Lowercased, trimmed payment_reference values already used for this hostel
 * (cash bill numbers and online UTRs share one column; duplicates blocked per hostel).
 */
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

    const hasRef = await hasPaymentReferenceColumns();
    if (!hasRef) {
      return NextResponse.json({ references: [] as string[] });
    }

    try {
      const [rows] = await pool.execute(
        `SELECT DISTINCT LOWER(TRIM(pt.payment_reference)) AS ref
         FROM payment_transactions pt
         INNER JOIN students s ON s.id = pt.student_id
         WHERE s.hostel_id = ?
           AND pt.payment_reference IS NOT NULL
           AND CHAR_LENGTH(TRIM(pt.payment_reference)) > 0`,
        [hostelId]
      );
      const list = (rows as Array<{ ref: string | null }>)
        .map((r) => (r.ref ?? "").trim())
        .filter(Boolean);
      return NextResponse.json({ references: list });
    } catch (error) {
      const err = error as { code?: string };
      if (err.code === "ER_NO_SUCH_TABLE") {
        return NextResponse.json({ references: [] as string[] });
      }
      throw error;
    }
  } catch (error) {
    console.error("used-references error:", error);
    return NextResponse.json(
      { error: "Failed to load payment references" },
      { status: 500 }
    );
  }
}
