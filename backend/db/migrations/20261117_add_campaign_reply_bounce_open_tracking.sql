SET @reply_to_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'marketing_campanies'
    AND COLUMN_NAME = 'reply_to'
);
SET @reply_to_migration = IF(
  @reply_to_exists = 0,
  'ALTER TABLE `marketing_campanies` ADD COLUMN `reply_to` VARCHAR(320) NULL AFTER `sender_email`',
  'SELECT ''Column marketing_campanies.reply_to already exists'' AS migration_status'
);
PREPARE reply_to_stmt FROM @reply_to_migration;
EXECUTE reply_to_stmt;
DEALLOCATE PREPARE reply_to_stmt;

SET @track_opens_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'marketing_campanies'
    AND COLUMN_NAME = 'track_opens'
);
SET @track_opens_migration = IF(
  @track_opens_exists = 0,
  'ALTER TABLE `marketing_campanies` ADD COLUMN `track_opens` TINYINT(1) NOT NULL DEFAULT 1',
  'SELECT ''Column marketing_campanies.track_opens already exists'' AS migration_status'
);
PREPARE track_opens_stmt FROM @track_opens_migration;
EXECUTE track_opens_stmt;
DEALLOCATE PREPARE track_opens_stmt;

SET @bounce_email_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'customers'
    AND COLUMN_NAME = 'bounce_email'
);
SET @bounce_email_migration = IF(
  @bounce_email_exists = 0,
  'ALTER TABLE `customers` ADD COLUMN `bounce_email` VARCHAR(320) NULL AFTER `smtp_from`',
  'SELECT ''Column customers.bounce_email already exists'' AS migration_status'
);
PREPARE bounce_email_stmt FROM @bounce_email_migration;
EXECUTE bounce_email_stmt;
DEALLOCATE PREPARE bounce_email_stmt;

UPDATE `customers`
SET `bounce_email` = `reply_mailbox_user`
WHERE `bounce_email` IS NULL
  AND `reply_mailbox_user` REGEXP '^[^@[:space:]]+@[^@[:space:]]+\\.[^@[:space:]]+$';

SET @opened_at_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'marketing_campanies_mailing_result'
    AND COLUMN_NAME = 'opened_at'
);
SET @opened_at_migration = IF(
  @opened_at_exists = 0,
  'ALTER TABLE `marketing_campanies_mailing_result` ADD COLUMN `opened_at` DATETIME NULL',
  'SELECT ''Column marketing_campanies_mailing_result.opened_at already exists'' AS migration_status'
);
PREPARE opened_at_stmt FROM @opened_at_migration;
EXECUTE opened_at_stmt;
DEALLOCATE PREPARE opened_at_stmt;

SET @open_tracking_token_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'marketing_campanies_mailing_result'
    AND COLUMN_NAME = 'open_tracking_token'
);
SET @open_tracking_token_migration = IF(
  @open_tracking_token_exists = 0,
  'ALTER TABLE `marketing_campanies_mailing_result` ADD COLUMN `open_tracking_token` CHAR(64) NULL',
  'SELECT ''Column marketing_campanies_mailing_result.open_tracking_token already exists'' AS migration_status'
);
PREPARE open_tracking_token_stmt FROM @open_tracking_token_migration;
EXECUTE open_tracking_token_stmt;
DEALLOCATE PREPARE open_tracking_token_stmt;

SET @open_tracking_token_index_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'marketing_campanies_mailing_result'
    AND INDEX_NAME = 'uq_mcmr_open_tracking_token'
);
SET @open_tracking_token_index_migration = IF(
  @open_tracking_token_index_exists = 0,
  'CREATE UNIQUE INDEX `uq_mcmr_open_tracking_token` ON `marketing_campanies_mailing_result` (`open_tracking_token`)',
  'SELECT ''Index uq_mcmr_open_tracking_token already exists'' AS migration_status'
);
PREPARE open_tracking_token_index_stmt FROM @open_tracking_token_index_migration;
EXECUTE open_tracking_token_index_stmt;
DEALLOCATE PREPARE open_tracking_token_index_stmt;
