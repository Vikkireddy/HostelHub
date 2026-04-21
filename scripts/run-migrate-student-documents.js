/**
 * Creates `student_documents` for resident file uploads (profile photo, ID scan, other).
 * Run: node scripts/run-migrate-student-documents.js
 */
const path = require("path");
const mysql = require("mysql2/promise");

const projectRoot = path.resolve(__dirname, "..");
try {
  require("dotenv").config({ path: path.join(projectRoot, ".env.local") });
  require("dotenv").config({ path: path.join(projectRoot, ".env") });
} catch (_) {}

async function migrate() {
  const dbPort = Number.parseInt(process.env.DB_PORT || "3306", 10);
  const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number.isFinite(dbPort) ? dbPort : 3306,
    user: process.env.DB_USER || "root",
    password:
      process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || "0valedge!",
    database: process.env.DB_NAME || "hostelhub",
  });

  try {
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
    console.log("Ensured student_documents table exists");
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();
