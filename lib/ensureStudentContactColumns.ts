import type { RowDataPacket } from "mysql2/promise";
import pool from "@/lib/db";

let contactColumnsPromise: Promise<void> | null = null;

/**
 * Adds optional `emergency_contact_phone` on `students` and `students_left` when missing.
 * Primary `phone` stays required at the API (NOT NULL in schema for new installs).
 */
export async function ensureStudentOptionalPhoneAndEmergency(): Promise<void> {
  if (!contactColumnsPromise) {
    contactColumnsPromise = (async () => {
      const dbName = process.env.DB_NAME || "hostelhub";

      const [emRows] = await pool.execute<RowDataPacket[]>(
        `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'students' AND COLUMN_NAME = 'emergency_contact_phone'`,
        [dbName]
      );
      if (Number((emRows as RowDataPacket[])[0]?.cnt ?? 0) === 0) {
        try {
          await pool.execute(
            `ALTER TABLE students ADD COLUMN emergency_contact_phone VARCHAR(20) NULL AFTER phone`
          );
        } catch (e: unknown) {
          const err = e as { errno?: number; code?: string };
          if (err.errno !== 1060 && err.code !== "ER_DUP_FIELDNAME") throw e;
        }
      }

      const [leftExists] = await pool.execute<RowDataPacket[]>(
        `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.TABLES
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'students_left'`,
        [dbName]
      );
      if (Number((leftExists as RowDataPacket[])[0]?.cnt ?? 0) === 0) return;

      const [leftEmRows] = await pool.execute<RowDataPacket[]>(
        `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'students_left' AND COLUMN_NAME = 'emergency_contact_phone'`,
        [dbName]
      );
      if (Number((leftEmRows as RowDataPacket[])[0]?.cnt ?? 0) === 0) {
        try {
          await pool.execute(
            `ALTER TABLE students_left ADD COLUMN emergency_contact_phone VARCHAR(20) NULL AFTER phone`
          );
        } catch (e: unknown) {
          const err = e as { errno?: number; code?: string };
          if (err.errno !== 1060 && err.code !== "ER_DUP_FIELDNAME") throw e;
        }
      }
    })();
  }
  try {
    await contactColumnsPromise;
  } catch (e) {
    contactColumnsPromise = null;
    throw e;
  }
}
