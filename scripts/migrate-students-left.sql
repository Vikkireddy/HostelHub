-- Migration: Create students_left table for exited/left students
-- Run: mysql -u root -p hostelhub < scripts/migrate-students-left.sql
USE hostelhub;

CREATE TABLE IF NOT EXISTS students_left (
  id INT AUTO_INCREMENT PRIMARY KEY,
  original_student_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  gender VARCHAR(20) NULL,
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  emergency_contact_phone VARCHAR(20) NULL,
  room_number VARCHAR(20),
  course VARCHAR(255),
  join_date DATE,
  left_date DATE NOT NULL,
  id_proof_type VARCHAR(50),
  id_proof_number VARCHAR(100),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
