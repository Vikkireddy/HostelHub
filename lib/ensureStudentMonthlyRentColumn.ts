import type { RowDataPacket } from "mysql2/promise";
import pool from "@/lib/db";

let monthlyRentColumnPromise: Promise<void> | null = null;

/** Resident-level monthly rent for billing (supports per-resident pricing). */
export async function ensureStudentMonthlyRentColumn(): Promise<void> {
  if (!monthlyRentColumnPromise) {
    monthlyRentColumnPromise = (async () => {
      const dbName = process.env.DB_NAME || "hostelhub";
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'students' AND COLUMN_NAME = 'monthly_rent'`,
        [dbName]
      );
      if (Number((rows as RowDataPacket[])[0]?.cnt ?? 0) === 0) {
        try {
          await pool.execute(
            `ALTER TABLE students ADD COLUMN monthly_rent DECIMAL(10,2) NULL AFTER course`
          );
        } catch (e: unknown) {
          const err = e as { errno?: number; code?: string };
          if (err.errno !== 1060 && err.code !== "ER_DUP_FIELDNAME") throw e;
        }
      }
    })();
  }
  try {
    await monthlyRentColumnPromise;
  } catch (e) {
    monthlyRentColumnPromise = null;
    throw e;
  }
}
