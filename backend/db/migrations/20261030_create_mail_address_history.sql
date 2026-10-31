-- MySQL 8.x migration: retain contact changes initiated from campaign replies.

CREATE TABLE IF NOT EXISTS `mail_address_history` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `mail_address_id` INT NOT NULL,
  `customer_id` INT NOT NULL,
  `campaign_id` INT DEFAULT NULL,
  `reply_id` INT DEFAULT NULL,
  `action` VARCHAR(32) NOT NULL,
  `field_name` VARCHAR(64) NOT NULL,
  `old_value` TEXT DEFAULT NULL,
  `new_value` TEXT DEFAULT NULL,
  `changed_by` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_mail_address_history_contact` (`customer_id`, `mail_address_id`, `created_at`),
  KEY `idx_mail_address_history_reply` (`reply_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rollback:
-- DROP TABLE `mail_address_history`;