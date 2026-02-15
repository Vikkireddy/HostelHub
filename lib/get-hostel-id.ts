/**
 * Extracts hostel_id from request headers for multi-tenant API routes.
 * Returns null if not provided (caller should return empty/401).
 */
export function getHostelIdFromRequest(request: { headers: { get: (name: string) => string | null } }): number | null {
  const val = request.headers.get("x-hostel-id");
  if (!val) return null;
  const id = parseInt(val, 10);
  return isNaN(id) ? null : id;
}
