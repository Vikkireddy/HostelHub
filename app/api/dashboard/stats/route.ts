import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [students] = await pool.execute(
      "SELECT s.*, r.number as room_number FROM students s LEFT JOIN rooms r ON s.room_id = r.id WHERE s.status = 'present'"
    );
    const studentsList = students as Array<Record<string, unknown>>;

    const [rooms] = await pool.execute(
      `SELECT r.*, COALESCE(occ.occupancy, 0) as occupancy FROM rooms r
       LEFT JOIN (SELECT room_id, COUNT(*) as occupancy FROM students WHERE status = 'present' GROUP BY room_id) occ ON r.id = occ.room_id
       ORDER BY r.number`
    );
    const roomsList = rooms as Array<Record<string, unknown>>;

    const [payments] = await pool.execute(
      `SELECT p.*, s.name as student_name FROM payments p 
       JOIN students s ON p.student_id = s.id 
       ORDER BY p.created_at DESC LIMIT 20`
    );
    const paymentsList = payments as Array<Record<string, unknown>>;

    const [pendingStats] = await pool.execute(
      `SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM payments WHERE status IN ('pending', 'overdue')`
    );
    const pendingRow = (pendingStats as Array<Record<string, unknown>>)[0];
    const pendingBills = Number(pendingRow?.count ?? 0);
    const pendingBillsAmount = Number(pendingRow?.total ?? 0);

    const [complaints] = await pool.execute(
      `SELECT c.*, s.name as student_name, r.number as room_number 
       FROM complaints c 
       LEFT JOIN students s ON c.student_id = s.id 
       LEFT JOIN rooms r ON c.room_id = r.id 
       ORDER BY c.created_at DESC`
    );
    const complaintsList = complaints as Array<Record<string, unknown>>;

    const [revenueRows] = await pool.execute(
      `SELECT SUBSTRING(month, 1, 3) as month_short, year, SUM(amount) as revenue
       FROM payments WHERE status = 'paid'
       GROUP BY year, month
       ORDER BY year DESC, FIELD(month, 'December','November','October','September','August','July','June','May','April','March','February','January') DESC
       LIMIT 6`
    );
    const revenueData = (revenueRows as Array<Record<string, unknown>>)
      .map((r) => ({ month: String(r.month_short || ""), revenue: Number(r.revenue) || 0 }))
      .reverse();

    const roomDistribution = (roomsList as Array<Record<string, unknown>>).reduce(
      (acc: Array<{ name: string; value: number; color: string }>, r) => {
        const type = String(r.type || "Unknown");
        const existing = acc.find((x) => x.name === type);
        if (existing) existing.value++;
        else acc.push({ name: type, value: 1, color: type === "Single" ? "var(--primary)" : type === "Double" ? "#f97316" : "#22c55e" });
        return acc;
      },
      []
    );

    const totalRooms = roomsList.length;
    const available = roomsList.filter((r) => r.status === "available").length;
    const occupied = roomsList.filter((r) => r.status === "full").length;
    const maintenance = roomsList.filter((r) => r.status === "maintenance").length;
    const openComplaints = complaintsList.filter((c) => c.status === "open" || c.status === "in-progress").length;

    return NextResponse.json({
      students: studentsList.map((s) => ({
        id: s.id,
        name: s.name,
        room: s.room_number || "-",
        course: s.course,
        joinDate: s.join_date ? new Date(s.join_date as string).toISOString().slice(0, 10) : "",
        phone: s.phone,
      })),
      rooms: roomsList,
      payments: paymentsList.map((p) => ({
        id: p.id,
        student: p.student_name,
        month: `${p.month} ${p.year}`,
        amount: Number(p.amount),
        status: p.status,
      })),
      complaints: complaintsList.map((c) => ({
        id: c.id,
        description: c.description,
        status: c.status,
        student_name: c.student_name,
        room_number: c.room_number,
      })),
      revenue: revenueData.length ? revenueData : [
        { month: "Jan", revenue: 0 },
        { month: "Feb", revenue: 0 },
      ],
      roomDistribution: roomDistribution.length ? roomDistribution : [
        { name: "Single", value: 0, color: "var(--primary)" },
        { name: "Double", value: 0, color: "#f97316" },
        { name: "Triple", value: 0, color: "#22c55e" },
      ],
      stats: {
        totalStudents: studentsList.length,
        totalRooms,
        availableRooms: available,
        occupiedRooms: occupied,
        maintenanceRooms: maintenance,
        pendingBills,
        pendingBillsAmount,
        openComplaints,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}
