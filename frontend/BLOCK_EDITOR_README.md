# Block Email Editor - Edytor Blokowy

Zaawansowany edytor szablonów e-maili z systemem bloków drag & drop.

## ✨ Funkcjonalności

### 🏗️ System Bloków
- **Blok tekstowy** - Edycja tekstu z pełną kontrolą nad stylem
- **Przycisk** - Konfigurowalny przycisk CTA z linkiem
- **Obraz** - Wstawianie obrazów z opcjami rozmiaru i stylu
- **Odstęp** - Kontrola przestrzeni między elementami

### 🎛️ Interfejs Edytora
1. **Panel Bloków** (lewa strona) - Lista dostępnych bloków do dodania
2. **Canvas** (środek) - Obszar budowy e-maila z podglądem na żywo
3. **Panel Właściwości** (prawa strona) - Edycja wybranego bloku

### 🎯 Możliwości Edycji

#### Blok Tekstowy
- Treść tekstu (wieloliniowa)
- Rozmiar czcionki (px)
- Kolor tekstu
- Grubość czcionki (normal, bold, 300, 500, 700, 900)
- Styl czcionki (normal, italic)
- Marginesy górny/dolny
- Wyrównanie (lewo, środek, prawo)

#### Przycisk
- Tekst przycisku
- URL docelowy
- Kolor tła i tekstu
- Zaokrąglenie rogów
- Padding (gotowe presety: mały, średni, duży)
- Marginesy i wyrównanie

#### Obraz
- URL źródła obrazu
- Tekst alternatywny
- Link (opcjonalny)
- Wymiary (szerokość × wysokość)
- Presety rozmiarów
- Zaokrąglenie rogów
- Generator losowych obrazów
- Podgląd na żywo

#### Odstęp
- Wysokość w pikselach
- Presety (mały 20px, średni 40px, duży 80px)
- Opcjonalne tło z kolorem
- Zaokrąglenie
- Podgląd proporcjonalny

### 🖱️ Sposób Użycia

### Wybór Trybu Wyświetlania
- **Desktop (600px)** - Standardowy tryb dla komputerów
- **Mobile (375px)** - Tryb mobilny dla smartfonów
- **Przełącznik** na górze canvas pozwala zmieniać tryby

### Dodawanie Bloków
1. **Kliknij** na blok w panelu lewym - doda blok na koniec
2. **Przeciągnij** blok z panelu na canvas - upuszczenie w wybranym miejscu

### Edycja Bloków
1. **Kliknij** na blok w canvas aby go zaznaczyć
2. **Panel właściwości** pojawi się po prawej stronie
3. **Edytuj** właściwości w czasie rzeczywistym

### Zarządzanie Blokami
- **Usuń** - przycisk ❌ w prawym górnym rogu bloku
- **Duplikuj** - przycisk 📋 obok przycisku usuń
- **Przenieś** - przeciągnij blok w inne miejsce
- **Wyczyść wszystko** - przycisk "Wyczyść" na górze canvas

### Podgląd i Eksport
1. **Podgląd HTML** - przycisk "Podgląd HTML" otwiera dialog z podglądem
2. **Tryby podglądu** - przełączaj między Desktop/Mobile w dialogu
3. **Skopiuj HTML** - gotowy kod responsywny z CSS
4. **Eksport obrazu** - funkcja w przygotowaniu
5. **Użyj w kampaniach** - wklej HTML do systemu mailingowego

## 🛠️ Struktura Techniczna

```
src/components/
├── BlockEmailEditor.vue          # Główny edytor
├── blocks/                       # Komponenty renderowania bloków
│   ├── TextBlock.vue
│   ├── ButtonBlock.vue
│   ├── ImageBlock.vue
│   └── SpacerBlock.vue
└── properties/                   # Panele właściwości
    ├── TextProperties.vue
    ├── ButtonProperties.vue
    ├── ImageProperties.vue
    └── SpacerProperties.vue
```

## 🔧 Zależności

```json
{
  "vuedraggable": "^4.0.0",
  "vuetify": "^3.9.7",
  "vue": "^3.5.18"
}
```

## 📱 Dostęp

Edytor dostępny pod adresem: `/block-email-editor`

## ⚡ Responsywność

- **Canvas**: Stały podgląd 600px (standardowa szerokość e-maila)
- **Bloki**: Automatyczne dostosowanie do kontenera
- **Obrazy**: `max-width: 100%` zapewnia responsywność
- **Tekst**: Skalowalne jednostki i line-height

## 📧 Format Wyjściowy

Edytor generuje:
- **HTML5** z inline CSS
- **Kompatybilność** z głównymi klientami e-mail
- **Responsive** struktura tabel
- **Semantyczne** znaczniki obrazów i linków

## 🎨 Personalizacja

### Dodawanie Nowych Bloków

1. **Stwórz komponent** bloku w `/blocks/`
2. **Dodaj właściwości** w `/properties/`
3. **Zarejestruj** w `BlockEmailEditor.vue`:

```javascript
// Dodaj do availableBlocks
{ type: 'newblock', name: 'Nowy Blok', icon: 'mdi-icon' }

// Dodaj do createBlock()
case 'newblock':
  return { /* struktura bloku */ };

// Dodaj mapping komponentów
'newblock': 'NewBlockComponent'
```

### Rozszerzanie Właściwości

Każdy blok może mieć dowolne właściwości w obiekcie `content` i `style`:

```javascript
{
  id: 1,
  type: 'custom',
  content: {
    // Właściwości specyficzne dla bloku
  },
  style: {
    // Wspólne właściwości stylowania
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center'
  }
}
```

## 💡 Przykłady Użycia

### Newsletter Firmowy
1. Dodaj obrazek z logo (szerokość 300px)
2. Dodaj tekst powitania (rozmiar 24px, pogrubiony)
3. Dodaj treść główną (rozmiar 16px)
4. Dodaj przycisk CTA (kolor marki)
5. Dodaj odstęp (40px)
6. Dodaj stopkę (rozmiar 12px, szary)

### Promocja Produktu
1. Duży obrazek produktu (600x300px)
2. Tytuł promocji (32px, pogrubiony, wyśrodkowany)
3. Opis oferty (16px)
4. Duży przycisk "Kup teraz" (padding duży, kolor wyrazisty)
5. Tekst regulaminowy (12px, mały margines)

Edytor jest w pełni funkcjonalny i gotowy do użycia!