import pool from "@/lib/db";
import type { SubscriptionStatusResponse } from "./types";
import { API_SUBSCRIPTION_ERROR_CODE, API_SUBSCRIPTION_ERROR_STATUS } from "./constants";

export interface SubscriptionValidationResult {
  valid: boolean;
  status: SubscriptionStatusResponse | null;
  errorResponse?: { status: number; body: object };
}

export async function validateHostelSubscription(
  hostelId: number
): Promise<SubscriptionValidationResult> {
  try {
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
      return {
        valid: false,
        status: {
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
        },
        errorResponse: {
          status: API_SUBSCRIPTION_ERROR_STATUS,
          body: {
            success: false,
            code: API_SUBSCRIPTION_ERROR_CODE,
            message: "Active subscription required. Please choose a plan.",
          },
        },
      };
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

    const valid = hasActiveSubscription && !isPaymentFailed;

    if (!valid) {
      let bannerType: "subscription_required" | "subscription_expired" | "trial_expired" | "payment_failed" | "grace_period" = "subscription_expired";
      if (isPaymentFailed) bannerType = "payment_failed";
      else if (isTrialExpired) bannerType = "trial_expired";
      else if (isInGracePeriod) bannerType = "grace_period";
      else if (isExpired || isCancelled) bannerType = "subscription_expired";
      else bannerType = "subscription_required";

      return {
        valid: false,
        status: {
          hasActiveSubscription: false,
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
        },
        errorResponse: {
          status: API_SUBSCRIPTION_ERROR_STATUS,
          body: {
            success: false,
            code: API_SUBSCRIPTION_ERROR_CODE,
            message: "Your subscription has expired. Please renew to continue.",
          },
        },
      };
    }

    return {
      valid: true,
      status: {
        hasActiveSubscription: true,
        status: sub.status as SubscriptionStatusResponse["status"],
        planId: sub.plan_id,
        planName: sub.plan_name,
        expiresAt: expiresAt?.toISOString() ?? null,
        gracePeriodEndsAt: gracePeriodEndsAt?.toISOString() ?? null,
        trialEndsAt: trialEndsAt?.toISOString() ?? null,
        isInGracePeriod,
        isTrial,
        isPaymentFailed: false,
        isOwner: true,
        bannerType: null,
      },
    };
  } catch (error) {
    console.error("Subscription validation error:", error);
    const err = error as { code?: string; message?: string };
    const tableMissing =
      err.code === "ER_NO_SUCH_TABLE" ||
      (err.message && String(err.message).includes("doesn't exist"));
    if (tableMissing) {
      return {
        valid: false,
        status: {
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
        },
        errorResponse: {
          status: API_SUBSCRIPTION_ERROR_STATUS,
          body: {
            success: false,
            code: API_SUBSCRIPTION_ERROR_CODE,
            message: "Active subscription required. Please choose a plan.",
          },
        },
      };
    }
    return {
      valid: false,
      status: null,
      errorResponse: {
        status: 500,
        body: {
          success: false,
          code: API_SUBSCRIPTION_ERROR_CODE,
          message: "Failed to validate subscription",
        },
      },
    };
  }
}
