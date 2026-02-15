/**
 * Run migration to add id_proof_type, id_proof_number, address to students table.
 * Run: node scripts/run-migration.js
 */
const mysql = require("mysql2/promise");
try {
  require("dotenv").config({ path: ".env.local" });
  require("dotenv").config();
} catch (_) {
  // dotenv not installed, use env vars or defaults
}

async function migrate() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || "0valedge!",
    database: process.env.DB_NAME || "hostelhub",
  });

  const columns = [
    { name: "id_proof_type", sql: "ALTER TABLE students ADD COLUMN id_proof_type VARCHAR(50) NULL" },
    { name: "id_proof_number", sql: "ALTER TABLE students ADD COLUMN id_proof_number VARCHAR(100) NULL" },
    { name: "address", sql: "ALTER TABLE students ADD COLUMN address TEXT NULL" },
  ];

  for (const col of columns) {
    try {
      await pool.execute(col.sql);
      console.log(`Added column: ${col.name}`);
    } catch (err) {
      if (err.code === "ER_DUP_FIELDNAME") {
        console.log(`Column ${col.name} already exists, skipping`);
      } else {
        throw err;
      }
    }
  }

  await pool.end();
  console.log("Migration complete.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
