-- MySQL 8.x migration: track permanent delivery failures separately from opt-outs.

SET @mail_addresses_delivery_status_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'mail_addresses'
    AND COLUMN_NAME = 'delivery_status'
);
SET @mail_addresses_delivery_status_migration = IF(
  @mail_addresses_delivery_status_exists = 0,
  'ALTER TABLE `mail_addresses` ADD COLUMN `delivery_status` ENUM(''unknown'', ''undeliverable'') NOT NULL DEFAULT ''unknown'' COMMENT ''Permanent email delivery status'' AFTER `bounce_count`',
  'SELECT ''Column mail_addresses.delivery_status already exists; no change'' AS migration_status'
);
PREPARE mail_addresses_delivery_status_stmt FROM @mail_addresses_delivery_status_migration;
EXECUTE mail_addresses_delivery_status_stmt;
DEALLOCATE PREPARE mail_addresses_delivery_status_stmt;

SET @mail_addresses_delivery_status_index_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'mail_addresses'
    AND INDEX_NAME = 'idx_mail_addresses_delivery_status'
);
SET @mail_addresses_delivery_status_index_migration = IF(
  @mail_addresses_delivery_status_index_exists = 0,
  'CREATE INDEX `idx_mail_addresses_delivery_status` ON `mail_addresses` (`delivery_status`)',
  'SELECT ''Index idx_mail_addresses_delivery_status already exists; no change'' AS migration_status'
);
PREPARE mail_addresses_delivery_status_index_stmt FROM @mail_addresses_delivery_status_index_migration;
EXECUTE mail_addresses_delivery_status_index_stmt;
DEALLOCATE PREPARE mail_addresses_delivery_status_index_stmt;

-- Rollback:
-- DROP INDEX `idx_mail_addresses_delivery_status` ON `mail_addresses`;
-- ALTER TABLE `mail_addresses` DROP COLUMN `delivery_status`;