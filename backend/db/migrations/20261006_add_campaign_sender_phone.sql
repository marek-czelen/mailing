SET @campaign_sender_phone_column_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'marketing_campanies'
    AND COLUMN_NAME = 'sender_phone'
);

SET @campaign_sender_phone_migration = IF(
  @campaign_sender_phone_column_exists = 0,
  'ALTER TABLE `marketing_campanies` ADD COLUMN `sender_phone` VARCHAR(255) DEFAULT NULL AFTER `sender_email`',
  'SELECT ''Column marketing_campanies.sender_phone already exists; no change'' AS migration_status'
);

PREPARE campaign_sender_phone_migration_stmt FROM @campaign_sender_phone_migration;
EXECUTE campaign_sender_phone_migration_stmt;
DEALLOCATE PREPARE campaign_sender_phone_migration_stmt;