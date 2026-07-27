<template>
  <!-- Panel właściwości dla bloku nagłówka -->
  <div class="header-properties">
    <h6 class="text-caption mb-2">LOGO</h6>
    
    <v-text-field
      v-model="block.content.logoSrc"
      label="URL logo"
      variant="outlined"
      density="compact"
      class="mb-2"
      @update:model-value="$emit('update')"
    ></v-text-field>

    <v-text-field
      v-model="block.content.logoAlt"
      label="Tekst alternatywny logo"
      variant="outlined"
      density="compact"
      class="mb-2"
      @update:model-value="$emit('update')"
    ></v-text-field>

    <v-text-field
      v-model.number="block.content.logoWidth"
      label="Szerokość logo (px)"
      type="number"
      variant="outlined"
      density="compact"
      class="mb-2"
      @update:model-value="$emit('update')"
    ></v-text-field>

    <v-text-field
      v-model.number="block.content.logoMarginBottom"
      label="Odstęp pod logo (px)"
      type="number"
      variant="outlined"
      density="compact"
      class="mb-2"
      @update:model-value="$emit('update')"
    ></v-text-field>

    <v-divider class="mb-3"></v-divider>

    <h6 class="text-caption mb-2">TYTUŁ</h6>

    <v-text-field
      v-model="block.content.title"
      label="Tekst tytułu"
      variant="outlined"
      density="compact"
      class="mb-2"
      @update:model-value="$emit('update')"
    ></v-text-field>

    <v-text-field
      v-model.number="block.content.titleSize"
      label="Rozmiar czcionki (px)"
      type="number"
      variant="outlined"
      density="compact"
      class="mb-2"
      @update:model-value="$emit('update')"
    ></v-text-field>

    <v-select
      v-model="block.content.titleWeight"
      :items="fontWeights"
      label="Grubość czcionki"
      variant="outlined"
      density="compact"
      class="mb-2"
      @update:model-value="$emit('update')"
    ></v-select>

    <label class="text-caption d-block mb-1">Kolor tytułu</label>
    <input
      type="color"
      v-model="block.content.titleColor"
      class="color-input mb-2"
      @input="$emit('update')"
    />

    <v-divider class="mb-3"></v-divider>

    <h6 class="text-caption mb-2">PODTYTUŁ</h6>

    <v-text-field
      v-model="block.content.subtitle"
      label="Tekst podtytułu"
      variant="outlined"
      density="compact"
      class="mb-2"
      @update:model-value="$emit('update')"
    ></v-text-field>

    <v-text-field
      v-model.number="block.content.subtitleSize"
      label="Rozmiar czcionki (px)"
      type="number"
      variant="outlined"
      density="compact"
      class="mb-2"
      @update:model-value="$emit('update')"
    ></v-text-field>

    <label class="text-caption d-block mb-1">Kolor podtytułu</label>
    <input
      type="color"
      v-model="block.content.subtitleColor"
      class="color-input mb-2"
      @input="$emit('update')"
    />
  </div>
</template>

<script>
export default {
  name: 'HeaderProperties',
  props: {
    block: {
      type: Object,
      required: true
    }
  },
  emits: ['update'],
  data() {
    return {
      fontWeights: [
        { title: 'Normalny', value: 'normal' },
        { title: 'Pogrubiony', value: 'bold' },
        { title: 'Bardzo gruby', value: '900' }
      ]
    };
  }
};
</script>

<style scoped>
.color-input {
  width: 100%;
  height: 36px;
  border: 1px solid #bdbdbd;
  border-radius: 4px;
  cursor: pointer;
  padding: 2px 4px;
}
</style>
