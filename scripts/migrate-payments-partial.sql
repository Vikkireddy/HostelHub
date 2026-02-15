-- Migration: Add partial payment support (amount_due, amount_paid)
-- Run: node scripts/run-migrate-payments-partial.js

USE hostelhub;

-- Add new columns
ALTER TABLE payments ADD COLUMN IF NOT EXISTS amount_due DECIMAL(10, 2) NULL;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10, 2) NULL;

-- Migrate existing data: amount_due = amount, amount_paid = amount if paid else 0
UPDATE payments SET amount_due = amount, amount_paid = CASE WHEN status = 'paid' THEN amount ELSE 0 END WHERE amount_due IS NULL;

-- Set NOT NULL and defaults for new rows
ALTER TABLE payments MODIFY amount_due DECIMAL(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE payments MODIFY amount_paid DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- Add unique constraint for (student_id, month, year) to support upsert
-- First remove duplicates if any (keep the one with highest amount_paid or most recent)
-- MySQL doesn't support IF NOT EXISTS for unique - use a safe approach
SET @exist := (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
  WHERE CONSTRAINT_SCHEMA = 'hostelhub' AND TABLE_NAME = 'payments' AND CONSTRAINT_NAME = 'payments_student_month_year_unique');
SET @sql := IF(@exist = 0, 
  'ALTER TABLE payments ADD UNIQUE KEY payments_student_month_year_unique (student_id, month, year)',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
