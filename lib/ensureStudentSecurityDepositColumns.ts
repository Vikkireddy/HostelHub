import type { RowDataPacket } from "mysql2/promise";
import pool from "@/lib/db";

let securityDepositColumnsPromise: Promise<void> | null = null;

/**
 * Optional advance/security deposit on active residents; checkout archive stores settlement.
 */
export async function ensureStudentSecurityDepositColumns(): Promise<void> {
  if (!securityDepositColumnsPromise) {
    securityDepositColumnsPromise = (async () => {
      const dbName = process.env.DB_NAME || "hostelhub";

      const [stCol] = await pool.execute<RowDataPacket[]>(
        `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'students' AND COLUMN_NAME = 'security_deposit_amount'`,
        [dbName]
      );
      if (Number((stCol as RowDataPacket[])[0]?.cnt ?? 0) === 0) {
        try {
          await pool.execute(
            `ALTER TABLE students ADD COLUMN security_deposit_amount DECIMAL(12,2) NULL AFTER address`
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

      for (const [col, after] of [
        ["security_deposit_amount", "address"],
        ["security_deposit_deduction", "security_deposit_amount"],
        ["security_deposit_refund", "security_deposit_deduction"],
      ] as const) {
        const [cRows] = await pool.execute<RowDataPacket[]>(
          `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'students_left' AND COLUMN_NAME = ?`,
          [dbName, col]
        );
        if (Number((cRows as RowDataPacket[])[0]?.cnt ?? 0) === 0) {
          try {
            await pool.execute(
              `ALTER TABLE students_left ADD COLUMN ${col} DECIMAL(12,2) NULL AFTER ${after}`
            );
          } catch (e: unknown) {
            const err = e as { errno?: number; code?: string };
            if (err.errno !== 1060 && err.code !== "ER_DUP_FIELDNAME") throw e;
          }
        }
      }
    })();
  }
  try {
    await securityDepositColumnsPromise;
  } catch (e) {
    securityDepositColumnsPromise = null;
    throw e;
  }
}
