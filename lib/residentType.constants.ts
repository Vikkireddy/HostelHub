export const RESIDENT_KINDS = ["student", "employee", "job_seeker", "other"] as const;
export type ResidentKind = (typeof RESIDENT_KINDS)[number];

export function isResidentKind(v: unknown): v is ResidentKind {
  return typeof v === "string" && (RESIDENT_KINDS as readonly string[]).includes(v);
}

export function normalizeResidentKind(raw: unknown): ResidentKind {
  if (isResidentKind(raw)) return raw;
  return "student";
}

/** Detail keys stored in `resident_type_details` JSON per kind. */
export const RESIDENT_DETAIL_KEYS: Record<ResidentKind, readonly string[]> = {
  student: ["college_name", "year_semester", "student_college_id", "college_location"],
  employee: ["company_name", "job_role", "work_location", "employee_id", "shift_timing"],
  job_seeker: ["related_info", "notes"],
  other: ["occupation_description", "notes"],
};

export function emptyDetailsForKind(kind: ResidentKind): Record<string, string> {
  const o: Record<string, string> = {};
  for (const k of RESIDENT_DETAIL_KEYS[kind]) o[k] = "";
  return o;
}

/** Merge stored JSON with defaults so all keys exist in forms. */
export function mergeDetailsForKind(
  kind: ResidentKind,
  raw: unknown
): Record<string, string> {
  const base = emptyDetailsForKind(kind);
  if (raw == null || typeof raw !== "object") return base;
  const src = raw as Record<string, unknown>;
  for (const k of RESIDENT_DETAIL_KEYS[kind]) {
    const v = src[k];
    base[k] = v == null ? "" : String(v).trim();
  }
  return base;
}

/** Parse DB JSON column (object or string) for merging. */
export function parseJsonDetails(value: unknown): unknown {
  if (value == null) return null;
  if (typeof value === "object" && !Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      return null;
    }
  }
  return null;
}

export function sanitizeDetailsForKind(
  kind: ResidentKind,
  raw: unknown
): Record<string, string> {
  const out: Record<string, string> = {};
  const allowed = new Set(RESIDENT_DETAIL_KEYS[kind]);
  if (raw != null && typeof raw === "object") {
    const src = raw as Record<string, unknown>;
    for (const k of allowed) {
      const v = src[k];
      out[k] = v == null ? "" : String(v).trim().slice(0, 2000);
    }
  } else {
    for (const k of allowed) out[k] = "";
  }
  return out;
}
