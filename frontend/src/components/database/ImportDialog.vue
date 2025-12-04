<template>
  <GeneralDialog
    v-model="dialogVisible"
    max-width="700px"
    :title="t('import.title')"
    @close="close"
    persistent
  >
  <template #default>
    <div class="dialog-wrapper">
      <!-- Loading Overlay -->
      <v-overlay
        :model-value="uploading || importing"
        class="d-flex align-center justify-center"
        persistent
        scrim="rgba(0, 0, 0, 0.7)"
        :z-index="3000"
      >
        <div class="loading-content">
          <v-progress-circular
            indeterminate
            size="64"
            color="primary"
          ></v-progress-circular>
          <h3 class="loading-title">
            {{ uploading ? t('import.uploading') : t('import.importing') }}
          </h3>
          <p class="loading-subtitle">
            {{ uploading ? uploadStatus : importStatus }}
          </p>
          <v-progress-linear
            :model-value="uploading ? uploadProgress : importProgress"
            color="primary"
            height="8"
            rounded
            class="loading-progress"
          ></v-progress-linear>
        </div>
      </v-overlay>



        <!-- Custom Stepper Header -->
        <div class="custom-stepper-header">
          <div class="stepper-steps">
            <div class="stepper-step" :class="{ active: step === 1, completed: step > 1 }">
              <div class="step-number">
                <v-icon v-if="step > 1" color="success">mdi-check</v-icon>
                <span v-else>1</span>
              </div>
              <span class="step-title">{{ t('import.steps.parse') }}</span>
            </div>
            
           
            <v-divider class="step-divider" />

              <div class="stepper-step" :class="{ active: step === 2, completed: step > 2 }">
              <div class="step-number">
                <v-icon v-if="step > 2" color="success">mdi-check</v-icon>
                <span v-else>2</span>
              </div>
              <span class="step-title">{{ t('import.steps.upload') }}</span>
            </div>
            
            <v-divider class="step-divider" />
            
            <div class="stepper-step" :class="{ active: step === 3 }">
              <div class="step-number">3</div>
              <span class="step-title">{{ t('import.steps.import') }}</span>
            </div>
          </div>
        </div>

        <!-- Steps Content -->
        <v-window v-model="step" >
            <!-- Step 1: File Selection -->
            <v-window-item value="1">
              <div class="step-content">
                <h3>{{ t('import.selectFileTitle') }}</h3>
                <p>{{ t('import.supportedFormats') }}</p>

                <div class="file-upload-area">
                  <v-file-input
                    v-model="selectedFile"
                    accept=".csv,.xlsx,.xls"
                    :label="t('import.chooseFile')"
                    variant="outlined"
                    prepend-icon="mdi-paperclip"
                    show-size
                    @change="handleFileSelect"
                  />
                  
                  <div class="upload-hint">
                    <v-icon color="info">mdi-information</v-icon>
                    <div>
                      <p><strong>{{ t('import.fileRequirementsTitle') }}</strong></p>
                      <ul>
                        <li>{{ t('import.req.headers') }}</li>
                        <li>{{ t('import.req.email') }}</li>
                        <li>{{ t('import.req.maxSize') }}</li>
                        <li>{{ t('import.req.maxRows') }}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <!-- File Preview -->
                <div v-if="filePreview" class="file-preview">
                  <h4>{{ t('import.previewTitle') }}</h4>
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
                    {{ t('import.previewInfo', { shown: filePreview.totalRows < 5 ? filePreview.totalRows : 5, total: filePreview.totalRows }) }}
                  </p>
                </div>
              </div>
            </v-window-item>

            <!-- Step 3: Upload File -->
            <v-window-item value="2">
              <div class="step-content">
                <div v-if="!uploading && !uploadedFilePath" class="upload-summary">
                  <h3>{{ t('import.uploadSummaryTitle') }}</h3>
                  <p>{{ t('import.uploadSummaryText') }}</p>
                  
                  <div class="summary-stats">
                    <div class="stat-item">
                      <v-icon color="primary">mdi-file-document</v-icon>
                      <span>{{ getFileName() }}</span>
                    </div>
                    <div class="stat-item">
                      <v-icon color="success">mdi-check-circle</v-icon>
                      <span>{{ mappedFieldsCount }} {{ t('import.mappedFields') }}</span>
                    </div>
                    <div class="stat-item">
                      <v-icon color="info">mdi-database</v-icon>
                      <span>{{ filePreview?.totalRows || 0 }} {{ t('import.rows') }}</span>
                    </div>
                  </div>
                  
                  <div class="upload-actions" style="margin-top: 20px;">
                    <v-btn 
                      color="primary" 
                      @click="startUpload"
                      :disabled="uploading"
                    >
                      <v-icon left>mdi-cloud-upload</v-icon>
                      {{ t('import.startUpload') }}
                    </v-btn>
                  </div>
                </div>

                <div v-if="uploading" class="upload-progress">
                  <h3>{{ t('import.uploading') }}</h3>
                  <v-progress-linear
                    :model-value="uploadProgress"
                    color="primary"
                    height="20"
                    rounded
                  >
                    <template v-slot:default>
                      <strong>{{ uploadProgress }}%</strong>
                    </template>
                  </v-progress-linear>
                  <p>{{ uploadStatus }}</p>
                </div>

                <div v-if="uploadedFilePath" class="upload-success">
                  <div class="result-header">
                    <v-icon size="48" color="success">mdi-cloud-upload</v-icon>
                    <h3>{{ t('import.uploadSuccessTitle') }}</h3>
                  </div>
                  <p>{{ t('import.uploadSavedAs', { path: uploadedFilePath }) }}</p>
                  <p>{{ t('import.proceedToImport') }}</p>
                </div>
              </div>
            </v-window-item>

            <!-- Step 4: Import Process -->
            <v-window-item value="3">
              <div class="step-content">
                <div v-if="!importing && !importResult" class="import-summary">
                  <h3>{{ t('import.importTitle') }}</h3>
                  <p>{{ t('import.importIntro') }}</p>
                  
                  <div class="summary-stats">
                    <div class="stat-item">
                      <v-icon color="primary">mdi-file-document</v-icon>
                      <span>{{ getFileName() }}</span>
                    </div>
                    <div class="stat-item">
                      <v-icon color="success">mdi-check-circle</v-icon>
                      <span>{{ mappedFieldsCount }} pól zmapowanych</span>
                    </div>
                    <div class="stat-item">
                      <v-icon color="info">mdi-cog</v-icon>
                      <span>{{ t('import.modeLabel') }}: {{ getModeLabel(importMode) }}</span>
                    </div>
                  </div>
                </div>

                <div v-if="importing" class="import-progress">
                  <h3>{{ t('import.importing') }}</h3>
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
                  <div class="progress-details" v-if="filePreview">
                    <small>
                      Plik: {{ getFileName() }} 
                      ({{ filePreview.totalRows }} wierszy)
                    </small>
                  </div>
                </div>

                <div v-if="importResult" class="import-result">
                  <div class="result-header">
                    <v-icon size="48" :color="importResult.success ? 'success' : 'error'">
                      {{ importResult.success ? 'mdi-check-circle' : 'mdi-alert-circle' }}
                    </v-icon>
                    <h3>
                      {{ importResult.success ? t('import.importFinished') : t('import.importError') }}
                    </h3>
                  </div>

                  <div v-if="importResult.success" class="result-summary">
                    <div class="result-message">
                      <v-alert 
                        type="info" 
                        variant="tonal" 
                        class="mb-4"
                        :text="false"
                      >
                        <v-icon>mdi-information</v-icon>
                        {{ importResult.message }}
                      </v-alert>
                    </div>
                    
                    <div class="result-stats">
                      <div class="result-stat success">
                        <v-icon color="success" size="24">mdi-check-circle</v-icon>
                        <span class="stat-number">{{ importResult.added || 0 }}</span>
                        <span class="stat-label">{{ t('import.addedLabel') }}</span>
                      </div>
                      <div class="result-stat error" v-if="importResult.errors > 0">
                        <v-icon color="error" size="24">mdi-alert-circle</v-icon>
                        <span class="stat-number">{{ importResult.errors || 0 }}</span>
                        <span class="stat-label">{{ t('import.rejectedLabel') }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Szczegóły błędów tylko jeśli są błędy -->
                  <div v-if="importResult.errors > 0" class="error-details">
                    <v-expansion-panels>
                      <v-expansion-panel>
                        <v-expansion-panel-title>
                          <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
                          {{ t('import.errorDetailsTitle', { count: importResult.errors }) }}
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                          <div v-if="importResult.errorDetails?.length" class="error-list">
                            <v-list>
                              <v-list-item
                                v-for="(error, index) in importResult.errorDetails.slice(0, 20)"
                                :key="index"
                                class="error-item"
                              >
                                <template v-slot:prepend>
                                  <v-icon color="error" size="20">mdi-close-circle</v-icon>
                                </template>
                                <v-list-item-title class="error-title">
                                  <strong>{{ error.email }}</strong> - {{ error.message }}
                                </v-list-item-title>
                                <v-list-item-subtitle v-if="error.data" class="error-data">
                                  <div class="row-data">
                                    <span v-for="(value, key) in error.data" :key="key" class="data-field">
                                      <strong>{{ key }}:</strong> {{ value }}
                                    </span>
                                  </div>
                                </v-list-item-subtitle>
                              </v-list-item>
                            </v-list>
                            <p v-if="importResult.errorDetails.length > 20" class="error-more">
                              {{ t('import.moreErrors', { count: importResult.errorDetails.length - 20 }) }}
                            </p>
                          </div>
                          <div v-else class="error-general">
                            <p>{{ t('import.generalErrors', { count: importResult.errors }) }}</p>
                            <p class="error-hint">{{ t('import.errorHint') }}</p>
                          </div>
                        </v-expansion-panel-text>
                      </v-expansion-panel>
                    </v-expansion-panels>
                  </div>

                  <!-- Błędy ogólne gdy import się nie powiódł -->
                  <div v-else-if="!importResult.success" class="error-general">
                    <v-alert type="error" variant="tonal">
                      <v-icon>mdi-alert-circle</v-icon>
                      {{ importResult.message }}
                    </v-alert>
                  </div>
                </div>
              </div>
            </v-window-item>
        </v-window>
    </div>

    </template>

    <template #actions>
          <v-btn
            v-if="step == 1"
            color="primary"
            :disabled="!canProceed || importing || uploading"
            @click="nextStep"
          >
            {{ t('import.next') }}
            <v-icon right>mdi-arrow-right</v-icon>
          </v-btn>
          <v-btn
            v-else-if="step === 3 && !importing && !importResult"
            color="primary"
            @click="startImport"
          >
            <v-icon left>mdi-database-import</v-icon>
            {{ t('import.startImport') }}
          </v-btn>
          <v-btn
            v-else-if="importResult"
            :color="importResult.success && importResult.errors === 0 ? 'success' : 'primary'"
            @click="finishImport"
          >
            <v-icon left>{{ importResult.success && importResult.errors === 0 ? 'mdi-check' : 'mdi-close' }}</v-icon>
            {{ importResult.success && importResult.errors === 0 ? t('import.finish') : t('import.closeDialog') }}
          </v-btn>
    </template>
  </GeneralDialog>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import * as XLSX from 'xlsx'
import { Databases } from '../../services/databases'
import GeneralDialog from '../GeneralDialog.vue'

const props = defineProps({
  modelValue: Boolean,
  database: Object
})

const emit = defineEmits(['update:modelValue', 'imported'])

const { t, locale } = useI18n()

// Reactive data
const step = ref(1)
const selectedFile = ref(null)
const filePreview = ref(null)
const fieldMapping = ref({})
const importMode = ref('add')

// Upload state
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadStatus = ref('')
const uploadedFilePath = ref(null)

// Import state
const importing = ref(false)
const importProgress = ref(0)
const importStatus = ref('')
const importResult = ref(null)

const dialogVisible = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

const importOptions = ref({
  skipDuplicates: true,
  validateEmails: true,
  defaultStatus: 'active'
})

// Watch dla resetowania stanu przy otwarciu dialogu
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    // Reset wszystkich wartości do stanu początkowego
    resetDialogState()
  }
})

// Funkcja resetująca stan dialogu
function resetDialogState() {
  step.value = 1
  selectedFile.value = null
  filePreview.value = null
  fieldMapping.value = {}
  importMode.value = 'add'
  uploading.value = false
  uploadProgress.value = 0
  uploadStatus.value = ''
  uploadedFilePath.value = null
  importing.value = false
  importProgress.value = 0
  importStatus.value = ''
  importResult.value = null
  importOptions.value = {
    skipDuplicates: true,
    validateEmails: true,
    defaultStatus: 'active'
  }
}

// Database fields for mapping (localized titles)
const databaseFields = [
  { title: t('import.dbFields.email'), value: 'email' },
  { title: t('import.dbFields.firstName'), value: 'firstName' },
  { title: t('import.dbFields.lastName'), value: 'lastName' },
  { title: t('import.dbFields.phone'), value: 'phone' },
  { title: t('import.dbFields.city'), value: 'city' },
  { title: t('import.dbFields.type'), value: 'type' },
  { title: t('import.dbFields.unsubscribeDate'), value: 'unsubscribeDate' }
]

const statusOptions = [
  { title: t('import.statusOptions.active'), value: 'active' },
  { title: t('import.statusOptions.inactive'), value: 'inactive' },
  { title: t('import.statusOptions.blocked'), value: 'blocked' }
]

// Computed
const canProceed = computed(() => {
  if (step.value === 1) {
    return selectedFile.value && filePreview.value
  }
  if (step.value === 2) {
    return mappedFieldsCount.value > 0 && hasEmailMapping.value
  }
  if (step.value === 3) {
    return uploadedFilePath.value !== null
  }
  if (step.value === 4) {
    return uploadedFilePath.value !== null
  }
  return true
})

const mappedFieldsCount = computed(() => {
  return Object.values(fieldMapping.value).filter(v => v).length
})

const hasEmailMapping = computed(() => {
  return Object.values(fieldMapping.value).includes('email')
})

const parsedFileData = computed(() => {
  return filePreview.value || null
})

// Methods
async function handleFileSelect() {
  if (!selectedFile.value) {
    filePreview.value = null
    return
  }

  try {
    const file = selectedFile.value[0] || selectedFile.value
      console.log('Parsowanie pliku:', file.name)
    
    // Sprawdź rozmiar pliku (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert(t('import.fileTooLarge'))
      selectedFile.value = null
      return
    }
    
    let parsedData = null
    
    if (file.name.toLowerCase().endsWith('.csv')) {
      parsedData = await parseCSVFile(file)
    } else if (file.name.toLowerCase().match(/\.(xlsx|xls)$/)) {
      parsedData = await parseExcelFile(file)
    } else {
      alert(t('import.unsupportedFormat'))
      selectedFile.value = null
      return
    }
    
    if (!parsedData || !parsedData.headers || parsedData.headers.length === 0) {
      alert(t('import.fileReadError'))
      return
    }
    
    // Sprawdź czy jest kolumna email
    const hasEmailColumn = parsedData.headers.some(header => 
      header.toLowerCase().includes('email') || header.toLowerCase().includes('e-mail')
    )
    
    if (!hasEmailColumn) {
      const userConfirm = confirm(t('import.missingEmailColumnConfirm'))
      if (!userConfirm) {
        selectedFile.value = null
        return
      }
    }
    
    filePreview.value = parsedData
    
    // Auto-mapowanie popularnych pól
    autoMapFields(parsedData.headers)
    
    console.log('Plik sparsowany:', parsedData.headers.length, 'kolumn,', parsedData.totalRows, 'wierszy')
    
  } catch (error) {
    console.error('Błąd podczas parsowania pliku:', error)
    alert('Błąd podczas odczytu pliku: ' + error.message)
    selectedFile.value = null
  }
}

async function parseCSVFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target.result
        const lines = text.split('\n').filter(line => line.trim())
        
        if (lines.length === 0) {
          reject(new Error(t('import.csvEmpty')))
          return
        }
        
        // Parsowanie CSV (obsługa prostych przypadków)
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
        const rows = []
        
        for (let i = 1; i < Math.min(lines.length, 6); i++) { // Tylko pierwsze 5 wierszy do podglądu
          const row = lines[i].split(',').map(cell => cell.trim().replace(/"/g, ''))
          if (row.length === headers.length) {
            rows.push(row)
          }
        }
        
        resolve({
          headers,
          rows,
          totalRows: lines.length - 1 // Bez nagłówka
        })
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(new Error(t('import.fileReadError')))
    reader.readAsText(file)
  })
}

async function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        
        // Pobierz pierwszy arkusz
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        
        // Konwertuj do JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        
        if (jsonData.length === 0) {
          reject(new Error(t('import.excelEmpty')))
          return
        }
        
        const headers = jsonData[0].map(h => (h || '').toString().trim())
        const rows = jsonData.slice(1, 6).filter(row => row.some(cell => cell !== undefined && cell !== ''))
        
        resolve({
          headers,
          rows: rows.map(row => row.map(cell => (cell || '').toString())),
          totalRows: rows.length 
        })
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(new Error(t('import.excelReadError')))
    reader.readAsArrayBuffer(file)
  })
}

function autoMapFields(headers) {
  const mapping = {}
  
  headers.forEach((header, index) => {
    const lowerHeader = header.toLowerCase()
    
    // Mapowanie email
    if (lowerHeader.includes('email') || lowerHeader.includes('e-mail')) {
      mapping[index] = 'email'
    }
    // Mapowanie imienia
    else if (lowerHeader.includes('first') && lowerHeader.includes('name') || 
             lowerHeader.includes('imię') || lowerHeader === 'imie') {
      mapping[index] = 'firstName'
    }
    // Mapowanie nazwiska
    else if (lowerHeader.includes('last') && lowerHeader.includes('name') || 
             lowerHeader.includes('nazwisko') || lowerHeader.includes('surname')) {
      mapping[index] = 'lastName'
    }
    // Mapowanie telefonu
    else if (lowerHeader.includes('phone') || lowerHeader.includes('telefon') || 
             lowerHeader.includes('tel') || lowerHeader.includes('mobile')) {
      mapping[index] = 'phone'
    }
    // Mapowanie miasta
    else if (lowerHeader.includes('city') || lowerHeader.includes('miasto')) {
      mapping[index] = 'city'
    }
    // Mapowanie rodzaju
    else if (lowerHeader.includes('type') || lowerHeader.includes('rodzaj') || 
             lowerHeader.includes('typ')) {
      mapping[index] = 'type'
    }
    // Mapowanie daty wypisania
    else if (lowerHeader.includes('unsubscribe') || lowerHeader.includes('wypisanie') || 
             lowerHeader.includes('wypisał')) {
      mapping[index] = 'unsubscribeDate'
    }
  })
  
  fieldMapping.value = mapping
}

function getFieldExample(index) {
  return filePreview.value?.rows[0]?.[index] || ''
}

function getFileName() {
  if (!selectedFile.value) return t('import.unknownFile')
  const file = selectedFile.value[0] || selectedFile.value
  return file.name || t('import.unknownFile')
}

function getModeLabel(mode) {
  const labels = {
    add: t('import.modes.add'),
    update: t('import.modes.update'),
    merge: t('import.modes.merge')
  }
  return labels[mode] || mode
}

function prevStep() {
  if (step.value > 1) {
    step.value--
  }
}

function nextStep() {
  console.log('nextStep wywołane, step:', step.value, 'canProceed:', canProceed.value)
  
  if (canProceed.value && step.value < 3) {
    // Jeśli przechodzimy do kroku 2 i plik nie został jeszcze przesłany,
    // włącz natychmiast overlay zanim zaczniemy upload
    if (step.value === 1 && !uploadedFilePath.value) {
      uploading.value = true
    }
    step.value++
    console.log('Przeszedłem do kroku:', step.value)

    // Jeśli właśnie przeszliśmy do kroku 2, automatycznie uruchom upload
    if (step.value === 2 && !uploadedFilePath.value) {
      console.log('Uruchamiam automatyczny upload w kroku 2')
      startUpload()
    }
  } else {
    console.log('Nie można przejść dalej, canProceed:', canProceed.value, 'step:', step.value)
  }
}

async function startUpload() {
  console.log('startUpload wywołane, selectedFile:', selectedFile.value)
  
  if (!selectedFile.value) {
    alert(t('import.noFileSelected'))
    return
  }
  
  // Upewnij się, że overlay jest aktywny
  uploading.value = true
  uploadProgress.value = 0
  uploadStatus.value = 'Przygotowywanie pliku...'
  
  try {
    const file = selectedFile.value[0] || selectedFile.value
    
    uploadProgress.value = 20
    uploadStatus.value = 'Przesyłanie na serwer...'
    
    // Wywołaj metodę z serwisu Databases
    const result = await Databases.uploadFile(file)
    
    uploadProgress.value = 80
    uploadStatus.value = 'Przetwarzanie odpowiedzi...'
    
    if (result?.filePath) {
      uploadedFilePath.value = result.filePath
      uploadProgress.value = 100
      uploadStatus.value = 'Zakończono. Przechodzenie do importu...'
      
      console.log('Plik przesłany pomyślnie:', result.filePath)
      
      // Trzymaj overlay do momentu przejścia do kroku 3
      setTimeout(() => {
        step.value = 3
        uploading.value = false
      }, 800)
      
    } else {
      throw new Error(result?.message || t('import.noFilePath'))
    }
    
  } catch (error) {
    console.error('Błąd podczas przesyłania pliku:', error)
    uploading.value = false
    uploadProgress.value = 0
    alert(t('import.uploadError') + ': ' + error.message)
  }
}


async function startImport() {
  if (!props.database?.id) {
    alert(t('import.noDatabaseSelected'))
    return
  }

  if (!uploadedFilePath.value) {
    alert(t('import.fileNotUploaded'))
    return
  }

  if (!hasEmailMapping.value) {
    alert(t('import.emailMappingRequired'))
    return
  }
  
  importing.value = true
  importProgress.value = 0
  importStatus.value = 'Rozpoczynanie importu...'
  
  try {
    importProgress.value = 10
    importStatus.value = 'Przygotowywanie danych...'
    
    // Przygotuj payload z nazwą przesłanego pliku i mapowaniem
    const payload = {
      filename: uploadedFilePath.value,
      fieldMapping: fieldMapping.value,
      importMode: importMode.value,
      options: importOptions.value,
      deleteAfterImport: true
    }
    
    importProgress.value = 30
    importStatus.value = 'Importowanie danych...'
    
    // Wywołaj API z przesłanym plikiem
    const result = await Databases.importExcelToDatabase(props.database.id, payload)
    
    importProgress.value = 100
    importing.value = false
    
    console.log('Odpowiedź z serwera:', result)
    
    // Użyj danych z result.data.summary
    const summary = result.data?.summary
    const errors = result.data?.errors || []
    
    if (summary) {
      // Stwórz komunikat na podstawie danych z summary
      const successMessage = `Import zakończony. Pomyślnie zaimportowano ${summary.importedAddresses} adresów z ${summary.totalRows} wierszy.`
      const errorMessage = summary.errorCount > 0 ? ` ${summary.errorCount} rekordów zostało odrzuconych z powodu błędów.` : ''
      const fullMessage = successMessage + errorMessage
      
      importResult.value = {
        success: true,
        added: summary.importedAddresses || 0,
        updated: 0, // Backend nie zwraca tej informacji
        skipped: 0, // Backend nie zwraca tej informacji
        errors: summary.errorCount || 0,
        totalRows: summary.totalRows || 0,
        message: fullMessage,
        errorDetails: errors.map(err => ({
          row: err.row,
          email: err.email,
          message: err.error,
          data: err.row // Dodatkowe dane wiersza
        }))
      }
      console.log('Import zakończony pomyślnie:', importResult.value)
    } else {
      throw new Error('Brak danych w odpowiedzi serwera')
    }
    
  } catch (error) {
    console.error('Błąd podczas importu:', error)
    importing.value = false
    importResult.value = {
      success: false,
      message: error.message || 'Wystąpił błąd podczas importu',
      errors: [{ row: 0, message: error.message }]
    }
  }
}

function finishImport() {
  emit('imported', importResult.value)
  close()
}

function close() {
  resetDialogState()
  emit('update:modelValue', false)
}
</script>

<style scoped>
.dialog-wrapper {
  position: relative;
  min-height: 500px;
}

.import-dialog {
  border-radius: 16px !important;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15) !important;
  position: relative;
}

/* Loading Overlay Styles */
.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: white;
}

.loading-title {
  margin: 24px 0 8px 0;
  font-weight: 600;
  font-size: 1.4rem;
}

.loading-subtitle {
  margin: 0 0 24px 0;
  opacity: 0.9;
  font-size: 1rem;
}

.loading-progress {
  width: 300px;
  max-width: 80vw;
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

/* Custom Stepper Styles */
.custom-stepper-header {
  padding: 5px;
  border-bottom: 1px solid #e0e0e0;
  background: #fafafa;
}

.stepper-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.stepper-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
  text-align: center;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e0e0e0;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.3s ease;
}

.stepper-step.active .step-number {
  background: #1976d2;
  color: white;
}

.stepper-step.completed .step-number {
  background: #4caf50;
  color: white;
}

.step-title {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.stepper-step.active .step-title {
  color: #1976d2;
  font-weight: 600;
}

.stepper-step.completed .step-title {
  color: #4caf50;
}

.step-divider {
  flex: 1;
  margin: 0 16px;
}

.import-window {
  box-shadow: none !important;
}

.stepper-actions {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  background: #fafafa;
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

.progress-details {
  margin-top: 12px;
}

.progress-details small {
  color: #888;
  font-size: 0.85rem;
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

.result-summary {
  margin-bottom: 24px;
}

.result-message {
  margin-bottom: 20px;
}

.result-stats {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 24px;
}

.result-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  text-align: center;
  min-width: 140px;
}

.result-stat.success {
  background: #f1f8e9;
  border: 1px solid #c8e6c9;
}

.result-stat.error {
  background: #ffebee;
  border: 1px solid #ffcdd2;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.error-details {
  margin-top: 20px;
}

.error-list {
  text-align: left;
}

.error-item {
  border-bottom: 1px solid #f0f0f0;
  padding: 12px 0;
}

.error-item:last-child {
  border-bottom: none;
}

.error-title {
  font-size: 0.95rem;
  line-height: 1.3;
}

.error-data {
  margin-top: 8px;
}

.row-data {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.data-field {
  font-size: 0.85rem;
  color: #666;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
}

.data-field strong {
  color: #333;
}

.error-more {
  text-align: center;
  font-style: italic;
  color: #666;
  margin-top: 12px;
}

.error-general {
  margin-top: 20px;
}

.error-hint {
  color: #666;
  font-size: 0.9rem;
  margin-top: 8px;
}

@media (max-width: 768px) {
  .stepper-steps {
    flex-direction: column;
    gap: 12px;
  }
  
  .step-divider {
    display: none;
  }
  
  .stepper-step {
    flex-direction: row;
    gap: 12px;
  }
  
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
  
  .stepper-actions {
    flex-direction: column;
    gap: 12px;
  }
}
</style>