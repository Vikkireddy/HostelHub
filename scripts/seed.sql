-- Seed data - run after init-db.sql
-- Safe to run multiple times (uses ON DUPLICATE KEY / INSERT IGNORE)

USE hostelhub;

-- Default admin (password: admin123 - use bcrypt in production)
INSERT INTO admins (email, password_hash, name) VALUES
('admin@hostel.com', '$2a$10$placeholder', 'Admin')
ON DUPLICATE KEY UPDATE email=email;

-- Default food menu
INSERT INTO food_menu (day, breakfast, lunch, snacks, dinner) VALUES
('Monday', 'Poha, Tea, Banana', 'Dal, Rice, Roti, Sabzi', 'Samosa, Chai', 'Paneer Butter Masala, Roti, Rice'),
('Tuesday', 'Idli, Sambhar, Coffee', 'Rajma, Rice, Roti, Salad', 'Bread Pakora, Juice', 'Chole, Rice, Roti, Raita'),
('Wednesday', 'Paratha, Curd, Pickle', 'Dal Fry, Rice, Roti, Aloo Gobi', 'Vada Pav, Tea', 'Mixed Veg, Roti, Pulao'),
('Thursday', 'Upma, Chutney, Tea', 'Kadhi, Rice, Roti, Bhindi', 'Pav Bhaji', 'Dal Makhani, Jeera Rice, Roti'),
('Friday', 'Aloo Paratha, Curd', 'Sambar, Rice, Roti, Cabbage', 'Maggi, Cold Drink', 'Shahi Paneer, Naan, Pulao'),
('Saturday', 'Chole Bhature, Lassi', 'Biryani, Raita, Salad', 'Cake, Tea', 'Egg Curry / Paneer, Rice, Roti'),
('Sunday', 'Puri, Aloo Sabzi, Tea', 'Special Thali (Dal, Rice, 2 Sabzi, Roti, Sweet)', 'Dosa, Chutney', 'Butter Chicken / Paneer Tikka, Naan')
ON DUPLICATE KEY UPDATE breakfast=VALUES(breakfast), lunch=VALUES(lunch), snacks=VALUES(snacks), dinner=VALUES(dinner);
