import { NextRequest } from "next/server";
import { handleGetPayments } from "./get-payments";
import { handlePostPayments } from "./post-payments";
export { dynamic } from "@/lib/forceDynamicRoute";

export async function GET(request: NextRequest) {
  return handleGetPayments(request);
}

export async function POST(request: NextRequest) {
  return handlePostPayments(request);
}
