SET @mail_addresses_internet_status_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'mail_addresses' AND COLUMN_NAME = 'internet_check_status'
);
SET @mail_addresses_drop_internet_status = IF(
  @mail_addresses_internet_status_exists > 0,
  'ALTER TABLE `mail_addresses` DROP COLUMN `internet_check_status`',
  'SELECT ''Column mail_addresses.internet_check_status does not exist; no change'' AS migration_status'
);
PREPARE mail_addresses_drop_internet_status_stmt FROM @mail_addresses_drop_internet_status;
EXECUTE mail_addresses_drop_internet_status_stmt;
DEALLOCATE PREPARE mail_addresses_drop_internet_status_stmt;

SET @mail_addresses_internet_url_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'mail_addresses' AND COLUMN_NAME = 'internet_check_url'
);
SET @mail_addresses_drop_internet_url = IF(
  @mail_addresses_internet_url_exists > 0,
  'ALTER TABLE `mail_addresses` DROP COLUMN `internet_check_url`',
  'SELECT ''Column mail_addresses.internet_check_url does not exist; no change'' AS migration_status'
);
PREPARE mail_addresses_drop_internet_url_stmt FROM @mail_addresses_drop_internet_url;
EXECUTE mail_addresses_drop_internet_url_stmt;
DEALLOCATE PREPARE mail_addresses_drop_internet_url_stmt;

SET @mail_addresses_internet_note_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'mail_addresses' AND COLUMN_NAME = 'internet_check_note'
);
SET @mail_addresses_drop_internet_note = IF(
  @mail_addresses_internet_note_exists > 0,
  'ALTER TABLE `mail_addresses` DROP COLUMN `internet_check_note`',
  'SELECT ''Column mail_addresses.internet_check_note does not exist; no change'' AS migration_status'
);
PREPARE mail_addresses_drop_internet_note_stmt FROM @mail_addresses_drop_internet_note;
EXECUTE mail_addresses_drop_internet_note_stmt;
DEALLOCATE PREPARE mail_addresses_drop_internet_note_stmt;

SET @mail_addresses_internet_checked_at_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'mail_addresses' AND COLUMN_NAME = 'internet_checked_at'
);
SET @mail_addresses_drop_internet_checked_at = IF(
  @mail_addresses_internet_checked_at_exists > 0,
  'ALTER TABLE `mail_addresses` DROP COLUMN `internet_checked_at`',
  'SELECT ''Column mail_addresses.internet_checked_at does not exist; no change'' AS migration_status'
);
PREPARE mail_addresses_drop_internet_checked_at_stmt FROM @mail_addresses_drop_internet_checked_at;
EXECUTE mail_addresses_drop_internet_checked_at_stmt;
DEALLOCATE PREPARE mail_addresses_drop_internet_checked_at_stmt;