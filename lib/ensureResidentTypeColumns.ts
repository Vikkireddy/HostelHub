import type { RowDataPacket } from "mysql2/promise";
import pool from "@/lib/db";

async function ensureColumn(
  table: "students" | "students_left",
  column: string,
  ddl: string
): Promise<void> {
  const dbName = process.env.DB_NAME || "hostelhub";
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [dbName, table, column]
  );
  const cnt = Number((rows as RowDataPacket[])[0]?.cnt ?? 0);
  if (cnt > 0) return;
  try {
    await pool.execute(ddl);
  } catch (e: unknown) {
    const err = e as { errno?: number; code?: string };
    if (err.errno === 1060 || err.code === "ER_DUP_FIELDNAME") return;
    if (err.code === "ER_NO_SUCH_TABLE") return;
    throw e;
  }
}

let studentsPromise: Promise<void> | null = null;

export async function ensureStudentsResidentTypeColumns(): Promise<void> {
  if (!studentsPromise) {
    studentsPromise = (async () => {
      await ensureColumn(
        "students",
        "resident_type",
        `ALTER TABLE students ADD COLUMN resident_type VARCHAR(32) NOT NULL DEFAULT 'student' AFTER address`
      );
      await ensureColumn(
        "students",
        "resident_type_details",
        `ALTER TABLE students ADD COLUMN resident_type_details JSON NULL AFTER resident_type`
      );
    })();
  }
  try {
    await studentsPromise;
  } catch (e) {
    studentsPromise = null;
    throw e;
  }
}

let leftPromise: Promise<void> | null = null;

export async function ensureStudentsLeftResidentTypeColumns(): Promise<void> {
  if (!leftPromise) {
    leftPromise = (async () => {
      await ensureColumn(
        "students_left",
        "resident_type",
        `ALTER TABLE students_left ADD COLUMN resident_type VARCHAR(32) NOT NULL DEFAULT 'student' AFTER address`
      );
      await ensureColumn(
        "students_left",
        "resident_type_details",
        `ALTER TABLE students_left ADD COLUMN resident_type_details JSON NULL AFTER resident_type`
      );
    })();
  }
  try {
    await leftPromise;
  } catch (e) {
    leftPromise = null;
    throw e;
  }
}
