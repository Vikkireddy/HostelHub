-- Planned vacate date: admin-visible notice when a present student will leave (room frees on this date).
USE hostelhub;

ALTER TABLE students
  ADD COLUMN planned_vacate_date DATE NULL AFTER join_date;
