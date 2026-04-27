/**
 * Multi-hostel portfolio: admin_hostels, admins.management_mode, extended hostels columns.
 * Run: node scripts/run-migrate-multi-hostel.js
 */
const path = require("path");
const mysql = require("mysql2/promise");

const projectRoot = path.resolve(__dirname, "..");
try {
  require("dotenv").config({ path: path.join(projectRoot, ".env.local") });
  require("dotenv").config({ path: path.join(projectRoot, ".env") });
} catch (_) {}

async function safeAlter(pool, sql) {
  try {
    await pool.execute(sql);
  } catch (e) {
    const err = e;
    if (err.errno === 1060 || err.code === "ER_DUP_FIELDNAME") return;
    if (err.errno === 1050 || err.code === "ER_TABLE_EXISTS_ERROR") return;
    throw e;
  }
}

async function migrate() {
  const dbPort = Number.parseInt(process.env.DB_PORT || "3306", 10);
  const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number.isFinite(dbPort) ? dbPort : 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || "0valedge!",
    database: process.env.DB_NAME || "hostelhub",
  });

  try {
    await safeAlter(
      pool,
      `ALTER TABLE admins ADD COLUMN management_mode VARCHAR(20) NOT NULL DEFAULT 'single'`
    );

    await safeAlter(pool, `ALTER TABLE hostels ADD COLUMN building_name VARCHAR(255) NULL`);
    await safeAlter(pool, `ALTER TABLE hostels ADD COLUMN hostel_type VARCHAR(64) NULL`);
    await safeAlter(pool, `ALTER TABLE hostels ADD COLUMN area_locality VARCHAR(255) NULL`);
    await safeAlter(pool, `ALTER TABLE hostels ADD COLUMN contact_phone VARCHAR(32) NULL`);
    await safeAlter(pool, `ALTER TABLE hostels ADD COLUMN total_floors INT NULL`);
    await safeAlter(pool, `ALTER TABLE hostels ADD COLUMN total_rooms INT NULL`);
    await safeAlter(pool, `ALTER TABLE hostels ADD COLUMN room_numbers TEXT NULL`);
    await safeAlter(pool, `ALTER TABLE hostels ADD COLUMN amenities VARCHAR(512) NULL`);
    await safeAlter(pool, `ALTER TABLE hostels ADD COLUMN description_extended TEXT NULL`);
    await safeAlter(
      pool,
      `ALTER TABLE hostels ADD COLUMN is_active_hostel TINYINT(1) NOT NULL DEFAULT 1`
    );

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS admin_hostels (
        admin_id INT NOT NULL,
        hostel_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (admin_id, hostel_id),
        INDEX idx_admin_hostels_hostel (hostel_id),
        CONSTRAINT fk_admin_hostels_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
        CONSTRAINT fk_admin_hostels_hostel FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE
      )
    `);

    await pool.execute(`
      INSERT IGNORE INTO admin_hostels (admin_id, hostel_id)
      SELECT id, hostel_id FROM admins WHERE hostel_id IS NOT NULL
    `);

    console.log("Multi-hostel migration finished.");
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();
