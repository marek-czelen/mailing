<template>
  <div class="campaign-content">
    <div class="content-header">
      <div class="header-info">
        <h3>Treść kampanii</h3>
        <p>Podgląd i edycja zawartości email</p>
      </div>
      <div class="header-buttons">
        <v-btn 
          disabled
          color="primary" 
          variant="outlined"
          :disabled="sendingInProgress || campaignIsSent"
          @click="emit('edit-template')"
        >
          <v-icon left>mdi-pencil</v-icon>
          Zmień szablon
        </v-btn>
        <v-btn 
          color="secondary" 
          variant="outlined"
          :disabled="sendingInProgress || campaignIsSent"
          @click="emit('edit-content')"
        >
          <v-icon left>mdi-code-tags</v-icon>
          Edytuj treść
        </v-btn>
      </div>
    </div>

    <div class="content-grid">
      <!-- Email Preview Card -->
      <v-card class="preview-card">
        <v-card-title class="card-title">
          <v-icon color="primary">mdi-email-variant</v-icon>
          Podgląd email
        </v-card-title>
        <v-card-text>
          <!-- Email Header -->
          <div class="email-header">
            <div class="email-from">
              <strong>Od:</strong> {{ campaign.senderName || 'Nazwa nadawcy' }} 
              &lt;{{ campaign.senderEmail || 'email@example.com' }}&gt;
            </div>
            <div class="email-subject">
              <strong>Temat:</strong> {{ campaign.subject || 'Brak tematu' }}
            </div>
            <div class="email-date">
              <strong>Data:</strong> {{ formatDate(new Date()) }}
            </div>
          </div>

          <!-- Email Content Preview -->
          <div class="email-preview">
            <div class="preview-frame">
              <div v-if="campaign.htmlContent" class="template-preview">
                <!-- Template Preview -->
                <div class="template-content">
                  <iframe
                    :srcdoc="campaign.htmlContent"
                    frameborder="0"
                    style="width: 100%; height: 600px; border: none;"
                  ></iframe>
               </div>
              </div>

              <div v-else class="no-template">
                <v-icon size="64" color="grey-lighten-2">mdi-email-outline</v-icon>
                <h3>Brak treści</h3>
                <p>Wybierz szablon lub utwórz niestandardową treść</p>
                <v-btn color="primary" @click="emit('edit-content')">
                  <v-icon left>mdi-plus</v-icon>
                  Dodaj treść
                </v-btn>
              </div>
            </div>
          </div>


        </v-card-text>
      </v-card>

      <!-- Content Details Card -->
      <v-card class="details-card">
        <v-card-title class="card-title">
          <v-icon color="info">mdi-information</v-icon>
          Szczegóły treści
        </v-card-title>
        <v-card-text>
          <div class="detail-section">
            <h4>Ogólne</h4>
            <div class="sending-info">
              <div class="info-row">
                <span class="info-label">Status kampanii:</span>
                <span class="info-label">
                 {{ campaignIsSent ? 'Wysłano' : sendingInProgress ? 'Wysyłanie' : 'Szkic' }} 
                </span>
              </div>
              <div class="info-row" v-if="sendingInProgress && !campaignIsSent">
                <v-progress-linear 
                  :model-value="sendingProgress" 
                  height="10" 
                  color="primary" 
                  rounded
                  style="flex: 1; margin-left: 16px;"
                ></v-progress-linear>
              </div>
              <div class="info-row">
                <span class="info-label">
                  <v-switch
                    density="compact"
                    hide-details
                    :disabled="sendingInProgress || campaignIsSent"
                    v-model="campaign.active"
                    label="Kampania gotowa do wysyłki"
                    color="primary"
                    @click="activateCampaign"
                  ></v-switch>
                </span>
              </div>
               <div class="info-row">
                 <span class="info-label">
                   <v-btn 
                     variant="outlined" 
                     :disabled="sendingInProgress || campaignIsSent"
                     color="primary"
                     size="small"
                     @click="onRodoSwitchChange()"
                   >
                     Dodaj stopkę RODO
                   </v-btn>
                 </span>
               </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>SPAM rating <v-divider/><div :style="`color: ${spamInfo.color};`">{{ spamInfo.text }} </div></h4>
            <div class="sending-info">
              <div class="info-row">
                <span class="info-label">Spam rating:</span>
                <span class="info-label">{{ campaign.scoring || 0 }}/100</span>
              </div>

              <div v-for="(value, index) in (typeof campaign.suggestions === 'string' ? JSON.parse(campaign.suggestions) : campaign.suggestions)" :key="index"
                class="info-row">
                <span :style="`color: ${value.scoreValue <= 0 ? '#4caf50' : '#f44336'};`" class= "info-label">{{ value.problem }}</span>
                <v-icon :style="`color: ${value.scoreValue <= 0 ? '#4caf50' : '#f44336'};`" class="info-label">{{ value.scoreValue > 0 ? 'mdi-alert-circle' : 'mdi-check-circle' }}</v-icon>
              </div>
            </div>
          </div>


          <!-- Content Actions -->
          <div class="content-actions">
            <v-btn 
              variant="outlined" 
              color="primary"
              size="small"
              @click="testSend"
              :disabled="!isTestEmailValid || testEmailSending"
            >
              <v-icon left v-if="!testEmailSending">mdi-email-send-outline</v-icon>
              <v-progress-circular
                v-else
                indeterminate
                size="16"
                width="2"
                color="primary"
                class="mr-2"
              ></v-progress-circular>
              Test email
            </v-btn>
          </div>
          <div class="content-actions">
            <v-text-field 
              label="Email testowy"
              v-model="testEmail"
              type="email"
              variant="outlined"
              density="compact"
              :color="testEmailFieldColor"
              :append-inner-icon="testEmailAppendIcon"
              :rules="emailRules"
              hide-details="auto"
              clearable
            ></v-text-field>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
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
import { ref, computed, onMounted, defineProps, defineEmits } from 'vue'
import MailingService from '../../services/mailing.js'
import { CustomerService } from '../../services/customer.js'
import { ca } from 'vuetify/locale'

const props = defineProps({
  campaign: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit-template', 'edit-content', 'update:campaign'])

// Snackbar
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')
const testEmail = ref('')
const customerConfig = ref({})
// Reactive data
const previewDevice = ref('desktop')
const testEmailSending = ref(false)
const sendingProgress = ref(0)

const campaignIsSent = computed(() => {
  return props.campaign.sent || false
})

const sendingInProgress = computed(() => {
  return props.campaign.sendingInProgress || false
})

const spamInfo = computed(() => {
  if (props.campaign.scoring > 70) {
    return { color: 'red', text: 'SPAM' }
  } else if (props.campaign.scoring > 30) {
    return { color: 'orange', text: 'PODEJRZENIE SPAMU' }
  } else {
    return { color: 'green', text: 'OK' }
  }
})  
// Email validation
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const isTestEmailValid = computed(() => emailPattern.test(String(testEmail.value || '').trim()))
const emailRules = [
  v => !!String(v || '').trim() || 'Wpisz adres e-mail',
  v => emailPattern.test(String(v || '').trim()) || 'Nieprawidłowy adres e-mail'
]
const testEmailFieldColor = computed(() => {
  if (!testEmail.value) return undefined
  return isTestEmailValid.value ? 'success' : 'error'
})
const testEmailAppendIcon = computed(() => {
  if (!testEmail.value) return undefined
  return isTestEmailValid.value ? 'mdi-check-circle-outline' : 'mdi-alert-circle-outline'
})

// Methods
function showSnackbar(text, color = 'success') {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pl-PL')
}

function activateCampaign() {
  MailingService.updateCampaign(props.campaign.id, { active: !props.campaign.active ? 1 : 0 })
    .then(response => {
      console.log('Kampania zaktualizowana pomyślnie:', response)
      showSnackbar( `Kampania ${props.campaign.active ? 'aktywowana' : 'dezaktywowana'}`, 'success')
    })
    .catch(error => {
      console.error('Błąd podczas aktualizacji kampanii:', error)
      showSnackbar('Błąd podczas aktualizacji kampanii', 'error')
    })
  // Implement campaign activation logic
}

function formatDateTime(date) {
  if (!date) return '-'
  return new Date(date).toLocaleString('pl-PL')
}

function getTemplateName(template) {
  const names = {
    'promo1': 'Szablon promocyjny',
    'newsletter1': 'Newsletter standardowy',
    'welcome1': 'Szablon powitalny',
    'transactional1': 'Szablon transakcyjny'
  }
  return names[template] || template
}

function getTemplateDescription(template) {
  const descriptions = {
    'promo1': 'Nowoczesny design z wyróżnionymi CTA',
    'newsletter1': 'Klasyczny layout dla newsletterów',
    'welcome1': 'Przyjazny szablon onboardingowy',
    'transactional1': 'Minimalistyczny szablon transakcyjny'
  }
  return descriptions[template] || 'Niestandardowy szablon'
}

function getSendModeColor(sendMode) {
  const colors = {
    immediate: 'success',
    draft: 'grey',
    scheduled: 'warning'
  }
  return colors[sendMode] || 'grey'
}

function getSendModeLabel(sendMode) {
  const labels = {
    immediate: 'Natychmiast',
    draft: 'Szkic',
    scheduled: 'Zaplanowane'
  }
  return labels[sendMode] || sendMode
}

function testSend() {
  if (!isTestEmailValid.value) {
    showSnackbar('Podaj prawidłowy adres e-mail', 'error')
    return
  }

  console.log('Wysyłanie test email dla kampanii:', props.campaign)
  testEmailSending.value = true
  MailingService.sendTestEmail(
    testEmail.value,
    props.campaign.subject || 'Testowy email',
    props.campaign.htmlContent || '<p>Brak treści do wysłania</p>',
    {
      host: customerConfig.value.smtpHost,
      port: customerConfig.value.smtpPort,
      secure: true,
      ignoreTLS:  true,
      user: customerConfig.value.smtpUser,
      pass: customerConfig.value.smtpPass,
      from: `${props.campaign.senderName || props.campaign.senderEmail} <${props.campaign.senderEmail}>`,
    }
  )
    .then(response => {
      console.log('Test email wysłany pomyślnie:', response)
      testEmailSending.value = false
      showSnackbar('Testowy email został wysłany', 'success')
    })
    .catch(error => {
      console.error('Błąd podczas wysyłania testowego e-maila:', error)
      testEmailSending.value = false
      showSnackbar('Nie udało się wysłać testowego e-maila', 'error')
    })
}

function previewInBrowser() {
  console.log('Otwieranie podglądu w przeglądarce')
  // Implement browser preview functionality
}

// --------------------
// Stopka RODO handling
// --------------------
const rodoEnabled = ref(false)
const RODO_START = '<!-- RODO_FOOTER_START -->'
const RODO_END = '<!-- RODO_FOOTER_END -->'
const COMPANY_NAME = computed(() => customerConfig.value.companyName )
const COMPANY_ADDRESS = computed(() => `${customerConfig.value.companyAddressLine1} ${customerConfig.value.companyAddressLine2} ${customerConfig.value.companyAddressPostalCode} ${customerConfig.value.companyAddressCity}`.trim())

onMounted(() => {
  const html = String(props.campaign?.htmlContent || '')
  MailingService.getSendingProgress(props.campaign.id).then(data => {
    sendingProgress.value = data.progress || 0
  })

  rodoEnabled.value = hasRodoFooter(html)
  CustomerService.getCurrentCustomerSettings().then(config => {
    customerConfig.value = config
  })
})

function hasRodoFooter(html) {
  if (!html) return false
  return html.includes(RODO_START) && html.includes(RODO_END)
}

function buildDefaultRodoFooter() {
  // Domyślna stopka z placeholderami – backend podczas wysyłki powinien je podmienić
  // Zawijamy w znaczniki, aby móc ją łatwo usunąć
  return `\n${RODO_START}
  <div class="rodo-footer" style="font-size:12px;color:#666;margin-top:24px;border-top:1px solid #eee;padding-top:12px;text-align:center;line-height:1.4;">
    Otrzymałeś(-aś) tę wiadomość, ponieważ adres e-mail znajduje się w naszej bazie.\n
    Administratorem danych jest ${COMPANY_NAME.value} (${COMPANY_ADDRESS.value}).\n
    Jeśli nie chcesz otrzymywać od nas wiadomości, możesz się wypisać klikając\n
    <a href="{{UNSUBSCRIBE_URL}}" style="color:#666;">tutaj</a>.
  </div>
${RODO_END}\n`
}

function insertBeforeBodyEnd(html, block) {
  if (!html) return block
  const idx = html.toLowerCase().lastIndexOf('</body>')
  if (idx !== -1) {
    return html.slice(0, idx) + block + html.slice(idx)
  }
  return html + block
}

function addRodoFooterToContent() {
  const current = String(props.campaign?.htmlContent || '')
  const footer = buildDefaultRodoFooter()
  const updated = insertBeforeBodyEnd(current, footer)
  props.campaign.htmlContent = updated
}


function onRodoSwitchChange() {
  try {
  addRodoFooterToContent()
  showSnackbar('Dodano stopkę RODO do treści', 'success')

  emit('update:campaign', props.campaign)
  } catch (e) {
    console.error('Błąd podczas aktualizacji stopki RODO:', e)
    showSnackbar('Błąd podczas aktualizacji stopki RODO', 'error')
    // Przy błędzie przywróć poprzednią wartość przełącznika
    rodoEnabled.value = hasRodoFooter(String(props.campaign?.htmlContent || ''))
  }
}

</script>

<style scoped>
.campaign-content {
  width: 100%;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-info h3 {
  margin: 0 0 8px 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.header-info p {
  margin: 0;
  color: #666;
}

.header-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.preview-card,
.details-card {
  border-radius: 12px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px) !important;
}

.card-title {
  background: linear-gradient(135deg, rgba(32, 41, 80, 0.05) 0%, rgba(81, 91, 173, 0.05) 100%);
  font-weight: 600 !important;
  font-size: 1rem !important;
  padding: 16px 20px !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}

/* Email Preview */
.email-header {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 0.9rem;
}

.email-header > div {
  margin-bottom: 4px;
}

.email-header > div:last-child {
  margin-bottom: 0;
}

.email-preview {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

.preview-frame {
  background: white;
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.template-preview {
  padding: 24px;
  flex: 1;
}

.template-header h2 {
  margin: 0 0 16px 0;
  color: #333;
  text-align: center;
}

.template-content {
  margin-bottom: 24px;
}

/* Template-specific styles */
.promo-content .hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 32px;
  text-align: center;
  border-radius: 8px;
  margin-bottom: 24px;
}

.promo-content .cta-button {
  background: #ff6b6b;
  color: white;
  padding: 12px 24px;
  border-radius: 6px;
  display: inline-block;
  margin-top: 16px;
  font-weight: 600;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 12px;
}

.product-item {
  background: #f8f9fa;
  padding: 16px;
  text-align: center;
  border-radius: 6px;
}

.newsletter-content .news-item {
  padding: 16px 0;
  border-bottom: 1px solid #eee;
}

.newsletter-content .news-item:last-child {
  border-bottom: none;
}

.newsletter-content .news-item h4 {
  margin: 0 0 8px 0;
  color: #333;
}

.welcome-content .welcome-steps {
  margin-top: 16px;
}

.welcome-content .step {
  background: #e8f5e8;
  padding: 12px 16px;
  margin-bottom: 8px;
  border-radius: 6px;
  border-left: 4px solid #4caf50;
}

.template-footer {
  border-top: 1px solid #eee;
  padding-top: 16px;
  text-align: center;
  font-size: 0.8rem;
  color: #666;
}

.unsubscribe-link {
  margin-top: 8px;
}

.unsubscribe-link a {
  color: #666;
  text-decoration: none;
}

.no-template {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #666;
}

.no-template h3 {
  margin: 16px 0 8px 0;
}

.no-template p {
  margin-bottom: 24px;
}

.device-toggle {
  display: flex;
  justify-content: center;
}

/* Details Card */
.detail-section {
  margin-top: 16px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.detail-section h4 {
  margin: 0 0 12px 0;
  font-weight: 600;
  color: #333;
}

.template-info,
.no-template-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.template-name,
.no-template-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.template-description {
  color: #666;
  font-size: 0.9rem;
}

.tracking-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tracking-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sending-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label-positive{
  color: #4caf50;
}

.info-label-negative{
  color: #f44336;
}

.info-label {
  font-weight: 500;
  color: #666;
}

.content-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
}

@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .content-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .product-grid {
    grid-template-columns: 1fr;
  }
  
  .content-actions {
    justify-content: center;
  }
}
</style>