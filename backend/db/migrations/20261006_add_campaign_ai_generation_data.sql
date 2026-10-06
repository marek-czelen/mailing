SET @campaign_ai_generation_data_column_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'marketing_campanies'
    AND COLUMN_NAME = 'ai_generation_data'
);

SET @campaign_ai_generation_data_migration = IF(
  @campaign_ai_generation_data_column_exists = 0,
  'ALTER TABLE `marketing_campanies` ADD COLUMN `ai_generation_data` JSON DEFAULT NULL AFTER `html_content`',
  'SELECT ''Column marketing_campanies.ai_generation_data already exists; no change'' AS migration_status'
);

PREPARE campaign_ai_generation_data_migration_stmt FROM @campaign_ai_generation_data_migration;
EXECUTE campaign_ai_generation_data_migration_stmt;
DEALLOCATE PREPARE campaign_ai_generation_data_migration_stmt;