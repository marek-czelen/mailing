-- Dodanie konfiguracji SMTP dla kampanii
-- Każda kampania może mieć własne konto SMTP do wysyłania maili

ALTER TABLE marketing_campanies 
ADD COLUMN smtp_host VARCHAR(255) NULL COMMENT 'Host SMTP dla wysyłki kampanii',
ADD COLUMN smtp_port INT NULL COMMENT 'Port SMTP dla wysyłki kampanii',
ADD COLUMN smtp_user VARCHAR(255) NULL COMMENT 'Użytkownik SMTP dla wysyłki kampanii',
ADD COLUMN smtp_pass VARCHAR(255) NULL COMMENT 'Hasło SMTP dla wysyłki kampanii (należy zaszyfrować)',
ADD COLUMN smtp_secure TINYINT(1) DEFAULT 1 COMMENT 'Czy używać TLS/SSL (1=tak, 0=nie)',
ADD COLUMN smtp_allow_self_signed TINYINT(1) DEFAULT 0 COMMENT 'Czy zezwalać na self-signed certificates (1=tak, 0=nie)';

-- Index dla szybkiego sprawdzenia kampanii z konfiguracją SMTP
CREATE INDEX idx_marketing_campanies_smtp_host ON marketing_campanies(smtp_host);

-- Komentarz do tabeli
ALTER TABLE marketing_campanies COMMENT = 'Kampanie marketingowe z własną konfiguracją SMTP do wysyłki i IMAP/POP3 do odbioru odpowiedzi';
