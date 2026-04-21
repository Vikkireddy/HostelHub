import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
import { assertDashboardPermission } from "@/lib/dashboardPermission.server";
export { dynamic } from "@/lib/forceDynamicRoute";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const denied = await assertDashboardPermission(_request, "expenses", "delete");
    if (denied) return denied;

    const hostelId = getHostelIdFromRequest(_request);
    if (hostelId == null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const expenseId = Number(id);
    if (!id || isNaN(expenseId)) {
      return NextResponse.json({ error: "Invalid expense ID" }, { status: 400 });
    }

    const [rows] = await pool.execute(
      "SELECT id FROM admin_expenses WHERE id = ? AND hostel_id = ?",
      [expenseId, hostelId]
    );
    const expense = (rows as Array<Record<string, unknown>>)[0];
    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    await pool.execute("DELETE FROM admin_expenses WHERE id = ? AND hostel_id = ?", [
      expenseId,
      hostelId,
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Expense delete error:", error);
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
  }
}
