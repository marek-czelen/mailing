<template>
  <PageContent :title="$t('databases.pageTitle')" :subtitle="$t('databases.pageSubtitle')">
    <template #left-panel>
      <v-card class="database-list-card">
        <v-card-title class="card-header">
          <div class="header-content">
            <div class="header-info">
              <h3>{{ $t('databases.title') }}</h3>
              <span class="db-count">{{ databases.length }} {{ $t('databases.bases') }}</span>
            </div>
            <v-btn color="primary" class="add-btn" @click="openCreateDialog">
              <v-icon left>mdi-plus</v-icon>
              {{ $t('databases.newDatabase') }}
            </v-btn>
          </div>
        </v-card-title>

        <v-card-text class="pa-0 database-list-content">
          <!-- Search -->
          <div class="search-section">
            <v-text-field v-model="searchQuery" :placeholder="$t('databases.searchPlaceholder')" prepend-inner-icon="mdi-magnify"
              variant="outlined" density="comfortable" hide-details />
          </div>

          <!-- Database List -->
          <div class="database-list">
            <!-- Loading State -->
            <div v-if="loadingDatabases" class="loading-state">
              <v-progress-circular 
                indeterminate 
                color="primary"
                size="40"
              ></v-progress-circular>
              <p class="loading-text">{{ $t('databases.loadingDatabases') }}</p>
            </div>
            
            <!-- Database Items -->
            <div v-else v-for="database in filteredDatabases" :key="database.id" class="database-item"
              :class="{ 'selected': selectedDatabase?.id === database.id }" @click="selectDatabase(database)">
              <div class="db-icon">
                <v-icon size="24" color="primary">mdi-database</v-icon>
              </div>
              <div class="db-info">
                <h4 class="db-name">{{ database.name }}</h4>
                <div class="db-meta">
                  <span class="contact-count">
                    <v-icon size="16">mdi-account-group</v-icon>
                    {{ database.contactsCount }} {{ $t('databases.contactsLabel') }}
                  </span>
                  <span class="db-date">{{ formatDate(database.createdAt) }}</span>
                </div>
                <div class="db-tags" v-if="database.tags?.length">
                  <v-chip v-for="tag in database.tags.slice(0, 2)" :key="tag" size="small" variant="outlined"
                    class="tag-chip">
                    {{ tag }}
                  </v-chip>
                  <span v-if="database.tags.length > 2" class="more-tags">
                    +{{ database.tags.length - 2 }}
                  </span>
                </div>
              </div>
              <div class="db-actions">
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn icon size="small" variant="text" v-bind="props" @click.stop>
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item @click="editDatabase(database)">
                      <v-list-item-title>
                        <v-icon left size="16">mdi-pencil</v-icon>
                        {{ $t('databases.edit') }}
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="exportDatabase(database)">
                      <v-list-item-title>
                        <v-icon left size="16">mdi-download</v-icon>
                        {{ $t('databases.export') }}
                      </v-list-item-title>
                    </v-list-item>
                    <v-divider />
                    <v-list-item @click="deleteDatabase(database)" class="delete-item">
                      <v-list-item-title>
                        <v-icon left size="16">mdi-delete</v-icon>
                        {{ $t('databases.delete') }}
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </template>
    <template #right-panel>
      <div v-if="selectedDatabase" class="database-details">
        <!-- Database Stats Cards -->
          <StatGrid :statElements="[
            { icon: 'mdi-account-group', title: 'Kontaktów', value: selectedDatabase.contactsCount || 0, class: 'contacts' },
            { icon: 'mdi-check-circle', title: 'Aktywnych', value: selectedDatabase.contacts?.filter(contact => contact.active == 1).length || 0, class: 'active' },
            { icon: 'mdi-email-multiple', title: 'Wypisanych', value: selectedDatabase.contacts?.filter(contact => contact.unsubscribesDate).length || 0, class: 'campaigns' },
          ]" />


        <!-- Tabs Section -->
        <v-card class="details-card">
          <v-tabs v-model="activeTab" bg-color="transparent">
            <v-tab value="contacts">
              <v-icon left>mdi-account-group</v-icon>
              Kontakty
            </v-tab>
            <v-tab value="history" v-if="false">
              <v-icon left>mdi-history</v-icon>
              Historia
            </v-tab>
          </v-tabs>

          <v-card-text>
            <v-window v-model="activeTab">
              <!-- Contacts Tab -->
              <v-window-item value="contacts">
                <!-- Loading overlay for contacts -->
                <div v-if="loadingContacts" class="contacts-loading-overlay">
                  <v-progress-circular 
                    indeterminate 
                    color="primary"
                    size="40"
                  ></v-progress-circular>
                  <p class="loading-text">{{ $t('databases.loadingContacts') }}</p>
                </div>
                
                <ContactsTable v-else :database="selectedDatabase" :contacts="selectedDatabase.contacts || []"
                  @edit-contact="editContact" @delete-contact="deleteContact" 
                  @export-contacts="exportContacts" @import-contacts="handleImportContacts"
                  @contact-updated="handleContactUpdated" />
              </v-window-item>

              <!-- Segments Tab -->
              <v-window-item value="segments">
                <SegmentsManager :database="selectedDatabase" :segments="selectedDatabase.segments || []"
                  @create-segment="createSegmentFromRules" @edit-segment="editSegment" @delete-segment="deleteSegment" />
              </v-window-item>

              <!-- Fields Tab -->
              <v-window-item value="fields">
                <FieldsManager :database="selectedDatabase" :fields="selectedDatabase.customFields || []"
                  @add-field="addCustomField" @edit-field="editCustomField" @delete-field="deleteCustomField" />
              </v-window-item>

              <!-- History Tab -->
              <v-window-item value="history">
                <DatabaseHistory :database="selectedDatabase" :history="selectedDatabase.history || []" />
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">
          <v-icon size="80" color="grey-lighten-2">mdi-database-outline</v-icon>
        </div>
        <h3>{{ $t('databases.emptyTitle') }}</h3>
        <p>{{ $t('databases.emptyDescription') }}</p>
        <v-btn color="primary" @click="openCreateDialog">
          <v-icon left>mdi-plus</v-icon>
          {{ $t('databases.createFirst') }}
        </v-btn>
      </div>
    </template>
  </PageContent>

  <div class="databases-container">
    <!-- Create/Edit Database Dialog -->
    <DatabaseDialog v-model="showDatabaseDialog" :database="editingDatabase" @save="saveDatabase"
      @close="closeDatabaseDialog" />


  </div>

  <!-- Snackbar for notifications -->
  <v-snackbar
    v-model="snackbar.show"
    :color="snackbar.color"
    timeout="8000"
    multi-line
  >
    {{ snackbar.message }}
    <template v-slot:actions>
      <v-btn
        variant="text"
        @click="snackbar.show = false"
      >
        {{ $t('databases.snackbarClose') }}
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import ContactsTable from '../components/database/ContactsTable.vue'
import SegmentsManager from '../components/database/SegmentsManager.vue'
import FieldsManager from '../components/database/FieldsManager.vue'
import DatabaseHistory from '../components/database/DatabaseHistory.vue'
import DatabaseDialog from '../components/database/DatabaseDialog.vue'
import PageContent from '../components/PageContent.vue'
import StatGrid from '../components/StatGrid.vue'
import { Databases } from '../services/databases.js'


// Reactive data
const databases = ref([])
const selectedDatabase = ref(null)
const searchQuery = ref('')
const activeTab = ref('contacts')
const showDatabaseDialog = ref(false)
const loadingDatabases = ref(true)
const loadingContacts = ref(false)
const loadingOperation = ref(false)

const editingDatabase = ref(null)

// Snackbar for notifications
const snackbar = ref({
  show: false,
  message: '',
  color: 'info'
})

const { t } = useI18n()

// Computed
const filteredDatabases = computed(() => {
  if (!searchQuery.value) return databases.value

  return databases.value.filter(db =>
    db.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    db.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Snackbar helper
function showSnackbar(message, color = 'info') {
  snackbar.value = {
    show: true,
    message,
    color
  }
}

// Methods
async function selectDatabase(database) {
  selectedDatabase.value = database
  activeTab.value = 'contacts'
  
  // Załaduj kontakty dla wybranej bazy danych z loaderem
  await loadDatabaseContacts(database.id)
}

async function loadDatabaseContacts(databaseId) {
  loadingContacts.value = true
  try {
    console.log('Ładowanie kontaktów dla bazy:', databaseId)
    const contactsData = await Databases.getContacts(databaseId)
    
    if (selectedDatabase.value && selectedDatabase.value.id === databaseId) {
      selectedDatabase.value.contacts = contactsData.contacts || []
      console.log('Kontakty załadowane:', contactsData.contacts?.length || 0)
    }
  } catch (error) {
    console.error('Błąd podczas ładowania kontaktów:', error)
    if (selectedDatabase.value && selectedDatabase.value.id === databaseId) {
      selectedDatabase.value.contacts = []
    }
    showSnackbar(t('databases.loadError'), 'error')
  } finally {
    loadingContacts.value = false
  }
}

function openCreateDialog() {
  editingDatabase.value = null
  showDatabaseDialog.value = true
}

function editDatabase(database) {
  editingDatabase.value = { ...database }
  showDatabaseDialog.value = true
}

async function saveDatabase(databaseData) {
  loadingOperation.value = true
  try {
    console.log('Zapisywanie bazy danych:', databaseData)
    
    // Mapowanie pól z dialogu na pola backend
    const backendData = {
      name: databaseData.name,
      description: databaseData.description,
      tags: databaseData.tags,
      rodo_flag: databaseData.gdprCompliant !== false,
      export_enabled: databaseData.allowExport !== false
      // customer_id będzie automatycznie dodane w serwisie Databases
    }
    
    console.log('Dane do wysłania:', backendData)
    
    if (editingDatabase.value) {
      // Update existing database
      const updatedDatabase = await Databases.update(editingDatabase.value.id, backendData)
      
      const index = databases.value.findIndex(db => db.id === editingDatabase.value.id)
      if (index !== -1) {
        databases.value[index] = updatedDatabase
        if (selectedDatabase.value?.id === editingDatabase.value.id) {
          selectedDatabase.value = updatedDatabase
        }
      }
      console.log('Baza danych zaktualizowana:', updatedDatabase)
      
      showSnackbar(t('databases.updated'), 'success')
      closeDatabaseDialog()
    } else {
      // Create new database
      const newDatabase = await Databases.create(backendData)
      console.log('Odpowiedź z API create:', newDatabase)
      
      if (newDatabase) {
        databases.value.unshift(newDatabase)
        selectedDatabase.value = newDatabase
        console.log('Nowa baza danych dodana do listy:', newDatabase.name)
        
        showSnackbar(t('databases.created'), 'success')
        closeDatabaseDialog()
      }
    }
  } catch (error) {
    console.error('Błąd podczas zapisywania bazy danych:', error)
    console.error('Response error:', error.response?.data)
    showSnackbar(t('databases.saveFailed') + ': ' + (error.response?.data?.message || error.message), 'error')
  } finally {
    loadingOperation.value = false
  }
}

function closeDatabaseDialog() {
  showDatabaseDialog.value = false
  editingDatabase.value = null
}


async function deleteDatabase(database) {
  if (window.confirm(t('databases.deleteConfirm', { name: database.name }))) {
    loadingOperation.value = true
    try {
      await Databases.delete(database.id)
      databases.value = databases.value.filter(db => db.id !== database.id)
      if (selectedDatabase.value?.id === database.id) {
        selectedDatabase.value = null
      }
      console.log('Baza danych usunięta:', database.name)
      showSnackbar(t('databases.deleted'), 'success')
    } catch (error) {
      console.error('Błąd podczas usuwania bazy danych:', error)
      showSnackbar(t('databases.deleteFailed'), 'error')
    } finally {
      loadingOperation.value = false
    }
  }
}

async function exportDatabase(database) {
  loadingOperation.value = true
  let format = 'xlsx'  // Można rozszerzyć o wybór formatu w przyszłości
  try {
    console.log('Eksportowanie bazy:', database.name)
    const blob = await Databases.exportContacts(database.id, {
      format: format,
      fields: ['mailAddress', 'rodzaj', 'miasto', 'phone'],
      status: null
    })
    
    // Utwórz link do pobrania pliku
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${database.name}_contacts_${new Date().toISOString().split('T')[0]}.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    console.log('Baza danych wyeksportowana:', database.name)
    showSnackbar(t('databases.exported'), 'success')
  } catch (error) {
    console.error('Błąd podczas eksportowania bazy danych:', error)
    showSnackbar(t('databases.deleteFailed'), 'error')
  } finally {
    loadingOperation.value = false
  }
}






function formatDate(date) {
  return new Date(date).toLocaleDateString('pl-PL')
}

async function editContact(contact) {
  console.log('Edytowanie kontaktu:', contact)
  // Tutaj można otworzyć dialog edycji kontaktu
  // Implementacja zależy od struktury komponentu ContactDialog
}

async function deleteContact(contact) {
  if (confirm(`Czy na pewno chcesz usunąć kontakt ${contact.mailAddress}?`)) {
    try {
      if (selectedDatabase.value) {
        await Databases.deleteContact(selectedDatabase.value.id, contact.id)
        
        // Odśwież dane kontaktów dla aktualnie wybranej bazy
        await loadDatabaseContacts(selectedDatabase.value.id)
        
        console.log('Kontakt usunięty:', contact.email)
      }
    } catch (error) {
      console.error('Błąd podczas usuwania kontaktu:', error)
        alert(t('databases.deleteFailed'))
    }
  }
}

function createSegmentFromRules(rules) {
  console.log('Tworzenie segmentu:', rules)
}

function editSegment(segment) {
  console.log('Edytowanie segmentu:', segment)
}

async function deleteSegment(segment) {
  try {
    if (selectedDatabase.value) {
      await Databases.deleteSegment(selectedDatabase.value.id, segment.id)
      
      // Odśwież dane segmentów dla aktualnie wybranej bazy
      const segments = await Databases.getSegments(selectedDatabase.value.id)
      selectedDatabase.value.segments = segments || []
      
      console.log('Segment usunięty:', segment.name)
    }
  } catch (error) {
    console.error('Błąd podczas usuwania segmentu:', error)
    alert('Nie udało się usunąć segmentu.')
  }
}

async function addCustomField(field) {
  try {
    if (selectedDatabase.value) {
      await Databases.addCustomField(selectedDatabase.value.id, field)
      
      // Odśwież dane pól niestandardowych dla aktualnie wybranej bazy
      const customFields = await Databases.getCustomFields(selectedDatabase.value.id)
      selectedDatabase.value.customFields = customFields || []
      
      console.log('Pole dodane:', field.name)
    }
  } catch (error) {
    console.error('Błąd podczas dodawania pola:', error)
    alert('Nie udało się dodać pola.')
  }
}

async function editCustomField(field) {
  try {
    if (selectedDatabase.value) {
      await Databases.updateCustomField(selectedDatabase.value.id, field.id, field)
      
      // Odśwież dane pól niestandardowych dla aktualnie wybranej bazy
      const customFields = await Databases.getCustomFields(selectedDatabase.value.id)
      selectedDatabase.value.customFields = customFields || []
      
      console.log('Pole zaktualizowane:', field.name)
    }
  } catch (error) {
    console.error('Błąd podczas aktualizacji pola:', error)
    alert('Nie udało się zaktualizować pola.')
  }
}

async function deleteCustomField(field) {
  try {
    if (selectedDatabase.value) {
      await Databases.deleteCustomField(selectedDatabase.value.id, field.id)
      
      // Odśwież dane pól niestandardowych dla aktualnie wybranej bazy
      const customFields = await Databases.getCustomFields(selectedDatabase.value.id)
      selectedDatabase.value.customFields = customFields || []
      
      console.log('Pole usunięte:', field.name)
    }
  } catch (error) {
    console.error('Błąd podczas usuwania pola:', error)
    alert('Nie udało się usunąć pola.')
  }
}

async function exportContacts() {
  try {
    if (selectedDatabase.value) {
      const blob = await Databases.exportContacts(selectedDatabase.value.id, {
        format: 'csv',
        fields: ['email', 'firstName', 'lastName', 'status']
      })
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${selectedDatabase.value.name}_contacts.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      console.log('Kontakty wyeksportowane')
    }
  } catch (error) {
    console.error('Błąd podczas eksportu kontaktów:', error)
    alert('Nie udało się wyeksportować kontaktów.')
  }
}

async function handleImportContacts(result) {
  try {
    if (selectedDatabase.value) {
      console.log('Import zakończony:', result)
      
      if (result.success) {
        // Odśwież dane kontaktów po pomyślnym imporcie
        await loadDatabaseContacts(selectedDatabase.value.id)
        
        const imported = result.added || result.imported || 0
        const updated = result.updated || 0
        const errors = result.errors || 0
        const total = imported + updated
        
        // Przygotuj szczegółowy komunikat
        let message = `Import zakończony! `
        message += `Zaimportowano: ${imported}, `
        if (updated > 0) {
          message += `zaktualizowano: ${updated}, `
        }
        if (errors > 0) {
          message += `odrzucono: ${errors} rekordów. `
          
          if (result.errorDetails && result.errorDetails.length > 0) {
            message += `Przykłady błędów: `
            const maxErrors = Math.min(3, result.errorDetails.length)
            for (let i = 0; i < maxErrors; i++) {
              const error = result.errorDetails[i]
              message += `${error.email} (${error.message})`
              if (i < maxErrors - 1) message += ', '
            }
            if (result.errorDetails.length > 3) {
              message += ` i ${result.errorDetails.length - 3} więcej błędów`
            }
          }
        }
        
        // Wybierz kolor w zależności od wyników
        let color = 'success'
        if (total === 0 && errors > 0) {
          color = 'error'
          message += ' Wszystkie rekordy zostały odrzucone.'
        } else if (errors > 0) {
          color = 'warning'
        }
        
        showSnackbar(message, color)
      } else {
        showSnackbar('Import nie powiódł się: ' + (result.message || 'Nieznany błąd'), 'error')
      }
    }
  } catch (error) {
    console.error('Błąd podczas odświeżania danych po imporcie:', error)
    showSnackbar('Import się zakończył, ale nie udało się odświeżyć listy kontaktów.', 'warning')
  }
}

async function handleContactUpdated(updatedContact) {
  console.log('Kontakt zaktualizowany/dodany:', updatedContact)
  console.log('selectedDatabase.value:', selectedDatabase.value)
  console.log('selectedDatabase.value.contacts:', selectedDatabase.value?.contacts)
  
  if (selectedDatabase.value && selectedDatabase.value.contacts) {
    // Znajdź index kontaktu w liście
    const contactIndex = selectedDatabase.value.contacts.findIndex(
      contact => contact.id === updatedContact.id
    )
    
    console.log('contactIndex:', contactIndex)
    
    if (contactIndex !== -1) {
      // Aktualizuj istniejący kontakt w liście
      selectedDatabase.value.contacts[contactIndex] = {
        ...selectedDatabase.value.contacts[contactIndex],
        ...updatedContact
      }
      console.log('Kontakt zaktualizowany w liście:', selectedDatabase.value.contacts[contactIndex])
    } else {
      // Dodaj nowy kontakt do listy
      console.log('Dodawanie nowego kontaktu do listy...')
      selectedDatabase.value.contacts.unshift(updatedContact)
      console.log('Nowy kontakt dodany do listy. Długość listy:', selectedDatabase.value.contacts.length)
    }
    
    // Aktualizuj licznik kontaktów
    selectedDatabase.value.contactsCount = selectedDatabase.value.contacts.length
    
    // Force reactivity update
    await nextTick()
    console.log('Reaktywność zaktualizowana')
  } else {
    console.error('selectedDatabase lub contacts nie istnieje!')
  }
}

// Load data from API
async function loadDatabases() {
  loadingDatabases.value = true
  try {
    
    const data = await Databases.getList()
    console.log('Załadowane bazy danych:', data)
    databases.value = data || []
    if (databases.value.length > 0) {
      await selectDatabase(databases.value[0])
    }
  } catch (error) {
    console.error('Błąd podczas ładowania baz danych:', error)
    showSnackbar(t('databases.loadError'), 'error')
    // Fallback to sample data in case of error
    databases.value = []
  } finally {
    loadingDatabases.value = false
  }
}

async function loadDatabaseStats() {
  try {
    const stats = await Databases.getStats()
    console.log('Statystyki baz danych:', stats)
    return stats
  } catch (error) {
    console.error('Błąd podczas ładowania statystyk:', error)
    return {}
  }
}

onMounted(async () => {
  await loadDatabases()
  await loadDatabaseStats()
})
</script>

<style scoped>
/* Database List Card */
.database-list-card {
  border-radius: 16px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px) !important;
  height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
}

.card-header {
  background: linear-gradient(135deg, #202950 0%, #515bad 100%) !important;
  color: #eadcf6 !important;
  border-radius: 16px 16px 0 0 !important;
  padding: 20px 24px !important;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-info h3 {
  margin: 0;
  font-weight: 600;
}

.db-count {
  font-size: 0.9rem;
  opacity: 0.8;
}

.add-btn {
  background: rgba(234, 220, 246, 0.2) !important;
  color: #eadcf6 !important;
  border: 1px solid rgba(234, 220, 246, 0.3) !important;
}

.database-list-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-section {
  padding: 16px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.database-list {
  flex: 1;
  overflow-y: auto;
  min-height: 0; /* Important for flex scrolling */
  scrollbar-width: thin;
  scrollbar-color: rgba(81, 91, 173, 0.3) transparent;
}

.database-list::-webkit-scrollbar {
  width: 6px;
}

.database-list::-webkit-scrollbar-track {
  background: transparent;
}

.database-list::-webkit-scrollbar-thumb {
  background: rgba(81, 91, 173, 0.3);
  border-radius: 3px;
}

.database-list::-webkit-scrollbar-thumb:hover {
  background: rgba(81, 91, 173, 0.5);
}

.database-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.database-item:hover {
  background: rgba(81, 91, 173, 0.05);
}

.database-item.selected {
  background: linear-gradient(135deg, rgba(32, 41, 80, 0.1) 0%, rgba(81, 91, 173, 0.1) 100%);
  border-left: 4px solid #515bad;
}

.db-icon {
  margin-right: 12px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(81, 91, 173, 0.1) 0%, rgba(147, 149, 250, 0.1) 100%);
  border-radius: 8px;
}

.db-info {
  flex: 1;
  min-width: 0;
}

.db-name {
  font-weight: 600;
  margin: 0 0 4px 0;
  font-size: 1rem;
}

.db-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.contact-count {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: #666;
}

.db-date {
  font-size: 0.8rem;
  color: #999;
}

.db-tags {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tag-chip {
  font-size: 0.7rem !important;
  height: 20px !important;
}

.more-tags {
  font-size: 0.7rem;
  color: #666;
}


/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.action-buttons .v-btn {
  border-radius: 8px !important;
}

/* Details Card */
.details-card {
  border-radius: 16px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px) !important;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.empty-icon {
  margin-bottom: 24px;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 8px;
  color: #333;
}

.empty-state p {
  color: #666;
  margin-bottom: 24px;
}

/* Loading States */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.contacts-loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  min-height: 300px;
}

.loading-text {
  margin-top: 16px;
  color: #666;
  font-size: 0.95rem;
}

/* Delete item styling */
.delete-item {
  color: #e53e3e !important;
}

/* Responsive */
@media (max-width: 768px) {
  .databases-content {
    padding: 10px !important;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .action-buttons {
    justify-content: center;
  }
}
</style>