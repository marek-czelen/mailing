<template>
  <!-- 
    KOMPONENT WŁAŚCIWOŚCI PRZYCISKU
    
    Panel edycji właściwości bloku przycisku w prawej kolumnie edytora.
    Umożliwia modyfikację treści, wyglądu i odstępów przycisku.
    
    SEKCJE EDYCJI:
    1. TREŚĆ - tekst i link przycisku
    2. WYGLĄD - kolory i zaokrąglenie
    3. PADDING - wewnętrzne odstępy z presetami
    
    REAKTYWNOŚĆ:
    Każda zmiana emituje event 'update' aby odświeżyć podgląd
  -->
  <div class="button-properties">
    <!-- 
      SEKCJA TREŚCI
      Edycja tekstu wyświetlanego na przycisku i docelowego URL
    -->
    <h6 class="text-caption mb-2">TREŚĆ</h6>
    
    <!-- Tekst wyświetlany na przycisku -->
    <v-text-field
      v-model="block.content.text"
      label="Tekst przycisku"
      variant="outlined"
      density="compact"
      class="mb-2"
      @input="$emit('update')"
    ></v-text-field>

    <!-- Docelowy adres URL przycisku -->
    <v-text-field
      v-model="block.content.url"
      label="Link (URL)"
      variant="outlined"
      density="compact"
      class="mb-3"
      @input="$emit('update')"
    ></v-text-field>

    <!-- 
      SEKCJA WYGLĄDU
      Kolory i kształt przycisku
    -->
    <h6 class="text-caption mb-2">WYGLĄD</h6>

    <!-- Kolor tła przycisku (color picker) -->
    <v-text-field
      v-model="block.content.backgroundColor"
      label="Kolor tła"
      type="color"
      variant="outlined"
      density="compact"
      class="mb-2"
      @input="$emit('update')"
    ></v-text-field>

    <!-- Kolor tekstu na przycisku (color picker) -->
    <v-text-field
      v-model="block.content.textColor"
      label="Kolor tekstu"
      type="color"
      variant="outlined"
      density="compact"
      class="mb-2"
      @input="$emit('update')"
    ></v-text-field>

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
      SEKCJA PADDING
      Wewnętrzne odstępy przycisku z gotowymi presetami
    -->
    <h6 class="text-caption mb-2">PADDING</h6>
    
    <!-- Ręczna edycja padding (format CSS) -->
    <v-text-field
      v-model="block.content.padding"
      label="Wewnętrzny margines"
      variant="outlined"
      density="compact"
      placeholder="12px 24px"
      hint="Format: góra-dół lewo-prawo (np. 12px 24px)"
      class="mb-2"
      @input="$emit('update')"
    ></v-text-field>

    <!-- 
      PRESETY PADDING
      Szybkie ustawienia popularnych rozmiarów
    -->
    <div class="padding-presets mb-2">
      <v-btn-toggle
        :model-value="getPaddingPreset()"
        @update:model-value="setPaddingPreset"
        mandatory
        density="compact"
        class="w-100"
      >
        <v-btn value="small" size="small">Mały</v-btn>
        <v-btn value="medium" size="small">Średni</v-btn>
        <v-btn value="large" size="small">Duży</v-btn>
      </v-btn-toggle>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ButtonProperties',
  props: {
    // Obiekt bloku przycisku do edycji
    block: {
      type: Object,
      required: true
    }
  },
  emits: ['update'], // Event emitowany przy każdej zmianie
  methods: {
    /**
     * Sprawdza który preset padding jest obecnie aktywny
     * @returns {string|null} - nazwa presetu lub null jeśli niestandardowy
     */
    getPaddingPreset() {
      const padding = this.block.content.padding;
      if (padding === '8px 16px') return 'small';
      if (padding === '12px 24px') return 'medium';
      if (padding === '16px 32px') return 'large';
      return null;
    },
    
    /**
     * Ustawia padding według wybranego presetu
     * @param {string} preset - nazwa presetu (small/medium/large)
     */
    setPaddingPreset(preset) {
      const presets = {
        small: '8px 16px',   // Mały: 8px góra/dół, 16px lewo/prawo
        medium: '12px 24px', // Średni: 12px góra/dół, 24px lewo/prawo
        large: '16px 32px'   // Duży: 16px góra/dół, 32px lewo/prawo
      };
      
      if (presets[preset]) {
        this.block.content.padding = presets[preset];
        this.$emit('update'); // Powiadamia o zmianie
      }
    }
  }
};
</script>

<style scoped>
.button-properties {
  width: 100%;
}

.padding-presets {
  font-size: 12px;
}
</style>