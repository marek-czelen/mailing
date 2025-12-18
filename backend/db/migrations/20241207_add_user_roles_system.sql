-- --------------------------------------------------------
-- Migracja: System ról użytkowników
-- Data: 2024-12-07
-- Opis: Dodanie systemu ról dla panelu administracyjnego
-- --------------------------------------------------------

-- Tabela z definicjami ról
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE COMMENT 'Unikalna nazwa roli (np. administrator, marketer)',
  `display_name` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Wyświetlana nazwa roli',
  `description` TEXT COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Opis roli i jej uprawnień',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela łącząca użytkowników z rolami (wiele do wielu)
CREATE TABLE IF NOT EXISTS `user_roles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_email` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` INT NOT NULL,
  `assigned_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `assigned_by` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Email użytkownika który przypisał rolę',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_role` (`user_email`, `role_id`),
  KEY `idx_user_email` (`user_email`),
  KEY `idx_role_id` (`role_id`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_email`) REFERENCES `users` (`email`) ON DELETE CASCADE,
  CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rozszerzenie tabeli users o dodatkowe pola
ALTER TABLE `users` 
  ADD COLUMN IF NOT EXISTS `name` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Imię i nazwisko użytkownika',
  ADD COLUMN IF NOT EXISTS `active` TINYINT(1) DEFAULT 1 COMMENT 'Status aktywności konta (1=aktywne, 0=nieaktywne)',
  ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `last_login` TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Dodanie indeksów dla lepszej wydajności
ALTER TABLE `users` 
  ADD INDEX IF NOT EXISTS `idx_active` (`active`),
  ADD INDEX IF NOT EXISTS `idx_created_at` (`created_at`);

-- Wstawienie domyślnych ról
INSERT INTO `roles` (`name`, `display_name`, `description`) VALUES
  ('administrator', 'Administrator', 'Zarządzanie systemem - pełny dostęp do wszystkich funkcji, w tym zarządzanie użytkownikami'),
  ('marketer', 'Marketer', 'Tworzenie i wysyłanie kampanii mailowych, dostęp do edytora email i statystyk kampanii'),
  ('data_administrator', 'Administrator danych', 'Zarządzanie bazami danych i kontaktami, import danych, tworzenie segmentów')
ON DUPLICATE KEY UPDATE 
  `display_name` = VALUES(`display_name`),
  `description` = VALUES(`description`);

-- Przypisanie roli administrator istniejącemu użytkownikowi admin@admin.pl
INSERT INTO `user_roles` (`user_email`, `role_id`, `assigned_by`)
SELECT 'admin@admin.pl', `id`, 'system'
FROM `roles`
WHERE `name` = 'administrator'
ON DUPLICATE KEY UPDATE `assigned_at` = CURRENT_TIMESTAMP;

-- Aktualizacja istniejącego użytkownika admin - dodanie nazwy i statusu aktywnego
UPDATE `users` 
SET 
  `name` = 'Administrator',
  `active` = 1
WHERE `email` = 'admin@admin.pl';

-- Tabela do logowania zmian w rolach użytkowników (opcjonalnie, dla audytu)
CREATE TABLE IF NOT EXISTS `user_roles_audit` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_email` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` INT NOT NULL,
  `action` ENUM('assigned', 'removed') NOT NULL,
  `changed_by` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `changed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `note` TEXT COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_email` (`user_email`),
  KEY `idx_changed_at` (`changed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
