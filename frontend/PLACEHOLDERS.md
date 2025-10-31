# Email Campaign Placeholders

Ten dokument opisuje dostępne placeholdery używane w kampaniach email marketingowych.

## Placeholdery RODO i wypisywania się

### `{{CONTACT_ID}}`
- **Opis**: Unikalny identyfikator kontaktu w bazie danych
- **Użycie**: W linkach do wypisania się z mailingów
- **Przykład**: `https://example.com/unsubscribe?contactId={{CONTACT_ID}}`
- **Przetwarzanie**: Placeholder jest zastępowany podczas wysyłki emaila rzeczywistym ID kontaktu

### `{{UNSUBSCRIBE_URL}}`
- **Opis**: Bazowy URL do wypisywania się z mailingów
- **Użycie**: W stopkach emaili zgodnie z RODO
- **Przykład**: `{{UNSUBSCRIBE_URL}}?contactId={{CONTACT_ID}}`
- **Wartość domyślna**: Konfigurowana w systemie backendowym

## Inne dostępne placeholdery

### `{{CONTACT_FIRST_NAME}}`
- **Opis**: Imię kontaktu
- **Użycie**: Personalizacja wiadomości
- **Przykład**: `Cześć {{CONTACT_FIRST_NAME}}!`

### `{{CONTACT_LAST_NAME}}`
- **Opis**: Nazwisko kontaktu
- **Użycie**: Formalne zwroty
- **Przykład**: `Szanowny/a {{CONTACT_FIRST_NAME}} {{CONTACT_LAST_NAME}}`

### `{{CONTACT_EMAIL}}`
- **Opis**: Adres email kontaktu
- **Użycie**: W treści emaila dla potwierdzenia
- **Przykład**: `Ten email został wysłany na adres: {{CONTACT_EMAIL}}`

### `{{COMPANY_NAME}}`
- **Opis**: Nazwa firmy nadawcy
- **Użycie**: W stopkach i nagłówkach
- **Przykład**: `© {{COMPANY_NAME}} - Wszystkie prawa zastrzeżone`

### `{{CAMPAIGN_NAME}}`
- **Opis**: Nazwa kampanii
- **Użycie**: W temacie lub treści dla identyfikacji
- **Przykład**: `Kampania: {{CAMPAIGN_NAME}}`

## Składnia placeholderów

- Placeholdery są otoczone podwójnymi nawiasami klamrowymi: `{{PLACEHOLDER_NAME}}`
- Nazwy placeholderów są pisane WIELKIMI LITERAMI
- Słowa w nazwach placeholderów są oddzielone podkreśleniami
- Placeholdery są case-sensitive (rozróżniają wielkość liter)

## Przykłady użycia w stopce RODO

```html
<div style="font-size: 12px; color: #666; text-align: center;">
  <p>Otrzymujesz ten email, ponieważ wyraziłeś zgodę na otrzymywanie informacji od {{COMPANY_NAME}}.</p>
  <p>Twoje dane są przetwarzane zgodnie z RODO.</p>
  <p>
    <a href="{{UNSUBSCRIBE_URL}}?contactId={{CONTACT_ID}}">
      Wypisz się z listy mailingowej
    </a>
  </p>
  <p>Email wysłany do: {{CONTACT_EMAIL}}</p>
</div>
```

## Uwagi techniczne

1. **Bezpieczeństwo**: Placeholdery są przetwarzane po stronie serwera podczas wysyłki
2. **Enkodowanie**: Wartości są automatycznie enkodowane dla bezpieczeństwa HTML
3. **Fallback**: Jeśli wartość placeholdera jest pusta, może zostać zastąpiona wartością domyślną
4. **Walidacja**: System sprawdza poprawność składni placeholderów przed wysyłką

## Backend Implementation

Backend powinien implementować następujące funkcjonalności:

1. **Parsowanie placeholderów**: Znajdowanie wszystkich placeholderów w treści HTML
2. **Zamiana wartości**: Zastępowanie placeholderów rzeczywistymi danymi kontaktu
3. **Obsługa błędów**: Działanie gdy dane kontaktu są niepełne
4. **Logowanie**: Śledzenie użycia placeholderów dla debugowania