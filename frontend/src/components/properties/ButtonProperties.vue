<template>
  <div class="button-properties">
    <h6 class="text-caption mb-2">TREŚĆ</h6>
    
    <v-text-field
      v-model="block.content.text"
      label="Tekst przycisku"
      variant="outlined"
      density="compact"
      class="mb-2"
      @input="$emit('update')"
    ></v-text-field>

    <v-text-field
      v-model="block.content.url"
      label="Link (URL)"
      variant="outlined"
      density="compact"
      class="mb-3"
      @input="$emit('update')"
    ></v-text-field>

    <h6 class="text-caption mb-2">WYGLĄD</h6>

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
      v-model="block.content.textColor"
      label="Kolor tekstu"
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

    <h6 class="text-caption mb-2">PADDING</h6>
    
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
    block: {
      type: Object,
      required: true
    }
  },
  emits: ['update'],
  methods: {
    getPaddingPreset() {
      const padding = this.block.content.padding;
      if (padding === '8px 16px') return 'small';
      if (padding === '12px 24px') return 'medium';
      if (padding === '16px 32px') return 'large';
      return null;
    },
    
    setPaddingPreset(preset) {
      const presets = {
        small: '8px 16px',
        medium: '12px 24px',
        large: '16px 32px'
      };
      
      if (presets[preset]) {
        this.block.content.padding = presets[preset];
        this.$emit('update');
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