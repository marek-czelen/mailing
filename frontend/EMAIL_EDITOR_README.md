# Email Editor - Vue Email Templates

Ten komponent zapewnia kompletny edytor szablonów mailowych zbudowany z użyciem biblioteki Vue Email.

## Funkcjonalności

- ✅ Edycja szablonów mailowych w czasie rzeczywistym
- ✅ Podgląd desktop i mobile
- ✅ Trzy gotowe szablony (Podstawowy, Promocyjny, Newsletter)
- ✅ Generowanie HTML gotowego do wysyłki
- ✅ Kopiowanie kodu HTML do schowka
- ✅ Integracja z Vue 3 i Vuetify

## Dostępne szablony

### 1. Podstawowy (EmailTemplate.vue)
- Logo firmy
- Główny tytuł i tekst
- Przycisk CTA
- Stopka

### 2. Promocyjny (PromoEmailTemplate.vue)
- Hero section z gradientem
- Sekcja funkcjonalności z ikonami
- Atrakcyjny design promocyjny
- Zaawansowane stylowanie

### 3. Newsletter (NewsletterTemplate.vue)
- Profesjonalny design newslettera
- Sekcja z cytatem/highlight
- Personalizacja (imię odbiorcy)
- Podpis nadawcy

## Użytkowanie

### Podstawowe użycie w komponencie
```vue
<template>
  <EmailEditor 
    @send-test-email="handleSendTestEmail"
    @error="handleError"
    @success="handleSuccess"
  />
</template>

<script>
import EmailEditor from '@/components/EmailEditor.vue';

export default {
  components: { EmailEditor },
  methods: {
    handleSendTestEmail(emailData) {
      console.log('Dane e-maila:', emailData);
      // Implementacja wysyłania e-maila
    },
    handleError(message) {
      // Obsługa błędów
    },
    handleSuccess(message) {
      // Obsługa sukcesu
    }
  }
};
</script>
```

### Routing
```javascript
// router/index.js
{
  path: '/email-editor',
  name: 'EmailEditor',
  component: () => import('@/views/EmailEditorView.vue')
}
```

## Struktura plików

```
src/
├── components/
│   ├── EmailEditor.vue              # Główny edytor
│   ├── EmailTemplate.vue            # Szablon podstawowy
│   └── templates/
│       ├── PromoEmailTemplate.vue   # Szablon promocyjny
│       └── NewsletterTemplate.vue   # Szablon newslettera
└── views/
    ├── EmailEditorView.vue          # Widok z editorem
    └── EmailEditorDemo.vue          # Demo editora
```

## Events

### @send-test-email
Emitowany przy kliknięciu "Wyślij test"
```javascript
{
  html: 'HTML e-maila',
  subject: 'Temat e-maila', 
  previewText: 'Tekst podglądu'
}
```

### @error
Emitowany przy błędach
```javascript
'Komunikat błędu'
```

### @success
Emitowany przy sukcesie
```javascript
'Komunikat sukcesu'
```

## Konfiguracja

### Wymagane zależności
```json
{
  "@vue-email/components": "^0.0.21",
  "@vue-email/render": "^0.0.9",
  "vue": "^3.5.18",
  "vuetify": "^3.9.7"
}
```

### Instalacja
```bash
npm install @vue-email/render @vue-email/components
```

## Dostosowanie

### Dodawanie nowych szablonów

1. Utwórz nowy plik szablonu w `src/components/templates/`
2. Zaimportuj komponenty z `@vue-email/components`
3. Dodaj szablon do `EmailEditor.vue`:

```javascript
import NewTemplate from './templates/NewTemplate.vue';

// W data()
templates: [
  // ...
  { value: 'new', text: 'Nowy szablon' }
]

// W generateHtml()
case 'new':
  templateComponent = NewTemplate;
  templateProps = { /* props */ };
  break;
```

### Stylowanie
Szablony używają inline CSS dla maksymalnej kompatybilności z klientami email. Każdy szablon ma własne style zdefiniowane bezpośrednio w atrybutach `style`.

## Wsparcie klientów email

Szablony są zoptymalizowane dla:
- ✅ Gmail
- ✅ Outlook (2016+)
- ✅ Apple Mail
- ✅ Yahoo Mail
- ✅ Thunderbird
- ✅ Klienty mobilne

## Troubleshooting

### Błąd renderowania
Jeśli Vue Email nie może wyrenderować szablonu, edytor automatycznie przełączy się na fallback HTML.

### Problemy z stylowaniem
Sprawdź czy używasz inline CSS i unikasz zewnętrznych arkuszy stylów.

### Brakujące komponenty
Upewnij się, że wszystkie komponenty Vue Email są prawidłowo zaimportowane.