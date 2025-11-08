<template>
  <v-dialog 
    :model-value="modelValue" 
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600px"
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
            {{ saving ? 'Zapisywanie kontaktu...' : unsubscribing ? 'Wypisywanie z listy...' : 'Zapisywanie na listę...' }}
          </h3>
          <p class="loading-subtitle">
            Proszę czekać
          </p>
        </div>
      </v-overlay>

      <v-card-title class="dialog-header">
        <h2>{{ isEditing ? 'Edytuj kontakt' : 'Nowy kontakt' }}</h2>
        <v-btn icon variant="text" @click="close" class="close-btn" :disabled="unsubscribing || resubscribing || saving">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="dialog-content">
        <v-form ref="form" v-model="valid" @submit.prevent="save">
          <!-- Basic Information -->
          <div class="section">
            <h3 class="section-title">Podstawowe informacje</h3>
            

            <v-text-field
              v-model="formData.mailAddress"
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
                v-model="formData.miasto"
                density="compact"
                label="Miasto"
                variant="outlined"
              />
              <v-text-field
                v-model="formData.rodzaj"
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
          Wypisanie z listy
        </v-card-title>
        <v-card-text class="confirmation-content">
          <p>Czy na pewno chcesz wypisać ten kontakt ze <strong>WSZYSTKICH</strong> list mailingowych tego klienta?</p>
          <v-alert type="warning" variant="tonal" class="mt-3">
            <v-icon>mdi-information</v-icon>
            Ta operacja wypisze kontakt ze wszystkich baz danych i jest nieodwracalna.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showUnsubscribeDialog = false">
            Anuluj
          </v-btn>
          <v-btn 
            color="warning" 
            :loading="unsubscribing"
            @click="confirmUnsubscribe"
          >
            Wypisz z listy
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
          Zapisanie na listę
        </v-card-title>
        <v-card-text class="confirmation-content">
          <p>Czy na pewno chcesz ponownie zapisać ten kontakt na listy mailingowe?</p>
          <v-alert type="info" variant="tonal" class="mt-3">
            <v-icon>mdi-information</v-icon>
            Kontakt będzie mógł ponownie otrzymywać wiadomości e-mail.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showResubscribeDialog = false">
            Anuluj
          </v-btn>
          <v-btn 
            color="success" 
            :loading="resubscribing"
            @click="confirmResubscribe"
          >
            Zapisz na listę
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
          Zamknij
        </v-btn>
      </template>
    </v-snackbar>
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

// Type options
const typeOptions = [
  { title: 'Szkoła Podstawowa', value: 'podstawowa' },
  { title: 'Szkoła Średnia', value: 'srednia' },
  { title: 'Szkoła Wyższa', value: 'wyzsza' },
  { title: 'Przedszkole', value: 'przedszkole' },
  { title: 'Prywatna placówka edukacyjna', value: 'prywatna' },
  { title: 'Inny', value: 'inny' },
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
  return new Date(date).toLocaleDateString('pl-PL')
}

function unsubscribeContact() {
  if (!props.contact?.id) {
    showSnackbar('Brak ID kontaktu', 'error')
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

      showSnackbar('Kontakt został pomyślnie wypisany ze wszystkich list mailingowych.', 'success')
    } else {
      throw new Error(result.message || 'Nieznany błąd')
    }
  } catch (error) {
    console.error('Błąd podczas wypisywania kontaktu:', error)
    showSnackbar('Błąd podczas wypisywania kontaktu: ' + error.message, 'error')
  } finally {
    unsubscribing.value = false
  }
}

function resubscribeContact() {
  if (!props.contact?.id) {
    showSnackbar('Brak ID kontaktu', 'error')
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
      
      showSnackbar('Kontakt został pomyślnie zapisany ponownie na listy mailingowe.', 'success')
    } else {
      throw new Error(result.message || 'Nieznany błąd')
    }
  } catch (error) {
    console.error('Błąd podczas ponownego zapisywania kontaktu:', error)
    showSnackbar('Błąd podczas ponownego zapisywania kontaktu: ' + error.message, 'error')
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
        showSnackbar('Kontakt został pomyślnie zaktualizowany', 'success')
        
        // Powiadom rodzica o zmianie - przekaż zaktualizowane dane
        emit('contact-updated', {
          ...props.contact,
          ...formData.value,
          lastActivity: new Date(),
          lastActivityType: 'Zaktualizowano'
        })
        
        // Zamknij dialog
        close()
      } else {
        throw new Error(result.message || 'Nieznany błąd')
      }
    } else {
      // Create new contact via backend
      if (!props.database?.id) {
        throw new Error('Brak ID bazy danych')
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
        showSnackbar('Kontakt został pomyślnie dodany', 'success')
        
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
          lastActivityType: 'Utworzono'
        }
        
        console.log('Emitowanie contact-updated:', newContact)
        emit('contact-updated', newContact)
        
        // Zamknij dialog
        close()
      } else {
        console.error('Błąd walidacji sukcesu:', result)
        throw new Error(result.message || 'Nieznany błąd podczas dodawania kontaktu')
      }
    }
  } catch (error) {
    console.error('Błąd podczas zapisywania:', error)
    showSnackbar('Błąd podczas zapisywania kontaktu: ' + error.message, 'error')
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
  margin: 24px 0 8px 0;
  font-weight: 600;
  font-size: 1.4rem;
}

.loading-subtitle {
  margin: 0;
  opacity: 0.9;
  font-size: 1rem;
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

/* Confirmation Dialog Styles */
.confirmation-header {
  background: #f8f9fa;
  font-weight: 600;
  padding: 20px 24px 16px 24px !important;
}

.confirmation-content {
  padding: 20px 24px !important;
}

.confirmation-content p {
  margin-bottom: 0;
  font-size: 1rem;
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