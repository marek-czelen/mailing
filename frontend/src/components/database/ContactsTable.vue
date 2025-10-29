<template>
  <div class="contacts-table-container">
    <!-- Table Controls -->
    <div class="table-controls">
      <div class="controls-left">
        <v-text-field
          v-model="searchQuery"
          placeholder="Wyszukaj kontakty..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          hide-details
          style="max-width: 300px;"
        />
        <v-select
          v-model="statusFilter"
          :items="statusOptions"
          placeholder="Status"
          variant="outlined"
          density="comfortable"
          hide-details
          style="max-width: 150px;"
        />
      </div>
      <div class="controls-right">
        <v-btn variant="outlined" @click="importContacts">
            <v-icon left>mdi-upload</v-icon>
            Importuj
            </v-btn>
        <v-btn variant="outlined" @click="exportContacts">
          <v-icon left>mdi-download</v-icon>
          Eksportuj
        </v-btn>
        <v-btn color="primary" @click="addContact">
          <v-icon left>mdi-plus</v-icon>
          Dodaj kontakt
        </v-btn>
      </div>
    </div>

    <!-- Data Table -->
    <v-data-table
      :headers="headers"
      :items="filteredContacts"
      :search="searchQuery"
      :loading="loading"
      item-value="id"
      class="contacts-table"
      :items-per-page="25"
      :items-per-page-options="[10, 25, 50, 100]"
    >
      <!-- Avatar Column -->
      <template v-slot:item.avatar="{ item }">
        <v-avatar size="36" color="primary">
          <v-img v-if="item.avatar" :src="item.avatar" />
          <span v-else class="text-white">
            {{ getInitials(item.firstName, item.lastName) }}
          </span>
        </v-avatar>
      </template>

      <!-- Name Column -->
      <template v-slot:item.fullName="{ item }">
        <div class="name-cell">
          <div class="name">{{ item.firstName }} {{ item.lastName }}</div>
          <div class="email">{{ item.email }}</div>
        </div>
      </template>

      <!-- Status Column -->
      <template v-slot:item.status="{ item }">
        <v-chip
          :color="getStatusColor(item.status)"
          size="small"
          variant="elevated"
        >
          {{ getStatusLabel(item.status) }}
        </v-chip>
      </template>

      <!-- Tags Column -->
      <template v-slot:item.tags="{ item }">
        <div class="tags-cell">
          <v-chip
            v-for="tag in item.tags?.slice(0, 2)"
            :key="tag"
            size="small"
            variant="outlined"
            class="mr-1"
          >
            {{ tag }}
          </v-chip>
          <span v-if="item.tags?.length > 2" class="more-tags">
            +{{ item.tags.length - 2 }}
          </span>
        </div>
      </template>

      <!-- Last Activity Column -->
      <template v-slot:item.lastActivity="{ item }">
        <div class="activity-cell">
          <div class="date">{{ formatDate(item.lastActivity) }}</div>
          <div class="activity-type">{{ item.lastActivityType }}</div>
        </div>
      </template>

      <!-- Actions Column -->
      <template v-slot:item.actions="{ item }">
        <div class="action-buttons">
          <v-btn
            icon
            size="small"
            variant="text"
            @click="viewContact(item)"
          >
            <v-icon>mdi-eye</v-icon>
          </v-btn>
          <v-btn
            icon
            size="small"
            variant="text"
            @click="editContact(item)"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn
                icon
                size="small"
                variant="text"
                v-bind="props"
              >
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="duplicateContact(item)">
                <v-list-item-title>
                  <v-icon left size="16">mdi-content-copy</v-icon>
                  Duplikuj
                </v-list-item-title>
              </v-list-item>
              <v-list-item @click="addToSegment(item)">
                <v-list-item-title>
                  <v-icon left size="16">mdi-filter-plus</v-icon>
                  Dodaj do segmentu
                </v-list-item-title>
              </v-list-item>
              <v-list-item @click="viewHistory(item)">
                <v-list-item-title>
                  <v-icon left size="16">mdi-history</v-icon>
                  Historia
                </v-list-item-title>
              </v-list-item>
              <v-divider />
              <v-list-item @click="deleteContact(item)" class="delete-item">
                <v-list-item-title>
                  <v-icon left size="16">mdi-delete</v-icon>
                  Usuń
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </template>

      <!-- No Data -->
      <template v-slot:no-data>
        <div class="no-data">
          <v-icon size="48" color="grey-lighten-2">mdi-account-off</v-icon>
          <p>Brak kontaktów w bazie danych</p>
          <v-btn color="primary" @click="addContact">
            Dodaj pierwszy kontakt
          </v-btn>
        </div>
      </template>
    </v-data-table>

    <!-- Contact Dialog -->
    <ContactDialog
      v-model="showContactDialog"
      :contact="editingContact"
      :database="database"
      @save="saveContact"
      @close="closeContactDialog"
    />

        <!-- Import Dialog -->
    <ImportDialog
      v-model="showImportDialog"
      :database="props.database"
      @imported="handleImportComplete"
    />
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'
import ContactDialog from './ContactDialog.vue'
import ImportDialog from './ImportDialog.vue'

const props = defineProps({
  database: Object,
  contacts: Array
})

const emit = defineEmits(['edit-contact', 'delete-contact'])

// Reactive data
const searchQuery = ref('')
const statusFilter = ref('')
const loading = ref(false)
const showContactDialog = ref(false)
const editingContact = ref(null)
const showImportDialog = ref(false)

// Table headers
const headers = [
  { title: '', key: 'avatar', sortable: false, width: 60 },
  { title: 'Imię i nazwisko', key: 'fullName', sortable: true },
  { title: 'Telefon', key: 'phone', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Tagi', key: 'tags', sortable: false },
  { title: 'Ostatnia aktywność', key: 'lastActivity', sortable: true },
  { title: 'Akcje', key: 'actions', sortable: false, width: 120 }
]

// Status options
const statusOptions = [
  { title: 'Wszystkie', value: '' },
  { title: 'Aktywny', value: 'active' },
  { title: 'Nieaktywny', value: 'inactive' },
  { title: 'Zablokowany', value: 'blocked' },
  { title: 'Wypisany', value: 'unsubscribed' }
]

// Computed
const filteredContacts = computed(() => {
  let contacts = props.contacts || []
  
  if (statusFilter.value) {
    contacts = contacts.filter(contact => contact.status === statusFilter.value)
  }
  
  return contacts
})

// Methods
function getInitials(firstName, lastName) {
  const first = firstName ? firstName.charAt(0).toUpperCase() : ''
  const last = lastName ? lastName.charAt(0).toUpperCase() : ''
  return first + last
}

function getStatusColor(status) {
  const colors = {
    active: 'success',
    inactive: 'warning',
    blocked: 'error',
    unsubscribed: 'grey'
  }
  return colors[status] || 'grey'
}

function getStatusLabel(status) {
  const labels = {
    active: 'Aktywny',
    inactive: 'Nieaktywny',
    blocked: 'Zablokowany',
    unsubscribed: 'Wypisany'
  }
  return labels[status] || 'Nieznany'
}

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pl-PL')
}

function viewContact(contact) {
  console.log('Podgląd kontaktu:', contact)
}

function editContact(contact) {
  editingContact.value = { ...contact }
  showContactDialog.value = true
}

function addContact() {
  editingContact.value = null
  showContactDialog.value = true
}

function saveContact(contactData) {
  if (editingContact.value) {
    emit('edit-contact', { ...editingContact.value, ...contactData })
  } else {
    emit('edit-contact', contactData)
  }
  closeContactDialog()
}

function closeContactDialog() {
  showContactDialog.value = false
  editingContact.value = null
}

function duplicateContact(contact) {
  const duplicate = {
    ...contact,
    id: Date.now(),
    email: `copy_${contact.email}`,
    firstName: `${contact.firstName} (kopia)`
  }
  emit('edit-contact', duplicate)
}

function addToSegment(contact) {
  console.log('Dodawanie do segmentu:', contact)
}

function viewHistory(contact) {
  console.log('Historia kontaktu:', contact)
}

function deleteContact(contact) {
  if (confirm(`Czy na pewno chcesz usunąć kontakt ${contact.firstName} ${contact.lastName}?`)) {
    emit('delete-contact', contact)
  }
}

function exportContacts() {
  console.log('Eksportowanie kontaktów')
}

function importContacts() {
  showImportDialog.value = true
}

function handleImportComplete(result) {
  console.log('Import zakończony:', result)
  showImportDialog.value = false
  // Refresh database data
}
</script>

<style scoped>
.contacts-table-container {
  width: 100%;
}

.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 16px;
}

.controls-left,
.controls-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.contacts-table {
  border-radius: 12px !important;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important;
}

.name-cell .name {
  font-weight: 600;
  margin-bottom: 2px;
}

.name-cell .email {
  font-size: 0.85rem;
  color: #666;
}

.tags-cell {
  display: flex;
  align-items: center;
  gap: 4px;
}

.more-tags {
  font-size: 0.8rem;
  color: #666;
}

.activity-cell .date {
  font-weight: 500;
  margin-bottom: 2px;
}

.activity-cell .activity-type {
  font-size: 0.85rem;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 2px;
}

.no-data {
  text-align: center;
  padding: 40px;
}

.no-data p {
  margin: 16px 0;
  color: #666;
}

.delete-item {
  color: #e53e3e !important;
}

@media (max-width: 768px) {
  .table-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .controls-left,
  .controls-right {
    justify-content: center;
  }
}
</style>