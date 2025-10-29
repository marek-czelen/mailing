<template>
  <v-dialog 
    :model-value="modelValue" 
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="700px"
    persistent
  >
    <v-card class="import-dialog">
      <v-card-title class="dialog-header">
        <h2>Import kontaktów</h2>
        <v-btn icon variant="text" @click="close" class="close-btn">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="dialog-content">
        <v-stepper v-model="step" class="import-stepper">
          <v-stepper-header>
            <v-stepper-item
              title="Wybór pliku"
              value="1"
              :complete="step > 1"
            />
            <v-divider />
            <v-stepper-item
              title="Mapowanie"
              value="2"
              :complete="step > 2"
            />
            <v-divider />
            <v-stepper-item
              title="Import"
              value="3"
            />
          </v-stepper-header>

          <v-stepper-window>
            <!-- Step 1: File Selection -->
            <v-stepper-window-item value="1">
              <div class="step-content">
                <h3>Wybierz plik do importu</h3>
                <p>Obsługiwane formaty: CSV, Excel (.xlsx, .xls)</p>

                <div class="file-upload-area">
                  <v-file-input
                    v-model="selectedFile"
                    accept=".csv,.xlsx,.xls"
                    label="Wybierz plik"
                    variant="outlined"
                    prepend-icon="mdi-paperclip"
                    show-size
                    @change="handleFileSelect"
                  />
                  
                  <div class="upload-hint">
                    <v-icon color="info">mdi-information</v-icon>
                    <div>
                      <p><strong>Wymagania pliku:</strong></p>
                      <ul>
                        <li>Pierwsza linia powinna zawierać nagłówki kolumn</li>
                        <li>Wymagane pole: adres email</li>
                        <li>Maksymalny rozmiar: 10MB</li>
                        <li>Maksymalnie 50,000 kontaktów na import</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <!-- File Preview -->
                <div v-if="filePreview" class="file-preview">
                  <h4>Podgląd pliku</h4>
                  <v-table density="compact">
                    <thead>
                      <tr>
                        <th v-for="header in filePreview.headers" :key="header">
                          {{ header }}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, index) in filePreview.rows.slice(0, 5)" :key="index">
                        <td v-for="(cell, cellIndex) in row" :key="cellIndex">
                          {{ cell }}
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                  <p class="preview-info">
                    Pokazano 5 z {{ filePreview.totalRows }} wierszy
                  </p>
                </div>
              </div>
            </v-stepper-window-item>

            <!-- Step 2: Field Mapping -->
            <v-stepper-window-item value="2">
              <div class="step-content">
                <h3>Mapowanie pól</h3>
                <p>Dopasuj kolumny z pliku do pól w bazie danych</p>

                <div class="mapping-section">
                  <div
                    v-for="(header, index) in filePreview?.headers"
                    :key="index"
                    class="mapping-row"
                  >
                    <div class="source-field">
                      <strong>{{ header }}</strong>
                      <span class="field-example">
                        np: {{ getFieldExample(index) }}
                      </span>
                    </div>
                    
                    <v-icon class="mapping-arrow">mdi-arrow-right</v-icon>
                    
                    <div class="target-field">
                      <v-select
                        v-model="fieldMapping[index]"
                        :items="databaseFields"
                        label="Pole w bazie"
                        variant="outlined"
                        density="comfortable"
                        clearable
                      />
                    </div>
                  </div>
                </div>

                <!-- Import Options -->
                <div class="import-options">
                  <h4>Opcje importu</h4>
                  
                  <v-radio-group v-model="importMode" inline>
                    <v-radio
                      label="Dodaj nowe kontakty"
                      value="add"
                    />
                    <v-radio
                      label="Aktualizuj istniejące"
                      value="update"
                    />
                    <v-radio
                      label="Dodaj i aktualizuj"
                      value="merge"
                    />
                  </v-radio-group>

                  <v-switch
                    v-model="importOptions.skipDuplicates"
                    label="Pomiń duplikaty (na podstawie email)"
                    color="primary"
                    inset
                  />

                  <v-switch
                    v-model="importOptions.validateEmails"
                    label="Waliduj adresy email"
                    color="primary"
                    inset
                  />

                  <v-select
                    v-model="importOptions.defaultStatus"
                    :items="statusOptions"
                    label="Domyślny status kontaktów"
                    variant="outlined"
                    density="comfortable"
                  />
                </div>
              </div>
            </v-stepper-window-item>

            <!-- Step 3: Import Process -->
            <v-stepper-window-item value="3">
              <div class="step-content">
                <div v-if="!importing && !importResult" class="import-summary">
                  <h3>Podsumowanie importu</h3>
                  <div class="summary-stats">
                    <div class="stat-item">
                      <v-icon color="primary">mdi-file-document</v-icon>
                      <span>{{ filePreview?.totalRows || 0 }} wierszy w pliku</span>
                    </div>
                    <div class="stat-item">
                      <v-icon color="success">mdi-check-circle</v-icon>
                      <span>{{ mappedFieldsCount }} pól zmapowanych</span>
                    </div>
                    <div class="stat-item">
                      <v-icon color="info">mdi-cog</v-icon>
                      <span>Tryb: {{ getModeLabel(importMode) }}</span>
                    </div>
                  </div>
                </div>

                <div v-if="importing" class="import-progress">
                  <h3>Importowanie...</h3>
                  <v-progress-linear
                    :model-value="importProgress"
                    color="primary"
                    height="20"
                    rounded
                  >
                    <template v-slot:default>
                      <strong>{{ importProgress }}%</strong>
                    </template>
                  </v-progress-linear>
                  <p>{{ importStatus }}</p>
                </div>

                <div v-if="importResult" class="import-result">
                  <div class="result-header">
                    <v-icon size="48" :color="importResult.success ? 'success' : 'error'">
                      {{ importResult.success ? 'mdi-check-circle' : 'mdi-alert-circle' }}
                    </v-icon>
                    <h3>
                      {{ importResult.success ? 'Import zakończony' : 'Błąd importu' }}
                    </h3>
                  </div>

                  <div v-if="importResult.success" class="result-stats">
                    <div class="result-stat">
                      <span class="stat-number">{{ importResult.added || 0 }}</span>
                      <span class="stat-label">Dodanych</span>
                    </div>
                    <div class="result-stat">
                      <span class="stat-number">{{ importResult.updated || 0 }}</span>
                      <span class="stat-label">Zaktualizowanych</span>
                    </div>
                    <div class="result-stat">
                      <span class="stat-number">{{ importResult.skipped || 0 }}</span>
                      <span class="stat-label">Pominiętych</span>
                    </div>
                    <div class="result-stat">
                      <span class="stat-number">{{ importResult.errors || 0 }}</span>
                      <span class="stat-label">Błędów</span>
                    </div>
                  </div>

                  <div v-if="importResult.errors?.length" class="error-list">
                    <h4>Błędy importu:</h4>
                    <v-list>
                      <v-list-item
                        v-for="error in importResult.errors.slice(0, 10)"
                        :key="error.row"
                      >
                        <v-list-item-title>
                          Wiersz {{ error.row }}: {{ error.message }}
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                    <p v-if="importResult.errors.length > 10">
                      I {{ importResult.errors.length - 10 }} więcej błędów...
                    </p>
                  </div>
                </div>
              </div>
            </v-stepper-window-item>
          </v-stepper-window>

          <v-stepper-actions
            :disabled="importing"
            @click:prev="prevStep"
            @click:next="nextStep"
          >
            <template v-slot:next>
              <v-btn
                v-if="step < 3"
                color="primary"
                :disabled="!canProceed"
                @click="nextStep"
              >
                Dalej
              </v-btn>
              <v-btn
                v-else-if="step === 3 && !importing && !importResult"
                color="primary"
                @click="startImport"
              >
                Rozpocznij import
              </v-btn>
              <v-btn
                v-else-if="importResult"
                color="primary"
                @click="finishImport"
              >
                Zakończ
              </v-btn>
            </template>
          </v-stepper-actions>
        </v-stepper>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  database: Object
})

const emit = defineEmits(['update:modelValue', 'imported'])

// Reactive data
const step = ref(1)
const selectedFile = ref(null)
const filePreview = ref(null)
const fieldMapping = ref({})
const importMode = ref('add')
const importing = ref(false)
const importProgress = ref(0)
const importStatus = ref('')
const importResult = ref(null)

const importOptions = ref({
  skipDuplicates: true,
  validateEmails: true,
  defaultStatus: 'active'
})

// Database fields for mapping
const databaseFields = [
  { title: 'Email', value: 'email' },
  { title: 'Imię', value: 'firstName' },
  { title: 'Nazwisko', value: 'lastName' },
  { title: 'Telefon', value: 'phone' },
  { title: 'Adres', value: 'address' },
  { title: 'Miasto', value: 'city' },
  { title: 'Kod pocztowy', value: 'postalCode' },
  { title: 'Kraj', value: 'country' },
  { title: 'Status', value: 'status' },
  { title: 'Tagi', value: 'tags' },
  { title: 'Notatki', value: 'notes' }
]

const statusOptions = [
  { title: 'Aktywny', value: 'active' },
  { title: 'Nieaktywny', value: 'inactive' },
  { title: 'Zablokowany', value: 'blocked' }
]

// Computed
const canProceed = computed(() => {
  if (step.value === 1) {
    return selectedFile.value && filePreview.value
  }
  if (step.value === 2) {
    return mappedFieldsCount.value > 0 && hasEmailMapping.value
  }
  return true
})

const mappedFieldsCount = computed(() => {
  return Object.values(fieldMapping.value).filter(v => v).length
})

const hasEmailMapping = computed(() => {
  return Object.values(fieldMapping.value).includes('email')
})

// Methods
function handleFileSelect() {
  if (selectedFile.value) {
    // Simulate file parsing
    setTimeout(() => {
      filePreview.value = {
        headers: ['email', 'first_name', 'last_name', 'phone', 'city'],
        rows: [
          ['jan@example.com', 'Jan', 'Kowalski', '123456789', 'Warszawa'],
          ['anna@example.com', 'Anna', 'Nowak', '987654321', 'Kraków'],
          ['piotr@example.com', 'Piotr', 'Wiśniewski', '555666777', 'Gdańsk']
        ],
        totalRows: 150
      }
      
      // Auto-map some common fields
      fieldMapping.value = {
        0: 'email',
        1: 'firstName',
        2: 'lastName',
        3: 'phone',
        4: 'city'
      }
    }, 1000)
  }
}

function getFieldExample(index) {
  return filePreview.value?.rows[0]?.[index] || ''
}

function getModeLabel(mode) {
  const labels = {
    add: 'Tylko nowe kontakty',
    update: 'Tylko aktualizacja',
    merge: 'Dodawanie i aktualizacja'
  }
  return labels[mode] || mode
}

function prevStep() {
  if (step.value > 1) {
    step.value--
  }
}

function nextStep() {
  if (canProceed.value && step.value < 3) {
    step.value++
  }
}

function startImport() {
  importing.value = true
  importProgress.value = 0
  importStatus.value = 'Przygotowywanie importu...'
  
  // Simulate import process
  const interval = setInterval(() => {
    importProgress.value += 10
    
    if (importProgress.value <= 30) {
      importStatus.value = 'Walidacja danych...'
    } else if (importProgress.value <= 70) {
      importStatus.value = 'Importowanie kontaktów...'
    } else if (importProgress.value <= 90) {
      importStatus.value = 'Finalizowanie...'
    }
    
    if (importProgress.value >= 100) {
      clearInterval(interval)
      importing.value = false
      importResult.value = {
        success: true,
        added: 125,
        updated: 15,
        skipped: 8,
        errors: 2
      }
    }
  }, 500)
}

function finishImport() {
  emit('imported', importResult.value)
  close()
}

function close() {
  // Reset state
  step.value = 1
  selectedFile.value = null
  filePreview.value = null
  fieldMapping.value = {}
  importing.value = false
  importProgress.value = 0
  importResult.value = null
  
  emit('update:modelValue', false)
}
</script>

<style scoped>
.import-dialog {
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

.import-stepper {
  box-shadow: none !important;
}

.step-content {
  padding: 32px;
}

.file-upload-area {
  margin: 24px 0;
}

.upload-hint {
  display: flex;
  gap: 12px;
  background: #f8f9ff;
  padding: 16px;
  border-radius: 8px;
  margin-top: 16px;
}

.upload-hint ul {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.file-preview {
  margin-top: 24px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.file-preview h4 {
  margin: 0;
  padding: 16px;
  background: #f5f5f5;
  font-weight: 600;
}

.preview-info {
  padding: 8px 16px;
  background: #f9f9f9;
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.mapping-section {
  margin: 24px 0;
}

.mapping-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 16px;
  align-items: center;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 12px;
  background: #fafafa;
}

.source-field {
  text-align: left;
}

.source-field strong {
  display: block;
  margin-bottom: 4px;
}

.field-example {
  font-size: 0.85rem;
  color: #666;
}

.mapping-arrow {
  color: #666;
}

.target-field {
  min-width: 200px;
}

.import-options {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

.import-options h4 {
  margin-bottom: 16px;
  font-weight: 600;
}

.import-summary {
  text-align: center;
  margin-bottom: 32px;
}

.summary-stats {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.import-progress {
  text-align: center;
}

.import-progress h3 {
  margin-bottom: 24px;
}

.import-progress p {
  margin-top: 16px;
  color: #666;
}

.import-result {
  text-align: center;
}

.result-header {
  margin-bottom: 32px;
}

.result-header h3 {
  margin-top: 16px;
}

.result-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.result-stat {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #333;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

.error-list {
  text-align: left;
  background: #fff3f3;
  border: 1px solid #ffcdd2;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.error-list h4 {
  margin-bottom: 12px;
  color: #d32f2f;
}

@media (max-width: 768px) {
  .mapping-row {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .summary-stats {
    flex-direction: column;
    gap: 12px;
  }
  
  .result-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>