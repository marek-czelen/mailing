-- Migration: add full body and read tracking to campaign_replies
-- Generated: 2025-11-09
-- MariaDB 10.3.9 compatible
-- Dodanie pól: body_full (pełna treść odpowiedzi), is_read (czy odczytana przez użytkownika), read_at (data odczytania)

-- UP
ALTER TABLE `campaign_replies`
	ADD COLUMN `imap_uid` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8_general_ci' AFTER `reply_hash` COMMENT 'UID wiadomości w IMAP (do pobrania treści na żądanie)',
	ADD COLUMN `body_full` MEDIUMTEXT NULL DEFAULT NULL COLLATE 'utf8_general_ci' AFTER `body_preview`,
	ADD COLUMN `is_read` TINYINT(1) NOT NULL DEFAULT 0 AFTER `body_full`,
	ADD COLUMN `read_at` DATETIME NULL DEFAULT NULL AFTER `is_read`;

-- Dodaj indeks dla filtrowania po is_read
CREATE INDEX `idx_campaign_replies_is_read` ON `campaign_replies` (`is_read`) USING BTREE;

-- DOWN (rollback)
-- ALTER TABLE `campaign_replies`
--     DROP COLUMN `read_at`,
--     DROP COLUMN `is_read`,
--     DROP COLUMN `body_full`,
--     DROP COLUMN `imap_uid`;
-- DROP INDEX `idx_campaign_replies_is_read` ON `campaign_replies`;
