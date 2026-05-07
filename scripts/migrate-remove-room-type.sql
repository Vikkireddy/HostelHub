-- Remove deprecated room "type" column.
-- Run: mysql -u root -p hostelhub < scripts/migrate-remove-room-type.sql

USE hostelhub;

SET @type_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'rooms'
    AND COLUMN_NAME = 'type'
);

SET @drop_stmt := IF(
  @type_exists > 0,
  'ALTER TABLE rooms DROP COLUMN type',
  'SELECT "rooms.type column not found; skipping"'
);

PREPARE stmt FROM @drop_stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
