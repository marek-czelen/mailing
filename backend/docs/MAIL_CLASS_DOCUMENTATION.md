# Klasa Mail - Dokumentacja

## Przegląd

Klasa `Mail` jest kompleksowym systemem do wysyłania e-maili w aplikacji Node.js. Oferuje następujące funkcjonalności:

- ✅ Wysyłanie przez SMTP (z obsługą SSL/TLS)
- ✅ Masowe wysyłanie e-maili z optymalizacją
- ✅ Bezpośrednie wysyłanie (bez pośredniego serwera SMTP)
- ✅ System placeholderów do personalizacji treści
- ✅ Wsparcie dla szablonów blokowych
- ✅ Generowanie linków do wypisania z newslettera
- ✅ Walidacja i testowanie połączeń
- ✅ Wszystkie metody są statyczne i asynchroniczne

## Importowanie

```javascript
import Mail from './src/include/mail.js';
```

## Podstawowe użycie

### 1. Wysłanie pojedynczego e-maila

```javascript
const result = await Mail.sendEmail({
  smtp: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'twoj-email@gmail.com',
      pass: 'haslo-aplikacji'
    }
  },
  from: 'nadawca@example.com',
  to: 'odbiorca@example.com',
  subject: 'Temat wiadomości',
  html: '<h1>Witaj {{FIRST_NAME}}!</h1>',
  placeholders: {
    FIRST_NAME: 'Jan'
  }
});
```

### 2. Masowe wysyłanie e-maili

```javascript
const result = await Mail.sendBulkEmails({
  smtp: { /* konfiguracja SMTP */ },
  from: 'newsletter@example.com',
  emails: [
    {
      to: 'user1@example.com',
      subject: 'Witaj {{FIRST_NAME}}',
      html: '<p>Cześć {{FIRST_NAME}}!</p>',
      placeholders: { FIRST_NAME: 'Jan' }
    },
    {
      to: 'user2@example.com', 
      subject: 'Witaj {{FIRST_NAME}}',
      html: '<p>Cześć {{FIRST_NAME}}!</p>',
      placeholders: { FIRST_NAME: 'Anna' }
    }
  ],
  batchSize: 50,
  delay: 100
});
```

### 3. Bezpośrednie wysyłanie

```javascript
const result = await Mail.sendDirectEmail({
  from: 'admin@twoja-domena.com',
  to: 'odbiorca@example.com',
  subject: 'Email bezpośredni',
  html: '<p>Wysłane bezpośrednio do serwera MX</p>'
});
```

## Konfiguracja SMTP

### Podstawowa konfiguracja

```javascript
const smtpConfig = {
  host: 'smtp.example.com',
  port: 587,                    // 587 dla STARTTLS, 465 dla SSL, 25 dla niezaszyfrowanych
  secure: false,                // true dla portu 465, false dla innych
  auth: {
    user: 'username@example.com',
    pass: 'password'
  }
};
```

### Obsługa self-signed certyfikatów i problemów SSL/TLS

Jeśli masz problemy z certyfikatami (błąd: "self-signed certificate in certificate chain"), użyj jednej z poniższych opcji:

#### Opcja 1: ignoreTLS (najprostsza)
```javascript
const smtpConfig = {
  host: 'mail.twoja-firma.com',
  port: 587,
  secure: false,
  ignoreTLS: true,              // Ignoruje wszystkie błędy certyfikatów
  auth: {
    user: 'user@twoja-firma.com',
    pass: 'password'
  }
};
```

#### Opcja 2: rejectUnauthorized = false (jawne)
```javascript
const smtpConfig = {
  host: 'mail.twoja-firma.com',
  port: 587,
  secure: false,
  rejectUnauthorized: false,    // Jawnie wyłącza weryfikację certyfikatów
  auth: {
    user: 'user@twoja-firma.com',
    pass: 'password'
  }
};
```

#### Opcja 3: Zaawansowana konfiguracja TLS
```javascript
const smtpConfig = {
  host: 'mail.twoja-firma.com',
  port: 587,
  secure: false,
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3',
    secureProtocol: 'TLSv1_method'
  },
  auth: {
    user: 'user@twoja-firma.com',
    pass: 'password'
  }
};
```

#### Opcja 4: Zmienne środowiskowe
```bash
# W pliku .env lub systemie
IGNORE_TLS=true
# LUB
NODE_ENV=development
```

**UWAGA**: Wyłączenie weryfikacji certyfikatów zmniejsza bezpieczeństwo. Używaj tylko w zaufanych środowiskach lub podczas rozwoju aplikacji.

### Popularne dostawcy SMTP

#### Gmail
```javascript
{
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'app-specific-password'  // Musisz użyć hasła aplikacji!
  }
}
```

#### Outlook/Hotmail
```javascript
{
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@outlook.com',
    pass: 'your-password'
  }
}
```

#### SendGrid
```javascript
{
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: 'your-sendgrid-api-key'
  }
}
```

#### Własny serwer z self-signed certyfikatami
```javascript
{
  host: 'mail.twoja-firma.com',
  port: 587,
  secure: false,
  ignoreTLS: true,          // Ignoruje błędy certyfikatów SSL/TLS
  // LUB
  rejectUnauthorized: false, // Jawnie wyłącza weryfikację certyfikatów
  auth: {
    user: 'user@twoja-firma.com',
    pass: 'password'
  }
}
```

## System placeholderów

### Domyślne placeholdery systemowe

Klasa automatycznie udostępnia następujące placeholdery:

- `{{CURRENT_YEAR}}` - Aktualny rok
- `{{CURRENT_DATE}}` - Aktualna data (format polski)
- `{{CURRENT_DATETIME}}` - Aktualna data i czas
- `{{COMPANY_NAME}}` - Nazwa firmy (z env lub domyślna)
- `{{WEBSITE_URL}}` - URL strony (z env lub domyślny)
- `{{SUPPORT_EMAIL}}` - Email wsparcia (z env lub domyślny)

### Własne placeholdery

```javascript
const html = `
  <h1>Witaj {{FIRST_NAME}} {{LAST_NAME}}!</h1>
  <p>Twój kod promocyjny: {{PROMO_CODE|BRAK}}</p>
  <p>Firma: {{COMPANY_NAME}}</p>
`;

Mail.processPlaceholders(html, {
  FIRST_NAME: 'Jan',
  LAST_NAME: 'Kowalski',
  PROMO_CODE: 'JAN2025'
});
```

### Placeholdery z wartościami domyślnymi

```javascript
// Format: {{PLACEHOLDER|wartość_domyślna}}
const html = '<p>Witaj {{FIRST_NAME|Użytkowniku}}!</p>';

// Jeśli FIRST_NAME nie jest podany, użyje "Użytkowniku"
```

## Szablony blokowe

System obsługuje szablony składające się z bloków, kompatybilne z systemem szablonów w bazie danych.

### Typy bloków

#### Blok tekstowy
```javascript
{
  type: 'text',
  content: {
    text: 'Treść tekstu z {{PLACEHOLDER}}',
    fontSize: 16,
    color: '#333333',
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontFamily: 'Arial, sans-serif'
  },
  style: {
    marginTop: 0,
    marginBottom: 20,
    textAlign: 'left'
  }
}
```

#### Blok przycisku
```javascript
{
  type: 'button',
  content: {
    text: 'Kliknij tutaj',
    url: 'https://example.com',
    backgroundColor: '#007bff',
    textColor: '#ffffff',
    borderRadius: 6,
    padding: '14px 28px'
  },
  style: {
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center'
  }
}
```

#### Blok obrazu
```javascript
{
  type: 'image',
  content: {
    src: 'https://example.com/image.jpg',
    alt: 'Opis obrazu',
    width: '300px',
    borderRadius: 0
  },
  style: {
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center'
  }
}
```

### Renderowanie szablonu

```javascript
const blocks = [
  { type: 'text', content: { text: 'Witaj {{FIRST_NAME}}!' } },
  { type: 'button', content: { text: 'Zobacz więcej', url: '{{WEBSITE_URL}}' } }
];

const html = Mail.renderTemplate(blocks, {
  FIRST_NAME: 'Jan',
  WEBSITE_URL: 'https://example.com'
});
```

## Funkcje pomocnicze

### Test połączenia SMTP

```javascript
const result = await Mail.testSMTPConnection({
  host: 'smtp.gmail.com',
  port: 587,
  auth: { user: 'test@gmail.com', pass: 'password' }
});

console.log(result);
// { success: true, verified: true, message: 'Połączenie SMTP działa prawidłowo' }
```

### Walidacja adresu e-mail

```javascript
const isValid = Mail.validateEmail('test@example.com'); // true
const isInvalid = Mail.validateEmail('invalid-email'); // false
```

### Generator linku do wypisania

```javascript
const unsubscribeLink = Mail.generateUnsubscribeLink(
  'user@example.com',
  'https://twoja-strona.com',
  'bezpieczny-token'
);

console.log(unsubscribeLink);
// https://twoja-strona.com/unsubscribe?email=user%40example.com&token=bezpieczny-token
```

## Integracja z systemem mailingowym

### Przykład kompletnej kampanii

```javascript
// Dane z bazy danych
const campaign = {
  subject: 'Newsletter {{COMPANY_NAME}} - {{CURRENT_DATE}}',
  htmlContent: `
    <h1>{{COMPANY_NAME}} Newsletter</h1>
    <p>Cześć {{FIRST_NAME}}!</p>
    <p>{{EMAIL_CONTENT}}</p>
    <hr>
    <p><small>{{RODO_FOOTER}}</small></p>
    <p><small><a href="{{UNSUBSCRIBE_LINK}}">Wypisz się</a></small></p>
  `
};

const customer = {
  smtpHost: 'smtp.example.com',
  smtpPort: 587,
  smtpUser: 'sender@example.com',
  smtpPass: 'password',
  companyName: 'ABC Corp',
  rodoFooter: 'Dane przetwarzane zgodnie z RODO...'
};

const subscribers = [
  { email: 'jan@example.com', firstName: 'Jan' },
  { email: 'anna@example.com', firstName: 'Anna' }
];

// Przygotuj emaile
const emails = subscribers.map(subscriber => ({
  to: subscriber.email,
  subject: campaign.subject,
  html: campaign.htmlContent,
  placeholders: {
    FIRST_NAME: subscriber.firstName,
    COMPANY_NAME: customer.companyName,
    EMAIL_CONTENT: 'Treść newslettera...',
    RODO_FOOTER: customer.rodoFooter,
    UNSUBSCRIBE_LINK: Mail.generateUnsubscribeLink(
      subscriber.email, 
      'https://example.com'
    )
  }
}));

// Wyślij
const result = await Mail.sendBulkEmails({
  smtp: {
    host: customer.smtpHost,
    port: customer.smtpPort,
    auth: {
      user: customer.smtpUser,
      pass: customer.smtpPass
    }
  },
  from: customer.smtpUser,
  emails: emails,
  batchSize: 50,
  delay: 200
});
```

## Obsługa błędów

Wszystkie metody zwracają obiekt z wynikiem:

### Sukces
```javascript
{
  success: true,
  messageId: '<unique-message-id>',
  response: 'SMTP response'
}
```

### Błąd
```javascript
{
  success: false,
  error: 'Opis błędu',
  details: { /* szczegóły błędu */ }
}
```

### Masowe wysyłanie - statystyki
```javascript
{
  success: true,
  results: {
    total: 100,
    sent: 98,
    failed: 2,
    errors: [
      { email: 'invalid@example.com', error: 'Invalid email' }
    ]
  }
}
```

## Bezpieczeństwo i najlepsze praktyki

### 1. Uwierzytelnianie SMTP
- Zawsze używaj silnych haseł
- Dla Gmail używaj haseł aplikacji (App Passwords)
- Nigdy nie hardkoduj danych uwierzytelniających w kodzie

### 2. Limitowanie wysyłki
- Używaj parametru `delay` przy masowym wysyłaniu
- Monitoruj limity dostawcy SMTP
- Implementuj kolejki dla dużej liczby emaili

### 3. Zgodność z RODO
- Zawsze dołączaj stopkę RODO
- Implementuj mechanizm wypisywania się
- Używaj nagłówka `List-Unsubscribe`

### 4. Monitorowanie
- Loguj wyniki wysyłek
- Monitoruj bounced emaile
- Śledź statystyki dostarczalności

## Zmienne środowiskowe

Ustawiaj następujące zmienne środowiskowe dla domyślnych wartości:

```bash
# .env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=sender@example.com
SMTP_PASS=password123
SMTP_FROM=noreply@example.com

COMPANY_NAME=Nasza Firma Sp. z o.o.
WEBSITE_URL=https://nasza-firma.com
SUPPORT_EMAIL=support@nasza-firma.com
UNSUBSCRIBE_URL=https://nasza-firma.com

# Dla bezpośredniego wysyłania
HOSTNAME=mail.nasza-firma.com

# Środowisko deweloperskie
NODE_ENV=development
```

## Wymagania systemowe

### Pakiety Node.js
- `nodemailer` - dla SMTP
- `dns` - dla bezpośredniego wysyłania (wbudowany)
- `net` - dla bezpośredniego wysyłania (wbudowany)

### Sieć
- Port 587 (SMTP STARTTLS) lub 465 (SMTP SSL)
- Port 25 (dla bezpośredniego wysyłania)
- Dostęp do serwerów MX dla bezpośredniego wysyłania

### Zalecenia
- Używaj dedykowanego serwera SMTP dla produkcji
- Konfiguruj SPF, DKIM i DMARC dla lepszej dostarczalności
- Monitoruj reputację IP/domeny

## Rozwiązywanie problemów

### Błędy SMTP
1. **Authentication failed** - Sprawdź dane logowania
2. **Connection timeout** - Sprawdź firewall i porty
3. **self-signed certificate in certificate chain** - Użyj `ignoreTLS: true` lub `rejectUnauthorized: false`
4. **certificate verify failed** - Sprawdź konfigurację TLS lub wyłącz weryfikację
5. **ENOTFOUND hostname** - Sprawdź czy hostname SMTP jest prawidłowy
6. **ECONNREFUSED** - Port SMTP może być zablokowany lub nieprawidłowy

### Bezpośrednie wysyłanie
1. **No MX record** - Domena nie ma skonfigurowanej poczty
2. **Connection refused** - Port 25 może być zablokowany
3. **Message rejected** - Serwer odrzucił wiadomość (spam filtering)

### Wydajność
1. **Wolne wysyłanie** - Zmniejsz `batchSize` i zwiększ `delay`
2. **Memory leaks** - Używaj `transporter.close()` po masowym wysyłaniu
3. **Rate limiting** - Implementuj inteligentne kolejki

## Przykłady użycia w produkcji

Zobacz plik `examples/mail-examples.js` dla kompletnych przykładów implementacji wszystkich funkcji klasy Mail.