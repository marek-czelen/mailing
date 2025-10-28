-- Migration: add subject, from, unsubscribe fields to marketing_campanies
-- Generated: 2025-10-25

-- UP: add columns to marketing_campanies
ALTER TABLE `marketing_campanies`
  ADD COLUMN `subject` VARCHAR(255) NULL AFTER `name`,
  ADD COLUMN `from` VARCHAR(255) NULL AFTER `subject`,
  ADD COLUMN `unsubscribe` VARCHAR(1024) NULL AFTER `from`;

-- DOWN: remove columns (rollback)
-- NOTE: przed uruchomieniem rollbacku upewnij się, że nie tracisz potrzebnych danych
-- ALTER TABLE `marketing_campanies`
--   DROP COLUMN `unsubscribe`,
--   DROP COLUMN `from`,
--   DROP COLUMN `subject`;
