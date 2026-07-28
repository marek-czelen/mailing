<template>
  <v-dialog 
    :model-value="modelValue" 
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="700px"
    persistent
  >
    <v-card class="contact-dialog">
      <!-- Loading Overlay for operations -->
      <v-overlay
        :model-value="unsubscribing || resubscribing || saving"
        class="align-center justify-center"
        contained
        persistent
      >
        <div class="loading-content">
          <v-progress-circular
            indeterminate
            size="64"
            color="primary"
          ></v-progress-circular>
          <h3 class="loading-title">
            {{ saving ? t('contacts.saving') : unsubscribing ? t('contacts.unsubscribing') : t('contacts.resubscribing') }}
          </h3>
          <p class="loading-subtitle">
            {{ t('common.pleaseWait') }}
          </p>
        </div>
      </v-overlay>

      <v-card-title class="dialog-header">
        <h2>{{ isEditing ? t('contacts.editContact') : t('contacts.newContact') }}</h2>
        <v-btn icon variant="text" @click="close" class="close-btn" :disabled="unsubscribing || resubscribing || saving">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="dialog-content">
        <v-form ref="form" v-model="valid" @submit.prevent="save">
          <!-- Basic Information -->
          <div class="section">
            <h3 class="section-title">{{ t('contacts.basicInfo') }}</h3>
            

            <v-text-field
              v-model="formData.mailAddress"
              density="compact"
              :label="t('contacts.email')"
              :rules="[rules.required, rules.email]"
              variant="outlined"
              prepend-inner-icon="mdi-email"
              required
            />

            <v-text-field
              v-model="formData.phone"
              density="compact"
              :label="t('contacts.phone')"
              variant="outlined"
              prepend-inner-icon="mdi-phone"
            />
          </div>

          <!-- Contact Details -->
          <div class="section">
            <h3 class="section-title">{{ t('contacts.details') }}</h3>
            
            <div class="contact-row">
              <v-text-field
                v-model="formData.miasto"
                density="compact"
                :label="t('contacts.city')"
                variant="outlined"
              />
              <v-text-field
                v-model="formData.rodzaj"
                density="compact"
                :label="t('contacts.type')"
                variant="outlined"
              />
            </div>
          </div>

          <!-- Unsubscribe Section -->
          <div class="section" v-if="isEditing">
            <h3 class="section-title">{{ t('contacts.manageSubscription') }}</h3>
            
            <div class="unsubscribe-section">
              <div v-if="formData.unsubscribeDate" class="unsubscribe-info">
                <v-alert type="warning" variant="tonal">
                  <v-icon>mdi-email-remove</v-icon>
                  {{ t('contacts.unsubscribedOn') }}: 
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
                    {{ t('contacts.resubscribeButton') }}
                  </v-btn>
                </div>
              </div>
              
              <div v-else class="subscribe-info">
                <v-alert type="success" variant="tonal">
                  <v-icon>mdi-email-check</v-icon>
                  {{ t('contacts.subscribed') }}
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
                    {{ t('contacts.unsubscribeButton') }}
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
          {{ t('common.cancel') }}
        </v-btn>
        <v-btn 
          color="primary"
          :loading="saving"
          :disabled="!valid"
          @click="save"
        >
          {{ isEditing ? t('contacts.saveChanges') : t('contacts.addContact') }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Confirmation Dialogs -->
    <!-- Unsubscribe Confirmation Dialog -->
    <v-dialog 
      v-model="showUnsubscribeDialog" 
      max-width="500px" 
      persistent
    >
      <v-card>
        <v-card-title class="confirmation-header">
          <v-icon color="warning" class="mr-2">mdi-alert</v-icon>
          {{ t('contacts.unsubscribeTitle') }}
        </v-card-title>
        <v-card-text class="confirmation-content">
          <p>{{ t('contacts.unsubscribeConfirm') }}</p>
          <v-alert type="warning" variant="tonal" class="mt-3">
            <v-icon>mdi-information</v-icon>
            {{ t('contacts.unsubscribeWarning') }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showUnsubscribeDialog = false">
            {{ t('common.cancel') }}
          </v-btn>
          <v-btn 
            color="warning" 
            :loading="unsubscribing"
            @click="confirmUnsubscribe"
          >
            {{ t('contacts.unsubscribeButton') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Resubscribe Confirmation Dialog -->
    <v-dialog 
      v-model="showResubscribeDialog" 
      max-width="500px" 
      persistent
    >
      <v-card>
        <v-card-title class="confirmation-header">
          <v-icon color="success" class="mr-2">mdi-check-circle</v-icon>
          {{ t('contacts.resubscribeTitle') }}
        </v-card-title>
        <v-card-text class="confirmation-content">
          <p>{{ t('contacts.resubscribeConfirm') }}</p>
          <v-alert type="info" variant="tonal" class="mt-3">
            <v-icon>mdi-information</v-icon>
            {{ t('contacts.resubscribeInfo') }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showResubscribeDialog = false">
            {{ t('common.cancel') }}
          </v-btn>
          <v-btn 
            color="success" 
            :loading="resubscribing"
            @click="confirmResubscribe"
          >
            {{ t('contacts.resubscribeButton') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success/Error Snackbar -->
      <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="5000"
    >
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="snackbar.show = false"
        >
          {{ t('common.cancel') }}
        </v-btn>
      </template>
    </v-snackbar>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits } from 'vue'
import { Databases } from '../../services/databases'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: Boolean,
  contact: Object,
  database: Object
})

const emit = defineEmits(['update:modelValue', 'save', 'close', 'contact-updated'])

const { t, locale } = useI18n()

// Reactive data
const valid = ref(false)
const saving = ref(false)
const form = ref(null)
const unsubscribing = ref(false)
const resubscribing = ref(false)
const showUnsubscribeDialog = ref(false)
const showResubscribeDialog = ref(false)

// Snackbar for notifications
const snackbar = ref({
  show: false,
  message: '',
  color: 'info'
})

// Form data
const formData = ref({
  mailAddress: '',
  miasto: '',
  rodzaj: '',
  phone: '',
  unsubscribeDate: null
})

// Type options (localized)
const typeOptions = () => [
  { title: t('contacts.typeOptions.primarySchool'), value: 'podstawowa' },
  { title: t('contacts.typeOptions.highSchool'), value: 'srednia' },
  { title: t('contacts.typeOptions.university'), value: 'wyzsza' },
  { title: t('contacts.typeOptions.kindergarten'), value: 'przedszkole' },
  { title: t('contacts.typeOptions.privateSchool'), value: 'prywatna' },
  { title: t('contacts.typeOptions.other'), value: 'inny' }
]

// Validation rules
const rules = {
  required: value => !!value || t('validation.required'),
  email: value => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || t('validation.email')
  }
}

// Computed
const isEditing = computed(() => !!props.contact)

// Watch for contact changes
watch(() => props.contact, (newContact) => {
  if (newContact) {
    formData.value = {
        mailAddress: newContact.mailAddress || '',
        miasto: newContact.miasto || '',
        rodzaj: newContact.rodzaj || '',
        phone: newContact.phone || '',
        unsubscribeDate: newContact.unsubscribesDate || null,
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// Methods
function resetForm() {
  formData.value = {
    mailAddress: '',
    miasto: '',
    rodzaj: '',
    phone: '',
    unsubscribeDate: null
  }
}

// Snackbar helper
function showSnackbar(message, color = 'info') {
  snackbar.value = {
    show: true,
    message,
    color
  }
}

function formatDate(date) {
  if (!date) return '-'
  const localeTag = locale.value === 'pl' ? 'pl-PL' : 'en-US'
  return new Date(date).toLocaleDateString(localeTag)
}

function unsubscribeContact() {
  if (!props.contact?.id) {
    showSnackbar(t('contacts.noDatabaseId'), 'error')
    return
  }
  
  showUnsubscribeDialog.value = true
}

async function confirmUnsubscribe() {
  showUnsubscribeDialog.value = false
  unsubscribing.value = true
  
  try {
    const result = await Databases.unsubscribeContact(props.contact.hash)
    
    if (result.response?.success || result.success) {
      // Aktualizuj lokalny stan
      formData.value.unsubscribeDate = new Date().toISOString().split('T')[0]
      
      // Powiadom rodzica o zmianie
      emit('contact-updated', {
        ...props.contact,
        ...result.data.contact
      })

        showSnackbar(t('contacts.unsubscribedSuccess'), 'success')
    } else {
      throw new Error(result.message || t('contacts.unknownError'))
    }
  } catch (error) {
    console.error('Błąd podczas wypisywania kontaktu:', error)
    showSnackbar(t('contacts.unsubscribedError') + ': ' + error.message, 'error')
  } finally {
    unsubscribing.value = false
  }
}

function resubscribeContact() {
  if (!props.contact?.id) {
    showSnackbar(t('contacts.noDatabaseId'), 'error')
    return
  }
  
  showResubscribeDialog.value = true
}

async function confirmResubscribe() {
  showResubscribeDialog.value = false
  resubscribing.value = true
  
  try {
    const result = await Databases.resubscribeContact(props.contact.hash)
    
    if (result.response.success) {
      // Aktualizuj lokalny stan
      formData.value.unsubscribeDate = null
      
      // Powiadom rodzica o zmianie
      emit('contact-updated', {
        ...props.contact,
        ...result.data.contact
      })
      
      showSnackbar(t('contacts.resubscribedSuccess'), 'success')
    } else {
      throw new Error(result.message || t('contacts.unknownError'))
    }
  } catch (error) {
    console.error('Błąd podczas ponownego zapisywania kontaktu:', error)
    showSnackbar(t('contacts.resubscribeError') + ': ' + error.message, 'error')
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
    
    if (isEditing.value && props.contact?.id) {
      // Update existing contact via backend
      const updateData = {
        id: props.contact.id,
        mailAddress: formData.value.mailAddress,
        miasto: formData.value.miasto,
        phone: formData.value.phone,
        rodzaj: formData.value.rodzaj,
        active: 1, // Always active when editing
        databaseId: props.database?.id
      }
      
      const result = await Databases.updateContact(updateData)
      
      if (result.success || result.response?.success) {
        showSnackbar(t('contacts.updatedSuccess'), 'success')
        
        // Powiadom rodzica o zmianie - przekaż zaktualizowane dane
        emit('contact-updated', {
          ...props.contact,
          ...formData.value,
          lastActivity: new Date(),
          lastActivityType: t('contacts.activity.updated')
        })
        
        // Zamknij dialog
        close()
      } else {
        throw new Error(result.message || t('contacts.unknownError'))
      }
    } else {
      // Create new contact via backend
      if (!props.database?.id) {
        throw new Error(t('contacts.noDatabaseId'))
      }
      
      const newContactData = {
        mailAddress: formData.value.mailAddress,
        databaseId: props.database.id,
        miasto: formData.value.miasto,
        phone: formData.value.phone,
        rodzaj: formData.value.rodzaj,
        active: 1 // Nowe kontakty są domyślnie aktywne
      }
      
      const result = await Databases.addContactToDatabase(newContactData)
      
      console.log('Wynik dodawania kontaktu:', result)
      
      if (result.success || result.response?.success || result.data) {
        showSnackbar(t('contacts.addedSuccess'), 'success')
        
        // Powiadom rodzica o nowym kontakcie - używaj danych z odpowiedzi API
        const apiContact = result.data || result.contact
        const newContact = apiContact || {
          id: Date.now(), // Fallback ID jeśli API nie zwróci ID
          mailAddress: newContactData.mailAddress,
          email: newContactData.mailAddress, // Dla kompatybilności z tabelą
          miasto: newContactData.miasto,
          phone: newContactData.phone,
          rodzaj: newContactData.rodzaj,
          active: newContactData.active,
          unsubscribesDate: null, // Nowy kontakt nie jest wypisany
          lastActivity: new Date(),
          lastActivityType: t('contacts.activity.created')
        }
        
        console.log('Emitowanie contact-updated:', newContact)
        emit('contact-updated', newContact)
        
        // Zamknij dialog
        close()
      } else {
        console.error('Błąd walidacji sukcesu:', result)
        throw new Error(result.message || t('contacts.unknownAddError'))
      }
    }
  } catch (error) {
    console.error('Błąd podczas zapisywania:', error)
    showSnackbar(t('contacts.saveError') + ': ' + error.message, 'error')
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
  border-radius: 8px !important;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12) !important;
  position: relative;
}

/* Loading Overlay Styles */
.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: white;
}

.loading-title {
  margin: 20px 0 6px 0;
  font-weight: 600;
  font-size: 1.2rem;
}

.loading-subtitle {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9rem;
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
  padding: 16px 20px !important;
  max-height: calc(100vh - 180px);
  overflow-y: auto;
}

.section {
  margin-bottom: 10px;
}

.section-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-title::before {
  content: '';
  width: 3px;
  height: 16px;
  background: #6366f1;
  border-radius: 2px;
}

.name-row,
.contact-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.unsubscribe-section {
  margin-top: 12px;
}

.unsubscribe-actions,
.subscribe-actions {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}

.dialog-actions {
  padding: 10px 16px !important;
  background: #fafafa;
  border-top: 1px solid #e0e0e0;
}

/* Confirmation Dialog Styles */
.confirmation-header {
  background: #fafafa;
  font-weight: 600;
  padding: 12px 16px !important;
  border-bottom: 1px solid #e0e0e0;
  color: #1a1a2e;
}

.confirmation-content {
  padding: 16px !important;
}

.confirmation-content p {
  margin-bottom: 0;
  font-size: 0.95rem;
  line-height: 1.5;
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