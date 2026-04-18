import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
export { dynamic } from "@/lib/forceDynamicRoute";

const STAFF_SALARY_CATEGORY = "Staff Salary";

type Row = Record<string, unknown>;

function isMissingColumnError(err: { code?: string; errno?: number; message?: string }) {
  return (
    err.code === "ER_BAD_FIELD_ERROR" ||
    err.errno === 1054 ||
    Boolean(err.message?.includes("Unknown column"))
  );
}

export async function GET(request: NextRequest) {
  try {
    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json([], { status: 200 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const monthYearClause =
      month && year ? ` AND MONTH(e.expense_date) = ? AND YEAR(e.expense_date) = ?` : "";
    const paramsBase: (number | string)[] = [hostelId];
    if (month && year) {
      paramsBase.push(month, year);
    }

    let rows: unknown;
    const queryWithStaff = `SELECT e.id, e.amount, e.category, e.description, e.expense_date, e.created_at,
        e.staff_member_id, sm.name AS staff_name
        FROM admin_expenses e
        LEFT JOIN staff_members sm ON sm.id = e.staff_member_id
        WHERE e.hostel_id = ?${monthYearClause}
        ORDER BY e.expense_date DESC, e.created_at DESC`;

    try {
      [rows] = await pool.execute(queryWithStaff, paramsBase);
    } catch (fetchErr) {
      const err = fetchErr as { code?: string; errno?: number; message?: string };
      const staffTableMissing =
        err.code === "ER_NO_SUCH_TABLE" &&
        String(err.message ?? "").toLowerCase().includes("staff_members");
      if (isMissingColumnError(err) || staffTableMissing) {
        const legacyQuery = `SELECT id, amount, category, description, expense_date, created_at
                 FROM admin_expenses WHERE hostel_id = ?${month && year ? ` AND MONTH(expense_date) = ? AND YEAR(expense_date) = ?` : ""}
                 ORDER BY expense_date DESC, created_at DESC`;
        try {
          [rows] = await pool.execute(legacyQuery, paramsBase);
        } catch (inner) {
          const innerErr = inner as { code?: string; message?: string };
          if (
            innerErr.code === "ER_NO_SUCH_TABLE" ||
            (innerErr.message && innerErr.message.includes("doesn't exist"))
          ) {
            await pool.execute(`
          CREATE TABLE IF NOT EXISTS admin_expenses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            hostel_id INT NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            category VARCHAR(100) NOT NULL,
            description TEXT,
            expense_date DATE NOT NULL,
            staff_member_id INT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE
          )
        `);
            return NextResponse.json([]);
          }
          throw inner;
        }
        const expenses = (rows as Row[]).map((r) => ({
          id: r.id,
          amount: Number(r.amount),
          category: r.category,
          description: r.description ?? null,
          expense_date: r.expense_date ? String(r.expense_date).slice(0, 10) : null,
          created_at: r.created_at,
          staff_member_id: null,
          staff_name: null,
        }));
        return NextResponse.json(expenses);
      }
      if (err.code === "ER_NO_SUCH_TABLE" || (err.message && err.message.includes("doesn't exist"))) {
        await pool.execute(`
          CREATE TABLE IF NOT EXISTS admin_expenses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            hostel_id INT NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            category VARCHAR(100) NOT NULL,
            description TEXT,
            expense_date DATE NOT NULL,
            staff_member_id INT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE
          )
        `);
        return NextResponse.json([]);
      }
      throw fetchErr;
    }

    const expenses = (rows as Row[]).map((r) => ({
      id: r.id,
      amount: Number(r.amount),
      category: r.category,
      description: r.description ?? null,
      expense_date: r.expense_date ? String(r.expense_date).slice(0, 10) : null,
      created_at: r.created_at,
      staff_member_id:
        r.staff_member_id != null && r.staff_member_id !== ""
          ? Number(r.staff_member_id)
          : null,
      staff_name: r.staff_name != null ? String(r.staff_name) : null,
    }));

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Expenses fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, category, description, expense_date, staff_member_id: staffRaw } = body as {
      amount?: number;
      category?: string;
      description?: string | null;
      expense_date?: string;
      staff_member_id?: number | string | null;
    };

    if (amount == null || amount < 0 || !category?.trim()) {
      return NextResponse.json(
        { error: "Amount and category are required" },
        { status: 400 }
      );
    }

    const catTrim = String(category).trim();
    const isStaffSalary = catTrim === STAFF_SALARY_CATEGORY;

    let linkedStaffId: number | null = null;
    if (isStaffSalary) {
      const sid =
        staffRaw === "" || staffRaw === undefined || staffRaw === null
          ? NaN
          : Number(staffRaw);
      if (!Number.isFinite(sid) || sid < 1) {
        return NextResponse.json(
          { error: "Select a staff member for Staff Salary expenses" },
          { status: 400 }
        );
      }
      let staffRows: unknown;
      try {
        [staffRows] = await pool.execute(
          `SELECT id FROM staff_members WHERE id = ? AND hostel_id = ? AND is_active = 1 LIMIT 1`,
          [sid, hostelId]
        );
      } catch (staffErr) {
        const se = staffErr as { code?: string; message?: string };
        if (
          se.code === "ER_NO_SUCH_TABLE" ||
          String(se.message ?? "").toLowerCase().includes("staff_members")
        ) {
          return NextResponse.json(
            {
              error: "Staff data is not set up yet",
              detail: "Create the staff_members table (see scripts/migrate-staff-management.sql).",
            },
            { status: 503 }
          );
        }
        throw staffErr;
      }
      if (!(staffRows as Row[]).length) {
        return NextResponse.json({ error: "Invalid or inactive staff member" }, { status: 400 });
      }
      linkedStaffId = sid;
    }

    const dateStr = expense_date
      ? new Date(expense_date).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);

    let result: unknown;

    const insertWithStaff = async () =>
      pool.execute(
        `INSERT INTO admin_expenses (hostel_id, amount, category, description, expense_date, staff_member_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [hostelId, Number(amount), catTrim, description?.trim() || null, dateStr, linkedStaffId]
      );

    const insertLegacy = async () =>
      pool.execute(
        `INSERT INTO admin_expenses (hostel_id, amount, category, description, expense_date)
         VALUES (?, ?, ?, ?, ?)`,
        [hostelId, Number(amount), catTrim, description?.trim() || null, dateStr]
      );

    try {
      [result] = await insertWithStaff();
    } catch (insertErr) {
      const err = insertErr as { code?: string; errno?: number; message?: string };
      if (isMissingColumnError(err)) {
        if (isStaffSalary && linkedStaffId != null) {
          return NextResponse.json(
            {
              error: "Database update required for staff-linked expenses",
              detail:
                "Run scripts/migrate-staff-management.sql (adds staff_member_id on admin_expenses).",
            },
            { status: 503 }
          );
        }
        if (
          err.code === "ER_NO_SUCH_TABLE" ||
          (err.message && err.message.includes("doesn't exist"))
        ) {
          await pool.execute(`
          CREATE TABLE IF NOT EXISTS admin_expenses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            hostel_id INT NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            category VARCHAR(100) NOT NULL,
            description TEXT,
            expense_date DATE NOT NULL,
            staff_member_id INT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE
          )
        `);
          [result] = await insertWithStaff();
        } else {
          [result] = await insertLegacy();
        }
      } else {
        throw insertErr;
      }
    }

    const insertId = (result as { insertId: number }).insertId;

    let selectQuery = `SELECT e.id, e.amount, e.category, e.description, e.expense_date, e.created_at,
      e.staff_member_id, sm.name AS staff_name
      FROM admin_expenses e
      LEFT JOIN staff_members sm ON sm.id = e.staff_member_id
      WHERE e.id = ? LIMIT 1`;
    let selectRows: unknown;
    try {
      [selectRows] = await pool.execute(selectQuery, [insertId]);
    } catch (selErr) {
      const serr = selErr as { code?: string; errno?: number };
      if (isMissingColumnError(serr)) {
        [selectRows] = await pool.execute(
          `SELECT id, amount, category, description, expense_date, created_at FROM admin_expenses WHERE id = ?`,
          [insertId]
        );
      } else {
        throw selErr;
      }
    }

    const expense = (selectRows as Row[])[0];
    return NextResponse.json({
      id: expense.id,
      amount: Number(expense.amount),
      category: expense.category,
      description: expense.description ?? null,
      expense_date: expense.expense_date ? String(expense.expense_date).slice(0, 10) : null,
      created_at: expense.created_at,
      staff_member_id:
        expense.staff_member_id != null && expense.staff_member_id !== ""
          ? Number(expense.staff_member_id)
          : null,
      staff_name: expense.staff_name != null ? String(expense.staff_name) : null,
    });
  } catch (error) {
    console.error("Expense create error:", error);
    const message = error instanceof Error ? error.message : "Failed to add expense";
    return NextResponse.json(
      { error: "Failed to add expense", detail: message },
      { status: 500 }
    );
  }
}
