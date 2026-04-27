import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";

/** Root directory for resident uploads (gitignored). */
export const STUDENT_UPLOADS_ROOT = path.join(process.cwd(), "uploads", "student-documents");

export function absolutePathFromRel(rel: string): string {
  return path.join(STUDENT_UPLOADS_ROOT, rel);
}

export function sanitizeOriginalFileName(name: string): string {
  const base = path.basename(name).replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120);
  return base || "file";
}

export async function ensureDirForRel(relDir: string): Promise<void> {
  const dir = path.join(STUDENT_UPLOADS_ROOT, relDir);
  await fs.mkdir(dir, { recursive: true });
}

/** Returns relative path under STUDENT_UPLOADS_ROOT, e.g. `1/42/uuid-name.pdf`. */
export async function writeStudentDocumentFile(
  hostelId: number,
  studentId: number,
  originalName: string,
  bytes: Buffer
): Promise<string> {
  const safe = sanitizeOriginalFileName(originalName);
  const unique = `${randomUUID()}-${safe}`;
  const relDir = path.join(String(hostelId), String(studentId));
  await ensureDirForRel(relDir);
  const relPath = path.join(relDir, unique).split(path.sep).join("/");
  const abs = absolutePathFromRel(relPath);
  await fs.writeFile(abs, bytes);
  return relPath;
}

export async function unlinkStudentDocumentFile(relPath: string): Promise<void> {
  try {
    await fs.unlink(absolutePathFromRel(relPath));
  } catch {
    // ignore missing file
  }
}
