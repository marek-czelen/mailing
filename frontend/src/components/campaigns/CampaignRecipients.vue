<template>
  <div class="campaign-recipients">
    <div class="recipients-header">
      <div class="header-info">
        <h3>Odbiorcy kampanii</h3>
        <p>Zarządzaj listą odbiorców i segmentacją</p>
      </div>
      <div class="header-actions">
        <v-btn color="success" variant="outlined" @click="addSegment">
          <v-icon left>mdi-plus</v-icon>
          Dodaj segment
        </v-btn>
        <v-btn color="primary" @click="manageRecipients">
          <v-icon left>mdi-account-group</v-icon>
          Zarządzaj odbiorcami
        </v-btn>
      </div>
    </div>

    <div class="recipients-grid">
      <!-- Segments Selection Card -->
      <v-card class="segments-card">
        <v-card-title class="card-title">
          <v-icon color="primary">mdi-target</v-icon>
          Wybrane segmenty
        </v-card-title>
        <v-card-text>
          <!-- Segments List -->
          <div v-if="selectedSegments.length > 0" class="segments-list">
            <div 
              v-for="segment in selectedSegments" 
              :key="segment.id" 
              class="segment-item"
            >
              <div class="segment-info">
                <div class="segment-name">
                  <v-icon size="20" :color="getSegmentColor(segment.type)">
                    {{ getSegmentIcon(segment.type) }}
                  </v-icon>
                  <span>{{ segment.name }}</span>
                </div>
                <div class="segment-details">
                  <span class="segment-count">{{ segment.contactCount }} kontaktów</span>
                  <v-chip size="small" :color="getSegmentColor(segment.type)" variant="outlined">
                    {{ getSegmentTypeLabel(segment.type) }}
                  </v-chip>
                </div>
              </div>
              <div class="segment-actions">
                <v-btn 
                  size="small" 
                  variant="text" 
                  icon
                  @click="editSegment(segment)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn 
                  size="small" 
                  variant="text" 
                  icon
                  color="error"
                  @click="removeSegment(segment.id)"
                >
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </div>
            </div>
          </div>

          <div v-else class="no-segments">
            <v-icon size="48" color="grey-lighten-2">mdi-target-variant</v-icon>
            <h4>Brak wybranych segmentów</h4>
            <p>Dodaj segmenty aby określić odbiorców kampanii</p>
            <v-btn color="primary" variant="outlined" @click="addSegment">
              <v-icon left>mdi-plus</v-icon>
              Wybierz segmenty
            </v-btn>
          </div>

          <!-- Total Recipients Summary -->
          <div v-if="selectedSegments.length > 0" class="recipients-summary">
            <v-divider class="my-4"></v-divider>
            <div class="summary-row">
              <span class="summary-label">Łączna liczba odbiorców:</span>
              <div class="summary-value">
                <v-icon color="success" size="20">mdi-account-group</v-icon>
                <strong>{{ totalRecipients }}</strong>
              </div>
            </div>
            <div class="summary-row">
              <span class="summary-label">Szacowany zasięg:</span>
              <div class="summary-value">
                <v-icon color="info" size="20">mdi-chart-line</v-icon>
                <strong>{{ estimatedReach }}%</strong>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Recipients Statistics Card -->
      <v-card class="stats-card">
        <v-card-title class="card-title">
          <v-icon color="info">mdi-chart-pie</v-icon>
          Statystyki odbiorców
        </v-card-title>
        <v-card-text>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-icon">
                <v-icon color="success">mdi-account-check</v-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ recipientStats.active }}</div>
                <div class="stat-label">Aktywni</div>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon">
                <v-icon color="warning">mdi-account-clock</v-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ recipientStats.inactive }}</div>
                <div class="stat-label">Nieaktywni</div>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon">
                <v-icon color="error">mdi-account-off</v-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ recipientStats.bounced }}</div>
                <div class="stat-label">Odrzucone</div>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon">
                <v-icon color="grey">mdi-account-minus</v-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ recipientStats.unsubscribed }}</div>
                <div class="stat-label">Wypisane</div>
              </div>
            </div>
          </div>

          <!-- Engagement Chart -->
          <div class="engagement-chart">
            <h4>Zaangażowanie odbiorców</h4>
            <div class="chart-container">
              <div class="engagement-bar">
                <div class="engagement-segment open" :style="{ width: engagementData.openRate + '%' }">
                  <span>{{ engagementData.openRate }}%</span>
                </div>
                <div class="engagement-segment click" :style="{ width: engagementData.clickRate + '%' }">
                  <span>{{ engagementData.clickRate }}%</span>
                </div>
              </div>
              <div class="chart-legend">
                <div class="legend-item">
                  <div class="legend-color open"></div>
                  <span>Otwierają ({{ engagementData.openRate }}%)</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color click"></div>
                  <span>Klikają ({{ engagementData.clickRate }}%)</span>
                </div>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Exclusions Card -->
      <v-card class="exclusions-card">
        <v-card-title class="card-title">
          <v-icon color="warning">mdi-account-cancel</v-icon>
          Wykluczenia
        </v-card-title>
        <v-card-text>
          <div class="exclusions-options">
            <v-checkbox
              v-model="exclusions.bounced"
              label="Wyklucz adresy odrzucone"
              color="primary"
            ></v-checkbox>
            
            <v-checkbox
              v-model="exclusions.unsubscribed"
              label="Wyklucz wypisanych"
              color="primary"
            ></v-checkbox>
            
            <v-checkbox
              v-model="exclusions.inactive"
              label="Wyklucz nieaktywnych (brak otwarć w ciągu 90 dni)"
              color="primary"
            ></v-checkbox>
            
            <v-checkbox
              v-model="exclusions.duplicates"
              label="Usuń duplikaty"
              color="primary"
            ></v-checkbox>
          </div>

          <!-- Exclusion Summary -->
          <div v-if="hasExclusions" class="exclusion-summary">
            <v-divider class="my-4"></v-divider>
            <div class="summary-info">
              <v-icon color="warning">mdi-information</v-icon>
              <span>
                Po zastosowaniu wykluczeń pozostanie 
                <strong>{{ finalRecipientCount }}</strong> odbiorców
              </span>
            </div>
          </div>

          <!-- Test Sending -->
          <div class="test-section">
            <v-divider class="my-4"></v-divider>
            <h4>Wysyłka testowa</h4>
            <v-text-field
              v-model="testEmail"
              label="Email testowy"
              placeholder="test@example.com"
              variant="outlined"
              density="compact"
              :rules="emailRules"
            ></v-text-field>
            <v-btn 
              color="info" 
              variant="outlined" 
              size="small"
              @click="sendTest"
              :disabled="!isValidEmail(testEmail)"
            >
              <v-icon left>mdi-email-send</v-icon>
              Wyślij test
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Segment Selection Dialog -->
    <v-dialog v-model="segmentDialog" max-width="800px">
      <v-card>
        <v-card-title class="card-title">
          <v-icon color="primary">mdi-target</v-icon>
          Wybierz segmenty
        </v-card-title>
        <v-card-text>
          <div class="segment-selection">
            <div 
              v-for="segment in availableSegments" 
              :key="segment.id"
              class="segment-option"
              :class="{ selected: isSegmentSelected(segment.id) }"
              @click="toggleSegment(segment)"
            >
              <div class="segment-checkbox">
                <v-checkbox
                  :model-value="isSegmentSelected(segment.id)"
                  color="primary"
                  hide-details
                ></v-checkbox>
              </div>
              <div class="segment-details">
                <div class="segment-header">
                  <span class="segment-name">{{ segment.name }}</span>
                  <v-chip size="small" :color="getSegmentColor(segment.type)" variant="outlined">
                    {{ getSegmentTypeLabel(segment.type) }}
                  </v-chip>
                </div>
                <div class="segment-meta">
                  <span>{{ segment.contactCount }} kontaktów</span>
                  <span>•</span>
                  <span>{{ segment.database }}</span>
                </div>
                <div v-if="segment.description" class="segment-description">
                  {{ segment.description }}
                </div>
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="segmentDialog = false">Anuluj</v-btn>
          <v-btn color="primary" @click="saveSegmentSelection">Zapisz</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, onMounted } from 'vue'

defineProps({
  campaign: {
    type: Object,
    required: true
  }
})

defineEmits(['update:segments', 'manage-recipients'])

// Reactive data
const selectedSegments = ref([])
const segmentDialog = ref(false)
const testEmail = ref('')

const exclusions = ref({
  bounced: true,
  unsubscribed: true,
  inactive: false,
  duplicates: true
})

const recipientStats = ref({
  active: 15420,
  inactive: 2350,
  bounced: 180,
  unsubscribed: 890
})

const engagementData = ref({
  openRate: 24,
  clickRate: 8
})

// Sample data
const availableSegments = ref([
  {
    id: 1,
    name: 'Aktywni klienci',
    type: 'behavior',
    contactCount: 8540,
    database: 'Klienci VIP',
    description: 'Klienci którzy dokonali zakupu w ciągu ostatnich 30 dni'
  },
  {
    id: 2,
    name: 'Newsletter subskrybenci',
    type: 'subscription',
    contactCount: 12300,
    database: 'Newsletter główny',
    description: 'Wszyscy subskrybenci newslettera'
  },
  {
    id: 3,
    name: 'Warszawa i okolice',
    type: 'location',
    contactCount: 3420,
    database: 'Klienci regionalni',
    description: 'Klienci z województwa mazowieckiego'
  },
  {
    id: 4,
    name: 'Wiek 25-40',
    type: 'demographic',
    contactCount: 5680,
    database: 'Demografia',
    description: 'Klienci w przedziale wiekowym 25-40 lat'
  },
  {
    id: 5,
    name: 'Porzucone koszyki',
    type: 'behavior',
    contactCount: 890,
    database: 'E-commerce',
    description: 'Użytkownicy którzy porzucili koszyk w ciągu 7 dni'
  }
])

// Email validation rules
const emailRules = [
  v => !!v || 'Email jest wymagany',
  v => /.+@.+\..+/.test(v) || 'Email musi być poprawny'
]

// Computed properties
const totalRecipients = computed(() => {
  return selectedSegments.value.reduce((sum, segment) => sum + segment.contactCount, 0)
})

const estimatedReach = computed(() => {
  if (totalRecipients.value === 0) return 0
  return Math.round((totalRecipients.value / 20000) * 100)
})

const hasExclusions = computed(() => {
  return exclusions.value.bounced || exclusions.value.unsubscribed || 
         exclusions.value.inactive || exclusions.value.duplicates
})

const finalRecipientCount = computed(() => {
  let count = totalRecipients.value
  if (exclusions.value.bounced) count -= recipientStats.value.bounced
  if (exclusions.value.unsubscribed) count -= recipientStats.value.unsubscribed
  if (exclusions.value.inactive) count -= recipientStats.value.inactive
  if (exclusions.value.duplicates) count = Math.round(count * 0.95) // Assume 5% duplicates
  return Math.max(0, count)
})

// Methods
function getSegmentColor(type) {
  const colors = {
    behavior: 'success',
    subscription: 'primary',
    location: 'warning',
    demographic: 'info'
  }
  return colors[type] || 'grey'
}

function getSegmentIcon(type) {
  const icons = {
    behavior: 'mdi-account-heart',
    subscription: 'mdi-email-newsletter',
    location: 'mdi-map-marker',
    demographic: 'mdi-account-group'
  }
  return icons[type] || 'mdi-account'
}

function getSegmentTypeLabel(type) {
  const labels = {
    behavior: 'Zachowanie',
    subscription: 'Subskrypcja',
    location: 'Lokalizacja',
    demographic: 'Demografia'
  }
  return labels[type] || type
}

function isValidEmail(email) {
  return email && /.+@.+\..+/.test(email)
}

function isSegmentSelected(segmentId) {
  return selectedSegments.value.some(s => s.id === segmentId)
}

function addSegment() {
  segmentDialog.value = true
}

function toggleSegment(segment) {
  const index = selectedSegments.value.findIndex(s => s.id === segment.id)
  if (index > -1) {
    selectedSegments.value.splice(index, 1)
  } else {
    selectedSegments.value.push(segment)
  }
}

function saveSegmentSelection() {
  segmentDialog.value = false
  // Emit update to parent
}

function removeSegment(segmentId) {
  const index = selectedSegments.value.findIndex(s => s.id === segmentId)
  if (index > -1) {
    selectedSegments.value.splice(index, 1)
  }
}

function editSegment(segment) {
  console.log('Edytowanie segmentu:', segment.name)
  // Implement segment editing
}

function manageRecipients() {
  console.log('Zarządzanie odbiorcami')
  // Implement recipient management
}

function sendTest() {
  if (isValidEmail(testEmail.value)) {
    console.log('Wysyłanie test email na:', testEmail.value)
    // Implement test email sending
  }
}

// Initialize with campaign segments
onMounted(() => {
  // Load campaign segments if available
  if (campaign.segments) {
    selectedSegments.value = campaign.segments
  }
})
</script>

<style scoped>
.campaign-recipients {
  width: 100%;
}

.recipients-header {
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

.header-actions {
  display: flex;
  gap: 12px;
}

.recipients-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 24px;
}

.segments-card,
.stats-card,
.exclusions-card {
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

/* Segments List */
.segments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.segment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
}

.segment-info {
  flex: 1;
}

.segment-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  margin-bottom: 4px;
}

.segment-details {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.9rem;
}

.segment-count {
  color: #666;
}

.segment-actions {
  display: flex;
  gap: 4px;
}

.no-segments {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.no-segments h4 {
  margin: 16px 0 8px 0;
}

.no-segments p {
  margin-bottom: 24px;
}

.recipients-summary {
  background: rgba(32, 41, 80, 0.02);
  padding: 16px;
  border-radius: 8px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.summary-label {
  color: #666;
}

.summary-value {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Statistics */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.stat-info {
  text-align: left;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.85rem;
  color: #666;
}

/* Engagement Chart */
.engagement-chart h4 {
  margin: 0 0 16px 0;
  font-size: 1rem;
  font-weight: 600;
}

.chart-container {
  background: rgba(255, 255, 255, 0.5);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.engagement-bar {
  position: relative;
  height: 40px;
  background: #f5f5f5;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 12px;
}

.engagement-segment {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  font-size: 0.9rem;
}

.engagement-segment.open {
  background: #4caf50;
}

.engagement-segment.click {
  background: #2196f3;
  left: 24%;
}

.chart-legend {
  display: flex;
  gap: 24px;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-color.open {
  background: #4caf50;
}

.legend-color.click {
  background: #2196f3;
}

/* Exclusions */
.exclusions-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.exclusion-summary {
  background: rgba(255, 193, 7, 0.1);
  padding: 12px;
  border-radius: 6px;
}

.summary-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.test-section h4 {
  margin: 0 0 12px 0;
  font-size: 1rem;
  font-weight: 600;
}

/* Segment Selection Dialog */
.segment-selection {
  max-height: 400px;
  overflow-y: auto;
}

.segment-option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.segment-option:hover {
  background: rgba(32, 41, 80, 0.02);
  border-color: #515bad;
}

.segment-option.selected {
  background: rgba(81, 91, 173, 0.05);
  border-color: #515bad;
}

.segment-checkbox {
  flex-shrink: 0;
}

.segment-details {
  flex: 1;
}

.segment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.segment-name {
  font-weight: 500;
}

.segment-meta {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 4px;
}

.segment-description {
  font-size: 0.85rem;
  color: #888;
}

@media (max-width: 1400px) {
  .recipients-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .recipients-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-legend {
    flex-direction: column;
    align-items: center;
  }
}
</style>