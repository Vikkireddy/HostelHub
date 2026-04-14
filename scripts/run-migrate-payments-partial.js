/**
 * Migration: Add amount_due, amount_paid for partial payment support.
 * Run: node scripts/run-migrate-payments-partial.js
 *
 * Loads DB credentials from .env.local or .env (same as Next.js app).
 * Or pass inline: DB_PASSWORD=yourpass node scripts/run-migrate-payments-partial.js
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
  const password =
    process.env.DB_PASSWORD ?? process.env.MYSQL_PASSWORD ?? "0valedge!";
  const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number.isFinite(dbPort) ? dbPort : 3306,
    user: process.env.DB_USER || "root",
    password,
    database: process.env.DB_NAME || "hostelhub",
  });

  try {
    await pool.execute("ALTER TABLE payments ADD COLUMN amount_due DECIMAL(10, 2) NULL");
    console.log("Added column: amount_due");
  } catch (err) {
    if (err.code === "ER_DUP_FIELDNAME") {
      console.log("Column amount_due already exists");
    } else throw err;
  }

  try {
    await pool.execute("ALTER TABLE payments ADD COLUMN amount_paid DECIMAL(10, 2) NULL");
    console.log("Added column: amount_paid");
  } catch (err) {
    if (err.code === "ER_DUP_FIELDNAME") {
      console.log("Column amount_paid already exists");
    } else throw err;
  }

  await pool.execute(
    "UPDATE payments SET amount_due = amount, amount_paid = CASE WHEN status = 'paid' THEN amount ELSE 0 END WHERE amount_due IS NULL OR amount_paid IS NULL"
  );
  console.log("Migrated existing payment data");

  await pool.execute("ALTER TABLE payments MODIFY amount_due DECIMAL(10, 2) NOT NULL DEFAULT 0");
  await pool.execute("ALTER TABLE payments MODIFY amount_paid DECIMAL(10, 2) NOT NULL DEFAULT 0");
  console.log("Set NOT NULL on amount_due, amount_paid");

  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS payment_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id)
      )
    `);
    console.log("Created payment_transactions table (or already exists)");
  } catch (err) {
    if (err.code !== "ER_TABLE_EXISTS_ERROR") console.warn("payment_transactions:", err.message);
  }

  await pool.end();
  console.log("Migration complete.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err.message);
  if (err.message?.includes("Access denied")) {
    console.error("\nTip: Set DB credentials in .env.local or run with:");
    console.error("  DB_PASSWORD=yourpassword node scripts/run-migrate-payments-partial.js");
  }
  process.exit(1);
});
