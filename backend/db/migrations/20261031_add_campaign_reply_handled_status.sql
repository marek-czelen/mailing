-- MySQL 8.x migration: track whether each campaign reply has been handled.

SET @campaign_replies_is_handled_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'campaign_replies'
    AND COLUMN_NAME = 'is_handled'
);
SET @campaign_replies_is_handled_migration = IF(
  @campaign_replies_is_handled_exists = 0,
  'ALTER TABLE `campaign_replies` ADD COLUMN `is_handled` TINYINT(1) NOT NULL DEFAULT 0 COMMENT ''Whether the reply has been handled'' AFTER `is_read`',
  'SELECT ''Column campaign_replies.is_handled already exists; no change'' AS migration_status'
);
PREPARE campaign_replies_is_handled_stmt FROM @campaign_replies_is_handled_migration;
EXECUTE campaign_replies_is_handled_stmt;
DEALLOCATE PREPARE campaign_replies_is_handled_stmt;

SET @campaign_replies_handled_index_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'campaign_replies'
    AND INDEX_NAME = 'idx_campaign_replies_campaign_handled'
);
SET @campaign_replies_handled_index_migration = IF(
  @campaign_replies_handled_index_exists = 0,
  'CREATE INDEX `idx_campaign_replies_campaign_handled` ON `campaign_replies` (`campaign_id`, `is_handled`)',
  'SELECT ''Index idx_campaign_replies_campaign_handled already exists; no change'' AS migration_status'
);
PREPARE campaign_replies_handled_index_stmt FROM @campaign_replies_handled_index_migration;
EXECUTE campaign_replies_handled_index_stmt;
DEALLOCATE PREPARE campaign_replies_handled_index_stmt;

-- Rollback:
-- DROP INDEX `idx_campaign_replies_campaign_handled` ON `campaign_replies`;
-- ALTER TABLE `campaign_replies` DROP COLUMN `is_handled`;