-- Migration: add textContent (wersja tekstowa maila) to marketing_campanies
-- Generated: 2025-10-25

-- UP: add column to marketing_campanies
ALTER TABLE `marketing_campanies`
  ADD COLUMN `text_content` TEXT NULL AFTER `mail_content`;

-- DOWN: remove column (rollback)
-- NOTE: przed uruchomieniem rollbacku upewnij się, że nie tracisz potrzebnych danych
-- ALTER TABLE `marketing_campanies`
--   DROP COLUMN `text_content`;
