import { NextRequest, NextResponse } from "next/server";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
import { validateHostelSubscription } from "./validate";
import {
  API_SUBSCRIPTION_ERROR_CODE,
  API_SUBSCRIPTION_ERROR_STATUS,
//    BYPASS_SUBSCRIPTION_CHECK,
} from "./constants";

export async function requireSubscription(
  request: NextRequest | Request
): Promise<NextResponse | null> {
//    if (BYPASS_SUBSCRIPTION_CHECK) return null;

  const hostelId = getHostelIdFromRequest(request);
  if (hostelId == null) return null;

  const result = await validateHostelSubscription(hostelId);
  if (result.valid) return null;

  return NextResponse.json(
    {
      success: false,
      code: API_SUBSCRIPTION_ERROR_CODE,
      message: result.errorResponse?.body
        ? (result.errorResponse.body as { message?: string }).message
        : "Active subscription required. Please renew to continue.",
    },
    { status: API_SUBSCRIPTION_ERROR_STATUS }
  );
}
