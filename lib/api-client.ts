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
  return headers;
}

export function fetchWithHostel(
  url: string,
  hostelId: number | null,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers);
  if (hostelId != null) {
    headers.set("X-Hostel-Id", String(hostelId));
  }
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(url, { ...options, headers });
}
