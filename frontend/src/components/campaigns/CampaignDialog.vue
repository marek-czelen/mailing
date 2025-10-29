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
        <v-stepper v-model="step" class="campaign-stepper">
          <v-stepper-header>
            <v-stepper-item
              title="Podstawy"
              value="1"
              :complete="step > 1"
            />
            <v-divider />
            <v-stepper-item
              title="Odbiorcy"
              value="2"
              :complete="step > 2"
            />
            <v-divider />
            <v-stepper-item
              title="Treść"
              value="3"
              :complete="step > 3"
            />
            <v-divider />
            <v-stepper-item
              title="Ustawienia"
              value="4"
            />
          </v-stepper-header>

          <v-stepper-window>
            <!-- Step 1: Basic Information -->
            <v-stepper-window-item value="1">
              <div class="step-content">
                <h3>Podstawowe informacje kampanii</h3>
                <p>Zdefiniuj nazwę i cel kampanii marketingowej</p>

                <v-form ref="basicForm" v-model="basicFormValid">
                  <v-text-field
                    v-model="formData.name"
                    label="Nazwa kampanii"
                    :rules="[rules.required]"
                    variant="outlined"
                    prepend-inner-icon="mdi-email-multiple"
                    required
                  />

                  <v-text-field
                    v-model="formData.subject"
                    label="Temat wiadomości"
                    :rules="[rules.required]"
                    variant="outlined"
                    prepend-inner-icon="mdi-format-title"
                    required
                    hint="To będzie widoczne w skrzynce odbiorczej"
                    persistent-hint
                  />

                  <v-textarea
                    v-model="formData.description"
                    label="Opis kampanii (opcjonalny)"
                    variant="outlined"
                    prepend-inner-icon="mdi-text"
                    rows="3"
                    counter="500"
                  />

                  <v-select
                    v-model="formData.type"
                    :items="campaignTypes"
                    label="Typ kampanii"
                    :rules="[rules.required]"
                    variant="outlined"
                    prepend-inner-icon="mdi-tag"
                    required
                  />

                  <v-select
                    v-model="formData.priority"
                    :items="priorityOptions"
                    label="Priorytet"
                    variant="outlined"
                    prepend-inner-icon="mdi-flag"
                  />
                </v-form>
              </div>
            </v-stepper-window-item>

            <!-- Step 2: Recipients -->
            <v-stepper-window-item value="2">
              <div class="step-content">
                <h3>Odbiorcy kampanii</h3>
                <p>Wybierz bazę danych i segmenty dla tej kampanii</p>

                <v-form ref="recipientsForm" v-model="recipientsFormValid">
                  <!-- Database Selection -->
                  <v-select
                    v-model="formData.database"
                    :items="availableDatabases"
                    label="Baza danych"
                    :rules="[rules.required]"
                    variant="outlined"
                    prepend-inner-icon="mdi-database"
                    @update:model-value="loadSegments"
                    required
                  >
                    <template v-slot:item="{ props, item }">
                      <v-list-item v-bind="props">
                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                        <v-list-item-subtitle>
                          {{ item.subtitle }} kontaktów
                        </v-list-item-subtitle>
                      </v-list-item>
                    </template>
                  </v-select>

                  <!-- Segments Selection -->
                  <v-select
                    v-model="formData.segments"
                    :items="availableSegments"
                    label="Segmenty (opcjonalnie)"
                    variant="outlined"
                    prepend-inner-icon="mdi-filter"
                    multiple
                    chips
                    closable-chips
                    :disabled="!formData.database"
                    hint="Zostaw puste, aby wysłać do całej bazy danych"
                    persistent-hint
                  />

                  <!-- Recipients Preview -->
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
                      <div class="stat-box">
                        <v-icon color="success">mdi-check-circle</v-icon>
                        <div class="stat-info">
                          <span class="stat-number">{{ activeRecipients }}</span>
                          <span class="stat-label">Aktywnych</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Advanced Options -->
                  <div class="advanced-options">
                    <h4>Opcje zaawansowane</h4>
                    <v-switch
                      v-model="formData.excludeUnsubscribed"
                      label="Wykluczaj wypisanych"
                      color="primary"
                      inset
                    />
                    <v-switch
                      v-model="formData.excludeBounced"
                      label="Wykluczaj adresy z odbiciami"
                      color="primary"
                      inset
                    />
                  </div>
                </v-form>
              </div>
            </v-stepper-window-item>

            <!-- Step 3: Content -->
            <v-stepper-window-item value="3">
              <div class="step-content">
                <h3>Treść kampanii</h3>
                <p>Wybierz szablon lub utwórz nową treść</p>

                <v-form ref="contentForm" v-model="contentFormValid">
                  <!-- Template Selection -->
                  <div class="template-selection">
                    <v-radio-group v-model="contentMode" inline>
                      <v-radio
                        label="Użyj istniejącego szablonu"
                        value="template"
                      />
                      <v-radio
                        label="Utwórz nową treść"
                        value="create"
                      />
                    </v-radio-group>
                  </div>

                  <!-- Template Picker -->
                  <div v-if="contentMode === 'template'" class="template-picker">
                    <v-select
                      v-model="formData.template"
                      :items="availableTemplates"
                      label="Szablon email"
                      :rules="contentMode === 'template' ? [rules.required] : []"
                      variant="outlined"
                      prepend-inner-icon="mdi-email-variant"
                    >
                      <template v-slot:item="{ props, item }">
                        <v-list-item v-bind="props">
                          <template v-slot:prepend>
                            <v-avatar size="40" rounded="sm" color="primary">
                              <v-icon>mdi-email-variant</v-icon>
                            </v-avatar>
                          </template>
                          <v-list-item-title>{{ item.title }}</v-list-item-title>
                          <v-list-item-subtitle>{{ item.subtitle }}</v-list-item-subtitle>
                        </v-list-item>
                      </template>
                    </v-select>

                    <div v-if="formData.template" class="template-preview">
                      <h5>Podgląd szablonu</h5>
                      <div class="template-preview-box">
                        <div class="template-placeholder">
                          <v-icon size="64" color="grey-lighten-2">mdi-email-outline</v-icon>
                          <p>Podgląd szablonu</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Custom Content -->
                  <div v-if="contentMode === 'create'" class="custom-content">
                    <v-btn
                      variant="outlined"
                      size="large"
                      @click="openEditor"
                      prepend-icon="mdi-pencil-plus"
                      block
                    >
                      Otwórz edytor email
                    </v-btn>
                    <p class="text-caption mt-2">
                      Zostaniesz przekierowany do edytora, gdzie stworzysz treść kampanii
                    </p>
                  </div>

                  <!-- Sender Information -->
                  <div class="sender-info">
                    <h4>Informacje o nadawcy</h4>
                    <div class="sender-fields">
                      <v-text-field
                        v-model="formData.senderName"
                        label="Nazwa nadawcy"
                        :rules="[rules.required]"
                        variant="outlined"
                        required
                      />
                      <v-text-field
                        v-model="formData.senderEmail"
                        label="Email nadawcy"
                        :rules="[rules.required, rules.email]"
                        variant="outlined"
                        required
                      />
                    </div>
                    <v-text-field
                      v-model="formData.replyTo"
                      label="Email odpowiedzi (opcjonalny)"
                      :rules="[rules.email]"
                      variant="outlined"
                    />
                  </div>
                </v-form>
              </div>
            </v-stepper-window-item>

            <!-- Step 4: Settings -->
            <v-stepper-window-item value="4">
              <div class="step-content">
                <h3>Ustawienia kampanii</h3>
                <p>Skonfiguruj dodatkowe opcje wysyłki i śledzenia</p>

                <v-form ref="settingsForm" v-model="settingsFormValid">
                  <!-- Sending Options -->
                  <div class="section">
                    <h4>Opcje wysyłki</h4>
                    
                    <v-radio-group v-model="formData.sendMode">
                      <v-radio
                        label="Wyślij natychmiast po zapisaniu"
                        value="immediate"
                      />
                      <v-radio
                        label="Zapisz jako szkic"
                        value="draft"
                      />
                      <v-radio
                        label="Zaplanuj wysyłkę"
                        value="scheduled"
                      />
                    </v-radio-group>

                    <v-text-field
                      v-if="formData.sendMode === 'scheduled'"
                      v-model="formData.scheduledAt"
                      label="Data i czas wysyłki"
                      type="datetime-local"
                      variant="outlined"
                      :rules="formData.sendMode === 'scheduled' ? [rules.required] : []"
                    />
                  </div>

                  <!-- Tracking Options -->
                  <div class="section">
                    <h4>Śledzenie i analityka</h4>
                    
                    <v-switch
                      v-model="formData.trackOpens"
                      label="Śledź otwieranie wiadomości"
                      color="primary"
                      inset
                    />
                    
                    <v-switch
                      v-model="formData.trackClicks"
                      label="Śledź kliknięcia w linki"
                      color="primary"
                      inset
                    />
                    
                    <v-switch
                      v-model="formData.trackUnsubscribes"
                      label="Śledź wypisania"
                      color="primary"
                      inset
                    />
                  </div>

                  <!-- Advanced Settings -->
                  <div class="section">
                    <h4>Ustawienia zaawansowane</h4>
                    
                    <v-text-field
                      v-model.number="formData.sendRate"
                      label="Liczba emaili na minutę"
                      type="number"
                      variant="outlined"
                      min="1"
                      max="1000"
                      hint="Kontroluje szybkość wysyłki (1-1000 emaili/min)"
                      persistent-hint
                    />
                    
                    <v-switch
                      v-model="formData.enableAB"
                      label="Test A/B (wkrótce)"
                      color="primary"
                      inset
                      disabled
                    />
                  </div>
                </v-form>
              </div>
            </v-stepper-window-item>
          </v-stepper-window>

          <v-stepper-actions
            :disabled="saving"
            @click:prev="prevStep"
            @click:next="nextStep"
          >
            <template v-slot:next>
              <v-btn
                v-if="step < 4"
                color="primary"
                :disabled="!canProceed"
                @click="nextStep"
              >
                Dalej
              </v-btn>
              <v-btn
                v-else
                color="primary"
                :loading="saving"
                @click="save"
              >
                {{ isEditing ? 'Zapisz zmiany' : 'Utwórz kampanię' }}
              </v-btn>
            </template>
          </v-stepper-actions>
        </v-stepper>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits } from 'vue'
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

// Form validation states
const basicFormValid = ref(false)
const recipientsFormValid = ref(false)
const contentFormValid = ref(false)
const settingsFormValid = ref(false)

// Form data
const formData = ref({
  name: '',
  subject: '',
  description: '',
  type: 'newsletter',
  priority: 'normal',
  database: null,
  segments: [],
  template: null,
  senderName: '',
  senderEmail: '',
  replyTo: '',
  sendMode: 'draft',
  scheduledAt: null,
  excludeUnsubscribed: true,
  excludeBounced: true,
  trackOpens: true,
  trackClicks: true,
  trackUnsubscribes: true,
  sendRate: 100,
  enableAB: false
})

// Options
const campaignTypes = [
  { title: 'Newsletter', value: 'newsletter' },
  { title: 'Promocja', value: 'promotion' },
  { title: 'Powitalny', value: 'welcome' },
  { title: 'Transakcyjny', value: 'transactional' },
  { title: 'Powiadomienie', value: 'notification' },
  { title: 'Ankieta', value: 'survey' },
  { title: 'Inne', value: 'other' }
]

const priorityOptions = [
  { title: 'Niska', value: 'low' },
  { title: 'Normalna', value: 'normal' },
  { title: 'Wysoka', value: 'high' },
  { title: 'Pilna', value: 'urgent' }
]

// Sample data
const availableDatabases = ref([
  { title: 'Klienci Premium', value: 'premium', subtitle: '1,247' },
  { title: 'Newsletter Subskrybenci', value: 'newsletter', subtitle: '8,432' },
  { title: 'Potencjalni Klienci', value: 'leads', subtitle: '3,156' }
])

const availableSegments = ref([])

const availableTemplates = ref([
  { title: 'Szablon promocyjny', value: 'promo1', subtitle: 'Nowoczesny design z CTA' },
  { title: 'Newsletter standardowy', value: 'newsletter1', subtitle: 'Klasyczny layout' },
  { title: 'Szablon powitalny', value: 'welcome1', subtitle: 'Przyjazny onboarding' },
  { title: 'Szablon transakcyjny', value: 'transactional1', subtitle: 'Minimalistyczny' }
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
      return basicFormValid.value
    case 2:
      return recipientsFormValid.value
    case 3:
      return contentFormValid.value
    case 4:
      return settingsFormValid.value
    default:
      return true
  }
})

const estimatedRecipients = computed(() => {
  if (!formData.value.database) return 0
  
  const database = availableDatabases.value.find(db => db.value === formData.value.database)
  if (!database) return 0
  
  let count = parseInt(database.subtitle.replace(',', ''))
  
  // Apply segment filtering (simplified calculation)
  if (formData.value.segments.length > 0) {
    count = Math.floor(count * 0.3) // Assume segments contain ~30% of database
  }
  
  // Apply exclusions
  if (formData.value.excludeUnsubscribed) {
    count = Math.floor(count * 0.95) // 5% unsubscribed
  }
  
  if (formData.value.excludeBounced) {
    count = Math.floor(count * 0.98) // 2% bounced
  }
  
  return count.toLocaleString('pl-PL')
})

const activeRecipients = computed(() => {
  const total = parseInt(estimatedRecipients.value.replace(',', '')) || 0
  return Math.floor(total * 0.85).toLocaleString('pl-PL') // 85% active
})

// Watch for campaign changes
watch(() => props.campaign, (newCampaign) => {
  if (newCampaign) {
    formData.value = {
      name: newCampaign.name || '',
      subject: newCampaign.subject || '',
      description: newCampaign.description || '',
      type: newCampaign.type || 'newsletter',
      priority: newCampaign.priority || 'normal',
      database: newCampaign.database || null,
      segments: newCampaign.segments || [],
      template: newCampaign.template || null,
      senderName: newCampaign.senderName || '',
      senderEmail: newCampaign.senderEmail || '',
      replyTo: newCampaign.replyTo || '',
      sendMode: newCampaign.sendMode || 'draft',
      scheduledAt: newCampaign.scheduledAt || null,
      excludeUnsubscribed: newCampaign.excludeUnsubscribed !== false,
      excludeBounced: newCampaign.excludeBounced !== false,
      trackOpens: newCampaign.trackOpens !== false,
      trackClicks: newCampaign.trackClicks !== false,
      trackUnsubscribes: newCampaign.trackUnsubscribes !== false,
      sendRate: newCampaign.sendRate || 100,
      enableAB: newCampaign.enableAB || false
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// Methods
function resetForm() {
  step.value = 1
  formData.value = {
    name: '',
    subject: '',
    description: '',
    type: 'newsletter',
    priority: 'normal',
    database: null,
    segments: [],
    template: null,
    senderName: '',
    senderEmail: '',
    replyTo: '',
    sendMode: 'draft',
    scheduledAt: null,
    excludeUnsubscribed: true,
    excludeBounced: true,
    trackOpens: true,
    trackClicks: true,
    trackUnsubscribes: true,
    sendRate: 100,
    enableAB: false
  }
}

function loadSegments() {
  // Load segments for selected database
  availableSegments.value = [
    { title: 'Bardzo aktywni', value: 'very_active' },
    { title: 'Średnio aktywni', value: 'moderate_active' },
    { title: 'Nowi klienci', value: 'new_customers' },
    { title: 'VIP', value: 'vip' }
  ]
}

function prevStep() {
  if (step.value > 1) {
    step.value--
  }
}

function nextStep() {
  if (canProceed.value && step.value < 4) {
    step.value++
  }
}

function openEditor() {
  // Save current form data to localStorage for later retrieval
  localStorage.setItem('campaignFormData', JSON.stringify(formData.value))
  
  // Close dialog and navigate to editor
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
    // Calculate estimated recipients count
    const recipientsCount = parseInt(estimatedRecipients.value.replace(',', '')) || 0
    
    const campaignData = {
      ...formData.value,
      recipientsCount,
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
</script>

<style scoped>
.campaign-dialog {
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
  padding: 0 !important;
}

.campaign-stepper {
  box-shadow: none !important;
}

.step-content {
  padding: 32px;
}

.step-content h3 {
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.step-content p {
  margin-bottom: 24px;
  color: #666;
}

.recipients-preview {
  margin: 24px 0;
  padding: 20px;
  background: #f8f9ff;
  border-radius: 12px;
  border: 1px solid #e3f2fd;
}

.recipients-preview h4 {
  margin-bottom: 16px;
  font-weight: 600;
  color: #333;
}

.preview-stats {
  display: flex;
  gap: 16px;
}

.stat-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
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

.advanced-options,
.sender-info,
.section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

.advanced-options h4,
.sender-info h4,
.section h4 {
  margin-bottom: 16px;
  font-weight: 600;
  color: #333;
}

.sender-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.template-selection {
  margin-bottom: 24px;
}

.template-preview {
  margin-top: 16px;
}

.template-preview h5 {
  margin-bottom: 8px;
  font-weight: 600;
}

.template-preview-box {
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  background: #fafafa;
}

.template-preview-box img {
  max-width: 100%;
  border-radius: 4px;
}

.template-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  background: #f8f9fa;
  border-radius: 6px;
  color: #666;
}

.custom-content {
  text-align: center;
  padding: 20px;
}

@media (max-width: 768px) {
  .step-content {
    padding: 20px;
  }
  
  .preview-stats {
    flex-direction: column;
  }
  
  .sender-fields {
    grid-template-columns: 1fr;
  }
}
</style>