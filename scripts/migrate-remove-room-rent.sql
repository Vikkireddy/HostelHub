-- Remove deprecated room-level rent column.
-- Run: mysql -u root -p hostelhub < scripts/migrate-remove-room-rent.sql

USE hostelhub;

SET @rent_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'rooms'
    AND COLUMN_NAME = 'rent'
);

SET @drop_stmt := IF(
  @rent_exists > 0,
  'ALTER TABLE rooms DROP COLUMN rent',
  'SELECT "rooms.rent column not found; skipping"'
);

PREPARE stmt FROM @drop_stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
