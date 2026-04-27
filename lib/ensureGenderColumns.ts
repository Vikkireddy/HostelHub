import type { RowDataPacket } from "mysql2/promise";
import pool from "@/lib/db";

let studentsGenderPromise: Promise<void> | null = null;

/** Ensures `students.gender` exists (VARCHAR: Male, Female, Other). */
export async function ensureStudentGenderColumn(): Promise<void> {
  if (!studentsGenderPromise) {
    studentsGenderPromise = (async () => {
      const dbName = process.env.DB_NAME || "hostelhub";
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'students' AND COLUMN_NAME = 'gender'`,
        [dbName]
      );
      const cnt = Number((rows as RowDataPacket[])[0]?.cnt ?? 0);
      if (cnt > 0) return;
      try {
        await pool.execute(
          `ALTER TABLE students ADD COLUMN gender VARCHAR(20) NULL AFTER name`
        );
      } catch (e: unknown) {
        const err = e as { errno?: number; code?: string };
        if (err.errno === 1060 || err.code === "ER_DUP_FIELDNAME") return;
        throw e;
      }
    })();
  }
  try {
    await studentsGenderPromise;
  } catch (e) {
    studentsGenderPromise = null;
    throw e;
  }
}

let studentsLeftGenderPromise: Promise<void> | null = null;

/** Ensures `students_left.gender` exists for checkout archive rows. */
export async function ensureStudentsLeftGenderColumn(): Promise<void> {
  if (!studentsLeftGenderPromise) {
    studentsLeftGenderPromise = (async () => {
      const dbName = process.env.DB_NAME || "hostelhub";
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'students_left' AND COLUMN_NAME = 'gender'`,
        [dbName]
      );
      const cnt = Number((rows as RowDataPacket[])[0]?.cnt ?? 0);
      if (cnt > 0) return;
      try {
        await pool.execute(
          `ALTER TABLE students_left ADD COLUMN gender VARCHAR(20) NULL AFTER name`
        );
      } catch (e: unknown) {
        const err = e as { errno?: number; code?: string };
        if (err.errno === 1060 || err.code === "ER_DUP_FIELDNAME") return;
        if (err.code === "ER_NO_SUCH_TABLE") return;
        throw e;
      }
    })();
  }
  try {
    await studentsLeftGenderPromise;
  } catch (e) {
    studentsLeftGenderPromise = null;
    throw e;
  }
}
