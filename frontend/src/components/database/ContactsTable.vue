<template>
  <div class="contacts-table-container">
    <!-- Table Controls -->
    <div class="table-controls">
      <div class="controls-left" style="width: 450px;">
        <v-text-field
          v-model="searchQuery"
          :placeholder="t('contacts.searchPlaceholder')"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          hide-details
          style="max-width: 300px;"
        />
        <v-select
          v-model="statusFilter"
          :items="statusOptions"
          :placeholder="t('contactsList.statusLabel')"
          variant="outlined"
          density="comfortable"
          hide-details
          style="max-width: 150px;"
        />
      </div>
      <div class="controls-right">
        <v-btn variant="outlined" :loading="loadingImport" @click="importContacts">
            <v-icon left>mdi-upload</v-icon>
          {{ t('contactsList.import') }}
            </v-btn>
        <v-btn  color="primary" @click="addContact">
          <v-icon left>mdi-plus</v-icon>
          {{ t('contacts.addContact') }}
        </v-btn>
      </div>
    </div>

    <!-- Data Table (server-side) -->
    <v-data-table-server
      :headers="headers"
      :items="items"
      :items-length="totalItems"
      :loading="loading"
      item-value="id"
      class="contacts-table"
      @update:options="onUpdateOptions"
    >
      <!-- Email Column -->
      <template v-slot:item.mailAddress="{ item }">
        <div class="email-cell">
          <div class="email">{{ item.mailAddress }}</div>
          <div class="name">{{ item.firstName }} {{ item.lastName }}</div>
        </div>
      </template>

      <!-- Unsubscribe Date Column -->
      <template v-slot:item.unsubscribesDate="{ item }">
        <div class="unsubscribe-cell">
          <span v-if="item.unsubscribesDate" class="unsubscribe-date">
            {{ formatDate(item.unsubscribesDate) }}
          </span>
          <span v-else class="no-unsubscribe">-</span>
        </div>
      </template>

      <!-- Type Column -->
      <template v-slot:item.rodzaj="{ item }">
        <v-chip
          :color="getTypeColor(item.rodzaj)"
          size="small"
          variant="elevated"
        >
          {{ getTypeLabel(item.rodzaj) }}
        </v-chip>
      </template>

      <!-- City Column -->
      <template v-slot:item.miasto="{ item }">
        <span>{{ item.miasto || '-' }}</span>
      </template>

      <!-- Tags Column -->
      <template v-slot:item.tags="{ item }">
        <div class="d-flex flex-wrap ga-1">
          <v-chip
            v-for="tag in item.tags || []"
            :key="tag"
            size="x-small"
            variant="tonal"
          >
            {{ tag }}
          </v-chip>
          <span v-if="!item.tags?.length">-</span>
        </div>
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
                  {{ t('contacts.unsubscribeButton') }}
                </v-list-item-title>
              </v-list-item>
              <v-list-item disabled @click="viewHistory(item)">
                <v-list-item-title>
                  <v-icon left size="16">mdi-history</v-icon>
                  {{ t('contacts.history') }}
                </v-list-item-title>
              </v-list-item>
              <v-divider />
              <v-list-item @click="deleteContact(item)" class="delete-item">
                <v-list-item-title>
                  <v-icon left size="16">mdi-delete</v-icon>
                  {{ t('contacts.delete') }}
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
          <p>{{ t('contacts.noDataTitle') }}</p>
          <v-btn color="primary" @click="addContact">
            {{ t('contacts.addFirst') }}
          </v-btn>
        </div>
      </template>
  </v-data-table-server>

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
      @update:modelValue="(value) => {console.log(value); loadingImport = value}"
    />
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Databases } from '../../services/databases'
import ContactDialog from './ContactDialog.vue'
import ImportDialog from './ImportDialog.vue'

const props = defineProps({
  database: Object,
  contacts: Array
})

const emit = defineEmits(['edit-contact', 'delete-contact', 'contact-updated'])

const { t, locale } = useI18n()

// Reactive data
const searchQuery = ref('')
const statusFilter = ref('')
const loading = ref(false)
const loadingImport = ref(false)
const loadingExport = ref(false)
const showContactDialog = ref(false)
const editingContact = ref(null)
const showImportDialog = ref(false)

// Server-side table state
const items = ref([])
const totalItems = ref(0)
const options = ref({ page: 1, itemsPerPage: 25, sortBy: [] })
let searchDebounce = null

// Table headers (localized)
const headers = [
  { title: t('contactsList.headers.email'), key: 'mailAddress', sortable: true },
  { title: t('contactsList.headers.unsubscribesDate'), key: 'unsubscribesDate', sortable: true },
  { title: t('contactsList.headers.type'), key: 'rodzaj', sortable: true },
  { title: t('contactsList.headers.city'), key: 'miasto', sortable: true },
  { title: t('contactsList.headers.tags'), key: 'tags', sortable: false },
  { title: t('contactsList.headers.active'), key: 'active', sortable: true },
  { title: t('contactsList.headers.actions'), key: 'actions', sortable: false, width: 120 }
]

// Status options (localized)
const statusOptions = [
  { title: t('contactsList.status.all'), value: '' },
  { title: t('contactsList.status.active'), value: 'active' },
  { title: t('contactsList.status.inactive'), value: 'inactive' },
  { title: t('contactsList.status.unsubscribed'), value: 'unsubscribed' }
]

// Server-side loaders
let fetchInProgress = false
async function fetchContacts() {
  if (fetchInProgress) return
  fetchInProgress = true
  if (!props.database?.id) {
    items.value = []
    totalItems.value = 0
    fetchInProgress = false
    return
  }
  try {
    loading.value = true
    const params = {
      page: options.value.page,
      limit: options.value.itemsPerPage || 25,
      search: searchQuery.value || '',
      status: statusFilter.value || ''
    }
    // Sortowanie (pierwsza reguła sortowania z tabeli)
    const firstSort = (options.value.sortBy && options.value.sortBy[0]) || null
    if (firstSort && firstSort.key) {
      params.sortBy = firstSort.key
      params.sortOrder = firstSort.order || 'asc'
    }
    const data = await Databases.getContacts(props.database.id, params)
    items.value = data.contacts || []
    totalItems.value = data.filteredTotal ?? data.total ?? 0
  } catch (e) {
    console.error('Błąd pobierania kontaktów:', e)
    items.value = []
    totalItems.value = 0
  } finally {
    loading.value = false
    fetchInProgress = false
  }
}

function onUpdateOptions(newOptions) {
  // Porównanie czy strona, rozmiar lub sortowanie faktycznie się zmieniły
  const changed = newOptions.page !== options.value.page ||
                  newOptions.itemsPerPage !== options.value.itemsPerPage ||
                  JSON.stringify(newOptions.sortBy) !== JSON.stringify(options.value.sortBy)
  
  options.value = { ...options.value, ...newOptions }
  
  if (changed) {
    fetchContacts()
  }
}

// Reakcje na zmiany filtrów i bazy
watch(() => props.database?.id, () => {
  options.value.page = 1
  fetchContacts()
})

watch(statusFilter, () => {
  options.value.page = 1
  fetchContacts()
})

watch(searchQuery, () => {
  options.value.page = 1
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    fetchContacts()
  }, 300)
})

onMounted(() => {
  fetchContacts()
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
    individual: t('contactsList.typeLabels.individual'),
    business: t('contactsList.typeLabels.business'),
    vip: t('contactsList.typeLabels.vip'),
    partner: t('contactsList.typeLabels.partner')
  }
  return labels[type] || t('contactsList.typeLabels.unknown')
}

function formatDate(date) {
  if (!date) return '-'
  const localeTag = locale.value === 'pl' ? 'pl-PL' : 'en-US'
  return new Date(date).toLocaleDateString(localeTag)
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
  if (confirm(t('contactsList.confirmUnsubscribe', { email: contact.email }))) {
    const updatedContact = {
      ...contact,
      unsubscribeDate: new Date().toISOString().split('T')[0],
      status: 'unsubscribed'
    }
    emit('edit-contact', updatedContact)
  }
}

function resubscribeContact(contact) {
  if (confirm(t('contactsList.confirmResubscribe', { email: contact.email }))) {
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
  console.log('Usuwanie kontaktu:', contact)
  emit('delete-contact', contact)
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
  // Odśwież bieżącą stronę po edycji/dodaniu
  fetchContacts()
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