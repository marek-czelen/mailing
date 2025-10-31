-- Dodanie pola deleted_at do tabeli databases dla soft delete
ALTER TABLE `databases` ADD COLUMN `deleted_at` DATETIME NULL DEFAULT NULL AFTER `updated_at`;

-- Dodanie indeksu dla poprawy wydajności zapytań
CREATE INDEX idx_databases_deleted_at ON `databases` (`deleted_at`);