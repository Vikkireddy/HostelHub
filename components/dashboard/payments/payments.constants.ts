export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const getDefaultMonthYear = () => {
  const d = new Date();
  return {
    month: MONTHS[d.getMonth()],
    year: String(d.getFullYear()),
  };
};

/** Label for the payments table "Bill / UTR" column from stored mode + reference. */
export function formatBillOrUtrLabel(
  mode: string | null | undefined,
  ref: string | null | undefined
): string | null {
  const r = String(ref ?? "").trim();
  if (!r) return null;
  const m = String(mode ?? "").toLowerCase();
  if (m === "cash") return `Bill · ${r}`;
  if (m === "online") return `UTR · ${r}`;
  return r;
}
