import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
import { requireSubscription } from "@/lib/subscription/RequireSubscription";
import { assertDashboardPermission } from "@/lib/dashboardPermission.server";
import { formatSqlDateOnlyForJson } from "@/lib/dateOnly";
import { ensureStudentSecurityDepositColumns } from "@/lib/ensureStudentSecurityDepositColumns";
export { dynamic } from "@/lib/forceDynamicRoute";

const CREATE_TABLE_IF_NOT_EXISTS = `
  CREATE TABLE IF NOT EXISTS students_left (
    id INT AUTO_INCREMENT PRIMARY KEY,
    original_student_id INT NOT NULL,
    hostel_id INT NULL,
    name VARCHAR(255) NOT NULL,
    gender VARCHAR(20) NULL,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    emergency_contact_phone VARCHAR(20) NULL,
    room_number VARCHAR(20),
    course VARCHAR(255),
    join_date DATE,
    left_date DATE NOT NULL,
    id_proof_type VARCHAR(50),
    id_proof_number VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

export async function GET(request: NextRequest) {
  try {
    const subErr = await requireSubscription(request);
    if (subErr) return subErr;

    const denied = await assertDashboardPermission(request, "residents", "view");
    if (denied) return denied;

    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json([], { status: 200 });
    }

    await pool.execute(CREATE_TABLE_IF_NOT_EXISTS);
    await ensureStudentSecurityDepositColumns();

    const [rows] = await pool.execute(
      `SELECT * FROM students_left WHERE hostel_id = ? ORDER BY left_date DESC, created_at DESC`,
      [hostelId]
    );
    const list = rows as Array<Record<string, unknown>>;
    return NextResponse.json(
      list.map((r) => {
        const dep = r.security_deposit_amount;
        const ded = r.security_deposit_deduction;
        const ref = r.security_deposit_refund;
        return {
          ...r,
          join_date: formatSqlDateOnlyForJson(r.join_date),
          left_date: formatSqlDateOnlyForJson(r.left_date),
          security_deposit_amount:
            dep == null || dep === "" ? null : Math.round(Number(dep) * 100) / 100,
          security_deposit_deduction:
            ded == null || ded === "" ? null : Math.round(Number(ded) * 100) / 100,
          security_deposit_refund:
            ref == null || ref === "" ? null : Math.round(Number(ref) * 100) / 100,
        };
      })
    );
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch exited residents" },
      { status: 500 }
    );
  }
}
