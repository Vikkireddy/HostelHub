-- HostelHub MySQL Database Schema
-- Run this script to create the database and tables

CREATE DATABASE IF NOT EXISTS hostelhub;
USE hostelhub;

-- Admin users table
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hostel_id INT NULL,
  name VARCHAR(255) NOT NULL,
  gender VARCHAR(20) NULL,
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  emergency_contact_phone VARCHAR(20) NULL,
  room_id INT,
  course VARCHAR(255),
  monthly_rent DECIMAL(10,2) NULL,
  join_date DATE,
  planned_vacate_date DATE NULL,
  id_proof_type VARCHAR(50),
  id_proof_number VARCHAR(100),
  address TEXT,
  security_deposit_amount DECIMAL(12,2) NULL,
  resident_type VARCHAR(32) NOT NULL DEFAULT 'student',
  resident_type_details JSON NULL,
  status ENUM('present', 'left') DEFAULT 'present',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  number VARCHAR(20) NOT NULL UNIQUE,
  floor INT NOT NULL,
  ac_type ENUM('AC', 'Non-AC') NOT NULL DEFAULT 'Non-AC',
  capacity INT NOT NULL,
  status ENUM('available', 'full', 'maintenance') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  month VARCHAR(20) NOT NULL,
  year INT NOT NULL,
  status ENUM('paid', 'pending', 'overdue') DEFAULT 'pending',
  paid_at TIMESTAMP NULL,
  bill_payment_mode VARCHAR(16) NULL,
  bill_payment_reference VARCHAR(128) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Resident uploads (profile photo, ID scan, additional documents)
CREATE TABLE IF NOT EXISTS student_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  hostel_id INT NOT NULL,
  category VARCHAR(32) NOT NULL,
  label VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(128) NOT NULL,
  size_bytes INT NOT NULL,
  storage_rel_path VARCHAR(512) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_student (student_id),
  INDEX idx_hostel_student (hostel_id, student_id),
  CONSTRAINT fk_student_documents_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Insert default admin (password: admin123 - use bcrypt in production)
INSERT INTO admins (email, password_hash, name) VALUES
('admin@hostel.com', '$2a$10$placeholder', 'Admin')
ON DUPLICATE KEY UPDATE email=email;
