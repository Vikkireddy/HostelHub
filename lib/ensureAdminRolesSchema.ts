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

      // Admins RBAC columns must exist before any query references `admins.is_owner`
      // (e.g. scope_owner_admin_id backfill on `admin_roles`).
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

      if (!(await columnExists("admin_roles", "scope_owner_admin_id"))) {
        try {
          const [fkRows] = await pool.execute<RowDataPacket[]>(
            `SELECT CONSTRAINT_NAME AS c FROM information_schema.KEY_COLUMN_USAGE
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'admin_roles'
               AND REFERENCED_TABLE_NAME = 'hostels' AND CONSTRAINT_NAME IS NOT NULL
             LIMIT 1`
          );
          const fk = (fkRows as RowDataPacket[])[0]?.c as string | undefined;
          if (fk) {
            await pool.execute(`ALTER TABLE admin_roles DROP FOREIGN KEY \`${fk.replace(/`/g, "")}\``);
          }
        } catch {
          /* ignore */
        }
        try {
          await pool.execute(`ALTER TABLE admin_roles MODIFY COLUMN hostel_id INT NULL`);
        } catch (e: unknown) {
          const err = e as { errno?: number };
          if (err.errno !== 1054) throw e;
        }
        try {
          await pool.execute(
            `ALTER TABLE admin_roles ADD COLUMN scope_owner_admin_id INT NULL AFTER hostel_id`
          );
        } catch (e: unknown) {
          const err = e as { errno?: number; code?: string };
          if (err.errno !== 1060 && err.code !== "ER_DUP_FIELDNAME") throw e;
        }
        try {
          await pool.execute(`
            ALTER TABLE admin_roles
            ADD CONSTRAINT fk_admin_roles_hostel
            FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE
          `);
        } catch {
          /* FK may already exist after partial run */
        }
        try {
          await pool.execute(`
            ALTER TABLE admin_roles
            ADD CONSTRAINT fk_admin_roles_scope_owner
            FOREIGN KEY (scope_owner_admin_id) REFERENCES admins(id) ON DELETE SET NULL
          `);
        } catch {
          /* optional FK */
        }
        await pool.execute(`
          UPDATE admin_roles ar
          INNER JOIN (
            SELECT a.hostel_id AS hid, MIN(a.id) AS owner_id
            FROM admins a
            WHERE COALESCE(a.is_owner, 0) = 1 AND a.hostel_id IS NOT NULL
            GROUP BY a.hostel_id
          ) t ON t.hid = ar.hostel_id
          SET ar.scope_owner_admin_id = t.owner_id
          WHERE ar.hostel_id IS NOT NULL
            AND (ar.scope_owner_admin_id IS NULL OR ar.scope_owner_admin_id = 0)
        `);
      } else if (await columnExists("admins", "is_owner")) {
        // Partial run: column was added before a failed UPDATE (legacy bug order).
        await pool.execute(`
          UPDATE admin_roles ar
          INNER JOIN (
            SELECT a.hostel_id AS hid, MIN(a.id) AS owner_id
            FROM admins a
            WHERE COALESCE(a.is_owner, 0) = 1 AND a.hostel_id IS NOT NULL
            GROUP BY a.hostel_id
          ) t ON t.hid = ar.hostel_id
          SET ar.scope_owner_admin_id = t.owner_id
          WHERE ar.hostel_id IS NOT NULL
            AND (ar.scope_owner_admin_id IS NULL OR ar.scope_owner_admin_id = 0)
        `);
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
