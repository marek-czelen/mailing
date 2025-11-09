-- Migration: create campaign_replies table
-- Generated: 2025-11-09
-- MariaDB 10.3.9 compatible
-- Tabela przechowująca odpowiedzi (replies) na kampanie marketingowe

-- UP
CREATE TABLE `campaign_replies` (
	`id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
	`campaign_id` INT(11) NOT NULL,
	`mail_address_id` INT(11) NULL DEFAULT NULL,
	`from_email` VARCHAR(320) NOT NULL COLLATE 'utf8_general_ci',
	`subject` VARCHAR(500) NULL DEFAULT NULL COLLATE 'utf8_general_ci',
	`received_at` DATETIME NOT NULL,
	`message_id` VARCHAR(500) NULL DEFAULT NULL COLLATE 'utf8_general_ci',
	`reply_hash` VARCHAR(64) NOT NULL COLLATE 'utf8_general_ci',
	`body_preview` TEXT NULL DEFAULT NULL COLLATE 'utf8_general_ci',
	`created_at` TIMESTAMP NOT NULL DEFAULT current_timestamp(),
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `FK_campaign_replies_marketing_campanies` (`campaign_id`) USING BTREE,
	INDEX `FK_campaign_replies_mail_addresses` (`mail_address_id`) USING BTREE,
	CONSTRAINT `FK_campaign_replies_mail_addresses` FOREIGN KEY (`mail_address_id`) REFERENCES `mail_addresses` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT `FK_campaign_replies_marketing_campanies` FOREIGN KEY (`campaign_id`) REFERENCES `marketing_campanies` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
)
COLLATE='utf8_general_ci'
ENGINE=InnoDB
;

-- DOWN (rollback)
-- DROP TABLE IF EXISTS `campaign_replies`;
