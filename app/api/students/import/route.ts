import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
import { updateOverduePayments, ensureBillsForStudents } from "@/lib/PaymentUtils";
import { requireSubscription } from "@/lib/subscription/RequireSubscription";
import { getRemainingStudentSlots } from "@/lib/subscription/CheckFeature";
import { ensurePlannedVacateDateColumn } from "@/lib/ensurePlannedVacateDateColumn";
import { ensureStudentGenderColumn } from "@/lib/ensureGenderColumns";
import { ensureStudentOptionalPhoneAndEmergency } from "@/lib/ensureStudentContactColumns";
import { ensureStudentMonthlyRentColumn } from "@/lib/ensureStudentMonthlyRentColumn";
import {
  validateIdProof,
  normalizeIdProof,
  validatePhone,
  validateOptionalPhone,
  normalizePhone,
  normalizeGenderValue,
} from "@/app/dashboard/students/students.constants";
import type { StudentCsvRow } from "@/app/dashboard/students/studentCsv.utils";
import { assertDashboardPermission } from "@/lib/dashboardPermission.server";
export { dynamic } from "@/lib/forceDynamicRoute";

const MAX_ROWS = 200;

const ID_PROOF_TYPES = [
  "Aadhaar",
  "PAN",
  "Passport",
  "Driving License",
  "Voter ID",
  "College ID",
  "Other",
] as const;

const matchIdProofType = (raw: string): string | null => {
  const t = raw.trim();
  if (!t) return null;
  const hit = ID_PROOF_TYPES.find((o) => o.toLowerCase() === t.toLowerCase());
  return hit ?? null;
};

type ImportFailure = { line: number; message: string };

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
    const rows = body?.rows as StudentCsvRow[] | undefined;
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "rows array is required" }, { status: 400 });
    }
    if (rows.length > MAX_ROWS) {
      return NextResponse.json(
        { error: `At most ${MAX_ROWS} rows per import.` },
        { status: 400 }
      );
    }

    const { remaining, max, current } = await getRemainingStudentSlots(hostelId);
    if (remaining !== null && remaining <= 0) {
      return NextResponse.json(
        {
          error:
            max != null
              ? `Your plan allows up to ${max} residents (${current} in use). Upgrade to add more.`
              : "Cannot add residents.",
        },
        { status: 403 }
      );
    }

    await ensurePlannedVacateDateColumn();
    await ensureStudentGenderColumn();
    await ensureStudentOptionalPhoneAndEmergency();
    await ensureStudentMonthlyRentColumn();

    const [roomRows] = await pool.execute(
      `SELECT r.id, r.number, r.capacity, r.status,
        COALESCE(occ.cnt, 0) as occupancy
       FROM rooms r
       LEFT JOIN (
         SELECT room_id, COUNT(*) as cnt FROM students WHERE status = 'present' GROUP BY room_id
       ) occ ON r.id = occ.room_id
       WHERE r.hostel_id = ?`,
      [hostelId]
    );
    const roomList = roomRows as Array<Record<string, unknown>>;
    const roomByNumber = new Map<string, (typeof roomList)[0]>();
    for (const r of roomList) {
      const num = String(r.number ?? "").trim();
      if (num) roomByNumber.set(num.toLowerCase(), r);
    }

    type SimRoom = { id: number; capacity: number; occupancy: number; status: string };
    const simById = new Map<number, SimRoom>();
    for (const r of roomList) {
      const id = Number(r.id);
      simById.set(id, {
        id,
        capacity: Number(r.capacity ?? 0),
        occupancy: Number(r.occupancy ?? 0),
        status: String(r.status ?? ""),
      });
    }

    const failures: ImportFailure[] = [];
    let created = 0;
    let slotsLeft = remaining ?? Number.MAX_SAFE_INTEGER;

    for (let i = 0; i < rows.length; i++) {
      const line = i + 2;
      const row = rows[i];

      if (slotsLeft <= 0) {
        failures.push({
          line,
          message: `Resident limit reached${max != null ? ` (max ${max})` : ""}.`,
        });
        continue;
      }

      const name = (row.name ?? "").trim();
      const email = (row.email ?? "").trim();
      const phoneRaw = (row.phone ?? "").trim();
      const roomNumber = (row.room_number ?? "").trim();
      const monthlyRentRaw = (row.monthly_rent ?? "").trim();
      const course = (row.course ?? "").trim();
      const joinDate = (row.join_date ?? "").trim();
      const idTypeRaw = (row.id_proof_type ?? "").trim();
      const idNumRaw = (row.id_proof_number ?? "").trim();
      const address = (row.address ?? "").trim();
      const plannedRaw = (row.planned_vacate_date ?? "").trim();
      const genderRaw = (row.gender ?? "").trim();
      const emergRaw = (row.emergency_contact_phone ?? "").trim();

      const missing: string[] = [];
      if (!name) missing.push("name");
      if (!email) missing.push("email");
      if (!phoneRaw) missing.push("phone");
      if (!roomNumber) missing.push("room_number");
      if (!monthlyRentRaw) missing.push("monthly_rent");
      if (!course) missing.push("course");
      const monthlyRent = Number(monthlyRentRaw.replace(/,/g, ""));
      if (!Number.isFinite(monthlyRent) || monthlyRent <= 0) {
        failures.push({ line, message: "monthly_rent must be a valid amount greater than 0." });
        continue;
      }

      if (!joinDate) missing.push("join_date");
      if (!idTypeRaw) missing.push("id_proof_type");
      if (!idNumRaw) missing.push("id_proof_number");
      if (!address) missing.push("address");
      if (missing.length > 0) {
        failures.push({ line, message: `Missing: ${missing.join(", ")}` });
        continue;
      }

      let genderForDb: string | null = null;
      if (genderRaw) {
        const g = normalizeGenderValue(genderRaw);
        if (!g) {
          failures.push({
            line,
            message: `Invalid gender "${genderRaw}". Use Male, Female, or Other.`,
          });
          continue;
        }
        genderForDb = g;
      }

      const phoneErr = validatePhone(phoneRaw);
      if (phoneErr) {
        failures.push({ line, message: phoneErr });
        continue;
      }
      const phoneForDb = normalizePhone(phoneRaw);

      const emergErr = validateOptionalPhone(emergRaw);
      if (emergErr) {
        failures.push({ line, message: emergErr });
        continue;
      }
      const emergDigits = normalizePhone(emergRaw);
      const emergencyForDb = emergDigits.length === 10 ? emergDigits : null;

      const idProofType = matchIdProofType(idTypeRaw);
      if (!idProofType) {
        failures.push({
          line,
          message: `Unknown id_proof_type "${idTypeRaw}". Use Aadhaar, PAN, Passport, etc.`,
        });
        continue;
      }
      const idErr = validateIdProof(idProofType, idNumRaw);
      if (idErr) {
        failures.push({ line, message: idErr });
        continue;
      }
      const idProofNumber = normalizeIdProof(idProofType, idNumRaw);

      const room = roomByNumber.get(roomNumber.toLowerCase());
      if (!room) {
        failures.push({ line, message: `Room "${roomNumber}" not found for this hostel.` });
        continue;
      }
      const roomId = Number(room.id);
      const sim = simById.get(roomId);
      if (!sim) {
        failures.push({ line, message: "Room state error." });
        continue;
      }
      if (sim.status === "maintenance") {
        failures.push({ line, message: `Room "${roomNumber}" is under maintenance.` });
        continue;
      }
      if (sim.occupancy >= sim.capacity) {
        failures.push({ line, message: `Room "${roomNumber}" is full.` });
        continue;
      }

      const plannedVacateYmd = plannedRaw ? plannedRaw.slice(0, 10) : null;

      try {
        try {
          await pool.execute(
            `INSERT INTO students (hostel_id, name, gender, email, phone, emergency_contact_phone, room_id, course, monthly_rent, join_date, planned_vacate_date, id_proof_type, id_proof_number, address, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'present')`,
            [
              hostelId,
              name,
              genderForDb,
              email || null,
              phoneForDb,
              emergencyForDb,
              roomId,
              course || null,
              monthlyRent,
              joinDate || null,
              plannedVacateYmd,
              idProofType || null,
              idProofNumber || null,
              address || null,
            ]
          );
        } catch (insertErr: unknown) {
          const code = (insertErr as { code?: string }).code;
          if (code === "ER_BAD_FIELD_ERROR") {
            await pool.execute(
              `INSERT INTO students (hostel_id, name, gender, email, phone, emergency_contact_phone, room_id, course, monthly_rent, join_date, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'present')`,
              [
                hostelId,
                name,
                genderForDb,
                email || null,
                phoneForDb,
                emergencyForDb,
                roomId,
                course || null,
                monthlyRent,
                joinDate || null,
              ]
            );
          } else {
            throw insertErr;
          }
        }

        sim.occupancy += 1;
        await pool.execute(
          `UPDATE rooms r
           LEFT JOIN (SELECT room_id, COUNT(*) as cnt FROM students WHERE status = 'present' GROUP BY room_id) occ ON r.id = occ.room_id
           SET r.status = 'full'
           WHERE r.id = ? AND COALESCE(occ.cnt, 0) >= r.capacity`,
          [roomId]
        );

        created += 1;
        slotsLeft -= 1;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Insert failed";
        failures.push({ line, message: msg });
      }
    }

    await ensureBillsForStudents(hostelId);
    await updateOverduePayments(hostelId);

    return NextResponse.json({
      created,
      failed: failures.length,
      failures,
    });
  } catch (error) {
    console.error("Student import error:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
