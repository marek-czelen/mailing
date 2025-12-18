# Panel Administracyjny - Dokumentacja

## Przegląd

Panel administracyjny to moduł przeznaczony wyłącznie dla użytkowników z uprawnieniami administratora. Umożliwia zarządzanie użytkownikami w obrębie klienta oraz przydzielanie im ról i uprawnień.

## Dostęp do panelu

Panel administracyjny jest dostępny pod adresem `/admin` i pojawia się w głównym menu nawigacyjnym tylko dla użytkowników z rolą **Administrator**.

### Zabezpieczenia

- Router automatycznie sprawdza uprawnienia przed udostępnieniem widoku
- Użytkownicy bez roli administratora są przekierowywani na dashboard
- Komponent wyświetla komunikat o braku dostępu dla nieuprawnionych użytkowników

## Role użytkowników

System definiuje trzy główne role:

### 1. Administrator (`administrator`)
- **Opis**: Zarządzanie systemem - pełny dostęp do wszystkich funkcji
- **Uprawnienia**:
  - Tworzenie nowych użytkowników
  - Edycja użytkowników
  - Usuwanie użytkowników
  - Zarządzanie rolami wszystkich użytkowników
  - Aktywacja/dezaktywacja kont
  - Dostęp do panelu administracyjnego

### 2. Marketer (`marketer`)
- **Opis**: Tworzenie i wysyłanie kampanii mailowych
- **Uprawnienia**:
  - Tworzenie kampanii
  - Edycja kampanii
  - Wysyłanie kampanii
  - Przeglądanie statystyk kampanii
  - Dostęp do edytora email

### 3. Administrator danych (`data_administrator`)
- **Opis**: Zarządzanie bazami danych i kontaktami
- **Uprawnienia**:
  - Tworzenie baz danych
  - Edycja baz danych
  - Import kontaktów
  - Zarządzanie polami bazy danych
  - Tworzenie segmentów

### Wiele ról jednocześnie

Użytkownik może mieć **wiele ról przypisanych jednocześnie**. Na przykład:
- Administrator + Marketer + Administrator danych (pełny dostęp)
- Marketer + Administrator danych (bez dostępu do zarządzania użytkownikami)

## Funkcje panelu administracyjnego

### Zarządzanie użytkownikami

#### Lista użytkowników
- Wyświetla tabelę wszystkich użytkowników w obrębie klienta
- Kolumny:
  - **Nazwa** - Imię i nazwisko z avatarem (inicjały)
  - **Email** - Adres email użytkownika
  - **Role** - Kolorowe chipy z przypisanymi rolami
  - **Status** - Aktywny/Nieaktywny
  - **Akcje** - Menu kontekstowe z dostępnymi akcjami

#### Tworzenie nowego użytkownika
1. Kliknij przycisk **"Utwórz użytkownika"**
2. Wypełnij formularz:
   - Imię i nazwisko
   - Adres email
   - Hasło (min. 6 znaków)
   - Potwierdzenie hasła
   - Wybór ról (wymagana przynajmniej jedna)
   - Status aktywny/nieaktywny
3. Kliknij **"Zapisz"**

#### Edycja użytkownika
1. W menu akcji użytkownika wybierz **"Edytuj"**
2. Możesz zmienić:
   - Imię i nazwisko
   - Adres email
   - Role użytkownika
   - Status konta
   - Hasło (opcjonalnie - kliknij "Zmień hasło")
3. Kliknij **"Zapisz"**

#### Aktywacja/Dezaktywacja konta
- W menu akcji wybierz **"Aktywuj"** lub **"Dezaktywuj"**
- Nieaktywne konto nie może się zalogować do systemu
- Dane użytkownika są zachowane

#### Usuwanie użytkownika
1. W menu akcji wybierz **"Usuń"**
2. Potwierdź usunięcie w oknie dialogowym
3. **Uwaga**: Akcja jest nieodwracalna

## Struktura plików

### Serwisy

**`src/services/users.js`**
- Serwis do komunikacji z API
- Metody do zarządzania użytkownikami:
  - `getUsers()` - lista użytkowników
  - `getUser(id)` - szczegóły użytkownika
  - `createUser(data)` - tworzenie użytkownika
  - `updateUser(id, data)` - aktualizacja użytkownika
  - `deleteUser(id)` - usunięcie użytkownika
  - `updateUserRoles(id, roles)` - aktualizacja ról
  - `setUserActive(id, active)` - aktywacja/dezaktywacja
  - `isCurrentUserAdmin()` - sprawdzenie uprawnień
  - `currentUserHasRole(role)` - sprawdzenie roli

### Komponenty

**`src/components/admin/UsersTable.vue`**
- Tabela z listą użytkowników
- Obsługa akcji CRUD
- Zarządzanie dialogami i powiadomieniami

**`src/components/admin/UserDialog.vue`**
- Dialog tworzenia/edycji użytkownika
- Formularz z walidacją
- Wybór wielu ról jednocześnie

### Widoki

**`src/views/AdminView.vue`**
- Główny widok panelu administracyjnego
- Sprawdzanie uprawnień
- System zakładek (przygotowany do rozbudowy)

### Routing

**`src/router/index.js`**
- Trasa `/admin` z zabezpieczeniem `requiresAdmin`
- Guard sprawdzający uprawnienia przed dostępem

### Tłumaczenia

**`src/locales/pl.json`** i **`src/locales/en.json`**
- Sekcja `admin.*` zawiera wszystkie tłumaczenia
- Wspiera język polski i angielski

## API Endpoints (wymagane)

Panel administracyjny wymaga następujących endpointów API:

### Użytkownicy
- `GET /users?customer_id={id}` - lista użytkowników
- `GET /users/{id}` - szczegóły użytkownika
- `POST /users` - tworzenie użytkownika
- `PUT /users/{id}` - aktualizacja użytkownika
- `DELETE /users/{id}` - usunięcie użytkownika
- `PATCH /users/{id}/active` - zmiana statusu aktywności
- `POST /users/{id}/change-password` - zmiana hasła

### Autentykacja
- `GET /auth/me` - dane aktualnego użytkownika (z rolami)
- `POST /auth/login` - logowanie (zwraca token + dane użytkownika z rolami)

### Struktura danych użytkownika

```json
{
  "id": 1,
  "customer_id": 1,
  "name": "Jan Kowalski",
  "email": "jan.kowalski@example.com",
  "roles": ["administrator", "marketer"],
  "active": true,
  "created_at": "2024-01-01T10:00:00Z",
  "last_login": "2024-12-07T08:30:00Z"
}
```

## Rozszerzanie funkcjonalności

### Dodawanie nowych ról

1. Dodaj nową rolę do `UsersService.ROLES`:
```javascript
static ROLES = {
  ADMINISTRATOR: 'administrator',
  MARKETER: 'marketer',
  DATA_ADMINISTRATOR: 'data_administrator',
  NEW_ROLE: 'new_role' // Nowa rola
};
```

2. Dodaj opis roli do `UsersService.ROLE_DESCRIPTIONS`

3. Dodaj tłumaczenia w `pl.json` i `en.json`:
```json
"admin": {
  "roles": {
    "new_role": "Nowa Rola",
    "descriptions": {
      "new_role": "Opis nowej roli"
    }
  }
}
```

### Dodawanie nowych zakładek w panelu

Panel jest przygotowany do rozbudowy o kolejne zakładki (np. logi aktywności, raporty uprawnień):

1. Dodaj nowy `v-tab` w `AdminView.vue`
2. Dodaj odpowiedni `v-window-item` z zawartością
3. Utwórz dedykowany komponent dla nowej zakładki

## Bezpieczeństwo

- Wszystkie operacje są wykonywane po stronie serwera z weryfikacją uprawnień
- Token autoryzacyjny jest wysyłany z każdym żądaniem
- Role użytkownika są sprawdzane przy każdej operacji
- Użytkownik może zarządzać tylko użytkownikami w obrębie swojego klienta
- Hasła są hashowane po stronie serwera

## Rozwój i utrzymanie

### Testowanie
- Przetestuj wszystkie funkcje jako administrator
- Sprawdź zabezpieczenia - spróbuj uzyskać dostęp bez uprawnień
- Zweryfikuj walidację formularzy
- Sprawdź zachowanie przy błędach API

### Znane ograniczenia
- Brak historii zmian użytkowników (można dodać w przyszłości)
- Brak masowych operacji (np. masowa aktywacja)
- Brak eksportu listy użytkowników

### Planowane funkcje
- Historia aktywności użytkowników
- Szczegółowe logi zmian uprawnień
- Zaawansowane filtrowanie i wyszukiwanie
- Eksport raportu użytkowników
- Zarządzanie zespołami/grupami użytkowników
