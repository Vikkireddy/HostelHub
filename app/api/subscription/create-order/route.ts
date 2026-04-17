import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
import { isPlanAvailableForPurchase, SUBSCRIPTION_PLANS } from "@/lib/subscription/constants";
export { dynamic } from "@/lib/forceDynamicRoute";

const VALID_PLANS = ["basic", "pro", "enterprise"];

export async function POST(request: NextRequest) {
  try {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { success: false, message: "Razorpay is not configured. Add NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local" },
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
    const { planId } = body;

    if (!planId || !VALID_PLANS.includes(planId)) {
      return NextResponse.json(
        { success: false, message: "Invalid plan. Choose Base, Pro, or Pro Plus." },
        { status: 400 }
      );
    }

    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
    if (!plan || !isPlanAvailableForPurchase(planId)) {
      return NextResponse.json(
        { success: false, message: "This plan is not available yet." },
        { status: 400 }
      );
    }

    const amountInPaise = Math.round(plan.price_monthly * 100);
    const receipt = `hostel_${hostelId}_${planId}_${Date.now()}`;

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        hostel_id: String(hostelId),
        plan_id: planId,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: amountInPaise,
      currency: "INR",
      keyId,
      planId,
      planName: plan.name,
    });
  } catch (error) {
    console.error("Create order error:", error);
    const err = error as {
      statusCode?: number;
      error?: { description?: string; code?: string };
    };
    if (err.statusCode === 401) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Razorpay authentication failed. Verify NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET (same mode: test or live).",
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: err.error?.description || "Failed to create payment order",
      },
      { status: 500 }
    );
  }
}
