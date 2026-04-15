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
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  room_id INT,
  course VARCHAR(255),
  join_date DATE,
  planned_vacate_date DATE NULL,
  id_proof_type VARCHAR(50),
  id_proof_number VARCHAR(100),
  address TEXT,
  status ENUM('present', 'left') DEFAULT 'present',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  number VARCHAR(20) NOT NULL UNIQUE,
  floor INT NOT NULL,
  type ENUM('Single', 'Double', 'Triple') NOT NULL,
  ac_type ENUM('AC', 'Non-AC') NOT NULL DEFAULT 'Non-AC',
  capacity INT NOT NULL,
  rent DECIMAL(10, 2) NOT NULL,
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Insert default admin (password: admin123 - use bcrypt in production)
INSERT INTO admins (email, password_hash, name) VALUES
('admin@hostel.com', '$2a$10$placeholder', 'Admin')
ON DUPLICATE KEY UPDATE email=email;
