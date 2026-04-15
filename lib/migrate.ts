import mysql from "mysql2/promise";
import { readFileSync } from "fs";
import { join } from "path";

/** init-db uses CREATE TABLE IF NOT EXISTS — existing DBs never pick up new columns; add them here. */
const ensureStudentsPlannedVacateDateColumn = async (connection: mysql.Connection) => {
  const dbName = process.env.DB_NAME || "hostelhub";
  const safeDb = dbName.replace(/`/g, "``");
  const [rows] = await connection.query<mysql.RowDataPacket[]>(
    `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'students' AND COLUMN_NAME = 'planned_vacate_date'`,
    [dbName]
  );
  if (Number(rows[0]?.cnt ?? 0) > 0) return;
  await connection.query(
    `ALTER TABLE \`${safeDb}\`.\`students\` ADD COLUMN planned_vacate_date DATE NULL AFTER join_date`
  );
  console.log("[Migration] Added students.planned_vacate_date");
};

export async function runMigrations() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const dbPort = Number.parseInt(process.env.DB_PORT || "3306", 10);

  let connection: mysql.Connection | null = null;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: Number.isFinite(dbPort) ? dbPort : 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || "0valedge!",
      multipleStatements: true,
      connectTimeout: 10000,
    });

    const initPath = join(process.cwd(), "scripts", "init-db.sql");
    const initSql = readFileSync(initPath, "utf-8");
    await connection.query(initSql);
    console.log("[Migration] Database schema initialized");

    await ensureStudentsPlannedVacateDateColumn(connection);

    const seedPath = join(process.cwd(), "scripts", "seed.sql");
    const seedSql = readFileSync(seedPath, "utf-8");
    await connection.query(seedSql);
    console.log("[Migration] Seed data applied");
  } catch (error) {
    console.error("[Migration] Failed to run migrations:", error);
    console.error("[Migration] Ensure DB_HOST, DB_USER, DB_PASSWORD in .env.local match your MySQL setup.");
  } finally {
    await connection?.end();
  }
}
