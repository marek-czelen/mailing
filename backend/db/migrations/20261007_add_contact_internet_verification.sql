SET @mail_addresses_internet_status_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'mail_addresses' AND COLUMN_NAME = 'internet_check_status'
);
SET @mail_addresses_internet_status_migration = IF(
  @mail_addresses_internet_status_exists = 0,
  'ALTER TABLE `mail_addresses` ADD COLUMN `internet_check_status` VARCHAR(32) NULL',
  'SELECT ''Column mail_addresses.internet_check_status already exists; no change'' AS migration_status'
);
PREPARE mail_addresses_internet_status_stmt FROM @mail_addresses_internet_status_migration;
EXECUTE mail_addresses_internet_status_stmt;
DEALLOCATE PREPARE mail_addresses_internet_status_stmt;

SET @mail_addresses_internet_url_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'mail_addresses' AND COLUMN_NAME = 'internet_check_url'
);
SET @mail_addresses_internet_url_migration = IF(
  @mail_addresses_internet_url_exists = 0,
  'ALTER TABLE `mail_addresses` ADD COLUMN `internet_check_url` TEXT NULL',
  'SELECT ''Column mail_addresses.internet_check_url already exists; no change'' AS migration_status'
);
PREPARE mail_addresses_internet_url_stmt FROM @mail_addresses_internet_url_migration;
EXECUTE mail_addresses_internet_url_stmt;
DEALLOCATE PREPARE mail_addresses_internet_url_stmt;

SET @mail_addresses_internet_note_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'mail_addresses' AND COLUMN_NAME = 'internet_check_note'
);
SET @mail_addresses_internet_note_migration = IF(
  @mail_addresses_internet_note_exists = 0,
  'ALTER TABLE `mail_addresses` ADD COLUMN `internet_check_note` TEXT NULL',
  'SELECT ''Column mail_addresses.internet_check_note already exists; no change'' AS migration_status'
);
PREPARE mail_addresses_internet_note_stmt FROM @mail_addresses_internet_note_migration;
EXECUTE mail_addresses_internet_note_stmt;
DEALLOCATE PREPARE mail_addresses_internet_note_stmt;

SET @mail_addresses_internet_checked_at_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'mail_addresses' AND COLUMN_NAME = 'internet_checked_at'
);
SET @mail_addresses_internet_checked_at_migration = IF(
  @mail_addresses_internet_checked_at_exists = 0,
  'ALTER TABLE `mail_addresses` ADD COLUMN `internet_checked_at` DATETIME NULL',
  'SELECT ''Column mail_addresses.internet_checked_at already exists; no change'' AS migration_status'
);
PREPARE mail_addresses_internet_checked_at_stmt FROM @mail_addresses_internet_checked_at_migration;
EXECUTE mail_addresses_internet_checked_at_stmt;
DEALLOCATE PREPARE mail_addresses_internet_checked_at_stmt;