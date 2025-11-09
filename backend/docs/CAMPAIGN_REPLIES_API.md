# Campaign Replies API - Dokumentacja

## Przegląd
System automatycznego monitorowania i zarządzania odpowiedziami na kampanie email marketingowe.

## Endpointy API

### 1. GET /mailing/campaigns/:campaignId/replies
**Opis:** Pobiera listę odpowiedzi dla kampanii z paginacją i filtrowaniem.

**Parametry URL:**
- `campaignId` (wymagane) - ID kampanii

**Query Parameters:**
- `page` - numer strony (domyślnie: 1)
- `limit` - liczba rekordów na stronę (domyślnie: 50, max: 200)
- `sortBy` - pole sortowania: 'receivedAt', 'fromEmail', 'subject', 'id' (domyślnie: 'receivedAt')
- `sortOrder` - kierunek: 'asc' lub 'desc' (domyślnie: 'desc')
- `search` - wyszukiwanie w fromEmail i subject
- `hasContact` - filtr kontaktów: 'true' (tylko zidentyfikowane) | 'false' (tylko niezidentyfikowane) | null (wszystkie)
- `dateFrom` - data odpowiedzi >= (format ISO)
- `dateTo` - data odpowiedzi <= (format ISO)

**Przykład wywołania:**
```javascript
GET /mailing/campaigns/123/replies?page=1&limit=20&hasContact=true&sortOrder=desc
```

**Odpowiedź:**
```json
{
  "data": {
    "campaign": {
      "id": 123,
      "name": "Newsletter Q1 2025",
      "subject": "Nowa oferta produktów"
    },
    "replies": [
      {
        "id": 456,
        "fromEmail": "customer@example.com",
        "subject": "Re: Nowa oferta produktów",
        "receivedAt": "2025-11-09T14:30:00.000Z",
        "hasContact": true,
        "mailAddress": {
          "id": 789,
          "email": "customer@example.com",
          "miasto": "Warszawa",
          "rodzaj": "firma",
          "active": true
        },
        "bodyPreview": "Dziękuję za ofertę, chciałbym..."
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "totalPages": 8
    },
    "summary": {
      "totalReplies": 150,
      "identifiedReplies": 120,
      "unidentifiedReplies": 30
    }
  },
  "success": true,
  "message": "Campaign replies retrieved successfully."
}
```

---

### 2. GET /mailing/campaigns/:campaignId/replies/stats
**Opis:** Pobiera statystyki odpowiedzi dla kampanii.

**Parametry URL:**
- `campaignId` (wymagane) - ID kampanii

**Przykład wywołania:**
```javascript
GET /mailing/campaigns/123/replies/stats
```

**Odpowiedź:**
```json
{
  "data": {
    "campaign": {
      "id": 123,
      "name": "Newsletter Q1 2025"
    },
    "stats": {
      "totalReplies": 150,
      "identifiedReplies": 120,
      "unidentifiedReplies": 30,
      "identificationRate": 80,
      "repliesByDay": [
        { "date": "2025-11-01", "count": 25 },
        { "date": "2025-11-02", "count": 30 },
        { "date": "2025-11-03", "count": 45 }
      ],
      "topRespondents": [
        { "email": "customer1@example.com", "count": 5 },
        { "email": "customer2@example.com", "count": 3 }
      ]
    }
  },
  "success": true,
  "message": "Campaign replies statistics retrieved successfully."
}
```

---

### 3. GET /mailing/replies/:replyId
**Opis:** Pobiera szczegóły pojedynczej odpowiedzi (bez pełnej treści).

**Parametry URL:**
- `replyId` (wymagane) - ID odpowiedzi

**Przykład wywołania:**
```javascript
GET /mailing/replies/456
```

**Odpowiedź:**
```json
{
  "data": {
    "reply": {
      "id": 456,
      "fromEmail": "customer@example.com",
      "subject": "Re: Nowa oferta produktów",
      "receivedAt": "2025-11-09T14:30:00.000Z",
      "messageId": "<abc123@mail.example.com>",
      "replyHash": "a1b2c3d4e5f6...",
      "bodyPreview": "Dziękuję za ofertę, chciałbym...",
      "createdAt": "2025-11-09T14:35:00.000Z",
      "campaign": {
        "id": 123,
        "name": "Newsletter Q1 2025",
        "subject": "Nowa oferta produktów",
        "senderName": "Marketing Team",
        "senderEmail": "marketing@firma.pl",
        "databaseId": 10
      },
      "mailAddress": {
        "id": 789,
        "email": "customer@example.com",
        "miasto": "Warszawa",
        "rodzaj": "firma",
        "phone": "+48123456789",
        "active": true,
        "unsubscribed": false
      }
    }
  },
  "success": true,
  "message": "Reply details retrieved successfully."
}
```

---

### 4. GET /mailing/replies/:replyId/full ⭐ NOWY
**Opis:** Pobiera PEŁNĄ treść odpowiedzi i automatycznie oznacza ją jako odczytaną.

**Parametry URL:**
- `replyId` (wymagane) - ID odpowiedzi

**Zachowanie:**
- Przy pierwszym wywołaniu ustawia `is_read=1` i `read_at=NOW()`
- Przy kolejnych wywołaniach zwraca już oznaczoną odpowiedź
- Zwraca `wasUnread=true/false` aby frontend wiedział czy to pierwsze otwarcie

**Przykład wywołania:**
```javascript
GET /mailing/replies/456/full
```

**Odpowiedź:**
```json
{
  "data": {
    "reply": {
      "id": 456,
      "fromEmail": "customer@example.com",
      "subject": "Re: Nowa oferta produktów",
      "receivedAt": "2025-11-09T14:30:00.000Z",
      "messageId": "<abc123@mail.example.com>",
      "bodyFull": "Return-Path: <customer@example.com>\r\nFrom: customer@example.com\r\nSubject: Re: Nowa oferta produktów\r\n\r\nDziękuję za ofertę, chciałbym uzyskać więcej informacji na temat...",
      "isRead": true,
      "readAt": "2025-11-09T15:00:00.000Z",
      "wasUnread": true,
      "campaign": {
        "id": 123,
        "name": "Newsletter Q1 2025",
        "subject": "Nowa oferta produktów"
      },
      "mailAddress": {
        "id": 789,
        "email": "customer@example.com",
        "miasto": "Warszawa",
        "rodzaj": "firma"
      }
    }
  },
  "success": true,
  "message": "Reply full content retrieved successfully."
}
```

---

## Model danych

### Tabela: campaign_replies

| Kolumna | Typ | Opis |
|---------|-----|------|
| id | INT(10) UNSIGNED | PK, AUTO_INCREMENT |
| campaign_id | INT(11) | FK → marketing_campanies.id |
| mail_address_id | INT(11) NULL | FK → mail_addresses.id (nullable) |
| from_email | VARCHAR(320) | Adres email nadawcy odpowiedzi |
| subject | VARCHAR(500) | Temat odpowiedzi |
| received_at | DATETIME | Data otrzymania odpowiedzi |
| message_id | VARCHAR(500) | Message-ID z nagłówka emaila |
| reply_hash | VARCHAR(64) | SHA1 hash dla deduplikacji (UNIQUE) |
| body_preview | TEXT | Skrócona treść (pierwsze ~500 znaków) |
| **body_full** | MEDIUMTEXT | **NOWE**: Pełna treść emaila (raw source) |
| **is_read** | TINYINT(1) | **NOWE**: Czy użytkownik odczytał (0/1) |
| **read_at** | DATETIME NULL | **NOWE**: Data pierwszego odczytania |
| created_at | TIMESTAMP | Data utworzenia rekordu |

### Indeksy:
- PRIMARY KEY (id)
- FK_campaign_replies_marketing_campanies (campaign_id)
- FK_campaign_replies_mail_addresses (mail_address_id)
- idx_campaign_replies_is_read (is_read) - **NOWY**

---

## Migracje do wykonania

### 1. Dodanie pól śledzenia odczytu
```sql
-- Plik: db/migrations/20251109_add_campaign_replies_full_fields.sql
ALTER TABLE `campaign_replies`
    ADD COLUMN `body_full` MEDIUMTEXT NULL DEFAULT NULL COLLATE 'utf8_general_ci' AFTER `body_preview`,
    ADD COLUMN `is_read` TINYINT(1) NOT NULL DEFAULT 0 AFTER `body_full`,
    ADD COLUMN `read_at` DATETIME NULL DEFAULT NULL AFTER `is_read`;

CREATE INDEX `idx_campaign_replies_is_read` ON `campaign_replies` (`is_read`) USING BTREE;
```

**Wykonanie:**
```bash
mysql -u root -p mailing_db < db/migrations/20251109_add_campaign_replies_full_fields.sql
```

---

## Przepływ danych

### 1. Pobieranie odpowiedzi z IMAP
```
CheckMailboxTask (co 60s)
  ↓
fetchImapMessages() - pobiera envelope + source (pełną treść)
  ↓
Ekstrahuje:
  - bodyFull: msg.source.toString('utf-8')
  - bodyPreview: pierwsze 500 znaków po nagłówkach
  ↓
processReplies() - zapisuje do campaign_replies
  - bodyFull: pełna treść
  - bodyPreview: skrót
  - isRead: 0 (nowa odpowiedź)
  - readAt: NULL
```

### 2. Odczyt przez użytkownika
```
Frontend wywołuje GET /replies/:replyId/full
  ↓
getReplyFullContent()
  1. Pobiera reply z bazy
  2. Sprawdza autoryzację (customerId)
  3. Jeśli isRead=0:
     - UPDATE SET isRead=1, readAt=NOW()
     - Log: 📖 [getReplyFullContent] Oznaczono jako odczytaną
  4. Zwraca bodyFull + wasUnread flag
```

---

## Bezpieczeństwo

1. **Autoryzacja**: Wszystkie endpointy wymagają tokena JWT
2. **Weryfikacja właściciela**: Sprawdzamy czy campaign.customerId === userData.customerId
3. **Sanityzacja**: Parametry wejściowe są walidowane (page, limit, sortBy)
4. **Rate limiting**: Limit 200 rekordów na stronę

---

## Użycie we frontendzie

### Przykład 1: Lista odpowiedzi z filtrowaniem
```javascript
const response = await fetch('/mailing/campaigns/123/replies?page=1&limit=20&hasContact=true', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { data } = await response.json();
console.log(`Znaleziono ${data.summary.totalReplies} odpowiedzi`);
```

### Przykład 2: Otwarcie pełnej treści
```javascript
const openReply = async (replyId) => {
  const response = await fetch(`/mailing/replies/${replyId}/full`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const { data } = await response.json();
  
  if (data.reply.wasUnread) {
    console.log('✅ Odpowiedź oznaczona jako odczytana');
  }
  
  // Wyświetl pełną treść
  displayEmailContent(data.reply.bodyFull);
};
```

### Przykład 3: Statystyki kampanii
```javascript
const response = await fetch('/mailing/campaigns/123/replies/stats', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { data } = await response.json();
console.log(`Wskaźnik identyfikacji: ${data.stats.identificationRate}%`);
```

---

## Debug

Włącz szczegółowe logi w `.env`:
```
CHECK_MAILBOX_DEBUG=true
NODE_ENV=development
```

Logi:
- 📬 - pobieranie z IMAP
- 💾 - zapis do bazy
- 📖 - oznaczenie jako odczytane
- 🎯 - mapowanie kontaktu
- ⚠️ - ostrzeżenia
- ❌ - błędy
