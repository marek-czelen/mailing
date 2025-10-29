<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="600px" persistent>
    <v-card class="schedule-dialog">
      <v-card-title class="card-title">
        <v-icon color="primary">mdi-calendar-clock</v-icon>
        Zaplanuj kampanię
      </v-card-title>
      
      <v-card-text>
        <div class="schedule-content">
          <!-- Send Mode Selection -->
          <div class="mode-selection">
            <h4>Tryb wysyłki</h4>
            <v-radio-group v-model="scheduleData.sendMode" mandatory>
              <v-radio 
                label="Wyślij natychmiast" 
                value="immediate"
                color="success"
              >
                <template v-slot:label>
                  <div class="radio-label">
                    <v-icon color="success">mdi-send</v-icon>
                    <div>
                      <div class="label-title">Wyślij natychmiast</div>
                      <div class="label-subtitle">Kampania zostanie wysłana od razu</div>
                    </div>
                  </div>
                </template>
              </v-radio>
              
              <v-radio 
                label="Zaplanuj na później" 
                value="scheduled"
                color="warning"
              >
                <template v-slot:label>
                  <div class="radio-label">
                    <v-icon color="warning">mdi-calendar-clock</v-icon>
                    <div>
                      <div class="label-title">Zaplanuj na później</div>
                      <div class="label-subtitle">Wybierz datę i godzinę wysyłki</div>
                    </div>
                  </div>
                </template>
              </v-radio>
              
              <v-radio 
                label="Zapisz jako szkic" 
                value="draft"
                color="grey"
              >
                <template v-slot:label>
                  <div class="radio-label">
                    <v-icon color="grey">mdi-content-save-outline</v-icon>
                    <div>
                      <div class="label-title">Zapisz jako szkic</div>
                      <div class="label-subtitle">Zapisz bez wysyłania</div>
                    </div>
                  </div>
                </template>
              </v-radio>
            </v-radio-group>
          </div>

          <!-- Schedule Settings -->
          <div v-if="scheduleData.sendMode === 'scheduled'" class="schedule-settings">
            <v-divider class="my-6"></v-divider>
            
            <h4>Ustawienia harmonogramu</h4>
            
            <!-- Date and Time -->
            <div class="datetime-section">
              <div class="date-time-grid">
                <v-text-field
                  v-model="scheduleData.date"
                  label="Data wysyłki"
                  type="date"
                  variant="outlined"
                  density="comfortable"
                  :min="minDate"
                  :rules="dateRules"
                ></v-text-field>
                
                <v-text-field
                  v-model="scheduleData.time"
                  label="Godzina"
                  type="time"
                  variant="outlined"
                  density="comfortable"
                  :rules="timeRules"
                ></v-text-field>
              </div>
              
              <!-- Timezone -->
              <v-select
                v-model="scheduleData.timezone"
                :items="timezones"
                label="Strefa czasowa"
                variant="outlined"
                density="comfortable"
              ></v-select>
              
              <!-- Scheduled DateTime Preview -->
              <div v-if="scheduledDateTime" class="scheduled-preview">
                <v-icon color="info">mdi-information</v-icon>
                <span>
                  Kampania zostanie wysłana: 
                  <strong>{{ formatScheduledDateTime }}</strong>
                </span>
              </div>
            </div>
          </div>

          <!-- Send Rate Settings -->
          <div v-if="scheduleData.sendMode !== 'draft'" class="send-rate-section">
            <v-divider class="my-6"></v-divider>
            
            <h4>Szybkość wysyłki</h4>
            <p class="section-description">
              Kontroluj tempo wysyłania emaili aby uniknąć problemów z dostarczalnością
            </p>
            
            <div class="rate-selection">
              <v-radio-group v-model="scheduleData.sendRate" mandatory>
                <v-radio value="slow" color="success">
                  <template v-slot:label>
                    <div class="rate-option">
                      <div class="rate-info">
                        <div class="rate-name">Powoli</div>
                        <div class="rate-details">50 emaili/min • Najlepsza dostarczalność</div>
                      </div>
                      <div class="rate-time">~{{ calculateSendTime(50) }}</div>
                    </div>
                  </template>
                </v-radio>
                
                <v-radio value="normal" color="info">
                  <template v-slot:label>
                    <div class="rate-option">
                      <div class="rate-info">
                        <div class="rate-name">Normalnie</div>
                        <div class="rate-details">100 emaili/min • Zbalansowane</div>
                      </div>
                      <div class="rate-time">~{{ calculateSendTime(100) }}</div>
                    </div>
                  </template>
                </v-radio>
                
                <v-radio value="fast" color="warning">
                  <template v-slot:label>
                    <div class="rate-option">
                      <div class="rate-info">
                        <div class="rate-name">Szybko</div>
                        <div class="rate-details">200 emaili/min • Może wpływać na dostarczalność</div>
                      </div>
                      <div class="rate-time">~{{ calculateSendTime(200) }}</div>
                    </div>
                  </template>
                </v-radio>
              </v-radio-group>
            </div>
          </div>

          <!-- Advanced Options -->
          <div v-if="scheduleData.sendMode !== 'draft'" class="advanced-options">
            <v-divider class="my-6"></v-divider>
            
            <v-expansion-panels variant="accordion">
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <v-icon>mdi-cog</v-icon>
                  Opcje zaawansowane
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <div class="advanced-content">
                    <!-- Auto-pause conditions -->
                    <div class="option-group">
                      <h5>Automatyczne wstrzymanie</h5>
                      <v-checkbox
                        v-model="scheduleData.autoPause.highBounceRate"
                        label="Wstrzymaj przy wysokim współczynniku odrzuceń (>5%)"
                        color="primary"
                      ></v-checkbox>
                      
                      <v-checkbox
                        v-model="scheduleData.autoPause.highUnsubscribeRate"
                        label="Wstrzymaj przy wysokim współczynniku wypisań (>2%)"
                        color="primary"
                      ></v-checkbox>
                    </div>
                    
                    <!-- Batch sending -->
                    <div class="option-group">
                      <h5>Wysyłka wsadowa</h5>
                      <v-checkbox
                        v-model="scheduleData.batchSending.enabled"
                        label="Podziel na małe grupy"
                        color="primary"
                      ></v-checkbox>
                      
                      <div v-if="scheduleData.batchSending.enabled" class="batch-settings">
                        <v-text-field
                          v-model="scheduleData.batchSending.size"
                          label="Rozmiar grupy"
                          type="number"
                          variant="outlined"
                          density="compact"
                          min="100"
                          max="5000"
                        ></v-text-field>
                        
                        <v-text-field
                          v-model="scheduleData.batchSending.delay"
                          label="Opóźnienie między grupami (minuty)"
                          type="number"
                          variant="outlined"
                          density="compact"
                          min="1"
                          max="60"
                        ></v-text-field>
                      </div>
                    </div>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>

          <!-- Summary -->
          <div class="schedule-summary">
            <v-divider class="my-6"></v-divider>
            
            <div class="summary-card">
              <h4>Podsumowanie</h4>
              <div class="summary-items">
                <div class="summary-item">
                  <span class="summary-label">Tryb:</span>
                  <v-chip 
                    size="small" 
                    :color="getSendModeColor(scheduleData.sendMode)"
                    variant="elevated"
                  >
                    {{ getSendModeLabel(scheduleData.sendMode) }}
                  </v-chip>
                </div>
                
                <div v-if="scheduleData.sendMode === 'scheduled'" class="summary-item">
                  <span class="summary-label">Zaplanowane na:</span>
                  <span class="summary-value">{{ formatScheduledDateTime }}</span>
                </div>
                
                <div v-if="scheduleData.sendMode !== 'draft'" class="summary-item">
                  <span class="summary-label">Szybkość:</span>
                  <span class="summary-value">{{ getSendRateLabel(scheduleData.sendRate) }}</span>
                </div>
                
                <div class="summary-item">
                  <span class="summary-label">Odbiorców:</span>
                  <span class="summary-value">{{ campaign.recipientCount || 0 }}</span>
                </div>
                
                <div v-if="scheduleData.sendMode !== 'draft'" class="summary-item">
                  <span class="summary-label">Szacowany czas:</span>
                  <span class="summary-value">{{ estimatedSendTime }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>
      
      <v-card-actions class="card-actions">
        <v-btn variant="text" @click="closeDialog">
          Anuluj
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn 
          :color="getActionButtonColor()"
          :disabled="!isValidSchedule"
          @click="confirmSchedule"
        >
          <v-icon left>{{ getActionButtonIcon() }}</v-icon>
          {{ getActionButtonText() }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  campaign: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'schedule'])

// Reactive data
const scheduleData = ref({
  sendMode: 'immediate',
  date: '',
  time: '',
  timezone: 'Europe/Warsaw',
  sendRate: 'normal',
  autoPause: {
    highBounceRate: true,
    highUnsubscribeRate: true
  },
  batchSending: {
    enabled: false,
    size: 1000,
    delay: 5
  }
})

// Available timezones
const timezones = [
  { title: 'Europa/Warszawa (CET)', value: 'Europe/Warsaw' },
  { title: 'Europa/Londyn (GMT)', value: 'Europe/London' },
  { title: 'Europa/Berlin (CET)', value: 'Europe/Berlin' },
  { title: 'Ameryka/Nowy_Jork (EST)', value: 'America/New_York' },
  { title: 'UTC', value: 'UTC' }
]

// Validation rules
const dateRules = [
  v => !!v || 'Data jest wymagana',
  v => new Date(v) >= new Date().setHours(0,0,0,0) || 'Data nie może być w przeszłości'
]

const timeRules = [
  v => !!v || 'Godzina jest wymagana'
]

// Computed properties
const minDate = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const scheduledDateTime = computed(() => {
  if (!scheduleData.value.date || !scheduleData.value.time) return null
  return new Date(`${scheduleData.value.date}T${scheduleData.value.time}`)
})

const formatScheduledDateTime = computed(() => {
  if (!scheduledDateTime.value) return ''
  return scheduledDateTime.value.toLocaleString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  })
})

const isValidSchedule = computed(() => {
  if (scheduleData.value.sendMode === 'draft') return true
  if (scheduleData.value.sendMode === 'immediate') return true
  if (scheduleData.value.sendMode === 'scheduled') {
    return scheduleData.value.date && scheduleData.value.time && 
           scheduledDateTime.value > new Date()
  }
  return false
})

const estimatedSendTime = computed(() => {
  if (scheduleData.value.sendMode === 'draft') return 'Nie dotyczy'
  
  const recipientCount = props.campaign.recipientCount || 0
  const rates = { slow: 50, normal: 100, fast: 200 }
  const emailsPerMinute = rates[scheduleData.value.sendRate]
  
  return calculateSendTime(emailsPerMinute)
})

// Methods
function calculateSendTime(emailsPerMinute) {
  const recipientCount = props.campaign.recipientCount || 0
  const minutes = Math.ceil(recipientCount / emailsPerMinute)
  
  if (minutes < 60) {
    return `${minutes} min`
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`
  } else {
    const days = Math.floor(minutes / 1440)
    const remainingHours = Math.floor((minutes % 1440) / 60)
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`
  }
}

function getSendModeColor(mode) {
  const colors = {
    immediate: 'success',
    scheduled: 'warning',
    draft: 'grey'
  }
  return colors[mode] || 'grey'
}

function getSendModeLabel(mode) {
  const labels = {
    immediate: 'Natychmiast',
    scheduled: 'Zaplanowane',
    draft: 'Szkic'
  }
  return labels[mode] || mode
}

function getSendRateLabel(rate) {
  const labels = {
    slow: '50 emaili/min',
    normal: '100 emaili/min',
    fast: '200 emaili/min'
  }
  return labels[rate] || rate
}

function getActionButtonColor() {
  return getSendModeColor(scheduleData.value.sendMode)
}

function getActionButtonIcon() {
  const icons = {
    immediate: 'mdi-send',
    scheduled: 'mdi-calendar-check',
    draft: 'mdi-content-save'
  }
  return icons[scheduleData.value.sendMode] || 'mdi-check'
}

function getActionButtonText() {
  const texts = {
    immediate: 'Wyślij teraz',
    scheduled: 'Zaplanuj wysyłkę',
    draft: 'Zapisz szkic'
  }
  return texts[scheduleData.value.sendMode] || 'Potwierdź'
}

function closeDialog() {
  emit('update:modelValue', false)
}

function confirmSchedule() {
  const schedulePayload = {
    ...scheduleData.value,
    scheduledAt: scheduledDateTime.value
  }
  
  emit('schedule', schedulePayload)
  closeDialog()
}

// Initialize with current date/time if scheduled mode
watch(() => scheduleData.value.sendMode, (newMode) => {
  if (newMode === 'scheduled' && !scheduleData.value.date) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0)
    
    scheduleData.value.date = tomorrow.toISOString().split('T')[0]
    scheduleData.value.time = '09:00'
  }
})
</script>

<style scoped>
.schedule-dialog {
  border-radius: 12px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
}

.card-title {
  background: linear-gradient(135deg, rgba(32, 41, 80, 0.05) 0%, rgba(81, 91, 173, 0.05) 100%);
  font-weight: 600 !important;
  font-size: 1.1rem !important;
  padding: 20px 24px !important;
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.schedule-content {
  padding: 8px 0;
}

.mode-selection h4,
.schedule-settings h4,
.send-rate-section h4 {
  margin: 0 0 16px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.radio-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
}

.label-title {
  font-weight: 500;
  margin-bottom: 2px;
}

.label-subtitle {
  font-size: 0.85rem;
  color: #666;
}

.section-description {
  margin: 0 0 20px 0;
  color: #666;
  font-size: 0.9rem;
}

.date-time-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.scheduled-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(33, 150, 243, 0.1);
  border-radius: 8px;
  margin-top: 16px;
  font-size: 0.9rem;
}

.rate-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.rate-info {
  flex: 1;
}

.rate-name {
  font-weight: 500;
  margin-bottom: 2px;
}

.rate-details {
  font-size: 0.85rem;
  color: #666;
}

.rate-time {
  font-size: 0.85rem;
  color: #888;
  font-style: italic;
}

.advanced-content {
  padding-top: 16px;
}

.option-group {
  margin-bottom: 20px;
}

.option-group h5 {
  margin: 0 0 12px 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.batch-settings {
  margin-top: 12px;
  padding-left: 32px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.schedule-summary {
  margin-top: 8px;
}

.summary-card {
  background: rgba(32, 41, 80, 0.02);
  border: 1px solid rgba(32, 41, 80, 0.08);
  border-radius: 8px;
  padding: 16px;
}

.summary-card h4 {
  margin: 0 0 12px 0;
  font-size: 1rem;
  font-weight: 600;
}

.summary-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  color: #666;
  font-size: 0.9rem;
}

.summary-value {
  font-weight: 500;
}

.card-actions {
  padding: 16px 24px !important;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(248, 249, 250, 0.5);
}

@media (max-width: 768px) {
  .date-time-grid {
    grid-template-columns: 1fr;
  }
  
  .batch-settings {
    grid-template-columns: 1fr;
  }
  
  .summary-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .rate-option {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>