import pool from "@/lib/db";
import {
  API_SUBSCRIPTION_ERROR_CODE,
  API_SUBSCRIPTION_ERROR_STATUS,
} from "./constants";

/**
 * Checks if the hostel has reached their plan's student limit.
 * Returns null if OK, or an error response object to return from API.
 */
export async function checkStudentLimit(
  hostelId: number
): Promise<{ status: number; body: object } | null> {
  try {
    const [subRows] = await pool.execute(
      `SELECT hs.plan_id, sp.max_students
       FROM hostel_subscriptions hs
       LEFT JOIN subscription_plans sp ON sp.id = hs.plan_id
       WHERE hs.hostel_id = ? AND hs.status IN ('active', 'trial', 'grace_period')`,
      [hostelId]
    );
    const subs = subRows as { plan_id: string; max_students: number | null }[];
    if (subs.length === 0) return null;
    const maxStudents = subs[0]?.max_students;
    if (maxStudents == null) return null; // Enterprise/unlimited

    const [countRows] = await pool.execute(
      "SELECT COUNT(*) as cnt FROM students WHERE hostel_id = ? AND status = 'present'",
      [hostelId]
    );
    const count = Number((countRows as { cnt: number }[])[0]?.cnt ?? 0);
    if (count >= maxStudents) {
      return {
        status: API_SUBSCRIPTION_ERROR_STATUS,
        body: {
          success: false,
          code: API_SUBSCRIPTION_ERROR_CODE,
          message: `Your plan allows up to ${maxStudents} students. Upgrade to add more.`,
          featureLocked: true,
        },
      };
    }
    return null;
  } catch {
    return null;
  }
}
