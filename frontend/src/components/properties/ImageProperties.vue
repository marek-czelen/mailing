<template>
  <!-- 
    KOMPONENT WŁAŚCIWOŚCI OBRAZKA
    
    Panel edycji właściwości bloku obrazka w prawej kolumnie edytora.
    Umożliwia zarządzanie źródłem, wymiarami, stylami i podglądem obrazka.
    
    SEKCJE EDYCJI:
    1. ŹRÓDŁO - URL obrazka, tekst alt, opcjonalny link
    2. WYMIARY - szerokość, wysokość z presetami rozmiarów
    3. STYLOWANIE - zaokrąglenie rogów
    4. PODGLĄD - miniaturka z funkcją losowego obrazka
    
    DODATKOWE FUNKCJE:
    - Presety rozmiarów (mały, średni, duży, pełna)
    - Generator losowych obrazków z Lorem Picsum
    - Obsługa błędów ładowania obrazków
  -->
  <div class="image-properties">
    <!-- 
      SEKCJA ŹRÓDŁA
      URL obrazka, tekst alternatywny i opcjonalny link
    -->
    <h6 class="text-caption mb-2">ŹRÓDŁO</h6>
    
    <!-- URL źródła obrazka -->
    <v-text-field
      v-model="block.content.src"
      label="URL obrazu"
      variant="outlined"
      density="compact"
      class="mb-2"
      @input="$emit('update')"
    ></v-text-field>

    <!-- Tekst alternatywny dla dostępności (alt attribute) -->
    <v-text-field
      v-model="block.content.alt"
      label="Tekst alternatywny"
      variant="outlined"
      density="compact"
      class="mb-2"
      @input="$emit('update')"
    ></v-text-field>

    <!-- Opcjonalny link - jeśli ustawiony, obrazek będzie klikalny -->
    <v-text-field
      v-model="block.content.url"
      label="Link (opcjonalny)"
      variant="outlined"
      density="compact"
      class="mb-3"
      @input="$emit('update')"
    ></v-text-field>

    <!-- 
      SEKCJA WYMIARÓW
      Szerokość i wysokość w pikselach z gotowymi presetami
    -->
    <h6 class="text-caption mb-2">WYMIARY</h6>

    <!-- Szerokość obrazka w pikselach -->
    <v-text-field
      v-model.number="block.content.width"
      label="Szerokość (px)"
      type="number"
      variant="outlined"
      density="compact"
      class="mb-2"
      @input="$emit('update')"
    ></v-text-field>

    <!-- Wysokość obrazka w pikselach -->
    <v-text-field
      v-model.number="block.content.height"
      label="Wysokość (px)"
      type="number"
      variant="outlined"
      density="compact"
      class="mb-2"
      @input="$emit('update')"
    ></v-text-field>

    <!-- 
      PRESETY ROZMIARÓW
      Szybkie ustawienia popularnych wymiarów
    -->
    <div class="size-presets mb-3">
      <v-btn-toggle
        @update:model-value="setSizePreset"
        density="compact"
        class="w-100"
      >
        <v-btn value="small" size="small">Mały</v-btn>
        <v-btn value="medium" size="small">Średni</v-btn>
        <v-btn value="large" size="small">Duży</v-btn>
        <v-btn value="full" size="small">Pełna</v-btn>
      </v-btn-toggle>
    </div>

    <!-- 
      SEKCJA STYLOWANIA
      Zaokrąglenie rogów i inne opcje wizualne
    -->
    <h6 class="text-caption mb-2">STYLOWANIE</h6>

    <!-- Zaokrąglenie rogów w pikselach -->
    <v-text-field
      v-model.number="block.content.borderRadius"
      label="Zaokrąglenie (px)"
      type="number"
      variant="outlined"
      density="compact"
      class="mb-2"
      @input="$emit('update')"
    ></v-text-field>

    <!-- 
      SEKCJA PODGLĄDU
      Miniaturka obrazka z funkcjami pomocniczymi
    -->
    <h6 class="text-caption mb-2">PODGLĄD</h6>
    
    <!-- Podgląd obrazka z obsługą błędów -->
    <div class="image-preview mb-2">
      <img 
        :src="block.content.src" 
        :alt="block.content.alt"
        style="max-width: 100%; height: auto; border-radius: 4px;"
        @error="onImageError"
      />
    </div>

    <!-- Przycisk generowania losowego obrazka testowego -->
    <v-btn 
      @click="useRandomImage" 
      size="small" 
      variant="outlined" 
      class="mb-2"
    >
      <v-icon left>mdi-shuffle</v-icon>
      Losowy obraz
    </v-btn>
  </div>
</template>

<script>
export default {
  name: 'ImageProperties',
  props: {
    // Obiekt bloku obrazka do edycji
    block: {
      type: Object,
      required: true
    }
  },
  emits: ['update'], // Event emitowany przy każdej zmianie
  methods: {
    /**
     * Ustawia wymiary obrazka według wybranego presetu
     * @param {string} preset - nazwa presetu (small/medium/large/full)
     */
    setSizePreset(preset) {
      const presets = {
        small: { width: 200, height: 150 },  // Mały - 200x150px
        medium: { width: 400, height: 200 }, // Średni - 400x200px  
        large: { width: 600, height: 300 },  // Duży - 600x300px
        full: { width: 600, height: 400 }    // Pełna - 600x400px
      };
      
      if (presets[preset]) {
        this.block.content.width = presets[preset].width;
        this.block.content.height = presets[preset].height;
        this.$emit('update'); // Powiadamia o zmianie
      }
    },
    
    /**
     * Generuje losowy obrazek testowy z Lorem Picsum
     * Używa aktualnych wymiarów bloku i losowej kategorii
     */
    useRandomImage() {
      const categories = ['nature', 'city', 'technology', 'business', 'food'];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const width = this.block.content.width;
      const height = this.block.content.height;
      
      // Generuje URL z Lorem Picsum z timestampem dla unikalności
      this.block.content.src = `https://picsum.photos/${width}/${height}?category=${category}&random=${Date.now()}`;
      this.block.content.alt = `Losowy obraz z kategorii ${category}`;
      this.$emit('update');
    },
    
    /**
     * Obsługa błędów ładowania obrazków
     * Zastępuje błędny obrazek placeholderem
     * @param {Event} event - event error z elementu img
     */
    onImageError(event) {
      // Fallback gdy obraz się nie załaduje - placeholder z via.placeholder.com
      event.target.src = "assets/placeholder-image.svg";
    }
  },
  
  /**
   * Lifecycle hook - inicjalizacja komponentu
   * Sprawdza czy wszystkie wymagane właściwości istnieją
   */
  mounted() {
    // Upewnij się, że borderRadius istnieje (kompatybilność wsteczna)
    if (this.block.content.borderRadius === undefined) {
      this.block.content.borderRadius = 0;
    }
  }
};
</script>

<style scoped>
.image-properties {
  width: 100%;
}

.image-preview {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 8px;
  text-align: center;
}

.size-presets {
  font-size: 12px;
}
</style>