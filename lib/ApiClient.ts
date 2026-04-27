import {
  API_SUBSCRIPTION_ERROR_STATUS,
  SUBSCRIPTION_PAGE_PATH,
} from "@/lib/subscription/constants";
import { useAuthStore } from "@/lib/AuthStore";

/**
 * API client that includes hostel_id header for multi-tenant data isolation.
 * Use this for all dashboard/data API calls.
 */
export function getHostelHeaders(hostelId: number | null): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (hostelId != null) {
    headers["X-Hostel-Id"] = String(hostelId);
  }
  if (typeof window !== "undefined") {
    const email = useAuthStore.getState().user?.email?.trim().toLowerCase();
    if (email) headers["X-Admin-Email"] = email;
  }
  return headers;
}

/**
 * Redirects to subscription page when API returns 402 (subscription required).
 * Call this from components after fetch - or use the wrapped fetch below.
 */
export function redirectToSubscriptionIfNeeded(response: Response): boolean {
  if (response.status === API_SUBSCRIPTION_ERROR_STATUS) {
    if (typeof window !== "undefined") {
      window.location.href = SUBSCRIPTION_PAGE_PATH;
    }
    return true;
  }
  return false;
}

export async function fetchWithHostel(
  url: string,
  hostelId: number | null,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers);
  if (hostelId != null) {
    headers.set("X-Hostel-Id", String(hostelId));
  }
  if (typeof window !== "undefined") {
    const email = useAuthStore.getState().user?.email?.trim().toLowerCase();
    if (email) headers.set("X-Admin-Email", email);
  }
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!headers.has("Content-Type") && !isFormData) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(url, { ...options, headers });
  if (res.status === API_SUBSCRIPTION_ERROR_STATUS && typeof window !== "undefined") {
    window.location.href = SUBSCRIPTION_PAGE_PATH;
  }
  return res;
}
