<template>
  <v-dialog 
    :model-value="modelValue" 
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600px"
    persistent
  >
    <v-card class="contact-dialog">
      <v-card-title class="dialog-header">
        <h2>{{ isEditing ? 'Edytuj kontakt' : 'Nowy kontakt' }}</h2>
        <v-btn icon variant="text" @click="close" class="close-btn">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="dialog-content">
        <v-form ref="form" v-model="valid" @submit.prevent="save">
          <!-- Basic Information -->
          <div class="section">
            <h3 class="section-title">Podstawowe informacje</h3>
            
            <div class="name-row">
              <v-text-field
                v-model="formData.firstName"
                label="Imię"
                :rules="[rules.required]"
                variant="outlined"
                required
              />
              <v-text-field
                v-model="formData.lastName"
                label="Nazwisko"
                :rules="[rules.required]"
                variant="outlined"
                required
              />
            </div>

            <v-text-field
              v-model="formData.email"
              label="Adres email"
              :rules="[rules.required, rules.email]"
              variant="outlined"
              prepend-inner-icon="mdi-email"
              required
            />

            <v-text-field
              v-model="formData.phone"
              label="Numer telefonu"
              variant="outlined"
              prepend-inner-icon="mdi-phone"
            />
          </div>

          <!-- Address -->
          <div class="section">
            <h3 class="section-title">Adres</h3>
            
            <v-text-field
              v-model="formData.address"
              label="Ulica i numer"
              variant="outlined"
            />

            <div class="address-row">
              <v-text-field
                v-model="formData.city"
                label="Miasto"
                variant="outlined"
              />
              <v-text-field
                v-model="formData.postalCode"
                label="Kod pocztowy"
                variant="outlined"
              />
            </div>

            <v-text-field
              v-model="formData.country"
              label="Kraj"
              variant="outlined"
            />
          </div>

          <!-- Contact Preferences -->
          <div class="section">
            <h3 class="section-title">Preferencje</h3>
            
            <v-select
              v-model="formData.status"
              :items="statusOptions"
              label="Status kontaktu"
              variant="outlined"
              required
            />

            <v-combobox
              v-model="formData.tags"
              label="Tagi"
              variant="outlined"
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

            <div class="preferences-checkboxes">
              <v-switch
                v-model="formData.preferences.newsletter"
                label="Newsletter"
                color="primary"
                inset
              />
              <v-switch
                v-model="formData.preferences.promotions"
                label="Promocje"
                color="primary"
                inset
              />
              <v-switch
                v-model="formData.preferences.sms"
                label="SMS"
                color="primary"
                inset
              />
            </div>
          </div>

          <!-- Custom Fields (if database has them) -->
          <div v-if="database?.customFields?.length" class="section">
            <h3 class="section-title">Dodatkowe informacje</h3>
            
            <div
              v-for="field in database.customFields"
              :key="field.id"
              class="custom-field"
            >
              <v-text-field
                v-if="field.type === 'text'"
                v-model="formData.customFields[field.id]"
                :label="field.name"
                :required="field.required"
                variant="outlined"
              />
              
              <v-textarea
                v-else-if="field.type === 'textarea'"
                v-model="formData.customFields[field.id]"
                :label="field.name"
                :required="field.required"
                variant="outlined"
                rows="3"
              />
              
              <v-text-field
                v-else-if="field.type === 'email'"
                v-model="formData.customFields[field.id]"
                :label="field.name"
                :required="field.required"
                type="email"
                variant="outlined"
              />
              
              <v-text-field
                v-else-if="field.type === 'number'"
                v-model.number="formData.customFields[field.id]"
                :label="field.name"
                :required="field.required"
                type="number"
                variant="outlined"
              />
              
              <v-text-field
                v-else-if="field.type === 'date'"
                v-model="formData.customFields[field.id]"
                :label="field.name"
                :required="field.required"
                type="date"
                variant="outlined"
              />
              
              <v-select
                v-else-if="field.type === 'select'"
                v-model="formData.customFields[field.id]"
                :items="field.options"
                :label="field.name"
                :required="field.required"
                variant="outlined"
              />
              
              <v-switch
                v-else-if="field.type === 'boolean'"
                v-model="formData.customFields[field.id]"
                :label="field.name"
                color="primary"
                inset
              />
            </div>
          </div>

          <!-- Notes -->
          <div class="section">
            <h3 class="section-title">Notatki</h3>
            <v-textarea
              v-model="formData.notes"
              label="Dodatkowe notatki"
              variant="outlined"
              rows="3"
              counter="1000"
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
          {{ isEditing ? 'Zapisz zmiany' : 'Dodaj kontakt' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  contact: Object,
  database: Object
})

const emit = defineEmits(['update:modelValue', 'save', 'close'])

// Reactive data
const valid = ref(false)
const saving = ref(false)
const form = ref(null)

// Form data
const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  country: '',
  status: 'active',
  tags: [],
  preferences: {
    newsletter: true,
    promotions: false,
    sms: false
  },
  customFields: {},
  notes: ''
})

// Status options
const statusOptions = [
  { title: 'Aktywny', value: 'active' },
  { title: 'Nieaktywny', value: 'inactive' },
  { title: 'Zablokowany', value: 'blocked' },
  { title: 'Wypisany', value: 'unsubscribed' }
]

// Validation rules
const rules = {
  required: value => !!value || 'To pole jest wymagane',
  email: value => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || 'Nieprawidłowy adres email'
  }
}

// Computed
const isEditing = computed(() => !!props.contact)

// Watch for contact changes
watch(() => props.contact, (newContact) => {
  if (newContact) {
    formData.value = {
      firstName: newContact.firstName || '',
      lastName: newContact.lastName || '',
      email: newContact.email || '',
      phone: newContact.phone || '',
      address: newContact.address || '',
      city: newContact.city || '',
      postalCode: newContact.postalCode || '',
      country: newContact.country || '',
      status: newContact.status || 'active',
      tags: [...(newContact.tags || [])],
      preferences: {
        newsletter: newContact.preferences?.newsletter !== false,
        promotions: newContact.preferences?.promotions || false,
        sms: newContact.preferences?.sms || false
      },
      customFields: { ...(newContact.customFields || {}) },
      notes: newContact.notes || ''
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// Methods
function resetForm() {
  formData.value = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    status: 'active',
    tags: [],
    preferences: {
      newsletter: true,
      promotions: false,
      sms: false
    },
    customFields: {},
    notes: ''
  }
}

async function save() {
  if (!valid.value) return
  
  saving.value = true
  
  try {
    // Validate form
    await form.value.validate()
    
    // Emit save event with form data
    emit('save', { 
      ...formData.value,
      lastActivity: new Date(),
      lastActivityType: isEditing.value ? 'Zaktualizowano' : 'Utworzono'
    })
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
.contact-dialog {
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
  margin-bottom: 16px;
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

.name-row,
.address-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.preferences-checkboxes {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 16px;
}

.custom-field {
  margin-bottom: 16px;
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

@media (max-width: 768px) {
  .name-row,
  .address-row {
    grid-template-columns: 1fr;
  }
  
  .preferences-checkboxes {
    grid-template-columns: 1fr;
  }
}
</style>