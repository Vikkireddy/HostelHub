-- Seed data - run after init-db.sql
-- Safe to run multiple times (uses ON DUPLICATE KEY / INSERT IGNORE)

USE hostelhub;

-- Default admin (password: admin123 - use bcrypt in production)
INSERT INTO admins (email, password_hash, name) VALUES
('admin@hostel.com', '$2a$10$placeholder', 'Admin')
ON DUPLICATE KEY UPDATE email=email;
