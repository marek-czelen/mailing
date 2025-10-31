-- ============================================================
-- MIGRACJA: Indeksy wydajnościowe
-- Data: 2025-10-31
-- Opis: Dodaje dodatkowe indeksy dla poprawy wydajności zapytań
-- ============================================================

-- Indeksy dla tabeli mail_addresses (najczęściej używanej)
CREATE INDEX IF NOT EXISTS `idx_mail_addresses_composite_active` ON `mail_addresses` (`customer_id`, `active`, `database_id`);
CREATE INDEX IF NOT EXISTS `idx_mail_addresses_unsubscribe` ON `mail_addresses` (`unsubscribes_date`);
CREATE INDEX IF NOT EXISTS `idx_mail_addresses_created` ON `mail_addresses` (`created_at`);

-- Indeksy dla tabeli marketing_campanies
CREATE INDEX IF NOT EXISTS `idx_marketing_campanies_created` ON `marketing_campanies` (`created_at`);
CREATE INDEX IF NOT EXISTS `idx_marketing_campanies_composite` ON `marketing_campanies` (`customer_id`, `created_at`);

-- Indeksy dla tabeli databases
CREATE INDEX IF NOT EXISTS `idx_databases_composite_active` ON `databases` (`customer_id`, `deleted_at`);
CREATE INDEX IF NOT EXISTS `idx_databases_created` ON `databases` (`created_at`);

-- Indeksy dla tabeli email_templates
CREATE INDEX IF NOT EXISTS `idx_templates_composite_search` ON `email_templates` (`category`, `isPublic`, `deletedAt`);
CREATE INDEX IF NOT EXISTS `idx_templates_customer_active` ON `email_templates` (`customerId`, `deletedAt`);
CREATE INDEX IF NOT EXISTS `idx_templates_created` ON `email_templates` (`createdAt`);

-- Indeksy dla tabeli template_blocks
CREATE INDEX IF NOT EXISTS `idx_blocks_composite` ON `template_blocks` (`templateId`, `blockOrder`, `blockType`);

-- Indeksy dla tabeli marketing_campanies_mailing (wydajność raportów)
CREATE INDEX IF NOT EXISTS `idx_mcm_composite_send` ON `marketing_campanies_mailing` (`marketing_campanies_id`, `is_send`);
CREATE INDEX IF NOT EXISTS `idx_mcm_composite_read` ON `marketing_campanies_mailing` (`marketing_campanies_id`, `is_readed`);
CREATE INDEX IF NOT EXISTS `idx_mcm_response_date` ON `marketing_campanies_mailing` (`respons_data`);

-- Indeksy dla tabeli permission (autoryzacja)
CREATE INDEX IF NOT EXISTS `idx_permission_composite_auth` ON `permission` (`customer_id`, `permission_objects_id`, `permission_function_id`);