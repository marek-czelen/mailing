<template>
  <GeneralDialog
    :model-value="dialog"
    @update:model-value="val => dialog = val"
    :title="'Ustawienia użytkownika'"
    :max-width="'800px'"
    persistent
  >
    <template #default>
        <v-form ref="form" v-model="valid" lazy-validation>
          <!-- Podstawowe informacje -->
        <div class="section">
          <h3 class="section-title">Podstawowe informacje</h3>
              <v-text-field
                v-model="localCustomerSettings.name"
                label="Nazwa użytkownika"
                :rules="nameRules"
                required
                outlined
              />

              <v-switch
                v-model="localCustomerSettings.active"
                label="Konto aktywne"
                color="primary"
              />
        </div>
          <!-- Dane firmy -->
          <div class="section">
            <h3 class="section-title">Dane firmy</h3>
          

              <v-text-field
                v-model="localCustomerSettings.companyName"
                label="Nazwa firmy"
                :rules="companyNameRules"
                required
                outlined
              />

              <v-text-field
                v-model="localCustomerSettings.companyAddressLine1"
                label="Adres - linia 1"
                outlined
              />

              <v-text-field
                v-model="localCustomerSettings.companyAddressLine2"
                label="Adres - linia 2"
                outlined
              />

              <v-text-field
                v-model="localCustomerSettings.companyAddressCity"
                label="Miasto"
                outlined
              />

              <v-text-field
                v-model="localCustomerSettings.companyAddressPostalCode"
                label="Kod pocztowy"
                :rules="postalCodeRules"
                outlined
              />
          </div>
          <!-- Konfiguracja SMTP -->
          <div class="section">
            <h3 class="section-title">Konfiguracja SMTP</h3>
                <v-text-field
                  v-model="localCustomerSettings.smtpFrom"
                  label="Adres nadawcy (From)"
                  outlined
                />

              <v-switch
                v-model="localCustomerSettings.internalMailServer"
                label="Użyj wewnętrznego serwera poczty"
                color="primary"
              />

            <template v-if="!localCustomerSettings.internalMailServer">


                <v-text-field
                  v-model="localCustomerSettings.smtpHost"
                  label="Host SMTP"
                  :rules="smtpHostRules"
                  outlined
                />

                <v-text-field
                  v-model="localCustomerSettings.smtpPort"
                  label="Port SMTP"
                  type="number"
                  :rules="smtpPortRules"
                  outlined
                />

                <v-text-field
                  v-model="localCustomerSettings.smtpUser"
                  label="Użytkownik SMTP"
                  outlined
                />

                <v-text-field
                  v-model="localCustomerSettings.smtpPass"
                  label="Hasło SMTP"
                  type="password"
                  outlined
                />
                <v-text-field
                  v-model="localCustomerSettings.smtpFrom"
                  label="Adres nadawcy (From)"
                  :rules="emailRules"
                  outlined
                />
            </template>
            </div>
          <!-- Stopka RODO -->
          <div class="section">
            <h3 class="section-title">Stopka RODO</h3>
       

              <v-textarea
                v-model="localCustomerSettings.rodoFooter"
                label="Stopka RODO"
                rows="6"
                outlined
                :hint="rodoFooterHint"
                persistent-hint
              />
       
              <v-btn
                @click="generateDefaultRodoFooter"
                color="primary"
                variant="outlined"
                class="mr-2"
              >
                Generuj domyślną stopkę RODO
              </v-btn>
              <v-btn
                @click="showRodoPreview = !showRodoPreview"
                color="info"
                variant="outlined"
              >
                {{ showRodoPreview ? 'Ukryj' : 'Pokaż' }} podgląd
              </v-btn>
       
              <v-card class="rodo-preview">
                <v-card-title>Podgląd stopki RODO</v-card-title>
                <v-card-text>
                  <div v-html="rodoPreview" class="rodo-content"></div>
                </v-card-text>
              </v-card>
            </div>
        </v-form>
    </template>

    <template #actions>
      <v-spacer />
      <v-btn
        color="grey darken-1"
        variant="text"
        @click="closeDialog"
      >
        Anuluj
      </v-btn>
      <v-btn
        color="primary"
        variant="elevated"
        @click="saveSettings"
        :disabled="!valid || loading"
        :loading="loading"
      >
        Zapisz
      </v-btn>
    </template>
  </GeneralDialog>

  <!-- Snackbar for notifications -->
  <v-snackbar
    v-model="snackbar"
    :color="snackbarColor"
    timeout="4000"
  >
    {{ snackbarText }}
    <template v-slot:actions>
      <v-btn color="white" variant="text" @click="snackbar = false">
        Zamknij
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import GeneralDialog from './GeneralDialog.vue'
import { CustomerService } from '../services/customer'
import { Account } from '../services/account'

const props = defineProps({
  modelValue: Boolean,
  user: {
    type: Object,
    default: () => ({})
  },
  customerSettings: {
    type: Object,
    default: () => ({
      name: '',
      companyAddressLine1: '',
      companyAddressLine2: '',
      companyAddressCity: '',
      companyAddressPostalCode: '',
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPass: '',
      smtpFrom: '',
      rodoFooter: '',
      internalMailServer: false,
      active: true
      })
  }
})
const emit = defineEmits([
  'update:modelValue',
  'update:user',
  'update:customerSettings',
  'settings-saved'
])

const dialog = ref(props.modelValue)
const localUser = ref(structuredClone(props.user))
const localCustomerSettings = ref(structuredClone(props.customerSettings))


const valid = ref(false)
const loading = ref(false)
const showRodoPreview = ref(false)
const form = ref(null)

// Snackbar
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

// Validation rules
const nameRules = [
  v => !!v || 'Nazwa użytkownika jest wymagana',
  v => (v && v.length >= 2) || 'Nazwa musi mieć co najmniej 2 znaki'
]

const companyNameRules = [
  v => !!v || 'Nazwa firmy jest wymagana',
  v => (v && v.length >= 2) || 'Nazwa firmy musi mieć co najmniej 2 znaki'
]

const emailRules = [v => !v || /.+@.+\..+/.test(v) || 'Nieprawidłowy format email']

const smtpHostRules = [v => !localCustomerSettings.value.internalMailServer ? (!!v || 'Host SMTP wymagany') : true]
const smtpPortRules = [
  v => !localCustomerSettings.value.internalMailServer ? (!!v || 'Port SMTP wymagany') : true,
  v => !v || (v >= 1 && v <= 65535) || 'Port musi być między 1 a 65535'
]
const postalCodeRules = [v => !v || /^\d{2}-\d{3}$/.test(v) || 'Kod pocztowy powinien mieć format XX-XXX']

const rodoFooterHint = computed(() =>
  'Dostępne placeholdery: {{COMPANY_NAME}}, {{COMPANY_ADDRESS}}, {{UNSUBSCRIBE_LINK}}'
)

const rodoPreview = computed(() => {
  if (!localCustomerSettings.value.rodoFooter) return ''
  let preview = localCustomerSettings.value.rodoFooter
  preview = preview.replace(/{{COMPANY_NAME}}/g, localCustomerSettings.value.companyName || '[Nazwa firmy]')
  preview = preview.replace(/{{COMPANY_ADDRESS}}/g, getFullAddress() || '[Adres firmy]')
  preview = preview.replace(
    /{{UNSUBSCRIBE_LINK}}/g,
    '<a href="#" style="color: #1976d2;">Wypisz się z listy mailingowej</a>'
  )
  return preview.replace(/\n/g, '<br>')
})

watch(() => props.modelValue, val => dialog.value = val)
watch(() => props.user, val => localUser.value = { ...val })
watch(() => props.customerSettings, val => localCustomerSettings.value = { ...val })

watch(dialog, val => emit('update:modelValue', val))

function closeDialog() {
  dialog.value = false
}

async function loadUserSettings() {
  if (!localUser.value.id) return
  try {
    loading.value = true
    const settings = await Account.getCurrentCustomerId()
    Object.assign(localCustomerSettings.value, settings)
  } catch (error) {
    console.error(error)
    showSnackbar('Błąd podczas ładowania ustawień klienta', 'error')
  } finally {
    loading.value = false
  }
}


async function saveSettings() {
  try {
    loading.value = true

    if (localUser.value.customerId) {
      await CustomerService.updateCustomerSettings(localUser.value.customerId, localCustomerSettings.value)
      showSnackbar('Ustawienia zostały zaktualizowane', 'success')
    } 
    else{
        return
    }
    emit('update:user', localUser.value)
    emit('update:customer-settings', localCustomerSettings.value)
    emit('settings-saved', localCustomerSettings.value)
    closeDialog()
  } catch (error) {
    console.error(error)
    showSnackbar('Błąd podczas zapisywania ustawień: ' + (error.response?.data?.response?.message || error.message), 'error')
  } finally {
    loading.value = false
  }
}

function generateDefaultRodoFooter() {
  const defaultFooter = `Zgodnie z RODO, informujemy, że:

Administrator danych: {{COMPANY_NAME}}
Adres: {{COMPANY_ADDRESS}}

Przetwarzamy Państwa dane osobowe w celu prowadzenia działań marketingowych.

W przypadku pytań dotyczących przetwarzania danych osobowych, prosimy o kontakt.`
  localCustomerSettings.value.rodoFooter = defaultFooter
  showSnackbar('Wygenerowano domyślną stopkę RODO', 'info')
}

function getFullAddress() {
  const parts = [
    localCustomerSettings.value.companyAddressLine1,
    localCustomerSettings.value.companyAddressLine2,
    localCustomerSettings.value.companyAddressPostalCode && localCustomerSettings.value.companyAddressCity
      ? `${localCustomerSettings.value.companyAddressPostalCode} ${localCustomerSettings.value.companyAddressCity}`
      : localCustomerSettings.value.companyAddressCity || localCustomerSettings.value.companyAddressPostalCode
  ].filter(Boolean)
  return parts.join(', ')
}

function showSnackbar(text, color = 'success') {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}
</script>


