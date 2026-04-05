import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
import { isPlanAvailableForPurchase } from "@/lib/subscription/constants";
export { dynamic } from "@/lib/forceDynamicRoute";

const VALID_PLANS = ["basic", "pro", "enterprise"];

export async function POST(request: NextRequest) {
  try {
    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json(
        { success: false, message: "Hostel context required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { planId } = body;

    if (
      !planId ||
      !VALID_PLANS.includes(planId) ||
      !isPlanAvailableForPurchase(planId)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid plan. Choose basic, pro, or enterprise." },
        { status: 400 }
      );
    }

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    await pool.execute(
      `INSERT INTO hostel_subscriptions (hostel_id, plan_id, status, started_at, expires_at)
       VALUES (?, ?, 'active', ?, ?)
       ON DUPLICATE KEY UPDATE
         plan_id = VALUES(plan_id),
         status = 'active',
         started_at = VALUES(started_at),
         expires_at = VALUES(expires_at),
         cancelled_at = NULL,
         grace_period_ends_at = NULL,
         trial_ends_at = NULL,
         updated_at = CURRENT_TIMESTAMP`,
      [hostelId, planId, now, expiresAt]
    );

    return NextResponse.json({
      success: true,
      message: "Subscription activated successfully",
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Subscription activate error:", error);
    const err = error as { code?: string; message?: string };
    const tableMissing =
      err.code === "ER_NO_SUCH_TABLE" ||
      (err.message && String(err.message).includes("doesn't exist"));
    if (tableMissing) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Subscription tables not set up. Please run: mysql -u root -p hostelhub < scripts/migrate-subscriptions.sql",
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Failed to activate subscription" },
      { status: 500 }
    );
  }
}
