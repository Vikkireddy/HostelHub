-- Migration for Sign-Up: Hostels table and admins updates
-- Run: mysql -u root -p hostelhub < scripts/migrate-signup.sql

USE hostelhub;

-- Create hostels table
CREATE TABLE IF NOT EXISTS hostels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add hostel_id to admins (run manually if column exists: skip or use IF NOT EXISTS per your MySQL version)
ALTER TABLE admins ADD COLUMN hostel_id INT NULL;
ALTER TABLE admins ADD CONSTRAINT fk_admins_hostel FOREIGN KEY (hostel_id) REFERENCES hostels(id);

-- Add mobile to admins
ALTER TABLE admins ADD COLUMN mobile VARCHAR(20) NULL UNIQUE;

-- Create default hostel and link existing admin
INSERT INTO hostels (name) VALUES ('Default Hostel');
SET @default_hostel_id = LAST_INSERT_ID();
UPDATE admins SET hostel_id = @default_hostel_id WHERE hostel_id IS NULL;
