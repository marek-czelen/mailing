-- Migration: add scoring (int) and suggestions (json) to marketing_campanies
-- Generated: 2025-10-25

-- UP: add columns to marketing_campanies
ALTER TABLE `marketing_campanies`
  ADD COLUMN `scoring` INT NULL AFTER `active`,
  ADD COLUMN `suggestions` JSON NULL AFTER `scoring`;

-- DOWN: remove columns (rollback)
-- ALTER TABLE `marketing_campanies`
--   DROP COLUMN `suggestions`,
--   DROP COLUMN `scoring`;
