-- Optional advance / security deposit on residents; checkout settlement on students_left.
-- Run: mysql -u root -p hostelhub < scripts/migrate-students-security-deposit.sql
-- Safe to run once; will error if columns already exist (ignore or adjust).

ALTER TABLE students
  ADD COLUMN security_deposit_amount DECIMAL(12,2) NULL AFTER address;

ALTER TABLE students_left
  ADD COLUMN security_deposit_amount DECIMAL(12,2) NULL AFTER address;

ALTER TABLE students_left
  ADD COLUMN security_deposit_deduction DECIMAL(12,2) NULL AFTER security_deposit_amount;

ALTER TABLE students_left
  ADD COLUMN security_deposit_refund DECIMAL(12,2) NULL AFTER security_deposit_deduction;
