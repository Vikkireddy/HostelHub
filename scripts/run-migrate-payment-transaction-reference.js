/**
 * Adds payment_mode + payment_reference on payment_transactions, and bill_payment_mode +
 * bill_payment_reference on payments (so the dashboard table shows bill/UTR with each bill row).
 * Run: node scripts/run-migrate-payment-transaction-reference.js
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
  // Match lib/db.ts so CLI migrations work when DB_PASSWORD is unset (same as the app).
  const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number.isFinite(dbPort) ? dbPort : 3306,
    user: process.env.DB_USER || "root",
    password:
      process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || "0valedge!",
    database: process.env.DB_NAME || "hostelhub",
  });

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
    console.log("Ensured payment_transactions table exists");
  } catch (err) {
    if (err.code !== "ER_TABLE_EXISTS_ERROR") console.warn("payment_transactions:", err.message);
  }

  try {
    await pool.execute(
      `ALTER TABLE payment_transactions ADD COLUMN payment_mode VARCHAR(16) NULL`
    );
    console.log("Added column: payment_mode");
  } catch (err) {
    if (err.code === "ER_DUP_FIELDNAME") {
      console.log("Column payment_mode already exists");
    } else throw err;
  }

  try {
    await pool.execute(
      `ALTER TABLE payment_transactions ADD COLUMN payment_reference VARCHAR(128) NULL`
    );
    console.log("Added column: payment_reference");
  } catch (err) {
    if (err.code === "ER_DUP_FIELDNAME") {
      console.log("Column payment_reference already exists");
    } else throw err;
  }

  try {
    await pool.execute(
      `ALTER TABLE payments ADD COLUMN bill_payment_mode VARCHAR(16) NULL`
    );
    console.log("Added column: payments.bill_payment_mode");
  } catch (err) {
    if (err.code === "ER_DUP_FIELDNAME") {
      console.log("Column bill_payment_mode already exists on payments");
    } else throw err;
  }

  try {
    await pool.execute(
      `ALTER TABLE payments ADD COLUMN bill_payment_reference VARCHAR(128) NULL`
    );
    console.log("Added column: payments.bill_payment_reference");
  } catch (err) {
    if (err.code === "ER_DUP_FIELDNAME") {
      console.log("Column bill_payment_reference already exists on payments");
    } else throw err;
  }

  await pool.end();
  console.log("Migration complete.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
