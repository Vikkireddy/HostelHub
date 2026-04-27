import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import pool from "@/lib/db";
import { getHostelIdFromRequest } from "@/lib/GetHostelId";
import { requireSubscription } from "@/lib/subscription/RequireSubscription";
import { ensureStudentDocumentsTable } from "@/lib/ensureStudentDocumentsTable";
import { absolutePathFromRel, unlinkStudentDocumentFile } from "@/lib/studentDocumentStorage";
import { assertDashboardPermission } from "@/lib/dashboardPermission.server";
export { dynamic } from "@/lib/forceDynamicRoute";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
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

    const { id, documentId } = await params;
    const studentId = Number(id);
    const docId = Number(documentId);
    if (!id || Number.isNaN(studentId) || !documentId || Number.isNaN(docId)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    await ensureStudentDocumentsTable();

    const [rows] = await pool.execute(
      `SELECT d.id, d.storage_rel_path, d.file_name, d.mime_type, d.student_id, d.hostel_id, d.category
       FROM student_documents d
       WHERE d.id = ? AND d.student_id = ? AND d.hostel_id = ? AND LOWER(d.category) <> 'agreement'
       LIMIT 1`,
      [docId, studentId, hostelId]
    );
    const row = (rows as Array<Record<string, unknown>>)[0];
    if (!row) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const abs = absolutePathFromRel(String(row.storage_rel_path));
    let buffer: Buffer;
    try {
      buffer = await fs.readFile(abs);
    } catch {
      return NextResponse.json({ error: "File missing on disk" }, { status: 404 });
    }

    const mime = String(row.mime_type || "application/octet-stream");
    const download = request.nextUrl.searchParams.get("download") === "1";
    const safeName = String(row.file_name || "document").replace(/[^\w.\- ]+/g, "_").slice(0, 180);
    const disposition = download ? "attachment" : "inline";

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `${disposition}; filename="${safeName}"`,
        "Cache-Control": "private, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    console.error("student document download:", error);
    return NextResponse.json({ error: "Failed to read document" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const subErr = await requireSubscription(request);
    if (subErr) return subErr;

    const denied = await assertDashboardPermission(request, "documents", "delete");
    if (denied) return denied;

    const hostelId = getHostelIdFromRequest(request);
    if (hostelId == null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, documentId } = await params;
    const studentId = Number(id);
    const docId = Number(documentId);
    if (!id || Number.isNaN(studentId) || !documentId || Number.isNaN(docId)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    await ensureStudentDocumentsTable();

    const [rows] = await pool.execute(
      `SELECT storage_rel_path FROM student_documents
       WHERE id = ? AND student_id = ? AND hostel_id = ? AND LOWER(category) <> 'agreement'
       LIMIT 1`,
      [docId, studentId, hostelId]
    );
    const row = (rows as Array<{ storage_rel_path: string }>)[0];
    if (!row) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    await pool.execute(
      "DELETE FROM student_documents WHERE id = ? AND student_id = ? AND hostel_id = ?",
      [docId, studentId, hostelId]
    );
    await unlinkStudentDocumentFile(row.storage_rel_path);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("student document delete:", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
