<template>
  <div class="campaign-bounces-container">
    <!-- Stats Cards -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis">{{ t('campaigns.allBounces') }}</div>
                <div class="text-h5 font-weight-bold">{{ stats.totalBounces }}</div>
              </div>
              <v-icon size="40" color="error">mdi-email-alert</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis">{{ t('campaigns.hardBounces') }}</div>
                <div class="text-h5 font-weight-bold">{{ stats.hardBounces }}</div>
              </div>
              <v-icon size="40" color="error">mdi-close-circle</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis">{{ t('campaigns.softBounces') }}</div>
                <div class="text-h5 font-weight-bold">{{ stats.softBounces }}</div>
              </div>
              <v-icon size="40" color="warning">mdi-alert-circle</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis">{{ t('campaigns.bounceRate') }}</div>
                <div class="text-h5 font-weight-bold">{{ bounceRate }}%</div>
              </div>
              <v-icon size="40" color="info">mdi-chart-line</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-tabs v-model="bounceViewTab" color="primary" class="mb-4">
      <v-tab value="events">{{ t('campaigns.bounce.eventsTab') }}</v-tab>
      <v-tab value="contacts">{{ t('campaigns.bounce.contactsTab') }}</v-tab>
    </v-tabs>

    <v-window v-model="bounceViewTab">
      <v-window-item value="events">
    <!-- Filters -->
    <v-card class="mb-4">
      <v-card-text>
        <div class="filters-section">
          <v-text-field
            v-model="searchQuery"
            :placeholder="t('campaigns.searchByEmail')"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="comfortable"
            hide-details
            clearable
            style="max-width: 400px;"
          />
          <v-select
            v-model="bounceTypeFilter"
            :items="bounceTypeOptions"
            variant="outlined"
            density="comfortable"
            hide-details
            style="max-width: 200px;"
          />
        </div>
      </v-card-text>
    </v-card>

    <!-- Bounces Table -->
    <v-data-table-server
      :headers="headers"
      :items="bounces"
      :items-length="totalBounces"
      :loading="loading"
      class="bounces-table"
      @update:options="onUpdateOptions"
    >
      <!-- Email Column -->
      <template v-slot:item.fromEmail="{ item }">
        <div class="email-cell">
          <div class="email">{{ item.mailAddress?.email || item.fromEmail }}</div>
        </div>
      </template>

      <!-- Bounce Type Column -->
      <template v-slot:item.bounceType="{ item }">
        <v-chip
          :color="item.bounceType === 'hard' ? 'error' : 'warning'"
          size="small"
          variant="flat"
        >
          {{ item.bounceType === 'hard' ? t('campaigns.hard') : t('campaigns.soft') }}
        </v-chip>
      </template>

      <!-- Bounce Date Column -->
      <template v-slot:item.receivedAt="{ item }">
        <div class="date-cell">
          {{ formatDateTime(item.receivedAt) }}
        </div>
      </template>

      <!-- Reason Column -->
      <template v-slot:item.bounceReason="{ item }">
        <div class="reason-cell">
          {{ item.bounceReason || '-' }}
        </div>
      </template>

      <!-- Contact Info Column -->
      <template v-slot:item.contact="{ item }">
        <div v-if="item.hasContact && item.mailAddress">
          <v-chip size="small" color="success" variant="tonal">
            <v-icon left size="16">mdi-account-check</v-icon>
            {{ item.mailAddress.miasto || t('campaigns.bounce.identifiedContact') }}
          </v-chip>
        </div>
        <div v-else>
          <v-chip size="small" color="default" variant="tonal">
            <v-icon left size="16">mdi-account-question</v-icon>
            {{ t('campaigns.bounce.unknownContact') }}
          </v-chip>
        </div>
      </template>

      <!-- Empty State -->
      <template v-slot:no-data>
        <div class="no-data">
          <v-icon size="48" color="grey-lighten-2">mdi-email-check</v-icon>
          <p>{{ t('campaigns.bounce.noData') }}</p>
        </div>
      </template>
    </v-data-table-server>

      </v-window-item>
      <v-window-item value="contacts">
    <div class="bounce-contacts-heading">
      <div>
        <h3>{{ t('campaigns.bounce.contactsTitle') }}</h3>
        <div class="text-caption text-medium-emphasis">
          {{ t('campaigns.bounce.contactsSummary', {
            total: bounceContactStats.total,
            active: bounceContactStats.active,
            inactive: bounceContactStats.inactive
          }) }}
        </div>
      </div>
      <div class="bounce-contact-actions">
        <v-btn
          size="small"
          variant="outlined"
          prepend-icon="mdi-account-off-outline"
          :loading="bounceContactActionLoading"
          :disabled="!selectedBounceContactIds.length"
          @click="updateSelectedBounceContacts('deactivate')"
        >
          {{ t('campaigns.bounce.deactivateSelected') }}
        </v-btn>
        <v-btn
          size="small"
          color="success"
          variant="outlined"
          prepend-icon="mdi-account-check-outline"
          :loading="bounceContactActionLoading"
          :disabled="!selectedBounceContactIds.length"
          @click="updateSelectedBounceContacts('restore')"
        >
          {{ t('campaigns.bounce.restoreSelected') }}
        </v-btn>
      </div>
    </div>

    <div class="contact-filters mt-4">
      <v-text-field
        v-model="bounceContactSearch"
        :placeholder="t('campaigns.bounce.searchContacts')"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="comfortable"
        hide-details
        clearable
        class="contact-search"
      />
      <v-select
        v-model="bounceContactStatus"
        :items="bounceContactStatusOptions"
        :label="t('campaigns.bounce.contactStatus')"
        variant="outlined"
        density="comfortable"
        hide-details
        class="contact-status-filter"
      />
    </div>

    <v-alert v-if="bounceContactActionMessage" :type="bounceContactActionError ? 'error' : 'success'" variant="tonal" class="my-3">
      {{ bounceContactActionMessage }}
    </v-alert>

    <v-data-table-server
      v-model="selectedBounceContactIds"
      :headers="bounceContactHeaders"
      :items="bounceContacts"
      :items-length="bounceContactTotal"
      :items-per-page="bounceContactOptions.itemsPerPage"
      :loading="loadingBounceContacts || bounceContactActionLoading"
      item-value="id"
      show-select
      class="bounce-contacts-table"
      @update:options="onUpdateBounceContactOptions"
    >
      <template v-slot:item.bounceCount="{ item }">
        <v-chip size="small" color="warning" variant="tonal">
          {{ item.bounceCount }}
        </v-chip>
      </template>
      <template v-slot:item.bounceDate="{ item }">
        {{ formatDateTime(item.bounceDate) }}
      </template>
      <template v-slot:item.status="{ item }">
        <v-chip
          size="small"
          :color="item.unsubscribed ? 'warning' : item.active ? 'success' : 'default'"
          variant="tonal"
        >
          {{ item.unsubscribed
            ? t('campaigns.bounce.contactUnsubscribed')
            : item.active
              ? t('campaigns.bounce.contactActive')
              : t('campaigns.bounce.contactInactive') }}
        </v-chip>
      </template>
      <template v-slot:item.deliveryStatus="{ item }">
        <v-chip v-if="item.deliveryStatus === 'undeliverable'" size="small" color="error" variant="tonal">
          {{ t('campaigns.bounce.contactUndeliverable') }}
        </v-chip>
        <span v-else>-</span>
      </template>
      <template v-slot:no-data>
        <div class="no-data">
          <v-icon size="40" color="grey-lighten-2">mdi-email-check</v-icon>
          <p>{{ t('campaigns.bounce.noBounceContacts') }}</p>
        </div>
      </template>
    </v-data-table-server>
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Campaigns } from '../../services/campaigns'

const { t } = useI18n()

const props = defineProps({
  campaign: {
    type: Object,
    required: true
  }
})

// Reactive data
const bounces = ref([])
const totalBounces = ref(0)
const loading = ref(false)
const stats = ref({
  totalBounces: 0,
  hardBounces: 0,
  softBounces: 0,
  bounceRate: 0
})
const bounceViewTab = ref('events')
const searchQuery = ref('')
const bounceTypeFilter = ref(null)
const options = ref({ page: 1, itemsPerPage: 50, sortBy: [{ key: 'receivedAt', order: 'desc' }] })
let searchDebounce = null
let fetchInProgress = false
const bounceContacts = ref([])
const bounceContactTotal = ref(0)
const bounceContactStats = ref({ total: 0, active: 0, inactive: 0 })
const selectedBounceContactIds = ref([])
const bounceContactSearch = ref('')
const bounceContactStatus = ref('all')
const bounceContactOptions = ref({ page: 1, itemsPerPage: 50, sortBy: [{ key: 'bounceCount', order: 'desc' }] })
const loadingBounceContacts = ref(false)
const bounceContactActionLoading = ref(false)
const bounceContactActionMessage = ref('')
const bounceContactActionError = ref(false)
let bounceContactSearchDebounce = null
let bounceContactFetchSequence = 0

// Table headers
const headers = computed(() => ([
  { title: t('campaigns.bounce.headers.email'), key: 'fromEmail', sortable: true },
  { title: t('campaigns.bounce.headers.type'), key: 'bounceType', sortable: true },
  { title: t('campaigns.bounce.headers.date'), key: 'receivedAt', sortable: true },
  { title: t('campaigns.bounce.headers.reason'), key: 'bounceReason', sortable: false },
  { title: t('campaigns.bounce.headers.contact'), key: 'contact', sortable: false }
]))

const bounceContactHeaders = computed(() => ([
  { title: t('campaigns.bounce.headers.email'), key: 'email', sortable: true },
  { title: t('campaigns.bounce.headers.bounceCount'), key: 'bounceCount', sortable: true },
  { title: t('campaigns.bounce.headers.date'), key: 'bounceDate', sortable: true },
  { title: t('campaigns.bounce.headers.contactStatus'), key: 'status', sortable: true },
  { title: t('campaigns.bounce.headers.deliveryStatus'), key: 'deliveryStatus', sortable: true }
]))

// Bounce type options
const bounceTypeOptions = computed(() => ([
  { title: t('campaigns.bounce.all'), value: null },
  { title: t('campaigns.bounce.hard'), value: 'hard' },
  { title: t('campaigns.bounce.soft'), value: 'soft' }
]))

const bounceContactStatusOptions = computed(() => ([
  { title: t('campaigns.bounce.allContacts'), value: 'all' },
  { title: t('campaigns.bounce.contactActive'), value: 'active' },
  { title: t('campaigns.bounce.contactInactive'), value: 'inactive' }
]))

// Computed
const bounceRate = computed(() => {
  if (!stats.value.bounceRate) return '0.0'
  return stats.value.bounceRate.toFixed(1)
})

// Methods
async function fetchBounces() {
  if (fetchInProgress || !props.campaign?.id) return
  fetchInProgress = true
  
  try {
    loading.value = true
    const params = {
      page: options.value.page,
      limit: options.value.itemsPerPage || 50,
      search: searchQuery.value || ''
    }
    
    // Sortowanie
    const firstSort = (options.value.sortBy && options.value.sortBy[0]) || null
    if (firstSort && firstSort.key) {
      params.sortBy = firstSort.key
      params.sortOrder = firstSort.order || 'desc'
    }
    
    // Filtr typu odbicia
    if (bounceTypeFilter.value !== null) {
      params.bounceType = bounceTypeFilter.value
    }
    
    const data = await Campaigns.getCampaignBounces(props.campaign.id, params)
    bounces.value = data.bounces || []
    totalBounces.value = data.total || 0
    
    // Aktualizuj statystyki jeśli są w odpowiedzi
    if (data.summary) {
      stats.value = {
        totalBounces: data.summary.totalBounces || 0,
        hardBounces: data.summary.hardBounces || 0,
        softBounces: data.summary.softBounces || 0,
        bounceRate: data.summary.bounceRate || 0
      }
    }
  } catch (e) {
    console.error('Błąd pobierania odbić:', e)
    bounces.value = []
    totalBounces.value = 0
  } finally {
    loading.value = false
    fetchInProgress = false
  }
}

async function fetchStats() {
  if (!props.campaign?.id) return
  
  try {
    const data = await Campaigns.getCampaignBouncesStats(props.campaign.id)
    stats.value = data
  } catch (e) {
    console.error('Błąd pobierania statystyk odbić:', e)
  }
}

async function fetchBounceContacts() {
  if (!props.campaign?.id) return
  const requestSequence = ++bounceContactFetchSequence
  loadingBounceContacts.value = true
  try {
    const data = await Campaigns.getCampaignBounceContacts(props.campaign.id, {
      page: bounceContactOptions.value.page,
      limit: bounceContactOptions.value.itemsPerPage,
      sortBy: bounceContactOptions.value.sortBy?.[0]?.key || 'bounceCount',
      sortOrder: bounceContactOptions.value.sortBy?.[0]?.order || 'desc',
      search: bounceContactSearch.value,
      status: bounceContactStatus.value
    })
    if (requestSequence !== bounceContactFetchSequence) return
    bounceContacts.value = data.contacts || []
    bounceContactTotal.value = data.pagination?.total || 0
    bounceContactStats.value = data.summary || { total: 0, active: 0, inactive: 0 }
  } catch (error) {
    if (requestSequence !== bounceContactFetchSequence) return
    console.error('Błąd pobierania kontaktów z odbiciami:', error)
    bounceContacts.value = []
    bounceContactTotal.value = 0
    bounceContactStats.value = { total: 0, active: 0, inactive: 0 }
  } finally {
    if (requestSequence === bounceContactFetchSequence) loadingBounceContacts.value = false
  }
}

async function updateSelectedBounceContacts(action) {
  const contactIds = [...new Set(selectedBounceContactIds.value.map(item =>
    typeof item === 'object' ? item.id : item
  ))]
  if (!contactIds.length || bounceContactActionLoading.value) return

  bounceContactActionLoading.value = true
  bounceContactActionMessage.value = ''
  try {
    const result = await Campaigns.updateCampaignBounceContacts(props.campaign.id, contactIds, action)
    bounceContactActionError.value = false
    bounceContactActionMessage.value = t('campaigns.bounce.contactsActionResult', {
      updated: result.updatedCount || 0,
      skipped: result.skippedUnsubscribedCount || 0
    })
    selectedBounceContactIds.value = []
    await Promise.all([fetchBounceContacts(), fetchBounces(), fetchStats()])
  } catch (error) {
    bounceContactActionError.value = true
    bounceContactActionMessage.value = error.response?.data?.response?.message || error.message || t('campaigns.bounce.contactsActionError')
  } finally {
    bounceContactActionLoading.value = false
  }
}

function onUpdateOptions(newOptions) {
  const changed = newOptions.page !== options.value.page ||
                  newOptions.itemsPerPage !== options.value.itemsPerPage ||
                  JSON.stringify(newOptions.sortBy) !== JSON.stringify(options.value.sortBy)
  
  options.value = { ...options.value, ...newOptions }
  
  if (changed) {
    fetchBounces()
  }
}

function onUpdateBounceContactOptions(newOptions) {
  const changed = newOptions.page !== bounceContactOptions.value.page ||
    newOptions.itemsPerPage !== bounceContactOptions.value.itemsPerPage ||
    JSON.stringify(newOptions.sortBy) !== JSON.stringify(bounceContactOptions.value.sortBy)
  bounceContactOptions.value = { ...bounceContactOptions.value, ...newOptions }
  if (changed) fetchBounceContacts()
}

function formatDateTime(date) {
  if (!date) return '-'
  return new Date(date).toLocaleString('pl-PL')
}

// Watchers
watch(() => props.campaign?.id, () => {
  bounceViewTab.value = 'events'
  options.value.page = 1
  bounceContactOptions.value.page = 1
  fetchBounces()
  fetchStats()
  fetchBounceContacts()
}, { immediate: true })

watch(bounceTypeFilter, () => {
  options.value.page = 1
  fetchBounces()
})

watch(searchQuery, () => {
  options.value.page = 1
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    fetchBounces()
  }, 300)
})

watch(bounceContactStatus, () => {
  bounceContactOptions.value.page = 1
  fetchBounceContacts()
})

watch(bounceContactSearch, () => {
  bounceContactOptions.value.page = 1
  if (bounceContactSearchDebounce) clearTimeout(bounceContactSearchDebounce)
  bounceContactSearchDebounce = setTimeout(fetchBounceContacts, 300)
})

onMounted(() => {
  fetchBounces()
  fetchStats()
})
</script>

<style scoped>
.campaign-bounces-container {
  width: 100%;
}

.stat-card {
  border-radius: 12px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
}

.filters-section {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.bounce-contacts-heading,
.bounce-contact-actions,
.contact-filters {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.contact-search {
  max-width: 400px;
}

.contact-status-filter {
  max-width: 220px;
}

.bounce-contacts-table {
  margin-top: 12px;
}

.bounces-table {
  border-radius: 12px !important;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important;
}

.email-cell .email {
  font-weight: 600;
  margin-bottom: 2px;
}

.date-cell {
  color: #666;
  font-size: 0.9rem;
}

.reason-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.no-data {
  text-align: center;
  padding: 40px;
}

.no-data p {
  margin: 16px 0;
  color: #666;
}

@media (max-width: 768px) {
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }

  .bounce-contacts-heading,
  .bounce-contact-actions,
  .contact-filters {
    align-items: stretch;
    flex-direction: column;
  }

  .contact-search,
  .contact-status-filter {
    max-width: 100%;
    width: 100%;
  }
  
  .filters-section > * {
    max-width: 100% !important;
  }
}
</style>
