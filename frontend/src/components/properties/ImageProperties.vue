<template>
  <div class="image-properties">
    <h6 class="text-caption mb-2">ŹRÓDŁO</h6>
    
    <v-text-field
      v-model="block.content.src"
      label="URL obrazu"
      variant="outlined"
      density="compact"
      class="mb-2"
      @input="$emit('update')"
    ></v-text-field>

    <v-text-field
      v-model="block.content.alt"
      label="Tekst alternatywny"
      variant="outlined"
      density="compact"
      class="mb-2"
      @input="$emit('update')"
    ></v-text-field>

    <v-text-field
      v-model="block.content.url"
      label="Link (opcjonalny)"
      variant="outlined"
      density="compact"
      class="mb-3"
      @input="$emit('update')"
    ></v-text-field>

    <h6 class="text-caption mb-2">WYMIARY</h6>

    <v-text-field
      v-model.number="block.content.width"
      label="Szerokość (px)"
      type="number"
      variant="outlined"
      density="compact"
      class="mb-2"
      @input="$emit('update')"
    ></v-text-field>

    <v-text-field
      v-model.number="block.content.height"
      label="Wysokość (px)"
      type="number"
      variant="outlined"
      density="compact"
      class="mb-2"
      @input="$emit('update')"
    ></v-text-field>

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

    <h6 class="text-caption mb-2">STYLOWANIE</h6>

    <v-text-field
      v-model.number="block.content.borderRadius"
      label="Zaokrąglenie (px)"
      type="number"
      variant="outlined"
      density="compact"
      class="mb-2"
      @input="$emit('update')"
    ></v-text-field>

    <h6 class="text-caption mb-2">PODGLĄD</h6>
    <div class="image-preview mb-2">
      <img 
        :src="block.content.src" 
        :alt="block.content.alt"
        style="max-width: 100%; height: auto; border-radius: 4px;"
        @error="onImageError"
      />
    </div>

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
    block: {
      type: Object,
      required: true
    }
  },
  emits: ['update'],
  methods: {
    setSizePreset(preset) {
      const presets = {
        small: { width: 200, height: 150 },
        medium: { width: 400, height: 200 },
        large: { width: 600, height: 300 },
        full: { width: 600, height: 400 }
      };
      
      if (presets[preset]) {
        this.block.content.width = presets[preset].width;
        this.block.content.height = presets[preset].height;
        this.$emit('update');
      }
    },
    
    useRandomImage() {
      const categories = ['nature', 'city', 'technology', 'business', 'food'];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const width = this.block.content.width;
      const height = this.block.content.height;
      
      this.block.content.src = `https://picsum.photos/${width}/${height}?category=${category}&random=${Date.now()}`;
      this.block.content.alt = `Losowy obraz z kategorii ${category}`;
      this.$emit('update');
    },
    
    onImageError(event) {
      // Fallback gdy obraz się nie załaduje
      event.target.src = `https://via.placeholder.com/${this.block.content.width}x${this.block.content.height}?text=Obraz+nie+znaleziony`;
    }
  },
  
  mounted() {
    // Upewnij się, że borderRadius istnieje
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