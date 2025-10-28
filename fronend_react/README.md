# Panel Mailingowy - Frontend React

Aplikacja React z TypeScript do zarządzania systemem mailingowym. Zbudowana przy użyciu Vite z obsługą autoryzacji i komunikacją z backendem.

## 🚀 Szybki start

### Instalacja

```bash
npm install
```

### Konfiguracja

1. Skopiuj przykładowy plik środowiskowy:
```bash
cp .env.example .env.local
```

2. Edytuj `.env.local` i ustaw adres swojego backendu:
```env
VITE_API_URL=http://localhost:3000
VITE_DEBUG=true
```

### Uruchomienie

```bash
# Rozwój
npm run dev

# Build produkcyjny
npm run build

# Podgląd buildu
npm run preview
```

## 🔧 Konfiguracja API

Aplikacja automatycznie wykrywa środowisko i używa odpowiedniego adresu API:

- **Development**: `http://localhost:3000` (lub z `VITE_API_URL`)
- **Production**: URL z zmiennej `VITE_API_URL`

### Struktura API

Aplikacja oczekuje następujących endpointów:

```
POST /auth/login     - Logowanie użytkownika
POST /auth/logout    - Wylogowanie użytkownika  
GET  /auth/verify    - Weryfikacja tokenu
POST /auth/refresh   - Odświeżenie tokenu
```

### Przykład odpowiedzi z backendu

```json
{
  "data": {
    "user": {
      "id": "123",
      "email": "user@example.com",
      "firstName": "Jan",
      "lastName": "Kowalski"
    },
    "token": "jwt_token_here"
  },
  "success": true,
  "message": "Logowanie zakończone sukcesem"
}
```

## 📁 Struktura projektu

```
src/
├── components/     # Komponenty React
├── contexts/      # React Contexts (AuthContext)
├── pages/         # Strony aplikacji
├── services/      # Serwisy API
├── types/         # Definicje TypeScript
├── config/        # Konfiguracja aplikacji
└── assets/        # Zasoby statyczne
```

## 🔒 Autoryzacja

Aplikacja używa JWT tokenów do autoryzacji. Token jest automatycznie dołączany do wszystkich requestów API po zalogowaniu.

## 🎨 Technologie

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
