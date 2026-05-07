-- Add resident-level monthly rent and backfill from old room rent when available.
-- Run: mysql -u root -p hostelhub < scripts/migrate-students-monthly-rent.sql

USE hostelhub;

SET @monthly_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'students'
    AND COLUMN_NAME = 'monthly_rent'
);

SET @add_stmt := IF(
  @monthly_exists = 0,
  'ALTER TABLE students ADD COLUMN monthly_rent DECIMAL(10,2) NULL AFTER course',
  'SELECT "students.monthly_rent already exists; skipping add"'
);
PREPARE stmt1 FROM @add_stmt;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;

SET @room_rent_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'rooms'
    AND COLUMN_NAME = 'rent'
);

SET @backfill_stmt := IF(
  @room_rent_exists > 0,
  'UPDATE students s LEFT JOIN rooms r ON s.room_id = r.id SET s.monthly_rent = COALESCE(s.monthly_rent, r.rent) WHERE s.monthly_rent IS NULL',
  'SELECT "rooms.rent not found; skipping backfill"'
);
PREPARE stmt2 FROM @backfill_stmt;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;
