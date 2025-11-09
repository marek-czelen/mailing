-- Migration: add reply mailbox configuration fields to marketing_campanies
-- Generated: 2025-11-09
-- MariaDB 10.3.9 compatible

-- UP
ALTER TABLE `marketing_campanies`
  ADD COLUMN `reply_check_enabled` TINYINT(1) NOT NULL DEFAULT 0 AFTER `sent`,
  ADD COLUMN `reply_mailbox_host` VARCHAR(255) NULL AFTER `reply_check_enabled`,
  ADD COLUMN `reply_mailbox_port` INT NULL DEFAULT 993 AFTER `reply_mailbox_host`,
  ADD COLUMN `reply_mailbox_user` VARCHAR(255) NULL AFTER `reply_mailbox_port`,
  ADD COLUMN `reply_mailbox_pass` VARCHAR(255) NULL AFTER `reply_mailbox_user`,
  ADD COLUMN `reply_mailbox_protocol` VARCHAR(16) NULL DEFAULT 'IMAP' AFTER `reply_mailbox_pass`,
  ADD COLUMN `reply_mailbox_folder` VARCHAR(64) NULL DEFAULT 'INBOX' AFTER `reply_mailbox_protocol`,
  ADD COLUMN `reply_mailbox_tls` TINYINT(1) NULL AFTER `reply_mailbox_folder`,
  ADD COLUMN `reply_mailbox_allow_self_signed` TINYINT(1) NOT NULL DEFAULT 0 AFTER `reply_mailbox_tls`;

-- Optional performance index: filter campaigns that have reply checking enabled and are active
CREATE INDEX idx_marketing_campaigns_reply_active ON `marketing_campanies` (`reply_check_enabled`, `active`, `sent`);

-- DOWN (rollback)
-- ALTER TABLE `marketing_campanies`
--   DROP COLUMN `reply_mailbox_allow_self_signed`,
--   DROP COLUMN `reply_mailbox_tls`,
--   DROP COLUMN `reply_mailbox_folder`,
--   DROP COLUMN `reply_mailbox_protocol`,
--   DROP COLUMN `reply_mailbox_pass`,
--   DROP COLUMN `reply_mailbox_user`,
--   DROP COLUMN `reply_mailbox_port`,
--   DROP COLUMN `reply_mailbox_host`,
--   DROP COLUMN `reply_check_enabled`;
-- DROP INDEX idx_marketing_campaigns_reply_active ON `marketing_campanies`;