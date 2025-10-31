-- ============================================================
-- MIGRACJA: Dane domyślne - podstawowe uprawnienia
-- Data: 2025-10-31
-- Opis: Wstawia podstawowe obiekty i funkcje uprawnień
-- ============================================================

-- Obiekty uprawnień
INSERT INTO `permission_objects` (`name`) VALUES
('campaigns'),
('databases'),
('contacts'),
('templates'),
('reports'),
('settings'),
('users')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Funkcje uprawnień
INSERT INTO `permission_function` (`name`) VALUES
('create'),
('read'),
('update'),
('delete'),
('export'),
('import')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Domyślny klient systemowy (opcjonalne)
INSERT INTO `customers` (`id`, `name`, `active`) VALUES
(1, 'System Administrator', TRUE)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Domyślny użytkownik administratora (opcjonalne)
-- Hasło: admin123 (hash bcrypt)
INSERT INTO `users` (`email`, `hash`, `customer_id`) VALUES
('admin@system.local', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1)
ON DUPLICATE KEY UPDATE `hash` = VALUES(`hash`);

-- Pełne uprawnienia dla administratora systemowego
INSERT INTO `permission` (`customer_id`, `permission_objects_id`, `permission_function_id`, `access_level`)
SELECT 1, po.id, pf.id, 5
FROM `permission_objects` po
CROSS JOIN `permission_function` pf
ON DUPLICATE KEY UPDATE `access_level` = VALUES(`access_level`);