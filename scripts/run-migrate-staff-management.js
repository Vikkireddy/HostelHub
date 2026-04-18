/**
 * Migration: staff_members + admin_expenses.staff_member_id (scripts/migrate-staff-management.sql).
 * Run: DB_HOST=... DB_PORT=... DB_USER=... DB_PASSWORD=... DB_NAME=... npm run migrate:staff-management
 */
const mysql = require("mysql2/promise");
try {
  require("dotenv").config({ path: ".env.local" });
  require("dotenv").config();
} catch (_) {}

function poolConfig() {
  const dbPort = Number.parseInt(process.env.DB_PORT || "3306", 10);
  const host = process.env.DB_HOST || "localhost";
  const useSsl =
    process.env.DB_SSL === "1" ||
    process.env.DB_SSL === "true" ||
    /\.rlwy\.net$/i.test(host);
  return {
    host,
    port: Number.isFinite(dbPort) ? dbPort : 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || "",
    database: process.env.DB_NAME || "hostelhub",
    ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  };
}

async function execIgnore(pool, sql, label, ignoreCodes, ignoreErrnos = []) {
  try {
    await pool.execute(sql);
    console.log(label);
  } catch (err) {
    if (ignoreCodes.includes(err.code) || ignoreErrnos.includes(err.errno)) {
      console.log(`${label} (skipped: ${err.code || err.errno})`);
    } else {
      throw err;
    }
  }
}

async function migrate() {
  const pool = mysql.createPool(poolConfig());

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS staff_members (
      id INT AUTO_INCREMENT PRIMARY KEY,
      hostel_id INT NOT NULL,
      name VARCHAR(120) NOT NULL,
      phone VARCHAR(20) NULL,
      designation VARCHAR(100) NULL,
      monthly_salary DECIMAL(10, 2) NOT NULL DEFAULT 0,
      notes TEXT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE
    )
  `);
  console.log("staff_members table ready");

  await execIgnore(
    pool,
    "CREATE INDEX idx_staff_members_hostel_active ON staff_members(hostel_id, is_active)",
    "Index idx_staff_members_hostel_active",
    ["ER_DUP_KEYNAME"]
  );

  await execIgnore(
    pool,
    "ALTER TABLE admin_expenses ADD COLUMN staff_member_id INT NULL",
    "Column admin_expenses.staff_member_id",
    ["ER_DUP_FIELDNAME"]
  );

  await execIgnore(
    pool,
    `ALTER TABLE admin_expenses
      ADD CONSTRAINT fk_admin_expenses_staff
      FOREIGN KEY (staff_member_id) REFERENCES staff_members(id) ON DELETE SET NULL`,
    "FK fk_admin_expenses_staff",
    ["ER_DUP_KEYNAME", "ER_FK_DUP_NAME"],
    [1826]
  );

  await execIgnore(
    pool,
    "CREATE INDEX idx_admin_expenses_staff_member_id ON admin_expenses(staff_member_id)",
    "Index idx_admin_expenses_staff_member_id",
    ["ER_DUP_KEYNAME"]
  );

  await pool.end();
  console.log("Staff management migration complete.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
