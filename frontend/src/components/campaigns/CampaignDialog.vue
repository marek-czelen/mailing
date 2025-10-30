<template>
  <v-dialog 
    :model-value="modelValue" 
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="800px"
    persistent
  >
    <v-card class="campaign-dialog">
      <v-card-title class="dialog-header">
        <h2>{{ isEditing ? 'Edytuj kampanię' : 'Nowa kampania marketingowa' }}</h2>
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
        <!-- Step Header -->
        <div class="step-header">
          <div 
            v-for="i in 4" 
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
            <h3>Dane podstawowe kampanii</h3>
            <p>Zdefiniuj podstawowe informacje o kampanii</p>
            
            <v-text-field
              v-model="formData.name"
              label="Nazwa kampanii"
              density="compact"
              variant="outlined"
              prepend-inner-icon="mdi-email-multiple"
              :rules="[rules.required]"
              required
            />

            <v-text-field
              v-model="formData.subject"
              label="Temat wiadomości"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-format-title"
              :rules="[rules.required]"
              required
              hint="To będzie widoczne w skrzynce odbiorczej"
              persistent-hint
            />

            <v-textarea
              v-model="formData.description"
              label="Opis kampanii (opcjonalny)"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-text"
              rows="3"
              counter="500"
            />
          </div>

          <!-- Step 2: Recipients -->
          <div v-if="step === 2">
            <h3>Odbiorcy kampanii</h3>
            <p>Wybierz bazę danych i segmenty</p>

            <v-select
              v-model="formData.database"
              :items="availableDatabases"
              density="compact"
              label="Baza danych"
              variant="outlined"
              prepend-inner-icon="mdi-database"
              :rules="[rules.required]"
              required
            />

            <v-select
              v-model="formData.segments"
              :items="['All']"
              label="Segmenty (opcjonalnie)"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-filter"
              multiple
              chips
              closable-chips
              :disabled="!formData.database"
            />

            <div v-if="formData.database" class="recipients-preview">
              <h4>Szacowana liczba odbiorców</h4>
              <div class="preview-stats">
                <div class="stat-box">
                  <v-icon color="primary">mdi-account-group</v-icon>
                  <div class="stat-info">
                    <span class="stat-number">{{ estimatedRecipients }}</span>
                    <span class="stat-label">Odbiorców</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3: Content -->
          <div v-if="step === 3">
            <h3>Treść kampanii</h3>
            <p>Wybierz szablon lub utwórz treść</p>

            <v-radio-group v-model="contentMode" density="compact">
              <v-radio label="Użyj szablonu" value="template" />
              <v-radio label="Bez szablonu" value="no-template" />
            </v-radio-group>

            <v-select
              v-if="contentMode === 'template'"
              v-model="formData.template"
              :items="availableTemplates"
              density="compact"
              label="Szablon email"
              variant="outlined"
              prepend-inner-icon="mdi-email-variant"
              :rules="contentMode === 'template' ? [rules.required] : []"
            />

            <div class="sender-info">
              <h4>Informacje o nadawcy</h4>
              <v-text-field
                v-model="formData.senderName"
                density="compact"
                label="Nazwa nadawcy"
                variant="outlined"
                :rules="[rules.required]"
                required
              />
              <v-text-field
                v-model="formData.senderEmail"
                label="Email nadawcy"
                density="compact"
                variant="outlined"
                :rules="[rules.required, rules.email]"
                required
              />
            </div>
          </div>

          <!-- Step 4: Settings -->
          <div v-if="step === 4">
            <h3>Ustawienia kampanii</h3>
            <p>Skonfiguruj opcje wysyłki</p>

            <v-radio-group v-model="formData.sendMode" density="compact">
              <v-radio label="Wyślij natychmiast" value="immediate" />
              <v-radio label="Zaplanuj wysyłkę" value="scheduled" />
            </v-radio-group>

            <v-text-field
              v-if="formData.sendMode === 'scheduled'"
              density="compact"
              v-model="formData.scheduledAt"
              label="Data i czas wysyłki"
              type="datetime-local"
              variant="outlined"
            />

            <div class="tracking-options">
              <h4>Śledzenie</h4>
              <v-switch
                density="compact"
                v-model="formData.trackOpens"
                label="Śledź otwieranie"
                color="primary"
              />
              <v-switch
                density="compact"
                v-model="formData.trackClicks"
                label="Śledź kliknięcia"
                color="primary"
              />
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <div class="step-navigation">
          <v-btn
            v-if="step > 1"
            variant="outlined"
            @click="prevStep"
          >
            <v-icon left>mdi-chevron-left</v-icon>
            Wstecz
          </v-btn>
          
          <v-spacer />
          
          <v-btn
            v-if="step < 4"
            color="primary"
            :disabled="!canProceed"
            @click="nextStep"
          >
            Dalej
            <v-icon right>mdi-chevron-right</v-icon>
          </v-btn>
          <v-btn
            v-else
            color="primary"
            :loading="saving"
            @click="save"
          >
            <v-icon left>mdi-check</v-icon>
            {{ isEditing ? 'Zapisz zmiany' : 'Utwórz kampanię' }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  modelValue: Boolean,
  campaign: Object
})

const emit = defineEmits(['update:modelValue', 'save', 'close'])
const router = useRouter()

// Reactive data
const step = ref(1)
const saving = ref(false)
const contentMode = ref('template')

// Form data
const formData = ref({
  name: '',
  subject: '',
  description: '',
  database: null,
  segments: [],
  template: null,
  senderName: '',
  senderEmail: '',
  sendMode: 'draft',
  scheduledAt: null,
  trackOpens: true,
  trackClicks: true
})

// Sample data
const availableDatabases = ref([
  { title: 'Klienci Premium', value: 'premium' },
  { title: 'Newsletter Subskrybenci', value: 'newsletter' },
  { title: 'Potencjalni Klienci', value: 'leads' }
])

const availableSegments = ref([
  { title: 'Bardzo aktywni', value: 'very_active' },
  { title: 'Nowi klienci', value: 'new_customers' },
  { title: 'VIP', value: 'vip' }
])

const availableTemplates = ref([
  { title: 'Szablon promocyjny', value: 'promo1' },
  { title: 'Newsletter standardowy', value: 'newsletter1' },
  { title: 'Szablon powitalny', value: 'welcome1' }
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
      return formData.value.database
    case 3:
      return (contentMode.value === 'template' && formData.value.template) ||
             (contentMode.value === 'create') ||
             (formData.value.senderName && formData.value.senderEmail)
    case 4:
      return true
    default:
      return true
  }
})

const estimatedRecipients = computed(() => {
  if (!formData.value.database) return '0'
  return '1,247' // Sample data
})

// Methods
function getStepLabel(stepNumber) {
  const labels = {
    1: 'Podstawy',
    2: 'Odbiorcy', 
    3: 'Treść',
    4: 'Ustawienia'
  }
  return labels[stepNumber] || ''
}

function nextStep() {
  console.log('NextStep clicked:', {
    currentStep: step.value,
    canProceed: canProceed.value,
    formData: formData.value
  })
  
  if (canProceed.value && step.value < 4) {
    step.value++
    console.log('Step changed to:', step.value)
  }
}

function prevStep() {
  if (step.value > 1) {
    step.value--
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
      recipientsCount: parseInt(estimatedRecipients.value.replace(',', '')) || 0,
      createdAt: props.campaign?.createdAt || new Date(),
      updatedAt: new Date()
    }
    
    emit('save', campaignData)
  } catch (error) {
    console.error('Błąd podczas zapisywania kampanii:', error)
  } finally {
    saving.value = false
  }
}

function close() {
  emit('close')
  emit('update:modelValue', false)
  step.value = 1
}

// Watch for campaign changes
watch(() => props.campaign, (newCampaign) => {
  if (newCampaign) {
    formData.value = {
      name: newCampaign.name || '',
      subject: newCampaign.subject || '',
      description: newCampaign.description || '',
      database: newCampaign.database || null,
      segments: newCampaign.segments || [],
      template: newCampaign.template || null,
      senderName: newCampaign.senderName || '',
      senderEmail: newCampaign.senderEmail || '',
      sendMode: newCampaign.sendMode || 'draft',
      scheduledAt: newCampaign.scheduledAt || null,
      trackOpens: newCampaign.trackOpens !== false,
      trackClicks: newCampaign.trackClicks !== false
    }
  } else {
    // Reset form
    step.value = 1
    formData.value = {
      name: '',
      subject: '',
      description: '',
      database: null,
      segments: [],
      template: null,
      senderName: '',
      senderEmail: '',
      sendMode: 'draft',
      scheduledAt: null,
      trackOpens: true,
      trackClicks: true
    }
  }
}, { immediate: true })
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
.sender-info {
}

.sender-info h4 {
  margin: 0 0 16px 0;
  font-weight: 600;
  color: #333;
}

/* Tracking Options */
.tracking-options {

}

.tracking-options h4 {
  margin: 0 0 16px 0;
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