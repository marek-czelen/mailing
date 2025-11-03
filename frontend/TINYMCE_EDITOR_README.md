# TinyMCE - Zaawansowany edytor HTML dla kampanii

## 🎯 Opis funkcjonalności

TinyMCE w komponencie CampaignsView został skonfigurowany z zaawansowanymi funkcjami do tworzenia profesjonalnych emaili marketingowych.

## 🛠️ Dostępne narzędzia (Toolbar)

### Linia 1: Podstawowe operacje
- **Cofnij/Ponów** (`undo redo`) - Standardowe operacje cofania
- **Wytnij/Kopiuj/Wklej** (`cut copy paste pastetext`) - Operacje schowka
- **Formatowanie tekstu** (`bold italic underline strikethrough`) - Pogrubienie, kursywa, podkreślenie, przekreślenie
- **Indeksy** (`subscript superscript`) - Indeks dolny/górny
- **Usuń formatowanie** (`removeformat`) - Czyści wszystkie style

### Linia 2: Czcionki i kolory
- **Wybór czcionki** (`fontselect`) - Arial, Times New Roman, Courier New, Verdana
- **Rozmiar czcionki** (`fontsizeselect`) - 8pt do 48pt
- **Kolory** (`forecolor backcolor`) - Kolor tekstu i tła
- **Wyrównanie** (`alignleft aligncenter alignright alignjustify`) - Wyrównanie tekstu
- **Wcięcia** (`outdent indent`) - Zmniejsz/zwiększ wcięcie

### Linia 3: Listy i multimedia
- **Listy** (`bullist numlist`) - Lista punktowa i numerowana
- **Elementy blokowe** (`blockquote hr nonbreaking pagebreak`) - Cytaty, linie, podziały
- **Linki** (`link unlink anchor`) - Dodawanie i usuwanie linków
- **Media** (`image media table`) - Obrazy, media, tabele
- **Wstawianie** (`insertdatetime charmap emoticons`) - Data/czas, znaki specjalne, emotikony

### Linia 4: Narzędzia zaawansowane
- **🎯 Placeholder** (`placeholder`) - **NOWOŚĆ!** Wstaw placeholdery dla personalizacji
- **Wyszukiwanie** (`searchreplace`) - Znajdź i zamień
- **Widok** (`visualblocks code codesample`) - Widok bloków, kod źródłowy, przykłady kodu
- **Pełny ekran** (`fullscreen preview`) - Pełny ekran i podgląd
- **Szablony** (`template`) - Gotowe szablony emaili
- **Pomoc** (`help wordcount`) - Pomoc i licznik słów

## 🏷️ Placeholdery - NOWA FUNKCJA!

Dodany został specjalny przycisk **Placeholder** który pozwala na łatwe wstawianie zmiennych do personalizacji emaili.

### Dostępne placeholdery:
- `{{CONTACT_FIRST_NAME}}` - Imię odbiorcy
- `{{CONTACT_LAST_NAME}}` - Nazwisko odbiorcy  
- `{{CONTACT_EMAIL}}` - Email odbiorcy
- `{{COMPANY_NAME}}` - Nazwa firmy
- `{{COMPANY_ADDRESS}}` - Adres firmy
- `{{UNSUBSCRIBE_LINK}}` - Link do wypisania się
- `{{CAMPAIGN_NAME}}` - Nazwa kampanii

### Jak używać:
1. Kliknij przycisk **Placeholder** w toolbar
2. Wybierz placeholder z listy rozwijanej
3. Kliknij **Wstaw**
4. Placeholder zostanie dodany w miejscu kursora

## 📋 Menu kontekstowe

Dostępne są rozbudowane menu:

### Menu Plik
- Nowy dokument, przywracanie wersji roboczej
- Podgląd i eksport
- Drukowanie

### Menu Edycja  
- Operacje cofania/ponawiania
- Operacje schowka
- Zaznacz wszystko
- Znajdź i zamień

### Menu Widok
- Kod źródłowy HTML
- Wizualne pomoce (znaki, bloki)
- Sprawdzanie pisowni
- Pełny ekran

### Menu Wstaw
- Obrazy, media, linki
- Tabele i kod
- Znaki specjalne i emotikony
- Data i czas
- Spis treści

### Menu Format
- Formatowanie tekstu
- Style i bloki
- Czcionki i rozmiary
- Wyrównanie i kolory
- Język i usuwanie formatowania

### Menu Tabela (gdy tabela jest zaznaczona)
- Wstawianie tabel
- Operacje na komórkach, wierszach, kolumnach
- Właściwości tabel
- Sortowanie

## 🎨 Szablony emaili

### Newsletter podstawowy
Prosty szablon newslettera z:
- Nagłówkiem firmy
- Obszarem treści głównej
- Stopką z danymi firmy i linkiem wypisania

### Email promocyjny
Szablon promocyjny z:
- Gradientowym nagłówkiem
- Wyróżnioną ofertą
- Przyciskiem CTA (Call to Action)
- Stopką zgodną z RODO

### Jak używać szablonów:
1. Kliknij przycisk **template** w toolbar
2. Wybierz szablon z listy
3. Szablon zostanie wczytany do edytora
4. Dostosuj treść do swoich potrzeb

## ⚙️ Konfiguracja zaawansowana

### Automatyczne wzorce tekstu
- `*tekst*` → kursywa
- `**tekst**` → pogrubienie  
- `#` → Nagłówek H1
- `##` → Nagłówek H2
- `###` → Nagłówek H3
- `1. ` → Lista numerowana
- `* ` lub `- ` → Lista punktowa

### Szybkie paski narzędzi (QuickBars)
- **Zaznaczenie tekstu**: bold, italic, link, nagłówki, cytaty, obrazy, tabele
- **Wstawianie**: szybkie obrazy, tabele, linie, podziały stron

### Wklejanie treści
- Obsługa obrazów z schowka
- Zachowywanie stylów CSS
- Inteligentne czyszczenie formatowania z innych źródeł

## 🎯 Wskazówki użytkowania

### Dla wydajności:
- Używaj stylów inline dla emaili (lepsze wsparcie w klientach email)
- Testuj w różnych klientach poczty
- Zachowuj szerokość max 600px dla kompatybilności

### Dla dostępności:
- Używaj nagłówków H1-H3 w logicznej kolejności
- Dodawaj tekst alternatywny do obrazów
- Zapewniaj odpowiedni kontrast kolorów

### Dla zgodności z RODO:
- Zawsze dodaj link do wypisania się (`{{UNSUBSCRIBE_LINK}}`)
- Uwzględnij dane firmy (`{{COMPANY_NAME}}`, `{{COMPANY_ADDRESS}}`)
- Używaj przygotowanych szablonów z stopką RODO

## 🚀 Nowe funkcje vs. poprzednia wersja

| Funkcja | Poprzednio | Obecnie |
|---------|------------|---------|
| Toolbar | 1 linia, podstawowe | 4 linie, zaawansowane |
| Menu | Wyłączone | Pełne menu kontekstowe |
| Pluginy | 6 podstawowych | 20+ zaawansowanych |
| Szablony | Brak | 2 gotowe + możliwość dodania |
| Placeholdery | Brak | Dedykowany przycisk |
| Tabele | Podstawowe | Zaawansowane z sortowaniem |
| Media | Tylko linki | Obrazy + media + zaawansowane |
| Style | Podstawowe | Pełna paleta + wzorce |
| Podgląd | Brak | Pełny podgląd + pełny ekran |
| Pomoce | Brak | Licznik słów, sprawdzanie pisowni |

## 🔧 Rozwiązywanie problemów

### Editor nie ładuje się:
- Sprawdź konsolę przeglądarki pod kątem błędów
- Upewnij się że wszystkie pluginy TinyMCE są dostępne

### Przyciski nie działają:
- Sprawdź czy nie ma konfliktu z innymi skryptami
- Zrestartuj przeglądarkę jeśli problemy się utrzymują

### Szablony nie działają:
- Sprawdź składnię HTML w szablonach
- Upewnij się że placeholdery są poprawnie wpisane

---

*Dokumentacja dla TinyMCE v8.2.0 w aplikacji Mailing*