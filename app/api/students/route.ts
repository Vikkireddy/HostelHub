import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
import { updateOverduePayments, ensureBillsForStudents, getPendingDuesSql } from "@/lib/PaymentUtils";
import { requireSubscription } from "@/lib/subscription/RequireSubscription";
import { checkStudentLimit } from "@/lib/subscription/CheckFeature";
import { ensurePlannedVacateDateColumn } from "@/lib/ensurePlannedVacateDateColumn";
import { ensureStudentGenderColumn } from "@/lib/ensureGenderColumns";
import {
  normalizeGenderValue,
  normalizePhone,
  validatePhone,
  validateOptionalPhone,
} from "@/app/dashboard/students/students.constants";
import { ensureStudentOptionalPhoneAndEmergency } from "@/lib/ensureStudentContactColumns";
import { ensureStudentSecurityDepositColumns } from "@/lib/ensureStudentSecurityDepositColumns";
import { ensureStudentMonthlyRentColumn } from "@/lib/ensureStudentMonthlyRentColumn";
import { formatSqlDateOnlyForJson } from "@/lib/dateOnly";
import { ensureStudentsResidentTypeColumns } from "@/lib/ensureResidentTypeColumns";
import { assertDashboardPermission } from "@/lib/dashboardPermission.server";
import {
  mergeDetailsForKind,
  normalizeResidentKind,
  parseJsonDetails,
  sanitizeDetailsForKind,
} from "@/lib/residentType.constants";
export { dynamic } from "@/lib/forceDynamicRoute";

export async function GET(request: NextRequest) {
  try {
    const subErr = await requireSubscription(request);
    if (subErr) return subErr;

    const denied = await assertDashboardPermission(request, "residents", "view");
    if (denied) return denied;

    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json([], { status: 200 });
    }

    await ensureStudentsResidentTypeColumns();
    await ensureStudentSecurityDepositColumns();
    await ensureStudentMonthlyRentColumn();
    await ensureBillsForStudents(hostelId);
    await updateOverduePayments(hostelId);
    const { sumSelect, unpaidWhere } = await getPendingDuesSql();
    const [rows] = await pool.execute(
      `SELECT s.*, r.number as room_number,
        COALESCE((SELECT ${sumSelect} FROM payments p 
          WHERE p.student_id = s.id AND ${unpaidWhere}), 0) as pending_dues,
        COALESCE((SELECT COUNT(*) FROM payments p 
          WHERE p.student_id = s.id AND ${unpaidWhere} AND p.status = 'overdue'), 0) as overdue_count,
        COALESCE((SELECT COUNT(*) FROM payments p WHERE p.student_id = s.id), 0) as payment_count
       FROM students s 
       LEFT JOIN rooms r ON s.room_id = r.id 
       WHERE s.status = 'present' AND s.hostel_id = ?
       ORDER BY s.name ASC`,
      [hostelId]
    );
    const students = (rows as Array<Record<string, unknown>>).map((s) => {
      const pendingDues = Number(s.pending_dues ?? 0);
      const overdueCount = Number(s.overdue_count ?? 0);
      const payment_status =
        pendingDues === 0 ? "No Due Amount" : overdueCount > 0 ? "Overdue" : "Pending";
      const kind = normalizeResidentKind(s.resident_type);
      const dep = s.security_deposit_amount;
      return {
        ...s,
        join_date: formatSqlDateOnlyForJson(s.join_date),
        planned_vacate_date: formatSqlDateOnlyForJson(s.planned_vacate_date),
        pending_dues: pendingDues,
        payment_status,
        resident_type: kind,
        resident_type_details: mergeDetailsForKind(kind, parseJsonDetails(s.resident_type_details)),
        security_deposit_amount:
          dep == null || dep === "" ? null : Math.round(Number(dep) * 100) / 100,
      };
    });
    return NextResponse.json(students);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch residents" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const subErr = await requireSubscription(request);
    if (subErr) return subErr;

    const denied = await assertDashboardPermission(request, "residents", "add");
    if (denied) return denied;

    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      gender,
      email,
      phone,
      emergency_contact_phone,
      room_id,
      course,
      join_date,
      planned_vacate_date,
      id_proof_type,
      id_proof_number,
      address,
      resident_type,
      resident_type_details,
      security_deposit_amount,
      monthly_rent,
    } = body;
    const residentKind = normalizeResidentKind(resident_type);
    const residentDetailsJson = JSON.stringify(
      sanitizeDetailsForKind(residentKind, resident_type_details)
    );
    const plannedVacateYmd =
      planned_vacate_date != null && String(planned_vacate_date).trim() !== ""
        ? String(planned_vacate_date).trim().slice(0, 10)
        : null;

    const required = [
      ["name", name],
      ["gender", gender],
      ["phone", phone],
      ["room_id", room_id],
      ["course", course],
      ["join_date", join_date],
      ["id_proof_type", id_proof_type],
      ["id_proof_number", id_proof_number],
      ["address", address],
      ["monthly_rent", monthly_rent],
    ] as const;
    const missing = required.filter(([, v]) => v == null || String(v).trim() === "");
    if (missing.length > 0) {
      const fields = missing.map(([f]) => f).join(", ");
      return NextResponse.json(
        { error: `All fields are required. Missing: ${fields}` },
        { status: 400 }
      );
    }

    const genderNorm = normalizeGenderValue(gender);
    if (!genderNorm) {
      return NextResponse.json(
        { error: "Gender must be Male, Female, or Other." },
        { status: 400 }
      );
    }

    const phoneStr = typeof phone === "string" ? phone : "";
    const phoneErr = validatePhone(phoneStr);
    if (phoneErr) {
      return NextResponse.json({ error: phoneErr }, { status: 400 });
    }
    const emergStr =
      typeof emergency_contact_phone === "string" ? emergency_contact_phone : "";
    const emergErr = validateOptionalPhone(emergStr);
    if (emergErr) {
      return NextResponse.json({ error: emergErr }, { status: 400 });
    }
    const phoneForDb = normalizePhone(phoneStr);
    const emergDigits = normalizePhone(emergStr);
    const emergencyForDb = emergDigits.length === 10 ? emergDigits : null;

    await ensureStudentGenderColumn();
    await ensureStudentOptionalPhoneAndEmergency();
    await ensureStudentsResidentTypeColumns();
    await ensureStudentSecurityDepositColumns();
    await ensureStudentMonthlyRentColumn();
    let monthlyRentForDb: number | null = null;
    if (monthly_rent !== undefined && monthly_rent !== null && String(monthly_rent).trim() !== "") {
      const raw =
        typeof monthly_rent === "number"
          ? monthly_rent
          : Number(String(monthly_rent).replace(/,/g, "").trim());
      if (!Number.isFinite(raw) || raw <= 0) {
        return NextResponse.json(
          { error: "Monthly rent must be a valid amount greater than 0." },
          { status: 400 }
        );
      }
      if (raw > 99999999.99) {
        return NextResponse.json(
          { error: "Monthly rent amount is too large." },
          { status: 400 }
        );
      }
      monthlyRentForDb = Math.round(raw * 100) / 100;
    }
    if (monthlyRentForDb == null) {
      return NextResponse.json(
        { error: "Monthly rent is required and must be greater than 0." },
        { status: 400 }
      );
    }


    let depositForDb: number | null = null;
    if (
      security_deposit_amount !== undefined &&
      security_deposit_amount !== null &&
      String(security_deposit_amount).trim() !== ""
    ) {
      const raw =
        typeof security_deposit_amount === "number"
          ? security_deposit_amount
          : Number(String(security_deposit_amount).replace(/,/g, "").trim());
      if (!Number.isFinite(raw) || raw < 0) {
        return NextResponse.json(
          { error: "Advance / security deposit must be a valid non-negative amount." },
          { status: 400 }
        );
      }
      if (raw > 99999999.99) {
        return NextResponse.json(
          { error: "Advance / security deposit amount is too large." },
          { status: 400 }
        );
      }
      depositForDb = Math.round(raw * 100) / 100;
    }

    const limitErr = await checkStudentLimit(hostelId);
    if (limitErr) {
      return NextResponse.json(limitErr.body, { status: limitErr.status });
    }

    await ensurePlannedVacateDateColumn();

    if (room_id) {
      const [roomRows] = await pool.execute(
        `SELECT r.*, COALESCE(occ.occupancy, 0) as occupancy FROM rooms r
         LEFT JOIN (SELECT room_id, COUNT(*) as occupancy FROM students WHERE status = 'present' GROUP BY room_id) occ ON r.id = occ.room_id
         WHERE r.id = ? AND r.hostel_id = ?`,
        [Number(room_id), hostelId]
      );
      const room = (roomRows as Array<Record<string, unknown>>)[0];
      if (!room) {
        return NextResponse.json({ error: "Room not found" }, { status: 400 });
      }
      if (room.status === "maintenance") {
        return NextResponse.json({ error: "Cannot assign to a room under maintenance" }, { status: 400 });
      }
      const occupancy = Number(room.occupancy ?? 0);
      const capacity = Number(room.capacity ?? 0);
      if (occupancy >= capacity) {
        return NextResponse.json({ error: "Room is full" }, { status: 400 });
      }
    }

    let insertResult: { insertId?: number };

    try {
      const [result] = await pool.execute(
        `INSERT INTO students (hostel_id, name, gender, email, phone, emergency_contact_phone, room_id, course, monthly_rent, join_date, planned_vacate_date, id_proof_type, id_proof_number, address, security_deposit_amount, resident_type, resident_type_details, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'present')`,
        [
          hostelId,
          name,
          genderNorm,
          email || null,
          phoneForDb,
          emergencyForDb,
          room_id ? Number(room_id) : null,
          course || null,
          monthlyRentForDb,
          join_date || null,
          plannedVacateYmd,
          id_proof_type || null,
          id_proof_number || null,
          address || null,
          depositForDb,
          residentKind,
          residentDetailsJson,
        ]
      );
      insertResult = result as { insertId?: number };
    } catch (insertError: unknown) {
      const err = insertError as { code?: string };
      if (err.code === "ER_BAD_FIELD_ERROR") {
        const [result] = await pool.execute(
          `INSERT INTO students (hostel_id, name, gender, email, phone, emergency_contact_phone, room_id, course, monthly_rent, join_date, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'present')`,
          [
            hostelId,
            name,
            genderNorm,
            email || null,
            phoneForDb,
            emergencyForDb,
            room_id ? Number(room_id) : null,
            course || null,
            monthlyRentForDb,
            join_date || null,
          ]
        );
        insertResult = result as { insertId?: number };
      } else {
        throw insertError;
      }
    }
    const id = insertResult.insertId;

    if (room_id) {
      await pool.execute(
        `UPDATE rooms r
         LEFT JOIN (SELECT room_id, COUNT(*) as cnt FROM students WHERE status = 'present' GROUP BY room_id) occ ON r.id = occ.room_id
         SET r.status = 'full'
         WHERE r.id = ? AND COALESCE(occ.cnt, 0) >= r.capacity`,
        [Number(room_id)]
      );
    }

    return NextResponse.json({
      id,
      name,
      gender: genderNorm,
      email: email || null,
      phone: phoneForDb,
      emergency_contact_phone: emergencyForDb,
      room_id: room_id ? Number(room_id) : null,
      course: course || null,
      monthly_rent: monthlyRentForDb,
      join_date: join_date || null,
      planned_vacate_date: plannedVacateYmd,
      security_deposit_amount: depositForDb,
      status: "present",
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to create resident" },
      { status: 500 }
    );
  }
}
