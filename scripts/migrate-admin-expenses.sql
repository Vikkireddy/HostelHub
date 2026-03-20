-- Migration: Admin Expenses for Hostel ERP
-- Run: mysql -u root -p hostelhub < scripts/migrate-admin-expenses.sql

USE hostelhub;

CREATE TABLE IF NOT EXISTS admin_expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hostel_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE
);

CREATE INDEX idx_admin_expenses_hostel_date ON admin_expenses(hostel_id, expense_date);
