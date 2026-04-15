/**
 * MySQL DATE columns are read as JavaScript Date at local midnight in the Node process TZ.
 * JSON.stringify() uses toISOString(), which shifts the calendar day ahead of UTC (e.g. IST).
 * Always format SQL date-only fields with local calendar getters for API JSON.
 */
export const formatDateOnlyLocal = (d: Date): string => {
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/** Today's calendar date in the server (or caller) local timezone — for comparing to SQL DATE. */
export const todayDateOnlyLocal = (): string => formatDateOnlyLocal(new Date());

/**
 * Normalize a MySQL DATE / Date / ISO-ish string to YYYY-MM-DD for JSON and clients.
 */
export const formatSqlDateOnlyForJson = (value: unknown): string | null => {
  if (value == null || value === "") return null;
  if (typeof value === "string") {
    const t = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
    const d = new Date(t);
    if (!Number.isNaN(d.getTime())) return formatDateOnlyLocal(d);
    return t.slice(0, 10);
  }
  if (value instanceof Date) return formatDateOnlyLocal(value);
  return null;
};

export const sqlDateOnlyToYmd = (value: unknown): string => formatSqlDateOnlyForJson(value) ?? "";

/**
 * Parse leading YYYY-MM-DD as a local calendar date (picker display; avoids UTC date-only quirks).
 */
export const parseYmdToLocalDate = (value: string): Date | null => {
  const m = String(value).trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const day = Number(m[3]);
  const d = new Date(y, mo, day);
  if (d.getFullYear() !== y || d.getMonth() !== mo || d.getDate() !== day) return null;
  return d;
};
