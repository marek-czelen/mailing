-- Migration: rename mailContent to htmlContent in marketing_campanies
-- Generated: 2025-10-25

-- UP: (tylko zmiana w modelu, w bazie kolumna pozostaje mail_content)
-- Jeśli chcesz zmienić nazwę kolumny w bazie:
-- ALTER TABLE `marketing_campanies` CHANGE `mail_content` `html_content` MEDIUMTEXT NULL;

-- W modelu Sequelize pole nazywa się teraz htmlContent, ale w bazie pozostaje mail_content.

-- DOWN: (opcjonalnie, jeśli zmieniono nazwę kolumny)
-- ALTER TABLE `marketing_campanies` CHANGE `html_content` `mail_content` MEDIUMTEXT NULL;
