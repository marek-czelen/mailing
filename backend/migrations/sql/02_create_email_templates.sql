-- ============================================================
-- MIGRACJA: Tworzenie systemu szablonów email
-- Data: 2025-10-31
-- Opis: Tworzy tabele do zarządzania szablonami email i ich blokami
-- ============================================================

-- Tabela szablonów email
CREATE TABLE IF NOT EXISTS `email_templates` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL COMMENT 'Nazwa szablonu',
  `description` TEXT NULL COMMENT 'Opis szablonu',
  `category` VARCHAR(100) NOT NULL DEFAULT 'general' COMMENT 'Kategoria szablonu (newsletter, promocja, powiadomienie, etc.)',
  `thumbnail` LONGTEXT NULL COMMENT 'Miniaturka w base64 lub URL',
  `tags` JSON NULL COMMENT 'Tagi w formacie JSON array',
  `author` VARCHAR(255) NULL COMMENT 'Autor szablonu',
  `version` VARCHAR(50) NOT NULL DEFAULT '1.0' COMMENT 'Wersja szablonu',
  `isSystem` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Czy to szablon systemowy',
  `isPublic` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Czy szablon jest publiczny',
  `customerId` INT NULL COMMENT 'ID klienta (null dla szablonów systemowych/publicznych)',
  `metadata` JSON NULL COMMENT 'Dodatkowe metadane (liczba bloków, kolory, etc.)',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete timestamp',
  
  INDEX `idx_templates_category` (`category`),
  INDEX `idx_templates_customer` (`customerId`),
  INDEX `idx_templates_system` (`isSystem`),
  INDEX `idx_templates_public` (`isPublic`),
  INDEX `idx_templates_deleted` (`deletedAt`),
  INDEX `idx_templates_author` (`author`),
  
  FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabela szablonów email';

-- Tabela bloków szablonów
CREATE TABLE IF NOT EXISTS `template_blocks` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `templateId` INT NOT NULL COMMENT 'ID szablonu',
  `blockType` VARCHAR(50) NOT NULL COMMENT 'Typ bloku (text, image, button, spacer, etc.)',
  `blockOrder` INT NOT NULL COMMENT 'Kolejność bloku w szablonie',
  `content` JSON NOT NULL COMMENT 'Zawartość bloku w formacie JSON',
  `style` JSON NULL COMMENT 'Styl bloku w formacie JSON',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_blocks_template` (`templateId`),
  INDEX `idx_blocks_type` (`blockType`),
  INDEX `idx_blocks_order` (`templateId`, `blockOrder`),
  
  FOREIGN KEY (`templateId`) REFERENCES `email_templates`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabela bloków składających się na szablon email';

-- Dodaj ograniczenie unikalności dla kolejności bloków w ramach szablonu
ALTER TABLE `template_blocks` ADD CONSTRAINT `unique_template_block_order` UNIQUE (`templateId`, `blockOrder`);