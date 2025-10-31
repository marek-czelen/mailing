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
        <v-btn variant="outlined" :loading="loadingImport" @click="importContacts">
            <v-icon left>mdi-upload</v-icon>
            Importuj
            </v-btn>
        <v-btn v-if="false" color="primary" @click="addContact">
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
      <!-- Email Column -->
      <template v-slot:item.email="{ item }">
        <div class="email-cell">
          <div class="email">{{ item.email }}</div>
          <div class="name">{{ item.firstName }} {{ item.lastName }}</div>
        </div>
      </template>

      <!-- Unsubscribe Date Column -->
      <template v-slot:item.unsubscribeDate="{ item }">
        <div class="unsubscribe-cell">
          <span v-if="item.unsubscribeDate" class="unsubscribe-date">
            {{ formatDate(item.unsubscribeDate) }}
          </span>
          <span v-else class="no-unsubscribe">-</span>
        </div>
      </template>

      <!-- Type Column -->
      <template v-slot:item.type="{ item }">
        <v-chip
          :color="getTypeColor(item.type)"
          size="small"
          variant="elevated"
        >
          {{ getTypeLabel(item.type) }}
        </v-chip>
      </template>

      <!-- City Column -->
      <template v-slot:item.city="{ item }">
        <span>{{ item.city || '-' }}</span>
      </template>

      <!-- Actions Column -->
      <template v-slot:item.actions="{ item }">
        <div class="action-buttons">

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
              <v-list-item @click="unsubscribeContact(item)" v-if="item.unsubscribeDate === null">
                <v-list-item-title>
                  <v-icon left size="16">mdi-email-remove</v-icon>
                  Wypisz z listy
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
      @contact-updated="handleContactUpdated"
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

const emit = defineEmits(['edit-contact', 'delete-contact', 'contact-updated'])

// Reactive data
const searchQuery = ref('')
const statusFilter = ref('')
const loading = ref(false)
const loadingImport = ref(false)
const loadingExport = ref(false)
const showContactDialog = ref(false)
const editingContact = ref(null)
const showImportDialog = ref(false)

// Table headers
const headers = [
  { title: 'Email', key: 'mailAddress', sortable: true },
  { title: 'Data wypisania', key: 'unsubscribesDate', sortable: true },
  { title: 'Rodzaj', key: 'rodzaj', sortable: true },
  { title: 'Miasto', key: 'miasto', sortable: true },
  { title: 'Aktywny', key: 'active', sortable: true },
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


function getTypeColor(type) {
  const colors = {
    individual: 'primary',
    business: 'success',
    vip: 'warning',
    partner: 'purple'
  }
  return colors[type] || 'grey'
}

function getTypeLabel(type) {
  const labels = {
    individual: 'Indywidualny',
    business: 'Biznesowy',
    vip: 'VIP',
    partner: 'Partner'
  }
  return labels[type] || 'Nieznany'
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

function unsubscribeContact(contact) {
  if (confirm(`Czy na pewno chcesz wypisać kontakt ${contact.email} z listy mailingowej?`)) {
    const updatedContact = {
      ...contact,
      unsubscribeDate: new Date().toISOString().split('T')[0],
      status: 'unsubscribed'
    }
    emit('edit-contact', updatedContact)
  }
}

function resubscribeContact(contact) {
  if (confirm(`Czy na pewno chcesz ponownie zapisać kontakt ${contact.email} na listę mailingową?`)) {
    const updatedContact = {
      ...contact,
      unsubscribeDate: null,
      status: 'active'
    }
    emit('edit-contact', updatedContact)
  }
}

function viewHistory(contact) {
  console.log('Historia kontaktu:', contact)
}

function deleteContact(contact) {
  if (confirm(`Czy na pewno chcesz usunąć kontakt ${contact.firstName} ${contact.lastName}?`)) {
    emit('delete-contact', contact)
  }
}

async function exportContacts() {
  loadingExport.value = true
  try {
    emit('export-contacts')
    // Simulate export time - w rzeczywistości emit powiadomił by o zakończeniu
    await new Promise(resolve => setTimeout(resolve, 2000))
  } finally {
    loadingExport.value = false
  }
}

function importContacts() {
  loadingImport.value = true
  showImportDialog.value = true
}

function handleImportComplete(result) {
  console.log('Import zakończony:', result)
  showImportDialog.value = false
  loadingImport.value = false
  emit('import-contacts', result)
}

function handleContactUpdated(updatedContact) {
  console.log('Kontakt zaktualizowany:', updatedContact)
  emit('contact-updated', updatedContact)
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

.email-cell .email {
  font-weight: 600;
  margin-bottom: 2px;
}

.email-cell .name {
  font-size: 0.85rem;
  color: #666;
}

.unsubscribe-cell .unsubscribe-date {
  color: #e53e3e;
  font-weight: 500;
}

.unsubscribe-cell .no-unsubscribe {
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