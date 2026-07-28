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
          <v-btn variant="text" v-if="cancelButton" @click="close">{{ t('common.cancel') }}</v-btn>
          <v-btn color="primary" variant="elevated" v-if="saveButton" @click="save">
            <v-icon left>mdi-content-save</v-icon>
            {{ t('common.save') }}
          </v-btn>
        </slot>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: Boolean,
  title: { type: String, default: '' },
  maxWidth: { type: String, default: '700px' },
  saveButton: { type: Boolean, default: false },
  cancelButton: { type: Boolean, default: true },
  persistent: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue', 'close'])

const { t } = useI18n()

function close() {
  emit('close')
  emit('update:modelValue', false)
}

function save() {
  emit('save')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.general-dialog {
  border-radius: 8px !important;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12) !important;
}

.dialog-header {
  background: #fafafa !important;
  color: #1a1a2e !important;
  padding: 12px 16px !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  border-bottom: 1px solid #e0e0e0;
}

.dialog-header h2 {
  margin: 0;
  font-weight: 600;
  font-size: 1rem;
}

.close-btn {
  color: #718096 !important;
}

.dialog-content {
  max-height: calc(100vh - 180px);
  overflow-y: auto;
  padding: 16px 20px;
}

.dialog-actions {
  padding: 10px 16px !important;
  background: #fafafa;
  border-top: 1px solid #e0e0e0;
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
  background: #6366f1;
  border-radius: 2px;
}

.v-switch {
  margin-bottom: 16px;
}
</style>