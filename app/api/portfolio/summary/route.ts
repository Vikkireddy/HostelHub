import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAdminEmailFromRequest, loadAdminByEmail, listAccessibleHostelsForAdmin } from "@/lib/adminAccess.server";
import { ensureMultiHostelSchema } from "@/lib/ensureMultiHostelSchema";
import { todayDateOnlyLocal } from "@/lib/dateOnly";
import { getPendingDuesSql, updateOverduePayments } from "@/lib/PaymentUtils";
import { ensurePlannedVacateDateColumn } from "@/lib/ensurePlannedVacateDateColumn";
export { dynamic } from "@/lib/forceDynamicRoute";

export async function GET(request: NextRequest) {
  try {
    await ensureMultiHostelSchema();
    const email = getAdminEmailFromRequest(request);
    if (!email) {
      return NextResponse.json({ success: false, error: "Admin identity required" }, { status: 401 });
    }
    const admin = await loadAdminByEmail(email);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const isOwner = admin.is_owner === true || admin.is_owner === 1;
    const mode = String(admin.management_mode ?? "single").toLowerCase();
    if (!isOwner || mode !== "multi") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const hostels = await listAccessibleHostelsForAdmin(admin.id);
    await ensurePlannedVacateDateColumn();
    const { sumSelect, unpaidWhere } = await getPendingDuesSql();
    const todayYmd = todayDateOnlyLocal();
    const vacateLimit = new Date();
    vacateLimit.setDate(vacateLimit.getDate() + 60);
    const vacateLimitYmd = vacateLimit.toISOString().slice(0, 10);

    type Card = {
      id: number;
      name: string;
      city: string | null;
      state: string | null;
      isActive: boolean;
      rooms: number;
      residents: number;
      occupiedRooms: number;
      occupiedPct: number;
      pendingPayments: number;
      vacatingSoon: number;
    };

    const cards: Card[] = [];
    let totalResidents = 0;
    let totalRooms = 0;
    let totalOccupied = 0;
    let totalPending = 0;
    let totalVacating = 0;

    const firstCount = (rows: unknown) => Number((rows as { c?: unknown }[])[0]?.c ?? 0);

    for (const h of hostels) {
      await updateOverduePayments(h.id);
      const [roomRows] = await pool.execute(
        `SELECT COUNT(*) AS c FROM rooms WHERE hostel_id = ?`,
        [h.id]
      );
      const [resRows] = await pool.execute(
        `SELECT COUNT(*) AS c FROM students WHERE hostel_id = ? AND status = 'present'`,
        [h.id]
      );
      const [occRows] = await pool.execute(
        `SELECT COUNT(DISTINCT room_id) AS c FROM students WHERE hostel_id = ? AND status = 'present' AND room_id IS NOT NULL`,
        [h.id]
      );
      const [pendRows] = await pool.execute(
        `SELECT COUNT(*) AS c FROM students s WHERE s.hostel_id = ? AND s.status = 'present'
         AND COALESCE((SELECT ${sumSelect} FROM payments p WHERE p.student_id = s.id AND ${unpaidWhere}), 0) > 0`,
        [h.id]
      );
      const [vacRows] = await pool.execute(
        `SELECT COUNT(*) AS c FROM students WHERE hostel_id = ? AND status = 'present'
         AND planned_vacate_date IS NOT NULL
         AND planned_vacate_date >= ? AND planned_vacate_date <= ?`,
        [h.id, todayYmd, vacateLimitYmd]
      );

      const rooms = firstCount(roomRows);
      const residents = firstCount(resRows);
      const occupiedRooms = firstCount(occRows);
      const pendingPayments = firstCount(pendRows);
      const vacatingSoon = firstCount(vacRows);
      const occupiedPct = rooms > 0 ? Math.round((occupiedRooms / rooms) * 100) : 0;

      cards.push({
        id: h.id,
        name: h.name,
        city: h.city,
        state: h.state,
        isActive: Number(h.is_active_hostel) === 1,
        rooms,
        residents,
        occupiedRooms,
        occupiedPct,
        pendingPayments,
        vacatingSoon,
      });

      totalResidents += residents;
      totalRooms += rooms;
      totalOccupied += occupiedRooms;
      totalPending += pendingPayments;
      totalVacating += vacatingSoon;
    }

    const vacantRooms = Math.max(0, totalRooms - totalOccupied);

    return NextResponse.json({
      success: true,
      kpis: {
        totalHostels: hostels.length,
        totalResidents,
        totalRooms,
        occupiedRooms: totalOccupied,
        vacantRooms,
        pendingPayments: totalPending,
        monthlyRevenue: 0,
        monthlyExpenses: 0,
      },
      hostels: cards,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Failed to load portfolio" }, { status: 500 });
  }
}
