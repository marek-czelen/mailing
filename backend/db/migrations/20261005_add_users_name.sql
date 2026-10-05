SET @users_name_column_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'name'
);

SET @users_name_migration = IF(
  @users_name_column_exists = 0,
  'ALTER TABLE `users` ADD COLUMN `name` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT ''Imię i nazwisko użytkownika'' AFTER `customer_id`',
  'SELECT ''Column users.name already exists; no change'' AS migration_status'
);

PREPARE users_name_migration_stmt FROM @users_name_migration;
EXECUTE users_name_migration_stmt;
DEALLOCATE PREPARE users_name_migration_stmt;