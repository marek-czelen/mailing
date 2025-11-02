<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :max-width="maxWidth"
    :persistent="persistent"
  >
    <v-card class="general-dialog">
      <v-card-title class="dialog-header">
        <slot name="title">
          <h2>{{ title }}</h2>
        </slot>
        <v-btn icon variant="text" @click="close" class="close-btn">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="dialog-content">
        <slot />
      </v-card-text>

      <v-card-actions class="dialog-actions">
        <slot name="actions">
          <v-spacer />
          <v-btn variant="text" @click="close">Anuluj</v-btn>
        </slot>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  title: { type: String, default: '' },
  maxWidth: { type: String, default: '600px' },
  persistent: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue', 'close'])

function close() {
  emit('close')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.general-dialog {
  border-radius: 16px !important;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15) !important;
}

.dialog-header {
  background: linear-gradient(135deg, #202950 0%, #515bad 100%) !important;
  color: #eadcf6 !important;
  padding: 24px !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
}

.dialog-header h2 {
  margin: 0;
  font-weight: 600;
}

.close-btn {
  color: #eadcf6 !important;
}

.dialog-content {
  padding: 32px !important;
  max-height: 70vh;
  overflow-y: auto;
}

.dialog-actions {
  padding: 16px 24px 24px 24px !important;
  background: #f8f9fa;
}

/* Scrollbar styling */
.dialog-content::-webkit-scrollbar {
  width: 6px;
}

.dialog-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.dialog-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.dialog-content::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}


</style>
<style>
.section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 20px;
  background: linear-gradient(135deg, #515bad 0%, #9395fa 100%);
  border-radius: 2px;
}

.v-switch {
  margin-bottom: 16px;
}
</style>