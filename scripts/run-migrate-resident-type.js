/**
 * Adds resident_type + resident_type_details on students and students_left.
 * Run: node scripts/run-migrate-resident-type.js
 */
const path = require("path");
const mysql = require("mysql2/promise");

const projectRoot = path.resolve(__dirname, "..");
try {
  require("dotenv").config({ path: path.join(projectRoot, ".env.local") });
  require("dotenv").config({ path: path.join(projectRoot, ".env") });
} catch (_) {}

async function addColumn(pool, table, column, sql) {
  const db = process.env.DB_NAME || "hostelhub";
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [db, table, column]
  );
  const cnt = Number(rows[0]?.cnt ?? 0);
  if (cnt > 0) {
    console.log(`${table}.${column} already exists`);
    return;
  }
  try {
    await pool.execute(sql);
    console.log(`Added ${table}.${column}`);
  } catch (e) {
    if (e.code === "ER_NO_SUCH_TABLE") console.log(`Skip ${table}: table missing`);
    else if (e.code === "ER_DUP_FIELDNAME") console.log(`${table}.${column} exists`);
    else throw e;
  }
}

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
    await addColumn(
      pool,
      "students",
      "resident_type",
      `ALTER TABLE students ADD COLUMN resident_type VARCHAR(32) NOT NULL DEFAULT 'student' AFTER address`
    );
    await addColumn(
      pool,
      "students",
      "resident_type_details",
      `ALTER TABLE students ADD COLUMN resident_type_details JSON NULL AFTER resident_type`
    );
    await addColumn(
      pool,
      "students_left",
      "resident_type",
      `ALTER TABLE students_left ADD COLUMN resident_type VARCHAR(32) NOT NULL DEFAULT 'student' AFTER address`
    );
    await addColumn(
      pool,
      "students_left",
      "resident_type_details",
      `ALTER TABLE students_left ADD COLUMN resident_type_details JSON NULL AFTER resident_type`
    );
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();
