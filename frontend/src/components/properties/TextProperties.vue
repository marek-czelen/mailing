<template>
  <!-- 
    PANEL WŁAŚCIWOŚCI DLA BLOKU TEKSTOWEGO
    
    Komponent odpowiedzialny za edycję wszystkich właściwości bloku tekstowego:
    - Treść tekstu
    - Rozmiar czcionki
    - Kolor tekstu  
    - Grubość czcionki (normal, bold, 300-900)
    - Styl czcionki (normal, italic)
    - Rodzina czcionki (Arial, Times New Roman itp.)
    
    Każda zmiana automatycznie emituje event 'update' do rodzica.
  -->
  <div class="text-properties">
    <!-- SEKCJA TREŚCI -->
    <h6 class="text-caption mb-2">TREŚĆ</h6>
    
    <!-- Pole tekstowe dla treści bloku -->
    <v-textarea
      v-model="block.content.text"
      label="Tekst"
      variant="outlined"
      density="compact"
      rows="3"
      class="mb-3"
      @update:model-value="updateProperty"
    ></v-textarea>

    <!-- SEKCJA STYLOWANIA -->
    <h6 class="text-caption mb-2">STYLOWANIE</h6>

    <v-text-field
      v-model.number="block.content.fontSize"
      label="Rozmiar czcionki (px)"
      type="number"
      variant="outlined"
      density="compact"
      class="mb-2"
      @update:model-value="updateProperty"
    ></v-text-field>

    <v-text-field
      v-model="block.content.color"
      label="Kolor tekstu"
      type="color"
      variant="outlined"
      density="compact"
      class="mb-2"
      @update:model-value="updateProperty"
    ></v-text-field>

    <v-select
      v-model="block.content.fontWeight"
      :items="fontWeightOptions"
      label="Grubość czcionki"
      variant="outlined"
      density="compact"
      class="mb-2"
      @update:model-value="updateProperty"
    ></v-select>

    <v-select
      v-model="block.content.fontStyle"
      :items="fontStyleOptions"
      label="Styl czcionki"
      variant="outlined"
      density="compact"
      class="mb-2"
      @update:model-value="updateProperty"
    ></v-select>

    <v-select
      v-model="block.content.fontFamily"
      :items="fontFamilyOptions"
      label="Rodzina czcionki"
      variant="outlined"
      density="compact"
      class="mb-2"
      @update:model-value="updateProperty"
    ></v-select>
  </div>
</template>

<script>
export default {
  name: 'TextProperties',
  props: {
    // Obiekt bloku zawierający wszystkie dane bloku tekstowego
    block: {
      type: Object,
      required: true
    }
  },
  emits: ['update'], // Event emitowany przy każdej zmianie właściwości
  data() {
    return {
      // === OPCJE GRUBOŚCI CZCIONKI ===
      // Zawiera predefiniowane wartości font-weight
      fontWeightOptions: [
        { title: 'Normalna', value: 'normal' },
        { title: 'Pogrubiona', value: 'bold' },
        { title: 'Cienka', value: '300' },
        { title: 'Średnia', value: '500' },
        { title: 'Gruba', value: '700' },
        { title: 'Bardzo gruba', value: '900' }
      ],
      
      // === OPCJE STYLU CZCIONKI ===
      // Normal vs Italic
      fontStyleOptions: [
        { title: 'Normalna', value: 'normal' },
        { title: 'Kursywa', value: 'italic' }
      ],
      
      // === OPCJE RODZINY CZCIONKI ===
      // Web-safe fonts z odpowiednimi fallback
      fontFamilyOptions: [
        { title: 'Arial', value: 'Arial, sans-serif' },
        { title: 'Times New Roman', value: 'Times New Roman, serif' },
        { title: 'Courier New', value: 'Courier New, monospace' },
        { title: 'Georgia', value: 'Georgia, serif' },
        { title: 'Verdana', value: 'Verdana, sans-serif' },
        { title: 'Tahoma', value: 'Tahoma, sans-serif' },
        { title: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
        { title: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
        { title: 'Impact', value: 'Impact, sans-serif' },
        { title: 'Comic Sans MS', value: 'Comic Sans MS, cursive' }
      ]
    };
  },
  methods: {
    // === OBSŁUGA ZMIAN ===
    // Metoda wywoływana przy każdej zmianie właściwości
    // Emituje event 'update' który dociera do głównego komponentu
    updateProperty() {
      this.$emit('update');
    }
  }
};
</script>

<style scoped>
.text-properties {
  width: 100%;
}
</style>