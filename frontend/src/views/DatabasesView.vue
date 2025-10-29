<template>
  <div class="databases-container">
    <!-- Header Section -->
    <div class="databases-header">
      <h2 class="page-title">Bazy Danych</h2>
      <p class="page-subtitle">Zarządzaj bazami kontaktów dla kampanii marketingowych</p>
    </div>

    <v-container fluid class="databases-content">
      <v-row>
        <!-- Left Panel - Database List -->
        <v-col cols="12" md="4">
          <v-card class="database-list-card">
            <v-card-title class="card-header">
              <div class="header-content">
                <div class="header-info">
                  <h3>Bazy Danych</h3>
                  <span class="db-count">{{ databases.length }} baz</span>
                </div>
                <v-btn 
                  color="primary" 
                  class="add-btn"
                  @click="openCreateDialog"
                >
                  <v-icon left>mdi-plus</v-icon>
                  Nowa baza
                </v-btn>
              </div>
            </v-card-title>
            
            <v-card-text class="pa-0">
              <!-- Search -->
              <div class="search-section">
                <v-text-field
                  v-model="searchQuery"
                  placeholder="Wyszukaj bazę..."
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                />
              </div>

              <!-- Database List -->
              <div class="database-list">
                <div 
                  v-for="database in filteredDatabases"
                  :key="database.id"
                  class="database-item"
                  :class="{ 'selected': selectedDatabase?.id === database.id }"
                  @click="selectDatabase(database)"
                >
                  <div class="db-icon">
                    <v-icon size="24" color="primary">mdi-database</v-icon>
                  </div>
                  <div class="db-info">
                    <h4 class="db-name">{{ database.name }}</h4>
                    <div class="db-meta">
                      <span class="contact-count">
                        <v-icon size="16">mdi-account-group</v-icon>
                        {{ database.contactsCount }} kontaktów
                      </span>
                      <span class="db-date">{{ formatDate(database.createdAt) }}</span>
                    </div>
                    <div class="db-tags" v-if="database.tags?.length">
                      <v-chip
                        v-for="tag in database.tags.slice(0, 2)"
                        :key="tag"
                        size="small"
                        variant="outlined"
                        class="tag-chip"
                      >
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
                        <v-list-item @click="editDatabase(database)">
                          <v-list-item-title>
                            <v-icon left size="16">mdi-pencil</v-icon>
                            Edytuj
                          </v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="duplicateDatabase(database)">
                          <v-list-item-title>
                            <v-icon left size="16">mdi-content-copy</v-icon>
                            Duplikuj
                          </v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="exportDatabase(database)">
                          <v-list-item-title>
                            <v-icon left size="16">mdi-download</v-icon>
                            Eksportuj
                          </v-list-item-title>
                        </v-list-item>
                        <v-divider />
                        <v-list-item @click="deleteDatabase(database)" class="delete-item">
                          <v-list-item-title>
                            <v-icon left size="16">mdi-delete</v-icon>
                            Usuń
                          </v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Right Panel - Database Details -->
        <v-col cols="12" md="8">
          <div v-if="selectedDatabase" class="database-details">
            <!-- Database Stats Cards -->
            <div class="stats-grid">
              <v-card class="stat-card">
                <div class="stat-content">
                  <div class="stat-icon contacts">
                    <v-icon>mdi-account-group</v-icon>
                  </div>
                  <div class="stat-info">
                    <h3>{{ selectedDatabase.contactsCount }}</h3>
                    <p>Kontaktów</p>
                  </div>
                </div>
              </v-card>
              
              <v-card class="stat-card">
                <div class="stat-content">
                  <div class="stat-icon active">
                    <v-icon>mdi-check-circle</v-icon>
                  </div>
                  <div class="stat-info">
                    <h3>{{ selectedDatabase.activeCount || 0 }}</h3>
                    <p>Aktywnych</p>
                  </div>
                </div>
              </v-card>
              
              <v-card class="stat-card">
                <div class="stat-content">
                  <div class="stat-icon campaigns">
                    <v-icon>mdi-email-multiple</v-icon>
                  </div>
                  <div class="stat-info">
                    <h3>{{ selectedDatabase.campaignsUsed || 0 }}</h3>
                    <p>Kampanii</p>
                  </div>
                </div>
              </v-card>
              
              <v-card class="stat-card">
                <div class="stat-content">
                  <div class="stat-icon segments">
                    <v-icon>mdi-filter</v-icon>
                  </div>
                  <div class="stat-info">
                    <h3>{{ selectedDatabase.segments?.length || 0 }}</h3>
                    <p>Segmentów</p>
                  </div>
                </div>
              </v-card>
            </div>

            <!-- Tabs Section -->
            <v-card class="details-card">
              <v-tabs v-model="activeTab" bg-color="transparent">
                <v-tab value="contacts">
                  <v-icon left>mdi-account-group</v-icon>
                  Kontakty
                </v-tab>
                <v-tab value="history">
                  <v-icon left>mdi-history</v-icon>
                  Historia
                </v-tab>
              </v-tabs>

              <v-card-text>
                <v-window v-model="activeTab">
                  <!-- Contacts Tab -->
                  <v-window-item value="contacts">
                    <ContactsTable 
                      :database="selectedDatabase"
                      :contacts="selectedDatabase.contacts || []"
                      @edit-contact="editContact"
                      @delete-contact="deleteContact"
                    />
                  </v-window-item>

                  <!-- Segments Tab -->
                  <v-window-item value="segments">
                    <SegmentsManager 
                      :database="selectedDatabase"
                      :segments="selectedDatabase.segments || []"
                      @create-segment="createSegmentFromRules"
                      @edit-segment="editSegment"
                    />
                  </v-window-item>

                  <!-- Fields Tab -->
                  <v-window-item value="fields">
                    <FieldsManager 
                      :database="selectedDatabase"
                      :fields="selectedDatabase.customFields || []"
                      @add-field="addCustomField"
                      @edit-field="editCustomField"
                    />
                  </v-window-item>

                  <!-- History Tab -->
                  <v-window-item value="history">
                    <DatabaseHistory 
                      :database="selectedDatabase"
                      :history="selectedDatabase.history || []"
                    />
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
            <h3>Wybierz bazę danych</h3>
            <p>Wybierz bazę danych z listy po lewej stronie, aby zobaczyć szczegóły i zarządzać kontaktami.</p>
            <v-btn color="primary" @click="openCreateDialog">
              <v-icon left>mdi-plus</v-icon>
              Utwórz pierwszą bazę
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- Create/Edit Database Dialog -->
    <DatabaseDialog
      v-model="showDatabaseDialog"
      :database="editingDatabase"
      @save="saveDatabase"
      @close="closeDatabaseDialog"
    />


  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ContactsTable from '../components/database/ContactsTable.vue'
import SegmentsManager from '../components/database/SegmentsManager.vue'
import FieldsManager from '../components/database/FieldsManager.vue'
import DatabaseHistory from '../components/database/DatabaseHistory.vue'
import DatabaseDialog from '../components/database/DatabaseDialog.vue'


// Reactive data
const databases = ref([])
const selectedDatabase = ref(null)
const searchQuery = ref('')
const activeTab = ref('contacts')
const showDatabaseDialog = ref(false)

const editingDatabase = ref(null)

// Computed
const filteredDatabases = computed(() => {
  if (!searchQuery.value) return databases.value
  
  return databases.value.filter(db => 
    db.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    db.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Methods
function selectDatabase(database) {
  selectedDatabase.value = database
  activeTab.value = 'contacts'
}

function openCreateDialog() {
  editingDatabase.value = null
  showDatabaseDialog.value = true
}

function editDatabase(database) {
  editingDatabase.value = { ...database }
  showDatabaseDialog.value = true
}

function saveDatabase(databaseData) {
  if (editingDatabase.value) {
    // Update existing
    const index = databases.value.findIndex(db => db.id === editingDatabase.value.id)
    if (index !== -1) {
      databases.value[index] = { ...databases.value[index], ...databaseData }
      if (selectedDatabase.value?.id === editingDatabase.value.id) {
        selectedDatabase.value = databases.value[index]
      }
    }
  } else {
    // Create new
    const newDatabase = {
      id: Date.now(),
      ...databaseData,
      createdAt: new Date(),
      contactsCount: 0,
      activeCount: 0,
      campaignsUsed: 0,
      contacts: [],
      segments: [],
      customFields: [],
      history: []
    }
    databases.value.unshift(newDatabase)
    selectedDatabase.value = newDatabase
  }
  closeDatabaseDialog()
}

function closeDatabaseDialog() {
  showDatabaseDialog.value = false
  editingDatabase.value = null
}

function duplicateDatabase(database) {
  const duplicate = {
    ...database,
    id: Date.now(),
    name: `${database.name} (kopia)`,
    createdAt: new Date(),
    history: []
  }
  databases.value.unshift(duplicate)
}

function deleteDatabase(database) {
  if (confirm(`Czy na pewno chcesz usunąć bazę "${database.name}"?`)) {
    databases.value = databases.value.filter(db => db.id !== database.id)
    if (selectedDatabase.value?.id === database.id) {
      selectedDatabase.value = null
    }
  }
}

function exportDatabase(database) {
  // Export logic here
  console.log('Eksportowanie bazy:', database.name)
}






function formatDate(date) {
  return new Date(date).toLocaleDateString('pl-PL')
}

function editContact(contact) {
  console.log('Edytowanie kontaktu:', contact)
}

function deleteContact(contact) {
  console.log('Usuwanie kontaktu:', contact)
}

function createSegmentFromRules(rules) {
  console.log('Tworzenie segmentu:', rules)
}

function editSegment(segment) {
  console.log('Edytowanie segmentu:', segment)
}

function addCustomField(field) {
  console.log('Dodawanie pola:', field)
}

function editCustomField(field) {
  console.log('Edytowanie pola:', field)
}



// Sample data
onMounted(() => {
  databases.value = [
    {
      id: 1,
      name: 'Klienci Premium',
      description: 'Baza VIP klientów z wysoką wartością życiową',
      contactsCount: 1247,
      activeCount: 1180,
      campaignsUsed: 15,
      createdAt: new Date('2024-01-15'),
      tags: ['VIP', 'Premium', 'Aktywni'],
      segments: [
        { id: 1, name: 'Bardzo aktywni', count: 450 },
        { id: 2, name: 'Średnio aktywni', count: 730 },
        { id: 3, name: 'Nowi klienci', count: 67 }
      ]
    },
    {
      id: 2,
      name: 'Newsletter Subskrybenci',
      description: 'Wszyscy subskrybenci newslettera',
      contactsCount: 8432,
      activeCount: 7890,
      campaignsUsed: 42,
      createdAt: new Date('2023-11-20'),
      tags: ['Newsletter', 'Marketing'],
      segments: []
    },
    {
      id: 3,
      name: 'Potencjalni Klienci',
      description: 'Leady z kampanii reklamowych',
      contactsCount: 3156,
      activeCount: 2890,
      campaignsUsed: 8,
      createdAt: new Date('2024-02-10'),
      tags: ['Leads', 'Reklamy', 'Konwersja'],
      segments: []
    }
  ]
})
</script>

<style scoped>
.databases-container {
  width: 100vw;
  background: linear-gradient(135deg, #eadcf6 0%, #9395fa 100%);
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.databases-header {
  background: linear-gradient(135deg, #202950 0%, #515bad 100%);
  padding: 10px 0;
  text-align: center;
  color: #eadcf6;
  margin: 0;
  width: 100%;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 8px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.page-subtitle {
  font-size: 0.9rem;
  opacity: 0.9;
}

.databases-content {
  padding: 20px !important;
  margin: 0 !important;
  width: 100% !important;
}

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

.search-section {
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.database-list {
  flex: 1;
  overflow-y: auto;
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

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 10px;
}

.stat-card {
  border-radius: 12px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px) !important;
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 5px 5px 5px 10px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: white;
}

.stat-icon.contacts {
  background: linear-gradient(135deg, #202950 0%, #515bad 100%);
}

.stat-icon.active {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
}

.stat-icon.campaigns {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
}

.stat-icon.segments {
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
}

.stat-info h3 {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  color: #333;
}

.stat-info p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
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