-- Users & Roles: custom roles and admin extensions (optional manual migration).
-- The app also runs `ensureAdminRolesSchema()` on login and relevant API calls.

USE hostelhub;

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
);

-- Add columns if missing (skip errors if already applied)
ALTER TABLE admins ADD COLUMN is_owner TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE admins ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1;
ALTER TABLE admins ADD COLUMN role_id INT NULL;
ALTER TABLE admins ADD COLUMN permissions_override JSON NULL;

UPDATE admins a
INNER JOIN (
  SELECT hostel_id, MIN(id) AS min_id
  FROM admins
  WHERE hostel_id IS NOT NULL
  GROUP BY hostel_id
) t ON a.hostel_id = t.hostel_id AND a.id = t.min_id
SET a.is_owner = 1
WHERE COALESCE(a.is_owner, 0) = 0;
