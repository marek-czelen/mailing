# Placeholdery - Dokumentacja

## Przegląd

System placeholderów w klasie Mail umożliwia personalizację treści e-maili przez zastępowanie specjalnych znaczników rzeczywistymi wartościami. Placeholdery używają składni `{{PLACEHOLDER_NAME}}` lub `{{PLACEHOLDER_NAME|wartość_domyślna}}`.

## Format placeholderów

### Podstawowy format
```
{{PLACEHOLDER_NAME}}
```

### Format z wartością domyślną
```
{{PLACEHOLDER_NAME|wartość_domyślna}}
```

Jeśli placeholder nie zostanie znaleziony, użyta zostanie wartość domyślna. Jeśli nie ma wartości domyślnej, placeholder pozostanie niezmieniony.

## Domyślne placeholdery systemowe

Klasa Mail automatycznie udostępnia następujące placeholdery:

### Daty i czas
- `{{CURRENT_YEAR}}` - Aktualny rok (np. 2025)
- `{{CURRENT_DATE}}` - Aktualna data w formacie polskim (np. 2.11.2025)
- `{{CURRENT_DATETIME}}` - Aktualna data i czas (np. 2.11.2025, 14:30:15)

### Informacje o firmie (z zmiennych środowiskowych)
- `{{COMPANY_NAME}}` - Nazwa firmy (z `process.env.COMPANY_NAME` lub "Nasza Firma")
- `{{WEBSITE_URL}}` - URL strony internetowej (z `process.env.WEBSITE_URL` lub "https://example.com")
- `{{SUPPORT_EMAIL}}` - Adres email wsparcia (z `process.env.SUPPORT_EMAIL` lub "support@example.com")

## Placeholdery użytkownika

### Dane osobowe
- `{{FIRST_NAME}}` - Imię użytkownika
- `{{LAST_NAME}}` - Nazwisko użytkownika
- `{{FULL_NAME}}` - Pełne imię i nazwisko
- `{{EMAIL}}` - Adres email użytkownika
- `{{PHONE}}` - Numer telefonu użytkownika

### Dane firmowe klienta
- `{{CUSTOMER_COMPANY_NAME}}` - Nazwa firmy klienta
- `{{CUSTOMER_ADDRESS}}` - Adres firmy klienta
- `{{CUSTOMER_CITY}}` - Miasto firmy klienta
- `{{CUSTOMER_POSTAL_CODE}}` - Kod pocztowy firmy klienta

### Marketing i promocje
- `{{PROMO_CODE}}` - Kod promocyjny
- `{{DISCOUNT}}` - Wysokość zniżki (np. "20" dla 20%)
- `{{OFFER_TITLE}}` - Tytuł oferty
- `{{OFFER_DESCRIPTION}}` - Opis oferty
- `{{CAMPAIGN_NAME}}` - Nazwa kampanii marketingowej

### Linki i URLs
- `{{WEBSITE_URL}}` - URL głównej strony
- `{{PRODUCT_URL}}` - URL do produktu
- `{{CATEGORY_URL}}` - URL do kategorii
- `{{UNSUBSCRIBE_LINK}}` - Link do wypisania się z newslettera
- `{{PROFILE_URL}}` - Link do profilu użytkownika
- `{{LOGIN_URL}}` - Link do logowania

### E-commerce
- `{{ORDER_NUMBER}}` - Numer zamówienia
- `{{ORDER_TOTAL}}` - Wartość zamówienia
- `{{PRODUCT_NAME}}` - Nazwa produktu
- `{{PRODUCT_PRICE}}` - Cena produktu
- `{{SHIPPING_ADDRESS}}` - Adres dostawy
- `{{DELIVERY_DATE}}` - Data dostawy

## Placeholdery RODO i prawne

### Zgodność z RODO
- `{{RODO_FOOTER}}` - Stopka z informacjami o RODO
- `{{PRIVACY_POLICY_URL}}` - Link do polityki prywatności
- `{{TERMS_URL}}` - Link do regulaminu
- `{{UNSUBSCRIBE_LINK}}` - Link do wypisania się (obowiązkowy dla marketingu)
- `{{DATA_CONTROLLER}}` - Administrator danych osobowych

### Przykład stopki RODO
```html
<p style="font-size: 12px; color: #666;">
  {{RODO_FOOTER|Przetwarzamy Państwa dane osobowe w celu prowadzenia działań marketingowych. Mają Państwo prawo do wycofania zgody w dowolnym momencie.}}
</p>

<p style="font-size: 12px; color: #666;">
  Jeśli nie chcą Państwo otrzymywać dalszych wiadomości, mogą się Państwo wypisać z listy mailingowej klikając: 
  <a href="{{UNSUBSCRIBE_LINK}}">tutaj</a>
</p>

<p style="font-size: 12px; color: #666;">
  W przypadku pytań dotyczących przetwarzania danych osobowych, prosimy o kontakt na adres: 
  <a href="mailto:{{SUPPORT_EMAIL}}">{{SUPPORT_EMAIL}}</a>
</p>
```

## Przykłady użycia placeholderów

### 1. Newsletter z personalizacją

```html
<h1>Witaj {{FIRST_NAME|Drogi Kliencie}}!</h1>

<p>Dziękujemy za zainteresowanie produktami firmy {{COMPANY_NAME}}.</p>

<p>Specjalnie dla Ciebie przygotowaliśmy kod promocyjny <strong>{{PROMO_CODE}}</strong> 
   dający {{DISCOUNT}}% zniżki na wszystkie produkty.</p>

<div style="text-align: center;">
  <a href="{{WEBSITE_URL}}/shop?code={{PROMO_CODE}}" 
     style="background: #e74c3c; color: white; padding: 15px 30px; text-decoration: none;">
    Skorzystaj z oferty
  </a>
</div>

<p>Promocja ważna do {{CURRENT_DATE}}.</p>

<hr>

<p style="font-size: 12px;">
  {{RODO_FOOTER}}
</p>
```

### 2. Potwierdzenie zamówienia

```html
<h1>Potwierdzenie zamówienia #{{ORDER_NUMBER}}</h1>

<p>Cześć {{FIRST_NAME}}!</p>

<p>Dziękujemy za złożenie zamówienia w sklepie {{COMPANY_NAME}}.</p>

<h2>Szczegóły zamówienia:</h2>
<ul>
  <li>Numer zamówienia: <strong>{{ORDER_NUMBER}}</strong></li>
  <li>Produkt: {{PRODUCT_NAME}}</li>
  <li>Wartość: {{ORDER_TOTAL}} PLN</li>
  <li>Adres dostawy: {{SHIPPING_ADDRESS}}</li>
  <li>Przewidywana data dostawy: {{DELIVERY_DATE}}</li>
</ul>

<p>Status zamówienia możesz sprawdzić <a href="{{PROFILE_URL}}/orders">tutaj</a>.</p>
```

### 3. Email powitalny

```html
<h1>Witamy w {{COMPANY_NAME}}!</h1>

<p>Cześć {{FIRST_NAME}}!</p>

<p>Cieszymy się, że dołączyłeś do naszej społeczności. Twoje konto zostało pomyślnie utworzone.</p>

<h2>Co możesz teraz zrobić:</h2>
<ul>
  <li><a href="{{PROFILE_URL}}">Uzupełnij swój profil</a></li>
  <li><a href="{{WEBSITE_URL}}/products">Przeglądaj nasze produkty</a></li>
  <li><a href="{{WEBSITE_URL}}/offers">Zobacz aktualne oferty</a></li>
</ul>

<p>Jako bonus za rejestrację otrzymujesz kod zniżkowy: <strong>{{PROMO_CODE}}</strong></p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{LOGIN_URL}}" 
     style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
    Zaloguj się do konta
  </a>
</div>
```

### 4. Przypomnienie o koszyku

```html
<h1>Nie zapomnij o swoich produktach!</h1>

<p>Cześć {{FIRST_NAME}}!</p>

<p>Zauważyliśmy, że zostawiłeś produkty w koszyku na stronie {{COMPANY_NAME}}. 
   Nie chcemy, żebyś stracił okazję na zakup:</p>

<h2>Twoje produkty:</h2>
<p><strong>{{PRODUCT_NAME}}</strong> - {{PRODUCT_PRICE}} PLN</p>

<p>Specjalnie dla Ciebie przygotowaliśmy zniżkę {{DISCOUNT}}% na ten zakup!</p>

<div style="text-align: center;">
  <a href="{{WEBSITE_URL}}/cart" 
     style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none;">
    Dokończ zakup ze zniżką
  </a>
</div>

<p><small>Oferta ważna do {{CURRENT_DATE}}.</small></p>
```

## Użycie w kodzie

### Podstawowe przetwarzanie

```javascript
const html = `
  <h1>Witaj {{FIRST_NAME}}!</h1>
  <p>Twoja firma: {{COMPANY_NAME}}</p>
`;

const processed = Mail.processPlaceholders(html, {
  FIRST_NAME: 'Jan',
  COMPANY_NAME: 'ABC Corp'
});
```

### Z wartościami domyślnymi

```javascript
const html = `
  <p>Witaj {{FIRST_NAME|Użytkowniku}}!</p>
  <p>Zniżka: {{DISCOUNT|10}}%</p>
`;

// Jeśli FIRST_NAME nie jest podany, użyje "Użytkowniku"
// Jeśli DISCOUNT nie jest podany, użyje "10"
```

### Globalne i lokalne placeholdery

```javascript
// W masowym wysyłaniu
await Mail.sendBulkEmails({
  // ... konfiguracja SMTP
  globalPlaceholders: {
    COMPANY_NAME: 'ABC Corp',
    WEBSITE_URL: 'https://abc-corp.com'
  },
  emails: [
    {
      to: 'jan@example.com',
      html: 'Witaj {{FIRST_NAME}} w {{COMPANY_NAME}}!',
      placeholders: {
        FIRST_NAME: 'Jan'  // Lokalne placeholdery mają pierwszeństwo
      }
    }
  ]
});
```

## Rozszerzanie systemu placeholderów

### Dodawanie własnych domyślnych placeholderów

```javascript
// Można rozszerzyć DEFAULT_PLACEHOLDERS
Mail.DEFAULT_PLACEHOLDERS.CUSTOM_PLACEHOLDER = () => 'Wartość';

// Lub podczas przetwarzania
Mail.processPlaceholders(html, placeholders, {
  CUSTOM_GLOBAL: 'Globalna wartość'
});
```

### Placeholdery funkcyjne

```javascript
const placeholders = {
  CURRENT_TIME: () => new Date().toLocaleTimeString(),
  RANDOM_NUMBER: () => Math.floor(Math.random() * 1000),
  FORMATTED_PRICE: (price) => `${price} PLN`
};
```

## Najlepsze praktyki

### 1. Nazywanie placeholderów
- Używaj WIELKICH_LITER_Z_PODKREŚLENIAMI
- Nazwy powinny być opisowe (np. `USER_FIRST_NAME` zamiast `FN`)
- Grupuj powiązane placeholdery (np. `ORDER_*`, `USER_*`)

### 2. Wartości domyślne
- Zawsze podawaj sensowne wartości domyślne
- Używaj uniwersalnych form adresowania (np. "Drogi Kliencie")

### 3. Bezpieczeństwo
- Nie umieszczaj wrażliwych danych w placeholderach
- Waliduj dane przed wstawianiem do placeholderów
- Escapuj HTML jeśli dane pochodzą od użytkowników

### 4. Wydajność
- Unikaj złożonych funkcji w placeholderach
- Cache'uj często używane wartości
- Nie wykonuj zapytań do bazy danych w funkcjach placeholderów

## Zgodność z RODO

### Obowiązkowe elementy

Każdy email marketingowy musi zawierać:

1. **Informację o administratorze danych**
2. **Podstawę prawną przetwarzania**
3. **Możliwość wycofania zgody**
4. **Link do wypisania się**

### Przykład stopki zgodnej z RODO

```html
<div style="border-top: 1px solid #ccc; margin-top: 30px; padding-top: 20px; font-size: 12px; color: #666;">
  
  <p><strong>Informacja o przetwarzaniu danych osobowych:</strong></p>
  
  <p>Administratorem Państwa danych osobowych jest {{COMPANY_NAME}} z siedzibą w {{COMPANY_ADDRESS}}.</p>
  
  <p>Przetwarzamy Państwa dane osobowe w celu prowadzenia działań marketingowych na podstawie wyrażonej zgody (art. 6 ust. 1 lit. a RODO).</p>
  
  <p>Mają Państwo prawo do:
  <ul>
    <li>dostępu do swoich danych osobowych</li>
    <li>ich sprostowania</li>
    <li>usunięcia</li>
    <li>ograniczenia przetwarzania</li>
    <li>przenoszenia danych</li>
    <li>wniesienia sprzeciwu wobec przetwarzania</li>
    <li>wycofania zgody w dowolnym momencie</li>
  </ul>
  </p>
  
  <p>W przypadku pytań dotyczących przetwarzania danych osobowych prosimy o kontakt: <a href="mailto:{{SUPPORT_EMAIL}}">{{SUPPORT_EMAIL}}</a></p>
  
  <p><a href="{{PRIVACY_POLICY_URL}}">Pełna polityka prywatności</a></p>
  
  <hr style="margin: 20px 0;">
  
  <p>Jeśli nie chcą Państwo otrzymywać dalszych wiadomości marketingowych, mogą się Państwo <a href="{{UNSUBSCRIBE_LINK}}">wypisać z listy mailingowej</a>.</p>
  
</div>
```

Ten system placeholderów jest kompatybilny z istniejącym systemem szablonów w bazie danych i może być łatwo rozszerzony o dodatkowe placeholdery według potrzeb aplikacji.