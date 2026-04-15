import type { RowDataPacket } from "mysql2/promise";
import pool from "@/lib/db";

let ensurePromise: Promise<void> | null = null;

/**
 * Existing databases created before `planned_vacate_date` was added do not get the column from
 * init-db.sql (CREATE TABLE IF NOT EXISTS). Ensures the column exists before INSERT/UPDATE.
 */
export const ensurePlannedVacateDateColumn = async (): Promise<void> => {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      const dbName = process.env.DB_NAME || "hostelhub";
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'students' AND COLUMN_NAME = 'planned_vacate_date'`,
        [dbName]
      );
      const cnt = Number((rows as RowDataPacket[])[0]?.cnt ?? 0);
      if (cnt > 0) return;
      try {
        await pool.execute(
          `ALTER TABLE students ADD COLUMN planned_vacate_date DATE NULL AFTER join_date`
        );
      } catch (e: unknown) {
        const err = e as { errno?: number; code?: string };
        if (err.errno === 1060 || err.code === "ER_DUP_FIELDNAME") return;
        throw e;
      }
    })();
  }
  try {
    await ensurePromise;
  } catch (e) {
    ensurePromise = null;
    throw e;
  }
};
