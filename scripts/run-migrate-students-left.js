/**
 * Run migration to create students_left table.
 * Run: node scripts/run-migrate-students-left.js
 */
const mysql = require("mysql2/promise");
try {
  require("dotenv").config({ path: ".env.local" });
  require("dotenv").config();
} catch (_) {}

async function migrate() {
  const dbPort = Number.parseInt(process.env.DB_PORT || "3306", 10);
  const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number.isFinite(dbPort) ? dbPort : 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || "0valedge!",
    database: process.env.DB_NAME || "hostelhub",
  });

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS students_left (
      id INT AUTO_INCREMENT PRIMARY KEY,
      original_student_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(20) NOT NULL,
      room_number VARCHAR(20),
      course VARCHAR(255),
      join_date DATE,
      left_date DATE NOT NULL,
      id_proof_type VARCHAR(50),
      id_proof_number VARCHAR(100),
      address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("Created students_left table.");

  await pool.end();
  console.log("Migration complete.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
