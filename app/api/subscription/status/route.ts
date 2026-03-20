import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
import type { SubscriptionStatusResponse, SubscriptionBannerType } from "@/lib/subscription/types";

export async function GET(request: NextRequest) {
  try {
    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json(
        { success: false, message: "Hostel context required" },
        { status: 400 }
      );
    }

    const [rows] = await pool.execute(
      `SELECT hs.id, hs.plan_id, hs.status, hs.expires_at, hs.grace_period_ends_at, hs.trial_ends_at,
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
      grace_period_ends_at: Date | null;
      trial_ends_at: Date | null;
      plan_name: string | null;
    }[];

    if (subs.length === 0) {
      const response: SubscriptionStatusResponse = {
        hasActiveSubscription: false,
        status: "expired",
        planId: null,
        planName: null,
        expiresAt: null,
        gracePeriodEndsAt: null,
        trialEndsAt: null,
        isInGracePeriod: false,
        isTrial: false,
        isPaymentFailed: false,
        isOwner: true,
        bannerType: "subscription_required",
      };
      return NextResponse.json({ success: true, ...response });
    }

    const sub = subs[0];
    const now = new Date();
    const expiresAt = sub.expires_at ? new Date(sub.expires_at) : null;
    const gracePeriodEndsAt = sub.grace_period_ends_at ? new Date(sub.grace_period_ends_at) : null;
    const trialEndsAt = sub.trial_ends_at ? new Date(sub.trial_ends_at) : null;

    const isExpired = expiresAt ? now > expiresAt : false;
    const isInGracePeriod =
      sub.status === "grace_period" && gracePeriodEndsAt ? now <= gracePeriodEndsAt : false;
    const isTrial = sub.status === "trial";
    const isTrialExpired = isTrial && trialEndsAt ? now > trialEndsAt : false;
    const isPaymentFailed = sub.status === "payment_failed";
    const isCancelled = sub.status === "cancelled";

    const hasActiveSubscription =
      (sub.status === "active" && !isExpired) ||
      (sub.status === "trial" && !isTrialExpired) ||
      (isInGracePeriod && sub.status === "grace_period");

    let bannerType: SubscriptionBannerType | null = null;
    if (!hasActiveSubscription || isPaymentFailed) {
      if (isPaymentFailed) bannerType = "payment_failed";
      else if (isTrialExpired) bannerType = "trial_expired";
      else if (isInGracePeriod) bannerType = "grace_period";
      else if (isExpired || isCancelled) bannerType = "subscription_expired";
      else bannerType = "subscription_required";
    }

    const response: SubscriptionStatusResponse = {
      hasActiveSubscription: hasActiveSubscription && !isPaymentFailed,
      status: sub.status as SubscriptionStatusResponse["status"],
      planId: sub.plan_id,
      planName: sub.plan_name,
      expiresAt: expiresAt?.toISOString() ?? null,
      gracePeriodEndsAt: gracePeriodEndsAt?.toISOString() ?? null,
      trialEndsAt: trialEndsAt?.toISOString() ?? null,
      isInGracePeriod,
      isTrial,
      isPaymentFailed,
      isOwner: true,
      bannerType,
    };

    return NextResponse.json({ success: true, ...response });
  } catch (error) {
    console.error("Subscription status error:", error);
    const err = error as { code?: string; message?: string };
    const tableMissing =
      err.code === "ER_NO_SUCH_TABLE" ||
      (err.message && String(err.message).includes("doesn't exist"));
    if (tableMissing) {
      return NextResponse.json({
        success: true,
        hasActiveSubscription: false,
        status: "expired",
        planId: null,
        planName: null,
        expiresAt: null,
        gracePeriodEndsAt: null,
        trialEndsAt: null,
        isInGracePeriod: false,
        isTrial: false,
        isPaymentFailed: false,
        isOwner: true,
        bannerType: "subscription_required",
      });
    }
    return NextResponse.json(
      { success: false, message: "Failed to fetch subscription status" },
      { status: 500 }
    );
  }
}
