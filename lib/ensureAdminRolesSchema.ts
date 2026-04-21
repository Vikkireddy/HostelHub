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

/** Creates `admin_roles` and extends `admins` for multi-user RBAC (idempotent). */
export async function ensureAdminRolesSchema(): Promise<void> {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS admin_roles (
          id INT AUTO_INCREMENT PRIMARY KEY,
          hostel_id INT NOT NULL,
          name VARCHAR(100) NOT NULL,
          description TEXT NULL,
          permissions JSON NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY uq_admin_roles_hostel_name (hostel_id, name),
          CONSTRAINT fk_admin_roles_hostel FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE
        )
      `);

      if (!(await columnExists("admins", "is_owner"))) {
        try {
          await pool.execute(
            `ALTER TABLE admins ADD COLUMN is_owner TINYINT(1) NOT NULL DEFAULT 0 AFTER hostel_id`
          );
        } catch (e: unknown) {
          const err = e as { errno?: number; code?: string };
          if (err.errno !== 1060 && err.code !== "ER_DUP_FIELDNAME") throw e;
        }
      }

      if (!(await columnExists("admins", "is_active"))) {
        try {
          await pool.execute(
            `ALTER TABLE admins ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER is_owner`
          );
        } catch (e: unknown) {
          const err = e as { errno?: number; code?: string };
          if (err.errno !== 1060 && err.code !== "ER_DUP_FIELDNAME") throw e;
        }
      }

      if (!(await columnExists("admins", "role_id"))) {
        try {
          await pool.execute(`ALTER TABLE admins ADD COLUMN role_id INT NULL AFTER is_active`);
        } catch (e: unknown) {
          const err = e as { errno?: number; code?: string };
          if (err.errno !== 1060 && err.code !== "ER_DUP_FIELDNAME") throw e;
        }
      }

      if (!(await columnExists("admins", "permissions_override"))) {
        try {
          await pool.execute(`ALTER TABLE admins ADD COLUMN permissions_override JSON NULL AFTER role_id`);
        } catch (e: unknown) {
          const err = e as { errno?: number; code?: string };
          if (err.errno !== 1060 && err.code !== "ER_DUP_FIELDNAME") throw e;
        }
      }

      await pool.execute(`
        UPDATE admins a
        INNER JOIN (
          SELECT hostel_id, MIN(id) AS min_id
          FROM admins
          WHERE hostel_id IS NOT NULL
          GROUP BY hostel_id
        ) t ON a.hostel_id = t.hostel_id AND a.id = t.min_id
        SET a.is_owner = 1
        WHERE COALESCE(a.is_owner, 0) = 0
      `);

      // Seeded default admin (init-db / seed.sql) often has no hostel_id, so they never matched
      // the MIN(id) backfill above. Link them to the first hostel and mark owner so login returns
      // canManageUsersAndRoles (requires is_owner && hostel_id).
      const [hostelRows] = await pool.execute<RowDataPacket[]>(
        `SELECT id FROM hostels ORDER BY id ASC LIMIT 1`
      );
      const firstHostelId = (hostelRows as RowDataPacket[])[0]?.id;
      if (firstHostelId != null) {
        await pool.execute(
          `UPDATE admins
           SET hostel_id = COALESCE(hostel_id, ?),
               is_owner = 1,
               is_active = COALESCE(is_active, 1)
           WHERE LOWER(TRIM(email)) = 'admin@hostel.com'`,
          [firstHostelId]
        );
      }
    })();
  }
  try {
    await ensurePromise;
  } catch (e) {
    ensurePromise = null;
    throw e;
  }
}
