-- Migration: Staff management + expense linkage
-- Run: mysql -u root -p hostelhub < scripts/migrate-staff-management.sql

USE hostelhub;

CREATE TABLE IF NOT EXISTS staff_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hostel_id INT NOT NULL,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(20) NULL,
  designation VARCHAR(100) NULL,
  monthly_salary DECIMAL(10, 2) NOT NULL DEFAULT 0,
  notes TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE
);

CREATE INDEX idx_staff_members_hostel_active ON staff_members(hostel_id, is_active);

ALTER TABLE admin_expenses
  ADD COLUMN staff_member_id INT NULL,
  ADD CONSTRAINT fk_admin_expenses_staff
    FOREIGN KEY (staff_member_id) REFERENCES staff_members(id) ON DELETE SET NULL;

CREATE INDEX idx_admin_expenses_staff_member_id ON admin_expenses(staff_member_id);
