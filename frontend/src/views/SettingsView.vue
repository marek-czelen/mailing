<template>
  <PageContent :title="$t('toolbar.settings')" :subtitle="'Ustawienia użytkownika i klienta'">
    <template #left-panel>
      <v-card class="settings-menu-card">
        <v-card-title class="card-header">
          <div class="header-content">
            <h3>Ustawienia</h3>
          </div>
        </v-card-title>
        <v-card-text class="pa-0">
          <v-list>
            <v-list-item :class="{ 'selected': activeSection === 'user' }" @click="activeSection = 'user'"
              prepend-icon="mdi-account">
              <v-list-item-title>Ustawienia użytkownika</v-list-item-title>
            </v-list-item>
            <v-list-item :class="{ 'selected': activeSection === 'customer' }" @click="activeSection = 'customer'"
              prepend-icon="mdi-domain">
              <v-list-item-title>Ustawienia klienta</v-list-item-title>
            </v-list-item>
            <v-list-item :class="{ 'selected': activeSection === 'smtp' }" @click="activeSection = 'smtp'"
              prepend-icon="mdi-email-send">
              <v-list-item-title>Konfiguracja SMTP</v-list-item-title>
            </v-list-item>
            <v-list-item :class="{ 'selected': activeSection === 'imap' }" @click="activeSection = 'imap'"
              prepend-icon="mdi-email-receive">
              <v-list-item-title>Konfiguracja IMAP</v-list-item-title>
            </v-list-item>
            <v-list-item :class="{ 'selected': activeSection === 'rodo' }" @click="activeSection = 'rodo'"
              prepend-icon="mdi-shield-check">
              <v-list-item-title>Stopka RODO</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </template>

    <template #right-panel>
      <v-card class="settings-content-card">
        <v-card-text>
          <v-form ref="form" v-model="valid" lazy-validation>

            <!-- Sekcja: Ustawienia użytkownika -->
            <div v-show="activeSection === 'user'" class="section">
              <h3 class="section-title">Ustawienia użytkownika</h3>
              <v-text-field v-model="localUser.email" label="Email użytkownika" :rules="emailRules" readonly
                variant="outlined" density="compact" />
            </div>

            <!-- Sekcja: Podstawowe informacje -->
            <div v-show="activeSection === 'customer'" class="section">
              <h3 class="section-title">Podstawowe informacje</h3>
              <v-text-field v-model="localCustomerSettings.name" label="Nazwa klienta" :rules="nameRules" required
                variant="outlined" density="compact" />
              <v-switch v-model="localCustomerSettings.active" label="Konto aktywne" color="primary" />

              <v-divider class="my-3" />

              <h3 class="section-title">Dane firmy</h3>
              <v-text-field v-model="localCustomerSettings.companyName" label="Nazwa firmy" :rules="companyNameRules"
                required variant="outlined" density="compact" />
              <v-text-field v-model="localCustomerSettings.companyAddressLine1" label="Adres - linia 1"
                variant="outlined" density="compact" />
              <v-text-field v-model="localCustomerSettings.companyAddressLine2" label="Adres - linia 2"
                variant="outlined" density="compact" />
              <v-text-field v-model="localCustomerSettings.companyAddressCity" label="Miasto" variant="outlined"
                density="compact" />
              <v-text-field v-model="localCustomerSettings.companyAddressPostalCode" label="Kod pocztowy"
                :rules="postalCodeRules" variant="outlined" density="compact" />
            </div>

            <!-- Sekcja: SMTP -->
            <div v-show="activeSection === 'smtp'" class="section">
              <h3 class="section-title">Poczta wychodząca - konfiguracja domyślna</h3>
              <template v-if="!localCustomerSettings.internalMailServer">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="localCustomerSettings.smtpHost" label="Host SMTP" :rules="smtpHostRules"
                      variant="outlined" density="compact" />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field v-model.number="localCustomerSettings.smtpPort" label="Port SMTP" type="number"
                      :rules="smtpPortRules" variant="outlined" density="compact" />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="localCustomerSettings.smtpUser" label="Użytkownik SMTP" variant="outlined"
                      density="compact" />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="localCustomerSettings.smtpPass" label="Hasło SMTP" type="password"
                      variant="outlined" density="compact" />
                  </v-col>
                </v-row>
                <v-text-field v-model="localCustomerSettings.smtpFrom" label="Adres nadawcy (From)" :rules="emailRules"
                  variant="outlined" density="compact" />
                <v-switch v-model="localCustomerSettings.smtpSecure" label="Użyj TLS/SSL" color="primary" />
                <v-switch v-model="localCustomerSettings.smtpAllowSelfSigned" label="Zezwalaj na certyfikaty self-signed"
                  color="primary" />
                <v-btn @click="testSmtpConnection" color="success" variant="outlined" :loading="testingSmtp"
                  :disabled="!canTestSmtp" class="mt-2">
                  <v-icon start>mdi-email-check</v-icon>
                  Testuj połączenie SMTP
                </v-btn>
              </template>
            </div>

            <!-- Sekcja: IMAP -->
            <div v-show="activeSection === 'imap'" class="section">
              <h3 class="section-title">Konfiguracja IMAP (sprawdzanie odpowiedzi)</h3>
              <v-switch v-model="localCustomerSettings.replyCheckEnabled" label="Włącz sprawdzanie odpowiedzi"
                color="primary" />
              <template v-if="localCustomerSettings.replyCheckEnabled">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="localCustomerSettings.replyMailboxHost" label="Host IMAP" variant="outlined"
                      density="compact" />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field v-model.number="localCustomerSettings.replyMailboxPort" label="Port IMAP"
                      type="number" variant="outlined" density="compact" />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="localCustomerSettings.replyMailboxUser" label="Użytkownik IMAP"
                      variant="outlined" density="compact" />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="localCustomerSettings.replyMailboxPass" label="Hasło IMAP" type="password"
                      variant="outlined" density="compact" />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-select v-model="localCustomerSettings.replyMailboxProtocol" label="Protokół"
                      :items="['imap', 'pop3']" variant="outlined" density="compact" />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="localCustomerSettings.replyMailboxFolder" label="Folder" placeholder="INBOX"
                      variant="outlined" density="compact" />
                  </v-col>
                </v-row>
                <v-switch v-model="localCustomerSettings.replyMailboxTls" label="Użyj TLS" color="primary" />
                <v-switch v-model="localCustomerSettings.replyMailboxAllowSelfSigned"
                  label="Zezwalaj na certyfikaty self-signed" color="primary" />
                <v-btn @click="testImapConnection" color="success" variant="outlined" :loading="testingImap"
                  :disabled="!canTestImap" class="mt-2">
                  <v-icon start>mdi-email-check</v-icon>
                  Testuj połączenie IMAP
                </v-btn>
              </template>
            </div>

            <!-- Sekcja: RODO -->
            <div v-show="activeSection === 'rodo'" class="section">
              <h3 class="section-title">Stopka RODO</h3>
              <v-textarea v-model="localCustomerSettings.rodoFooter" label="Stopka RODO" rows="8" variant="outlined"
                density="compact" :hint="rodoFooterHint" persistent-hint />
              <v-btn @click="generateDefaultRodoFooter" color="primary" variant="outlined" class="mr-2">
                Generuj domyślną stopkę RODO
              </v-btn>
              <v-btn @click="showRodoPreview = !showRodoPreview" color="info" variant="outlined">
                {{ showRodoPreview ? 'Ukryj' : 'Pokaż' }} podgląd
              </v-btn>
              <v-card v-if="showRodoPreview" class="rodo-preview mt-4" variant="outlined">
                <v-card-title class="text-body-2 pa-3">Podgląd stopki RODO</v-card-title>
                <v-card-text>
                  <div v-html="rodoPreview" class="rodo-content"></div>
                </v-card-text>
              </v-card>
            </div>

          </v-form>
        </v-card-text>

        <!-- Akcje -->
        <v-card-actions class="settings-actions">
          <v-spacer />
          <v-btn color="success" variant="elevated" @click="saveSettings" :disabled="!valid || loading"
            :loading="loading">
            <v-icon left>mdi-content-save</v-icon>
            Zapisz ustawienia
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </PageContent>

  <!-- Snackbar -->
  <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="4000">
    {{ snackbarText }}
    <template v-slot:actions>
      <v-btn color="white" variant="text" @click="snackbar = false">Zamknij</v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import PageContent from '../components/PageContent.vue'
import { CustomerService } from '../services/customer'
import { Account } from '../services/account'
import { Campaigns } from '../services/campaigns'

// Aktywna sekcja menu
const activeSection = ref('user')

// Formularz
const valid = ref(false)
const loading = ref(false)
const form = ref(null)
const showRodoPreview = ref(false)

// Dane
const localUser = ref({})
const localCustomerSettings = ref({})

// Testy
const testingSmtp = ref(false)
const testingImap = ref(false)

// Snackbar
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

// Reguły walidacji
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
  preview = preview.replace(/{{UNSUBSCRIBE_LINK}}/g, '<a href="#" style="color: #1976d2;">Wypisz się z listy mailingowej</a>')
  return preview.replace(/\n/g, '<br>')
})

const canTestSmtp = computed(() => {
  return !!(localCustomerSettings.value.smtpHost && localCustomerSettings.value.smtpPort &&
    localCustomerSettings.value.smtpUser && localCustomerSettings.value.smtpPass)
})

const canTestImap = computed(() => {
  return !!(localCustomerSettings.value.replyCheckEnabled && localCustomerSettings.value.replyMailboxHost &&
    localCustomerSettings.value.replyMailboxPort && localCustomerSettings.value.replyMailboxUser &&
    localCustomerSettings.value.replyMailboxPass)
})

onMounted(async () => {
  try {
    const user = await Account.getCurrentUser()
    localUser.value = { ...user }
    localCustomerSettings.value = { ...user?.Customer }
  } catch (e) {
    console.error('Failed to load user settings:', e)
  }
})

async function saveSettings() {
  try {
    loading.value = true
    if (localUser.value.customerId) {
      await CustomerService.updateCustomerSettings(localUser.value.customerId, localCustomerSettings.value)
      CustomerService.clearCustomerSettingsCache()
      CustomerService.getCurrentCustomerSettings(true)
      showSnackbar('Ustawienia zostały zaktualizowane', 'success')
    }
  } catch (error) {
    console.error(error)
    showSnackbar('Błąd: ' + (error.response?.data?.response?.message || error.message), 'error')
  } finally {
    loading.value = false
  }
}

function generateDefaultRodoFooter() {
  localCustomerSettings.value.rodoFooter = `Zgodnie z RODO, informujemy, że:\n\nAdministrator danych: {{COMPANY_NAME}}\nAdres: {{COMPANY_ADDRESS}}\n\nPrzetwarzamy Państwa dane osobowe w celu prowadzenia działań marketingowych.\n\nW przypadku pytań dotyczących przetwarzania danych osobowych, prosimy o kontakt.\n\n{{UNSUBSCRIBE_LINK}}`
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
  testingSmtp.value = true
  try {
    const config = {
      host: localCustomerSettings.value.smtpHost,
      port: localCustomerSettings.value.smtpPort,
      user: localCustomerSettings.value.smtpUser,
      pass: localCustomerSettings.value.smtpPass,
      secure: localCustomerSettings.value.smtpSecure,
      allowSelfSigned: localCustomerSettings.value.smtpAllowSelfSigned
    }
    const result = await Campaigns.testSmtpConnection(config)
    showSnackbar(result.success ? '✅ Połączenie SMTP działa prawidłowo!' : `❌ ${result.message || 'Błąd'}`, result.success ? 'success' : 'error')
  } catch (error) {
    showSnackbar(`❌ Błąd: ${error.message}`, 'error')
  } finally {
    testingSmtp.value = false
  }
}

async function testImapConnection() {
  testingImap.value = true
  try {
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
    showSnackbar(result.success ? '✅ Połączenie IMAP działa prawidłowo!' : `❌ ${result.message || 'Błąd'}`, result.success ? 'success' : 'error')
  } catch (error) {
    showSnackbar(`❌ Błąd: ${error.message}`, 'error')
  } finally {
    testingImap.value = false
  }
}
</script>

<style scoped>
.settings-menu-card {
  border-radius: 8px !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08) !important;
  border: 1px solid #e0e0e0 !important;
  background: #ffffff !important;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  background: #fafafa !important;
  color: #1a1a2e !important;
  border-bottom: 1px solid #e0e0e0 !important;
  border-radius: 8px 8px 0 0 !important;
  padding: 10px 14px !important;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-content h3 {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0;
}

.v-list-item {
  cursor: pointer;
  border-left: 3px solid transparent;
  padding: 10px 14px;
}

.v-list-item:hover {
  background-color: #e8eaf6;
}

.v-list-item.selected {
  background-color: #e8eaf6;
  border-left-color: #6366f1;
}

.settings-content-card {
  border-radius: 8px !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08) !important;
  border: 1px solid #e0e0e0 !important;
  background: #ffffff !important;
}

.settings-actions {
  background: #fafafa;
  border-top: 1px solid #e0e0e0;
  padding: 10px 16px !important;
}

.section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: #1a1a2e;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 6px;
}

.rodo-preview {
  margin-top: 12px;
}

.rodo-content {
  padding: 12px;
  background-color: #fafafa;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  line-height: 1.5;
  font-size: 0.85rem;
}
</style>
