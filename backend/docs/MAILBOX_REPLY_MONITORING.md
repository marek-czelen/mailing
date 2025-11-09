# Monitorowanie odpowiedzi kampanii – CheckMailboxTask

## Cel
Automatyczne wykrywanie odpowiedzi (replies) przychodzących na dedykowane skrzynki pocztowe skonfigurowane dla kampanii marketingowych. Pozwala to w przyszłości na:
- zapis interakcji z klientem
- aktualizację scoringu / statusu subskrybenta
- integrację z CRM lub webhookami

## Architektura
- Zadanie cykliczne: `CheckMailboxTask` (`src/tasks/checkMailbox.js`)
- Model kampanii: `MarketingCampanies` (`src/models/marketingCampanies.model.js`)
- Migracja SQL dodająca pola: `db/migrations/20251109_add_marketing_campanies_reply_mailbox_fields.sql`
- Kontroler kampanii (`src/controller/mailing.js`) obsługuje tworzenie i aktualizację pól konfiguracji.

## Pola w modelu `marketing_campanies`
| Pole | Typ | Domyślna wartość | Opis |
|------|-----|------------------|------|
| reply_check_enabled | BOOLEAN | false | Czy kampania ma aktywne sprawdzanie skrzynki pocztowej. |
| reply_mailbox_host | VARCHAR(255) | NULL | Host serwera pocztowego (IMAP/POP3). |
| reply_mailbox_port | INT | 993 | Port serwera. Typowo: IMAP 143 (bez TLS) lub 993 (TLS), POP3 110 (bez TLS) lub 995 (TLS). |
| reply_mailbox_user | VARCHAR(255) | NULL | Nazwa użytkownika do logowania. |
| reply_mailbox_pass | VARCHAR(255) | NULL | Hasło (obecnie nieszyfrowane – zalecane szyfrowanie w przyszłości). |
| reply_mailbox_protocol | VARCHAR(16) | 'IMAP' | Protokół: 'IMAP' lub 'POP3'. Inne wartości ignorowane. |
| reply_mailbox_folder | VARCHAR(64) | 'INBOX' | Folder do monitorowania (IMAP). Przy POP3 ignorowane (POP3 nie obsługuje folderów). |
| reply_mailbox_tls | TINYINT(1) NULL | NULL | Jawna informacja czy używać TLS. NULL oznacza autodetekcję na podstawie portu (993→IMAP TLS, 995→POP3 TLS). True/False wymusza zachowanie. |
| reply_mailbox_allow_self_signed | TINYINT(1) | 0 | Jeśli true – akceptuj self-signed certyfikaty (wyłącza rejectUnauthorized przy IMAP lub tlserrs przy POP3). |

## Migracja
Plik: `20251109_add_marketing_campanies_reply_mailbox_fields.sql` dodaje wszystkie wymienione pola oraz indeks:
```sql
CREATE INDEX idx_marketing_campaigns_reply_active ON `marketing_campanies` (`reply_check_enabled`, `active`, `sent`);
```
Indeks przyspiesza wyszukiwanie kampanii kwalifikujących się do sprawdzania skrzynek.

## Logika zadania
1. Interwał pobierany z `CHECK_MAILBOX_INTERVAL` (ms), domyślnie 60000 jeśli brak w ENV.
2. W każdym cyklu pobiera kampanie spełniające warunki:
   - `reply_check_enabled = true`
   - `active = true`
   - `sent = true` (sprawdzane są tylko kampanie, które zostały wysłane)
   - `date_start <= NOW()` (opcjonalnie można rozszerzyć o `date_end >= NOW()`).
3. Dla każdej kampanii:
   - Walidacja podstawowej konfiguracji: host/user/pass.
   - Wybór protokołu (IMAP/POP3).
   - Ustalenie TLS:
     - Jeśli `reply_mailbox_tls` jest `true` → wymusza TLS.
     - Jeśli `false` → wymusza brak TLS.
     - Jeśli `NULL` → autodetekcja na podstawie portu (993/995 → TLS, inaczej brak TLS).
   - Ustalenie zachowania certyfikatów:
     - `reply_mailbox_allow_self_signed = true` → IMAP: `rejectUnauthorized=false`; POP3: `tlserrs=false`.
4. Pobieranie wiadomości:
   - IMAP: nieprzeczytane wiadomości (`UNSEEN`), maksymalnie 10 ostatnich.
     - Odczyt `envelope` (from, subject, messageId, internalDate) → generacja hash (SHA1 z messageId/uid).
     - Oznaczenie jako SEEN po pobraniu.
   - POP3: pobierane ostatnie 5 wiadomości (retr). Parsowane nagłówki: Subject, From, Date, Message-ID.
5. Logowanie każdej wykrytej odpowiedzi (docelowo zapis w tabeli).

## Struktura danych pojedynczej odpowiedzi
```json
// IMAP przykładowy
{
  "uid": 123,
  "subject": "Re: Oferta",
  "from": "klient@example.com",
  "date": "2025-11-09T11:00:00.000Z",
  "messageId": "<abc123@example.com>",
  "hash": "f52d6e..."
}
// POP3 przykładowy
{
  "index": 42,
  "subject": "Odp: Newsletter",
  "from": "klient@example.com",
  "date": "Sun, 09 Nov 2025 12:05:13 +0100",
  "messageId": "<pop3msg42@example.com>",
  "hash": "0afc21..."
}
```

## Tabela `campaign_replies` (zapis odpowiedzi)
Każda wykryta odpowiedź jest zapisywana w bazie. Schemat:

| Kolumna | Typ | Opis |
|---------|-----|------|
| id | INT UNSIGNED PK AI | Unikalny identyfikator odpowiedzi. |
| campaign_id | INT NOT NULL FK | ID kampanii, której dotyczy odpowiedź. |
| mail_address_id | INT NULL FK | ID kontaktu z `mail_address` (jeśli znaleziony w bazie kampanii). |
| from_email | VARCHAR(320) NOT NULL | Adres email nadawcy odpowiedzi (oczyszczony z formatowania). |
| subject | VARCHAR(500) NULL | Temat wiadomości. |
| received_at | DATETIME NOT NULL | Data odebrania odpowiedzi (z nagłówka Date lub bieżąca). |
| message_id | VARCHAR(500) NULL UNIQUE | Message-ID z nagłówka (deduplikacja). |
| reply_hash | VARCHAR(64) NOT NULL UNIQUE | SHA1 hash z message_id lub uid (główna deduplikacja). |
| body_preview | TEXT NULL | Opcjonalny fragment treści wiadomości (do przyszłej implementacji). |
| created_at | TIMESTAMP DEFAULT NOW | Timestamp zapisu w bazie. |

**Indeksy:**
- UNIQUE na `message_id` i `reply_hash` (deduplikacja).
- INDEX na `campaign_id`, `mail_address_id`, `from_email`, `received_at` (wydajność).

**Klucze obce:**
- `campaign_id` → `marketing_campanies.id` (CASCADE delete).
- `mail_address_id` → `mail_address.id` (SET NULL delete).

## Model `CampaignReply`
Plik: `src/models/campaignReply.model.js`

Relacje:
- `belongsTo(MarketingCampanies)` jako `Campaign`.
- `belongsTo(MailAddress)` jako `MailAddress`.

Deduplikacja: przy zapisie sprawdzane jest `reply_hash` – jeśli istnieje, odpowiedź jest pomijana (logowana jako duplikat).

## Logika przetwarzania odpowiedzi (`processReplies`)
1. Dla każdej odebranej wiadomości:
   - Sprawdź deduplikację (`CampaignReply.findOne({ where: { replyHash: hash } })`).
   - Jeśli duplikat → pomiń, licz jako `duplicates`.
2. Parsuj adres email (usunięcie formatowania `Name <email>`).
3. Szukaj `mail_address_id` w bazie kontaktów kampanii:
   - `MailAddress.findOne({ where: { databaseId: campaign.databaseId, mail_address: cleanEmail } })`.
   - Jeśli znaleziono → przypisz `mail_address_id`, jeśli nie → `NULL`.
4. Parsuj datę `received_at` (z nagłówka `Date` lub bieżąca).
5. Zapisz `CampaignReply.create(...)`.
6. Loguj statystyki: zapisane, duplikaty, błędy.

**Obsługa wielu odpowiedzi z tego samego adresu:**
- Każda odpowiedź ma unikalny `reply_hash` (oparty na `message_id` lub uid), więc wielokrotne odpowiedzi z jednego adresu są zapisywane osobno.
- Dzięki relacji `mail_address_id` można łatwo wyszukać wszystkie odpowiedzi danego kontaktu w ramach kampanii.

## Przykładowe zapytania SQL
**Wszystkie odpowiedzi dla kampanii:**
```sql
SELECT * FROM campaign_replies WHERE campaign_id = 27 ORDER BY received_at DESC;
```

**Odpowiedzi przypisane do konkretnego kontaktu:**
```sql
SELECT cr.*, ma.mail_address, ma.nazwa_firmy 
FROM campaign_replies cr
JOIN mail_address ma ON cr.mail_address_id = ma.id
WHERE cr.campaign_id = 27 AND ma.id = 123;
```

**Liczba odpowiedzi per kampania:**
```sql
SELECT campaign_id, COUNT(*) as reply_count 
FROM campaign_replies 
GROUP BY campaign_id;
```

**Niezidentyfikowane odpowiedzi (brak powiązania z kontaktem):**
```sql
SELECT * FROM campaign_replies WHERE mail_address_id IS NULL;
```

## Przykład tworzenia kampanii (JSON body)
```json
{
  "name": "Jesienna Promocja",
  "databaseId": 5,
  "replyCheckEnabled": true,
  "replyMailboxHost": "mail.firma.pl",
  "replyMailboxPort": 993,
  "replyMailboxUser": "reply@firma.pl",
  "replyMailboxPass": "sekret",
  "replyMailboxProtocol": "IMAP",
  "replyMailboxFolder": "INBOX",
  "replyMailboxTls": true,
  "replyMailboxAllowSelfSigned": true
}
```

## Walidacja (do wdrożenia)
Przy włączonym `replyCheckEnabled` powinna być egzekwowana obecność: host, port, user, pass. Wciąż do zaimplementowania w kontrolerze (ToDo).

## Zmienne środowiskowe
| Zmienna | Domyślna | Opis |
|---------|----------|------|
| CHECK_MAILBOX_INTERVAL | 60000 | Interwał cyklu sprawdzania skrzynek (ms). |

## Ograniczenia bieżącej wersji
- Brak parsowania pełnej treści wiadomości (`body_preview` obecnie `NULL`).
- Brak szyfrowania hasła skrzynki (`reply_mailbox_pass`).
- Brak retry/backoff przy błędach sieciowych.
- Brak webhooków/eventów przy wykryciu odpowiedzi.

## Planowane rozszerzenia (propozycje)
1. Parsowanie pełnej treści wiadomości (body_preview) – ekstrakcja tekstu z HTML/plain text.
2. Szyfrowanie hasła (ENV: KEY / libsodium / AES-256-GCM).
3. Webhook / event emitter po wykryciu odpowiedzi (integracja z zewnętrznymi systemami).
4. Limitowane pobieranie tylko nowych UID (cache ostatniego UID w kampanii – optymalizacja IMAP).
5. Mechanizm automatycznego oznaczania kontaktu jako "odpowiedział" (pole `replied_at` w `mail_address`).
6. Dashboard / endpoint API do przeglądania odpowiedzi kampanii (GET /campaigns/:id/replies).
7. Analiza sentymentu / kategoryzacja odpowiedzi (AI/ML).

## Bezpieczeństwo
- Hasło skrzynki należy traktować jako dane wrażliwe: zalecane szyfrowanie lub osobny vault.
- Przy `replyMailboxAllowSelfSigned=true` osłabiona jest walidacja certyfikatów – używać tylko w środowiskach kontrolowanych.

## Debugowanie
- W trybie development (`NODE_ENV=development`) dodatkowe logi: start skanu, brak kampanii, brak wiadomości.
- Typowe błędy: błędne host/port (ECONNREFUSED), certyfikat (SELF_SIGNED_CERT_IN_CHAIN), zły folder IMAP (NO response).

## Szybki test (manualny)
1. Skonfiguruj kampanię z poprawnym hostem IMAP.
2. Ustaw `replyCheckEnabled=true`.
3. Uruchom backend i poczekaj na log `Start mailbox scan`.
4. Wyślij mail testowy na skrzynkę – powinien pojawić się log `📬 [Reply] kampania=...`.

## FAQ
**Dlaczego POP3 przyjmuje tylko ostatnie kilka wiadomości?** – Brak flag, więc ograniczamy liczbę pobrań, aby zmniejszyć koszt sieciowy.
**Czy można pobrać pełne treści?** – Tak, w IMAP wystarczy rozszerzyć `fetchOne` o `bodyStructure` i później `download`. W POP3 już mamy całość w `retr`, trzeba wydzielić nagłówki/treść.
**Czy TLS automatycznie działa na niestandardowych portach?** – Jeśli `replyMailboxTls` jest ustawione jawnie – wymusza zachowanie niezależnie od portu.

---
_Dokument wygenerowany automatycznie na podstawie aktualnej implementacji (2025-11-09)._