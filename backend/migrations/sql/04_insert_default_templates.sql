-- ============================================================
-- MIGRACJA: Dane domyślne - systemowe szablony email
-- Data: 2025-10-31
-- Opis: Wstawia domyślne szablony systemowe do bazy danych
-- ============================================================

-- Szablon 1: Newsletter Firmowy
INSERT INTO `email_templates` (`name`, `description`, `category`, `thumbnail`, `tags`, `author`, `version`, `isSystem`, `isPublic`, `customerId`, `metadata`) VALUES
(
  'Newsletter Firmowy',
  'Profesjonalny szablon newslettera z logo, nagłówkiem i stopką',
  'newsletter',
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjMjE5NkYzIi8+PHJlY3QgeD0iMTAiIHk9IjUwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZTBlMGUwIi8+PHJlY3QgeD0iMTAiIHk9IjgwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZTBlMGUwIi8+PHJlY3QgeD0iMTAiIHk9IjExMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjNGNhZjUwIi8+PC9zdmc+',
  JSON_ARRAY('newsletter', 'firmowy', 'miesięczny'),
  'System',
  '1.0',
  TRUE,
  TRUE,
  NULL,
  JSON_OBJECT(
    'blocks', 8,
    'estimatedHeight', 600,
    'primaryColors', JSON_ARRAY('#2196F3', '#3498db', '#4caf50')
  )
);

-- Bloki dla Newsletter Firmowy
SET @template_id = LAST_INSERT_ID();

INSERT INTO `template_blocks` (`templateId`, `blockType`, `blockOrder`, `content`, `style`) VALUES
(@template_id, 'image', 0, JSON_OBJECT(
  'src', 'https://via.placeholder.com/300x80/2196F3/ffffff?text=LOGO+FIRMY',
  'alt', 'Logo firmy',
  'width', 300,
  'height', 80,
  'url', '',
  'borderRadius', 0
), JSON_OBJECT(
  'marginTop', 0,
  'marginBottom', 32,
  'textAlign', 'center'
)),

(@template_id, 'text', 1, JSON_OBJECT(
  'text', 'Newsletter - Październik 2025',
  'fontSize', 28,
  'color', '#2c3e50',
  'fontWeight', 'bold',
  'fontStyle', 'normal'
), JSON_OBJECT(
  'marginTop', 0,
  'marginBottom', 24,
  'textAlign', 'center'
)),

(@template_id, 'text', 2, JSON_OBJECT(
  'text', 'Witaj w naszym miesięcznym newsletterze! Przygotowaliśmy dla Ciebie najważniejsze informacje z naszej firmy, nowości produktowe oraz ekskluzywne oferty.',
  'fontSize', 16,
  'color', '#333333',
  'fontWeight', 'normal',
  'fontStyle', 'normal'
), JSON_OBJECT(
  'marginTop', 0,
  'marginBottom', 24,
  'textAlign', 'left'
)),

(@template_id, 'text', 3, JSON_OBJECT(
  'text', '🎉 Nowości tego miesiąca',
  'fontSize', 22,
  'color', '#e74c3c',
  'fontWeight', 'bold',
  'fontStyle', 'normal'
), JSON_OBJECT(
  'marginTop', 32,
  'marginBottom', 16,
  'textAlign', 'left'
)),

(@template_id, 'text', 4, JSON_OBJECT(
  'text', '• Nowa wersja naszej aplikacji z ulepszonymi funkcjami\n• Program lojalnościowy dla stałych klientów\n• Rozszerzona oferta produktów ekologicznych\n• Nowe partnerstwa biznesowe',
  'fontSize', 15,
  'color', '#333333',
  'fontWeight', 'normal',
  'fontStyle', 'normal'
), JSON_OBJECT(
  'marginTop', 0,
  'marginBottom', 32,
  'textAlign', 'left'
)),

(@template_id, 'button', 5, JSON_OBJECT(
  'text', 'Zobacz więcej nowości',
  'url', 'https://example.com/nowosci',
  'backgroundColor', '#3498db',
  'textColor', '#ffffff',
  'borderRadius', 6,
  'padding', '14px 28px'
), JSON_OBJECT(
  'marginTop', 0,
  'marginBottom', 40,
  'textAlign', 'center'
)),

(@template_id, 'spacer', 6, JSON_OBJECT(
  'height', 30,
  'backgroundColor', 'transparent',
  'borderRadius', 0
), JSON_OBJECT(
  'marginTop', 0,
  'marginBottom', 0,
  'textAlign', 'center'
)),

(@template_id, 'text', 7, JSON_OBJECT(
  'text', 'Dziękujemy za bycie z nami!\n\nZespół [Nazwa Firmy]\nwww.example.com | kontakt@example.com\n\nJeśli nie chcesz otrzymywać tych wiadomości, możesz się wypisać.',
  'fontSize', 12,
  'color', '#666666',
  'fontWeight', 'normal',
  'fontStyle', 'normal'
), JSON_OBJECT(
  'marginTop', 0,
  'marginBottom', 0,
  'textAlign', 'center'
));

-- Szablon 2: Promocja - Wielka Wyprzedaż
INSERT INTO `email_templates` (`name`, `description`, `category`, `thumbnail`, `tags`, `author`, `version`, `isSystem`, `isPublic`, `customerId`, `metadata`) VALUES
(
  'Promocja - Wielka Wyprzedaż',
  'Atrakcyjny szablon promocyjny z dużym rabatem i call-to-action',
  'promocja',
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNlNzRjM2M7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojYzM0MzMzO3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiLz48dGV4dCB4PSIxMDAiIHk9IjQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiPi01MCU8L3RleHQ+PHJlY3QgeD0iNTAiIHk9IjYwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjZmZmIiByeD0iNSIvPjx0ZXh0IHg9IjEwMCIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNlNzRjM2MiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSJib2xkIj5LVVAgVEVSQVo8L3RleHQ+PC9zdmc+',
  JSON_ARRAY('promocja', 'wyprzedaż', 'rabat', 'ecommerce'),
  'System',
  '1.0',
  TRUE,
  TRUE,
  NULL,
  JSON_OBJECT(
    'blocks', 6,
    'estimatedHeight', 500,
    'primaryColors', JSON_ARRAY('#e74c3c', '#c34333', '#ffffff')
  )
);

-- Bloki dla Promocja - Wielka Wyprzedaż
SET @template_id = LAST_INSERT_ID();

INSERT INTO `template_blocks` (`templateId`, `blockType`, `blockOrder`, `content`, `style`) VALUES
(@template_id, 'text', 0, JSON_OBJECT(
  'text', '🔥 WIELKA WYPRZEDAŻ 🔥',
  'fontSize', 32,
  'color', '#e74c3c',
  'fontWeight', 'bold',
  'fontStyle', 'normal'
), JSON_OBJECT(
  'marginTop', 20,
  'marginBottom', 10,
  'textAlign', 'center'
)),

(@template_id, 'text', 1, JSON_OBJECT(
  'text', 'DO -50% NA WSZYSTKO!',
  'fontSize', 24,
  'color', '#c34333',
  'fontWeight', 'bold',
  'fontStyle', 'normal'
), JSON_OBJECT(
  'marginTop', 0,
  'marginBottom', 20,
  'textAlign', 'center'
)),

(@template_id, 'text', 2, JSON_OBJECT(
  'text', 'Nie przegap tej wyjątkowej okazji! Rabaty do 50% na cały asortyment. Promocja ważna tylko do końca miesiąca.',
  'fontSize', 16,
  'color', '#333333',
  'fontWeight', 'normal',
  'fontStyle', 'normal'
), JSON_OBJECT(
  'marginTop', 0,
  'marginBottom', 30,
  'textAlign', 'center'
)),

(@template_id, 'button', 3, JSON_OBJECT(
  'text', 'KUP TERAZ Z RABATEM',
  'url', 'https://example.com/promocja',
  'backgroundColor', '#e74c3c',
  'textColor', '#ffffff',
  'borderRadius', 8,
  'padding', '16px 32px'
), JSON_OBJECT(
  'marginTop', 0,
  'marginBottom', 20,
  'textAlign', 'center'
)),

(@template_id, 'text', 4, JSON_OBJECT(
  'text', 'Kod promocyjny: WYPRZEDAŻ2025',
  'fontSize', 18,
  'color', '#27ae60',
  'fontWeight', 'bold',
  'fontStyle', 'normal'
), JSON_OBJECT(
  'marginTop', 0,
  'marginBottom', 30,
  'textAlign', 'center'
)),

(@template_id, 'text', 5, JSON_OBJECT(
  'text', '* Promocja ważna do 31.10.2025. Nie łączy się z innymi rabatami.',
  'fontSize', 12,
  'color', '#666666',
  'fontWeight', 'normal',
  'fontStyle', 'italic'
), JSON_OBJECT(
  'marginTop', 20,
  'marginBottom', 0,
  'textAlign', 'center'
));

-- Szablon 3: Powiadomienie - Powitanie
INSERT INTO `email_templates` (`name`, `description`, `category`, `thumbnail`, `tags`, `author`, `version`, `isSystem`, `isPublic`, `customerId`, `metadata`) VALUES
(
  'Powiadomienie - Powitanie',
  'Szablon powitalny dla nowych użytkowników lub klientów',
  'powiadomienie',
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWNmMGYxIi8+PGNpcmNsZSBjeD0iMTAwIiBjeT0iNDAiIHI9IjI1IiBmaWxsPSIjMjdhZTYwIi8+PHRleHQgeD0iMTAwIiB5PSI0NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMjAiPuKckTwvdGV4dD48dGV4dCB4PSIxMDAiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMmMzZTUwIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCI+V2l0YWo8L3RleHQ+PHRleHQgeD0iMTAwIiB5PSIxMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM3ZjhjOGQiIGZvbnQtc2l6ZT0iMTAiPkRaw65rdWplbXkgemEgcmVqZXN0cmFjasW5PC90ZXh0PjxyZWN0IHg9IjcwIiB5PSIxMTUiIHdpZHRoPSI2MCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzM0OThkYiIgcng9IjMiLz48dGV4dCB4PSIxMDAiIHk9IjEyOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iOSI+UG9jemF0ZWs8L3RleHQ+PC9zdmc+',
  JSON_ARRAY('powitanie', 'rejestracja', 'welcome', 'onboarding'),
  'System',
  '1.0',
  TRUE,
  TRUE,
  NULL,
  JSON_OBJECT(
    'blocks', 5,
    'estimatedHeight', 400,
    'primaryColors', JSON_ARRAY('#27ae60', '#3498db', '#2c3e50')
  )
);

-- Bloki dla Powiadomienie - Powitanie
SET @template_id = LAST_INSERT_ID();

INSERT INTO `template_blocks` (`templateId`, `blockType`, `blockOrder`, `content`, `style`) VALUES
(@template_id, 'text', 0, JSON_OBJECT(
  'text', '👋 Witaj!',
  'fontSize', 32,
  'color', '#27ae60',
  'fontWeight', 'bold',
  'fontStyle', 'normal'
), JSON_OBJECT(
  'marginTop', 20,
  'marginBottom', 16,
  'textAlign', 'center'
)),

(@template_id, 'text', 1, JSON_OBJECT(
  'text', 'Dziękujemy za rejestrację!',
  'fontSize', 24,
  'color', '#2c3e50',
  'fontWeight', 'bold',
  'fontStyle', 'normal'
), JSON_OBJECT(
  'marginTop', 0,
  'marginBottom', 24,
  'textAlign', 'center'
)),

(@template_id, 'text', 2, JSON_OBJECT(
  'text', 'Twoje konto zostało pomyślnie utworzone. Teraz możesz korzystać ze wszystkich funkcji naszej platformy.',
  'fontSize', 16,
  'color', '#333333',
  'fontWeight', 'normal',
  'fontStyle', 'normal'
), JSON_OBJECT(
  'marginTop', 0,
  'marginBottom', 32,
  'textAlign', 'center'
)),

(@template_id, 'button', 3, JSON_OBJECT(
  'text', 'Zacznij korzystać',
  'url', 'https://example.com/dashboard',
  'backgroundColor', '#3498db',
  'textColor', '#ffffff',
  'borderRadius', 6,
  'padding', '14px 28px'
), JSON_OBJECT(
  'marginTop', 0,
  'marginBottom', 40,
  'textAlign', 'center'
)),

(@template_id, 'text', 4, JSON_OBJECT(
  'text', 'Jeśli masz pytania, skontaktuj się z nami pod adresem support@example.com',
  'fontSize', 12,
  'color', '#7f8c8d',
  'fontWeight', 'normal',
  'fontStyle', 'normal'
), JSON_OBJECT(
  'marginTop', 20,
  'marginBottom', 0,
  'textAlign', 'center'
));