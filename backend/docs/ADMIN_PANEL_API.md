# API Panelu Administracyjnego - Dokumentacja

## Przegląd

Backend został rozszerzony o system ról użytkowników umożliwiający zarządzanie użytkownikami w obrębie klienta. System wspiera trzy główne role: Administrator, Marketer i Administrator danych.

## Migracja bazy danych

### Uruchomienie migracji

Aby dodać system ról do bazy danych, uruchom skrypt migracji:

```sql
source db/migrations/20241207_add_user_roles_system.sql
```

### Zmiany w bazie danych

Migracja dodaje:

1. **Tabela `roles`** - definicje ról w systemie
2. **Tabela `user_roles`** - powiązania użytkowników z rolami (Many-to-Many)
3. **Tabela `user_roles_audit`** - logi zmian w rolach (audyt)
4. **Rozszerzenie tabeli `users`**:
   - `name` - imię i nazwisko użytkownika
   - `active` - status aktywności konta (1=aktywne, 0=nieaktywne)
   - `created_at` - data utworzenia konta
   - `last_login` - data ostatniego logowania
   - `updated_at` - data ostatniej aktualizacji

### Domyślne role

System automatycznie tworzy trzy role:

- **administrator** - Zarządzanie systemem, pełny dostęp
- **marketer** - Tworzenie i wysyłanie kampanii mailowych
- **data_administrator** - Zarządzanie bazami danych i kontaktami

Istniejący użytkownik `admin@admin.pl` automatycznie otrzymuje rolę administratora.

## Endpointy API

Wszystkie endpointy wymagają nagłówka `Authorization: Bearer {token}`.

### Użytkownicy

#### Lista użytkowników
```
GET /api/users?customer_id={id}
```

**Wymagana rola:** administrator

**Parametry query:**
- `customer_id` (opcjonalnie) - ID klienta (domyślnie klient aktualnego użytkownika)

**Odpowiedź:**
```json
{
  "data": [
    {
      "id": "user@example.com",
      "email": "user@example.com",
      "name": "Jan Kowalski",
      "customer_id": 1,
      "roles": ["administrator", "marketer"],
      "active": true,
      "created_at": "2024-01-01T10:00:00Z",
      "last_login": "2024-12-07T08:30:00Z"
    }
  ],
  "success": true,
  "message": "Users retrieved successfully."
}
```

#### Szczegóły użytkownika
```
GET /api/users/:email
```

**Wymagana rola:** administrator

**Odpowiedź:**
```json
{
  "data": {
    "id": "user@example.com",
    "email": "user@example.com",
    "name": "Jan Kowalski",
    "customer_id": 1,
    "roles": [
      {
        "id": 1,
        "name": "administrator",
        "displayName": "Administrator",
        "description": "Zarządzanie systemem - pełny dostęp"
      }
    ],
    "active": true,
    "created_at": "2024-01-01T10:00:00Z",
    "last_login": "2024-12-07T08:30:00Z"
  },
  "success": true,
  "message": "User retrieved successfully."
}
```

#### Tworzenie użytkownika
```
POST /api/users
```

**Wymagana rola:** administrator

**Body:**
```json
{
  "email": "newuser@example.com",
  "name": "Nowy Użytkownik",
  "password": "haslo123",
  "roles": ["marketer", "data_administrator"],
  "active": true
}
```

**Walidacja:**
- `email` - wymagane, unikalny w systemie
- `password` - wymagane, minimum 6 znaków
- `roles` - wymagane, tablica z przynajmniej jedną rolą
- `name` - opcjonalne
- `active` - opcjonalne (domyślnie true)

**Odpowiedź:**
```json
{
  "data": {
    "id": "newuser@example.com",
    "email": "newuser@example.com",
    "name": "Nowy Użytkownik",
    "customer_id": 1,
    "roles": ["marketer", "data_administrator"],
    "active": true,
    "created_at": "2024-12-07T10:00:00Z"
  },
  "success": true,
  "message": "User created successfully."
}
```

#### Aktualizacja użytkownika
```
PUT /api/users/:email
```

**Wymagana rola:** administrator

**Body:**
```json
{
  "name": "Zaktualizowane Imię",
  "email": "newemail@example.com",
  "roles": ["administrator", "marketer"],
  "active": true
}
```

**Uwagi:**
- Wszystkie pola opcjonalne
- Zmiana email jest możliwa (sprawdzana unikalność)
- Hasło zmienia się osobnym endpointem

**Odpowiedź:**
```json
{
  "data": {
    "id": "newemail@example.com",
    "email": "newemail@example.com",
    "name": "Zaktualizowane Imię",
    "customer_id": 1,
    "roles": ["administrator", "marketer"],
    "active": true,
    "created_at": "2024-01-01T10:00:00Z",
    "last_login": "2024-12-07T08:30:00Z"
  },
  "success": true,
  "message": "User updated successfully."
}
```

#### Usuwanie użytkownika
```
DELETE /api/users/:email
```

**Wymagana rola:** administrator

**Uwagi:**
- Nie można usunąć samego siebie
- Operacja nieodwracalna
- Kaskadowo usuwa powiązania z rolami

**Odpowiedź:**
```json
{
  "data": {
    "email": "user@example.com"
  },
  "success": true,
  "message": "User deleted successfully."
}
```

#### Zmiana statusu aktywności
```
PATCH /api/users/:email/active
```

**Wymagana rola:** administrator

**Body:**
```json
{
  "active": false
}
```

**Uwagi:**
- Nie można dezaktywować własnego konta
- Nieaktywne konto nie może się zalogować

**Odpowiedź:**
```json
{
  "data": {
    "email": "user@example.com",
    "active": false
  },
  "success": true,
  "message": "User status updated successfully."
}
```

#### Zmiana hasła
```
POST /api/users/:email/change-password
```

**Wymagana rola:** administrator

**Body:**
```json
{
  "password": "nowehaslo123"
}
```

**Walidacja:**
- Minimum 6 znaków

**Odpowiedź:**
```json
{
  "data": {
    "email": "user@example.com"
  },
  "success": true,
  "message": "Password changed successfully."
}
```

### Role

#### Lista dostępnych ról
```
GET /api/roles
```

**Wymagana rola:** użytkownik zalogowany (dowolna rola)

**Odpowiedź:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "administrator",
      "display_name": "Administrator",
      "description": "Zarządzanie systemem - pełny dostęp do wszystkich funkcji"
    },
    {
      "id": 2,
      "name": "marketer",
      "display_name": "Marketer",
      "description": "Tworzenie i wysyłanie kampanii mailowych"
    },
    {
      "id": 3,
      "name": "data_administrator",
      "display_name": "Administrator danych",
      "description": "Zarządzanie bazami danych i kontaktami"
    }
  ],
  "success": true,
  "message": "Roles retrieved successfully."
}
```

### Autentykacja

#### Pobranie danych aktualnego użytkownika
```
GET /auth/me
```

**Wymagana rola:** użytkownik zalogowany

**Odpowiedź:**
```json
{
  "data": {
    "email": "user@example.com",
    "name": "Jan Kowalski",
    "customerId": 1,
    "active": true,
    "roles": ["administrator", "marketer"],
    "Customer": {
      "id": 1,
      "name": "Firma XYZ"
    }
  },
  "success": true,
  "message": "User data retrieved successfully."
}
```

#### Logowanie
```
POST /auth/login
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "haslo123"
}
```

**Uwagi:**
- Sprawdza czy konto jest aktywne
- Aktualizuje `last_login` przy udanym logowaniu
- Nieaktywne konta nie mogą się zalogować

**Odpowiedź:**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "success": true,
  "message": "Data received successfully."
}
```

## Middleware zabezpieczeń

Backend dostarcza middleware do sprawdzania ról:

### requireRole(roles)
Sprawdza czy użytkownik ma którąkolwiek z podanych ról.

```javascript
import { requireRole } from '../include/roleMiddleware.js';

// Jeden z: administrator lub marketer
router.get('/campaigns', requireRole(['administrator', 'marketer']), getCampaigns);
```

### requireAllRoles(roles)
Sprawdza czy użytkownik ma wszystkie podane role.

```javascript
import { requireAllRoles } from '../include/roleMiddleware.js';

// Musi mieć obie role
router.post('/advanced', requireAllRoles(['marketer', 'data_administrator']), advancedAction);
```

### Predefiniowane middleware

```javascript
import { requireAdmin, requireMarketer, requireDataAdmin } from '../include/roleMiddleware.js';

router.get('/admin-only', requireAdmin, adminAction);
router.post('/campaigns', requireMarketer, createCampaign);
router.post('/databases', requireDataAdmin, createDatabase);
```

## Przykłady użycia

### Dodanie ochrony do istniejącego endpointa

```javascript
// Przed
router.post('/campaigns', createCampaign);

// Po - tylko użytkownicy z rolą marketer
import { requireMarketer } from '../include/roleMiddleware.js';
router.post('/campaigns', requireMarketer, createCampaign);
```

### Sprawdzenie roli w kontrolerze

```javascript
import Admin from '../include/admin.js';

export async function someAction(req, res) {
    const authHeader = req.headers.authorization;
    const currentUser = await Admin.getCurrentUserData(authHeader);
    
    // Sprawdź pojedynczą rolę
    const isAdmin = await Admin.userHasRole(currentUser.email, 'administrator');
    
    // Sprawdź czy ma którąkolwiek z ról
    const canManageCampaigns = await Admin.userHasAnyRole(
        currentUser.email, 
        ['administrator', 'marketer']
    );
    
    // Sprawdź czy ma wszystkie role
    const hasFullAccess = await Admin.userHasAllRoles(
        currentUser.email,
        ['administrator', 'marketer', 'data_administrator']
    );
}
```

## Bezpieczeństwo

### Zasady bezpieczeństwa

1. **Separacja klientów** - Użytkownik może zarządzać tylko użytkownikami swojego klienta
2. **Ochrona własnego konta** - Nie można usunąć ani dezaktywować własnego konta
3. **Aktywne konta** - Nieaktywne konta nie mogą się logować
4. **Hashowanie haseł** - Hasła hashowane bcrypt (10 rund)
5. **JWT tokeny** - Ważność 24 godziny
6. **Weryfikacja ról** - Sprawdzanie uprawnień przy każdej operacji

### Ograniczenia

- Email jest kluczem głównym (unikalny w całym systemie)
- Zmiana email usuwa stare powiązania i tworzy nowe
- Usunięcie użytkownika jest nieodwracalne
- Jeden użytkownik może należeć tylko do jednego klienta

## Rozszerzanie

### Dodanie nowej roli

1. Dodaj rolę do bazy danych:
```sql
INSERT INTO `roles` (`name`, `display_name`, `description`) 
VALUES ('new_role', 'Nowa Rola', 'Opis nowej roli');
```

2. Utwórz middleware (opcjonalnie):
```javascript
export function requireNewRole(req, res, next) {
    return requireRole('new_role')(req, res, next);
}
```

3. Dodaj tłumaczenia w frontendzie

### Dodanie audytu zmian

Tabela `user_roles_audit` jest przygotowana do logowania zmian. Można dodać triggery SQL:

```sql
DELIMITER $$
CREATE TRIGGER user_roles_after_insert
AFTER INSERT ON user_roles
FOR EACH ROW
BEGIN
    INSERT INTO user_roles_audit (user_email, role_id, action, changed_by, changed_at)
    VALUES (NEW.user_email, NEW.role_id, 'assigned', NEW.assigned_by, NOW());
END$$

CREATE TRIGGER user_roles_after_delete
AFTER DELETE ON user_roles
FOR EACH ROW
BEGIN
    INSERT INTO user_roles_audit (user_email, role_id, action, changed_at)
    VALUES (OLD.user_email, OLD.role_id, 'removed', NOW());
END$$
DELIMITER ;
```

## Testowanie

### Testowanie endpointów

```bash
# Logowanie
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.pl","password":"admin"}'

# Pobranie danych użytkownika
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Lista użytkowników
curl -X GET "http://localhost:3000/api/users?customer_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Tworzenie użytkownika
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "name":"Test User",
    "password":"haslo123",
    "roles":["marketer"],
    "active":true
  }'

# Aktualizacja użytkownika
curl -X PUT http://localhost:3000/api/users/test@example.com \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Updated Name",
    "roles":["marketer","data_administrator"]
  }'

# Zmiana statusu
curl -X PATCH http://localhost:3000/api/users/test@example.com/active \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"active":false}'

# Usunięcie użytkownika
curl -X DELETE http://localhost:3000/api/users/test@example.com \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Migracja istniejących danych

Jeśli masz istniejących użytkowników, możesz przypisać im role:

```sql
-- Przypisz wszystkim istniejącym użytkownikom rolę marketera
INSERT INTO user_roles (user_email, role_id, assigned_by)
SELECT u.email, r.id, 'system'
FROM users u
CROSS JOIN roles r
WHERE r.name = 'marketer'
ON DUPLICATE KEY UPDATE assigned_at = CURRENT_TIMESTAMP;

-- Zaktualizuj nazwiska użytkowników (jeśli masz te dane)
UPDATE users SET name = 'Domyślna Nazwa' WHERE name IS NULL;
```
