<template>
  <GeneralDialog
    :model-value="dialog"
    @update:model-value="val => dialog = val"
    :title="'Ustawienia użytkownika i klienta'"
    :max-width="'1000px'"
    persistent
  >
    <template #default>
        <v-form ref="form" v-model="valid" lazy-validation>
          <!-- Ustawienia użytkownika -->
           <div>
          <div class="bg-primary">
              Ustawienia użytkownika
          </div>
              <v-text-field
                v-model="localUser.email"
                label="Email użytkownika"
                :rules="emailRules"
                readonly
                outlined
                density="comfortable"
              />
        </div>
       
        <div>
          <div class="bg-secondary">
              Ustawienia globalne (klienta)
          </div>
          <div>
              <!-- Podstawowe informacje -->
              <div class="section">
                <h3 class="section-title">Podstawowe informacje</h3>
                <v-text-field
                  v-model="localCustomerSettings.name"
                  label="Nazwa klienta"
                  :rules="nameRules"
                  required
                  outlined
                  density="comfortable"
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
                  density="comfortable"
                />

                <v-text-field
                  v-model="localCustomerSettings.companyAddressLine1"
                  label="Adres - linia 1"
                  outlined
                  density="comfortable"
                />

                <v-text-field
                  v-model="localCustomerSettings.companyAddressLine2"
                  label="Adres - linia 2"
                  outlined
                  density="comfortable"
                />

                <v-text-field
                  v-model="localCustomerSettings.companyAddressCity"
                  label="Miasto"
                  outlined
                  density="comfortable"
                />

                <v-text-field
                  v-model="localCustomerSettings.companyAddressPostalCode"
                  label="Kod pocztowy"
                  :rules="postalCodeRules"
                  outlined
                  density="comfortable"
                />
              </div>
              <!-- Konfiguracja SMTP -->
              <div class="section">
                <h3 class="section-title">Poczta wychodząca - konfiguracja domślna</h3>
              

                <template v-if="!localCustomerSettings.internalMailServer">
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="localCustomerSettings.smtpHost"
                        label="Host SMTP"
                        :rules="smtpHostRules"
                        outlined
                        density="comfortable"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model.number="localCustomerSettings.smtpPort"
                        label="Port SMTP"
                        type="number"
                        :rules="smtpPortRules"
                        outlined
                        density="comfortable"
                      />
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="localCustomerSettings.smtpUser"
                        label="Użytkownik SMTP"
                        outlined
                        density="comfortable"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="localCustomerSettings.smtpPass"
                        label="Hasło SMTP"
                        type="password"
                        outlined
                        density="comfortable"
                      />
                    </v-col>
                  </v-row>

                  <v-text-field
                    v-model="localCustomerSettings.smtpFrom"
                    label="Adres nadawcy (From)"
                    :rules="emailRules"
                    outlined
                    density="comfortable"
                  />

                  <v-switch
                    v-model="localCustomerSettings.smtpSecure"
                    label="Użyj TLS/SSL"
                    color="primary"
                  />

                  <v-switch
                    v-model="localCustomerSettings.smtpAllowSelfSigned"
                    label="Zezwalaj na certyfikaty self-signed"
                    color="primary"
                  />

                  <v-btn
                    @click="testSmtpConnection"
                    color="success"
                    variant="outlined"
                    :loading="testingSmtp"
                    :disabled="!canTestSmtp"
                    class="mt-2"
                  >
                    <v-icon start>mdi-email-check</v-icon>
                    Testuj połączenie SMTP
                  </v-btn>
                </template>
              </div>

              <!-- Konfiguracja IMAP (sprawdzanie odpowiedzi) -->
              <div class="section">
                <h3 class="section-title">Konfiguracja IMAP (sprawdzanie odpowiedzi)</h3>
                
                <v-switch
                  v-model="localCustomerSettings.replyCheckEnabled"
                  label="Włącz sprawdzanie odpowiedzi"
                  color="primary"
                />

                <template v-if="localCustomerSettings.replyCheckEnabled">
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="localCustomerSettings.replyMailboxHost"
                        label="Host IMAP"
                        outlined
                        density="comfortable"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model.number="localCustomerSettings.replyMailboxPort"
                        label="Port IMAP"
                        type="number"
                        outlined
                        density="comfortable"
                      />
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="localCustomerSettings.replyMailboxUser"
                        label="Użytkownik IMAP"
                        outlined
                        density="comfortable"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="localCustomerSettings.replyMailboxPass"
                        label="Hasło IMAP"
                        type="password"
                        outlined
                        density="comfortable"
                      />
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col cols="12" md="6">
                      <v-select
                        v-model="localCustomerSettings.replyMailboxProtocol"
                        label="Protokół"
                        :items="['imap', 'pop3']"
                        outlined
                        density="comfortable"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="localCustomerSettings.replyMailboxFolder"
                        label="Folder"
                        placeholder="INBOX"
                        outlined
                        density="comfortable"
                      />
                    </v-col>
                  </v-row>

                  <v-switch
                    v-model="localCustomerSettings.replyMailboxTls"
                    label="Użyj TLS"
                    color="primary"
                  />

                  <v-switch
                    v-model="localCustomerSettings.replyMailboxAllowSelfSigned"
                    label="Zezwalaj na certyfikaty self-signed"
                    color="primary"
                  />

                  <v-btn
                    @click="testImapConnection"
                    color="success"
                    variant="outlined"
                    :loading="testingImap"
                    :disabled="!canTestImap"
                    class="mt-2"
                  >
                    <v-icon start>mdi-email-check</v-icon>
                    Testuj połączenie IMAP
                  </v-btn>
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
                  density="comfortable"
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
       
                <v-card v-if="showRodoPreview" class="rodo-preview mt-4" variant="outlined">
                  <v-card-title>Podgląd stopki RODO</v-card-title>
                  <v-card-text>
                    <div v-html="rodoPreview" class="rodo-content"></div>
                  </v-card-text>
                </v-card>
              </div>
          </div>
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
import { Campaigns } from '../services/campaigns'

const props = defineProps({
  modelValue: Boolean,
  user: {
    type: Object,
    default: () => ({})
  },
})
const emit = defineEmits([
  'update:modelValue',
  'settings-saved'
])

const dialog = ref(props.modelValue)
const localUser = ref({})
const localCustomerSettings = ref({})


const valid = ref(false)
const loading = ref(false)
const showRodoPreview = ref(false)
const form = ref(null)

// Testing states
const testingSmtp = ref(false)
const testingImap = ref(false)

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

const emailRules = [
  v => !!v || 'Email jest wymagany',
  v => /.+@.+\..+/.test(v) || 'Nieprawidłowy format email'
]

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

const canTestSmtp = computed(() => {
  return !!(
    localCustomerSettings.value.smtpHost &&
    localCustomerSettings.value.smtpPort &&
    localCustomerSettings.value.smtpUser &&
    localCustomerSettings.value.smtpPass
  )
})

const canTestImap = computed(() => {
  return !!(
    localCustomerSettings.value.replyCheckEnabled &&
    localCustomerSettings.value.replyMailboxHost &&
    localCustomerSettings.value.replyMailboxPort &&
    localCustomerSettings.value.replyMailboxUser &&
    localCustomerSettings.value.replyMailboxPass
  )
})

watch(() => props.modelValue, val => dialog.value = val)
watch(() => props.user, val => {
  localUser.value = { ...val }
  localCustomerSettings.value = { ...val?.Customer }
})

watch(dialog, val => emit('update:modelValue', val))

function closeDialog() {
  dialog.value = false
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

W przypadku pytań dotyczących przetwarzania danych osobowych, prosimy o kontakt.

{{UNSUBSCRIBE_LINK}}`
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

async function testSmtpConnection() {
  try {
    testingSmtp.value = true
    const config = {
      host: localCustomerSettings.value.smtpHost,
      port: localCustomerSettings.value.smtpPort,
      user: localCustomerSettings.value.smtpUser,
      pass: localCustomerSettings.value.smtpPass,
      secure: localCustomerSettings.value.smtpSecure,
      allowSelfSigned: localCustomerSettings.value.smtpAllowSelfSigned
    }
    
    const result = await Campaigns.testSmtpConnection(config)
    
    if (result.success) {
      showSnackbar('✅ Połączenie SMTP działa prawidłowo!', 'success')
    } else {
      showSnackbar(`❌ Błąd połączenia SMTP: ${result.message || 'Nieznany błąd'}`, 'error')
    }
  } catch (error) {
    console.error('SMTP test error:', error)
    showSnackbar(`❌ Błąd testowania SMTP: ${error.response?.data?.message || error.message}`, 'error')
  } finally {
    testingSmtp.value = false
  }
}

async function testImapConnection() {
  try {
    testingImap.value = true
    const config = {
      host: localCustomerSettings.value.replyMailboxHost,
      port: localCustomerSettings.value.replyMailboxPort,
      user: localCustomerSettings.value.replyMailboxUser,
      pass: localCustomerSettings.value.replyMailboxPass,
      tls: localCustomerSettings.value.replyMailboxTls,
      allowSelfSigned: localCustomerSettings.value.replyMailboxAllowSelfSigned,
      folder: localCustomerSettings.value.replyMailboxFolder || 'INBOX'
    }
    
    const result = await Campaigns.testImapConnection(config)
    
    if (result.success) {
      showSnackbar('✅ Połączenie IMAP działa prawidłowo!', 'success')
    } else {
      showSnackbar(`❌ Błąd połączenia IMAP: ${result.message || 'Nieznany błąd'}`, 'error')
    }
  } catch (error) {
    console.error('IMAP test error:', error)
    showSnackbar(`❌ Błąd testowania IMAP: ${error.response?.data?.message || error.message}`, 'error')
  } finally {
    testingImap.value = false
  }
}
</script>

<style scoped>
.section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 16px;
  color: #424242;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 8px;
}

.rodo-preview {
  margin-top: 16px;
}

.rodo-content {
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-family: 'Roboto', sans-serif;
  line-height: 1.6;
}

:deep(.v-card-title.bg-primary) {
  background-color: rgb(var(--v-theme-primary)) !important;
  color: white !important;
}

:deep(.v-card-title.bg-secondary) {
  background-color: rgb(var(--v-theme-secondary)) !important;
  color: white !important;
}
</style>


