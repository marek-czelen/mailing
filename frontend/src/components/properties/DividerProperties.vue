<template>
  <!-- Panel właściwości dla bloku separatora -->
  <div class="divider-properties">
    <v-text-field
      v-model.number="block.content.thickness"
      label="Grubość linii (px)"
      type="number"
      variant="outlined"
      density="compact"
      class="mb-2"
      @update:model-value="$emit('update')"
    ></v-text-field>

    <v-select
      v-model="block.content.style"
      :items="lineStyles"
      label="Styl linii"
      variant="outlined"
      density="compact"
      class="mb-2"
      @update:model-value="$emit('update')"
    ></v-select>

    <label class="text-caption d-block mb-1">Kolor linii</label>
    <input
      type="color"
      v-model="block.content.color"
      class="color-input mb-2"
      @input="$emit('update')"
    />

    <v-text-field
      v-model="block.content.width"
      label="Szerokość (np. 80%, 400px)"
      variant="outlined"
      density="compact"
      class="mb-2"
      @update:model-value="$emit('update')"
    ></v-text-field>
  </div>
</template>

<script>
export default {
  name: 'DividerProperties',
  props: {
    block: {
      type: Object,
      required: true
    }
  },
  emits: ['update'],
  data() {
    return {
      lineStyles: [
        { title: 'Ciągła', value: 'solid' },
        { title: 'Przerywana', value: 'dashed' },
        { title: 'Kropkowana', value: 'dotted' },
        { title: 'Podwójna', value: 'double' }
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
