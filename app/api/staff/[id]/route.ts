import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
export { dynamic } from "@/lib/forceDynamicRoute";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const staffId = Number(id);
    if (!id || Number.isNaN(staffId)) {
      return NextResponse.json({ error: "Invalid staff ID" }, { status: 400 });
    }

    const [rows] = await pool.execute(
      `SELECT id FROM staff_members WHERE id = ? AND hostel_id = ? LIMIT 1`,
      [staffId, hostelId]
    );
    if ((rows as unknown[]).length === 0) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    await pool.execute(
      `UPDATE staff_members SET is_active = 0 WHERE id = ? AND hostel_id = ?`,
      [staffId, hostelId]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Staff delete error:", error);
    return NextResponse.json({ error: "Failed to delete staff" }, { status: 500 });
  }
}
