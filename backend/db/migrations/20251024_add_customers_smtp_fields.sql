-- Migration: add SMTP and unsubscribe fields to customers
-- Generated: 2025-10-24

-- UP: add columns to customers
ALTER TABLE `customers`
  ADD COLUMN `smtp_host` VARCHAR(255) NULL AFTER `name`,
  ADD COLUMN `smtp_port` INT NULL AFTER `smtp_host`,
  ADD COLUMN `smtp_user` VARCHAR(255) NULL AFTER `smtp_port`,
  ADD COLUMN `smtp_pass` VARCHAR(255) NULL AFTER `smtp_user`,
  ADD COLUMN `smtp_from` VARCHAR(255) NULL AFTER `smtp_pass`,
  ADD COLUMN `unsubscribe_url` VARCHAR(1024) NULL AFTER `smtp_from`;

-- DOWN: remove columns (rollback)
-- NOTE: przed uruchomieniem rollbacku upewnij się, że nie tracisz potrzebnych danych
-- DOWN statements below will drop the added columns

-- ALTER TABLE `customers`
--   DROP COLUMN `unsubscribe_url`,
--   DROP COLUMN `smtp_from`,
--   DROP COLUMN `smtp_pass`,
--   DROP COLUMN `smtp_user`,
--   DROP COLUMN `smtp_port`,
--   DROP COLUMN `smtp_host`;

-- Jeśli chcesz wykonać rollback, odkomentuj powyższy blok i uruchom go w DB
