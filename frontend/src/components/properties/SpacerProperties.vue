<template>
  <div class="spacer-properties">
    <h6 class="text-caption mb-2">WYMIARY</h6>
    
    <v-text-field
      v-model.number="block.content.height"
      label="Wysokość (px)"
      type="number"
      variant="outlined"
      density="compact"
      class="mb-2"
      @input="$emit('update')"
    ></v-text-field>

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

    <h6 class="text-caption mb-2">WYGLĄD (OPCJONALNE)</h6>

    <v-text-field
      v-model="block.content.backgroundColor"
      label="Kolor tła"
      type="color"
      variant="outlined"
      density="compact"
      class="mb-2"
      @input="$emit('update')"
    ></v-text-field>

    <v-text-field
      v-model.number="block.content.borderRadius"
      label="Zaokrąglenie (px)"
      type="number"
      variant="outlined"
      density="compact"
      class="mb-2"
      @input="$emit('update')"
    ></v-text-field>

    <v-switch
      v-model="showBackground"
      label="Widoczne tło"
      density="compact"
      class="mb-2"
      @update:model-value="toggleBackground"
    ></v-switch>

    <div class="spacer-preview">
      <div class="preview-label">Podgląd odstępu:</div>
      <div 
        class="spacer-demo"
        :style="{
          height: Math.min(block.content.height, 100) + 'px',
          backgroundColor: block.content.backgroundColor || '#f0f0f0',
          borderRadius: (block.content.borderRadius || 0) + 'px',
          border: '1px dashed #ccc'
        }"
      >
        <span class="height-indicator">{{ block.content.height }}px</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SpacerProperties',
  props: {
    block: {
      type: Object,
      required: true
    }
  },
  emits: ['update'],
  data() {
    return {
      showBackground: false
    };
  },
  methods: {
    setHeightPreset(preset) {
      const presets = {
        small: 20,
        medium: 40,
        large: 80
      };
      
      if (presets[preset]) {
        this.block.content.height = presets[preset];
        this.$emit('update');
      }
    },
    
    toggleBackground() {
      if (!this.showBackground) {
        this.block.content.backgroundColor = 'transparent';
      } else {
        this.block.content.backgroundColor = '#f0f0f0';
      }
      this.$emit('update');
    }
  },
  
  mounted() {
    // Upewnij się, że wszystkie właściwości istnieją
    if (!this.block.content.backgroundColor) {
      this.block.content.backgroundColor = 'transparent';
    }
    if (this.block.content.borderRadius === undefined) {
      this.block.content.borderRadius = 0;
    }
    
    // Ustaw stan przełącznika na podstawie koloru tła
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