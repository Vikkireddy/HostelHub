import pool from "@/lib/db";

let ensured: Promise<void> | null = null;

/** Ensures `student_documents` exists for file metadata + disk paths. */
export async function ensureStudentDocumentsTable(): Promise<void> {
  if (!ensured) {
    ensured = (async () => {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS student_documents (
          id INT AUTO_INCREMENT PRIMARY KEY,
          student_id INT NOT NULL,
          hostel_id INT NOT NULL,
          category VARCHAR(32) NOT NULL,
          label VARCHAR(255) NOT NULL,
          file_name VARCHAR(255) NOT NULL,
          mime_type VARCHAR(128) NOT NULL,
          size_bytes INT NOT NULL,
          storage_rel_path VARCHAR(512) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_student (student_id),
          INDEX idx_hostel_student (hostel_id, student_id),
          CONSTRAINT fk_student_documents_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
        )
      `);
    })();
  }
  try {
    await ensured;
  } catch (e) {
    ensured = null;
    throw e;
  }
}
