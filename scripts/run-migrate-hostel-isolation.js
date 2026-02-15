/**
 * Migration: Add hostel_id to students, rooms, payments for multi-tenant isolation.
 * Run: node scripts/run-migrate-hostel-isolation.js
 */
const mysql = require("mysql2/promise");
try {
  require("dotenv").config({ path: ".env.local" });
  require("dotenv").config();
} catch (_) {}

async function migrate() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || "0valedge!",
    database: process.env.DB_NAME || "hostelhub",
  });

  try {
    // Ensure hostels table and default hostel exist
    const [hostels] = await pool.execute("SELECT id FROM hostels LIMIT 1");
    if (hostels.length === 0) {
      await pool.execute("INSERT INTO hostels (name) VALUES ('Default Hostel')");
      console.log("Created default hostel");
    }
    const [h] = await pool.execute("SELECT id FROM hostels ORDER BY id LIMIT 1");
    const defaultHostelId = h[0]?.id ?? 1;

    // Add hostel_id to students
    try {
      await pool.execute("ALTER TABLE students ADD COLUMN hostel_id INT NULL");
      console.log("Added hostel_id to students");
    } catch (e) {
      if (e.code === "ER_DUP_FIELDNAME") console.log("students.hostel_id already exists");
      else throw e;
    }
    await pool.execute("UPDATE students SET hostel_id = ? WHERE hostel_id IS NULL", [
      defaultHostelId,
    ]);

    // Add hostel_id to rooms
    try {
      await pool.execute("ALTER TABLE rooms ADD COLUMN hostel_id INT NULL");
      console.log("Added hostel_id to rooms");
    } catch (e) {
      if (e.code === "ER_DUP_FIELDNAME") console.log("rooms.hostel_id already exists");
      else throw e;
    }
    await pool.execute("UPDATE rooms SET hostel_id = ? WHERE hostel_id IS NULL", [
      defaultHostelId,
    ]);

    // Drop rooms unique on number, add unique on (hostel_id, number)
    try {
      await pool.execute("ALTER TABLE rooms DROP INDEX number");
      console.log("Dropped rooms.number unique");
    } catch (e) {
      if (e.code === "ER_CANT_DROP_FIELD" || e.code === "ER_DROP_INDEX") {
        // Try alternative - MySQL might name it differently
        const [idx] = await pool.execute(
          "SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'rooms' AND CONSTRAINT_TYPE = 'UNIQUE'"
        );
        if (idx.length > 0) {
          await pool.execute(`ALTER TABLE rooms DROP INDEX ${idx[0].CONSTRAINT_NAME}`);
        }
      }
    }
    try {
      await pool.execute(
        "ALTER TABLE rooms ADD UNIQUE KEY rooms_hostel_number_unique (hostel_id, number)"
      );
      console.log("Added rooms (hostel_id, number) unique");
    } catch (e) {
      if (e.code === "ER_DUP_KEYNAME" || e.code === "ER_MULTIPLE_PRI_KEY")
        console.log("rooms unique already exists");
      else throw e;
    }

    // Add hostel_id to payments (payments link via student_id -> students.hostel_id, but we can add for direct filtering)
    try {
      await pool.execute("ALTER TABLE payments ADD COLUMN hostel_id INT NULL");
      console.log("Added hostel_id to payments");
    } catch (e) {
      if (e.code === "ER_DUP_FIELDNAME") console.log("payments.hostel_id already exists");
      else throw e;
    }
    // Backfill payments hostel_id from students
    await pool.execute(
      `UPDATE payments p 
       JOIN students s ON p.student_id = s.id 
       SET p.hostel_id = s.hostel_id 
       WHERE p.hostel_id IS NULL`
    );

    // Add FK constraints if not exist
    try {
      await pool.execute(
        "ALTER TABLE students ADD CONSTRAINT fk_students_hostel FOREIGN KEY (hostel_id) REFERENCES hostels(id)"
      );
      console.log("Added fk_students_hostel");
    } catch (e) {
      if (e.code === "ER_DUP_KEYNAME" || e.code === "ER_FK_DUP_NAME") console.log("fk_students_hostel exists");
      else throw e;
    }
    try {
      await pool.execute(
        "ALTER TABLE rooms ADD CONSTRAINT fk_rooms_hostel FOREIGN KEY (hostel_id) REFERENCES hostels(id)"
      );
      console.log("Added fk_rooms_hostel");
    } catch (e) {
      if (e.code === "ER_DUP_KEYNAME" || e.code === "ER_FK_DUP_NAME") console.log("fk_rooms_hostel exists");
      else throw e;
    }
    try {
      await pool.execute(
        "ALTER TABLE payments ADD CONSTRAINT fk_payments_hostel FOREIGN KEY (hostel_id) REFERENCES hostels(id)"
      );
      console.log("Added fk_payments_hostel");
    } catch (e) {
      if (e.code === "ER_DUP_KEYNAME" || e.code === "ER_FK_DUP_NAME") console.log("fk_payments_hostel exists");
      else throw e;
    }

    // Add hostel_id to students_left if table exists
    try {
      await pool.execute("ALTER TABLE students_left ADD COLUMN hostel_id INT NULL");
      console.log("Added hostel_id to students_left");
    } catch (e) {
      if (e.code === "ER_DUP_FIELDNAME") console.log("students_left.hostel_id already exists");
      else if (e.code === "ER_NO_SUCH_TABLE") console.log("students_left table not yet created");
      else throw e;
    }
  } finally {
    await pool.end();
  }
  console.log("Hostel isolation migration complete.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
