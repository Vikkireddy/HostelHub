-- Migration: Add id_proof_type, id_proof_number, address to students table
-- Run: mysql -u root -p < scripts/migrate-students-add-id-address.sql
USE hostelhub;

ALTER TABLE students ADD COLUMN id_proof_type VARCHAR(50) NULL;
ALTER TABLE students ADD COLUMN id_proof_number VARCHAR(100) NULL;
ALTER TABLE students ADD COLUMN address TEXT NULL;
