import type { RowDataPacket } from "mysql2/promise";
import pool from "@/lib/db";

let ensurePromise: Promise<void> | null = null;

async function columnExists(table: string, column: string): Promise<boolean> {
  const dbName = process.env.DB_NAME || "hostelhub";
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [dbName, table, column]
  );
  return Number((rows as RowDataPacket[])[0]?.cnt ?? 0) > 0;
}

async function tableExists(table: string): Promise<boolean> {
  const dbName = process.env.DB_NAME || "hostelhub";
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
    [dbName, table]
  );
  return Number((rows as RowDataPacket[])[0]?.cnt ?? 0) > 0;
}

/** Idempotent schema for multi-hostel portfolio (admin ↔ hostel links, extended hostel fields). */
export async function ensureMultiHostelSchema(): Promise<void> {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      if (!(await columnExists("admins", "management_mode"))) {
        try {
          await pool.execute(
            `ALTER TABLE admins ADD COLUMN management_mode VARCHAR(20) NOT NULL DEFAULT 'single'`
          );
        } catch (e: unknown) {
          const err = e as { errno?: number; code?: string };
          if (err.errno !== 1060 && err.code !== "ER_DUP_FIELDNAME") throw e;
        }
      }

      const hostelCols: { name: string; ddl: string }[] = [
        { name: "building_name", ddl: "ADD COLUMN building_name VARCHAR(255) NULL" },
        { name: "hostel_type", ddl: "ADD COLUMN hostel_type VARCHAR(64) NULL" },
        { name: "area_locality", ddl: "ADD COLUMN area_locality VARCHAR(255) NULL" },
        { name: "contact_phone", ddl: "ADD COLUMN contact_phone VARCHAR(32) NULL" },
        { name: "total_floors", ddl: "ADD COLUMN total_floors INT NULL" },
        { name: "total_rooms", ddl: "ADD COLUMN total_rooms INT NULL" },
        { name: "room_numbers", ddl: "ADD COLUMN room_numbers TEXT NULL" },
        { name: "amenities", ddl: "ADD COLUMN amenities VARCHAR(512) NULL" },
        { name: "description_extended", ddl: "ADD COLUMN description_extended TEXT NULL" },
        { name: "is_active_hostel", ddl: "ADD COLUMN is_active_hostel TINYINT(1) NOT NULL DEFAULT 1" },
      ];

      for (const col of hostelCols) {
        if (!(await columnExists("hostels", col.name))) {
          try {
            await pool.execute(`ALTER TABLE hostels ${col.ddl}`);
          } catch (e: unknown) {
            const err = e as { errno?: number; code?: string };
            if (err.errno !== 1060 && err.code !== "ER_DUP_FIELDNAME") throw e;
          }
        }
      }

      if (!(await tableExists("admin_hostels"))) {
        await pool.execute(`
          CREATE TABLE admin_hostels (
            admin_id INT NOT NULL,
            hostel_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (admin_id, hostel_id),
            INDEX idx_admin_hostels_hostel (hostel_id),
            CONSTRAINT fk_admin_hostels_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
            CONSTRAINT fk_admin_hostels_hostel FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE
          )
        `);
      }

      await pool.execute(`
        INSERT IGNORE INTO admin_hostels (admin_id, hostel_id)
        SELECT id, hostel_id FROM admins WHERE hostel_id IS NOT NULL
      `);
    })();
  }
  await ensurePromise;
}
