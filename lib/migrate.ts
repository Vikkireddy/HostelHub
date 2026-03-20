import mysql from "mysql2/promise";
import { readFileSync } from "fs";
import { join } from "path";

export async function runMigrations() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  let connection: mysql.Connection | null = null;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || "0valedge!",
      multipleStatements: true,
    });

    const initPath = join(process.cwd(), "scripts", "init-db.sql");
    const initSql = readFileSync(initPath, "utf-8");
    await connection.query(initSql);
    console.log("[Migration] Database schema initialized");

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
