-- Migration: add bounce tracking fields
-- Generated: 2025-11-10
-- MariaDB 10.3.9 compatible
-- Dodanie pól do śledzenia bounce messages (odbić emaili)

-- UP

-- 1. Rozszerzenie tabeli campaign_replies o informacje o bounce
ALTER TABLE `campaign_replies`
	ADD COLUMN `is_bounce` TINYINT(1) NOT NULL DEFAULT 0 AFTER `is_read` COMMENT 'Czy wiadomość jest bounce/NDR',
	ADD COLUMN `bounce_type` VARCHAR(50) NULL DEFAULT NULL AFTER `is_bounce` COMMENT 'Typ bounce: hard/soft/unknown',
	ADD COLUMN `bounce_reason` TEXT NULL DEFAULT NULL AFTER `bounce_type` COMMENT 'Powód bounce (z nagłówków DSN)';

CREATE INDEX `idx_campaign_replies_is_bounce` ON `campaign_replies` (`is_bounce`) USING BTREE;

-- 2. Rozszerzenie tabeli mail_addresses o informacje o bounce
ALTER TABLE `mail_addresses`
	ADD COLUMN `bounce_date` DATETIME NULL DEFAULT NULL AFTER `unsubscribes_date` COMMENT 'Data ostatniego bounce',
	ADD COLUMN `bounce_reason` TEXT NULL DEFAULT NULL AFTER `bounce_date` COMMENT 'Ostatni powód bounce',
	ADD COLUMN `bounce_count` INT(11) NOT NULL DEFAULT 0 AFTER `bounce_reason` COMMENT 'Liczba bounces (hard)';

CREATE INDEX `idx_mail_addresses_bounce_date` ON `mail_addresses` (`bounce_date`) USING BTREE;

-- DOWN (rollback)
-- ALTER TABLE `campaign_replies`
--     DROP COLUMN `bounce_reason`,
--     DROP COLUMN `bounce_type`,
--     DROP COLUMN `is_bounce`;
-- DROP INDEX `idx_campaign_replies_is_bounce` ON `campaign_replies`;
--
-- ALTER TABLE `mail_addresses`
--     DROP COLUMN `bounce_count`,
--     DROP COLUMN `bounce_reason`,
--     DROP COLUMN `bounce_date`;
-- DROP INDEX `idx_mail_addresses_bounce_date` ON `mail_addresses`;
