-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.4.0 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.7.0.6850
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for table mailing.customers
CREATE TABLE IF NOT EXISTS `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `smtp_host` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `smtp_port` int DEFAULT NULL,
  `smtp_user` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `smtp_pass` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `smtp_from` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unsubscribe_url` varchar(1024) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table mailing.customers: ~1 rows (approximately)
INSERT INTO `customers` (`id`, `name`, `smtp_host`, `smtp_port`, `smtp_user`, `smtp_pass`, `smtp_from`, `unsubscribe_url`, `active`) VALUES
	(1, 'Default Customer', NULL, NULL, NULL, NULL, NULL, NULL, 1);

-- Dumping structure for table mailing.mail_addresses
CREATE TABLE IF NOT EXISTS `mail_addresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mail_address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `miasto` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rodzaj` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `active` int DEFAULT '1',
  `customer_id` int NOT NULL,
  `unsubscribes_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_mail_address` (`mail_address`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_active` (`active`),
  CONSTRAINT `mail_addresses_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table mailing.mail_addresses: ~18 rows (approximately)
INSERT INTO `mail_addresses` (`id`, `mail_address`, `miasto`, `rodzaj`, `active`, `customer_id`, `unsubscribes_date`) VALUES
	(1, 'marek-czelen@wp.pl', 'PRZEWORSK', 'szkola podstawowa', 1, 1, NULL),
	(2, 'marek-czelen@wp.pl', 'DĄBRÓWKA K. RADZYMINA', 'szkola podstawowa', 1, 1, NULL),
	(3, 'marek-czelen@wp.pl', 'JÓZEFÓW', 'szkola podstawowa', 1, 1, NULL),
	(4, 'marek-czelen@wp.pl', 'KRAKÓW', 'szkola podstawowa', 1, 1, NULL),
	(5, 'marek-czelen@wp.pl', 'KRAKÓW', 'Gimnazjum', 1, 1, NULL),
	(6, 'marek-czelen@wp.pl', 'Łódź-Polesie - delegatura', 'szkola podstawowa', 1, 1, NULL),
	(7, 'marek-czelen@wp.pl', 'Podwiesk', 'Gimnazjum', 1, 1, NULL),
	(8, 'marek-czelen@wp.pl', 'TRZEBINIA', 'szkola podstawowa', 1, 1, NULL),
	(9, 'marek-czelen@wp.pl', 'SŁUPIA', 'Gimnazjum', 1, 1, NULL),
	(10, 'marek-czelen@wp.pl', 'Kalwaria Zebrzydowska - obszar wiejski', 'szkola podstawowa', 1, 1, NULL),
	(11, 'marek-czelen@wp.pl', 'Łódź-Bałuty - delegatura', 'szkola podstawowa', 1, 1, NULL),
	(12, 'marek-czelen@wp.pl', 'SZAFLARY', 'Gimnazjum', 1, 1, NULL),
	(13, 'marek-czelen@wp.pl', 'Szaflary', 'szkola podstawowa', 1, 1, NULL),
	(14, 'marek-czelen@wp.pl', 'RUDA ŚLĄSKA', 'szkola podstawowa', 1, 1, NULL),
	(15, 'marek-czelen@wp.pl', 'WYSZKÓW', 'Gimnazjum', 1, 1, NULL),
	(16, 'marek-czelen@wp.pl', 'Łaskarzew', 'szkola podstawowa', 1, 1, NULL),
	(17, 'marek-czelen@wp.pl', 'Kluczbork', 'Liceum', 1, 1, NULL),
	(18, 'marek-czelen@wp.pl', 'Inowrocław', 'Liceum', 1, 1, NULL);

-- Dumping structure for table mailing.mail_address_attributes_definitions
CREATE TABLE IF NOT EXISTS `mail_address_attributes_definitions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `attribute_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_customer_id` (`customer_id`),
  CONSTRAINT `mail_address_attributes_definitions_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table mailing.mail_address_attributes_definitions: ~0 rows (approximately)

-- Dumping structure for table mailing.mail_address_attribute_value
CREATE TABLE IF NOT EXISTS `mail_address_attribute_value` (
  `mail_address_attributes_definitions_id` int NOT NULL,
  `mail_addresses_id` int NOT NULL,
  `mail_address_attributes_value` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`mail_address_attributes_definitions_id`,`mail_addresses_id`),
  KEY `mail_addresses_id` (`mail_addresses_id`),
  CONSTRAINT `mail_address_attribute_value_ibfk_1` FOREIGN KEY (`mail_address_attributes_definitions_id`) REFERENCES `mail_address_attributes_definitions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `mail_address_attribute_value_ibfk_2` FOREIGN KEY (`mail_addresses_id`) REFERENCES `mail_addresses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table mailing.mail_address_attribute_value: ~0 rows (approximately)

-- Dumping structure for table mailing.marketing_campanies
CREATE TABLE IF NOT EXISTS `marketing_campanies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mail_content` mediumtext COLLATE utf8mb4_unicode_ci,
  `date_start` date DEFAULT NULL,
  `date_end` date DEFAULT NULL,
  `progress` int DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_active` (`active`),
  CONSTRAINT `marketing_campanies_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table mailing.marketing_campanies: ~0 rows (approximately)
INSERT INTO `marketing_campanies` (`id`, `customer_id`, `name`, `mail_content`, `date_start`, `date_end`, `progress`, `active`) VALUES
	(1, 1, '2020-01-01', '<p>edsas as das</p>', NULL, NULL, NULL, 0);

-- Dumping structure for table mailing.marketing_campanies_mailing
CREATE TABLE IF NOT EXISTS `marketing_campanies_mailing` (
  `marketing_campanies_id` int NOT NULL,
  `mail_addresses_id` int NOT NULL,
  `response_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_readed` tinyint(1) DEFAULT NULL,
  `respons_data` date DEFAULT NULL,
  `is_send` tinyint(1) DEFAULT NULL,
  `send_data` date DEFAULT NULL,
  PRIMARY KEY (`marketing_campanies_id`,`mail_addresses_id`),
  KEY `mail_addresses_id` (`mail_addresses_id`),
  KEY `idx_is_send` (`is_send`),
  KEY `idx_is_readed` (`is_readed`),
  CONSTRAINT `marketing_campanies_mailing_ibfk_1` FOREIGN KEY (`marketing_campanies_id`) REFERENCES `marketing_campanies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `marketing_campanies_mailing_ibfk_2` FOREIGN KEY (`mail_addresses_id`) REFERENCES `mail_addresses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table mailing.marketing_campanies_mailing: ~18 rows (approximately)
INSERT INTO `marketing_campanies_mailing` (`marketing_campanies_id`, `mail_addresses_id`, `response_address`, `is_readed`, `respons_data`, `is_send`, `send_data`) VALUES
	(1, 1, NULL, NULL, NULL, NULL, NULL),
	(1, 2, NULL, NULL, NULL, NULL, NULL),
	(1, 3, NULL, NULL, NULL, NULL, NULL),
	(1, 4, NULL, NULL, NULL, NULL, NULL),
	(1, 5, NULL, NULL, NULL, NULL, NULL),
	(1, 6, NULL, NULL, NULL, NULL, NULL),
	(1, 7, NULL, NULL, NULL, NULL, NULL),
	(1, 8, NULL, NULL, NULL, NULL, NULL),
	(1, 9, NULL, NULL, NULL, NULL, NULL),
	(1, 10, NULL, NULL, NULL, NULL, NULL),
	(1, 11, NULL, NULL, NULL, NULL, NULL),
	(1, 12, NULL, NULL, NULL, NULL, NULL),
	(1, 13, NULL, NULL, NULL, NULL, NULL),
	(1, 14, NULL, NULL, NULL, NULL, NULL),
	(1, 15, NULL, NULL, NULL, NULL, NULL),
	(1, 16, NULL, NULL, NULL, NULL, NULL),
	(1, 17, NULL, NULL, NULL, NULL, NULL),
	(1, 18, NULL, NULL, NULL, NULL, NULL);

-- Dumping structure for table mailing.permission
CREATE TABLE IF NOT EXISTS `permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int DEFAULT NULL,
  `permission_objects_id` int DEFAULT NULL,
  `permission_function_id` int DEFAULT NULL,
  `access_level` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `permission_objects_id` (`permission_objects_id`),
  KEY `permission_function_id` (`permission_function_id`),
  KEY `idx_customer_id` (`customer_id`),
  CONSTRAINT `permission_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `permission_ibfk_2` FOREIGN KEY (`permission_objects_id`) REFERENCES `permission_objects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `permission_ibfk_3` FOREIGN KEY (`permission_function_id`) REFERENCES `permission_function` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table mailing.permission: ~0 rows (approximately)

-- Dumping structure for table mailing.permission_function
CREATE TABLE IF NOT EXISTS `permission_function` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table mailing.permission_function: ~4 rows (approximately)
INSERT INTO `permission_function` (`id`, `name`) VALUES
	(1, 'read'),
	(2, 'write'),
	(3, 'manage'),
	(4, 'delete');

-- Dumping structure for table mailing.permission_objects
CREATE TABLE IF NOT EXISTS `permission_objects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table mailing.permission_objects: ~4 rows (approximately)
INSERT INTO `permission_objects` (`id`, `name`) VALUES
	(1, 'users'),
	(2, 'mail_addresses'),
	(3, 'campaigns'),
	(4, 'reports');

-- Dumping structure for table mailing.users
CREATE TABLE IF NOT EXISTS `users` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_id` int DEFAULT NULL,
  PRIMARY KEY (`email`),
  KEY `idx_customer_id` (`customer_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table mailing.users: ~1 rows (approximately)
INSERT INTO `users` (`email`, `hash`, `customer_id`) VALUES
	('admin@admin.pl', '$2b$10$gfb2kbafPKXysR9BXyyvfumD1BFD7tGWP4B1SvrvR.iehfxSx01uu', 1);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
