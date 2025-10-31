-- ============================================================
-- SKRYPT MASTER: Uruchamia wszystkie migracje w odpowiedniej kolejności
-- Data: 2025-10-31
-- Opis: Główny plik do wykonania wszystkich migracji systemu mailingowego
-- ============================================================

-- USTAWIENIA POCZĄTKOWE
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- Ustawienia dla obsługi UTF-8
SET NAMES utf8mb4;

-- Sprawdź wersję MySQL
SELECT VERSION() as mysql_version;

-- ============================================================
-- WYKONANIE MIGRACJI W ODPOWIEDNIEJ KOLEJNOŚCI
-- ============================================================

-- 1. Tworzenie podstawowych tabel
SOURCE 01_create_base_tables.sql;

-- 2. Tworzenie systemu szablonów email
SOURCE 02_create_email_templates.sql;

-- 3. Wstawianie podstawowych uprawnień
SOURCE 03_insert_default_permissions.sql;

-- 4. Wstawianie domyślnych szablonów
SOURCE 04_insert_default_templates.sql;

-- 5. Tworzenie indeksów wydajnościowych
SOURCE 05_create_performance_indexes.sql;

-- 6. Tworzenie triggerów i procedur składowanych
SOURCE 06_create_triggers_procedures.sql;

-- ============================================================
-- WERYFIKACJA MIGRACJI
-- ============================================================

-- Sprawdź utworzone tabele
SHOW TABLES;

-- Sprawdź liczbę rekordów w kluczowych tabelach
SELECT 'customers' as table_name, COUNT(*) as record_count FROM customers
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'email_templates', COUNT(*) FROM email_templates
UNION ALL
SELECT 'template_blocks', COUNT(*) FROM template_blocks
UNION ALL
SELECT 'permission_objects', COUNT(*) FROM permission_objects
UNION ALL
SELECT 'permission_function', COUNT(*) FROM permission_function;

-- Sprawdź systemowe szablony
SELECT 
    id, 
    name, 
    category, 
    isSystem, 
    isPublic,
    (SELECT COUNT(*) FROM template_blocks WHERE templateId = et.id) as blocks_count
FROM email_templates et 
WHERE isSystem = TRUE;

-- Sprawdź triggery
SHOW TRIGGERS;

-- Sprawdź procedury składowane
SHOW PROCEDURE STATUS WHERE Db = DATABASE();

COMMIT;

-- ============================================================
-- INFORMACJE KOŃCOWE
-- ============================================================

SELECT 'MIGRACJA ZAKOŃCZONA POMYŚLNIE' as status;
SELECT 'Sprawdź logi powyżej dla potwierdzenia poprawności migracji' as info;