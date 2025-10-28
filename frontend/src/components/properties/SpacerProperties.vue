<template>
  <!-- 
    KOMPONENT WŁAŚCIWOŚCI ODSTĘPU (SPACER)
    
    Panel edycji właściwości bloku odstępu w prawej kolumnie edytora.
    Umożliwia kontrolę wysokości i opcjonalnego stylowania odstępu.
    
    SEKCJE EDYCJI:
    1. WYMIARY - wysokość z presetami
    2. WYGLĄD - opcjonalne tło i zaokrąglenie
    3. PODGLĄD - wizualizacja odstępu w skali
    
    SPECJALNE FUNKCJE:
    - Przełącznik widoczności tła
    - Presety wysokości (mały, średni, duży)
    - Podgląd z ograniczeniem do 100px dla większych odstępów
  -->
  <div class="spacer-properties">
    <!-- 
      SEKCJA WYMIARÓW
      Wysokość odstępu z gotowymi presetami
    -->
    <h6 class="text-caption mb-2">WYMIARY</h6>
    
    <!-- Wysokość odstępu w pikselach -->
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
      PRESETY WYSOKOŚCI
      Szybkie ustawienia popularnych wartości odstępu
    -->
    <div class="height-presets mb-3">
      <v-btn-toggle
        @update:model-value="setHeightPreset"
        density="compact"
        class="w-100"
      >
        <v-btn value="small" size="small">Mały</v-btn>
        <v-btn value="medium" size="small">Średni</v-btn>
        <v-btn value="large" size="small">Duży</v-btn>
      </v-btn-toggle>
    </div>

    <!-- 
      SEKCJA WYGLĄDU
      Opcjonalne stylowanie odstępu (kolor tła, zaokrąglenie)
    -->
    <h6 class="text-caption mb-2">WYGLĄD (OPCJONALNE)</h6>

    <!-- Kolor tła odstępu (color picker) -->
    <v-text-field
      v-model="block.content.backgroundColor"
      label="Kolor tła"
      type="color"
      variant="outlined"
      density="compact"
      class="mb-2"
      @input="$emit('update')"
    ></v-text-field>

    <!-- Zaokrąglenie rogów odstępu -->
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
      PRZEŁĄCZNIK WIDOCZNOŚCI TŁA
      Szybkie przełączanie między transparent a kolorowym tłem
    -->
    <v-switch
      v-model="showBackground"
      label="Widoczne tło"
      density="compact"
      class="mb-2"
      @update:model-value="toggleBackground"
    ></v-switch>

    <!-- 
      PODGLĄD ODSTĘPU
      Wizualizacja z ograniczeniem do 100px dla bardzo wysokich odstępów
    -->
    <div class="spacer-preview">
      <div class="preview-label">Podgląd odstępu:</div>
      <!-- 
        Podgląd z Math.min(height, 100) aby duże odstępy nie zajmowały całego panelu
      -->
      <div 
        class="spacer-demo"
        :style="{
          height: Math.min(block.content.height, 100) + 'px',
          backgroundColor: block.content.backgroundColor || '#f0f0f0',
          borderRadius: (block.content.borderRadius || 0) + 'px',
          border: '1px dashed #ccc'
        }"
      >
        <!-- Wskaźnik rzeczywistej wysokości -->
        <span class="height-indicator">{{ block.content.height }}px</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SpacerProperties',
  props: {
    // Obiekt bloku odstępu do edycji
    block: {
      type: Object,
      required: true
    }
  },
  emits: ['update'], // Event emitowany przy każdej zmianie
  data() {
    return {
      // Stan przełącznika widoczności tła
      showBackground: false
    };
  },
  methods: {
    /**
     * Ustawia wysokość odstępu według wybranego presetu
     * @param {string} preset - nazwa presetu (small/medium/large)
     */
    setHeightPreset(preset) {
      const presets = {
        small: 20,  // Mały odstęp - 20px
        medium: 40, // Średni odstęp - 40px
        large: 80   // Duży odstęp - 80px
      };
      
      if (presets[preset]) {
        this.block.content.height = presets[preset];
        this.$emit('update'); // Powiadamia o zmianie
      }
    },
    
    /**
     * Przełącza widoczność tła odstępu
     * Ustawia transparent lub domyślny szary kolor
     */
    toggleBackground() {
      if (!this.showBackground) {
        // Wyłącz tło - ustaw transparent
        this.block.content.backgroundColor = 'transparent';
      } else {
        // Włącz tło - ustaw domyślny szary kolor
        this.block.content.backgroundColor = '#f0f0f0';
      }
      this.$emit('update');
    }
  },
  
  /**
   * Lifecycle hook - inicjalizacja komponentu
   * Zapewnia istnienie wszystkich właściwości i ustawia stan przełącznika
   */
  mounted() {
    // Upewnij się, że wszystkie właściwości istnieją (kompatybilność wsteczna)
    if (!this.block.content.backgroundColor) {
      this.block.content.backgroundColor = 'transparent';
    }
    if (this.block.content.borderRadius === undefined) {
      this.block.content.borderRadius = 0;
    }
    
    // Ustaw stan przełącznika na podstawie aktualnego koloru tła
    this.showBackground = this.block.content.backgroundColor !== 'transparent';
  }
};
</script>

<style scoped>
.spacer-properties {
  width: 100%;
}

.height-presets {
  font-size: 12px;
}

.spacer-preview {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 12px;
  margin-top: 16px;
}

.preview-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.spacer-demo {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 20px;
}

.height-indicator {
  font-size: 11px;
  color: #666;
  background: rgba(255, 255, 255, 0.8);
  padding: 2px 6px;
  border-radius: 3px;
}
</style>