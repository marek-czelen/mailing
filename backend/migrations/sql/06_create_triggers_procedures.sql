-- ============================================================
-- MIGRACJA: Triggery i procedury składowane
-- Data: 2025-10-31
-- Opis: Tworzy triggery do automatycznego zarządzania danymi
-- ============================================================

-- Trigger: Automatyczne aktualizowanie updated_at w databases
DELIMITER //

CREATE TRIGGER IF NOT EXISTS `tr_databases_updated_at` 
BEFORE UPDATE ON `databases` 
FOR EACH ROW 
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

-- Trigger: Automatyczne aktualizowanie updated_at w email_templates
CREATE TRIGGER IF NOT EXISTS `tr_email_templates_updated_at` 
BEFORE UPDATE ON `email_templates` 
FOR EACH ROW 
BEGIN
    SET NEW.updatedAt = CURRENT_TIMESTAMP;
END//

-- Trigger: Automatyczne aktualizowanie updated_at w template_blocks
CREATE TRIGGER IF NOT EXISTS `tr_template_blocks_updated_at` 
BEFORE UPDATE ON `template_blocks` 
FOR EACH ROW 
BEGIN
    SET NEW.updatedAt = CURRENT_TIMESTAMP;
END//

-- Trigger: Automatyczne aktualizowanie updated_at w mail_addresses
CREATE TRIGGER IF NOT EXISTS `tr_mail_addresses_updated_at` 
BEFORE UPDATE ON `mail_addresses` 
FOR EACH ROW 
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

-- Trigger: Automatyczne aktualizowanie updated_at w marketing_campanies
CREATE TRIGGER IF NOT EXISTS `tr_marketing_campanies_updated_at` 
BEFORE UPDATE ON `marketing_campanies` 
FOR EACH ROW 
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

DELIMITER ;

-- Procedura: Soft delete dla databases
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS `sp_soft_delete_database`(IN db_id INT)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Soft delete database
    UPDATE `databases` 
    SET `deleted_at` = CURRENT_TIMESTAMP 
    WHERE `id` = db_id AND `deleted_at` IS NULL;
    
    -- Sprawdź czy aktualizacja się powiodła
    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Database not found or already deleted';
    END IF;
    
    COMMIT;
END//

DELIMITER ;

-- Procedura: Soft delete dla email_templates
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS `sp_soft_delete_template`(IN template_id INT)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Soft delete template
    UPDATE `email_templates` 
    SET `deletedAt` = CURRENT_TIMESTAMP 
    WHERE `id` = template_id AND `deletedAt` IS NULL;
    
    -- Sprawdź czy aktualizacja się powiodła
    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Template not found or already deleted';
    END IF;
    
    COMMIT;
END//

DELIMITER ;

-- Procedura: Statystyki kampanii
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS `sp_campaign_statistics`(IN campaign_id INT)
BEGIN
    SELECT 
        c.id,
        c.name,
        c.subject,
        COUNT(mcm.mail_addresses_id) as total_sent,
        COUNT(CASE WHEN mcm.is_send = TRUE THEN 1 END) as actually_sent,
        COUNT(CASE WHEN mcm.is_readed = TRUE THEN 1 END) as opened,
        ROUND(
            (COUNT(CASE WHEN mcm.is_readed = TRUE THEN 1 END) * 100.0) / 
            NULLIF(COUNT(CASE WHEN mcm.is_send = TRUE THEN 1 END), 0), 
            2
        ) as open_rate
    FROM `marketing_campanies` c
    LEFT JOIN `marketing_campanies_mailing` mcm ON c.id = mcm.marketing_campanies_id
    WHERE c.id = campaign_id
    GROUP BY c.id, c.name, c.subject;
END//

DELIMITER ;