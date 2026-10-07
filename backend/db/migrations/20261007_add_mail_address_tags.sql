SET @mail_addresses_tags_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'mail_addresses'
    AND COLUMN_NAME = 'tags'
);

SET @mail_addresses_tags_migration = IF(
  @mail_addresses_tags_exists = 0,
  'ALTER TABLE `mail_addresses` ADD COLUMN `tags` JSON NULL',
  'SELECT ''Column mail_addresses.tags already exists; no change'' AS migration_status'
);

PREPARE mail_addresses_tags_migration_stmt FROM @mail_addresses_tags_migration;
EXECUTE mail_addresses_tags_migration_stmt;
DEALLOCATE PREPARE mail_addresses_tags_migration_stmt;