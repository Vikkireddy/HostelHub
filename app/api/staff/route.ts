import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
import { assertDashboardPermission } from "@/lib/dashboardPermission.server";
export { dynamic } from "@/lib/forceDynamicRoute";

async function ensureStaffTable() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS staff_members (
      id INT AUTO_INCREMENT PRIMARY KEY,
      hostel_id INT NOT NULL,
      name VARCHAR(120) NOT NULL,
      phone VARCHAR(20) NULL,
      designation VARCHAR(100) NULL,
      monthly_salary DECIMAL(10, 2) NOT NULL DEFAULT 0,
      notes TEXT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE
    )
  `);
}

export async function GET(request: NextRequest) {
  try {
    const denied = await assertDashboardPermission(request, "staff", "view");
    if (denied) return denied;

    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) return NextResponse.json([], { status: 200 });

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    try {
      const [rows] = await pool.execute(
        `SELECT id, name, phone, designation, monthly_salary, notes, is_active, created_at
         FROM staff_members
         WHERE hostel_id = ? ${includeInactive ? "" : "AND is_active = 1"}
         ORDER BY name ASC`,
        [hostelId]
      );
      const data = (rows as Array<Record<string, unknown>>).map((r) => ({
        id: Number(r.id),
        name: String(r.name ?? ""),
        phone: r.phone ? String(r.phone) : "",
        designation: r.designation ? String(r.designation) : "",
        monthly_salary: Number(r.monthly_salary ?? 0),
        notes: r.notes ? String(r.notes) : "",
        is_active: Boolean(r.is_active),
        created_at: String(r.created_at ?? ""),
      }));
      return NextResponse.json(data);
    } catch (error) {
      const err = error as { code?: string; message?: string };
      if (
        err.code === "ER_NO_SUCH_TABLE" ||
        (err.message && err.message.includes("doesn't exist"))
      ) {
        await ensureStaffTable();
        return NextResponse.json([]);
      }
      throw error;
    }
  } catch (error) {
    console.error("Staff fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const denied = await assertDashboardPermission(request, "staff", "add");
    if (denied) return denied;

    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      phone,
      designation,
      monthly_salary,
      notes,
    } = body as {
      name?: string;
      phone?: string;
      designation?: string;
      monthly_salary?: number;
      notes?: string;
    };

    if (!name?.trim()) {
      return NextResponse.json({ error: "Staff name is required" }, { status: 400 });
    }
    if (monthly_salary == null || Number(monthly_salary) < 0) {
      return NextResponse.json({ error: "Valid monthly salary is required" }, { status: 400 });
    }

    let result: unknown;
    try {
      [result] = await pool.execute(
        `INSERT INTO staff_members (hostel_id, name, phone, designation, monthly_salary, notes, is_active)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [
          hostelId,
          name.trim(),
          phone?.trim() || null,
          designation?.trim() || null,
          Number(monthly_salary),
          notes?.trim() || null,
        ]
      );
    } catch (error) {
      const err = error as { code?: string; message?: string };
      if (
        err.code === "ER_NO_SUCH_TABLE" ||
        (err.message && err.message.includes("doesn't exist"))
      ) {
        await ensureStaffTable();
        [result] = await pool.execute(
          `INSERT INTO staff_members (hostel_id, name, phone, designation, monthly_salary, notes, is_active)
           VALUES (?, ?, ?, ?, ?, ?, 1)`,
          [
            hostelId,
            name.trim(),
            phone?.trim() || null,
            designation?.trim() || null,
            Number(monthly_salary),
            notes?.trim() || null,
          ]
        );
      } else {
        throw error;
      }
    }

    const insertId = (result as { insertId: number }).insertId;
    const [rows] = await pool.execute(
      `SELECT id, name, phone, designation, monthly_salary, notes, is_active, created_at
       FROM staff_members WHERE id = ? LIMIT 1`,
      [insertId]
    );
    const row = (rows as Array<Record<string, unknown>>)[0];
    return NextResponse.json({
      id: Number(row.id),
      name: String(row.name ?? ""),
      phone: row.phone ? String(row.phone) : "",
      designation: row.designation ? String(row.designation) : "",
      monthly_salary: Number(row.monthly_salary ?? 0),
      notes: row.notes ? String(row.notes) : "",
      is_active: Boolean(row.is_active),
      created_at: String(row.created_at ?? ""),
    });
  } catch (error) {
    console.error("Staff create error:", error);
    const message = error instanceof Error ? error.message : "Failed to add staff";
    return NextResponse.json({ error: "Failed to add staff", detail: message }, { status: 500 });
  }
}
