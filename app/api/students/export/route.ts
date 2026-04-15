import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
import { requireSubscription } from "@/lib/subscription/RequireSubscription";
import { formatSqlDateOnlyForJson } from "@/lib/dateOnly";
export { dynamic } from "@/lib/forceDynamicRoute";

const escapeCsv = (value: unknown): string => {
  const s = value == null ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, "\"\"")}"`;
  return s;
};

export async function GET(request: NextRequest) {
  try {
    const subErr = await requireSubscription(request);
    if (subErr) return subErr;

    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [rows] = await pool.execute(
      `SELECT s.name, s.email, s.phone, r.number as room_number, s.course, s.join_date,
              s.id_proof_type, s.id_proof_number, s.address, s.planned_vacate_date
       FROM students s
       LEFT JOIN rooms r ON s.room_id = r.id
       WHERE s.hostel_id = ? AND s.status = 'present'
       ORDER BY s.name ASC`,
      [hostelId]
    );
    const list = rows as Array<Record<string, unknown>>;

    const headers = [
      "name",
      "email",
      "phone",
      "room_number",
      "course",
      "join_date",
      "id_proof_type",
      "id_proof_number",
      "address",
      "planned_vacate_date",
    ];
    const exportRows = list.map((s) => ({
      name: s.name ?? "",
      email: s.email ?? "",
      phone: s.phone ?? "",
      room_number: s.room_number ?? "",
      course: s.course ?? "",
      join_date: formatSqlDateOnlyForJson(s.join_date) ?? "",
      id_proof_type: s.id_proof_type ?? "",
      id_proof_number: s.id_proof_number ?? "",
      address: s.address ?? "",
      planned_vacate_date: formatSqlDateOnlyForJson(s.planned_vacate_date) ?? "",
    }));
    const today = new Date().toISOString().slice(0, 10);

    const lines = [headers.join(",")];
    for (const s of exportRows) {
      const row = [
        s.name,
        s.email,
        s.phone,
        s.room_number,
        s.course,
        formatSqlDateOnlyForJson(s.join_date),
        s.id_proof_type,
        s.id_proof_number,
        s.address,
        formatSqlDateOnlyForJson(s.planned_vacate_date),
      ].map(escapeCsv);
      lines.push(row.join(","));
    }
    const csv = lines.join("\n");
    const filename = `students-export-${today}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Student export error:", error);
    return NextResponse.json({ error: "Failed to export students" }, { status: 500 });
  }
}
