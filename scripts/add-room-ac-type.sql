-- Add ac_type column to rooms table (AC / Non-AC)
-- Run: mysql -u root -p hostelhub < scripts/add-room-ac-type.sql

USE hostelhub;

ALTER TABLE rooms ADD COLUMN ac_type ENUM('AC', 'Non-AC') NOT NULL DEFAULT 'Non-AC';
