/** Max upload size for resident documents (profile photo, ID scan, etc.). */
export const STUDENT_DOC_MAX_BYTES = 5 * 1024 * 1024;

export const STUDENT_DOC_ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

/** Stored in DB; never use `agreement` (product choice). */
export const STUDENT_DOC_CATEGORIES = ["profile_photo", "id_proof", "other"] as const;
export type StudentDocumentCategory = (typeof STUDENT_DOC_CATEGORIES)[number];

export function isStudentDocumentCategory(v: string): v is StudentDocumentCategory {
  return (STUDENT_DOC_CATEGORIES as readonly string[]).includes(v);
}
