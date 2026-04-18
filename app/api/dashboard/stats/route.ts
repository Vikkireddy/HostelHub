import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
import { updateOverduePayments, getDueDate, getDaysInfo, getPendingDuesSql } from "@/lib/PaymentUtils";
import { requireSubscription } from "@/lib/subscription/RequireSubscription";
import { validateHostelSubscription } from "@/lib/subscription/validate";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription/constants";
import { ensurePlannedVacateDateColumn } from "@/lib/ensurePlannedVacateDateColumn";
import { sqlDateOnlyToYmd, todayDateOnlyLocal, formatSqlDateOnlyForJson } from "@/lib/dateOnly";
export { dynamic } from "@/lib/forceDynamicRoute";

const MONTH_SHORT_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] as const;

/** Last `count` calendar months ending at `ref` (inclusive), oldest first — for continuous charts. */
const lastCalendarMonths = (
  count: number,
  ref = new Date()
): Array<{ year: number; monthNum: number; monthShort: string }> => {
  const out: Array<{ year: number; monthNum: number; monthShort: string }> = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(ref.getFullYear(), ref.getMonth() - i, 1);
    const idx = d.getMonth();
    out.push({
      year: d.getFullYear(),
      monthNum: idx + 1,
      monthShort: MONTH_SHORT_LABELS[idx],
    });
  }
  return out;
};

export async function GET(request: NextRequest) {
  try {
    const subErr = await requireSubscription(request);
    if (subErr) return subErr;

    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json({
        students: [],
        rooms: [],
        payments: [],
        revenue: [{ month: "Jan", revenue: 0 }, { month: "Feb", revenue: 0 }],
        incomeVsExpenses: [
          { month: "Jan", income: 0, expenses: 0, profit: 0 },
          { month: "Feb", income: 0, expenses: 0, profit: 0 },
        ],
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
          totalExpensesThisMonth: 0,
          monthlyRevenueThisMonth: 0,
          profitThisMonth: 0,
          studentsAddedDiff: 0,
        },
        pendingBillsList: [],
        plannedVacates: [],
        studentCapacity: null,
        planCapabilities: { advancedAnalytics: false },
      });
    }

    await ensurePlannedVacateDateColumn();

    const { status: subStatus } = await validateHostelSubscription(hostelId);
    const advancedAnalytics = true;

    await updateOverduePayments(hostelId);
    const { unpaidWhere, unpaidWhereNoAlias, revenueSelect, pendingBillsSelect } = await getPendingDuesSql();

    const [students] = await pool.execute(
      "SELECT s.*, r.number as room_number FROM students s LEFT JOIN rooms r ON s.room_id = r.id WHERE s.status = 'present' AND s.hostel_id = ?",
      [hostelId]
    );
    const studentsList = students as Array<Record<string, unknown>>;
    const todayYmd = todayDateOnlyLocal();
    const plannedVacates = studentsList
      .filter((s) => {
        const ymd = sqlDateOnlyToYmd(s.planned_vacate_date);
        if (!ymd) return false;
        return ymd >= todayYmd;
      })
      .sort((a, b) =>
        sqlDateOnlyToYmd(a.planned_vacate_date).localeCompare(sqlDateOnlyToYmd(b.planned_vacate_date))
      )
      .map((s) => ({
        id: s.id,
        studentName: String(s.name ?? ""),
        room: (s.room_number as string) || "-",
        plannedVacateDate: sqlDateOnlyToYmd(s.planned_vacate_date),
      }));

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

    const EMPTY_REVENUE = [
      { month: "Jan", revenue: 0 },
      { month: "Feb", revenue: 0 },
    ];
    const EMPTY_INCOME_VS_EXP = [
      { month: "Jan", income: 0, expenses: 0, profit: 0 },
      { month: "Feb", income: 0, expenses: 0, profit: 0 },
    ];
    const EMPTY_ROOM_DIST = [
      { name: "Single", value: 0, color: "var(--primary)" },
      { name: "Double", value: 0, color: "#f97316" },
      { name: "Triple", value: 0, color: "#22c55e" },
    ];

    let revenueData: Array<{ month: string; revenue: number }>;
    let incomeVsExpenses: Array<{ month: string; income: number; expenses: number; profit: number }>;
    let roomDistribution: Array<{ name: string; value: number; color: string }>;

    if (advancedAnalytics) {
      const [revenueRows] = await pool.execute(
        `SELECT SUBSTRING(month, 1, 3) as month_short, month as month_name, year, ${revenueSelect} as revenue
         FROM payments WHERE status = 'paid' AND (hostel_id = ? OR hostel_id IS NULL)
         GROUP BY year, month`,
        [hostelId]
      );
      const revRows = revenueRows as Array<Record<string, unknown>>;
      const revenueByYearMonth = new Map<string, number>();
      for (const r of revRows) {
        const monthName = String(r.month_name || "");
        const monthNum = MONTH_ORDER.indexOf(monthName) + 1 || 1;
        const year = Number(r.year) || 0;
        if (!year) continue;
        revenueByYearMonth.set(`${year}-${monthNum}`, Number(r.revenue) || 0);
      }

      const chartMonths = lastCalendarMonths(6);
      revenueData = chartMonths.map(({ year, monthNum, monthShort }) => ({
        month: monthShort,
        revenue: revenueByYearMonth.get(`${year}-${monthNum}`) ?? 0,
      }));

      let expenseByMonth = new Map<string, number>();
      try {
        const [expenseRows] = await pool.execute(
          `SELECT MONTH(expense_date) as m, YEAR(expense_date) as y, COALESCE(SUM(amount), 0) as total
           FROM admin_expenses WHERE hostel_id = ?
           GROUP BY y, m`,
          [hostelId]
        );
        for (const row of expenseRows as Array<Record<string, unknown>>) {
          const key = `${row.y}-${row.m}`;
          expenseByMonth.set(key, Number(row.total ?? 0));
        }
      } catch {
        expenseByMonth = new Map();
      }

      incomeVsExpenses = chartMonths.map(({ year, monthNum, monthShort }) => {
        const key = `${year}-${monthNum}`;
        const income = revenueByYearMonth.get(key) ?? 0;
        const expenses = expenseByMonth.get(key) ?? 0;
        const yy = String(year).slice(-2);
        return {
          month: `${monthShort} '${yy}`,
          income,
          expenses,
          profit: income - expenses,
        };
      });

      roomDistribution = (roomsList as Array<Record<string, unknown>>).reduce(
        (acc: Array<{ name: string; value: number; color: string }>, r) => {
          const type = String(r.type || "Unknown");
          const existing = acc.find((x) => x.name === type);
          if (existing) existing.value++;
          else acc.push({ name: type, value: 1, color: type === "Single" ? "var(--primary)" : type === "Double" ? "#f97316" : "#22c55e" });
          return acc;
        },
        []
      );
    } else {
      revenueData = [...EMPTY_REVENUE];
      incomeVsExpenses = [...EMPTY_INCOME_VS_EXP];
      roomDistribution = [...EMPTY_ROOM_DIST];
    }

    const totalRooms = roomsList.length;
    const available = roomsList.filter((r) => r.status === "available").length;
    const occupied = roomsList.filter((r) => r.status === "full").length;
    const maintenance = roomsList.filter((r) => r.status === "maintenance").length;

    // Students added: compare current month vs last month (join_date)
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    const [studentsAddedRows] = await pool.execute(
      `SELECT 
        SUM(CASE WHEN MONTH(join_date) = ? AND YEAR(join_date) = ? AND status = 'present' THEN 1 ELSE 0 END) as this_month,
        SUM(CASE WHEN MONTH(join_date) = ? AND YEAR(join_date) = ? AND status = 'present' THEN 1 ELSE 0 END) as last_month
       FROM students WHERE hostel_id = ?`,
      [currentMonth, currentYear, lastMonth, lastMonthYear, hostelId]
    );
    const saRow = (studentsAddedRows as Array<Record<string, unknown>>)[0];
    const studentsThisMonth = Number(saRow?.this_month ?? 0);
    const studentsLastMonth = Number(saRow?.last_month ?? 0);
    const studentsAddedDiff = studentsThisMonth - studentsLastMonth;

    let totalExpensesThisMonth = 0;
    let monthlyRevenueThisMonth = 0;
    if (advancedAnalytics) {
      try {
        const [expenseRows] = await pool.execute(
          `SELECT COALESCE(SUM(amount), 0) as total FROM admin_expenses 
           WHERE hostel_id = ? AND MONTH(expense_date) = ? AND YEAR(expense_date) = ?`,
          [hostelId, currentMonth, currentYear]
        );
        totalExpensesThisMonth = Number((expenseRows as Array<Record<string, unknown>>)[0]?.total ?? 0);
      } catch {
        // admin_expenses table may not exist yet
      }
      const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
      const currentMonthName = monthNames[currentMonth - 1];
      const [revenueThisMonthRows] = await pool.execute(
        `SELECT COALESCE(${revenueSelect}, 0) as revenue
         FROM payments WHERE status = 'paid' AND month = ? AND year = ? AND (hostel_id = ? OR hostel_id IS NULL)`,
        [currentMonthName, currentYear, hostelId]
      );
      monthlyRevenueThisMonth = Number((revenueThisMonthRows as Array<Record<string, unknown>>)[0]?.revenue ?? 0);
    }
    const profitThisMonth = monthlyRevenueThisMonth - totalExpensesThisMonth;

    const planMeta = SUBSCRIPTION_PLANS.find((p) => p.id === subStatus?.planId);
    const planStudentCap = planMeta?.max_students;
    const studentCapacity =
      planStudentCap == null
        ? null
        : {
            max: planStudentCap,
            current: studentsList.length,
            remaining: Math.max(0, planStudentCap - studentsList.length),
          };

    return NextResponse.json({
      students: studentsList.map((s) => ({
        id: s.id,
        name: s.name,
        room: s.room_number || "-",
        course: s.course,
        joinDate: formatSqlDateOnlyForJson(s.join_date) ?? "",
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
      incomeVsExpenses: incomeVsExpenses.length ? incomeVsExpenses : [
        { month: "Jan", income: 0, expenses: 0, profit: 0 },
        { month: "Feb", income: 0, expenses: 0, profit: 0 },
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
        totalExpensesThisMonth,
        monthlyRevenueThisMonth,
        profitThisMonth,
        studentsAddedDiff,
      },
      pendingBillsList,
      plannedVacates,
      studentCapacity,
      planCapabilities: { advancedAnalytics },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}
