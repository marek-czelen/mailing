-- ============================================================
-- SKRYPT CZYSZCZĄCY: Usuwa wszystkie tabele i dane systemu
-- Data: 2025-10-31
-- Opis: Skrypt do czyszczenia bazy danych (UWAGA: USUWA WSZYSTKIE DANE!)
-- ============================================================

-- OSTRZEŻENIE: Ten skrypt usuwa wszystkie dane!
-- Używaj tylko w środowisku deweloperskim lub gdy chcesz całkowicie zresetować bazę

SET FOREIGN_KEY_CHECKS = 0;

-- Usuń procedury składowane
DROP PROCEDURE IF EXISTS `sp_soft_delete_database`;
DROP PROCEDURE IF EXISTS `sp_soft_delete_template`;
DROP PROCEDURE IF EXISTS `sp_campaign_statistics`;

-- Usuń triggery
DROP TRIGGER IF EXISTS `tr_databases_updated_at`;
DROP TRIGGER IF EXISTS `tr_email_templates_updated_at`;
DROP TRIGGER IF EXISTS `tr_template_blocks_updated_at`;
DROP TRIGGER IF EXISTS `tr_mail_addresses_updated_at`;
DROP TRIGGER IF EXISTS `tr_marketing_campanies_updated_at`;

-- Usuń tabele w odpowiedniej kolejności (z uwagi na klucze obce)
DROP TABLE IF EXISTS `template_blocks`;
DROP TABLE IF EXISTS `email_templates`;
DROP TABLE IF EXISTS `marketing_campanies_mailing`;
DROP TABLE IF EXISTS `campaign_database_link`;
DROP TABLE IF EXISTS `marketing_campanies`;
DROP TABLE IF EXISTS `mail_addresses`;
DROP TABLE IF EXISTS `mail_address_attributes_definitions`;
DROP TABLE IF EXISTS `databases`;
DROP TABLE IF EXISTS `permission`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `permission_function`;
DROP TABLE IF EXISTS `permission_objects`;
DROP TABLE IF EXISTS `customers`;

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'WSZYSTKIE TABELE ZOSTAŁY USUNIĘTE' as status;