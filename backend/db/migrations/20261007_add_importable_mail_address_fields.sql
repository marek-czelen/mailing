SET @mail_addresses_status_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'mail_addresses'
    AND COLUMN_NAME = 'status'
);

SET @mail_addresses_status_migration = IF(
  @mail_addresses_status_exists = 0,
  'ALTER TABLE `mail_addresses` ADD COLUMN `status` VARCHAR(255) DEFAULT NULL',
  'SELECT ''Column mail_addresses.status already exists; no change'' AS migration_status'
);

PREPARE mail_addresses_status_migration_stmt FROM @mail_addresses_status_migration;
EXECUTE mail_addresses_status_migration_stmt;
DEALLOCATE PREPARE mail_addresses_status_migration_stmt;

SET @mail_addresses_name2_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'mail_addresses'
    AND COLUMN_NAME = 'nazwa_2'
);

SET @mail_addresses_name2_migration = IF(
  @mail_addresses_name2_exists = 0,
  'ALTER TABLE `mail_addresses` ADD COLUMN `nazwa_2` VARCHAR(255) DEFAULT NULL',
  'SELECT ''Column mail_addresses.nazwa_2 already exists; no change'' AS migration_status'
);

PREPARE mail_addresses_name2_migration_stmt FROM @mail_addresses_name2_migration;
EXECUTE mail_addresses_name2_migration_stmt;
DEALLOCATE PREPARE mail_addresses_name2_migration_stmt;

SET @mail_addresses_created_at_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'mail_addresses'
    AND COLUMN_NAME = 'created_at'
);

SET @mail_addresses_created_at_migration = IF(
  @mail_addresses_created_at_exists = 0,
  'ALTER TABLE `mail_addresses` ADD COLUMN `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP',
  'SELECT ''Column mail_addresses.created_at already exists; no change'' AS migration_status'
);

PREPARE mail_addresses_created_at_migration_stmt FROM @mail_addresses_created_at_migration;
EXECUTE mail_addresses_created_at_migration_stmt;
DEALLOCATE PREPARE mail_addresses_created_at_migration_stmt;

SET @mail_addresses_updated_at_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'mail_addresses'
    AND COLUMN_NAME = 'updated_at'
);

SET @mail_addresses_updated_at_migration = IF(
  @mail_addresses_updated_at_exists = 0,
  'ALTER TABLE `mail_addresses` ADD COLUMN `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
  'SELECT ''Column mail_addresses.updated_at already exists; no change'' AS migration_status'
);

PREPARE mail_addresses_updated_at_migration_stmt FROM @mail_addresses_updated_at_migration;
EXECUTE mail_addresses_updated_at_migration_stmt;
DEALLOCATE PREPARE mail_addresses_updated_at_migration_stmt;