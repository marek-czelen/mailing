# 📧 System Mailingowy - Kompletne Rozwiązanie

## 🎯 Przegląd Systemu

Kompleksowy system mailingowy z obsługą SMTP, wysyłaniem masowym, szablonami HTML oraz profesjonalnym zarządzaniem środowiskami development/production.

## ✨ Główne Funkcjonalności

### 📧 Klasa Mail (`src/include/mail.js`)
- ✅ **Wysyłanie pojedynczych maili** - `Mail.sendEmail()`
- ✅ **Wysyłanie masowe** - `Mail.sendBulkEmails()`
- ✅ **Wysyłanie bezpośrednie** - `Mail.sendDirectEmail()`
- ✅ **Obsługa placeholderów** - Dynamiczne zastępowanie zmiennych
- ✅ **Szablony HTML** - Renderowanie szablonów z danymi
- ✅ **Obsługa SSL/TLS** - Pełna kontrola nad certyfikatami
- ✅ **Pooling połączeń** - Optymalizacja wydajności
- ✅ **Obsługa błędów** - Szczegółowe komunikaty błędów
- ✅ **RODO Compliance** - Obsługa wypisywania się z listy

### 🌍 System Zmiennych Środowiskowych
- ✅ **Rozróżnienie Development/Production**
- ✅ **Automatyczne ładowanie konfiguracji**
- ✅ **Walidacja zmiennych wymaganych**
- ✅ **Bezpieczne zarządzanie sekretami**
- ✅ **Elastyczna konfiguracja SMTP/Database/OpenAI**

### 🔒 Bezpieczeństwo i SSL/TLS
- ✅ **Obsługa certyfikatów self-signed**
- ✅ **Konfiguracja TLS per środowisko**
- ✅ **Bezpieczne przechowywanie haseł**
- ✅ **CORS konfigurowalny przez zmienne**

## 🚀 Szybki Start

### 1. Instalacja zależności

```bash
npm install
```

### 2. Konfiguracja środowiska

```bash
# Skopiuj przykładowe pliki konfiguracji
copy .env.example .env.development
copy .env.example .env.production

# Edytuj pliki według swoich potrzeb
```

### 3. Uruchomienie

```bash
# Development
npm run dev

# Production  
npm run start:prod

# Debug mode
npm run dev:debug

# Test konfiguracji środowiska
node test-environment.js
```

## 📁 Struktura Projektu

```
├── 📧 src/include/mail.js              # Główna klasa Mail
├── 🌍 src/config/environment.config.js  # Zarządzanie środowiskami
├── ⚙️  .env.example                    # Szablon konfiguracji
├── 📝 examples/                        # Przykłady użycia
│   ├── mail-examples.js               # Podstawowe przykłady Mail
│   └── ssl-certificate-examples.js    # Przykłady SSL/TLS
├── 📚 docs/                           # Dokumentacja
│   ├── MAIL_CLASS_DOCUMENTATION.md   # Pełna dokumentacja Mail
│   ├── PLACEHOLDERS.md               # Dokumentacja placeholderów
│   └── MAIL_INTEGRATION.md           # Przewodnik integracji
└── 📋 ENVIRONMENT_SETUP.md           # Konfiguracja środowisk
```

## 🛠️ Podstawowe Użycie

### Wysyłanie Pojedynczego Maila

```javascript
import Mail from './src/include/mail.js';

const result = await Mail.sendEmail({
    smtp: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'your-email@gmail.com',
            pass: 'your-password'
        }
    },
    from: 'nadawca@example.com',
    to: 'odbiorca@example.com',
    subject: 'Test Mail',
    html: '<h1>Witaj {{name}}!</h1>',
    placeholders: {
        name: 'Jan Kowalski'
    }
});

if (result.success) {
    console.log('Mail wysłany!', result.messageId);
} else {
    console.error('Błąd:', result.error);
}
```

### Wysyłanie Masowe

```javascript
const recipients = [
    { email: 'user1@example.com', name: 'Jan' },
    { email: 'user2@example.com', name: 'Anna' }
];

const results = await Mail.sendBulkEmails({
    smtp: { /* konfiguracja SMTP */ },
    from: 'newsletter@example.com',
    subject: 'Newsletter',
    htmlTemplate: '<h1>Cześć {{name}}!</h1>',
    recipients: recipients,
    placeholderMapping: (recipient) => ({ name: recipient.name })
});

console.log(`Wysłano: ${results.successful}/${results.total}`);
```

### Obsługa Certyfikatów Self-Signed

```javascript
// Development - ignoruj certyfikaty
const result = await Mail.sendEmail({
    smtp: {
        host: 'mail.local-server.com',
        port: 587,
        ignoreTLS: true,  // Ignoruj TLS całkowicie
        tls: {
            rejectUnauthorized: false  // Akceptuj self-signed
        }
    },
    // ... reszta konfiguracji
});
```

## 🌍 Zmienne Środowiskowe

### Podstawowe

```env
NODE_ENV=development
APP_NAME=Mailing System
BASE_URL=http://localhost:3000
PORT=3000
```

### SMTP

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
SMTP_FROM=noreply@yourdomain.com
SMTP_IGNORE_TLS=false
SMTP_REJECT_UNAUTHORIZED=true
```

### Baza Danych

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=mailing_system
DB_USER=user
DB_PASS=password
```

## 📊 Monitorowanie i Logi

### Development Mode
```bash
npm run dev
# Szczegółowe logi wszystkich operacji
# Wyświetlanie błędów z pełnym stack trace
# Informacje o requestach HTTP
```

### Production Mode
```bash
npm run start:prod
# Minimalne logowanie (tylko błędy)
# Optymalizacja wydajności
# Bezpieczne obsługiwanie błędów
```

## 🧪 Testowanie

```bash
# Test konfiguracji środowiska
node test-environment.js

# Test w różnych środowiskach
set NODE_ENV=development && node test-environment.js
set NODE_ENV=production && node test-environment.js
```

## 📚 Dokumentacja

| Dokument | Opis |
|----------|------|
| `MAIL_CLASS_DOCUMENTATION.md` | Kompletna dokumentacja klasy Mail |
| `PLACEHOLDERS.md` | System placeholderów i szablonów |
| `MAIL_INTEGRATION.md` | Przewodnik integracji z istniejącymi systemami |
| `ENVIRONMENT_SETUP.md` | Konfiguracja zmiennych środowiskowych |

## 🔧 Przykłady w Folderze `examples/`

| Plik | Zawartość |
|------|-----------|
| `mail-examples.js` | 7 przykładów użycia Mail class |
| `ssl-certificate-examples.js` | Obsługa problemów SSL/TLS |

## ⚡ Wydajność

### Pooling Połączeń
```javascript
// Automatyczne pooling dla wysyłki masowej
Mail.sendBulkEmails({
    pooling: true,        // Włącz pooling (domyślnie true)
    maxConnections: 5,    // Max 5 równoczesnych połączeń
    // ... reszta konfiguracji
});
```

### Optymalizacja Delay'ów
```env
# Opóźnienie między wysyłkami (ms)
MAILING_SEND_DELAY=100

# Interwał zadania cyklicznego (ms) 
MAILING_TASK_INTERVAL=60000
```

## 🚨 Rozwiązywanie Problemów

### Problem: "nodemailer.createTransporter is not a function"
**Rozwiązanie**: ✅ Naprawione - używamy `nodemailer.createTransport()`

### Problem: "self-signed certificate in certificate chain"
**Rozwiązanie**: ✅ Dodano opcje SSL/TLS:
- `ignoreTLS: true` - ignoruj TLS
- `rejectUnauthorized: false` - akceptuj self-signed

### Problem: Błędy CORS
**Rozwiązanie**: ✅ Konfiguruj przez `CORS_ORIGINS` w `.env`

### Problem: Problemy z bazą danych
**Rozwiązanie**: ✅ Użyj `EnvironmentConfig.getDatabaseConfig()`

## 🤝 Wsparcie

### Jeśli masz problemy:

1. **Sprawdź logi** - uruchom w trybie development
2. **Przetestuj konfigurację** - `node test-environment.js`
3. **Sprawdź dokumentację** - w folderze `docs/`
4. **Przejrzyj przykłady** - w folderze `examples/`

### Najczęstsze problemy:
- ❌ Brak pliku `.env.development` → Skopiuj z `.env.example`
- ❌ Błędne ustawienia SMTP → Sprawdź port i TLS
- ❌ Problemy SSL → Użyj `ignoreTLS` w development

---

## 🎉 Gotowe do użycia!

System zawiera **wszystkie niezbędne funkcje** do profesjonalnego wysyłania maili:

✅ **Pojedyncze i masowe wysyłki**  
✅ **Szablony HTML z placeholderami**  
✅ **Obsługa SSL/TLS i certyfikatów self-signed**  
✅ **Zarządzanie środowiskami development/production**  
✅ **Pooling połączeń dla wydajności**  
✅ **Szczegółowa dokumentacja i przykłady**  
✅ **RODO compliance**  
✅ **Monitoring i logi**  

**Uruchom `npm run dev` i zacznij wysyłać maile!** 🚀