# Szybki start - Panel Administracyjny Backend

## Co zostało dodane?

Backend został rozszerzony o pełny system ról użytkowników zgodny z wymaganiami panelu administracyjnego z frontendu.

## Krok 1: Uruchom migrację bazy danych

```bash
# Zaloguj się do MariaDB
mysql -u root -p mailing

# Uruchom migrację
source db/migrations/20241207_add_user_roles_system.sql
```

Alternatywnie możesz uruchomić migrację z pliku:
```bash
mysql -u root -p mailing < db/migrations/20241207_add_user_roles_system.sql
```

## Krok 2: Zrestartuj backend

```bash
npm start
# lub jeśli używasz PM2
pm2 restart mailing-backend
```

## Krok 3: Przetestuj API

### Zaloguj się jako admin
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.pl","password":"admin"}'
```

Odpowiedź zawiera token:
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "success": true
}
```

### Sprawdź dane użytkownika (z rolami)
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer TWÓJ_TOKEN"
```

### Pobierz listę użytkowników
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer TWÓJ_TOKEN"
```

## Struktura dodanych plików

### Migracja bazy danych
- `db/migrations/20241207_add_user_roles_system.sql` - migracja SQL

### Modele
- `src/models/role.model.js` - model roli
- `src/models/userRole.model.js` - model powiązania użytkownik-rola
- `src/models/user.model.js` - zaktualizowany model użytkownika

### Kontrolery
- `src/controller/users.js` - kontroler zarządzania użytkownikami (nowy)
- `src/controller/auth.js` - zaktualizowany (zwraca role)

### Route'y
- `src/routes/users.js` - route'y dla użytkowników (nowy)

### Pomocnicze
- `src/include/admin.js` - zaktualizowany o funkcje ról
- `src/include/auth.js` - zaktualizowany o sprawdzanie statusu active
- `src/include/roleMiddleware.js` - middleware do sprawdzania ról (nowy)

### Dokumentacja
- `docs/ADMIN_PANEL_API.md` - pełna dokumentacja API

## Dostępne endpointy

### Zarządzanie użytkownikami
- `GET /api/users` - lista użytkowników
- `GET /api/users/:email` - szczegóły użytkownika
- `POST /api/users` - tworzenie użytkownika
- `PUT /api/users/:email` - aktualizacja użytkownika
- `DELETE /api/users/:email` - usuwanie użytkownika
- `PATCH /api/users/:email/active` - zmiana statusu aktywności
- `POST /api/users/:email/change-password` - zmiana hasła

### Role
- `GET /api/roles` - lista dostępnych ról

### Autentykacja
- `GET /auth/me` - dane użytkownika (z rolami)
- `POST /auth/login` - logowanie (sprawdza active)

## Przykład użycia w kodzie

### Zabezpieczenie endpointa rolą
```javascript
import { requireAdmin, requireMarketer } from '../include/roleMiddleware.js';

// Tylko administratorzy
router.get('/admin-only', requireAdmin, someFunction);

// Tylko marketerzy
router.post('/campaigns', requireMarketer, createCampaign);

// Administrator lub marketer
import { requireRole } from '../include/roleMiddleware.js';
router.get('/shared', requireRole(['administrator', 'marketer']), sharedFunction);
```

### Sprawdzanie ról w kontrolerze
```javascript
import Admin from '../include/admin.js';

export async function myFunction(req, res) {
    const authHeader = req.headers.authorization;
    const currentUser = await Admin.getCurrentUserData(authHeader);
    
    // currentUser zawiera:
    // - email
    // - name
    // - customerId
    // - active
    // - roles (tablica nazw ról)
    // - Customer (obiekt klienta)
    
    const isAdmin = await Admin.userHasRole(currentUser.email, 'administrator');
}
```

## Domyślne dane

Po migracji:
- Użytkownik `admin@admin.pl` ma rolę `administrator`
- Utworzone są 3 role: `administrator`, `marketer`, `data_administrator`

## Hasło domyślne

Hasło dla `admin@admin.pl` pozostaje niezmienione (to co było wcześniej w bazie).

## Weryfikacja

Sprawdź czy migracja się powiodła:
```sql
-- Pokaż wszystkie role
SELECT * FROM roles;

-- Pokaż powiązania użytkowników z rolami
SELECT u.email, u.name, u.active, r.name as role_name, r.display_name
FROM users u
LEFT JOIN user_roles ur ON u.email = ur.user_email
LEFT JOIN roles r ON ur.role_id = r.id;
```

## Integracja z frontendem

Frontend powinien:
1. Używać nowych endpointów z `/api/*`
2. Sprawdzać `roles` w odpowiedzi z `/auth/me`
3. Wyświetlać odpowiednie UI dla użytkowników z rolą `administrator`

## Troubleshooting

### Token nie działa
- Sprawdź czy backend używa tego samego `privateKey` w `src/include/auth.js`
- Upewnij się że token jest świeży (ważność 24h)

### Brak uprawnień mimo poprawnej roli
- Sprawdź w bazie czy użytkownik ma przypisaną rolę: `SELECT * FROM user_roles WHERE user_email = 'twoj@email.com'`
- Sprawdź czy konto jest aktywne: `SELECT active FROM users WHERE email = 'twoj@email.com'`

### Błąd przy migracji "Table already exists"
- Migracja jest idempotentna (używa `IF NOT EXISTS`)
- Możesz uruchomić ją ponownie bez obaw

## Następne kroki

1. Przetestuj wszystkie endpointy
2. Dodaj pozostałych użytkowników przez API lub frontend
3. Zabezpiecz istniejące endpointy odpowiednimi middleware ról
4. Dostosuj frontend do nowego formatu danych z `/auth/me`

## Potrzebujesz pomocy?

Zobacz pełną dokumentację w `docs/ADMIN_PANEL_API.md`
