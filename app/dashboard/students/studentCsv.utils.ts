export type StudentCsvRow = {
  name: string;
  email: string;
  phone: string;
  room_number: string;
  course: string;
  join_date: string;
  id_proof_type: string;
  id_proof_number: string;
  address: string;
  planned_vacate_date: string;
};

/** Parse RFC4180-style CSV into rows (each row is string cells). */
export const parseCsvToRows = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const pushField = () => {
    row.push(field);
    field = "";
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      pushField();
    } else if (c === "\n" || c === "\r") {
      pushField();
      if (row.some((cell) => cell.length > 0) || row.length > 1) {
        rows.push(row);
      }
      row = [];
      if (c === "\r" && text[i + 1] === "\n") i++;
    } else {
      field += c;
    }
  }
  pushField();
  if (row.some((cell) => cell.length > 0) || rows.length === 0) {
    rows.push(row);
  }
  return rows;
};

const normalizeHeaderKey = (h: string) =>
  h
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

/** Map CSV header variants to canonical field names. */
const HEADER_ALIASES: Record<string, keyof StudentCsvRow> = {
  name: "name",
  email: "email",
  phone: "phone",
  mobile: "phone",
  room: "room_number",
  room_number: "room_number",
  room_no: "room_number",
  roomnumber: "room_number",
  course: "course",
  join_date: "join_date",
  joindate: "join_date",
  id_proof_type: "id_proof_type",
  id_prooftype: "id_proof_type",
  id_type: "id_proof_type",
  id_proof_number: "id_proof_number",
  id_number: "id_proof_number",
  idproofnumber: "id_proof_number",
  address: "address",
  planned_vacate_date: "planned_vacate_date",
  planned_vacate: "planned_vacate_date",
};

const emptyRow = (): StudentCsvRow => ({
  name: "",
  email: "",
  phone: "",
  room_number: "",
  course: "",
  join_date: "",
  id_proof_type: "",
  id_proof_number: "",
  address: "",
  planned_vacate_date: "",
});

/** Map header cell to canonical key; returns null if unknown. */
const headerToKey = (header: string): keyof StudentCsvRow | null => {
  const k = normalizeHeaderKey(header);
  return HEADER_ALIASES[k] ?? null;
};

/**
 * First row = headers. Returns `{ rows, errors }` where errors are user-facing parse issues.
 */
export const csvTextToStudentRows = (
  text: string
): { rows: StudentCsvRow[]; errors: string[] } => {
  const errors: string[] = [];
  const grid = parseCsvToRows(text.trim());
  if (grid.length < 2) {
    errors.push("CSV must include a header row and at least one data row.");
    return { rows: [], errors };
  }
  const headerCells = grid[0].map((c) => c.trim());
  const colKeys: (keyof StudentCsvRow | null)[] = headerCells.map(headerToKey);
  const requiredKeys: (keyof StudentCsvRow)[] = [
    "name",
    "email",
    "phone",
    "room_number",
    "course",
    "join_date",
    "id_proof_type",
    "id_proof_number",
    "address",
  ];
  const seen = new Set<string>();
  for (const k of colKeys) {
    if (k) seen.add(k);
  }
  const missing = requiredKeys.filter((k) => !seen.has(k));
  if (missing.length > 0) {
    errors.push(`Missing required column(s): ${missing.join(", ")}.`);
    return { rows: [], errors };
  }
  const rows: StudentCsvRow[] = [];
  for (let r = 1; r < grid.length; r++) {
    const cells = grid[r];
    const o = emptyRow();
    colKeys.forEach((key, i) => {
      if (key) o[key] = (cells[i] ?? "").trim();
    });
    const emptyLine =
      !o.name &&
      !o.email &&
      !o.phone &&
      !o.room_number &&
      !o.course &&
      !o.join_date &&
      !o.id_proof_type &&
      !o.id_proof_number &&
      !o.address;
    if (emptyLine) continue;
    rows.push(o);
  }
  if (rows.length === 0) {
    errors.push("No data rows found after the header.");
  }
  return { rows, errors };
};
