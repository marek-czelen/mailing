-- 2025-11-09: Add message_id to marketing_campanies_mailing_result for reply mapping

ALTER TABLE `marketing_campanies_mailing_result`
  ADD COLUMN `message_id` VARCHAR(255) NULL AFTER `send_date`;

-- Helpful index for fast lookup by Message-ID from replies (In-Reply-To / References)
CREATE INDEX `idx_mcmr_message_id` ON `marketing_campanies_mailing_result` (`message_id`);

-- Rollback
-- ALTER TABLE `marketing_campanies_mailing_result` DROP COLUMN `message_id`;
-- DROP INDEX `idx_mcmr_message_id` ON `marketing_campanies_mailing_result`;
