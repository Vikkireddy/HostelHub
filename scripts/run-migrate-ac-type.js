/**
 * Migration: Add ac_type (AC/Non-AC) column to rooms table.
 * Run: node scripts/run-migrate-ac-type.js
 */
try {
  require("dotenv").config({ path: ".env.local" });
  require("dotenv").config();
} catch (_) {}

const mysql = require("mysql2/promise");

async function migrate() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || "",
    database: process.env.DB_NAME || "hostelhub",
  });

  try {
    await pool.execute(
      "ALTER TABLE rooms ADD COLUMN ac_type ENUM('AC', 'Non-AC') NOT NULL DEFAULT 'Non-AC'"
    );
    console.log("Added ac_type column to rooms");
  } catch (e) {
    if (e.code === "ER_DUP_FIELDNAME") {
      console.log("ac_type column already exists");
    } else {
      throw e;
    }
  } finally {
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
