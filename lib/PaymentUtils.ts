import pool from "./db";

export async function hasPartialPaymentColumns(): Promise<boolean> {
  try {
    const [rows] = await pool.execute(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payments' AND COLUMN_NAME = 'amount_due'`
    );
    return (rows as unknown[]).length > 0;
  } catch {
    return false;
  }
}

/** payment_transactions.payment_reference + payment_mode (cash / online) */
export async function hasPaymentReferenceColumns(): Promise<boolean> {
  try {
    const [rows] = await pool.execute(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment_transactions' AND COLUMN_NAME = 'payment_reference'`
    );
    return (rows as unknown[]).length > 0;
  } catch {
    return false;
  }
}

/** payments.bill_payment_reference + bill_payment_mode (denormalized for list UI) */
export async function hasPaymentBillProofOnPayments(): Promise<boolean> {
  try {
    const [rows] = await pool.execute(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payments' AND COLUMN_NAME = 'bill_payment_reference'`
    );
    return (rows as unknown[]).length > 0;
  } catch {
    return false;
  }
}

/** SQL for pending dues sum - works with both schemas */
export async function getPendingDuesSql(): Promise<{
  sumSelect: string;
  unpaidWhere: string;
  unpaidWhereNoAlias: string;
  revenueSelect: string;
  pendingBillsSelect: string;
}> {
  const has = await hasPartialPaymentColumns();
  if (has) {
    return {
      sumSelect: "COALESCE(SUM(COALESCE(p.amount_due, p.amount) - COALESCE(p.amount_paid, 0)), 0)",
      unpaidWhere: "COALESCE(p.amount_paid, 0) < COALESCE(p.amount_due, p.amount)",
      unpaidWhereNoAlias: "COALESCE(amount_paid, 0) < COALESCE(amount_due, amount)",
      revenueSelect: "SUM(COALESCE(amount_paid, amount))",
      pendingBillsSelect: "COUNT(*) as count, COALESCE(SUM(COALESCE(amount_due, amount) - COALESCE(amount_paid, 0)), 0) as total",
    };
  }
  return {
    sumSelect: "COALESCE(SUM(p.amount), 0)",
    unpaidWhere: "p.status IN ('pending', 'overdue')",
    unpaidWhereNoAlias: "status IN ('pending', 'overdue')",
    revenueSelect: "SUM(amount)",
    pendingBillsSelect: "COUNT(*) as count, COALESCE(SUM(amount), 0) as total",
  };
}

const MONTH_INDEX: Record<string, number> = {
  January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
  July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
};

export function getDueDate(month: string, year: number, joinDate: string | Date | null): Date {
  const monthIdx = MONTH_INDEX[month] ?? 0;
  const nextMonthIdx = monthIdx + 1;
  const nextYear = nextMonthIdx > 11 ? year + 1 : year;
  const nextMonth = nextMonthIdx > 11 ? 0 : nextMonthIdx;
  const lastDay = new Date(nextYear, nextMonth + 1, 0).getDate();
  let dueDay = lastDay;
  if (joinDate) {
    const join = new Date(joinDate);
    const joinDay = join.getDate();
    dueDay = Math.min(joinDay, lastDay);
  }
  return new Date(nextYear, nextMonth, dueDay);
}

export function getDaysInfo(dueDate: Date): { days: number; label: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays > 0) return { days: diffDays, label: `${diffDays}d left` };
  if (diffDays < 0) return { days: Math.abs(diffDays), label: `${Math.abs(diffDays)}d overdue` };
  return { days: 0, label: "Due today" };
}

/**
 * Recalculates payment status based on amount_paid vs amount_due and due date.
 * Works with both old schema (status-based) and new schema (amount_due/amount_paid).
 * @param hostelId - When provided, only updates payments for this hostel
 */
export async function updateOverduePayments(hostelId?: number | null): Promise<void> {
  const hasNewColumns = await hasPartialPaymentColumns();
  const hostelFilter =
    hostelId != null
      ? " AND (p.hostel_id = ? OR (p.hostel_id IS NULL AND s.hostel_id = ?))"
      : "";
  const params = hostelId != null ? [hostelId, hostelId] : [];

  const whereClause = hasNewColumns
    ? "COALESCE(p.amount_paid, 0) < COALESCE(p.amount_due, p.amount)"
    : "p.status IN ('pending', 'overdue')";
  const selectFields = hasNewColumns
    ? "p.id, p.month, p.year, p.amount, p.amount_due, p.amount_paid, s.join_date"
    : "p.id, p.month, p.year, p.amount, s.join_date";

  const [rows] = await pool.execute(
    `SELECT ${selectFields} FROM payments p
     JOIN students s ON p.student_id = s.id
     WHERE ${whereClause}${hostelFilter}`,
    params
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueIds: number[] = [];
  const pendingIds: number[] = [];

  for (const row of rows as Array<Record<string, unknown>>) {
    if (hasNewColumns) {
      const amountDue = Number(row.amount_due ?? row.amount ?? 0);
      const amountPaid = Number(row.amount_paid ?? 0);
      if (amountPaid >= amountDue) continue;
    }

    const dueDate = getDueDate(
      row.month as string,
      Number(row.year),
      row.join_date as string | null
    );
    dueDate.setHours(0, 0, 0, 0);
    if (dueDate < today) {
      overdueIds.push(Number(row.id));
    } else {
      pendingIds.push(Number(row.id));
    }
  }

  if (overdueIds.length > 0) {
    await pool.execute(
      `UPDATE payments SET status = 'overdue' WHERE id IN (${overdueIds.join(",")})`
    );
  }
  if (pendingIds.length > 0) {
    await pool.execute(
      `UPDATE payments SET status = 'pending' WHERE id IN (${pendingIds.join(",")})`
    );
  }

  if (hasNewColumns) {
    const paidWhere =
      hostelId != null ? " AND hostel_id = ?" : "";
    const paidParams = hostelId != null ? [hostelId] : [];
    const [paidRows] = await pool.execute(
      `SELECT id FROM payments WHERE COALESCE(amount_paid, 0) >= COALESCE(amount_due, amount) AND status != 'paid'${paidWhere}`,
      paidParams
    );
    const paidIds = (paidRows as Array<Record<string, unknown>>).map((r) => Number(r.id));
    if (paidIds.length > 0) {
      await pool.execute(
        `UPDATE payments SET status = 'paid', paid_at = NOW() WHERE id IN (${paidIds.join(",")})`
      );
    }
  }
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Ensures bill records exist for present students with rooms.
 * Creates bills for each month from join date to current month.
 * @param hostelId - When provided, only processes students for this hostel
 */
export async function ensureBillsForStudents(hostelId?: number | null): Promise<void> {
  const hasNewColumns = await hasPartialPaymentColumns();
  const hostelFilter = hostelId != null ? " AND s.hostel_id = ?" : "";
  const params = hostelId != null ? [hostelId] : [];

  const [students] = await pool.execute(
    `SELECT s.id, s.join_date, r.rent, s.hostel_id FROM students s 
     JOIN rooms r ON s.room_id = r.id 
     WHERE s.status = 'present' AND r.rent > 0 AND s.join_date IS NOT NULL${hostelFilter}`,
    params
  );

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  for (const row of students as Array<Record<string, unknown>>) {
    const studentId = Number(row.id);
    const joinDate = new Date(row.join_date as string);
    const rent = Number(row.rent ?? 0);
    if (rent <= 0) continue;

    for (let y = joinDate.getFullYear(); y <= currentYear; y++) {
      const startMonth = y === joinDate.getFullYear() ? joinDate.getMonth() : 0;
      const endMonth = y === currentYear ? currentMonth : 11;
      for (let m = startMonth; m <= endMonth; m++) {
        const monthName = MONTH_NAMES[m];
        const [existing] = await pool.execute(
          `SELECT id FROM payments WHERE student_id = ? AND month = ? AND year = ?`,
          [studentId, monthName, y]
        );
        if ((existing as unknown[]).length === 0) {
          const studentHostelId = row.hostel_id != null ? Number(row.hostel_id) : null;
          if (hasNewColumns) {
            await pool.execute(
              `INSERT INTO payments (student_id, amount, month, year, amount_due, amount_paid, status, hostel_id)
               VALUES (?, ?, ?, ?, ?, 0, 'pending', ?)`,
              [studentId, rent, monthName, y, rent, studentHostelId]
            );
          } else {
            await pool.execute(
              `INSERT INTO payments (student_id, amount, month, year, status, hostel_id)
               VALUES (?, ?, ?, ?, 'pending', ?)`,
              [studentId, rent, monthName, y, studentHostelId]
            );
          }
        }
      }
    }
  }
}
