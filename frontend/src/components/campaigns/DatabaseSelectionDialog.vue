<template>
  <GeneralDialog
    v-model="dialog"
    :title="t('campaigns.changeDatabase')"
    :width="'700px'"
    :persistent="true"
    >
    <template #default>
          <!-- Current Database Info -->
          <div v-if="campaign?.databaseInfo?.database" class="current-database">
            <div class="section-header">
              <v-icon color="info">mdi-information</v-icon>
              <h3>{{ t('campaigns.currentDatabase') }}</h3>
            </div>
            <v-card variant="outlined" class="current-db-card">
              <v-card-text class="pa-4">
                <div class="db-info">
                  <div class="db-name">
                    <v-icon left color="primary">mdi-database</v-icon>
                    <span>{{ getCurrentDatabaseName() }}</span>
                  </div>
                  <div class="db-stats">
                    <span class="stat-item">
                      <v-icon size="16">mdi-account-group</v-icon>
                      {{ campaign.recipientsCount || 0 }} {{ t('campaigns.recipients_') }}
                    </span>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>
                    <!-- Database Selection -->
          <div class="database-selection">
            <div class="section-header">
              <v-icon color="primary">mdi-database-search</v-icon>
              <h3>{{ t('campaigns.selectDatabase') }}</h3>
            </div>

            <!-- Search -->
            <v-text-field
              v-model="searchQuery"
              :placeholder="t('campaigns.searchDatabases')"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              hide-details
              class="search-field"
            />

            <!-- Loading State -->
            <div v-if="loading" class="loading-state">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
              <span>{{ t('campaigns.loadingDatabases') }}</span>
            </div>

            <!-- Database List -->
            <div v-else class="databases-list">
              <div 
                v-for="database in filteredDatabases" 
                :key="database.id"
                class="database-item"
                :class="{ 
                  'selected': selectedDatabase?.id === database.id,
                  'current': campaign?.databaseInfo?.database?.id === database.id || campaign?.databaseId === database.id
                }"
                @click="selectDatabase(database)"
              >
                <div class="database-radio">
                  <v-radio
                    :model-value="selectedDatabase?.id"
                    :value="database.id"
                    color="primary"
                    hide-details
                  />
                </div>
                <div class="database-details">
                  <div class="database-header">
                    <div class="database-name">
                      <v-icon size="20" color="primary">mdi-database</v-icon>
                      <span class="name">{{ database.name }}</span>
                      <v-chip 
                        v-if="campaign?.databaseInfo?.database?.id === database.id || campaign?.databaseId === database.id"
                        size="small" 
                        color="info" 
                        variant="outlined"
                      >
                        {{ t('campaigns.currentDatabase') }}
                      </v-chip>
                    </div>
                  </div>
                  <div v-if="database.description" class="database-description">
                    {{ database.description }}
                  </div>
                  <div class="database-meta">
                    <span class="created-date">
                      <v-icon size="14">mdi-calendar</v-icon>
                      {{ t('campaigns.createdAt') }}: {{ formatDate(database.createdAt) }}
                    </span>
                    <span class="updated-date">
                      <v-icon size="14">mdi-clock</v-icon>
                      {{ t('campaigns.updatedAt') }}: {{ formatDate(database.updatedAt) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div v-if="filteredDatabases.length === 0" class="empty-state">
                <v-icon size="48" color="grey-lighten-2">mdi-database-off</v-icon>
                <h4>{{ t('campaigns.noDatabasesAvailable') }}</h4>
                <p v-if="searchQuery">{{ t('campaigns.noDatabasesMatching', { query: searchQuery }) }}</p>
                <p v-else>{{ t('campaigns.noDatabasesAvailable') }}</p>
              </div>
            </div>
          </div>

          <!-- Selection Summary -->
          <div v-if="selectedDatabase" class="selection-summary">
            <v-divider class="mb-4"></v-divider>
            <div class="summary-content">
              <v-icon color="success">mdi-check-circle</v-icon>
              <div class="summary-text">
                <span class="summary-label">{{ t('campaigns.selectedDatabase') }}</span>
                <span class="summary-value">{{ selectedDatabase.name }}</span>
                <span class="summary-details">({{ formatNumber(selectedDatabase.contactsCount) }} {{ t('campaigns.recipients_') }})</span>
              </div>
            </div>
          </div>
    </template>
    <template #actions>
<v-btn variant="text" @click="close">
          {{ t('campaigns.cancel') }}
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn 
          color="primary" 
          variant="elevated"
          :disabled="!selectedDatabase || saving"
          @click="saveDatabaseChange"
          :loading="saving"
        >
          <v-icon left>mdi-content-save</v-icon>
          {{ saving ? t('campaigns.saving') : t('campaigns.saveChanges') }}
        </v-btn>
    </template>
  </GeneralDialog>

</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Databases } from '../../services/databases.js'
import { Campaigns } from '../../services/campaigns.js'
import GeneralDialog from '../GeneralDialog.vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const props = defineProps({
  modelValue: Boolean,
  campaign: Object
})

const emit = defineEmits(['update:modelValue', 'database-changed'])

// Reactive data
const dialog = ref(false)
const loading = ref(false)
const saving = ref(false)
const searchQuery = ref('')
const databases = ref([])
const selectedDatabase = ref(null)

// Computed
const filteredDatabases = computed(() => {
  if (!searchQuery.value) return databases.value
  
  const query = searchQuery.value.toLowerCase()
  return databases.value.filter(db => 
    db.name.toLowerCase().includes(query) ||
    db.description?.toLowerCase().includes(query)
  )
})

// Watch for dialog open/close
watch(() => props.modelValue, (newValue) => {
  dialog.value = newValue
  if (newValue) {
    loadDatabases().then(() => {
      // Set initial selected database
      if (props.campaign?.databaseInfo?.database?.id) {
        const currentDb = databases.value.find(db => db.id === props.campaign.databaseId)
        if (currentDb) selectedDatabase.value = currentDb
      } else if (props.campaign?.databaseId) {
        const currentDb = databases.value.find(db => db.id === props.campaign.databaseId)
        if (currentDb) selectedDatabase.value = currentDb
      }
    } )
    // // Initialize with current database
    // if (props.campaign?.databaseInfo?.database?.id) {
    //   const currentDb = databases.value.find(db => db.id === props.campaign.databaseId)
    //   if (currentDb) selectedDatabase.value = currentDb
    // } else if (props.campaign?.databaseId) {
    //   const currentDb = databases.value.find(db => db.id === props.campaign.databaseId)
    //   if (currentDb) selectedDatabase.value = currentDb
    // }
  }
})

watch(dialog, (newValue) => {
  emit('update:modelValue', newValue)
})

// Methods
async function loadDatabases() {
  loading.value = true
  try {
    databases.value = await Databases.getList()
  } catch (error) {
    console.error('Błąd ładowania baz danych:', error)
    // Fallback data for development
    databases.value = [
      {
        id: 1,
        name: 'Newsletter Subskrybenci',
        description: 'Główna lista subskrybentów newslettera',
        contactsCount: 15420,
        createdAt: '2024-01-15',
        updatedAt: '2025-01-28'
      },
      {
        id: 2,
        name: 'Klienci VIP',
        description: 'Premium klienci z historią zakupów powyżej 10 000 zł',
        contactsCount: 890,
        createdAt: '2024-03-10',
        updatedAt: '2025-01-25'
      },
      {
        id: 3,
        name: 'Nowi użytkownicy',
        description: 'Użytkownicy zarejestrowani w ciągu ostatnich 30 dni',
        contactsCount: 2340,
        createdAt: '2024-06-20',
        updatedAt: '2025-01-30'
      },
      {
        id: 4,
        name: 'Aktywni klienci E-commerce',
        description: 'Klienci którzy dokonali zakupu w ciągu ostatnich 6 miesięcy',
        contactsCount: 8750,
        createdAt: '2024-02-05',
        updatedAt: '2025-01-29'
      },
      {
        id: 5,
        name: 'Event Warszawa 2024',
        description: 'Lista uczestników konferencji w Warszawie',
        contactsCount: 450,
        createdAt: '2024-09-15',
        updatedAt: '2024-10-01'
      }
    ]
  } finally {
    loading.value = false
  }
}

function getCurrentDatabaseName() {
  if (props.campaign?.database?.name) {
    return props.campaign.database.name
  }
  if (props.campaign?.databaseId) {
    const db = databases.value.find(d => d.id === props.campaign.databaseId)
    return db?.name || `Baza ID: ${props.campaign.databaseId}`
  }
  return 'Nieznana baza'
}

function selectDatabase(database) {
  selectedDatabase.value = database
}

async function saveDatabaseChange() {
  if (!selectedDatabase.value || !props.campaign) return
  
  saving.value = true
  try {
    // Update campaign via API
    const updatedData = {
      databaseId: selectedDatabase.value.id,
      recipientsCount: selectedDatabase.value.contactsCount
    }
    
    await Campaigns.update(props.campaign.id, updatedData)
    
    // Emit change event with updated campaign data
    const updatedCampaign = {
      ...props.campaign,
      database: selectedDatabase.value,
      databaseId: selectedDatabase.value.id,
      recipientsCount: selectedDatabase.value.contactsCount
    }
    
    emit('database-changed', updatedCampaign)
    
    // Close dialog
    close()
    
  } catch (error) {
    console.error('Błąd aktualizacji bazy danych:', error)
    alert('Nie udało się zaktualizować bazy danych: ' + (error.response?.data?.message || error.message))
  } finally {
    saving.value = false
  }
}

function close() {
  dialog.value = false
  selectedDatabase.value = null
  searchQuery.value = ''
}

function formatNumber(num) {
  return new Intl.NumberFormat('pl-PL').format(num)
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('pl-PL')
}
</script>

<style scoped>
.database-dialog {
  border-radius: 16px !important;
}

.dialog-header {
  background: linear-gradient(135deg, #202950 0%, #515bad 100%) !important;
  color: white !important;
  border-radius: 16px 16px 0 0 !important;
  padding: 20px 24px !important;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-info {
  display: flex;
  align-items: center;
}

.header-info h2 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.dialog-content {
  padding: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

/* Current Database */
.current-database {
  margin-bottom: 32px;
}

.current-db-card {
  border: 2px solid rgba(33, 150, 243, 0.2);
  background: rgba(33, 150, 243, 0.02);
}

.db-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.db-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 1rem;
}

.db-stats {
  color: #666;
  font-size: 0.9rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Database Selection */
.database-selection {
  margin-bottom: 24px;
}

.search-field {
  margin-bottom: 16px;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 40px;
  color: #666;
}

.databases-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.database-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.database-item:last-child {
  border-bottom: none;
}

.database-item:hover {
  background: rgba(81, 91, 173, 0.05);
}

.database-item.selected {
  background: rgba(81, 91, 173, 0.08);
  border-left: 4px solid #515bad;
}

.database-item.current {
  background: rgba(33, 150, 243, 0.05);
}

.database-radio {
  flex-shrink: 0;
  margin-top: 2px;
}

.database-details {
  flex: 1;
  min-width: 0;
}

.database-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.database-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.database-name .name {
  font-weight: 500;
  font-size: 1rem;
}

.database-stats {
  color: #666;
  font-size: 0.9rem;
}

.contacts-count {
  display: flex;
  align-items: center;
  gap: 4px;
}

.database-description {
  margin-bottom: 8px;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
}

.database-meta {
  display: flex;
  gap: 16px;
  font-size: 0.8rem;
  color: #888;
}

.created-date,
.updated-date {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.empty-state h4 {
  margin: 16px 0 8px 0;
}

.empty-state p {
  margin: 0;
}

/* Selection Summary */
.selection-summary {
  background: rgba(76, 175, 80, 0.05);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.summary-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.summary-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.summary-label {
  font-size: 0.9rem;
  color: #666;
}

.summary-value {
  font-weight: 500;
  font-size: 1rem;
}

.summary-details {
  font-size: 0.85rem;
  color: #666;
}

/* Dialog Actions */
.dialog-actions {
  padding: 16px 24px;
  background: #fafafa;
  border-top: 1px solid #e0e0e0;
}

/* Responsive */
@media (max-width: 768px) {
  .dialog-content {
    padding: 16px;
  }
  
  .db-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .database-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .database-meta {
    flex-direction: column;
    gap: 8px;
  }
}
</style>