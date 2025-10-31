# 📧 SYSTEM ZARZĄDZANIA TEMPLATAMI EMAIL - MIGRACJA Z JSON DO MYSQL

## 🎯 Cel migracji

Przenieść system templat z plików JSON do bazy MySQL z pełną obsługą API, lepszą wydajnością i możliwościami zarządzania.

## 📁 Struktura plików

### Backend
```
backend/
├── models/
│   ├── EmailTemplate.js      # Model Sequelize dla templat
│   └── TemplateBlock.js      # Model Sequelize dla bloków
├── migrations/
│   ├── 20251031-create-email-templates.js     # Utworzenie tabeli email_templates
│   ├── 20251031-create-template-blocks.js     # Utworzenie tabeli template_blocks
│   └── 20251031-seed-default-templates.js     # Domyślne templaty systemowe
├── controllers/
│   └── TemplatesController.js                 # Kontroler API dla templat
├── routes/
│   └── templates.js                           # Routes dla API templat
└── scripts/
    └── migrate-templates-to-mysql.js          # Skrypt migracji JSON→MySQL
```

### Frontend
```
frontend/src/
├── services/
│   └── templates.js                           # Serwis API dla templat
└── components/
    └── BlockEmailEditor.vue                   # Zmodyfikowany edytor (API zamiast JSON)
```

## 🗄️ Struktura bazy danych

### Tabela `email_templates`
```sql
CREATE TABLE email_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) DEFAULT 'Inne',
  thumbnail TEXT,                     -- Base64 SVG lub URL
  tags JSON,                          -- Tablica tagów
  author VARCHAR(255) DEFAULT 'System',
  version VARCHAR(50) DEFAULT '1.0',
  isActive BOOLEAN DEFAULT TRUE,
  isSystem BOOLEAN DEFAULT FALSE,     -- Czy template systemowy
  isPublic BOOLEAN DEFAULT TRUE,      -- Czy dostępny dla wszystkich
  customerId INT,                     -- Multi-tenant support
  usageCount INT DEFAULT 0,           -- Statystyki użycia
  lastUsedAt DATETIME,
  metadata JSON,                      -- Dodatkowe informacje
  createdAt DATETIME,
  updatedAt DATETIME,
  deletedAt DATETIME                  -- Soft delete
);
```

### Tabela `template_blocks`
```sql
CREATE TABLE template_blocks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  templateId INT NOT NULL,            -- FK do email_templates
  blockType VARCHAR(50) NOT NULL,     -- text, button, image, spacer, etc.
  blockOrder INT DEFAULT 0,           -- Kolejność w template
  content JSON NOT NULL,              -- Zawartość bloku
  style JSON NOT NULL,                -- Style (marginesy, wyrównanie)
  isActive BOOLEAN DEFAULT TRUE,
  metadata JSON,                      -- Metadane bloku
  createdAt DATETIME,
  updatedAt DATETIME,
  FOREIGN KEY (templateId) REFERENCES email_templates(id) ON DELETE CASCADE
);
```

## 🚀 Instrukcja wdrożenia

### 1. Backend - Konfiguracja bazy danych

```bash
# 1. Uruchom migracje
npx sequelize-cli db:migrate

# 2. Opcjonalnie - załaduj przykładowe dane
npx sequelize-cli db:seed:all

# 3. Migruj istniejące templaty JSON (jeśli istnieją)
node scripts/migrate-templates-to-mysql.js --force --backup
```

### 2. Backend - Integracja API

W głównym pliku `app.js` lub `server.js`:

```javascript
const templatesRoutes = require('./routes/templates');

// Dodaj routes dla templat
app.use('/mailing/templates', templatesRoutes);

// Upewnij się że modele są załadowane
const { EmailTemplate, TemplateBlock } = require('./models');
```

### 3. Frontend - Aktualizacja kodu

Kod został automatycznie zaktualizowany w `BlockEmailEditor.vue`:
- ✅ Import serwisu `Templates` zamiast plików JSON
- ✅ Asynchroniczne ładowanie templat z API
- ✅ Zapisywanie nowych templat przez API
- ✅ Obsługa stanów ładowania i błędów
- ✅ Migracja lokalnych templat do bazy

## 🔧 API Endpoints

### Templaty
```
GET    /mailing/templates                    # Lista templat
GET    /mailing/templates/:id               # Template po ID
POST   /mailing/templates                   # Utwórz template
PUT    /mailing/templates/:id               # Aktualizuj template
DELETE /mailing/templates/:id               # Usuń template
POST   /mailing/templates/:id/duplicate     # Duplikuj template
POST   /mailing/templates/:id/usage         # Zwiększ licznik użycia
GET    /mailing/templates/categories        # Lista kategorii
GET    /mailing/templates/popular           # Popularne templaty
POST   /mailing/templates/generate-thumbnail # Generuj thumbnail
```

### Przykładowe zapytania

```javascript
// Pobierz wszystkie templaty z blokami
const templates = await Templates.getTemplates({
  includeBlocks: true,
  category: 'newsletter'
});

// Utwórz nowy template
const template = await Templates.createTemplate({
  name: 'Mój Newsletter',
  description: 'Szablon newslettera firmowego',
  category: 'newsletter',
  tags: ['newsletter', 'firmowy'],
  blocks: [
    {
      blockType: 'text',
      content: { text: 'Hello World!' },
      style: { marginTop: 0, marginBottom: 16, textAlign: 'center' }
    }
  ]
});

// Załaduj template w edytorze
await Templates.loadSelectedTemplate(templateId);
```

## 📊 Korzyści nowego systemu

### 🚀 Wydajność
- **Szybsze ładowanie**: Templaty ładowane z bazy zamiast wielu plików JSON
- **Cache**: Automatyczny cache templat w localStorage
- **Lazy loading**: Bloki ładowane tylko gdy potrzebne

### 🔒 Zarządzanie
- **Multi-tenant**: Wsparcie dla wielu klientów
- **Uprawnienia**: Publiczne vs prywatne templaty
- **Versioning**: Wersjonowanie templat
- **Soft delete**: Bezpieczne usuwanie z możliwością przywrócenia

### 📈 Analityka
- **Statystyki użycia**: Licznik użycia i ostatnie wykorzystanie
- **Popularne templaty**: Ranking najpopularniejszych
- **Metadata**: Rozszerzone informacje o templatach

### 🛠️ Funkcjonalność
- **Duplikacja**: Łatwe kopiowanie templat
- **Wyszukiwanie**: Zaawansowane filtrowanie i wyszukiwanie
- **Kategoryzacja**: Lepsze organizowanie templat
- **Thumbnail**: Automatyczne generowanie podglądów

## 🔄 Proces migracji

### Automatyczna migracja
Przy pierwszym uruchomieniu `BlockEmailEditor`:
1. Sprawdza localStorage pod kątem starych templat
2. Konwertuje je do nowego formatu API
3. Zapisuje w bazie przez API
4. Opcjonalnie czyści localStorage

### Ręczna migracja
```bash
# Migruj wszystkie templaty JSON do bazy
node scripts/migrate-templates-to-mysql.js --force

# Z kopią zapasową
node scripts/migrate-templates-to-mysql.js --force --backup
```

## 🧪 Testowanie

### Frontend
```bash
# Uruchom aplikację
npm run dev

# Sprawdź:
# 1. Ładowanie templat z API
# 2. Tworzenie nowych templat
# 3. Edytowanie istniejących templat
# 4. Obsługa błędów i stanów ładowania
```

### Backend API
```bash
# Test podstawowy
curl http://localhost:3000/mailing/templates

# Test z parametrami
curl "http://localhost:3000/mailing/templates?category=newsletter&includeBlocks=true"

# Test tworzenia templatu
curl -X POST http://localhost:3000/mailing/templates \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Template","description":"Test","category":"newsletter","blocks":[]}'
```

## 🐛 Rozwiązywanie problemów

### Błędy migracji
```bash
# Sprawdź logi migracji
tail -f logs/migration.log

# Przywróć kopię zapasową
mysql < backups/templates-backup-YYYY-MM-DD.sql
```

### Błędy API
```javascript
// Sprawdź connection do bazy
await sequelize.authenticate();

// Sprawdź czy tabele istnieją
await EmailTemplate.findAll({ limit: 1 });
```

### Błędy frontend
```javascript
// Wyczyść cache templat
Templates.clearCache();

// Sprawdź network w dev tools
// Sprawdź console na błędy API
```

## 🔮 Przyszłe rozszerzenia

### Planowane funkcje
- [ ] **Import/Export**: Import templat z zewnętrznych źródeł
- [ ] **Template Builder**: Wizualny kreator templat
- [ ] **A/B Testing**: Testowanie różnych wersji templat
- [ ] **Collaborative Editing**: Współpraca nad templatami
- [ ] **Template Analytics**: Szczegółowe statystyki użycia
- [ ] **AI Suggestions**: Inteligentne sugestie templat

### Optymalizacje
- [ ] **Redis Cache**: Cache templat w Redis
- [ ] **CDN Integration**: Hosting thumbnail w CDN
- [ ] **Elasticsearch**: Zaawansowane wyszukiwanie
- [ ] **GraphQL API**: Alternatywne API GraphQL
- [ ] **Real-time Updates**: WebSocket dla live updates

## 📚 Dodatkowe zasoby

- [Dokumentacja Sequelize](https://sequelize.org/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Material-UI Components](https://vuetifyjs.com/en/components/all/)
- [Email Template Best Practices](https://www.campaignmonitor.com/blog/email-marketing/email-template-design-guide/)

---

## ✅ Status implementacji

Wszystkie elementy zostały pomyślnie zaimplementowane:

1. ✅ **Modele Sequelize** - EmailTemplate i TemplateBlock
2. ✅ **Migracje SQL** - Utworzenie tabel i indeksów
3. ✅ **Serwis API** - Kompletny serwis Templates.js
4. ✅ **Frontend Integration** - BlockEmailEditor z obsługą API
5. ✅ **Kontrolery Backend** - Pełna obsługa CRUD
6. ✅ **Migracja danych** - Skrypt do przenoszenia JSON→MySQL
7. ✅ **Dokumentacja** - Kompletna instrukcja wdrożenia

System jest gotowy do użytku! 🎉