# Konfiguracja kampanii marketingowych

## Przegląd
Każda kampania marketingowa ma własną dedykowaną konfigurację:
- **SMTP** - do wysyłania maili
- **IMAP** - do odbioru odpowiedzi i bounce messages

## Struktura bazy danych

### Tabela: marketing_campanies

#### Pola podstawowe
```sql
id INT PRIMARY KEY AUTO_INCREMENT
customer_id INT NOT NULL
name VARCHAR(255) NOT NULL
subject VARCHAR(255) NULL
description TEXT NULL
sender_name VARCHAR(255) NULL           -- Nazwa nadawcy (From Name)
sender_email VARCHAR(255) NULL          -- Email nadawcy (From Email)
text_content TEXT NULL
html_content MEDIUMTEXT NULL
date_start DATETIME NULL
date_end DATETIME NULL
progress INT NULL
active TINYINT(1) DEFAULT 1
sent TINYINT(1) DEFAULT 0
database_id INT NOT NULL
```

#### Pola SMTP (wysyłka)
```sql
smtp_host VARCHAR(255) NULL              -- Host SMTP (np. smtp.gmail.com)
smtp_port INT NULL                       -- Port SMTP (465/587/25)
smtp_user VARCHAR(255) NULL              -- Użytkownik SMTP (login)
smtp_pass VARCHAR(255) NULL              -- Hasło SMTP (zaszyfrować!)
smtp_secure TINYINT(1) DEFAULT 1         -- TLS/SSL (1=tak, 0=nie)
smtp_allow_self_signed TINYINT(1) DEFAULT 0  -- Self-signed certificates
```

#### Pola IMAP (odbiór odpowiedzi)
```sql
reply_check_enabled TINYINT(1) DEFAULT 0     -- Czy sprawdzać odpowiedzi
reply_mailbox_host VARCHAR(255) NULL         -- Host IMAP
reply_mailbox_port INT DEFAULT 993           -- Port IMAP (993/143)
reply_mailbox_user VARCHAR(255) NULL         -- Użytkownik IMAP
reply_mailbox_pass VARCHAR(255) NULL         -- Hasło IMAP (zaszyfrować!)
reply_mailbox_protocol VARCHAR(50) DEFAULT 'IMAP'  -- Protokół (tylko IMAP)
reply_mailbox_folder VARCHAR(255) DEFAULT 'INBOX'  -- Folder do monitorowania
reply_mailbox_tls TINYINT(1) NULL            -- TLS/SSL
reply_mailbox_allow_self_signed TINYINT(1) DEFAULT 0  -- Self-signed certificates
```

### Migracje

```bash
# Pola SMTP
mysql -u root -p mailing_db < db/migrations/20251110_add_campaign_smtp_config.sql

# Pola IMAP (już istnieją)
mysql -u root -p mailing_db < db/migrations/20251109_add_marketing_campanies_reply_mailbox_fields.sql
```

## Model Sequelize

### MarketingCampanies (pełna struktura)

```javascript
{
  // PODSTAWOWE
  id: Integer (PK),
  customerId: Integer (FK),
  name: String,
  subject: String,
  description: Text,
  
  // NADAWCA (używane jako From w SMTP)
  senderName: String,         // Nazwa nadawcy
  senderEmail: String,        // Email nadawcy
  
  // TREŚĆ
  textContent: Text,
  htmlContent: MediumText,
  
  // HARMONOGRAM
  dateStart: Date,
  dateEnd: Date,
  active: Boolean,
  sent: Boolean,
  progress: Integer,
  
  // BAZA KONTAKTÓW
  databaseId: Integer (FK),
  
  // ============ SMTP (WYSYŁKA) ============
  smtpHost: String,           // Host SMTP
  smtpPort: Integer,          // Port SMTP
  smtpUser: String,           // Login SMTP
  smtpPass: String,           // Hasło SMTP
  smtpSecure: Boolean,        // TLS/SSL
  smtpAllowSelfSigned: Boolean, // Self-signed cert
  
  // ============ IMAP (ODPOWIEDZI) ============
  replyCheckEnabled: Boolean,      // Czy sprawdzać odpowiedzi
  replyMailboxHost: String,        // Host IMAP
  replyMailboxPort: Integer,       // Port IMAP
  replyMailboxUser: String,        // Login IMAP
  replyMailboxPass: String,        // Hasło IMAP
  replyMailboxProtocol: String,    // 'IMAP'
  replyMailboxFolder: String,      // Folder (INBOX)
  replyMailboxTls: Boolean,        // TLS/SSL
  replyMailboxAllowSelfSigned: Boolean  // Self-signed cert
}
```

## Przepływ wysyłki (MailingTask)

### Warunek wysyłki

Kampania **NIE będzie wysyłana** jeśli brakuje któregokolwiek z pól SMTP:
- ❌ `smtp_host`
- ❌ `smtp_port`
- ❌ `smtp_user`
- ❌ `smtp_pass`

### Diagram przepływu

```
┌─────────────────────────────────────────────────────┐
│ MailingTask.sendMails()                             │
│ - Pobiera aktywne kampanie (active=1, sent=0)      │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ Dla każdej kampanii:                                │
│ 1. Sprawdź konfigurację SMTP                        │
│    - Brak smtp_*? → ⚠️ SKIP (pomiń wysyłkę)        │
│    - OK? → kontynuuj                                │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 2. Pobierz aktywne kontakty                         │
│    - WHERE active=1, unsubscribesDate=NULL          │
│    - Filtruj po databaseId                          │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 3. Dla każdego kontaktu:                            │
│    - Użyj SMTP z kampanii                           │
│    - From: senderName <senderEmail>                 │
│    - Dodaj tracking headers (X-Campaign-ID)         │
│    - Wygeneruj Message-ID                           │
│    - Wyślij przez Mail.sendEmail()                  │
│    - Zapisz messageId do mailing_result             │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 4. Zakończenie:                                      │
│    - campaign.sent = true                           │
│    - campaign.save()                                │
└─────────────────────────────────────────────────────┘
```

## Przepływ odbioru odpowiedzi (CheckMailboxTask)

### Warunek sprawdzania

Odpowiedzi są sprawdzane jeśli:
- ✅ `reply_check_enabled = 1`
- ✅ `active = 1`
- ✅ `sent = 1`
- ✅ Wszystkie pola IMAP wypełnione

### Diagram przepływu

```
┌─────────────────────────────────────────────────────┐
│ CheckMailboxTask.checkMailboxes()                   │
│ - Co 60s (domyślnie)                                │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ Dla każdej kampanii z reply_check_enabled=1:       │
│ 1. Połącz z IMAP (reply_mailbox_*)                 │
│ 2. Otwórz folder (reply_mailbox_folder)            │
│ 3. Wyszukaj nieprzeczytane (UNSEEN)                │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ Dla każdej wiadomości:                              │
│ 1. Pobierz envelope + headers                       │
│ 2. Wykryj bounce (detectBounce)                     │
│    - Analiza nagłówków (Auto-Submitted, DSN)       │
│    - Analiza From (MAILER-DAEMON)                   │
│    - System punktowy (min 2 pkt)                    │
│ 3. Ekstrahuj oryginalny Message-ID (z załączników) │
│ 4. Mapuj do kampanii (In-Reply-To/References)      │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ Zapis do bazy:                                       │
│ 1. Utwórz campaign_replies                          │
│    - isBounce, bounceType, bounceReason             │
│ 2. Jeśli bounce → aktualizuj mail_addresses         │
│    - Hard: active=0 (natychmiast)                   │
│    - Soft: active=0 (po 3 bounce)                   │
│    - Unknown: active=0 (po 3 bounce)                │
│ 3. Oznacz wiadomość jako przeczytaną (\\Seen)       │
└─────────────────────────────────────────────────────┘
```

## Przykłady konfiguracji

### Gmail (SMTP + IMAP)

```json
{
  "sender_name": "Newsletter Team",
  "sender_email": "your-email@gmail.com",
  
  "smtp_host": "smtp.gmail.com",
  "smtp_port": 587,
  "smtp_user": "your-email@gmail.com",
  "smtp_pass": "your-app-password",
  "smtp_secure": false,
  "smtp_allow_self_signed": false,
  
  "reply_check_enabled": true,
  "reply_mailbox_host": "imap.gmail.com",
  "reply_mailbox_port": 993,
  "reply_mailbox_user": "your-email@gmail.com",
  "reply_mailbox_pass": "your-app-password",
  "reply_mailbox_protocol": "IMAP",
  "reply_mailbox_folder": "INBOX",
  "reply_mailbox_tls": true,
  "reply_mailbox_allow_self_signed": false
}
```

### Office 365 (SMTP + IMAP)

```json
{
  "sender_name": "Marketing Team",
  "sender_email": "marketing@company.com",
  
  "smtp_host": "smtp.office365.com",
  "smtp_port": 587,
  "smtp_user": "marketing@company.com",
  "smtp_pass": "your-password",
  "smtp_secure": false,
  "smtp_allow_self_signed": false,
  
  "reply_check_enabled": true,
  "reply_mailbox_host": "outlook.office365.com",
  "reply_mailbox_port": 993,
  "reply_mailbox_user": "marketing@company.com",
  "reply_mailbox_pass": "your-password",
  "reply_mailbox_protocol": "IMAP",
  "reply_mailbox_folder": "INBOX",
  "reply_mailbox_tls": true,
  "reply_mailbox_allow_self_signed": false
}
```

### Własny serwer (self-signed certificate)

```json
{
  "sender_name": "Internal News",
  "sender_email": "news@internal.local",
  
  "smtp_host": "mail.internal.local",
  "smtp_port": 465,
  "smtp_user": "news",
  "smtp_pass": "password",
  "smtp_secure": true,
  "smtp_allow_self_signed": true,
  
  "reply_check_enabled": true,
  "reply_mailbox_host": "mail.internal.local",
  "reply_mailbox_port": 993,
  "reply_mailbox_user": "news",
  "reply_mailbox_pass": "password",
  "reply_mailbox_protocol": "IMAP",
  "reply_mailbox_folder": "INBOX",
  "reply_mailbox_tls": true,
  "reply_mailbox_allow_self_signed": true
}
```

### Różne konta (SMTP ≠ IMAP)

```json
{
  "sender_name": "Newsletter",
  "sender_email": "newsletter@company.com",
  
  "smtp_host": "smtp.sendgrid.net",
  "smtp_port": 587,
  "smtp_user": "apikey",
  "smtp_pass": "SG.xxxxx",
  "smtp_secure": false,
  "smtp_allow_self_signed": false,
  
  "reply_check_enabled": true,
  "reply_mailbox_host": "imap.gmail.com",
  "reply_mailbox_port": 993,
  "reply_mailbox_user": "replies@company.com",
  "reply_mailbox_pass": "app-password",
  "reply_mailbox_protocol": "IMAP",
  "reply_mailbox_folder": "INBOX",
  "reply_mailbox_tls": true,
  "reply_mailbox_allow_self_signed": false
}
```

## Walidacja w UI

### Przed zapisaniem kampanii

**SMTP (wymagane do wysyłki):**
1. ✅ `smtp_host` - niepuste
2. ✅ `smtp_port` - liczba całkowita (25, 465, 587, 2525)
3. ✅ `smtp_user` - niepuste
4. ✅ `smtp_pass` - niepuste
5. ✅ `sender_email` - prawidłowy format email
6. ✅ `sender_name` - niepuste

**IMAP (opcjonalne, dla reply_check_enabled=true):**
1. ✅ `reply_mailbox_host` - niepuste
2. ✅ `reply_mailbox_port` - liczba całkowita (993, 143)
3. ✅ `reply_mailbox_user` - niepuste
4. ✅ `reply_mailbox_pass` - niepuste

### Test połączenia (zalecane)

Przed uruchomieniem kampanii, przetestuj połączenia:

**Frontend - użyj dedykowanych endpointów:**
```javascript
// Test SMTP
const testSmtp = async (config) => {
  const response = await fetch('/mailing/test-smtp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      host: config.smtpHost,
      port: config.smtpPort,
      user: config.smtpUser,
      pass: config.smtpPass,
      secure: config.smtpSecure,
      allowSelfSigned: config.smtpAllowSelfSigned
    })
  });
  return await response.json();
};

// Test IMAP
const testImap = async (config) => {
  const response = await fetch('/mailing/test-imap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      host: config.replyMailboxHost,
      port: config.replyMailboxPort,
      user: config.replyMailboxUser,
      pass: config.replyMailboxPass,
      tls: config.replyMailboxTls,
      allowSelfSigned: config.replyMailboxAllowSelfSigned,
      folder: config.replyMailboxFolder || 'INBOX'
    })
  });
  return await response.json();
};
```

**Walidacja w UI:**
1. **SMTP** - pokaż zielony/czerwony status po teście
2. **IMAP** - wyświetl liczbę wiadomości w folderze
3. **Blokuj zapis** - jeśli test nie przejdzie

## Bezpieczeństwo

### Szyfrowanie haseł

⚠️ **KRYTYCZNE:** Hasła (`smtp_pass`, `reply_mailbox_pass`) powinny być zaszyfrowane!

**Zalecane rozwiązanie:** AES-256-CBC

```javascript
import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32 bytes
const iv = crypto.randomBytes(16);

function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedText) {
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encrypted = parts.join(':');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

### Uprawnienia

Tylko administratorzy i właściciele kampanii:
- ✅ Odczyt konfiguracji SMTP/IMAP
- ✅ Modyfikacja danych
- ⚠️ Hasła wyświetlaj jako `***********`

## Troubleshooting

### SMTP - Kampania nie wysyła

**Symptomy:**
```
⚠️ Kampania 123: Brak konfiguracji SMTP - pomijam wysyłkę
```

**Rozwiązanie:**
1. Sprawdź czy wszystkie 4 pola SMTP są wypełnione
2. Sprawdź czy `active=1` i `sent=0`
3. Sprawdź logi MailingTask

### SMTP - Invalid login

**Symptomy:**
```
❌ Błąd wysyłki: Invalid login
```

**Rozwiązanie:**
- Gmail: użyj App Password (nie zwykłe hasło)
- Office365: włącz SMTP AUTH
- Własny serwer: sprawdź użytkownika/hasło

### SMTP - Timeout

**Symptomy:**
```
Error: Connection timeout
```

**Rozwiązanie:**
- Sprawdź firewall (port 587/465 otwarty)
- Sprawdź DNS (czy smtp_host się rozwiązuje)
- Zwiększ timeout w nodemailer

### IMAP - Nie wykrywa odpowiedzi

**Symptomy:**
```
📥 [CheckMailboxTask] Kampania X - brak nowych wiadomości
```

**Rozwiązanie:**
1. Sprawdź czy `reply_check_enabled=1`
2. Sprawdź czy kampania wysłana (`sent=1`)
3. Sprawdź folder (`reply_mailbox_folder`)
4. Sprawdź czy wiadomości oznaczone jako nieprzeczytane

### IMAP - Błędne mapowanie do kampanii

**Symptomy:**
```
❓ [ProcessReply] Fallback: brak kontaktu dla email@... (databaseId=X)
```

**Przyczyna:**
- Message-ID w bazie: `<123.abc@host>` (z nawiasami)
- In-Reply-To z IMAP: `123.abc@host` (bez nawiasów)
- Nie pasują, więc nie znajduje kampanii

**Rozwiązanie:**
- System automatycznie normalizuje Message-ID (dodaje `<>` jeśli brakuje)
- Sprawdź logi czy Message-ID są poprawnie zapisywane:
  ```
  ✉️ [MailingTask] Wysłano: ... messageId=<123.abc@host>
  🎯 [ProcessReply] Mapowanie po Message-ID => campaignId=X
  ```

### IMAP - Self-signed certificate

**Symptomy:**
```
❌ IMAP error: self signed certificate in certificate chain
```

**Rozwiązanie:**
- Ustaw `reply_mailbox_allow_self_signed=1`

## Logi systemowe

### SMTP - Sukces

```
📤 [MailingTask] Kampania 123: SMTP smtp.gmail.com:587 user=test@gmail.com secure=false allowSelfSigned=false
Kampania Newsletter (klient 1): znaleziono 150 adresów do wysyłki
✉️ [MailingTask] Wysłano: campaignId=123 mailAddressId=456 messageId=<abc@...>
Kampania Newsletter (klient 1): wysyłka zakończona
```

### IMAP - Sukces

```
📥 [CheckMailboxTask] Start mailbox scan @ 2025-11-10T10:30:00.000Z
🔧 [CheckMailboxTask] Kampania 123 proto=IMAP host=imap.gmail.com port=993 tls=true
➡️ [IMAP] Connecting secure=true allowSelfSigned=false
✅ [IMAP] Connected in 1234ms
📂 [IMAP] Opened mailbox INBOX
🔎 [IMAP] Found UNSEEN count=5
✉️ [IMAP] uid=12345 from=user@example.com subj='Re: Newsletter'
🎯 [ProcessReply] Mapowanie po Message-ID => campaignId=123, mailAddressId=456
✅ [ProcessReply] Zapisano odpowiedź: campaignId=123 from=user@example.com
📊 [ProcessReply] Kampania 123: zapisano=5, duplikaty=0, błędy=0, łącznie=5
```

### Bounce - Wykrycie

```
🔴 [ProcessReply] Bounce wykryty! type=hard reason='user unknown' from=MAILER-DAEMON@...
🔍 [ProcessReply] BOUNCE: szukam Message-ID w załącznikach...
✅ [ProcessReply] BOUNCE: znaleziono oryginalny Message-ID: <abc@...>
🔴 [ProcessReply] BOUNCE mapping: mail_address_id=456 dla invalid@example.com
🚫 [ProcessReply] HARD BOUNCE: Dezaktywowano kontakt mailAddressId=456 count=1
```

## Best Practices

### SMTP
1. **App Passwords** - użyj dedykowanych haseł aplikacji (Gmail, Office365)
2. **Limity wysyłki** - respektuj limity dostawcy
3. **Rate limiting** - dodaj opóźnienia (MAILING_SEND_DELAY=100ms)
4. **Monitoring** - śledź bounce rate i delivery rate
5. **Testuj przed wysyłką** - zawsze wyślij test przed kampanią

### IMAP
1. **Osobne konto** - dedykowane konto tylko do odpowiedzi
2. **Interwał sprawdzania** - 60s (CHECK_MAILBOX_INTERVAL)
3. **Folder dedykowany** - używaj osobnego folderu, nie INBOX
4. **Bounce handling** - monitoruj i reaguj na bounce
5. **Debug mode** - włącz CHECK_MAILBOX_DEBUG=true podczas testów

### Ogólne
1. **Szyfrowanie haseł** - zawsze szyfruj smtp_pass i reply_mailbox_pass
2. **Backup konfiguracji** - zachowaj kopię działającej konfiguracji
3. **Dokumentacja** - dokumentuj nietypowe konfiguracje
4. **Testy end-to-end** - przetestuj pełny cykl: wysyłka → odpowiedź → bounce

## Zmienne środowiskowe

```env
# MailingTask
MAILING_TASK_INTERVAL=60000        # Interwał sprawdzania (60s)
MAILING_SEND_DELAY=100             # Opóźnienie między mailami (100ms)

# CheckMailboxTask
CHECK_MAILBOX_INTERVAL=60000       # Interwał sprawdzania (60s)
CHECK_MAILBOX_DEBUG=true           # Debug mode (szczegółowe logi)
CHECK_MAILBOX_FETCH_TIMEOUT=120000 # Timeout IMAP (120s)

# Encryption (dla haseł)
ENCRYPTION_KEY=your-32-byte-hex-key  # Klucz AES-256
```

## API Endpoints

### Testy połączeń
- `POST /mailing/test-smtp` - test połączenia SMTP
- `POST /mailing/test-imap` - test połączenia IMAP

#### Test SMTP
**Request:**
```json
POST /mailing/test-smtp
{
  "host": "smtp.gmail.com",
  "port": 587,
  "user": "test@gmail.com",
  "pass": "app-password",
  "secure": false,
  "allowSelfSigned": false
}
```

**Response (sukces):**
```json
{
  "success": true,
  "message": "Połączenie SMTP udane",
  "duration": 1234,
  "config": {
    "host": "smtp.gmail.com",
    "port": 587,
    "user": "test@gmail.com",
    "secure": false,
    "allowSelfSigned": false
  }
}
```

**Response (błąd):**
```json
{
  "success": false,
  "error": "Invalid login: 535-5.7.8 Username and Password not accepted",
  "code": "EAUTH",
  "command": "AUTH PLAIN"
}
```

#### Test IMAP
**Request:**
```json
POST /mailing/test-imap
{
  "host": "imap.gmail.com",
  "port": 993,
  "user": "test@gmail.com",
  "pass": "app-password",
  "tls": true,
  "allowSelfSigned": false,
  "folder": "INBOX"
}
```

**Response (sukces):**
```json
{
  "success": true,
  "message": "Połączenie IMAP udane",
  "duration": 2345,
  "mailbox": {
    "folder": "INBOX",
    "totalMessages": 150,
    "newMessages": 5,
    "unseenMessages": 12
  },
  "config": {
    "host": "imap.gmail.com",
    "port": 993,
    "user": "test@gmail.com",
    "tls": true,
    "allowSelfSigned": false,
    "folder": "INBOX"
  }
}
```

**Response (błąd):**
```json
{
  "success": false,
  "error": "Unable to connect. Reason: connect ETIMEDOUT",
  "code": "ETIMEDOUT"
}
```

### Odpowiedzi (prawidłowe)
- `GET /mailing/campaigns/:campaignId/replies` - lista odpowiedzi
- `GET /mailing/replies/:replyId` - szczegóły odpowiedzi
- `GET /mailing/replies/:replyId/full` - pełna treść (MIME parsed)

### Bounce messages
- `GET /mailing/campaigns/:campaignId/bounces` - lista bounce
- `GET /mailing/campaigns/:campaignId/replies/stats` - statystyki (bounce rate)

Więcej w: `BOUNCE_HANDLING.md`, `CAMPAIGN_REPLIES_API.md`
