-- ============================================================
-- MIGRACJA: Tworzenie podstawowych tabel systemu mailingowego
-- Data: 2025-10-31
-- Opis: Tworzy podstawowe tabele systemowe
-- ============================================================

-- Tabela klientów/firm
CREATE TABLE IF NOT EXISTS `customers` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `smtp_host` VARCHAR(255) NULL,
  `smtp_port` INT NULL,
  `smtp_user` VARCHAR(255) NULL,
  `smtp_pass` VARCHAR(255) NULL,
  `smtp_from` VARCHAR(255) NULL,
  `unsubscribe_url` VARCHAR(500) NULL,
  `active` BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela użytkowników
CREATE TABLE IF NOT EXISTS `users` (
  `email` VARCHAR(255) PRIMARY KEY,
  `hash` VARCHAR(255) NOT NULL,
  `customer_id` INT NOT NULL,
  INDEX `idx_users_customer_id` (`customer_id`),
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela obiektów uprawnień
CREATE TABLE IF NOT EXISTS `permission_objects` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela funkcji uprawnień
CREATE TABLE IF NOT EXISTS `permission_function` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela uprawnień
CREATE TABLE IF NOT EXISTS `permission` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `customer_id` INT NOT NULL,
  `permission_objects_id` INT NOT NULL,
  `permission_function_id` INT NOT NULL,
  `access_level` INT NOT NULL,
  INDEX `idx_permission_customer` (`customer_id`),
  INDEX `idx_permission_objects` (`permission_objects_id`),
  INDEX `idx_permission_function` (`permission_function_id`),
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`permission_objects_id`) REFERENCES `permission_objects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`permission_function_id`) REFERENCES `permission_function`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela baz danych kontaktów
CREATE TABLE IF NOT EXISTS `databases` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `tags` JSON NULL COMMENT 'Array tagów w formacie JSON',
  `rodo_flag` BOOLEAN NOT NULL DEFAULT TRUE,
  `export_enabled` BOOLEAN NOT NULL DEFAULT TRUE,
  `customer_id` INT NOT NULL,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete timestamp',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_databases_customer` (`customer_id`),
  INDEX `idx_databases_deleted` (`deleted_at`),
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela definicji atrybutów adresów email
CREATE TABLE IF NOT EXISTS `mail_address_attributes_definitions` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `customer_id` INT NOT NULL,
  `attribute_name` VARCHAR(255) NOT NULL,
  INDEX `idx_mail_attr_def_customer` (`customer_id`),
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela adresów email/kontaktów
CREATE TABLE IF NOT EXISTS `mail_addresses` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `mail_address` VARCHAR(255) NOT NULL,
  `miasto` VARCHAR(255) NULL,
  `rodzaj` VARCHAR(255) NULL,
  `phone` VARCHAR(255) NULL,
  `active` INT DEFAULT 1,
  `customer_id` INT NOT NULL,
  `unsubscribes_date` TIMESTAMP NULL,
  `database_id` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_mail_addresses_email` (`mail_address`),
  INDEX `idx_mail_addresses_customer` (`customer_id`),
  INDEX `idx_mail_addresses_database` (`database_id`),
  INDEX `idx_mail_addresses_active` (`active`),
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`database_id`) REFERENCES `databases`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela kampanii marketingowych
CREATE TABLE IF NOT EXISTS `marketing_campanies` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `customer_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `subject` VARCHAR(255) NULL,
  `description` TEXT NULL,
  `from` VARCHAR(255) NULL,
  `unsubscribe` VARCHAR(500) NULL,
  `textContent` TEXT NULL,
  `htmlContent` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_marketing_customer` (`customer_id`),
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela powiązań kampanii z adresami email
CREATE TABLE IF NOT EXISTS `marketing_campanies_mailing` (
  `marketing_campanies_id` INT NOT NULL,
  `mail_addresses_id` INT NOT NULL,
  `response_address` VARCHAR(255) NULL,
  `is_readed` BOOLEAN NULL,
  `respons_data` TIMESTAMP NULL,
  `is_send` BOOLEAN NULL,
  PRIMARY KEY (`marketing_campanies_id`, `mail_addresses_id`),
  INDEX `idx_mcm_campaign` (`marketing_campanies_id`),
  INDEX `idx_mcm_mail` (`mail_addresses_id`),
  FOREIGN KEY (`marketing_campanies_id`) REFERENCES `marketing_campanies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`mail_addresses_id`) REFERENCES `mail_addresses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela powiązań kampanii z bazami danych
CREATE TABLE IF NOT EXISTS `campaign_database_link` (
  `campaign_id` INT NOT NULL,
  `database_id` INT NOT NULL,
  PRIMARY KEY (`campaign_id`, `database_id`),
  INDEX `idx_cdl_campaign` (`campaign_id`),
  INDEX `idx_cdl_database` (`database_id`),
  FOREIGN KEY (`campaign_id`) REFERENCES `marketing_campanies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`database_id`) REFERENCES `databases`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;