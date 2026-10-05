# 🌍 Konfiguracja Zmiennych Środowiskowych

## 📋 Przegląd

System wykorzystuje zmienne środowiskowe do zarządzania konfiguracją w zależności od środowiska (development/production). Wszystkie zmienne są zarządzane przez klasę `EnvironmentConfig`.

## 🚀 Szybki Start

### 1. Kopiowanie plików środowiskowych

```bash
# Kopiuj przykładowy plik konfiguracji
copy .env.example .env.development
copy .env.example .env.production
```

### 2. Edycja konfiguracji

Edytuj pliki `.env.development` i `.env.production` według swoich potrzeb.

### 3. Uruchamianie aplikacji

```bash
# Development
npm run dev

# Production
npm run start:prod

# Debug mode
npm run dev:debug
```

## 📁 Struktura Plików

```
├── .env.example           # Szablon zmiennych środowiskowych
├── .env.development       # Konfiguracja dla środowiska development
├── .env.production        # Konfiguracja dla środowiska production
└── src/config/environment.config.js  # Klasa zarządzająca środowiskami
```

## 🔧 Dostępne Zmienne

### Podstawowe

| Zmienna | Opis | Domyślna Wartość |
|---------|------|------------------|
| `NODE_ENV` | Środowisko aplikacji | `development` |
| `APP_NAME` | Nazwa aplikacji | `Mailing System` |
| `BASE_URL` | Bazowy URL aplikacji | `http://localhost:3000` |
| `FRONTEND_URL` | Adres frontendu używany w linkach resetu hasła | `http://localhost:5173` |
| `PASSWORD_RESET_TOKEN_TTL_MINUTES` | Czas ważności linku resetującego hasło | `60` |

### Serwer

| Zmienna | Opis | Domyślna Wartość |
|---------|------|------------------|
| `PORT` | Port serwera | `3000` |
| `HOST` | Host serwera | `0.0.0.0` |

### Baza Danych

| Zmienna | Opis |
|---------|------|
| `DB_HOST` | Host bazy danych |
| `DB_PORT` | Port bazy danych |
| `DB_NAME` | Nazwa bazy danych |
| `DB_USER` | Użytkownik bazy |
| `DB_PASS` | Hasło do bazy |

### SMTP

| Zmienna | Opis |
|---------|------|
| `SMTP_HOST` | Host serwera SMTP |
| `SMTP_PORT` | Port SMTP |
| `SMTP_USER` | Użytkownik SMTP |
| `SMTP_PASS` | Hasło SMTP |
| `SMTP_FROM` | Nadawca domyślny |

### SSL/TLS

| Zmienna | Opis | Domyślna |
|---------|------|----------|
| `SMTP_IGNORE_TLS` | Ignoruj TLS | `false` |
| `SMTP_REJECT_UNAUTHORIZED` | Weryfikuj certyfikaty | `true` |

### OpenAI

| Zmienna | Opis |
|---------|------|
| `OPENAI_API_KEY` | Klucz API OpenAI |
| `OPENAI_MODEL` | Model GPT |

### Bezpieczeństwo

| Zmienna | Opis |
|---------|------|
| `JWT_SECRET` | Klucz do JWT |
| `CORS_ORIGINS` | Dozwolone originy CORS |

### Wydajność

| Zmienna | Opis | Domyślna |
|---------|------|----------|
| `EXPRESS_JSON_LIMIT` | Limit JSON | `10mb` |
| `MAILING_TASK_INTERVAL` | Interwał zadań | `60000` |
| `MAILING_SEND_DELAY` | Opóźnienie wysyłki | `100` |

## 🛠️ Użycie w Kodzie

### Podstawowe pobieranie wartości

```javascript
import EnvironmentConfig from './config/environment.config.js';

// Pobierz wartość
const port = EnvironmentConfig.get('PORT');

// Pobierz z domyślną wartością
const delay = EnvironmentConfig.get('MAILING_SEND_DELAY', 100);

// Sprawdź środowisko
if (EnvironmentConfig.isDevelopment()) {
    console.log('Tryb development');
}

if (EnvironmentConfig.isProduction()) {
    console.log('Tryb production');
}
```

### Konfiguracja bazy danych

```javascript
const dbConfig = EnvironmentConfig.getDatabaseConfig();
// Zwraca: { host, port, database, username, password, dialect, logging }
```

### Konfiguracja SMTP

```javascript
const smtpConfig = EnvironmentConfig.getSmtpConfig();
// Zwraca: { host, port, secure, auth: {user, pass}, from }
```

### CORS Origins

```javascript
const corsOrigins = EnvironmentConfig.getCorsOrigins();
// Zwraca tablicę dozwolonych origins
```

## 🔒 Bezpieczeństwo

### Pliki do .gitignore

```gitignore
# Pliki środowiskowe
.env
.env.local
.env.development
.env.production

# Logi
logs/
*.log
npm-debug.log*
```

### Walidacja

System automatycznie waliduje:
- ✅ Wymagane zmienne w środowisku production
- ✅ Format portów (liczby)
- ✅ Format boolean'ów
- ✅ Bezpieczeństwo kluczy

## 📝 Przykładowe Konfiguracje

### Development

```env
NODE_ENV=development
APP_NAME=Mailing System Dev
BASE_URL=http://localhost:3000
PORT=3000
HOST=localhost

DB_HOST=localhost
DB_PORT=3306
DB_NAME=mailing_dev
DB_USER=dev_user
DB_PASS=dev_password

SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=test_user
SMTP_PASS=test_pass
SMTP_IGNORE_TLS=true
SMTP_REJECT_UNAUTHORIZED=false
FRONTEND_URL=http://localhost:5173
PASSWORD_RESET_TOKEN_TTL_MINUTES=60
```

### Production

```env
NODE_ENV=production
APP_NAME=Mailing System
BASE_URL=https://yourdomain.com
PORT=3000
HOST=0.0.0.0

DB_HOST=prod.database.com
DB_PORT=3306
DB_NAME=mailing_prod
DB_USER=prod_user
DB_PASS=secure_password

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=app_password
SMTP_REJECT_UNAUTHORIZED=true
FRONTEND_URL=https://yourdomain.com
PASSWORD_RESET_TOKEN_TTL_MINUTES=60
```

Po wdrożeniu funkcji odzyskiwania hasła uruchom migrację
`backend/db/migrations/20261005_create_password_reset_tokens.sql` na bazie MySQL 8.x.

## 🚨 Troubleshooting

### Problem: Aplikacja nie startuje

**Rozwiązanie**: Sprawdź czy wszystkie wymagane zmienne są ustawione:

```bash
npm run start:dev
```

### Problem: Błędy SSL/TLS

**Rozwiązanie**: W środowisku development ustaw:

```env
SMTP_IGNORE_TLS=true
SMTP_REJECT_UNAUTHORIZED=false
```

### Problem: Błędy CORS

**Rozwiązanie**: Skonfiguruj `CORS_ORIGINS`:

```env
CORS_ORIGINS=http://localhost:3000,http://localhost:8080
```

## 📞 Wsparcie

Jeśli masz problemy z konfiguracją:

1. Sprawdź logi aplikacji
2. Zweryfikuj format zmiennych w pliku `.env`
3. Upewnij się, że używasz poprawnych skryptów npm
4. Sprawdź czy plik `.env.{environment}` istnieje

---

**Tip**: W środowisku development wszystkie zmienne są opcjonalne z sensownymi domyślnymi wartościami. W production niektóre zmienne są wymagane dla bezpieczeństwa.