import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
import { requireSubscription } from "@/lib/subscription/RequireSubscription";

export async function GET(request: NextRequest) {
  try {
    const subErr = await requireSubscription(request);
    if (subErr) return subErr;

    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json([], { status: 200 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    let query = `SELECT id, amount, category, description, expense_date, created_at 
                 FROM admin_expenses WHERE hostel_id = ?`;
    const params: (number | string)[] = [hostelId];

    if (month && year) {
      query += ` AND MONTH(expense_date) = ? AND YEAR(expense_date) = ?`;
      params.push(month, year);
    }

    query += ` ORDER BY expense_date DESC, created_at DESC`;

    let rows: unknown;
    try {
      [rows] = await pool.execute(query, params);
    } catch (fetchErr) {
      const err = fetchErr as { code?: string; message?: string };
      if (err.code === "ER_NO_SUCH_TABLE" || (err.message && err.message.includes("doesn't exist"))) {
        await pool.execute(`
          CREATE TABLE IF NOT EXISTS admin_expenses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            hostel_id INT NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            category VARCHAR(100) NOT NULL,
            description TEXT,
            expense_date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE
          )
        `);
        return NextResponse.json([]);
      }
      throw fetchErr;
    }
    const expenses = (rows as Array<Record<string, unknown>>).map((r) => ({
      id: r.id,
      amount: Number(r.amount),
      category: r.category,
      description: r.description ?? null,
      expense_date: r.expense_date ? String(r.expense_date).slice(0, 10) : null,
      created_at: r.created_at,
    }));

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Expenses fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const subErr = await requireSubscription(request);
    if (subErr) return subErr;

    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, category, description, expense_date } = body;

    if (amount == null || amount < 0 || !category?.trim()) {
      return NextResponse.json(
        { error: "Amount and category are required" },
        { status: 400 }
      );
    }

    const dateStr = expense_date
      ? new Date(expense_date).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);

    let result: unknown;
    try {
      [result] = await pool.execute(
        `INSERT INTO admin_expenses (hostel_id, amount, category, description, expense_date)
         VALUES (?, ?, ?, ?, ?)`,
        [hostelId, Number(amount), String(category).trim(), description?.trim() || null, dateStr]
      );
    } catch (insertErr) {
      const err = insertErr as { code?: string; message?: string };
      if (err.code === "ER_NO_SUCH_TABLE" || (err.message && err.message.includes("doesn't exist"))) {
        await pool.execute(`
          CREATE TABLE IF NOT EXISTS admin_expenses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            hostel_id INT NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            category VARCHAR(100) NOT NULL,
            description TEXT,
            expense_date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE
          )
        `);
        [result] = await pool.execute(
          `INSERT INTO admin_expenses (hostel_id, amount, category, description, expense_date)
           VALUES (?, ?, ?, ?, ?)`,
          [hostelId, Number(amount), String(category).trim(), description?.trim() || null, dateStr]
        );
      } else {
        throw insertErr;
      }
    }

    const insertId = (result as { insertId: number }).insertId;
    const [rows] = await pool.execute(
      `SELECT id, amount, category, description, expense_date, created_at 
       FROM admin_expenses WHERE id = ?`,
      [insertId]
    );
    const expense = (rows as Array<Record<string, unknown>>)[0];
    return NextResponse.json({
      id: expense.id,
      amount: Number(expense.amount),
      category: expense.category,
      description: expense.description ?? null,
      expense_date: expense.expense_date ? String(expense.expense_date).slice(0, 10) : null,
      created_at: expense.created_at,
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
