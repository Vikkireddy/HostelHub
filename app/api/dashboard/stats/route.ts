import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/get-hostel-id";
import { updateOverduePayments, getDueDate, getDaysInfo, getPendingDuesSql } from "@/lib/payment-utils";

export async function GET(request: NextRequest) {
  try {
    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json({
        students: [],
        rooms: [],
        payments: [],
        revenue: [{ month: "Jan", revenue: 0 }, { month: "Feb", revenue: 0 }],
        roomDistribution: [
          { name: "Single", value: 0, color: "var(--primary)" },
          { name: "Double", value: 0, color: "#f97316" },
          { name: "Triple", value: 0, color: "#22c55e" },
        ],
        stats: {
          totalStudents: 0,
          totalRooms: 0,
          availableRooms: 0,
          occupiedRooms: 0,
          maintenanceRooms: 0,
          pendingBills: 0,
          pendingBillsAmount: 0,
        },
        pendingBillsList: [],
      });
    }

    await updateOverduePayments(hostelId);
    const { unpaidWhere, unpaidWhereNoAlias, revenueSelect, pendingBillsSelect } = await getPendingDuesSql();

    const [students] = await pool.execute(
      "SELECT s.*, r.number as room_number FROM students s LEFT JOIN rooms r ON s.room_id = r.id WHERE s.status = 'present' AND s.hostel_id = ?",
      [hostelId]
    );
    const studentsList = students as Array<Record<string, unknown>>;

    const [rooms] = await pool.execute(
      `SELECT r.*, COALESCE(occ.occupancy, 0) as occupancy FROM rooms r
       LEFT JOIN (SELECT room_id, COUNT(*) as occupancy FROM students WHERE status = 'present' GROUP BY room_id) occ ON r.id = occ.room_id
       WHERE r.hostel_id = ?
       ORDER BY r.number`,
      [hostelId]
    );
    const roomsList = rooms as Array<Record<string, unknown>>;

    const [payments] = await pool.execute(
      `SELECT p.*, s.name as student_name, s.join_date as student_join_date FROM payments p 
       JOIN students s ON p.student_id = s.id 
       WHERE (p.hostel_id = ? OR s.hostel_id = ?)
       ORDER BY p.created_at DESC LIMIT 20`,
      [hostelId, hostelId]
    );
    const paymentsListRaw = payments as Array<Record<string, unknown>>;
    const paymentsList = paymentsListRaw.map((p) => {
      let daysLeft: string | null = null;
      if (p.status !== "paid") {
        const dueDate = getDueDate(
          p.month as string,
          Number(p.year),
          p.student_join_date as string | null
        );
        daysLeft = getDaysInfo(dueDate).label;
      }
      return { ...p, days_left: daysLeft } as Record<string, unknown> & { days_left: string | null };
    });

    const [pendingStats] = await pool.execute(
      `SELECT ${pendingBillsSelect} FROM payments WHERE ${unpaidWhereNoAlias} AND (hostel_id = ? OR hostel_id IS NULL)`,
      [hostelId]
    );
    const pendingRow = (pendingStats as Array<Record<string, unknown>>)[0];
    const pendingBills = Number(pendingRow?.count ?? 0);
    const pendingBillsAmount = Number(pendingRow?.total ?? 0);

    const selectFields = unpaidWhere.includes("amount_paid")
      ? "p.id, p.student_id, p.amount, p.amount_due, p.amount_paid, p.month, p.year, p.status"
      : "p.id, p.student_id, p.amount, p.month, p.year, p.status";
    const [pendingBillsRows] = await pool.execute(
      `SELECT ${selectFields}, s.name as student_name, s.phone, r.number as room_number, s.join_date as student_join_date
       FROM payments p
       JOIN students s ON p.student_id = s.id
       LEFT JOIN rooms r ON s.room_id = r.id
       WHERE ${unpaidWhere} AND (p.hostel_id = ? OR s.hostel_id = ?)
       ORDER BY p.status = 'overdue' DESC, p.year DESC, FIELD(p.month, 'December','November','October','September','August','July','June','May','April','March','February','January') DESC`,
      [hostelId, hostelId]
    );
    const MONTH_ORDER = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const pendingBillsRaw = (pendingBillsRows as Array<Record<string, unknown>>).map((row) => {
      let daysLeft: string | null = null;
      const dueDate = getDueDate(
        row.month as string,
        Number(row.year),
        row.student_join_date as string | null
      );
      daysLeft = getDaysInfo(dueDate).label;
      const amountDue = Number(row.amount_due ?? row.amount ?? 0);
      const amountPaid = Number(row.amount_paid ?? 0);
      const balance = Math.max(0, amountDue - amountPaid);
      return {
        id: row.id,
        student_id: row.student_id,
        student_name: row.student_name,
        phone: row.phone,
        room_number: row.room_number || "-",
        amount: balance,
        amount_due: amountDue,
        amount_paid: amountPaid,
        month: row.month,
        year: row.year,
        status: row.status,
        days_left: daysLeft,
      };
    });
    const byStudentId = new Map<number, typeof pendingBillsRaw>();
    for (const row of pendingBillsRaw) {
      const sid = Number(row.student_id ?? 0);
      if (!sid) continue;
      if (!byStudentId.has(sid)) byStudentId.set(sid, []);
      byStudentId.get(sid)!.push(row);
    }
    const pendingBillsList = Array.from(byStudentId.entries()).map(([studentId, rows]) => {
      const totalAmount = rows.reduce((s, r) => s + r.amount, 0);
      const sorted = [...rows].sort((a, b) => {
        const ya = Number(a.year), yb = Number(b.year);
        if (ya !== yb) return ya - yb;
        return MONTH_ORDER.indexOf(a.month as string) - MONTH_ORDER.indexOf(b.month as string);
      });
      const first = sorted[0], last = sorted[sorted.length - 1];
      const monthRange = first === last ? `${first.month} ${first.year}` : `${first.month} ${first.year} - ${last.month} ${last.year}`;
      const mostOverdue = rows.find((r) => r.status === "overdue") ?? rows[0];
      const monthBreakdown = sorted.map((r) => ({
        month: r.month,
        year: Number(r.year),
        amount: r.amount,
        status: r.status,
      }));
      return {
        id: studentId,
        student_id: studentId,
        student_name: first.student_name,
        phone: first.phone,
        room_number: first.room_number,
        amount: totalAmount,
        month: monthRange,
        year: 0,
        status: mostOverdue.status,
        days_left: mostOverdue.days_left,
        monthBreakdown,
      };
    });

    const [revenueRows] = await pool.execute(
      `SELECT SUBSTRING(month, 1, 3) as month_short, year, ${revenueSelect} as revenue
       FROM payments WHERE status = 'paid' AND (hostel_id = ? OR hostel_id IS NULL)
       GROUP BY year, month
       ORDER BY year DESC, FIELD(month, 'December','November','October','September','August','July','June','May','April','March','February','January') DESC
       LIMIT 6`,
      [hostelId]
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
        days_left: p.days_left ?? null,
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
      },
      pendingBillsList,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}
