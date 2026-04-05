import { NextRequest, NextResponse } from "next/server";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
import { validateHostelSubscription } from "./validate";
import {
  API_SUBSCRIPTION_ERROR_CODE,
  API_SUBSCRIPTION_ERROR_STATUS,
} from "./constants";
import { requireSubscription } from "./RequireSubscription";
import { planHasAdvancedFeatures } from "./planFeatures";

/** Server / Route handlers only — pulls in DB via validate */
export async function requireAdvancedPlan(
  request: NextRequest | Request
): Promise<NextResponse | null> {
  const subErr = await requireSubscription(request);
  if (subErr) return subErr;

  const hostelId = getHostelIdFromRequest(request);
  if (hostelId == null) return null;

  const { status } = await validateHostelSubscription(hostelId);
  if (!planHasAdvancedFeatures(status?.planId)) {
    return NextResponse.json(
      {
        success: false,
        code: API_SUBSCRIPTION_ERROR_CODE,
        message:
          "Expense tracking, profit insights, and dashboard charts are part of the Pro plan. Upgrade to unlock.",
        featureLocked: true,
      },
      { status: API_SUBSCRIPTION_ERROR_STATUS }
    );
  }
  return null;
}
