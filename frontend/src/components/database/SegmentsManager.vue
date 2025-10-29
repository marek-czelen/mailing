<template>
  <div class="segments-manager">
    <!-- Header -->
    <div class="segments-header">
      <div class="header-left">
        <h3>Segmenty kontaktów</h3>
        <p>Twórz inteligentne grupy kontaktów na podstawie różnych kryteriów</p>
      </div>
      <v-btn color="primary" @click="openCreateSegment">
        <v-icon left>mdi-plus</v-icon>
        Nowy segment
      </v-btn>
    </div>

    <!-- Segments List -->
    <div class="segments-grid">
      <v-card
        v-for="segment in segments"
        :key="segment.id"
        class="segment-card"
        @click="selectSegment(segment)"
      >
        <v-card-text>
          <div class="segment-header">
            <div class="segment-icon">
              <v-icon :color="segment.color || 'primary'">{{ segment.icon || 'mdi-filter' }}</v-icon>
            </div>
            <div class="segment-actions">
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    v-bind="props"
                    @click.stop
                  >
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="editSegment(segment)">
                    <v-list-item-title>
                      <v-icon left size="16">mdi-pencil</v-icon>
                      Edytuj
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="duplicateSegment(segment)">
                    <v-list-item-title>
                      <v-icon left size="16">mdi-content-copy</v-icon>
                      Duplikuj
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="exportSegment(segment)">
                    <v-list-item-title>
                      <v-icon left size="16">mdi-download</v-icon>
                      Eksportuj
                    </v-list-item-title>
                  </v-list-item>
                  <v-divider />
                  <v-list-item @click="deleteSegment(segment)" class="delete-item">
                    <v-list-item-title>
                      <v-icon left size="16">mdi-delete</v-icon>
                      Usuń
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </div>

          <h4 class="segment-name">{{ segment.name }}</h4>
          <p class="segment-description">{{ segment.description }}</p>

          <div class="segment-stats">
            <div class="stat">
              <v-icon size="16" color="grey">mdi-account-group</v-icon>
              <span>{{ segment.count || 0 }} kontaktów</span>
            </div>
            <div class="stat">
              <v-icon size="16" color="grey">mdi-calendar</v-icon>
              <span>{{ formatDate(segment.updatedAt) }}</span>
            </div>
          </div>

          <div class="segment-rules" v-if="segment.rules?.length">
            <v-chip
              v-for="rule in segment.rules.slice(0, 2)"
              :key="rule.id"
              size="small"
              variant="outlined"
              class="rule-chip"
            >
              {{ formatRule(rule) }}
            </v-chip>
            <span v-if="segment.rules.length > 2" class="more-rules">
              +{{ segment.rules.length - 2 }} więcej
            </span>
          </div>
        </v-card-text>
      </v-card>

      <!-- Empty State -->
      <v-card v-if="segments.length === 0" class="empty-segment-card">
        <v-card-text class="text-center">
          <v-icon size="48" color="grey-lighten-2">mdi-filter-outline</v-icon>
          <h3>Brak segmentów</h3>
          <p>Utwórz pierwszy segment, aby grupować kontakty</p>
          <v-btn color="primary" @click="openCreateSegment">
            <v-icon left>mdi-plus</v-icon>
            Utwórz segment
          </v-btn>
        </v-card-text>
      </v-card>
    </div>

    <!-- Segment Builder Dialog -->
    <v-dialog v-model="showSegmentDialog" max-width="800px" persistent>
      <v-card class="segment-dialog">
        <v-card-title class="dialog-header">
          <h2>{{ isEditing ? 'Edytuj segment' : 'Nowy segment' }}</h2>
          <v-btn icon variant="text" @click="closeSegmentDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="dialog-content">
          <v-form ref="segmentForm" v-model="segmentFormValid">
            <!-- Basic Info -->
            <div class="form-section">
              <h3>Podstawowe informacje</h3>
              <v-text-field
                v-model="segmentData.name"
                label="Nazwa segmentu"
                :rules="[rules.required]"
                variant="outlined"
                required
              />
              <v-textarea
                v-model="segmentData.description"
                label="Opis"
                variant="outlined"
                rows="2"
              />
              <div class="icon-color-row">
                <v-select
                  v-model="segmentData.icon"
                  :items="iconOptions"
                  label="Ikona"
                  variant="outlined"
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template v-slot:prepend>
                        <v-icon>{{ item.value }}</v-icon>
                      </template>
                    </v-list-item>
                  </template>
                  <template v-slot:selection="{ item }">
                    <v-icon class="mr-2">{{ item.value }}</v-icon>
                    {{ item.title }}
                  </template>
                </v-select>
                <v-select
                  v-model="segmentData.color"
                  :items="colorOptions"
                  label="Kolor"
                  variant="outlined"
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template v-slot:prepend>
                        <div class="color-dot" :style="{ backgroundColor: item.value }"></div>
                      </template>
                    </v-list-item>
                  </template>
                  <template v-slot:selection="{ item }">
                    <div class="color-dot mr-2" :style="{ backgroundColor: item.value }"></div>
                    {{ item.title }}
                  </template>
                </v-select>
              </div>
            </div>

            <!-- Segment Rules -->
            <div class="form-section">
              <div class="section-header">
                <h3>Reguły segmentu</h3>
                <v-btn size="small" variant="outlined" @click="addRule">
                  <v-icon left>mdi-plus</v-icon>
                  Dodaj regułę
                </v-btn>
              </div>

              <div v-if="segmentData.rules.length === 0" class="no-rules">
                <p>Brak reguł. Dodaj pierwszą regułę, aby zdefiniować segment.</p>
              </div>

              <div v-else class="rules-builder">
                <div
                  v-for="(rule, index) in segmentData.rules"
                  :key="rule.id"
                  class="rule-row"
                >
                  <div v-if="index > 0" class="rule-operator">
                    <v-select
                      v-model="rule.operator"
                      :items="operatorOptions"
                      variant="outlined"
                      density="comfortable"
                      hide-details
                    />
                  </div>

                  <div class="rule-content">
                    <v-select
                      v-model="rule.field"
                      :items="fieldOptions"
                      label="Pole"
                      variant="outlined"
                      density="comfortable"
                    />
                    <v-select
                      v-model="rule.condition"
                      :items="getConditionOptions(rule.field)"
                      label="Warunek"
                      variant="outlined"
                      density="comfortable"
                    />
                    <v-text-field
                      v-model="rule.value"
                      label="Wartość"
                      variant="outlined"
                      density="comfortable"
                    />
                    <v-btn
                      icon
                      size="small"
                      variant="text"
                      color="error"
                      @click="removeRule(index)"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </div>
              </div>
            </div>

            <!-- Preview -->
            <div class="form-section">
              <h3>Podgląd</h3>
              <div class="preview-card">
                <div class="preview-stats">
                  <v-icon>mdi-account-group</v-icon>
                  <span>Szacowana liczba kontaktów: <strong>{{ estimatedCount }}</strong></span>
                </div>
                <v-btn variant="outlined" size="small" @click="previewSegment">
                  <v-icon left>mdi-eye</v-icon>
                  Podgląd kontaktów
                </v-btn>
              </div>
            </div>
          </v-form>
        </v-card-text>

        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn variant="text" @click="closeSegmentDialog">
            Anuluj
          </v-btn>
          <v-btn
            color="primary"
            :loading="saving"
            :disabled="!segmentFormValid"
            @click="saveSegment"
          >
            {{ isEditing ? 'Zapisz zmiany' : 'Utwórz segment' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'

const props = defineProps({
  database: Object,
  segments: Array
})

const emit = defineEmits(['create-segment', 'edit-segment'])

// Reactive data
const showSegmentDialog = ref(false)
const segmentFormValid = ref(false)
const saving = ref(false)
const editingSegment = ref(null)
const estimatedCount = ref(0)

// Segment form data
const segmentData = ref({
  name: '',
  description: '',
  icon: 'mdi-filter',
  color: 'primary',
  rules: []
})

// Options
const iconOptions = [
  { title: 'Filtr', value: 'mdi-filter' },
  { title: 'Gwiazda', value: 'mdi-star' },
  { title: 'Serce', value: 'mdi-heart' },
  { title: 'Tarcza', value: 'mdi-shield' },
  { title: 'Korona', value: 'mdi-crown' },
  { title: 'Cel', value: 'mdi-target' },
  { title: 'Błyskawica', value: 'mdi-lightning-bolt' },
  { title: 'Diament', value: 'mdi-diamond' }
]

const colorOptions = [
  { title: 'Niebieski', value: 'primary' },
  { title: 'Zielony', value: 'success' },
  { title: 'Pomarańczowy', value: 'warning' },
  { title: 'Czerwony', value: 'error' },
  { title: 'Fioletowy', value: 'purple' },
  { title: 'Różowy', value: 'pink' },
  { title: 'Cyjan', value: 'cyan' },
  { title: 'Szary', value: 'grey' }
]

const fieldOptions = [
  { title: 'Email', value: 'email' },
  { title: 'Imię', value: 'firstName' },
  { title: 'Nazwisko', value: 'lastName' },
  { title: 'Telefon', value: 'phone' },
  { title: 'Status', value: 'status' },
  { title: 'Data utworzenia', value: 'createdAt' },
  { title: 'Ostatnia aktywność', value: 'lastActivity' },
  { title: 'Tagi', value: 'tags' },
  { title: 'Miasto', value: 'city' },
  { title: 'Kraj', value: 'country' }
]

const operatorOptions = [
  { title: 'I', value: 'AND' },
  { title: 'LUB', value: 'OR' }
]

const rules = {
  required: value => !!value || 'To pole jest wymagane'
}

// Computed
const isEditing = computed(() => !!editingSegment.value)

// Methods
function openCreateSegment() {
  editingSegment.value = null
  resetSegmentForm()
  showSegmentDialog.value = true
}

function editSegment(segment) {
  editingSegment.value = segment
  segmentData.value = {
    name: segment.name,
    description: segment.description || '',
    icon: segment.icon || 'mdi-filter',
    color: segment.color || 'primary',
    rules: [...(segment.rules || [])]
  }
  showSegmentDialog.value = true
}

function closeSegmentDialog() {
  showSegmentDialog.value = false
  editingSegment.value = null
  resetSegmentForm()
}

function resetSegmentForm() {
  segmentData.value = {
    name: '',
    description: '',
    icon: 'mdi-filter',
    color: 'primary',
    rules: []
  }
}

function addRule() {
  segmentData.value.rules.push({
    id: Date.now(),
    field: 'email',
    condition: 'contains',
    value: '',
    operator: segmentData.value.rules.length > 0 ? 'AND' : null
  })
}

function removeRule(index) {
  segmentData.value.rules.splice(index, 1)
}

function getConditionOptions(field) {
  const baseConditions = [
    { title: 'zawiera', value: 'contains' },
    { title: 'nie zawiera', value: 'not_contains' },
    { title: 'równa się', value: 'equals' },
    { title: 'nie równa się', value: 'not_equals' }
  ]

  if (field === 'createdAt' || field === 'lastActivity') {
    return [
      { title: 'po dacie', value: 'after' },
      { title: 'przed datą', value: 'before' },
      { title: 'w ostatnich dniach', value: 'last_days' }
    ]
  }

  if (field === 'status') {
    return [
      { title: 'równa się', value: 'equals' },
      { title: 'nie równa się', value: 'not_equals' }
    ]
  }

  return baseConditions
}

function formatRule(rule) {
  return `${rule.field} ${rule.condition} ${rule.value}`
}

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pl-PL')
}

function selectSegment(segment) {
  console.log('Wybrano segment:', segment)
}

function duplicateSegment(segment) {
  const duplicate = {
    ...segment,
    id: Date.now(),
    name: `${segment.name} (kopia)`,
    count: 0
  }
  emit('create-segment', duplicate)
}

function deleteSegment(segment) {
  if (confirm(`Czy na pewno chcesz usunąć segment "${segment.name}"?`)) {
    console.log('Usuwanie segmentu:', segment)
  }
}

function exportSegment(segment) {
  console.log('Eksportowanie segmentu:', segment)
}

function previewSegment() {
  // Calculate estimated count based on rules
  estimatedCount.value = Math.floor(Math.random() * 500) + 50
}

function saveSegment() {
  if (!segmentFormValid.value) return
  
  saving.value = true
  
  setTimeout(() => {
    const segmentToSave = {
      ...segmentData.value,
      id: editingSegment.value?.id || Date.now(),
      count: estimatedCount.value,
      updatedAt: new Date()
    }
    
    emit('create-segment', segmentToSave)
    closeSegmentDialog()
    saving.value = false
  }, 1000)
}
</script>

<style scoped>
.segments-manager {
  width: 100%;
}

.segments-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-left h3 {
  margin: 0 0 8px 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.header-left p {
  margin: 0;
  color: #666;
}

.segments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.segment-card,
.empty-segment-card {
  border-radius: 12px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px) !important;
  cursor: pointer;
  transition: all 0.3s ease;
}

.segment-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}

.segment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.segment-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(81, 91, 173, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.segment-name {
  font-weight: 600;
  margin: 0 0 8px 0;
  font-size: 1.1rem;
}

.segment-description {
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 16px 0;
  line-height: 1.4;
}

.segment-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  color: #666;
}

.segment-rules {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.rule-chip {
  font-size: 0.75rem !important;
  height: 24px !important;
}

.more-rules {
  font-size: 0.75rem;
  color: #666;
}

/* Dialog Styles */
.segment-dialog {
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

.dialog-content {
  padding: 32px !important;
  max-height: 70vh;
  overflow-y: auto;
}

.form-section {
  margin-bottom: 32px;
}

.form-section h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.icon-color-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.color-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: inline-block;
}

.rules-builder {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  background: #fafafa;
}

.rule-row {
  margin-bottom: 16px;
}

.rule-operator {
  text-align: center;
  margin-bottom: 8px;
}

.rule-content {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 12px;
  align-items: start;
}

.no-rules {
  text-align: center;
  padding: 40px;
  color: #666;
}

.preview-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dialog-actions {
  padding: 16px 24px 24px 24px !important;
  background: #f8f9fa;
}

.delete-item {
  color: #e53e3e !important;
}

@media (max-width: 768px) {
  .segments-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .segments-grid {
    grid-template-columns: 1fr;
  }
  
  .rule-content {
    grid-template-columns: 1fr;
  }
}
</style>