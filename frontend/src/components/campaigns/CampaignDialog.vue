<template>


  <GeneralDialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="isEditing ? t('campaigns.editCampaign') : t('campaigns.newCampaign')"
    min-width="800px"
    persistent
  >
  <template #default>
            <!-- Step Header -->
        <div class="step-header">
          <div 
            v-for="i in 5" 
            :key="i"
            class="step-indicator"
            :class="{ 
              active: step === i, 
              completed: step > i,
              disabled: step < i 
            }"
          >
            <div class="step-circle">
              <v-icon v-if="step > i" size="16">mdi-check</v-icon>
              <span v-else>{{ i }}</span>
            </div>
            <span class="step-label">{{ getStepLabel(i) }}</span>
          </div>
        </div>

        <!-- Step Content -->
        <div class="step-content">
          <!-- Step 1: Basic Information -->
          <div v-if="step === 1">
            <h3>{{ t('campaigns.basicInfoTitle') }}</h3>
            <p>{{ t('campaigns.basicInfoDesc') }}</p>
            
            <v-text-field
              v-model="formData.name"
              :label="t('campaigns.name')"
              density="compact"
              variant="outlined"
              prepend-inner-icon="mdi-email-multiple"
              :rules="[rules.required]"
              required
            />

            <v-text-field
              v-model="formData.subject"
              :label="t('campaigns.subject')"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-format-title"
              :rules="[rules.required]"
              required
            />

            <v-textarea
              v-model="formData.description"
              :label="t('campaigns.description')"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-text"
              rows="3"
              counter="500"
            />
          </div>

          <!-- Step 2: Recipients -->
          <div v-if="step === 2">
            <h3>{{ t('campaigns.recipientsTitle') }}</h3>
            <p>{{ t('campaigns.recipientsDesc') }}</p>

            <v-select
              v-model="formData.databaseId"
              :items="availableDatabases"
              density="compact"
              :label="t('campaigns.database')"
              variant="outlined"
              prepend-inner-icon="mdi-database"
              :rules="[rules.required]"
              :loading="loadingDatabases"
              :disabled="loadingDatabases"
              :placeholder="loadingDatabases ? t('campaigns.loadingDatabases') : t('campaigns.selectDatabase')"
              required
            />

            <v-select
              v-model="formData.segments"
              :disabled="true"
              :items="['All']"
              :label="t('campaigns.segments')"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-filter"
              multiple
              chips
              closable-chips
            />

            <div v-if="availableDatabases.length === 0 && !loadingDatabases" class="no-databases-warning">
              <v-alert type="warning" variant="tonal">
                <v-icon>mdi-database-alert</v-icon>
                {{ t('campaigns.noDatabasesAvailable') }}
              </v-alert>
            </div>

            <div v-if="formData.databaseId" class="recipients-preview">
              <h4>{{ t('campaigns.estimatedRecipients') }}</h4>
              <div class="preview-stats">
                <div class="stat-box">
                  <v-icon color="primary">mdi-account-group</v-icon>
                  <div class="stat-info">
                    <span class="stat-number">{{ estimatedRecipients }}</span>
                    <span class="stat-label">{{ t('campaigns.recipients') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3: Content -->
          <div v-if="step === 3">
            <h3>{{ t('campaigns.contentTitle') }}</h3>
            <p>{{ t('campaigns.contentDesc') }}</p>

            <v-radio-group v-model="contentMode" density="compact">
              <v-radio :label="t('campaigns.useTemplate')" value="template" disabled/>
              <v-radio :label="t('campaigns.useHtml')" value="html" disabled/>
              <v-radio :label="t('campaigns.noTemplate')" value="no-template" />
            </v-radio-group>

            <!-- Template Selection -->
            <div v-if="contentMode === 'template'">
              <v-select
                v-model="formData.template"
                :items="availableTemplates"
                :loading="loadingTemplates"
                density="compact"
                :label="t('campaigns.emailTemplate')"
                variant="outlined"
                prepend-inner-icon="mdi-email-variant"
                :rules="[rules.required]"
                required
              />
            </div>

            <!-- HTML Content -->
            <div v-if="contentMode === 'html'">
              <div class="html-editor-container">
                <label class="editor-label">{{ t('campaigns.htmlContent') }}</label>
              </div>
              <div class="html-helper">
                <v-alert type="info" variant="tonal" density="compact">
                  <v-icon>mdi-information</v-icon>
                  {{ t('campaigns.htmlHint') }}
                </v-alert>
              </div>
            </div>

            <div class="sender-info">
              <h4>{{ t('campaigns.senderInfo') }}</h4>
              <v-text-field
                v-model="formData.senderName"
                density="compact"
                :label="t('campaigns.senderName')"
                variant="outlined"
                :rules="[rules.required]"
                required
              />
              <v-text-field
                v-model="formData.senderEmail"
                :label="t('campaigns.senderEmail')"
                density="compact"
                variant="outlined"
                :rules="[rules.required, rules.email]"
                required
              />
            </div>
          </div>

          <!-- Step 4: Email Accounts -->
          <div v-if="step === 4">
            <h3>{{ t('campaigns.accountsTitle') }}</h3>
        

            <!-- SMTP Configuration -->
            <div class="mail-config-section">
              <h4>
                <v-icon left color="primary">mdi-email-send</v-icon>
                {{ t('campaigns.smtpAccount') }}
              </h4>
              <v-alert type="info" variant="tonal" density="compact" class="mb-4">
                {{ t('campaigns.smtpRequired') }}
              </v-alert>

              <v-row>
                <v-col cols="12" md="8">
                  <v-text-field
                    v-model="formData.smtpHost"
                    :label="t('campaigns.smtpHost')"
                    density="compact"
                    variant="outlined"
                    placeholder="smtp.gmail.com"
                    :rules="[rules.required]"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model.number="formData.smtpPort"
                    :label="t('campaigns.port')"
                    density="compact"
                    variant="outlined"
                    type="number"
                    placeholder="587"
                    :rules="[rules.required]"
                  />
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.smtpUser"
                    :label="t('campaigns.smtpUser')"
                    density="compact"
                    variant="outlined"
                    placeholder="user@gmail.com"
                    :rules="[rules.required]"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.smtpPass"
                    :label="t('campaigns.smtpPass')"
                    density="compact"
                    variant="outlined"
                    type="password"
                    placeholder="••••••••"
                    :rules="[rules.required]"
                  />
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="formData.smtpSecure"
                    :label="t('campaigns.useTlsSsl')"
                    color="primary"
                    density="compact"
                    hide-details
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="formData.smtpAllowSelfSigned"
                    :label="t('campaigns.acceptSelfSigned')"
                    color="primary"
                    density="compact"
                    hide-details
                  />
                </v-col>
              </v-row>

              <v-btn
                color="primary"
                variant="outlined"
                class="mt-2"
                :loading="testingSmtp"
                @click="testSmtpConnection"
              >
                <v-icon left>mdi-test-tube</v-icon>
                {{ t('campaigns.testSmtp') }}
              </v-btn>
            </div>

            <v-divider class="my-6" />

            <!-- IMAP Configuration -->
            <div class="mail-config-section">
              <h4>
                <v-icon left color="primary">mdi-email-receive</v-icon>
                {{ t('campaigns.imapAccount') }}
              </h4>
              <v-alert type="info" variant="tonal" density="compact" class="mb-4">
                {{ t('campaigns.imapOptional') }}
              </v-alert>

              <v-switch
                v-model="formData.replyCheckEnabled"
                :label="t('campaigns.trackReplies')"
                color="primary"
                density="compact"
                hide-details
                class="mb-4"
              />

              <template v-if="formData.replyCheckEnabled">
                <v-row>
                  <v-col cols="12" md="8">
                    <v-text-field
                      v-model="formData.replyMailboxHost"
                      :label="t('campaigns.imapHost')"
                      density="compact"
                      variant="outlined"
                      placeholder="imap.gmail.com"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model.number="formData.replyMailboxPort"
                      :label="t('campaigns.port')"
                      density="compact"
                      variant="outlined"
                      type="number"
                      placeholder="993"
                    />
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.replyMailboxUser"
                      :label="t('campaigns.imapUser')"
                      density="compact"
                      variant="outlined"
                      placeholder="user@gmail.com"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.replyMailboxPass"
                      :label="t('campaigns.imapPass')"
                      density="compact"
                      variant="outlined"
                      type="password"
                      placeholder="••••••••"
                    />
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="formData.replyMailboxFolder"
                      :label="t('campaigns.imapFolder')"
                      density="compact"
                      variant="outlined"
                      placeholder="INBOX"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-switch
                      v-model="formData.replyMailboxTls"
                      :label="t('campaigns.useTlsSsl')"
                      color="primary"
                      density="compact"
                      hide-details
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-switch
                      v-model="formData.replyMailboxAllowSelfSigned"
                      :label="t('campaigns.acceptSelfSigned')"
                      color="primary"
                      density="compact"
                      hide-details
                    />
                  </v-col>
                </v-row>

                <v-btn
                  color="primary"
                  variant="outlined"
                  class="mt-2"
                  :loading="testingImap"
                  @click="testImapConnection"
                >
                  <v-icon left>mdi-test-tube</v-icon>
                  {{ t('campaigns.testImap') }}
                </v-btn>
              </template>
            </div>
          </div>

          <!-- Step 5: Settings -->
          <div v-if="step === 5">
            <h3>{{ t('campaigns.scheduleTitle') }}</h3>

            <v-radio-group v-model="formData.sendMode" >
              <v-radio :label="t('campaigns.sendImmediate')" value="immediate"/>
              <v-radio :label="t('campaigns.sendScheduled')" value="scheduled" />
            </v-radio-group>

            <v-text-field
              v-if="formData.sendMode === 'scheduled'"
              density="compact"
              v-model="formData.scheduledAt"
              :label="t('campaigns.sendDateTime')"
              type="datetime-local"
              variant="outlined"
            />

          </div>
        </div>



  </template>
  <template #actions>

          <v-btn
            v-if="step > 1"
            variant="outlined"
            @click="prevStep"
          >
            <v-icon left>mdi-chevron-left</v-icon>
            {{ t('campaigns.previous') }}
          </v-btn>
          
          <v-spacer />
          
          <v-btn
            v-if="step < 5"
            color="primary"
            :disabled="!canProceed"
            @click="nextStep"
          >
            {{ t('campaigns.next') }}
            <v-icon right>mdi-chevron-right</v-icon>
          </v-btn>
          <v-btn
            v-else
            color="primary"
            :loading="saving"
            @click="save"
          >
            <v-icon left>mdi-check</v-icon>
            {{ isEditing ? t('campaigns.update') : t('campaigns.create') }}
          </v-btn>
       
  </template> 

  </GeneralDialog>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Databases } from '../../services/databases.js'
import { Campaigns } from '../../services/campaigns.js'
import templatesIndex from '../../templates/index.json'
import { CustomerService } from '../../services/customer.js'
import GeneralDialog from '../GeneralDialog.vue'

const { t } = useI18n()

const props = defineProps({
  modelValue: Boolean,
  campaign: Object,
})

const emit = defineEmits(['update:modelValue', 'save', 'close'])
const router = useRouter()

// Reactive data
const step = ref(1)
const saving = ref(false)
const contentMode = ref('no-template') // 'template', 'html', 'no-template'
const customerSettings = ref({})
const testingSmtp = ref(false)
const testingImap = ref(false)

// Form data
const formData = ref({
  name: '',
  subject: '',
  description: '',
  databaseId: null,
  segments: [],
  template: null,
  htmlContent: '',
  senderName: customerSettings.value.smtpUser || '',
  senderEmail: customerSettings.value.smtpFrom || '',
  // SMTP Configuration
  smtpHost: customerSettings.value.smtpHost || '',
  smtpPort: customerSettings.value.smtpPort || 587,
  smtpUser: customerSettings.value.smtpUser || '',
  smtpPass: customerSettings.value.smtpPass || '',
  smtpSecure: customerSettings.value.smtpSecure !== undefined ? customerSettings.value.smtpSecure : false,
  smtpAllowSelfSigned: customerSettings.value.smtpAllowSelfSigned !== undefined ? customerSettings.value.smtpAllowSelfSigned : false,
  // IMAP Configuration  
  replyCheckEnabled: false,
  replyMailboxHost: customerSettings.value.replyMailboxHost || '',
  replyMailboxPort: customerSettings.value.replyMailboxPort || 993,
  replyMailboxUser: customerSettings.value.replyMailboxUser || '',
  replyMailboxPass: customerSettings.value.replyMailboxPass || '',
  replyMailboxProtocol: customerSettings.value.replyMailboxProtocol || 'IMAP',
  replyMailboxFolder: customerSettings.value.replyMailboxFolder || 'INBOX',
  replyMailboxTls: customerSettings.value.replyMailboxTls !== undefined ? customerSettings.value.replyMailboxTls : true,
  replyMailboxAllowSelfSigned: customerSettings.value.replyMailboxAllowSelfSigned !== undefined ? customerSettings.value.replyMailboxAllowSelfSigned : false,
  sendMode: 'scheduled', // 'immediate', 'scheduled', 'draft'
  scheduledAt: null,
  trackOpens: true,
  trackClicks: true
})


// Database data from API
const availableDatabases = ref([])
const loadingDatabases = ref(false)

// Template data
const availableTemplates = ref([])
const loadingTemplates = ref(false)

const availableSegments = ref([
  { title: 'Bardzo aktywni', value: 'very_active' },
  { title: 'Nowi klienci', value: 'new_customers' },
  { title: 'VIP', value: 'vip' }
])


// Validation rules
const rules = {
  required: value => !!value || 'To pole jest wymagane',
  email: value => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return !value || pattern.test(value) || 'Nieprawidłowy adres email'
  }
}

// Computed
const isEditing = computed(() => !!props.campaign)

const canProceed = computed(() => {
  switch (step.value) {
    case 1:
      return formData.value.name && formData.value.subject
    case 2:
      return formData.value.databaseId && availableDatabases.value.length > 0
    case 3:
      const hasValidContent = (
        (contentMode.value === 'template' && formData.value.template) ||
        (contentMode.value === 'html' && formData.value.htmlContent) ||
        (contentMode.value === 'no-template')
      )
      const hasValidSender = formData.value.senderName && formData.value.senderEmail
      return hasValidContent && hasValidSender
    case 4:
      // SMTP is required
      const hasSmtp = formData.value.smtpHost && 
                      formData.value.smtpPort && 
                      formData.value.smtpUser && 
                      formData.value.smtpPass
      // IMAP is optional, but if enabled must be valid
      const imapValid = !formData.value.replyCheckEnabled || (
        formData.value.replyMailboxHost &&
        formData.value.replyMailboxPort &&
        formData.value.replyMailboxUser &&
        formData.value.replyMailboxPass
      )
      return hasSmtp && imapValid
    case 5:
      return true
    default:
      return true
  }
})

const estimatedRecipients = computed(() => {
  if (!formData.value.databaseId) return '0'
  
  // Find selected database
  const selectedDb = availableDatabases.value.find(db => db.value === formData.value.databaseId)
  if (selectedDb) {
    return selectedDb.contactsCount.toLocaleString('pl-PL')
  }
  
  return '0'
})

// Methods
function getStepLabel(stepNumber) {
  const labels = {
    1: t('campaigns.basicInfoTitle'),
    2: t('campaigns.recipientsTitle'), 
    3: t('campaigns.contentTitle'),
    4: t('campaigns.accountsTitle'),
    5: t('campaigns.scheduleTitle')
  }
  return labels[stepNumber] || ''
}

function nextStep() {
  console.log('NextStep clicked:', {
    currentStep: step.value,
    canProceed: canProceed.value,
    formData: formData.value
  })
  
  if (canProceed.value && step.value < 5) {
    step.value++
    console.log('Step changed to:', step.value)
  }
}

function prevStep() {
  if (step.value > 1) {
    step.value--
  }
}

async function testSmtpConnection() {
  testingSmtp.value = true
  try {
    const config = {
      host: formData.value.smtpHost,
      port: formData.value.smtpPort,
      user: formData.value.smtpUser,
      pass: formData.value.smtpPass,
      secure: formData.value.smtpSecure,
      allowSelfSigned: formData.value.smtpAllowSelfSigned
    }
    
    const result = await Campaigns.testSmtpConnection(config)
    
    if (result.success) {
      alert('✅ Połączenie SMTP działa poprawnie!')
    } else {
      alert('❌ Test połączenia SMTP nie powiódł się: ' + (result.message || 'Nieznany błąd'))
    }
  } catch (error) {
    console.error('Błąd testowania SMTP:', error)
    alert('❌ Błąd testowania połączenia SMTP: ' + (error.response?.data?.message || error.message))
  } finally {
    testingSmtp.value = false
  }
}

async function testImapConnection() {
  testingImap.value = true
  try {
    const config = {
      host: formData.value.replyMailboxHost,
      port: formData.value.replyMailboxPort,
      user: formData.value.replyMailboxUser,
      pass: formData.value.replyMailboxPass,
      tls: formData.value.replyMailboxTls,
      allowSelfSigned: formData.value.replyMailboxAllowSelfSigned,
      folder: formData.value.replyMailboxFolder
    }
    
    const result = await Campaigns.testImapConnection(config)
    
    if (result.success) {
      alert('✅ Połączenie IMAP działa poprawnie!')
    } else {
      alert('❌ Test połączenia IMAP nie powiódł się: ' + (result.message || 'Nieznany błąd'))
    }
  } catch (error) {
    console.error('Błąd testowania IMAP:', error)
    alert('❌ Błąd testowania połączenia IMAP: ' + (error.response?.data?.message || error.message))
  } finally {
    testingImap.value = false
  }
}

function openEditor() {
  close()
  router.push({ 
    name: 'BlockEmailEditor', 
    query: { 
      mode: 'campaign',
      returnTo: 'campaigns'
    }
  })
}

async function save() {
  saving.value = true

  
  try {
    const campaignData = {
      ...formData.value,
      contentType: contentMode.value,
      recipientsCount: parseInt(estimatedRecipients.value.replace(',', '')) || 0,
      createdAt: props.campaign?.createdAt || new Date(),
      updatedAt: new Date()
    }
    if (formData.value.sendMode === 'immediate') {
      campaignData.scheduledAt = new Date().toISOString()
      campaignData.sendMode = 'scheduled'
    }
    
    // Process content (generate HTML from template + add GDPR footer)
    console.log('Przetwarzanie treści kampanii przed zapisem...', campaignData)
    const processedCampaignData = await processCampaignContent(campaignData)
    
    let result=null
    if (props.campaign?.id) {
      // Update existing campaign
      result = await Campaigns.update(props.campaign.id, processedCampaignData)
    } else {
      // Create new campaign
      result = await Campaigns.create(processedCampaignData)
    }
    
    // Emit success event with result from API
    emit('save', result || campaignData)
    
    // Close dialog on success
    close()
    
  } catch (error) {
    console.error('Błąd podczas zapisywania kampanii:', error)
    
    // Format error message for user
    let errorMessage = 'Wystąpił błąd podczas zapisywania kampanii.'
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    
    alert(errorMessage)
  } finally {
    saving.value = false
  }
}

function close() {
  emit('close')
  emit('update:modelValue', false)
  // Reset form state
  step.value = 1
  contentMode.value = 'no-template'
  saving.value = false
}

// Generate HTML from template blocks
function generateHtmlFromTemplate(template) {
  if (!template || !template.blocks) {
    return ''
  }

  let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${formData.value.subject || 'Email Campaign'}</title>
    <style>
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f4f4f4; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="email-container">`

  template.blocks.forEach(block => {
    switch (block.type) {
      case 'text':
        html += `
        <div style="
          margin-top: ${block.style.marginTop || 0}px;
          margin-bottom: ${block.style.marginBottom || 0}px;
          text-align: ${block.style.textAlign || 'left'};
          font-size: ${block.content.fontSize || 16}px;
          color: ${block.content.color || '#333333'};
          font-weight: ${block.content.fontWeight || 'normal'};
          font-style: ${block.content.fontStyle || 'normal'};
          line-height: 1.5;
        ">${block.content.text.replace(/\n/g, '<br>')}</div>`
        break

      case 'image':
        html += `
        <div style="
          margin-top: ${block.style.marginTop || 0}px;
          margin-bottom: ${block.style.marginBottom || 0}px;
          text-align: ${block.style.textAlign || 'center'};
        ">
          <img src="${block.content.src}" 
               alt="${block.content.alt || ''}"
               style="
                 width: ${block.content.width || 'auto'}px;
                 height: ${block.content.height || 'auto'}px;
                 border-radius: ${block.content.borderRadius || 0}px;
                 max-width: 100%;
               "
               ${block.content.url ? `onclick="window.open('${block.content.url}')"` : ''}>
        </div>`
        break

      case 'button':
        html += `
        <div style="
          margin-top: ${block.style.marginTop || 0}px;
          margin-bottom: ${block.style.marginBottom || 0}px;
          text-align: ${block.style.textAlign || 'center'};
        ">
          <a href="${block.content.url || '#'}" 
             style="
               display: inline-block;
               background-color: ${block.content.backgroundColor || '#007bff'};
               color: ${block.content.textColor || '#ffffff'};
               text-decoration: none;
               padding: ${block.content.padding || '12px 24px'};
               border-radius: ${block.content.borderRadius || 4}px;
               font-weight: bold;
             ">${block.content.text}</a>
        </div>`
        break

      case 'spacer':
        html += `
        <div style="
          height: ${block.content.height || 20}px;
          margin-top: ${block.style.marginTop || 0}px;
          margin-bottom: ${block.style.marginBottom || 0}px;
          background-color: ${block.content.backgroundColor || 'transparent'};
        "></div>`
        break
    }
  })

  html += `
    </div>
</body>
</html>`

  return html
}

// Generate GDPR-compliant footer
function generateGdprFooter() {
  return `
<div style="
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
  font-size: 12px;
  color: #666666;
  text-align: center;
  line-height: 1.4;
">
  <p>Ta wiadomość została wysłana do Ciebie, ponieważ wyraziłeś zgodę na otrzymywanie informacji marketingowych.</p>
  
  <p>Zgodnie z RODO, informujemy że:</p>
  <ul style="text-align: left; display: inline-block; margin: 10px 0;">
    <li>Administratorem Twoich danych osobowych jest ${formData.value.senderName || '[Nazwa firmy]'}</li>
    <li>Twoje dane są przetwarzane w celu prowadzenia marketingu bezpośredniego</li>
    <li>Masz prawo do wycofania zgody w dowolnym momencie</li>
    <li>Masz prawo dostępu, sprostowania, usunięcia lub ograniczenia przetwarzania swoich danych</li>
  </ul>
  
  <p>
    <a href="{{UNSUBSCRIBE_URL}}" 
       style="color: #007bff; text-decoration: underline;">
      Wypisz się z listy mailingowej
    </a>
  </p>
  
  <p style="margin-top: 15px; font-size: 11px; color: #999999;">
    ${formData.value.senderName || '[Nazwa firmy]'} | ${formData.value.senderEmail || '[email]'}
  </p>
</div>`
}

// Process campaign data before sending to API
async function processCampaignContent(campaignData) {
  let finalHtmlContent = campaignData.htmlContent || ''

  // If template is selected, generate HTML from template
  if (campaignData.contentType === 'template' && campaignData.template) {
    try {
      // Load template file via fetch
      const templateResponse = await fetch(`/src/templates/${campaignData.template}`)
      const templateData = await templateResponse.json()
      finalHtmlContent = generateHtmlFromTemplate(templateData)
    } catch (error) {
      console.error('Błąd ładowania szablonu:', error)
      // Fallback to empty content if template fails
      finalHtmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${campaignData.subject || 'Email Campaign'}</title>
</head>
<body>
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1>Treść kampanii</h1>
        <p>Szablon nie mógł zostać załadowany.</p>
    </div>
</body>
</html>`
    }
  }

  // Add GDPR footer to all content
//  const gdprFooter = generateGdprFooter()
  const gdprFooter = ""
  
  // Insert footer before closing body tag or append if no body tag
  if (finalHtmlContent.includes('</body>')) {
    finalHtmlContent = finalHtmlContent.replace('</body>', gdprFooter + '</body>')
  } else {
    finalHtmlContent += gdprFooter
  }

  return {
    ...campaignData,
    htmlContent: finalHtmlContent
  }
}

// Load databases from API
async function loadDatabases() {
  loadingDatabases.value = true
  try {
    console.log('Ładowanie ustawień klienta...')
    customerSettings.value = await  CustomerService.getCurrentCustomerSettings();   
    console.log('Ładowanie baz danych...')
    const databases = await Databases.getList()
    console.log('Pobrane bazy danych:', databases)
    
    // Transform to select format
    availableDatabases.value = databases.map(db => ({
      title: `${db.name} (${db.contactsCount || 0} kontaktów)`,
      value: db.id,
      contactsCount: db.contactsCount || 0,
      name: db.name
    }))
    
    console.log('Dostępne bazy danych:', availableDatabases.value)
  } catch (error) {
    console.error('Błąd podczas ładowania baz danych:', error)
    // Fallback to empty array
    availableDatabases.value = []
  } finally {
    loadingDatabases.value = false
  }
}

// Load templates from local file
function loadTemplates() {
  loadingTemplates.value = true
  try {
    console.log('Ładowanie szablonów...')
    
    // Transform templates to select format
    availableTemplates.value = templatesIndex.map(template => ({
      title: template.name,
      value: template.id,
      description: template.description,
      category: template.category,
      file: template.file,
      tags: template.tags
    }))
    
    console.log('Dostępne szablony:', availableTemplates.value)
  } catch (error) {
    console.error('Błąd podczas ładowania szablonów:', error)
    // Fallback to empty array
    availableTemplates.value = []
  } finally {
    loadingTemplates.value = false
  }
}


// Watch for campaign changes
watch(() => props.campaign, (newCampaign) => {
  if (newCampaign) {
    step.value = 1
    formData.value = {
      name: newCampaign.name || '',
      subject: newCampaign.subject || '',
      description: newCampaign.description || '',
      databaseId: newCampaign.databaseId || null,
      segments: newCampaign.segments || [],
      template: newCampaign.template || null,
      contentType: newCampaign.contentType || 'no-template',
      htmlContent: newCampaign.htmlContent || '',
      senderName: newCampaign.senderName || '',
      senderEmail: newCampaign.senderEmail ||  '',
      smtpHost: newCampaign.smtpHost || '',
      smtpPort: newCampaign.smtpPort || 587,
      smtpUser: newCampaign.smtpUser || '',
      smtpPass: newCampaign.smtpPass || '',
      smtpSecure: newCampaign.smtpSecure || false,
      smtpAllowSelfSigned: newCampaign.smtpAllowSelfSigned || false,
      replyCheckEnabled: newCampaign.replyCheckEnabled || false,
      replyMailboxHost: newCampaign.replyMailboxHost || '',
      replyMailboxPort: newCampaign.replyMailboxPort || 993,
      replyMailboxUser: newCampaign.replyMailboxUser || '',
      replyMailboxPass: newCampaign.replyMailboxPass || '',
      replyMailboxProtocol: newCampaign.replyMailboxProtocol || 'IMAP',
      replyMailboxFolder: newCampaign.replyMailboxFolder || 'INBOX',
      replyMailboxTls: newCampaign.replyMailboxTls || false,
      replyMailboxAllowSelfSigned: newCampaign.replyMailboxAllowSelfSigned || false,
      sendMode: newCampaign.sendMode || 'scheduled',
      scheduledAt: newCampaign.dateStart
          ? (() => {
              const d = new Date(newCampaign.dateStart)
              const pad = n => n.toString().padStart(2, '0')
              return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
            })()
          : null,
      trackOpens: newCampaign.trackOpens !== false,
      trackClicks: newCampaign.trackClicks !== false
    }
    contentMode.value = newCampaign.contentType || 'no-template'
  } else {
    // Reset form
    step.value = 1
    contentMode.value = 'no-template'
    formData.value = {
      name: '',
      subject: '',
      description: '',
      databaseId: null,
      segments: [],
      template: null,
      contentType: 'no-template',
      htmlContent: '',
      senderName:  customerSettings.value.smtpUser || '',
      senderEmail:  customerSettings.value.smtpFrom || '',
      sendMode: 'scheduled',
      scheduledAt: null,
      trackOpens: true,
      trackClicks: true,
      // SMTP Configuration
      smtpHost: customerSettings.value.smtpHost || '',
      smtpPort: customerSettings.value.smtpPort || 587,
      smtpUser: customerSettings.value.smtpUser || '',
      smtpPass: customerSettings.value.smtpPass || '',
      smtpSecure: customerSettings.value.smtpSecure || false,
      smtpAllowSelfSigned: customerSettings.value.smtpAllowSelfSigned || false,
      // IMAP Configuration
      replyCheckEnabled: false,
      replyMailboxHost: customerSettings.value.replyMailboxHost || '',
      replyMailboxPort: customerSettings.value.replyMailboxPort || 993,
      replyMailboxUser: customerSettings.value.replyMailboxUser || '',
      replyMailboxPass: customerSettings.value.replyMailboxPass || '',
      replyMailboxProtocol: 'IMAP',
      replyMailboxFolder: customerSettings.value.replyMailboxFolder || 'INBOX',
      replyMailboxTls: customerSettings.value.replyMailboxTls !== undefined ? customerSettings.value.replyMailboxTls : false,
      replyMailboxAllowSelfSigned: customerSettings.value.replyMailboxAllowSelfSigned || false
    }
  }
}, { immediate: true })

// Load customer settings
async function loadCustomerSettings() {
  try {
    const settings = await CustomerService.getCurrentCustomerSettings()
    customerSettings.value = settings
    
    // Initialize SMTP/IMAP defaults from customer settings
    if (!props.campaign) {
      formData.value.senderName = settings.smtpUser || ''
      formData.value.senderEmail = settings.smtpFrom || ''
      formData.value.smtpHost = settings.smtpHost || ''
      formData.value.smtpPort = settings.smtpPort || 587
      formData.value.smtpUser = settings.smtpUser || ''
      formData.value.smtpPass = settings.smtpPass || ''
      formData.value.smtpSecure = settings.smtpSecure !== undefined ? settings.smtpSecure : false
      formData.value.smtpAllowSelfSigned = settings.smtpAllowSelfSigned !== undefined ? settings.smtpAllowSelfSigned : false
      formData.value.replyMailboxHost = settings.replyMailboxHost || ''
      formData.value.replyMailboxPort = settings.replyMailboxPort || 993
      formData.value.replyMailboxUser = settings.replyMailboxUser || ''
      formData.value.replyMailboxPass = settings.replyMailboxPass || ''
      formData.value.replyMailboxProtocol = settings.replyMailboxProtocol || 'IMAP'
      formData.value.replyMailboxFolder = settings.replyMailboxFolder || 'INBOX'
      formData.value.replyMailboxTls = settings.replyMailboxTls !== undefined ? settings.replyMailboxTls : false
      formData.value.replyMailboxAllowSelfSigned = settings.replyMailboxAllowSelfSigned !== undefined ? settings.replyMailboxAllowSelfSigned : false
    }
  } catch (error) {
    console.error('Nie udało się załadować ustawień klienta:', error)
  }
}

// Load data on component mount
onMounted(() => {
  loadDatabases()
  loadTemplates()
  loadCustomerSettings()
})
</script>

<style scoped>
.campaign-dialog {
  border-radius: 16px !important;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15) !important;
}

.dialog-header {
  background: linear-gradient(135deg, #202950 0%, #515bad 100%) !important;
  color: #eadcf6 !important;
  padding: 10px 24px 10px 24px !important;
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
  padding: 0 !important;
}

/* Step Header */
.step-header {
  display: flex;
  justify-content: space-between;
  padding: 10px 24px 10px 24px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
  position: relative;
}

.step-indicator:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 16px;
  right: -50%;
  width: 100%;
  height: 2px;
  background: #e0e0e0;
  z-index: 0;
}

.step-indicator.completed:not(:last-child)::after {
  background: #4CAF50;
}

.step-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  color: #666;
  z-index: 1;
  position: relative;
}

.step-indicator.active .step-circle {
  background: #515bad;
  color: white;
}

.step-indicator.completed .step-circle {
  background: #4CAF50;
  color: white;
}

.step-label {
  font-size: 12px;
  color: #666;
  text-align: center;
  font-weight: 500;
}

.step-indicator.active .step-label {
  color: #515bad;
  font-weight: 600;
}

.step-indicator.completed .step-label {
  color: #4CAF50;
}

/* Step Content */
.step-content {
  padding: 10px 32px 10px 32px;
  min-height: 400px;
}

.step-content h3 {
  margin: 0 0 8px 0;
  font-weight: 600;
  color: #333;
}

.step-content p {
  margin: 0 0 24px 0;
  color: #666;
}

/* No databases warning */
.no-databases-warning {
  margin: 24px 0;
}

/* Recipients Preview */
.recipients-preview {
  margin: 10px 0 10px 0;
  padding: 10px;
  background: #f8f9ff;
  border-radius: 12px;
  border: 1px solid #e3f2fd;
}

.recipients-preview h4 {
  margin: 0 0 16px 0;
  font-weight: 600;
  color: #333;
}

.preview-stats {
  display: flex;
  gap: 5px;
}

.stat-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0px;
  background: white;
  border-radius: 8px;
  flex: 1;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

/* Sender Info */
.sender-info h4 {
  margin: 24px 0 16px 0;
  font-weight: 600;
  color: #333;
}

/* Tracking Options */
.tracking-options h4 {
  margin: 0;
  font-weight: 600;
  color: #333;
}

/* Navigation */
.step-navigation {
  display: flex;
  align-items: center;
  padding: 24px 32px;
  border-top: 1px solid #e0e0e0;
  background: #fafafa;
}

/* HTML Editor Styles */
.html-editor-container {
  margin-bottom: 16px;
}

.editor-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 8px;
  display: block;
}

.html-editor-container :deep(.ql-toolbar) {
  border: 1px solid rgba(0, 0, 0, 0.23);
  border-bottom: none;
  border-radius: 4px 4px 0 0;
  background: #fafafa;
}

.html-editor-container :deep(.ql-container) {
  border: 1px solid rgba(0, 0, 0, 0.23);
  border-top: none;
  border-radius: 0 0 4px 4px;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
}

.html-editor-container :deep(.ql-editor) {
  min-height: 250px;
  padding: 16px;
}

.html-editor-container :deep(.ql-editor.ql-blank::before) {
  font-style: normal;
  color: rgba(0, 0, 0, 0.6);
}

.html-helper {
  margin-top: 8px;
}

/* Mail Configuration Section */
.mail-config-section {
  margin-bottom: 24px;
}

.mail-config-section h4 {
  margin: 0 0 16px 0;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Responsive */
@media (max-width: 768px) {
  .step-header {
    padding: 16px;
  }
  
  .step-content {
    padding: 24px 16px;
  }
  
  .step-navigation {
    padding: 16px;
  }
  
  .step-label {
    font-size: 10px;
  }
  
  .step-circle {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
}
</style>