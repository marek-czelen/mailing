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
            

            <v-text-field
              v-model="formData.email"
              density="compact"
              label="Adres email"
              :rules="[rules.required, rules.email]"
              variant="outlined"
              prepend-inner-icon="mdi-email"
              required
            />

            <v-text-field
              v-model="formData.phone"
              density="compact"
              label="Numer telefonu"
              variant="outlined"
              prepend-inner-icon="mdi-phone"
            />
          </div>

          <!-- Contact Details -->
          <div class="section">
            <h3 class="section-title">Szczegóły kontaktu</h3>
            
            <div class="contact-row">
              <v-text-field
                v-model="formData.city"
                density="compact"
                label="Miasto"
                variant="outlined"
              />
              <v-text-field
                v-model="formData.type"
                density="compact"
                label="Rodzaj kontaktu"
                variant="outlined"
              />
            </div>
          </div>

          <!-- Unsubscribe Section -->
          <div class="section" v-if="isEditing">
            <h3 class="section-title">Zarządzanie subskrypcją</h3>
            
            <div class="unsubscribe-section">
              <div v-if="formData.unsubscribeDate" class="unsubscribe-info">
                <v-alert type="warning" variant="tonal">
                  <v-icon>mdi-email-remove</v-icon>
                  Kontakt wypisał się z listy mailingowej w dniu: 
                  <strong>{{ formatDate(formData.unsubscribeDate) }}</strong>
                </v-alert>
                
                <div class="unsubscribe-actions">
                  <v-btn 
                    color="success" 
                    variant="outlined" 
                    :loading="resubscribing"
                    :disabled="resubscribing || unsubscribing"
                    @click="resubscribeContact"
                  >
                    <v-icon left>mdi-email-plus</v-icon>
                    Zapisz ponownie na listę
                  </v-btn>
                </div>
              </div>
              
              <div v-else class="subscribe-info">
                <v-alert type="success" variant="tonal">
                  <v-icon>mdi-email-check</v-icon>
                  Kontakt jest zapisany na liście mailingowej
                </v-alert>
                
                <div class="unsubscribe-actions">
                  <v-btn 
                    color="warning" 
                    variant="outlined" 
                    :loading="unsubscribing"
                    :disabled="unsubscribing || resubscribing"
                    @click="unsubscribeContact"
                  >
                    <v-icon left>mdi-email-remove</v-icon>
                    Wypisz z listy
                  </v-btn>
                </div>
              </div>
            </div>
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
import { Databases } from '../../services/databases'

const props = defineProps({
  modelValue: Boolean,
  contact: Object,
  database: Object
})

const emit = defineEmits(['update:modelValue', 'save', 'close', 'contact-updated'])

// Reactive data
const valid = ref(false)
const saving = ref(false)
const form = ref(null)
const unsubscribing = ref(false)
const resubscribing = ref(false)

// Form data
const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  city: '',
  type: 'individual',
  unsubscribeDate: null
})

// Type options
const typeOptions = [
  { title: 'Indywidualny', value: 'individual' },
  { title: 'Biznesowy', value: 'business' },
  { title: 'VIP', value: 'vip' },
  { title: 'Partner', value: 'partner' }
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
      city: newContact.city || '',
      type: newContact.type || 'individual',
      unsubscribeDate: newContact.unsubscribeDate || null
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
    city: '',
    type: 'individual',
    unsubscribeDate: null
  }
}

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pl-PL')
}

async function unsubscribeContact() {
  if (!props.contact?.id) {
    alert('Brak ID kontaktu')
    return
  }
  
  const confirmed = confirm(
    'Czy na pewno chcesz wypisać ten kontakt ze WSZYSTKICH list mailingowych tego klienta?\n\n' +
    'Ta operacja wypisze kontakt ze wszystkich baz danych i jest nieodwracalna.'
  )
  
  if (!confirmed) return
  
  unsubscribing.value = true
  
  try {
    const result = await Databases.unsubscribeContact(props.contact.id)
    
    if (result.response.success) {
      // Aktualizuj lokalny stan
      formData.value.unsubscribeDate = new Date().toISOString().split('T')[0]
      
      // Powiadom rodzica o zmianie
      emit('contact-updated', {
        ...props.contact,
        unsubscribeDate: formData.value.unsubscribeDate
      })
      
      alert('Kontakt został pomyślnie wypisany ze wszystkich list mailingowych.')
    } else {
      throw new Error(result.message || 'Nieznany błąd')
    }
  } catch (error) {
    console.error('Błąd podczas wypisywania kontaktu:', error)
    alert('Błąd podczas wypisywania kontaktu: ' + error.message)
  } finally {
    unsubscribing.value = false
  }
}

async function resubscribeContact() {
  if (!props.contact?.id) {
    alert('Brak ID kontaktu')
    return
  }
  
  const confirmed = confirm(
    'Czy na pewno chcesz ponownie zapisać ten kontakt na listy mailingowe?\n\n' +
    'Kontakt będzie mógł ponownie otrzymywać wiadomości e-mail.'
  )
  
  if (!confirmed) return
  
  resubscribing.value = true
  
  try {
    const result = await Databases.resubscribeContact(props.contact.id)
    
    if (result.success) {
      // Aktualizuj lokalny stan
      formData.value.unsubscribeDate = null
      
      // Powiadom rodzica o zmianie
      emit('contact-updated', {
        ...props.contact,
        unsubscribeDate: null
      })
      
      alert('Kontakt został pomyślnie zapisany ponownie na listy mailingowe.')
    } else {
      throw new Error(result.message || 'Nieznany błąd')
    }
  } catch (error) {
    console.error('Błąd podczas ponownego zapisywania kontaktu:', error)
    alert('Błąd podczas ponownego zapisywania kontaktu: ' + error.message)
  } finally {
    resubscribing.value = false
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
  margin-bottom: 12px;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
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
.contact-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.unsubscribe-section {
  margin-top: 16px;
}

.unsubscribe-actions,
.subscribe-actions {
  margin-top: 12px;
  display: flex;
  justify-content: center;
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
  .contact-row {
    grid-template-columns: 1fr;
  }
}
</style>