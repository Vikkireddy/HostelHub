/**
 * Resident / students table migrations (additive columns).
 * Adds: gender, id_proof_type, id_proof_number, address, emergency_contact_phone on `students`;
 * optional `emergency_contact_phone` on `students` and `students_left` when present.
 * Run: npm run migrate:students   or   node scripts/run-migration.js
 */
const mysql = require("mysql2/promise");
try {
  require("dotenv").config({ path: ".env.local" });
  require("dotenv").config();
} catch (_) {
  // dotenv not installed, use env vars or defaults
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

  const studentColumns = [
    {
      name: "gender",
      sql: "ALTER TABLE students ADD COLUMN gender VARCHAR(20) NULL AFTER name",
    },
    { name: "id_proof_type", sql: "ALTER TABLE students ADD COLUMN id_proof_type VARCHAR(50) NULL" },
    { name: "id_proof_number", sql: "ALTER TABLE students ADD COLUMN id_proof_number VARCHAR(100) NULL" },
    { name: "address", sql: "ALTER TABLE students ADD COLUMN address TEXT NULL" },
  ];

  for (const col of studentColumns) {
    try {
      await pool.execute(col.sql);
      console.log(`Added column students.${col.name}`);
    } catch (err) {
      if (err.code === "ER_DUP_FIELDNAME") {
        console.log(`Column students.${col.name} already exists, skipping`);
      } else {
        throw err;
      }
    }
  }

  try {
    await pool.execute(
      "ALTER TABLE students_left ADD COLUMN gender VARCHAR(20) NULL AFTER name"
    );
    console.log("Added column students_left.gender");
  } catch (err) {
    if (err.code === "ER_DUP_FIELDNAME") {
      console.log("Column students_left.gender already exists, skipping");
    } else if (err.code === "ER_NO_SUCH_TABLE") {
      console.log("Table students_left not found, skipping gender column there");
    } else {
      throw err;
    }
  }

  try {
    await pool.execute(
      "ALTER TABLE students ADD COLUMN emergency_contact_phone VARCHAR(20) NULL AFTER phone"
    );
    console.log("Added column students.emergency_contact_phone");
  } catch (err) {
    if (err.code === "ER_DUP_FIELDNAME") {
      console.log("Column students.emergency_contact_phone already exists, skipping");
    } else {
      throw err;
    }
  }

  try {
    await pool.execute(
      "ALTER TABLE students_left ADD COLUMN emergency_contact_phone VARCHAR(20) NULL AFTER phone"
    );
    console.log("Added column students_left.emergency_contact_phone");
  } catch (err) {
    if (err.code === "ER_DUP_FIELDNAME") {
      console.log("Column students_left.emergency_contact_phone already exists, skipping");
    } else if (err.code === "ER_NO_SUCH_TABLE") {
      console.log("Table students_left not found, skipping emergency column there");
    } else {
      throw err;
    }
  }

  await pool.end();
  console.log("Migration complete.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
