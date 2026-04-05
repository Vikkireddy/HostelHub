import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
import { isPlanAvailableForPurchase } from "@/lib/subscription/constants";

const VALID_PLANS = ["basic", "pro", "enterprise"];

function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return expected === signature;
}

export async function POST(request: NextRequest) {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        { success: false, message: "Razorpay is not configured" },
        { status: 503 }
      );
    }

    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json(
        { success: false, message: "Hostel context required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
      return NextResponse.json(
        { success: false, message: "Missing payment details" },
        { status: 400 }
      );
    }

    if (!VALID_PLANS.includes(planId) || !isPlanAvailableForPurchase(planId)) {
      return NextResponse.json(
        { success: false, message: "Invalid plan" },
        { status: 400 }
      );
    }

    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      keySecret
    );

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Payment verification failed" },
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
      message: "Payment verified and subscription activated",
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
