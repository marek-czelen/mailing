<template>
  <div class="text-properties">
    <h6 class="text-caption mb-2">TREŚĆ</h6>
    
    <v-textarea
      v-model="block.content.text"
      label="Tekst"
      variant="outlined"
      density="compact"
      rows="3"
      class="mb-3"
      @input="$emit('update')"
    ></v-textarea>

    <h6 class="text-caption mb-2">STYLOWANIE</h6>

    <v-text-field
      v-model.number="block.content.fontSize"
      label="Rozmiar czcionki (px)"
      type="number"
      variant="outlined"
      density="compact"
      class="mb-2"
      @input="$emit('update')"
    ></v-text-field>

    <v-text-field
      v-model="block.content.color"
      label="Kolor tekstu"
      type="color"
      variant="outlined"
      density="compact"
      class="mb-2"
      @input="$emit('update')"
    ></v-text-field>

    <v-select
      v-model="block.content.fontWeight"
      :items="fontWeightOptions"
      label="Grubość czcionki"
      variant="outlined"
      density="compact"
      class="mb-2"
      @update:model-value="$emit('update')"
    ></v-select>

    <v-select
      v-model="block.content.fontStyle"
      :items="fontStyleOptions"
      label="Styl czcionki"
      variant="outlined"
      density="compact"
      class="mb-2"
      @update:model-value="$emit('update')"
    ></v-select>
  </div>
</template>

<script>
export default {
  name: 'TextProperties',
  props: {
    block: {
      type: Object,
      required: true
    }
  },
  emits: ['update'],
  data() {
    return {
      fontWeightOptions: [
        { title: 'Normalna', value: 'normal' },
        { title: 'Pogrubiona', value: 'bold' },
        { title: 'Cienka', value: '300' },
        { title: 'Średnia', value: '500' },
        { title: 'Gruba', value: '700' },
        { title: 'Bardzo gruba', value: '900' }
      ],
      fontStyleOptions: [
        { title: 'Normalna', value: 'normal' },
        { title: 'Kursywa', value: 'italic' }
      ]
    };
  }
};
</script>

<style scoped>
.text-properties {
  width: 100%;
}
</style>