import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
export { dynamic } from "@/lib/forceDynamicRoute";

const DEFAULT_TRIAL_PLAN_ID = "basic";

export async function POST(request: NextRequest) {
  try {
    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json(
        { success: false, message: "Hostel context required" },
        { status: 400 }
      );
    }

    const now = new Date();
    const trialEndsAt = new Date(now);
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    const [rows] = await pool.execute(
      `SELECT hs.id, hs.plan_id, hs.status, hs.expires_at, hs.trial_ends_at,
              sp.name as plan_name
       FROM hostel_subscriptions hs
       LEFT JOIN subscription_plans sp ON sp.id = hs.plan_id
       WHERE hs.hostel_id = ?
       ORDER BY hs.created_at DESC
       LIMIT 1`,
      [hostelId]
    );

    const subs = rows as {
      id: number;
      plan_id: string;
      status: string;
      expires_at: Date | null;
      trial_ends_at: Date | null;
      plan_name: string | null;
    }[];

    if (subs.length > 0) {
      const sub = subs[0];
      const expiresAt = sub.expires_at ? new Date(sub.expires_at) : null;
      const currentTrialEndsAt = sub.trial_ends_at
        ? new Date(sub.trial_ends_at)
        : null;

      const isTrialActive =
        sub.status === "trial" && currentTrialEndsAt && now <= currentTrialEndsAt;
      if (isTrialActive) {
        return NextResponse.json(
          { success: false, message: "Trial is already active for this hostel." },
          { status: 409 }
        );
      }

      // After trial is used, require a paid plan instead of restarting it.
      if (sub.status === "trial") {
        return NextResponse.json(
          { success: false, message: "Trial already used. Please choose a plan." },
          { status: 400 }
        );
      }

      const isActive = sub.status === "active" && expiresAt && now <= expiresAt;
      if (isActive) {
        return NextResponse.json(
          { success: false, message: "A subscription is already active." },
          { status: 409 }
        );
      }
    }

    await pool.execute(
      `INSERT INTO hostel_subscriptions
        (hostel_id, plan_id, status, started_at, expires_at, trial_ends_at, grace_period_ends_at, cancelled_at)
       VALUES (?, ?, 'trial', ?, NULL, ?, NULL, NULL)
       ON DUPLICATE KEY UPDATE
         plan_id = VALUES(plan_id),
         status = 'trial',
         started_at = VALUES(started_at),
         expires_at = NULL,
         trial_ends_at = VALUES(trial_ends_at),
         grace_period_ends_at = NULL,
         cancelled_at = NULL,
         updated_at = CURRENT_TIMESTAMP`,
      [hostelId, DEFAULT_TRIAL_PLAN_ID, now, trialEndsAt]
    );

    // Ensure plan name is returned for UI.
    const [planRows] = await pool.execute(
      `SELECT name FROM subscription_plans WHERE id = ? LIMIT 1`,
      [DEFAULT_TRIAL_PLAN_ID]
    );
    const planName = (planRows as { name: string }[])[0]?.name ?? "Basic";

    return NextResponse.json({
      success: true,
      message: "Trial started successfully",
      trialEndsAt: trialEndsAt.toISOString(),
      planId: DEFAULT_TRIAL_PLAN_ID,
      planName,
    });
  } catch (error) {
    console.error("Start trial error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to start trial" },
      { status: 500 }
    );
  }
}

