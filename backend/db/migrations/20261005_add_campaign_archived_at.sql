SET @campaign_archived_at_column_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'marketing_campanies'
    AND COLUMN_NAME = 'archived_at'
);

SET @campaign_archived_at_migration = IF(
  @campaign_archived_at_column_exists = 0,
  'ALTER TABLE `marketing_campanies` ADD COLUMN `archived_at` DATETIME DEFAULT NULL AFTER `date_end`',
  'SELECT ''Column marketing_campanies.archived_at already exists; no change'' AS migration_status'
);

PREPARE campaign_archived_at_migration_stmt FROM @campaign_archived_at_migration;
EXECUTE campaign_archived_at_migration_stmt;
DEALLOCATE PREPARE campaign_archived_at_migration_stmt;