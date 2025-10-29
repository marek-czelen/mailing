<template>
  <v-dialog 
    :model-value="modelValue" 
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600px"
    persistent
  >
    <v-card class="database-dialog">
      <v-card-title class="dialog-header">
        <h2>{{ isEditing ? 'Edytuj bazę danych' : 'Nowa baza danych' }}</h2>
        <v-btn 
          icon 
          variant="text" 
          @click="close"
          class="close-btn"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="dialog-content">
        <v-form ref="form" v-model="valid" @submit.prevent="save">
          <!-- Basic Information -->
          <div class="section">
            <h3 class="section-title">Podstawowe informacje</h3>
            
            <v-text-field
              v-model="formData.name"
              label="Nazwa bazy danych"
              :rules="[rules.required]"
              variant="outlined"
              prepend-inner-icon="mdi-database"
              required
            />

            <v-textarea
              v-model="formData.description"
              label="Opis (opcjonalny)"
              variant="outlined"
              prepend-inner-icon="mdi-text"
              rows="3"
              auto-grow
              counter="500"
            />
          </div>

          <!-- Tags -->
          <div class="section">
            <h3 class="section-title">Tagi</h3>
            <v-combobox
              v-model="formData.tags"
              label="Dodaj tagi"
              variant="outlined"
              prepend-inner-icon="mdi-tag-multiple"
              multiple
              chips
              closable-chips
              hint="Naciśnij Enter, aby dodać nowy tag"
              persistent-hint
            >
              <template v-slot:chip="{ props, item }">
                <v-chip
                  v-bind="props"
                  :text="item"
                  size="small"
                  color="primary"
                  variant="elevated"
                />
              </template>
            </v-combobox>
          </div>

          <!-- Privacy Settings -->
          <div class="section">
            <h3 class="section-title">Ustawienia prywatności</h3>
            
            <v-switch
              v-model="formData.gdprCompliant"
              label="Zgodność z RODO"
              color="primary"
              inset
              hide-details
            />
            
            <v-switch
              v-model="formData.allowExport"
              label="Zezwól na eksport danych"
              color="primary"
              inset
              hide-details
            />
            
          </div>

        </v-form>
      </v-card-text>

      <v-card-actions class="dialog-actions">
        <v-spacer />
        <v-btn variant="text" @click="close">
          Anuluj
        </v-btn>
        <v-btn 
          color="primary"
          :loading="saving"
          :disabled="!valid"
          @click="save"
        >
          {{ isEditing ? 'Zapisz zmiany' : 'Utwórz bazę' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  database: Object
})

const emit = defineEmits(['update:modelValue', 'save', 'close'])

// Reactive data
const valid = ref(false)
const saving = ref(false)
const form = ref(null)

// Form data
const formData = ref({
  name: '',
  description: '',
  tags: [],
  gdprCompliant: true,
  allowExport: true,
  autoCleanup: false,
  notifications: {
    newContacts: true,
    bounces: true,
    unsubscribes: true
  },
  customFieldsTemplate: []
})

// Field types for custom fields
const fieldTypes = [
  { title: 'Tekst', value: 'text' },
  { title: 'Numer', value: 'number' },
  { title: 'Email', value: 'email' },
  { title: 'Data', value: 'date' },
  { title: 'Tak/Nie', value: 'boolean' },
  { title: 'Lista wyboru', value: 'select' },
  { title: 'Wieloliniowy tekst', value: 'textarea' }
]

// Validation rules
const rules = {
  required: value => !!value || 'To pole jest wymagane'
}

// Computed
const isEditing = computed(() => !!props.database)

// Watch for database changes
watch(() => props.database, (newDatabase) => {
  if (newDatabase) {
    formData.value = {
      name: newDatabase.name || '',
      description: newDatabase.description || '',
      tags: [...(newDatabase.tags || [])],
      gdprCompliant: newDatabase.gdprCompliant !== false,
      allowExport: newDatabase.allowExport !== false,
      autoCleanup: newDatabase.autoCleanup || false,
      notifications: {
        newContacts: newDatabase.notifications?.newContacts !== false,
        bounces: newDatabase.notifications?.bounces !== false,
        unsubscribes: newDatabase.notifications?.unsubscribes !== false
      },
      customFieldsTemplate: [...(newDatabase.customFieldsTemplate || [])]
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// Methods
function resetForm() {
  formData.value = {
    name: '',
    description: '',
    tags: [],
    gdprCompliant: true,
    allowExport: true,
    autoCleanup: false,
    notifications: {
      newContacts: true,
      bounces: true,
      unsubscribes: true
    },
    customFieldsTemplate: []
  }
}

function addCustomField() {
  formData.value.customFieldsTemplate.push({
    name: '',
    type: 'text',
    required: false
  })
}

function removeCustomField(index) {
  formData.value.customFieldsTemplate.splice(index, 1)
}

async function save() {
  if (!valid.value) return
  
  saving.value = true
  
  try {
    // Validate form
    await form.value.validate()
    
    // Emit save event with form data
    emit('save', { ...formData.value })
  } catch (error) {
    console.error('Błąd podczas zapisywania:', error)
  } finally {
    saving.value = false
  }
}

function close() {
  emit('close')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.database-dialog {
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

.section-subtitle {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 16px;
}

.custom-fields {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  background: #fafafa;
}

.custom-field-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 12px;
}

.custom-field-item .v-text-field,
.custom-field-item .v-select {
  flex: 1;
}

.dialog-actions {
  padding: 16px 24px 24px 24px !important;
  background: #f8f9fa;
}

/* Custom switches styling */
.v-switch {
  margin-bottom: 16px;
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