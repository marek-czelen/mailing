# Bounce Handling - Dokumentacja

## Przegląd
System automatycznego wykrywania i obsługi odbić emaili (bounce messages) w CheckMailboxTask.

## Rodzaje bounce

### 1. Hard Bounce (Permanent Failure)
Błędy permanentne - email nie może zostać dostarczony:
- **User unknown** - użytkownik nie istnieje
- **Mailbox unavailable** - skrzynka niedostępna
- **Domain not found** - domena nie istnieje
- **Address rejected** - adres odrzucony
- **Kody DSN**: 5.1.1, 5.1.2, 5.4.4

**Akcja**: Natychmiastowa dezaktywacja kontaktu (`active=0`)

### 2. Soft Bounce (Temporary Failure)
Błędy tymczasowe - email może być dostarczony później:
- **Mailbox full** - pełna skrzynka
- **Server timeout** - timeout serwera
- **Temporary failure** - tymczasowy błąd
- **Quota exceeded** - przekroczony limit
- **Kody DSN**: 4.2.2, 4.4.1, 4.4.2

**Akcja**: Dezaktywacja po 3 soft bounces

### 3. Unknown Bounce
Bounce wykryty, ale typ nieznany.

**Akcja**: Zapisanie informacji bez dezaktywacji

## Wykrywanie bounce

### System punktowy (minimum 2 punkty dla bounce)

**Silne wskaźniki (2 punkty każdy):**
- **X-Failed-Recipients** - nagłówek z adresem odbiorcy
- **Content-Type**: `multipart/report; report-type=delivery-status` (RFC 3464 DSN)
- **From**: `MAILER-DAEMON@` lub `postmaster@`

**Średnie wskaźniki (1 punkt każdy):**
- **Auto-Submitted**: `auto-generated` (nie `auto-replied` - to OOO)
- **Return-Path**: `<>` + temat sugerujący bounce
- **Subject**: silne frazy bounce (delivery status notification, mail delivery failed, etc.)

### Ekstrakcja adresu odbiorcy

System próbuje wyodrębnić adres odbiorcy (który spowodował bounce) z:

**1. Nagłówki SMTP/MIME:**
- `X-Failed-Recipients`
- `X-Actual-Recipient`
- `Final-Recipient`
- `Original-Recipient`
- `Subject` (wzorce: `<email@domain.com>`)

**2. Treść wiadomości (jeśli nagłówki nie zawierają):**
- Parsowanie HTML i TEXT
- Wzorce kontekstowe: "recipient: email@...", "to email@... couldn't be delivered"
- Frazy: `<email@domain.com>: host ... said: ...`

**3. Załączniki:**
- Załącznik typu `message/rfc822` (oryginalna wiadomość)
- Nagłówek `To:` z załączonej wiadomości
- Nagłówek `X-Original-To:`

**Filtrowanie:**
System pomija systemowe adresy:
- `mailer-daemon@`
- `postmaster@`
- `noreply@` / `no-reply@`

### Identyfikacja kampanii dla bounce

Bounce messages często nie zawierają nagłówków `In-Reply-To` lub `References`.
System automatycznie ekstrahuje oryginalny `Message-ID` z załączników:

**1. Ekstrakcja z załączników:**
- Serwery pocztowe załączają oryginalną wiadomość jako `message/rfc822`
- System parsuje załącznik i ekstrahuje nagłówek `Message-ID:`
- Lookup w `marketing_campanies_mailing_result` po `messageId`

**2. Fallback - treść HTML/TEXT:**
- Niektóre serwery wklejają headers jako tekst
- Wzorzec: `Message-ID: <id@domain.com>`

**3. Precyzyjne mapowanie:**
- Znaleziony `Message-ID` → identyfikacja `campaignId` + `mailAddressId`
- Bounce zostaje przypisany do właściwej kampanii i kontaktu

## Struktura bazy danych

### Tabela: campaign_replies (nowe pola)

```sql
is_bounce TINYINT(1) DEFAULT 0        -- Czy to bounce
bounce_type VARCHAR(50) NULL          -- 'hard' / 'soft' / 'unknown'
bounce_reason TEXT NULL               -- Powód z nagłówków
```

### Tabela: mail_addresses (nowe pola)

```sql
bounce_date DATETIME NULL             -- Data ostatniego bounce
bounce_reason TEXT NULL               -- Ostatni powód bounce
bounce_count INT DEFAULT 0            -- Licznik bounces
```

## Przepływ obsługi bounce

```
┌─────────────────────────────────────────────────────┐
│ CheckMailboxTask pobiera wiadomość z IMAP          │
│ - fetchImapMessages() z headers: true              │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ detectBounce(reply)                                 │
│ - System punktowy (min 2 punkty)                   │
│ - Analizuje headers (Auto-Submitted, Content-Type) │
│ - Analizuje From (MAILER-DAEMON)                   │
│ - Analizuje Subject (keywords)                     │
│ - Określa typ: hard/soft/unknown                   │
│ - Ekstrahuje recipientEmail z nagłówków            │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ processReplies() - identyfikacja kampanii          │
│                                                     │
│ DLA BOUNCE bez In-Reply-To/References:             │
│ extractOriginalMessageIdFromBounce()                │
│ - Pobiera pełną wiadomość z IMAP                   │
│ - Parsuje MIME (simpleParser)                      │
│ - Sprawdza załączniki message/rfc822               │
│ - Ekstrahuje Message-ID: z załączonej wiadomości   │
│ - Fallback: szuka Message-ID w treści HTML/TEXT    │
│                                                     │
│ Lookup w marketing_campanies_mailing_result:       │
│ - WHERE messageId = znaleziony Message-ID          │
│ - Identyfikuje campaignId + mailAddressId          │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ Jeśli recipientEmail nie znaleziony w nagłówkach:  │
│ extractRecipientFromBounceContent()                 │
│ - Pobiera pełną wiadomość z IMAP                   │
│ - Parsuje MIME (simpleParser)                      │
│ - Szuka w HTML/TEXT (wzorce kontekstowe)           │
│ - Sprawdza załączniki (message/rfc822)             │
│ - Ekstrahuje To: z załączonej wiadomości           │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ processReplies() mapuje kontakt                     │
│ - Jeśli recipientEmail znaleziony:                 │
│   - Szuka MailAddress po recipientEmail            │
│   - mailAddressId = znaleziony kontakt             │
│ - Zapisuje CampaignReply:                          │
│   - isBounce = 1                                    │
│   - bounceType = 'hard'/'soft'/'unknown'           │
│   - bounceReason = powód z nagłówków               │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ Aktualizacja MailAddress                           │
│                                                     │
│ HARD BOUNCE:                                        │
│   - active = 0 (dezaktywacja)                      │
│   - bounceDate = NOW()                             │
│   - bounceReason = powód                           │
│   - bounceCount += 1                               │
│   - Log: 🚫 HARD BOUNCE                            │
│                                                     │
│ SOFT BOUNCE:                                        │
│   - bounceCount += 1                               │
│   - Jeśli bounceCount >= 3:                        │
│     - active = 0 (dezaktywacja)                    │
│     - Log: 🚫 SOFT BOUNCE x3                       │
│   - Jeśli bounceCount < 3:                         │
│     - Log: ⚠️ SOFT BOUNCE count=X/3                │
│                                                     │
│ UNKNOWN BOUNCE:                                     │
│   - bounceDate = NOW()                             │
│   - bounceReason = powód                           │
│   - bounceCount += 1                               │
│   - Log: ❓ UNKNOWN BOUNCE                          │
└─────────────────────────────────────────────────────┘
```

## API Endpoints - rozszerzone odpowiedzi

### GET /mailing/campaigns/:campaignId/replies

Dodane pola w odpowiedzi:
```json
{
  "replies": [
    {
      "id": 123,
      "isBounce": true,
      "bounceType": "hard",
      "mailAddress": {
        "bounceCount": 1
      }
    }
  ]
}
```

### GET /mailing/replies/:replyId

Dodane pola:
```json
{
  "reply": {
    "isBounce": true,
    "bounceType": "hard",
    "bounceReason": "user unknown",
    "mailAddress": {
      "bounceDate": "2025-11-10T10:30:00.000Z",
      "bounceCount": 1
    }
  }
}
```

### GET /mailing/campaigns/:campaignId/replies/stats

Dodane statystyki:
```json
{
  "stats": {
    "totalBounces": 15,
    "hardBounces": 10,
    "softBounces": 5,
    "bounceRate": 3
  }
}
```

## Migracja

```bash
mysql -u root -p mailing_db < db/migrations/20251110_add_bounce_tracking.sql
```

## Debug

Włącz logi:
```env
CHECK_MAILBOX_DEBUG=true
```

Logi bounce:
- 🔴 - Bounce wykryty
- 🚫 - Hard bounce / dezaktywacja po soft x3
- ⚠️ - Soft bounce (licznik)
- ❓ - Unknown bounce
- 📝 - Aktualizacja kontaktu

## Przykład bounce message

### Typowy NDR/DSN (Hard Bounce) z załącznikiem:
```
From: MAILER-DAEMON@mail.example.com
Subject: Delivery Status Notification (Failure)
Auto-Submitted: auto-replied
Content-Type: multipart/report; report-type=delivery-status
X-Failed-Recipients: user@domain.com

This is a delivery status notification indicating that an
email could not be delivered to the following recipient:

user@domain.com
Reason: 550 5.1.1 User unknown

------ Załącznik: message/rfc822 ------
Message-ID: <abc123@marketing.domain.com>
From: newsletter@marketing.domain.com
To: user@domain.com
Subject: Monthly Newsletter
Date: Sat, 9 Nov 2025 10:15:00 +0100

[Oryginalna treść wiadomości]
```

**System ekstrahuje:**
- `recipientEmail` = `user@domain.com` (z X-Failed-Recipients)
- `Message-ID` = `abc123@marketing.domain.com` (z załącznika message/rfc822)
- Lookup: `WHERE messageId = 'abc123@marketing.domain.com'` → identyfikuje kampanię

### Soft Bounce (Mailbox Full):
```
From: postmaster@mail.example.com
Subject: Mail delivery failed: returning message to sender
Auto-Submitted: auto-generated

The message could not be delivered due to:
Mailbox full (4.2.2)

------ Original Message Headers ------
Message-ID: <xyz789@marketing.domain.com>
To: user2@domain.com
```

**System ekstrahuje:**
- `recipientEmail` = `user2@domain.com` (z treści/załącznika To:)
- `Message-ID` = `xyz789@marketing.domain.com` (z treści tekstowej)

## Zarządzanie zdezaktywowanymi kontaktami

### Reaktywacja kontaktu po bounce

Jeśli administrator chce reaktywować kontakt:

```sql
UPDATE mail_addresses 
SET active = 1, 
    bounce_count = 0,
    bounce_date = NULL,
    bounce_reason = NULL
WHERE id = ?;
```

### Raport bounced contacts

```sql
SELECT 
    ma.id,
    ma.mail_address,
    ma.bounce_date,
    ma.bounce_count,
    ma.bounce_reason,
    COUNT(cr.id) as total_bounces
FROM mail_addresses ma
LEFT JOIN campaign_replies cr ON cr.mail_address_id = ma.id AND cr.is_bounce = 1
WHERE ma.bounce_date IS NOT NULL
GROUP BY ma.id
ORDER BY ma.bounce_date DESC;
```

## Best Practices

1. **Regularne czyszczenie**: Usuwaj zdezaktywowane kontakty po 6 miesiącach
2. **Monitoring bounce rate**: Jeśli > 5%, sprawdź jakość listy mailingowej
3. **Weryfikacja przed wysyłką**: Nie wysyłaj do kontaktów z `active=0`
4. **Soft bounce grace period**: 3 próby przed dezaktywacją
5. **Log analysis**: Regularnie sprawdzaj bounce_reason dla wzorców

## Troubleshooting

### Bounce nie jest wykrywany
- Sprawdź nagłówki wiadomości: `CHECK_MAILBOX_DEBUG=true`
- Zweryfikuj czy IMAP pobiera headers: `headers: true` w fetchOne
- Dodaj nowe keywords do detectBounce() jeśli potrzeba

### Fałszywe pozytywne bounce
- Sprawdź `bounceReason` w bazie
- Dostosuj logikę w `detectBounce()`
- Rozważ whitelist dla autorespondentów (OOO messages)

### Kontakt zdezaktywowany przez pomyłkę
- Sprawdź `campaign_replies` WHERE `mail_address_id = X AND is_bounce = 1`
- Zweryfikuj `bounce_reason`
- Reaktywuj ręcznie SQL-em
