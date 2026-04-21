import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
import { requireSubscription } from "@/lib/subscription/RequireSubscription";
import { ensureStudentDocumentsTable } from "@/lib/ensureStudentDocumentsTable";
import {
  STUDENT_DOC_ALLOWED_MIME,
  STUDENT_DOC_MAX_BYTES,
  isStudentDocumentCategory,
} from "@/lib/studentDocumentConstants";
import {
  writeStudentDocumentFile,
  unlinkStudentDocumentFile,
} from "@/lib/studentDocumentStorage";
import { assertDashboardPermission } from "@/lib/dashboardPermission.server";
export { dynamic } from "@/lib/forceDynamicRoute";

function formatDocTimestamp(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return null;
}

async function assertStudentInHostel(
  studentId: number,
  hostelId: number
): Promise<boolean> {
  const [rows] = await pool.execute(
    "SELECT id FROM students WHERE id = ? AND hostel_id = ? LIMIT 1",
    [studentId, hostelId]
  );
  return Array.isArray(rows) && (rows as unknown[]).length > 0;
}

async function removeSlotCategory(
  studentId: number,
  hostelId: number,
  category: "profile_photo" | "id_proof"
): Promise<void> {
  const [rows] = await pool.execute(
    `SELECT storage_rel_path FROM student_documents
     WHERE student_id = ? AND hostel_id = ? AND category = ?`,
    [studentId, hostelId, category]
  );
  const paths = (rows as Array<{ storage_rel_path: string }>).map((r) => r.storage_rel_path);
  await pool.execute(
    `DELETE FROM student_documents WHERE student_id = ? AND hostel_id = ? AND category = ?`,
    [studentId, hostelId, category]
  );
  for (const p of paths) {
    await unlinkStudentDocumentFile(p);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const subErr = await requireSubscription(request);
    if (subErr) return subErr;

    const denied = await assertDashboardPermission(request, "documents", "view");
    if (denied) return denied;

    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const studentId = Number(id);
    if (!id || Number.isNaN(studentId)) {
      return NextResponse.json({ error: "Invalid resident ID" }, { status: 400 });
    }

    await ensureStudentDocumentsTable();

    if (!(await assertStudentInHostel(studentId, hostelId))) {
      return NextResponse.json({ error: "Resident not found" }, { status: 404 });
    }

    const [rows] = await pool.execute(
      `SELECT id, student_id, category, label, file_name, mime_type, size_bytes, created_at
       FROM student_documents
       WHERE student_id = ? AND hostel_id = ? AND LOWER(category) <> 'agreement'
       ORDER BY created_at DESC`,
      [studentId, hostelId]
    );

    const documents = (rows as Array<Record<string, unknown>>).map((r) => ({
      id: r.id,
      student_id: r.student_id,
      category: r.category,
      label: r.label,
      file_name: r.file_name,
      mime_type: r.mime_type,
      size_bytes: r.size_bytes,
      created_at: formatDocTimestamp(r.created_at),
    }));

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("student documents list:", error);
    return NextResponse.json({ error: "Failed to load documents" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const subErr = await requireSubscription(request);
    if (subErr) return subErr;

    const denied = await assertDashboardPermission(request, "documents", "add");
    if (denied) return denied;

    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const studentId = Number(id);
    if (!id || Number.isNaN(studentId)) {
      return NextResponse.json({ error: "Invalid resident ID" }, { status: 400 });
    }

    await ensureStudentDocumentsTable();

    if (!(await assertStudentInHostel(studentId, hostelId))) {
      return NextResponse.json({ error: "Resident not found" }, { status: 404 });
    }

    const form = await request.formData();
    const file = form.get("file");
    const categoryRaw = String(form.get("category") ?? "").trim();
    const labelRaw = String(form.get("label") ?? "").trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    if (!isStudentDocumentCategory(categoryRaw)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
    if (categoryRaw.toLowerCase() === "agreement") {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const mime = (file.type || "application/octet-stream").toLowerCase();
    if (!STUDENT_DOC_ALLOWED_MIME.has(mime)) {
      return NextResponse.json(
        { error: "Unsupported file type. Use PDF, PNG, JPG, or WebP." },
        { status: 400 }
      );
    }

    const buf = Buffer.from(await file.arrayBuffer());
    if (buf.length === 0) {
      return NextResponse.json({ error: "Empty file" }, { status: 400 });
    }
    if (buf.length > STUDENT_DOC_MAX_BYTES) {
      return NextResponse.json(
        { error: `File too large (max ${STUDENT_DOC_MAX_BYTES / (1024 * 1024)} MB)` },
        { status: 400 }
      );
    }

    let label = labelRaw;
    if (!label) {
      if (categoryRaw === "profile_photo") label = "Profile photo";
      else if (categoryRaw === "id_proof") label = "ID proof";
      else label = "Document";
    }

    if (categoryRaw === "profile_photo" || categoryRaw === "id_proof") {
      await removeSlotCategory(studentId, hostelId, categoryRaw);
    }

    const originalName = file.name || "upload";
    const relPath = await writeStudentDocumentFile(hostelId, studentId, originalName, buf);

    const [result] = await pool.execute(
      `INSERT INTO student_documents
       (student_id, hostel_id, category, label, file_name, mime_type, size_bytes, storage_rel_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        hostelId,
        categoryRaw,
        label,
        originalName.slice(0, 200),
        mime,
        buf.length,
        relPath,
      ]
    );
    const insertId = (result as { insertId?: number }).insertId;

    return NextResponse.json({
      id: insertId,
      student_id: studentId,
      category: categoryRaw,
      label,
      file_name: originalName.slice(0, 200),
      mime_type: mime,
      size_bytes: buf.length,
    });
  } catch (error) {
    console.error("student documents upload:", error);
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 });
  }
}
