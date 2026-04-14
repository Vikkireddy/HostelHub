/**
 * Run migration for sign-up: hostels table and admins updates.
 * Run: node scripts/run-migrate-signup.js
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

  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS hostels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("Created hostels table (or already exists)");

    try {
      await pool.execute("ALTER TABLE admins ADD COLUMN hostel_id INT NULL");
      console.log("Added hostel_id to admins");
    } catch (e) {
      if (e.code === "ER_DUP_FIELDNAME") console.log("hostel_id already exists");
      else throw e;
    }

    try {
      await pool.execute("ALTER TABLE admins ADD COLUMN mobile VARCHAR(20) NULL UNIQUE");
      console.log("Added mobile to admins");
    } catch (e) {
      if (e.code === "ER_DUP_FIELDNAME") console.log("mobile already exists");
      else throw e;
    }

    try {
      await pool.execute("ALTER TABLE admins ADD CONSTRAINT fk_admins_hostel FOREIGN KEY (hostel_id) REFERENCES hostels(id)");
      console.log("Added foreign key fk_admins_hostel");
    } catch (e) {
      if (e.code === "ER_DUP_KEYNAME" || e.code === "ER_FK_DUP_NAME") console.log("FK already exists");
      else throw e;
    }

    const [hostels] = await pool.execute("SELECT id FROM hostels LIMIT 1");
    if (hostels.length === 0) {
      await pool.execute("INSERT INTO hostels (name) VALUES ('Default Hostel')");
      console.log("Created default hostel");
    }

    const [rows] = await pool.execute("SELECT id, hostel_id FROM admins WHERE hostel_id IS NULL");
    if (rows.length > 0) {
      const [h] = await pool.execute("SELECT id FROM hostels ORDER BY id LIMIT 1");
      if (h.length > 0) {
        await pool.execute("UPDATE admins SET hostel_id = ? WHERE hostel_id IS NULL", [h[0].id]);
        console.log("Linked existing admins to default hostel");
      }
    }
  } finally {
    await pool.end();
  }
  console.log("Sign-up migration complete.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
