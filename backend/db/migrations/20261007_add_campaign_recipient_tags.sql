SET @marketing_campanies_recipient_tags_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'marketing_campanies'
    AND COLUMN_NAME = 'recipient_tags'
);

SET @marketing_campanies_recipient_tags_migration = IF(
  @marketing_campanies_recipient_tags_exists = 0,
  'ALTER TABLE `marketing_campanies` ADD COLUMN `recipient_tags` JSON DEFAULT NULL',
  'SELECT ''Column marketing_campanies.recipient_tags already exists; no change'' AS migration_status'
);

PREPARE marketing_campanies_recipient_tags_migration_stmt FROM @marketing_campanies_recipient_tags_migration;
EXECUTE marketing_campanies_recipient_tags_migration_stmt;
DEALLOCATE PREPARE marketing_campanies_recipient_tags_migration_stmt;